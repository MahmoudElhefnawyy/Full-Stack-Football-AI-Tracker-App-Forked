from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.exceptions import NotFoundException
from app.models.responses import ApiResponse
from app.models.schemas import (
    PlayerSummarySchema,
    TeamSummarySchema,
    TeamAttributesSchema,
    TeamStatsSchema,
    TeamPossessionSchema,
)
from app.services.analytics_service import analytics_service
from app.services.json_loader import load_matches, load_players, load_teams
from app.api.deps import get_current_user_id

router = APIRouter()


def _build_team_schema(raw: dict) -> TeamSummarySchema:
    return TeamSummarySchema(
        id=raw["id"],
        name=raw["name"],
        stadium=raw.get("stadium", ""),
        coach=raw.get("coach", ""),
        founded=raw.get("founded", 0),
        players=raw.get("players", 0),
        emoji=raw.get("emoji", "⚽"),
        stats=TeamStatsSchema(**raw["stats"]),
        attributes=TeamAttributesSchema(**raw["attributes"]),
    )


@router.get("", response_model=ApiResponse[list[TeamSummarySchema]])
async def list_teams() -> ApiResponse:
    return ApiResponse.ok([_build_team_schema(t) for t in load_teams()])


@router.get("/{team_id}", response_model=ApiResponse[TeamSummarySchema])
async def get_team(team_id: str) -> ApiResponse:
    raw = next((t for t in load_teams() if t["id"] == team_id), None)
    if not raw:
        raise NotFoundException("Team", team_id)
    return ApiResponse.ok(_build_team_schema(raw))


@router.get("/{team_id}/players", response_model=ApiResponse[list[PlayerSummarySchema]])
async def team_players(team_id: str) -> ApiResponse:
    raw = next((t for t in load_teams() if t["id"] == team_id), None)
    if not raw:
        raise NotFoundException("Team", team_id)
    players = [p for p in load_players() if p.team_id == team_id]
    summaries = [
        PlayerSummarySchema(
            id=p.id, name=p.name, team_id=p.team_id,
            team_name=p.team_name, position=p.position,
            number=p.number, rating=p.rating,
            goals=p.goals, assists=p.assists,
        )
        for p in players
    ]
    return ApiResponse.ok(summaries)


@router.get("/{team_id}/possession", response_model=ApiResponse[TeamPossessionSchema])
async def team_possession(team_id: str, user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    raw = next((t for t in load_teams() if t["id"] == team_id), None)
    if not raw:
        raise NotFoundException("Team", team_id)

    matches = [m for m in load_matches() if m.user_id == user_id]
    match = next(
        (m for m in matches if m.home_team.id == team_id or m.away_team.id == team_id),
        None,
    )
    if not match:
        # Return 50/50 if no match exists
        return ApiResponse.ok(TeamPossessionSchema(
            team_id=team_id,
            team_name=raw["name"],
            percent=50.0,
            opponent_percent=50.0,
        ))

    possession = analytics_service.team_possession(team_id, raw["name"], match)
    return ApiResponse.ok(possession)
