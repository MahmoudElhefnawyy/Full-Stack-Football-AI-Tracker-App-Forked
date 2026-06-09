from __future__ import annotations

from typing import Any, Generic, Optional, TypeVar
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

T = TypeVar("T")


# ── Base config ──────────────────────────────────────────────────────────────

class CamelModel(BaseModel):
    """All API schemas use camelCase for the frontend."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


# ── Generic API Response ─────────────────────────────────────────────────────

class ApiResponse(CamelModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "OK"
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


# ── Player schemas ────────────────────────────────────────────────────────────

class PlayerAttributesSchema(CamelModel):
    speed: int
    dribbling: int
    shooting: int
    passing: int
    defending: int
    physical: int


class PlayerSummarySchema(CamelModel):
    id: str
    name: str
    team_id: str
    team_name: str
    position: str
    number: int
    rating: float
    goals: int
    assists: int
    avg_speed_kmh: float = 0.0
    distance_covered_m: float = 0.0


class PlayerDetailSchema(PlayerSummarySchema):
    minutes_played: float
    passes_attempted: int
    passes_completed: int
    turnovers: int
    pass_accuracy: float
    turnover_rate: float
    attributes: PlayerAttributesSchema


class HeatmapPointSchema(CamelModel):
    x: float
    y: float
    value: float


class PlayerHeatmapSchema(CamelModel):
    player_id: str
    player_name: str
    points: list[HeatmapPointSchema]


# ── Team schemas ──────────────────────────────────────────────────────────────

class TeamStatsSchema(CamelModel):
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    avg_rating: float


class TeamAttributesSchema(CamelModel):
    attack: int
    passing: int
    defense: int
    speed: int
    dribbling: int
    shooting: int


class TeamSummarySchema(CamelModel):
    id: str
    name: str
    stadium: str
    coach: str
    founded: int
    players: int
    emoji: str
    stats: TeamStatsSchema
    attributes: TeamAttributesSchema


class TeamPossessionSchema(CamelModel):
    team_id: str
    team_name: str
    percent: float
    opponent_percent: float


# ── Match schemas ─────────────────────────────────────────────────────────────

class MatchEventSchema(CamelModel):
    id: int
    time: str
    type: str
    player: str
    team: str
    description: str


class StatComparisonSchema(CamelModel):
    name: str
    home: Any
    away: Any


class MatchSummarySchema(CamelModel):
    id: str
    date: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    status: str


class MatchDetailSchema(MatchSummarySchema):
    duration_minutes: float


class MatchOverviewSchema(CamelModel):
    match_id: str
    date: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    status: str
    possession: dict[str, float]
    pass_accuracy: dict[str, float]
    stats: list[StatComparisonSchema]


# ── Recommendation schemas ────────────────────────────────────────────────────

class RecommendationSchema(CamelModel):
    id: str
    scope: str
    match_id: Optional[str] = None
    team_id: Optional[str] = None
    player_id: Optional[str] = None
    title: str
    description: str
    priority: str
    confidence: float
    reasoning: str
    metrics: dict


# ── Upload schemas ────────────────────────────────────────────────────────────

class UploadReceiptSchema(CamelModel):
    match_id: str
    filename: str
    status: str = "accepted"
    message: str = "Match data uploaded successfully."
