from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import NotFoundException
from app.models.responses import ApiResponse
from app.models.schemas import MatchDetailSchema, MatchOverviewSchema, MatchSummarySchema
from app.services.analytics_service import analytics_service
from app.services.json_loader import load_matches
from app.api.deps import get_current_user_id

router = APIRouter()


@router.get("", response_model=ApiResponse[list[MatchSummarySchema]])
async def list_matches(user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    matches = load_matches()
    # Filter matches to only show matches explicitly uploaded by the authenticated user
    user_matches = [m for m in matches if m.user_id == user_id]
    summaries = [
        MatchSummarySchema(
            id=m.id,
            date=m.date,
            home_team=m.home_team.name,
            away_team=m.away_team.name,
            home_score=m.home_score,
            away_score=m.away_score,
            status=m.status,
        )
        for m in user_matches
    ]
    return ApiResponse.ok(summaries)


@router.get("/{match_id}", response_model=ApiResponse[MatchDetailSchema])
async def get_match(match_id: str) -> ApiResponse:
    match = next(
        (m for m in load_matches() if m.id == match_id),
        None,
    )
    if not match:
        raise NotFoundException("Match", match_id)

    detail = MatchDetailSchema(
        id=match.id,
        date=match.date,
        home_team=match.home_team.name,
        away_team=match.away_team.name,
        home_score=match.home_score,
        away_score=match.away_score,
        status=match.status,
        duration_minutes=match.duration_minutes,
    )
    return ApiResponse.ok(detail)


@router.get("/{match_id}/overview", response_model=ApiResponse[MatchOverviewSchema])
async def match_overview(match_id: str) -> ApiResponse:
    match = next(
        (m for m in load_matches() if m.id == match_id),
        None,
    )
    if not match:
        raise NotFoundException("Match", match_id)

    overview = analytics_service.match_overview(match)
    return ApiResponse.ok(overview)


@router.get("/debug/files")
async def list_data_files():
    """List all JSON files in the data directory (debug helper)."""
    data_dir = Path(settings.data_dir)
    if not data_dir.exists():
        return JSONResponse(content={"files": [], "data_dir": str(data_dir), "exists": False})

    files = []
    for p in sorted(data_dir.glob("*.json")):
        files.append({"name": p.name, "size_bytes": p.stat().st_size})

    return JSONResponse(content={"files": files, "data_dir": str(data_dir), "exists": True})


@router.get("/{match_id}/raw")
async def match_raw_json(match_id: str):
    """
    Return the complete raw match JSON file produced by the AI pipeline.
    Reads directly from disk — no cache, no user filter.
    Shows every pass, turnover, position, player, and metadata.total_frames.
    """
    data_dir = Path(settings.data_dir)
    json_path = data_dir / f"{match_id}.json"

    if not json_path.exists():
        # The upload endpoint may wrap data in a list — try the filename pattern
        raise NotFoundException("Raw JSON file", match_id)

    with json_path.open("r", encoding="utf-8") as f:
        raw_data = json.load(f)

    return JSONResponse(content=raw_data)
