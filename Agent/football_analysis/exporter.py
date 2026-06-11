"""
exporter.py — Schema bridge between AI tracking results and Backend MatchData format.

Converts the raw tracks + team_ball_control from the YOLO pipeline into the
Backend's JSON schema understood by app/services/json_loader.py.
"""
from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np

# Analytics functions from the new visualizations module
from visualizations.json_extractor import (
    assign_ball_touches,
    determine_ball_control,
    detect_passes,
    build_players,
)

# ── Coordinate normalisation constants ────────────────────────────────────────
# ViewTransformer maps pixels → metres within the visible pitch section
_PITCH_LENGTH_M = 23.32   # court_length in view_transformer.py (X axis)
_PITCH_WIDTH_M = 68.0     # court_width  in view_transformer.py (Y axis)


def _norm_x(x: float) -> float:
    """Convert metre X coordinate (0-23.32) to percentage (0-100)."""
    return round(min(100.0, max(0.0, x / _PITCH_LENGTH_M * 100)), 2)


def _norm_y(y: float) -> float:
    """Convert metre Y coordinate (0-68) to percentage (0-100)."""
    return round(min(100.0, max(0.0, y / _PITCH_WIDTH_M * 100)), 2)


def _get_player_pos(player_id, frame: int, player_positions: dict, player_avg: dict):
    """
    Look up a player's normalised position at a specific frame.
    Falls back to the player's average position if that frame is unavailable.
    """
    pos = player_positions.get(player_id, {}).get(frame)
    if pos:
        return _norm_x(pos["x"]), _norm_y(pos["y"])
    avg = player_avg.get(player_id, {"x": 0.0, "y": 0.0})
    return _norm_x(avg["x"]), _norm_y(avg["y"])


# ── Heatmap zone computation (3×3 grid) ──────────────────────────────────────

_ZONE_COLS = 3  # X axis divisions
_ZONE_ROWS = 3  # Y axis divisions
_ZONE_W = _PITCH_LENGTH_M / _ZONE_COLS
_ZONE_H = _PITCH_WIDTH_M / _ZONE_ROWS


def _compute_heatmap_zones(players: list[dict], tracks: dict) -> dict[int, list[dict]]:
    """
    Compute 3×3 heatmap zones for each player from position_transformed data.

    Zone layout (X=cols, Y=rows):
        0 | 1 | 2   (Y: 0 → 22.67m)
        3 | 4 | 5   (Y: 22.67 → 45.33m)
        6 | 7 | 8   (Y: 45.33 → 68m)

    Returns: {player_id: [{"zone_id": 4, "percentage": 62.5, "frame_count": 450}, ...]}
    """
    player_zone_counts: dict[int, dict[int, int]] = {}

    for frame_data in tracks["players"]:
        for track_id, info in frame_data.items():
            pos = info.get("position_transformed")
            if pos is None:
                continue

            x, y = float(pos[0]), float(pos[1])
            col = min(int(x / _ZONE_W), _ZONE_COLS - 1)
            row = min(int(y / _ZONE_H), _ZONE_ROWS - 1)
            col = max(0, col)
            row = max(0, row)
            zone_id = row * _ZONE_COLS + col

            if track_id not in player_zone_counts:
                player_zone_counts[track_id] = {}
            player_zone_counts[track_id][zone_id] = (
                player_zone_counts[track_id].get(zone_id, 0) + 1
            )

    # Convert to sorted list with percentages
    result: dict[int, list[dict]] = {}
    for pid, zones in player_zone_counts.items():
        total = sum(zones.values())
        if total == 0:
            result[pid] = []
            continue
        zone_list = [
            {
                "zone_id": zid,
                "percentage": round(count / total * 100, 1),
                "frame_count": count,
            }
            for zid, count in sorted(zones.items(), key=lambda x: x[1], reverse=True)
        ]
        result[pid] = zone_list
    return result


# ── Recommendation engine ─────────────────────────────────────────────────────

import uuid as _uuid


def _compute_recommendations(
    backend_players: list[dict],
    team_1_pct: float,
    team_2_pct: float,
    home_pass_acc: float,
    away_pass_acc: float,
    home_turnovers_count: int,
    away_turnovers_count: int,
    home_passes_count: int,
    away_passes_count: int,
    match_id: str,
    home_team_name: str,
    away_team_name: str,
    duration_seconds: float,
) -> list[dict]:
    """
    Generate coaching recommendations from player and team stats.

    All rules fire regardless of video duration. Message wording adapts
    for short clips (< 5 min) vs full matches.
    """
    recs: list[dict] = []
    is_short = duration_seconds < 300  # < 5 minutes
    clip_note = " in this clip" if is_short else ""
    monitor_note = " Monitor in full match." if is_short else ""

    # ── Group players by team ──────────────────────────────────────────────
    team_players: dict[str, list[dict]] = {"team_1": [], "team_2": []}
    for p in backend_players:
        tid = p.get("team_id", "team_1")
        team_players.setdefault(tid, []).append(p)

    # ── Player-level rules ─────────────────────────────────────────────────
    for tid, tp_list in team_players.items():
        if not tp_list:
            continue

        team_name = home_team_name if tid == "team_1" else away_team_name
        distances = [p.get("distance_covered_m", 0) for p in tp_list]
        avg_dist = sum(distances) / len(distances) if distances else 0

        # Sort by speed for "top speed" rule
        by_speed = sorted(tp_list, key=lambda p: p.get("avg_speed_kmh", 0), reverse=True)

        for p in tp_list:
            pid = p["id"]
            pname = p["name"]
            dist = p.get("distance_covered_m", 0)
            passes_made = p.get("passes_completed", 0)
            turns = p.get("turnovers", 0)
            attempted = p.get("passes_attempted", 0)

            # Rule: Low distance
            if avg_dist > 0 and dist < avg_dist * 0.5:
                recs.append(_make_rec(
                    scope="player", match_id=match_id, team_id=tid, player_id=pid,
                    title=f"{pname} – Low Distance",
                    description=f"{pname} covered only {dist:.1f}m{clip_note}, "
                                f"well below team average of {avg_dist:.1f}m. "
                                f"Review workload or positioning.{monitor_note}",
                    priority="high", confidence=0.85,
                    reasoning=f"Distance {dist:.1f}m < 50% of team avg {avg_dist:.1f}m",
                    metrics={"distance_m": dist, "team_avg_m": round(avg_dist, 1)},
                ))

            # Rule: No ball involvement
            if passes_made == 0 and turns == 0 and dist > 5:
                recs.append(_make_rec(
                    scope="player", match_id=match_id, team_id=tid, player_id=pid,
                    title=f"{pname} – No Ball Involvement",
                    description=f"{pname} had no ball involvement{clip_note} "
                                f"despite covering {dist:.1f}m. "
                                f"Review movement and positioning.{monitor_note}",
                    priority="medium", confidence=0.75,
                    reasoning="Zero passes and zero turnovers",
                    metrics={"passes": 0, "turnovers": 0, "distance_m": dist},
                ))

            # Rule: High turnover ratio
            if attempted >= 2 and turns / attempted > 0.4:
                ratio = turns / attempted
                recs.append(_make_rec(
                    scope="player", match_id=match_id, team_id=tid, player_id=pid,
                    title=f"{pname} – High Turnover Rate",
                    description=f"{pname} lost the ball in {turns} of {attempted} "
                                f"involvements{clip_note}. "
                                f"Focus on decision-making under pressure.{monitor_note}",
                    priority="high", confidence=0.8,
                    reasoning=f"Turnover ratio {ratio:.0%} > 40% threshold",
                    metrics={"turnover_ratio": round(ratio, 2), "turnovers": turns},
                ))

            # Rule: Low pass accuracy
            if attempted >= 2:
                acc = passes_made / attempted * 100
                if acc < 60:
                    recs.append(_make_rec(
                        scope="player", match_id=match_id, team_id=tid, player_id=pid,
                        title=f"{pname} – Low Pass Accuracy",
                        description=f"Pass accuracy of {acc:.0f}%{clip_note}. "
                                    f"Focus on short-range passing drills.{monitor_note}",
                        priority="high", confidence=0.85,
                        reasoning=f"Pass accuracy {acc:.1f}% < 60% threshold",
                        metrics={"pass_accuracy": round(acc, 1), "passes_attempted": attempted},
                    ))

        # Rule: Top speed (top 3 in team)
        for p in by_speed[:3]:
            speed = p.get("avg_speed_kmh", 0)
            if speed > 0:
                recs.append(_make_rec(
                    scope="player", match_id=match_id, team_id=tid, player_id=p["id"],
                    title=f"{p['name']} – Top Speed ({team_name})",
                    description=f"{p['name']} is among the fastest in {team_name} "
                                f"({speed:.1f} km/h avg). Leverage in transitions and counters.",
                    priority="low", confidence=0.9,
                    reasoning=f"Top 3 avg speed in {team_name}",
                    metrics={"avg_speed_kmh": speed},
                ))

    # ── Team-level rules ───────────────────────────────────────────────────
    for tid, pct, t_name, t_pass_acc, t_turns, t_passes in [
        ("team_1", team_1_pct, home_team_name, home_pass_acc, home_turnovers_count, home_passes_count),
        ("team_2", team_2_pct, away_team_name, away_pass_acc, away_turnovers_count, away_passes_count),
    ]:
        if pct < 40:
            recs.append(_make_rec(
                scope="team", match_id=match_id, team_id=tid,
                title=f"{t_name} – Low Possession",
                description=f"{t_name} had only {pct:.1f}% possession{clip_note}. "
                            f"Work on ball retention and pressing triggers.{monitor_note}",
                priority="high", confidence=0.85,
                reasoning=f"Possession {pct:.1f}% < 40%",
                metrics={"possession": pct},
            ))

        total_inv = t_passes + t_turns
        if total_inv >= 2:
            turn_ratio = t_turns / total_inv
            if turn_ratio > 0.5:
                recs.append(_make_rec(
                    scope="team", match_id=match_id, team_id=tid,
                    title=f"{t_name} – High Team Turnovers",
                    description=f"{t_name} lost the ball on {t_turns} of {total_inv} "
                                f"possessions{clip_note}. Prioritise short passing.{monitor_note}",
                    priority="high", confidence=0.8,
                    reasoning=f"Team turnover ratio {turn_ratio:.0%} > 50%",
                    metrics={"turnover_ratio": round(turn_ratio, 2)},
                ))

            if t_pass_acc < 60:
                recs.append(_make_rec(
                    scope="team", match_id=match_id, team_id=tid,
                    title=f"{t_name} – Low Pass Accuracy",
                    description=f"{t_name} pass accuracy is {t_pass_acc:.1f}%{clip_note}. "
                                f"Focus on composure in build-up play.{monitor_note}",
                    priority="medium", confidence=0.8,
                    reasoning=f"Team pass accuracy {t_pass_acc:.1f}% < 60%",
                    metrics={"pass_accuracy": t_pass_acc},
                ))

    return recs


def _make_rec(*, scope, match_id, team_id=None, player_id=None,
              title, description, priority, confidence, reasoning, metrics) -> dict:
    """Helper to build a recommendation dict matching the Backend Recommendation schema."""
    return {
        "id": f"rec_{_uuid.uuid4().hex[:8]}",
        "scope": scope,
        "match_id": match_id,
        "team_id": team_id,
        "player_id": player_id,
        "title": title,
        "description": description,
        "priority": priority,
        "confidence": confidence,
        "reasoning": reasoning,
        "metrics": metrics,
    }


def export_to_match_data(
    task_id: str,
    filename: str,
    tracks: dict,
    team_ball_control: np.ndarray,
    backend_data_dir: str,
    home_team_name: str = "Team A",
    away_team_name: str = "Team B",
    fps: float = 24.0,
    user_id: str = "",
) -> tuple[str, str]:
    """
    Convert YOLO tracking results into a Backend-compatible MatchData JSON file.

    Args:
        task_id:           Unique task UUID from the Celery worker.
        filename:          Original uploaded video filename.
        tracks:            Raw tracks dict from run_analysis().
        team_ball_control: Per-frame numpy array of team possession (1 or 2).
        backend_data_dir:  Absolute path to Backend app/data/ directory.
        home_team_name:    Name for Team 1 (from Upload form).
        away_team_name:    Name for Team 2 (from Upload form).
        fps:               Video frames per second.

    Returns:
        Tuple of (match_id, absolute_json_path).
    """
    # ── Step 1: Run analytics on tracking data ─────────────────────────────
    # IMPORTANT: detect_passes() MUST run first, before assign_ball_touches().
    # main.py already set accurate has_ball flags via PlayerBallAssigner (70px).
    # assign_ball_touches() uses a looser 120px threshold that overwrites
    # has_ball and introduces noise / home-team bias in pass detection.
    passes, turnovers = detect_passes(tracks)

    # Per-player touch & ball-loss stats (runs AFTER pass detection so it
    # doesn't corrupt the has_ball flags used by build_possession_map).
    assign_ball_touches(tracks)
    determine_ball_control(tracks)
    players = build_players(tracks, passes, turnovers)

    # ── Step 2: Compute possession percentages ─────────────────────────────
    team_ball_list = team_ball_control.tolist()
    possessed = sum(1 for t in team_ball_list if t in (1, 2))
    team_1_frames = sum(1 for t in team_ball_list if t == 1)
    team_2_frames = sum(1 for t in team_ball_list if t == 2)

    team_1_pct = round(team_1_frames / possessed * 100, 2) if possessed > 0 else 50.0
    team_2_pct = round(100.0 - team_1_pct, 2)

    # ── Step 3: Build player lookup indices ────────────────────────────────
    player_positions = {
        p["player_id"]: {pos["frame"]: pos for pos in p["positions"]}
        for p in players
    }
    player_avg = {p["player_id"]: p["avg_position"] for p in players}
    player_team = {p["player_id"]: p["team"] for p in players}

    team_id_map = {1: "team_1", 2: "team_2"}
    team_name_map = {1: home_team_name, 2: away_team_name}

    # ── Step 4: Build Backend Pass objects ─────────────────────────────────
    backend_passes = []
    for p in passes:
        sx, sy = _get_player_pos(p["passer_id"], p["frame_start"], player_positions, player_avg)
        ex, ey = _get_player_pos(p["receiver_id"], p["frame_end"], player_positions, player_avg)
        team_id = team_id_map.get(p.get("team"), "team_1")
        backend_passes.append({
            "player_id": str(p["passer_id"]),
            "recipient_id": str(p["receiver_id"]),
            "team_id": team_id,
            "start_x": sx,
            "start_y": sy,
            "end_x": ex,
            "end_y": ey,
            "successful": True,
            "minute": None,
        })

    # ── Step 5: Build Backend Turnover objects ─────────────────────────────
    backend_turnovers = []
    for t in turnovers:
        x, y = _get_player_pos(t["losing_player_id"], t["frame_start"], player_positions, player_avg)
        team_id = team_id_map.get(t.get("losing_team"), "team_1")
        backend_turnovers.append({
            "player_id": str(t["losing_player_id"]),
            "team_id": team_id,
            "x": x,
            "y": y,
            "minute": None,
            "turnover_type": "misplaced_pass",
        })

    # ── Step 6: Build Backend Positions dict ───────────────────────────────
    backend_positions: dict[str, list] = {}
    for p in players:
        pid = str(p["player_id"])
        pos_list = [
            {
                "x": _norm_x(pos["x"]),
                "y": _norm_y(pos["y"]),
                "timestamp": None,
                "minute": pos["frame"],
            }
            for pos in p["positions"]
        ]
        if pos_list:
            backend_positions[pid] = pos_list

    # ── Step 7: Build Possession Segments ─────────────────────────────────
    total_frames = len(tracks.get("players", []))
    actual_duration = round(total_frames / max(fps, 1) / 60, 2)
    team_1_mins = round(team_1_pct / 100 * actual_duration, 2)
    team_2_mins = round(actual_duration - team_1_mins, 2)
    possession_segments = [
        {"team_id": "team_1", "start_minute": 0, "end_minute": team_1_mins},
        {"team_id": "team_2", "start_minute": team_1_mins, "end_minute": actual_duration},
    ]

    # ── Step 8: Build embedded PlayerStats ────────────────────────────────
    # 8a. Compute heatmap zones from position_transformed data
    heatmap_zones = _compute_heatmap_zones(players, tracks)

    backend_players = []
    for p in players:
        pid = str(p["player_id"])
        raw_pid = p["player_id"]  # int key for heatmap lookup
        team = p.get("team", 1)
        team_id = team_id_map.get(team, "team_1")
        team_name = team_name_map.get(team, home_team_name)

        passes_made = int(p["passes_made"])
        turnovers_count = int(p["turnovers"])
        passes_attempted = passes_made + turnovers_count

        # Crude attribute derivation from tracking stats
        avg_speed = float(p.get("avg_speed") or 0)
        distance_covered = float(p.get("distance_covered") or 0)
        speed_attr = min(99, max(40, int(avg_speed * 3.5)))
        pass_attr = min(99, max(40, int((passes_made / passes_attempted * 100) if passes_attempted > 0 else 70)))

        backend_players.append({
            "id": pid,
            "name": f"Player #{p['player_id']}",
            "team_id": team_id,
            "team_name": team_name,
            "position": "Unknown",
            "number": 0,
            "minutes_played": round(len(p.get("positions", [])) / max(fps, 1) / 60, 1),
            "passes_attempted": passes_attempted,
            "passes_completed": passes_made,
            "turnovers": turnovers_count,
            "goals": 0,
            "assists": 0,
            "rating": 7.0,
            "avg_speed_kmh": round(avg_speed, 2),
            "distance_covered_m": round(distance_covered, 2),
            "heatmap_zones": heatmap_zones.get(raw_pid, []),
            "attributes": {
                "speed": speed_attr,
                "dribbling": 70,
                "shooting": 70,
                "passing": pass_attr,
                "defending": 70,
                "physical": 70,
            },
        })

    # ── Step 9: Build metadata stats ──────────────────────────────────────
    home_passes_count = sum(1 for p in passes if p.get("team") == 1)
    away_passes_count = sum(1 for p in passes if p.get("team") == 2)
    home_turnovers_count = sum(1 for t in turnovers if t.get("losing_team") == 1)
    away_turnovers_count = sum(1 for t in turnovers if t.get("losing_team") == 2)

    # Pass accuracy per team
    home_pass_attempted = home_passes_count + home_turnovers_count
    away_pass_attempted = away_passes_count + away_turnovers_count
    home_pass_acc = round(home_passes_count / home_pass_attempted * 100, 1) if home_pass_attempted > 0 else 0
    away_pass_acc = round(away_passes_count / away_pass_attempted * 100, 1) if away_pass_attempted > 0 else 0

    metadata_stats = [
        {"name": "Passes", "home": home_passes_count, "away": away_passes_count},
        {"name": "Turnovers", "home": home_turnovers_count, "away": away_turnovers_count},
        {"name": "Possession", "home": team_1_pct, "away": team_2_pct},
        {"name": "Pass Accuracy", "home": home_pass_acc, "away": away_pass_acc},
    ]

    # ── Step 9b: Compute recommendations ────────────────────────────────────
    total_frames = len(tracks.get("players", []))
    duration_seconds = total_frames / max(fps, 1)
    match_id = task_id

    recommendations = _compute_recommendations(
        backend_players=backend_players,
        team_1_pct=team_1_pct,
        team_2_pct=team_2_pct,
        home_pass_acc=home_pass_acc,
        away_pass_acc=away_pass_acc,
        home_turnovers_count=home_turnovers_count,
        away_turnovers_count=away_turnovers_count,
        home_passes_count=home_passes_count,
        away_passes_count=away_passes_count,
        match_id=match_id,
        home_team_name=home_team_name,
        away_team_name=away_team_name,
        duration_seconds=duration_seconds,
    )

    # ── Log final stats to Celery worker console for debugging ─────────────
    print(f"\n{'='*60}")
    print(f"  AI MODEL OUTPUT — {home_team_name} vs {away_team_name}")
    print(f"  Total frames processed: {total_frames}")
    print(f"{'='*60}")
    for s in metadata_stats:
        print(f"  {s['name']:>15s}:  Home={s['home']}  |  Away={s['away']}")
    print(f"{'='*60}")

    # ── Log heatmap summary ───────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  HEATMAP ZONES (3×3 grid)")
    print(f"{'='*60}")
    for p in backend_players[:10]:
        zones = p.get("heatmap_zones", [])
        if zones:
            zone_str = ", ".join(f"Z{z['zone_id']}({z['percentage']}%)" for z in zones[:3])
            print(f"  {p['name']:>15s}: {zone_str}")
    print(f"{'='*60}")

    # ── Log recommendations summary ──────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  RECOMMENDATIONS — {len(recommendations)} total")
    print(f"{'='*60}")
    for r in recommendations[:10]:
        print(f"  [{r['priority']:>6s}] {r['title']}")
    if len(recommendations) > 10:
        print(f"  ... and {len(recommendations) - 10} more")
    print(f"{'='*60}\n")

    # ── Step 9c: Events array (empty — pass/turnover data in separate arrays) ─
    backend_events = []

    # ── Step 10: Assemble final MatchData JSON ─────────────────────────────
    match_data = {
        "id": match_id,
        "user_id": user_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "home_team": {"id": "team_1", "name": home_team_name, "emoji": "🏠"},
        "away_team": {"id": "team_2", "name": away_team_name, "emoji": "🚌"},
        "home_score": 0,
        "away_score": 0,
        "duration_minutes": round(total_frames / max(fps, 1) / 60, 1),
        "status": "Analyzed",
        "passes": backend_passes,
        "turnovers": backend_turnovers,
        "positions": backend_positions,
        "possession_segments": possession_segments,
        "players": backend_players,
        "recommendations": recommendations,
        "events": backend_events,
        "metadata": {
            "source": "AI Video Analysis",
            "task_id": task_id,
            "original_filename": filename,
            "fps": fps,
            "total_frames": total_frames,
            "team_1_possession": team_1_pct,
            "team_2_possession": team_2_pct,
            "stats": metadata_stats,
        },
    }

    # ── Step 11: Serialise and save ────────────────────────────────────────
    def _json_default(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        raise TypeError(f"Object of type {type(obj)} is not JSON serialisable")

    os.makedirs(backend_data_dir, exist_ok=True)
    file_path = Path(backend_data_dir) / f"{match_id}.json"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(match_data, f, indent=2, default=_json_default)

    print(f"Exported match data → {file_path}")
    return match_id, str(file_path)
