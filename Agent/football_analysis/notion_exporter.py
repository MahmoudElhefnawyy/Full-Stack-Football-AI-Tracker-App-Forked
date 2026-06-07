"""
notion_exporter.py — Export tracking data in the Notion JSON format specification.

Produces the structured JSON files defined in the Notion "JSON formats" document:
  - raw_tracking.json  → metadata + players + ball + teams
  - events.json        → all detected game events (passes, turnovers, tackles, fouls)
  - stats.json         → computed match statistics

These files are saved locally on the Agent volume for audit/engineering use.
They are NOT pushed to the Backend API (the existing exporter.py handles that).
"""
from __future__ import annotations

import json
import os
from typing import Optional

import numpy as np


# ── Pitch constants from ViewTransformer ──────────────────────────────────────
_PITCH_LENGTH_M = 23.32  # visible pitch section (X axis)
_PITCH_WIDTH_M = 68.0    # visible pitch section (Y axis)


def _json_default(obj):
    """Handle numpy types in JSON serialisation."""
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj)} is not JSON serialisable")


def _build_metadata(
    match_id: str,
    fps: float,
    total_frames: int,
) -> dict:
    """Build the Notion-spec metadata section (Section 1)."""
    return {
        "match_id": match_id,
        "fps": round(fps, 2),
        "duration_seconds": round(total_frames / fps, 2),
        "pitch": {
            "length_m": _PITCH_LENGTH_M,
            "width_m": _PITCH_WIDTH_M,
        },
        "coordinate_system": {
            "type": "metric",
            "origin": "top_left",
            "x_direction": "right",
            "y_direction": "down",
        },
        "homography_applied": True,
    }


def _build_players_section(tracks: dict) -> list[dict]:
    """
    Build the Notion-spec players section (Section 2).
    Converts per-frame tracks into per-player tracking arrays.
    """
    # Collect all player IDs and their per-frame data
    player_frames: dict[int, list[dict]] = {}
    player_teams: dict[int, int] = {}

    for frame_num, frame_data in enumerate(tracks["players"]):
        for track_id, info in frame_data.items():
            if track_id not in player_frames:
                player_frames[track_id] = []
                player_teams[track_id] = info.get("team", 0)

            pos = info.get("position_transformed")
            if pos is None:
                continue

            entry = {
                "frame": info.get("frame", frame_num),
                "time": info.get("time", round(frame_num / 24.0, 3)),
                "x": round(float(pos[0]), 3),
                "y": round(float(pos[1]), 3),
                "speed_mps": info.get("speed_mps", 0.0),
                "velocity": {
                    "vx": info.get("vx", 0.0),
                    "vy": info.get("vy", 0.0),
                },
                "confidence": info.get("confidence", 0.9),
                "interpolated": False,  # Player tracks are not interpolated in current pipeline
                "direction_deg": info.get("direction_deg", 0.0),
            }
            player_frames[track_id].append(entry)

    # Build the final players list
    players = []
    for pid in sorted(player_frames.keys()):
        tracking = player_frames[pid]
        if not tracking:
            continue

        players.append({
            "id": int(pid),
            "team_id": int(player_teams.get(pid, 0)),
            "jersey_number": 0,  # YOLO doesn't detect jersey numbers
            "tracking": tracking,
        })

    return players


def _build_ball_section(tracks: dict) -> dict:
    """
    Build the Notion-spec ball section (Section 3).
    Converts per-frame ball tracks into a flat tracking array.
    """
    tracking = []
    for frame_num, frame_data in enumerate(tracks["ball"]):
        ball = frame_data.get(1)
        if ball is None:
            continue

        pos = ball.get("position_transformed")
        if pos is not None:
            x, y = round(float(pos[0]), 3), round(float(pos[1]), 3)
        else:
            # Fall back to bbox center (pixels) if no transformed position
            bbox = ball.get("bbox", [0, 0, 0, 0])
            x = round((bbox[0] + bbox[2]) / 2, 1)
            y = round((bbox[1] + bbox[3]) / 2, 1)

        possessed_by = ball.get("possessed_by")
        if possessed_by is not None:
            possessed_by = {
                "player_id": int(possessed_by["player_id"]) if possessed_by["player_id"] is not None else None,
                "team_id": int(possessed_by["team_id"]) if possessed_by["team_id"] is not None else None,
            }

        entry = {
            "frame": ball.get("frame", frame_num),
            "time": ball.get("time", round(frame_num / 24.0, 3)),
            "x": x,
            "y": y,
            "confidence": ball.get("confidence", 0.0),
            "interpolated": ball.get("interpolated", False),
            "state": ball.get("state", "unknown"),
            "possessed_by": possessed_by,
        }
        tracking.append(entry)

    return {"tracking": tracking}


def _build_events_section(
    passes: list[dict],
    turnovers: list[dict],
    tackles: list[dict],
    fouls: list[dict],
    fps: float,
) -> list[dict]:
    """
    Build the Notion-spec events section (Section 4).
    Merges all event types into a single chronologically sorted list.
    """
    events = []

    # Convert passes to Notion event format
    for i, p in enumerate(passes):
        events.append({
            "id": f"pass_{i + 1:04d}",
            "type": "pass",
            "frame": p.get("frame_start", 0),
            "time": round(p.get("frame_start", 0) / fps, 3),
            "location": None,  # Pass locations derived at export in exporter.py
            "players": {
                "primary": p.get("passer_id"),
                "secondary": p.get("receiver_id"),
            },
            "confidence": 0.85,
        })

    # Convert turnovers to Notion event format
    for i, t in enumerate(turnovers):
        events.append({
            "id": f"turnover_{i + 1:04d}",
            "type": "turnover",
            "frame": t.get("frame_start", 0),
            "time": round(t.get("frame_start", 0) / fps, 3),
            "location": None,
            "players": {
                "primary": t.get("losing_player_id"),
                "secondary": t.get("gaining_player_id"),
            },
            "confidence": 0.80,
        })

    # Tackles and fouls are already in Notion format from pipeline_enrichment
    events.extend(tackles)
    events.extend(fouls)

    # Sort all events chronologically
    events.sort(key=lambda e: e.get("frame", 0))

    return events


def _build_stats_section(
    tracks: dict,
    team_ball_control: np.ndarray,
    passes: list[dict],
    turnovers: list[dict],
    tackles: list[dict],
    fouls: list[dict],
) -> dict:
    """
    Build the Notion-spec stats section (computed, NOT raw — Rule 1).
    """
    team_ball_list = team_ball_control.tolist()
    total_possessed = sum(1 for t in team_ball_list if t in (1, 2))
    team_1_frames = sum(1 for t in team_ball_list if t == 1)
    team_2_frames = sum(1 for t in team_ball_list if t == 2)

    team_1_pct = round(team_1_frames / total_possessed * 100, 2) if total_possessed > 0 else 50.0
    team_2_pct = round(100.0 - team_1_pct, 2)

    team_1_passes = sum(1 for p in passes if p.get("team") == 1)
    team_2_passes = sum(1 for p in passes if p.get("team") == 2)

    team_1_turnovers = sum(1 for t in turnovers if t.get("losing_team") == 1)
    team_2_turnovers = sum(1 for t in turnovers if t.get("losing_team") == 2)

    # Tackle/foul counts by team (winner/attacker team)
    team_1_tackles = 0
    team_2_tackles = 0
    for t in tackles:
        winner = t["players"]["winner"]
        # Look up winner's team from the tracks at the tackle frame
        frame = t.get("frame", 0)
        if frame < len(tracks["players"]):
            winner_info = tracks["players"][frame].get(winner, {})
            if winner_info.get("team") == 1:
                team_1_tackles += 1
            else:
                team_2_tackles += 1

    team_1_fouls = 0
    team_2_fouls = 0
    for f in fouls:
        attacker = f["players"]["attacker"]
        frame = f.get("frame", 0)
        if frame < len(tracks["players"]):
            attacker_info = tracks["players"][frame].get(attacker, {})
            if attacker_info.get("team") == 1:
                team_1_fouls += 1
            else:
                team_2_fouls += 1

    return {
        "possession": {"team_1": team_1_pct, "team_2": team_2_pct},
        "passes": {"team_1": team_1_passes, "team_2": team_2_passes},
        "turnovers": {"team_1": team_1_turnovers, "team_2": team_2_turnovers},
        "tackles": {"team_1": team_1_tackles, "team_2": team_2_tackles},
        "fouls": {"team_1": team_1_fouls, "team_2": team_2_fouls},
    }


# ── Public API ────────────────────────────────────────────────────────────────

def export_notion_json(
    tracks: dict,
    team_ball_control: np.ndarray,
    events: dict,
    fps: float,
    output_dir: str,
    team_names: list[str],
    match_id: str,
) -> str:
    """
    Export tracking data into the Notion-spec JSON format.

    Creates three files:
      - raw_tracking.json  (metadata + players + ball + teams)
      - events.json        (all game events)
      - stats.json         (computed statistics)

    Args:
        tracks:             Enriched tracks dict from the pipeline.
        team_ball_control:  Per-frame team possession array.
        events:             Dict with keys: tackles, fouls, fps, total_frames.
        fps:                Video frames per second.
        output_dir:         Directory to write the JSON files.
        team_names:         [home_name, away_name].
        match_id:           Unique match identifier.

    Returns:
        Path to the output directory.
    """
    os.makedirs(output_dir, exist_ok=True)

    # Import analytics from json_extractor (same functions used by exporter.py)
    from visualizations.json_extractor import (
        assign_ball_touches,
        determine_ball_control,
        detect_passes,
    )

    # Run analytics (these may have already been called by exporter, but they
    # are idempotent — running them again is safe)
    assign_ball_touches(tracks)
    determine_ball_control(tracks)
    passes, turnovers = detect_passes(tracks)

    tackles = events.get("tackles", [])
    fouls = events.get("fouls", [])
    total_frames = events.get("total_frames", len(tracks["players"]))

    # ── 1. raw_tracking.json ──────────────────────────────────────────────
    raw_tracking = {
        "metadata": _build_metadata(match_id, fps, total_frames),
        "players": _build_players_section(tracks),
        "ball": _build_ball_section(tracks),
        "teams": [
            {"id": 1, "name": team_names[0] if len(team_names) > 0 else "Team A"},
            {"id": 2, "name": team_names[1] if len(team_names) > 1 else "Team B"},
        ],
    }

    raw_path = os.path.join(output_dir, "raw_tracking.json")
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(raw_tracking, f, indent=2, default=_json_default)
    print(f"[Notion Export] raw_tracking.json → {raw_path}")

    # ── 2. events.json ────────────────────────────────────────────────────
    events_data = {
        "events": _build_events_section(passes, turnovers, tackles, fouls, fps),
    }

    events_path = os.path.join(output_dir, "events.json")
    with open(events_path, "w", encoding="utf-8") as f:
        json.dump(events_data, f, indent=2, default=_json_default)
    print(f"[Notion Export] events.json → {events_path}")

    # ── 3. stats.json ─────────────────────────────────────────────────────
    stats_data = _build_stats_section(
        tracks, team_ball_control, passes, turnovers, tackles, fouls
    )

    stats_path = os.path.join(output_dir, "stats.json")
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats_data, f, indent=2, default=_json_default)
    print(f"[Notion Export] stats.json → {stats_path}")

    print(f"[Notion Export] Complete — 3 files written to {output_dir}")
    return output_dir
