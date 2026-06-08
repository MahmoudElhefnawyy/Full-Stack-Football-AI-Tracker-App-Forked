"""
pipeline_enrichment.py — Notion JSON spec enrichment functions.

These functions run AFTER the existing tracking pipeline and BEFORE export.
They add time, velocity, interpolation flags, ball state, and event detection
to the tracks dict, in compliance with the Notion "JSON formats" specification.

All functions mutate `tracks` in-place (consistent with existing pipeline pattern).
"""
from __future__ import annotations

import math
from typing import Optional


# ── Rule 2: Every point MUST have time ────────────────────────────────────────

def add_time_to_tracks(tracks: dict, fps: float = 24.0) -> None:
    """
    Add `time` (seconds) and `frame` number to every tracking entry.
    Rule 2: Frame alone = dangerous. Time = universal truth.
    """
    for object_type in ("players", "referees", "ball"):
        for frame_num, frame_data in enumerate(tracks[object_type]):
            time_sec = round(frame_num / fps, 3)
            for track_id in frame_data:
                tracks[object_type][frame_num][track_id]["time"] = time_sec
                tracks[object_type][frame_num][track_id]["frame"] = frame_num


# ── Velocity vectors (vx, vy, direction_deg, speed_mps) ──────────────────────

def add_velocity_to_tracks(tracks: dict, fps: float = 24.0) -> None:
    """
    Compute per-frame velocity from consecutive `position_transformed` deltas.

    Adds to each player tracking entry:
      - vx:            m/s in the X direction
      - vy:            m/s in the Y direction
      - speed_mps:     magnitude of velocity (m/s)
      - direction_deg: heading in degrees (0-360, 0 = right, 90 = down)
    """
    dt = 1.0 / fps

    # Frame 0: no previous frame, set zero velocity
    if tracks["players"]:
        for track_id, track_info in tracks["players"][0].items():
            track_info["vx"] = 0.0
            track_info["vy"] = 0.0
            track_info["speed_mps"] = 0.0
            track_info["direction_deg"] = 0.0

    for frame_num in range(1, len(tracks["players"])):
        prev_frame = tracks["players"][frame_num - 1]
        curr_frame = tracks["players"][frame_num]

        for track_id, track_info in curr_frame.items():
            pos = track_info.get("position_transformed")
            prev_info = prev_frame.get(track_id)
            prev_pos = prev_info.get("position_transformed") if prev_info else None

            if pos is not None and prev_pos is not None:
                vx = (pos[0] - prev_pos[0]) / dt
                vy = (pos[1] - prev_pos[1]) / dt
                speed_mps = math.sqrt(vx ** 2 + vy ** 2)

                # Cap unrealistic speeds (> 12 m/s ≈ 43 km/h is sprint max)
                if speed_mps > 15.0:
                    vx = 0.0
                    vy = 0.0
                    speed_mps = 0.0

                direction = math.degrees(math.atan2(vy, vx)) % 360

                track_info["vx"] = round(vx, 3)
                track_info["vy"] = round(vy, 3)
                track_info["speed_mps"] = round(speed_mps, 3)
                track_info["direction_deg"] = round(direction, 1)
            else:
                track_info["vx"] = 0.0
                track_info["vy"] = 0.0
                track_info["speed_mps"] = 0.0
                track_info["direction_deg"] = 0.0


# ── Rule 5: Interpolation must be visible ─────────────────────────────────────

def compute_ball_interpolation_mask(tracks: dict) -> list[bool]:
    """
    Call BEFORE tracker.interpolate_ball_positions() to record which
    ball frames have genuine YOLO detections (True) vs gaps (False).
    """
    mask = []
    for frame_data in tracks["ball"]:
        # A real detection has a non-empty bbox under key 1
        has_real = bool(
            frame_data
            and 1 in frame_data
            and frame_data[1].get("bbox")
            and any(v != 0 for v in frame_data[1]["bbox"])
        )
        mask.append(has_real)
    return mask


def apply_interpolation_flags(tracks: dict, mask: list[bool]) -> None:
    """
    Call AFTER tracker.interpolate_ball_positions() to tag each ball frame.

    - Real detections:   interpolated=False, confidence preserved
    - Interpolated gaps: interpolated=True,  confidence=0.0
    """
    for frame_num, frame_data in enumerate(tracks["ball"]):
        if 1 in frame_data:
            if frame_num < len(mask):
                is_real = mask[frame_num]
            else:
                is_real = False

            frame_data[1]["interpolated"] = not is_real

            if is_real:
                # Keep existing confidence from detector, default 0.9
                frame_data[1].setdefault("confidence", 0.9)
            else:
                frame_data[1]["confidence"] = 0.0


# ── Ball state tracking ───────────────────────────────────────────────────────

def add_ball_state(tracks: dict) -> None:
    """
    Add `state` and `possessed_by` to every ball tracking entry.

    - state:        "in_play" if position_transformed is within pitch, else "out_of_bounds"
    - possessed_by: {player_id, team_id} of the player with has_ball=True, or None
    """
    for frame_num in range(len(tracks["ball"])):
        ball = tracks["ball"][frame_num].get(1)
        if ball is None:
            continue

        # Determine possession from player data
        possessor_id = None
        possessor_team = None
        if frame_num < len(tracks["players"]):
            for pid, pinfo in tracks["players"][frame_num].items():
                if pinfo.get("has_ball", False):
                    possessor_id = pid
                    possessor_team = pinfo.get("team")
                    break

        if possessor_id is not None:
            ball["possessed_by"] = {
                "player_id": possessor_id,
                "team_id": possessor_team,
            }
        else:
            ball["possessed_by"] = None

        # Ball state based on whether position is within pitch bounds
        pos = ball.get("position_transformed")
        if pos is None:
            ball["state"] = "out_of_bounds"
        else:
            ball["state"] = "in_play"


# ── Event Detection: Tackles ──────────────────────────────────────────────────

def detect_tackles(
    tracks: dict,
    fps: float = 24.0,
    distance_threshold_m: float = 1.5,
) -> list[dict]:
    """
    Detect tackles using the Notion rule-based approach:
      - Two players from opposing teams within 1.5 metres
      - Ball possession switches between them

    Returns:
        List of tackle event dicts matching the Notion schema.
    """
    tackles: list[dict] = []

    for frame_num in range(1, len(tracks["players"])):
        prev_frame = tracks["players"][frame_num - 1]
        curr_frame = tracks["players"][frame_num]

        # Who had ball last frame vs this frame?
        prev_owner = None
        prev_team = None
        for pid, p in prev_frame.items():
            if p.get("has_ball"):
                prev_owner = pid
                prev_team = p.get("team")
                break

        curr_owner = None
        curr_team = None
        for pid, p in curr_frame.items():
            if p.get("has_ball"):
                curr_owner = pid
                curr_team = p.get("team")
                break

        # Need: different players, different teams
        if (
            prev_owner is None
            or curr_owner is None
            or prev_owner == curr_owner
            or prev_team == curr_team
        ):
            continue

        # Check distance between the two players
        pos_winner = curr_frame.get(curr_owner, {}).get("position_transformed")
        # Loser might still be in current frame or only in previous
        loser_info = curr_frame.get(prev_owner) or prev_frame.get(prev_owner, {})
        pos_loser = loser_info.get("position_transformed")

        if pos_winner is not None and pos_loser is not None:
            dist = math.sqrt(
                (pos_winner[0] - pos_loser[0]) ** 2
                + (pos_winner[1] - pos_loser[1]) ** 2
            )
            if dist < distance_threshold_m:
                tackles.append(
                    {
                        "id": f"tackle_{len(tackles) + 1:04d}",
                        "type": "tackle",
                        "frame": frame_num,
                        "time": round(frame_num / fps, 3),
                        "location": {
                            "x": round(pos_winner[0], 1),
                            "y": round(pos_winner[1], 1),
                        },
                        "players": {
                            "winner": curr_owner,
                            "loser": prev_owner,
                        },
                        "confidence": round(
                            max(0, 1.0 - dist / distance_threshold_m), 2
                        ),
                    }
                )

    return tackles


# ── Event Detection: Fouls ────────────────────────────────────────────────────

def detect_fouls(
    tracks: dict,
    fps: float = 24.0,
    distance_threshold_m: float = 1.0,
    speed_drop_threshold: float = 2.0,
) -> list[dict]:
    """
    Detect possible fouls using the Notion rule-based approach:
      - Two opposing players within 1.0 metre
      - Sudden speed drop (> 3.0 m/s between consecutive frames)
      - Ball NOT cleanly won by the defender

    Returns:
        List of foul event dicts matching the Notion schema.
    """
    fouls: list[dict] = []
    # Deduplication: track the last foul frame per player pair (attacker, victim)
    # to avoid firing 20+ events for a single 1-second contact
    _dedup_window = int(fps)  # 1 second worth of frames
    _last_foul_frame: dict[tuple, int] = {}

    for frame_num in range(2, len(tracks["players"])):
        curr_frame = tracks["players"][frame_num]
        prev_frame = tracks["players"][frame_num - 1]

        for pid_victim, info_victim in curr_frame.items():
            pos_victim = info_victim.get("position_transformed")
            speed_curr = info_victim.get("speed_mps", 0)
            prev_victim = prev_frame.get(pid_victim, {})
            speed_prev = prev_victim.get("speed_mps", 0)

            if pos_victim is None:
                continue

            # Check for sudden speed drop on this player
            speed_drop = speed_prev - speed_curr
            if speed_drop < speed_drop_threshold:
                continue

            # Find a nearby opponent
            for pid_attacker, info_attacker in curr_frame.items():
                if pid_attacker == pid_victim:
                    continue
                # Must be different team
                if info_attacker.get("team") == info_victim.get("team"):
                    continue

                pos_attacker = info_attacker.get("position_transformed")
                if pos_attacker is None:
                    continue

                dist = math.sqrt(
                    (pos_victim[0] - pos_attacker[0]) ** 2
                    + (pos_victim[1] - pos_attacker[1]) ** 2
                )

                if dist < distance_threshold_m:
                    # Dedup: skip if same pair had a foul within 1 second
                    pair_key = (min(pid_attacker, pid_victim), max(pid_attacker, pid_victim))
                    last_frame = _last_foul_frame.get(pair_key, -9999)
                    if frame_num - last_frame < _dedup_window:
                        break  # Skip — same incident

                    # Check ball not cleanly won by attacker
                    ball_owner = None
                    for p, i in curr_frame.items():
                        if i.get("has_ball"):
                            ball_owner = p
                            break

                    if ball_owner != pid_attacker:
                        _last_foul_frame[pair_key] = frame_num
                        fouls.append(
                            {
                                "id": f"foul_{len(fouls) + 1:04d}",
                                "type": "possible_foul",
                                "frame": frame_num,
                                "time": round(frame_num / fps, 3),
                                "location": {
                                    "x": round(pos_victim[0], 1),
                                    "y": round(pos_victim[1], 1),
                                },
                                "players": {
                                    "attacker": pid_attacker,
                                    "defender": pid_victim,
                                },
                                "confidence": round(
                                    min(1.0, speed_drop / 10.0), 2
                                ),
                            }
                        )
                        break  # One foul per victim per frame

    return fouls
