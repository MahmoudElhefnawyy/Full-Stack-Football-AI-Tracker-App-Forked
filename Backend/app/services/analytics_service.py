from __future__ import annotations

from typing import Optional

from app.core.logging import get_logger
from app.models.domain import MatchData, PlayerStats, Positions, Position
from app.models.schemas import (
    HeatmapPointSchema,
    MatchOverviewSchema,
    PlayerDetailSchema,
    PlayerAttributesSchema,
    PlayerHeatmapSchema,
    StatComparisonSchema,
    TeamPossessionSchema,
)

logger = get_logger(__name__)


class AnalyticsService:
    """Pure, stateless analytics computations. All methods take domain objects."""

    # ── Match ─────────────────────────────────────────────────────────────────

    def match_overview(self, match: MatchData) -> MatchOverviewSchema:
        home_poss = match.team_possession(match.home_team.id)
        away_poss = match.team_possession(match.away_team.id)

        # Prefer pass accuracy from metadata stats (computed from actual passes/turnovers)
        # over recomputing from the 'successful' flag which is always True in the exporter.
        raw_stats = match.metadata.get("stats", [])
        meta_pass_acc = next((s for s in raw_stats if s.get("name") == "Pass Accuracy"), None)
        if meta_pass_acc:
            home_acc = float(meta_pass_acc.get("home", 0))
            away_acc = float(meta_pass_acc.get("away", 0))
        else:
            home_passes = [p for p in match.passes if p.team_id == match.home_team.id]
            away_passes = [p for p in match.passes if p.team_id == match.away_team.id]
            home_acc = self._pass_accuracy(home_passes)
            away_acc = self._pass_accuracy(away_passes)

        # Use possession from metadata if segment-based calculation gives bad results
        meta_poss = next((s for s in raw_stats if s.get("name") == "Possession"), None)
        if meta_poss and (home_poss == 0 or home_poss == 100):
            home_poss = float(meta_poss.get("home", 50))
            away_poss = float(meta_poss.get("away", 50))

        # Build computed stats first
        computed_stats = [
            {"name": "Goals", "home": match.home_score, "away": match.away_score},
            {"name": "Possession", "home": home_poss, "away": away_poss},
            {"name": "Pass Accuracy", "home": home_acc, "away": away_acc},
        ]
        computed_names = {s["name"] for s in computed_stats}

        # Append metadata stats that are NOT duplicates of computed stats
        if raw_stats:
            for s in raw_stats:
                if s.get("name") not in computed_names:
                    computed_stats.append(s)

        stats = [
            StatComparisonSchema(name=s["name"], home=s["home"], away=s["away"])
            for s in computed_stats
        ]

        return MatchOverviewSchema(
            match_id=match.id,
            date=match.date,
            home_team=match.home_team.name,
            away_team=match.away_team.name,
            home_score=match.home_score,
            away_score=match.away_score,
            status=match.status,
            possession={match.home_team.name: home_poss, match.away_team.name: away_poss},
            pass_accuracy={match.home_team.name: home_acc, match.away_team.name: away_acc},
            stats=stats,
        )

    # ── Player ────────────────────────────────────────────────────────────────

    def player_detail(self, player: PlayerStats) -> PlayerDetailSchema:
        return PlayerDetailSchema(
            id=player.id,
            name=player.name,
            team_id=player.team_id,
            team_name=player.team_name,
            position=player.position,
            number=player.number,
            rating=player.rating,
            goals=player.goals,
            assists=player.assists,
            minutes_played=player.minutes_played,
            passes_attempted=player.passes_attempted,
            passes_completed=player.passes_completed,
            turnovers=player.turnovers,
            pass_accuracy=player.pass_accuracy,
            turnover_rate=player.turnover_rate,
            attributes=PlayerAttributesSchema(
                speed=player.attributes.speed,
                dribbling=player.attributes.dribbling,
                shooting=player.attributes.shooting,
                passing=player.attributes.passing,
                defending=player.attributes.defending,
                physical=player.attributes.physical,
            ),
        )

    def player_heatmap(self, player: PlayerStats, match: MatchData) -> PlayerHeatmapSchema:
        raw_positions = match.positions.get(player.id, [])

        if raw_positions:
            pos_obj = Positions(positions=raw_positions)
            points = [
                HeatmapPointSchema(x=p["x"], y=p["y"], value=float(p["value"]))
                for p in pos_obj.heatmap_coords()
            ]
        else:
            # Synthetic fallback based on player position zone
            points = self._synthetic_heatmap(player.position)

        return PlayerHeatmapSchema(
            player_id=player.id,
            player_name=player.name,
            points=points,
        )

    def _synthetic_heatmap(self, position: str) -> list[HeatmapPointSchema]:
        """Generate a realistic heatmap zone when no position data exists."""
        zone_maps: dict[str, list[tuple[float, float, float]]] = {
            "GK":     [(5,40,20),(5,50,18),(5,60,15),(10,45,8),(10,55,6)],
            "CB":     [(20,35,18),(20,50,20),(20,65,18),(25,45,10),(25,55,10)],
            "LB":     [(25,15,16),(35,20,14),(40,25,12),(30,30,10),(45,15,8)],
            "RB":     [(25,75,16),(35,80,14),(40,85,12),(30,70,10),(45,80,8)],
            "CM":     [(45,40,16),(50,50,20),(55,45,18),(50,60,12),(45,55,10)],
            "CAM":    [(60,40,15),(65,50,18),(70,45,16),(65,35,10),(70,60,10)],
            "LW":     [(65,15,16),(75,20,18),(80,15,14),(70,25,10),(75,30,8)],
            "RW":     [(65,75,16),(75,80,18),(80,75,14),(70,70,10),(75,65,8)],
            "ST":     [(80,40,18),(85,50,20),(80,60,18),(88,45,14),(83,55,12)],
            "Striker":[(80,40,18),(85,50,20),(80,60,18),(88,45,14),(83,55,12)],
            "Midfielder":[(45,45,18),(55,50,20),(50,55,16),(52,42,12),(58,48,10)],
        }
        pts = zone_maps.get(position, zone_maps["CM"])
        return [HeatmapPointSchema(x=x, y=y, value=v) for x, y, v in pts]

    # ── Team ──────────────────────────────────────────────────────────────────

    def team_possession(
        self, team_id: str, team_name: str, match: MatchData
    ) -> TeamPossessionSchema:
        pct = match.team_possession(team_id)
        opponent_pct = round(100.0 - pct, 1)
        return TeamPossessionSchema(
            team_id=team_id,
            team_name=team_name,
            percent=pct,
            opponent_percent=opponent_pct,
        )

    # ── Internal helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _pass_accuracy(passes: list) -> float:
        if not passes:
            return 0.0
        successful = sum(1 for p in passes if p.successful)
        return round(successful / len(passes) * 100, 1)


analytics_service = AnalyticsService()
