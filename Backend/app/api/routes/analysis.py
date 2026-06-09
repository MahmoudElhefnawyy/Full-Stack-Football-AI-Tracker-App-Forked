from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.persistence import AnalysisTask, TaskStatus
from app.models.responses import ApiResponse
from app.celery_app import celery_app
from app.api.deps import get_current_user_id

router = APIRouter()


@router.post("/upload", response_model=ApiResponse[dict], status_code=201)
async def upload_video(
    file: UploadFile = File(...),
    home_team: str = Form(default="Team A"),
    away_team: str = Form(default="Team B"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> ApiResponse:
    """
    Upload a video file and trigger AI analysis.
    Optional home_team / away_team names are forwarded to the analysis worker.
    """
    if not file.filename.lower().endswith((".mp4", ".avi", ".mov")):
        raise HTTPException(status_code=400, detail="Only video files (mp4, avi, mov) are accepted.")

    # 1. Create a unique task ID
    task_id = str(uuid.uuid4())
    filename = f"{task_id}_{file.filename}"

    # 2. Save file to persistent volume
    media_dir = Path(settings.media_root)
    media_dir.mkdir(parents=True, exist_ok=True)
    input_path = media_dir / "inputs" / filename
    input_path.parent.mkdir(parents=True, exist_ok=True)

    with input_path.open("wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # 3. Create database entry
    task = AnalysisTask(
        id=task_id,
        filename=file.filename,
        user_id=user_id or None,
        status=TaskStatus.PENDING,
        input_path=str(input_path),
    )
    db.add(task)
    db.commit()

    # 4. Trigger Celery Task with team names and user_id
    celery_app.send_task(
        "agent.analyze_video",
        args=[task_id, str(input_path)],
        kwargs={
            "home_team_name": home_team,
            "away_team_name": away_team,
            "user_id": user_id,
        },
        task_id=task_id,
    )

    return ApiResponse.ok(
        {"task_id": task_id, "status": TaskStatus.PENDING},
        message="Video uploaded. Analysis started.",
    )



@router.get("/tasks/{task_id}", response_model=ApiResponse[dict])
async def get_task_status(task_id: str, db: Session = Depends(get_db)) -> ApiResponse:
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return ApiResponse.ok({
        "id": task.id,
        "filename": task.filename,
        "status": task.status,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "result_data": task.result_data,
        "error_message": task.error_message,
        "output_url": f"/api/v1/analysis/results/{task.id}.mp4" if task.status == TaskStatus.SUCCESS else None
    })
