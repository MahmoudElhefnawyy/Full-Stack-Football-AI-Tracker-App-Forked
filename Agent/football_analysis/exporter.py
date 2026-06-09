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
    assign_ball_touches(tracks)
    determine_ball_control(tracks)
    passes, turnovers = detect_passes(tracks)
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
    actual_duration = round(total_frames / max(fps, 1) / 60, 1)
    team_1_mins = round(team_1_pct / 100 * actual_duration)
    team_2_mins = round(actual_duration - team_1_mins, 1)
    possession_segments = [
        {"team_id": "team_1", "start_minute": 0, "end_minute": team_1_mins},
        {"team_id": "team_2", "start_minute": team_1_mins, "end_minute": actual_duration},
    ]

    # ── Step 8: Build embedded PlayerStats ────────────────────────────────
    backend_players = []
    for p in players:
        pid = str(p["player_id"])
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

    # ── Step 9b: Events array (empty — pass/turnover data in separate arrays) ─
    backend_events = []

    # ── Step 10: Assemble final MatchData JSON ─────────────────────────────
    match_id = task_id
    match_data = {
        "id": match_id,
        "user_id": user_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "home_team": {"id": "team_1", "name": home_team_name, "emoji": "🏠"},
        "away_team": {"id": "team_2", "name": away_team_name, "emoji": "🚌"},
        "home_score": 0,
        "away_score": 0,
        "duration_minutes": round(len(tracks.get("players", [])) / max(fps, 1) / 60, 1),
        "status": "Analyzed",
        "passes": backend_passes,
        "turnovers": backend_turnovers,
        "positions": backend_positions,
        "possession_segments": possession_segments,
        "players": backend_players,
        "events": backend_events,
        "metadata": {
            "source": "AI Video Analysis",
            "task_id": task_id,
            "original_filename": filename,
            "fps": fps,
            "total_frames": len(tracks.get("players", [])),
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
