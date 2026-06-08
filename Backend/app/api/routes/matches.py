from __future__ import annotations

from fastapi import APIRouter

from app.core.exceptions import NotFoundException
from app.models.responses import ApiResponse
from app.models.schemas import MatchDetailSchema, MatchOverviewSchema, MatchSummarySchema
from app.services.analytics_service import analytics_service
from app.services.json_loader import load_matches

router = APIRouter()


@router.get("", response_model=ApiResponse[list[MatchSummarySchema]])
async def list_matches() -> ApiResponse:
    matches = load_matches()
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
        for m in matches
    ]
    return ApiResponse.ok(summaries)


@router.get("/{match_id}", response_model=ApiResponse[MatchDetailSchema])
async def get_match(match_id: str) -> ApiResponse:
    match = next((m for m in load_matches() if m.id == match_id), None)
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
    match = next((m for m in load_matches() if m.id == match_id), None)
    if not match:
        raise NotFoundException("Match", match_id)

    overview = analytics_service.match_overview(match)
    return ApiResponse.ok(overview)
