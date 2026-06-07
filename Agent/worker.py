import os
import sys
from pathlib import Path

# Add Backend and football_analysis to sys.path so we can import them
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Backend')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'football_analysis')))

from celery import Celery
from football_analysis.main import run_analysis

# ── Celery / infrastructure config ───────────────────────────────────────────
REDIS_URL = (
    os.environ.get("CELERY_BROKER_URL")
    or os.environ.get("REDIS_URL")
    or "redis://localhost:6379/0"
)
DATABASE_URL = os.environ.get("DATABASE_URL")

# Public URL of the Backend API service.
# The Agent uses this to download uploaded videos, because Backend and Agent
# run in separate containers with separate Railway volumes:
#   Backend volume → /backend/app/data/media  (backend-api-volume)
#   Agent volume   → /app/data/media          (ai-agent-volume)
# The Backend exposes its media directory via StaticFiles at:
#   GET {BACKEND_API_URL}/api/v1/analysis/results/inputs/{filename}
BACKEND_API_URL = os.environ.get(
    "BACKEND_API_URL", "https://goalsense-api.up.railway.app"
).rstrip("/")

# Local directory inside the Agent container where videos are stored
AGENT_INPUT_DIR = "/app/data/media/inputs"
AGENT_OUTPUT_DIR = "/app/data/media/outputs"

worker_app = Celery(
    "football_analytics",
    broker=REDIS_URL,
    backend=REDIS_URL,
)


def _download_video(filename: str) -> str:
    """
    Download an uploaded video from the Backend API's StaticFiles endpoint
    to the Agent's own volume.

    The Backend saves uploads to /backend/app/data/media/inputs/ (its volume).
    The Agent cannot access that path — different container, different volume.
    Instead, we fetch the file over HTTP from the Backend's public URL.

    Args:
        filename: The basename of the video file (e.g. "{task_id}_match.mp4").

    Returns:
        Absolute path of the locally saved file on the Agent's volume.
    """
    import requests

    url = f"{BACKEND_API_URL}/api/v1/analysis/results/inputs/{filename}"
    local_path = os.path.join(AGENT_INPUT_DIR, filename)
    os.makedirs(AGENT_INPUT_DIR, exist_ok=True)

    print(f"[Worker] Downloading video from {url} ...")
    with requests.get(url, stream=True, timeout=300) as response:
        response.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=65536):  # 64 KB chunks
                f.write(chunk)

    size_mb = os.path.getsize(local_path) / (1024 * 1024)
    print(f"[Worker] Download complete — {size_mb:.1f} MB saved to {local_path}")
    return local_path


@worker_app.task(name="agent.analyze_video")
def analyze_video_task(task_id: str, input_path: str,
                        home_team_name: str = "Team A",
                        away_team_name: str = "Team B"):
    """
    Celery task: download the uploaded video, run YOLO analysis, export results.

    Args:
        task_id:        UUID assigned by the Backend on upload.
        input_path:     Absolute path on the BACKEND container (used only to
                        derive the filename; not directly accessible here).
        home_team_name: Team name for team 1 (from Upload form).
        away_team_name: Team name for team 2 (from Upload form).
    """
    print(f"[Worker] Starting task {task_id} | {home_team_name} vs {away_team_name}")
    print(f"[Worker] Backend input_path (for filename reference): {input_path}")

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models.persistence import AnalysisTask, TaskStatus

    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    task = None

    try:
        # 1. Mark task as PROCESSING
        task = session.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.status = TaskStatus.PROCESSING
            session.commit()

        # 2. Download video from Backend HTTP API to Agent's local volume.
        #    The Backend and Agent run in separate containers with separate volumes,
        #    so the path in `input_path` does not exist in this container.
        filename = os.path.basename(input_path)
        local_input_path = _download_video(filename)

        # 3. Derive output path on Agent's own volume
        os.makedirs(AGENT_OUTPUT_DIR, exist_ok=True)
        local_output_path = os.path.join(AGENT_OUTPUT_DIR, filename)

        # 4. Run the full AI analysis pipeline
        tracks, team_ball_control, enrichment = run_analysis(
            local_input_path,
            local_output_path,
            team_names=[home_team_name, away_team_name],
        )

        # 5. Export to Backend-compatible MatchData JSON
        from football_analysis.exporter import export_to_match_data

        # Export locally first (Agent's container), then push to Backend
        agent_data_dir = "/app/data"
        match_id, json_path = export_to_match_data(
            task_id=task_id,
            filename=task.filename if task else "unknown.mp4",
            tracks=tracks,
            team_ball_control=team_ball_control,
            backend_data_dir=agent_data_dir,
            home_team_name=home_team_name,
            away_team_name=away_team_name,
            tackles=enrichment.get("tackles", []),
            fouls=enrichment.get("fouls", []),
            fps=enrichment.get("fps", 24.0),
        )

        # 5b. Export Notion-spec JSON (local audit files — not pushed to Backend)
        try:
            from football_analysis.notion_exporter import export_notion_json
            notion_dir = os.path.join(agent_data_dir, f"{match_id}_notion")
            export_notion_json(
                tracks=tracks,
                team_ball_control=team_ball_control,
                events=enrichment,
                fps=enrichment.get("fps", 24.0),
                output_dir=notion_dir,
                team_names=[home_team_name, away_team_name],
                match_id=match_id,
            )
        except Exception as notion_err:
            print(f"[Worker] WARNING: Notion export failed (non-fatal): {notion_err}")

        # 6. Push JSON to Backend API so it's stored on the Backend's volume.
        #    The Agent and Backend have separate containers/volumes, so writing
        #    to /app/data here does NOT make it visible to the Backend.
        import requests as _req

        upload_url = f"{BACKEND_API_URL}/api/v1/upload"
        with open(json_path, "rb") as jf:
            resp = _req.post(
                upload_url,
                files={"file": (f"{match_id}.json", jf, "application/json")},
                timeout=30,
            )
        if resp.ok:
            print(f"[Worker] Pushed match JSON to Backend → {upload_url} (status {resp.status_code})")
        else:
            print(f"[Worker] WARNING: Backend upload failed ({resp.status_code}): {resp.text}")

        # 7. Mark task as SUCCESS
        if task:
            task.status = TaskStatus.SUCCESS
            task.output_path = local_output_path
            task.result_data = {
                "completed": True,
                "match_id": match_id,
                "json_path": json_path,
                "tackles_detected": len(enrichment.get("tackles", [])),
                "fouls_detected": len(enrichment.get("fouls", [])),
            }
            session.commit()

        print(f"[Worker] Task {task_id} completed successfully → match_id={match_id}")

    except Exception as e:
        print(f"[Worker] Error in task {task_id}: {e}")
        if task:
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            session.commit()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    worker_app.worker_main(["worker", "--loglevel=info"])
