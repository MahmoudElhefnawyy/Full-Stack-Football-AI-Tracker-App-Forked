from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.exceptions import NotFoundException
from app.core.logging import get_logger
from app.models.responses import ApiResponse
from app.models.schemas import PlayerDetailSchema, PlayerHeatmapSchema, PlayerSummarySchema
from app.services.analytics_service import analytics_service
from app.services.json_loader import load_matches, load_players
from app.api.deps import get_current_user_id

router = APIRouter()
logger = get_logger(__name__)


def _all_players(user_id: str = ""):
    """
    Return a unified player list filtered by user ownership.

    Priority order:
    1. Players embedded in match JSON files (written by the AI exporter).
    2. Standalone players.json (legacy / manual uploads).

    Players from matches take precedence — they contain AI-derived stats.
    """
    # Gather players from user's matches only
    match_players = {}
    try:
        for match in load_matches():
            if user_id and match.user_id != user_id:
                continue
            for p in getattr(match, "players", []):
                match_players[p.id] = p
    except Exception as e:
        logger.warning("Could not load match-embedded players: %s", e)

    # If we have match-embedded players, use those
    if match_players:
        return list(match_players.values())

    # Fallback to standalone players.json (only if no user filtering)
    if not user_id:
        try:
            return load_players()
        except Exception:
            pass

    return []


@router.get("", response_model=ApiResponse[list[PlayerSummarySchema]])
async def list_players(user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    players = _all_players(user_id)
    summaries = [
        PlayerSummarySchema(
            id=p.id,
            name=p.name,
            team_id=p.team_id,
            team_name=p.team_name,
            position=p.position,
            number=p.number,
            rating=p.rating,
            goals=p.goals,
            assists=p.assists,
            avg_speed_kmh=p.avg_speed_kmh,
            distance_covered_m=p.distance_covered_m,
        )
        for p in players
    ]
    return ApiResponse.ok(summaries)


@router.get("/{player_id}", response_model=ApiResponse[PlayerSummarySchema])
async def get_player(player_id: str, user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    player = next((p for p in _all_players(user_id) if p.id == player_id), None)
    if not player:
        raise NotFoundException("Player", player_id)
    return ApiResponse.ok(
        PlayerSummarySchema(
            id=player.id, name=player.name, team_id=player.team_id,
            team_name=player.team_name, position=player.position,
            number=player.number, rating=player.rating,
            goals=player.goals, assists=player.assists,
            avg_speed_kmh=player.avg_speed_kmh,
            distance_covered_m=player.distance_covered_m,
        )
    )


@router.get("/{player_id}/stats", response_model=ApiResponse[PlayerDetailSchema])
async def player_stats(player_id: str, user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    player = next((p for p in _all_players(user_id) if p.id == player_id), None)
    if not player:
        raise NotFoundException("Player", player_id)
    detail = analytics_service.player_detail(player)
    return ApiResponse.ok(detail)


@router.get("/{player_id}/heatmap", response_model=ApiResponse[PlayerHeatmapSchema])
async def player_heatmap(player_id: str, user_id: str = Depends(get_current_user_id)) -> ApiResponse:
    player = next((p for p in _all_players(user_id) if p.id == player_id), None)
    if not player:
        raise NotFoundException("Player", player_id)

    # Find the most recent match involving the player's team (user-scoped)
    matches = [m for m in load_matches() if m.user_id == user_id]
    match = next(
        (m for m in matches if player.team_id in {m.home_team.id, m.away_team.id}),
        matches[0] if matches else None,
    )

    heatmap = analytics_service.player_heatmap(player, match) if match else analytics_service.player_heatmap(player, _empty_match())
    return ApiResponse.ok(heatmap)


# ── Internal helper ───────────────────────────────────────────────────────────

def _empty_match():
    from app.models.domain import MatchData, TeamSummary
    return MatchData(
        id="__empty__",
        date="",
        home_team=TeamSummary(id="t1", name="Home"),
        away_team=TeamSummary(id="t2", name="Away"),
        home_score=0,
        away_score=0,
    )
