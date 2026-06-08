from __future__ import annotations

import math
from typing import Optional, Literal

from pydantic import BaseModel, Field, computed_field


# ── Position ────────────────────────────────────────────────────────────────

class Position(BaseModel):
    x: float = Field(..., ge=0, le=100, description="Field width % (0–100)")
    y: float = Field(..., ge=0, le=100, description="Field length % (0–100)")
    timestamp: Optional[float] = None
    minute: Optional[int] = None


class Positions(BaseModel):
    positions: list[Position] = Field(default_factory=list)

    def centroid(self) -> tuple[float, float]:
        if not self.positions:
            return 50.0, 50.0
        xs = [p.x for p in self.positions]
        ys = [p.y for p in self.positions]
        return sum(xs) / len(xs), sum(ys) / len(ys)

    def bounding_box(self) -> dict[str, float]:
        if not self.positions:
            return {"min_x": 0, "max_x": 100, "min_y": 0, "max_y": 100}
        xs = [p.x for p in self.positions]
        ys = [p.y for p in self.positions]
        return {"min_x": min(xs), "max_x": max(xs), "min_y": min(ys), "max_y": max(ys)}

    def heatmap_coords(self) -> list[dict[str, float]]:
        """Return coordinate density buckets for heatmap rendering."""
        buckets: dict[tuple[int, int], int] = {}
        for p in self.positions:
            key = (int(p.x // 5) * 5, int(p.y // 5) * 5)
            buckets[key] = buckets.get(key, 0) + 1
        return [{"x": x, "y": y, "value": count} for (x, y), count in buckets.items()]


# ── Pass ────────────────────────────────────────────────────────────────────

class Pass(BaseModel):
    player_id: str
    recipient_id: Optional[str] = None
    team_id: str
    start_x: float
    start_y: float
    end_x: float
    end_y: float
    successful: bool = True
    minute: Optional[int] = None

    def distance(self) -> float:
        return math.sqrt((self.end_x - self.start_x) ** 2 + (self.end_y - self.start_y) ** 2)

    def is_progressive(self) -> bool:
        """True when the pass moves the ball meaningfully toward the opponent's goal."""
        return (self.end_x - self.start_x) > 10 and self.distance() > 15


# ── Turnover ────────────────────────────────────────────────────────────────

class Turnover(BaseModel):
    player_id: str
    team_id: str
    x: float
    y: float
    minute: Optional[int] = None
    turnover_type: str = "general"  # e.g. "misplaced_pass", "tackle_lost", "general"


# ── PlayerStats ──────────────────────────────────────────────────────────────

class PlayerAttributes(BaseModel):
    speed: int = 70
    dribbling: int = 70
    shooting: int = 70
    passing: int = 70
    defending: int = 70
    physical: int = 70


class PlayerStats(BaseModel):
    id: str
    name: str
    team_id: str
    team_name: str
    position: str
    number: int = 0
    minutes_played: int = 90
    passes_attempted: int = 0
    passes_completed: int = 0
    turnovers: int = 0
    goals: int = 0
    assists: int = 0
    rating: float = 7.0
    avg_speed_kmh: float = 0.0
    distance_covered_m: float = 0.0
    attributes: PlayerAttributes = Field(default_factory=PlayerAttributes)

    @computed_field  # type: ignore[misc]
    @property
    def pass_accuracy(self) -> float:
        if self.passes_attempted == 0:
            return 0.0
        return round(self.passes_completed / self.passes_attempted * 100, 1)

    @computed_field  # type: ignore[misc]
    @property
    def turnover_rate(self) -> float:
        if self.passes_attempted == 0:
            return 0.0
        return round(self.turnovers / self.passes_attempted, 3)

    def summary(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "position": self.position,
            "goals": self.goals,
            "assists": self.assists,
            "rating": self.rating,
            "pass_accuracy": self.pass_accuracy,
        }


# ── MatchEvent ───────────────────────────────────────────────────────────────

class MatchEvent(BaseModel):
    id: int
    time: str  # e.g. "12'"
    type: str  # "Goal", "Yellow Card", "Red Card", "Substitution", "Foul"
    player: str
    team: str
    description: str


# ── PossessionSegment ────────────────────────────────────────────────────────

class PossessionSegment(BaseModel):
    team_id: str
    start_minute: int
    end_minute: int

    @property
    def duration(self) -> int:
        return self.end_minute - self.start_minute


# ── TeamSummary (lightweight reference inside MatchData) ──────────────────────

class TeamSummary(BaseModel):
    id: str
    name: str
    emoji: str = "⚽"
    attributes: Optional[dict] = None
    stats: Optional[dict] = None


# ── MatchData ────────────────────────────────────────────────────────────────

class MatchData(BaseModel):
    id: str
    date: str
    home_team: TeamSummary
    away_team: TeamSummary
    home_score: int
    away_score: int
    duration_minutes: int = 90
    status: str = "Full Time"
    players: list[PlayerStats] = Field(default_factory=list)
    passes: list[Pass] = Field(default_factory=list)
    turnovers: list[Turnover] = Field(default_factory=list)
    positions: dict[str, list[Position]] = Field(default_factory=dict)  # player_id → positions
    possession_segments: list[PossessionSegment] = Field(default_factory=list)
    events: list[MatchEvent] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)

    # ── Helpers ──────────────────────────────────────────────────────────────

    def overview(self) -> dict:
        home_passes = [p for p in self.passes if p.team_id == self.home_team.id]
        away_passes = [p for p in self.passes if p.team_id == self.away_team.id]
        home_poss = self.team_possession(self.home_team.id)
        away_poss = self.team_possession(self.away_team.id)

        home_acc = (
            round(sum(1 for p in home_passes if p.successful) / len(home_passes) * 100, 1)
            if home_passes else 0
        )
        away_acc = (
            round(sum(1 for p in away_passes if p.successful) / len(away_passes) * 100, 1)
            if away_passes else 0
        )

        # Build computed stats first, then append non-duplicate metadata stats
        computed_stats = [
            {"name": "Goals", "home": self.home_score, "away": self.away_score},
            {"name": "Possession", "home": home_poss, "away": away_poss},
            {"name": "Pass Accuracy", "home": home_acc, "away": away_acc},
        ]
        computed_names = {s["name"] for s in computed_stats}
        metadata_stats = [
            s for s in self.metadata.get("stats", [])
            if s.get("name") not in computed_names
        ]

        return {
            "match_id": self.id,
            "date": self.date,
            "home_team": self.home_team.name,
            "away_team": self.away_team.name,
            "home_score": self.home_score,
            "away_score": self.away_score,
            "status": self.status,
            "possession": {
                self.home_team.name: home_poss,
                self.away_team.name: away_poss,
            },
            "pass_accuracy": {
                self.home_team.name: home_acc,
                self.away_team.name: away_acc,
            },
            "stats": computed_stats + metadata_stats,
        }

    def player_lookup(self, player_id: str) -> Optional[PlayerStats]:
        return next((p for p in self.players if p.id == player_id), None)

    def team_possession(self, team_id: str) -> float:
        """Return possession percentage for a team calculated from segments."""
        if not self.possession_segments:
            # Fallback to metadata if no segments
            return self.metadata.get("possession", {}).get(team_id, 50.0)
        total = sum(s.duration for s in self.possession_segments)
        if total == 0:
            return 50.0
        team_total = sum(s.duration for s in self.possession_segments if s.team_id == team_id)
        return round(team_total / total * 100, 1)


# ── Recommendation ───────────────────────────────────────────────────────────

RecommendationScope = Literal["player", "team", "match"]
RecommendationPriority = Literal["high", "medium", "low"]


class Recommendation(BaseModel):
    id: str
    scope: RecommendationScope
    match_id: Optional[str] = None
    team_id: Optional[str] = None
    player_id: Optional[str] = None
    title: str
    description: str
    priority: RecommendationPriority = "medium"
    confidence: float = Field(default=0.75, ge=0.0, le=1.0)
    reasoning: str = ""
    metrics: dict = Field(default_factory=dict)
