from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends

from app.core.exceptions import NotFoundException
from app.models.responses import ApiResponse
from app.models.schemas import RecommendationSchema
from app.services.json_loader import load_matches, load_players
from app.services.recommendation_service import recommendation_service
from app.api.deps import get_current_user_id

router = APIRouter()


def _to_schema(rec) -> RecommendationSchema:
    return RecommendationSchema(
        id=rec.id,
        scope=rec.scope,
        match_id=rec.match_id,
        team_id=rec.team_id,
        player_id=rec.player_id,
        title=rec.title,
        description=rec.description,
        priority=rec.priority,
        confidence=rec.confidence,
        reasoning=rec.reasoning,
        metrics=rec.metrics,
    )


@router.get("", response_model=ApiResponse[list[RecommendationSchema]])
async def list_recommendations(user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    matches = [m for m in load_matches() if m.user_id == user_id]
    recs = recommendation_service.all_recommendations(matches)
    return ApiResponse.ok([_to_schema(r) for r in recs])


@router.get("/match/{match_id}", response_model=ApiResponse[list[RecommendationSchema]])
async def recommendations_for_match(match_id: str, user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    match = next((m for m in load_matches() if m.id == match_id and m.user_id == user_id), None)
    if not match:
        raise NotFoundException("Match", match_id)
    recs = recommendation_service.for_match(match)
    return ApiResponse.ok([_to_schema(r) for r in recs])


@router.get("/player/{player_id}", response_model=ApiResponse[list[RecommendationSchema]])
async def recommendations_for_player(player_id: str, user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    player = next((p for p in load_players() if p.id == player_id), None)
    if not player:
        raise NotFoundException("Player", player_id)
    matches = [m for m in load_matches() if m.user_id == user_id]
    match = next(
        (m for m in matches if player.team_id in {m.home_team.id, m.away_team.id}),
        None,
    )
    recs = recommendation_service.for_player(player, match)
    return ApiResponse.ok([_to_schema(r) for r in recs])
