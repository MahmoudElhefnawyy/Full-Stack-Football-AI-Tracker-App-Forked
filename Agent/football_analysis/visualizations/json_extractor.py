import numpy as np


# ── Ball Touch Assignment ─────────────────────────────────────────────────────

def assign_ball_touches(tracks, distance_threshold=120):
    """
    Mark players as having the ball if they are within distance_threshold
    pixels of the ball centre in a given frame.
    Mutates tracks in-place.
    """
    for frame_num, player_track in enumerate(tracks['players']):
        if not tracks['ball'][frame_num] or 1 not in tracks['ball'][frame_num]:
            continue

        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        ball_x = (ball_bbox[0] + ball_bbox[2]) / 2
        ball_y = (ball_bbox[1] + ball_bbox[3]) / 2

        for player_id, track in player_track.items():
            player_bbox = track.get('bbox', [])
            if not player_bbox:
                continue

            player_x = (player_bbox[0] + player_bbox[2]) / 2
            player_y = (player_bbox[1] + player_bbox[3]) / 2
            distance = np.sqrt((ball_x - player_x) ** 2 + (ball_y - player_y) ** 2)

            if distance < distance_threshold:
                tracks['players'][frame_num][player_id]['has_ball'] = True
                tracks['players'][frame_num][player_id]['touches'] = track.get('touches', 0) + 1
            else:
                tracks['players'][frame_num][player_id]['has_ball'] = False


# ── Ball Loss Detection ───────────────────────────────────────────────────────

def determine_ball_control(tracks):
    """
    Detect ball loss events (possession change between players).
    Increments a 'ball_loss' counter on the frame where possession changed.
    Mutates tracks in-place.
    """
    previous_player_with_ball = None
    previous_team_with_ball = None

    for frame_num, player_track in enumerate(tracks['players']):
        current_player_id = None
        current_team = None

        for player_id, track in player_track.items():
            if track.get('has_ball', False):
                current_player_id = player_id
                current_team = track.get('team', None)
                break

        if previous_player_with_ball is not None and current_team != previous_team_with_ball:
            frame = tracks['players'][frame_num - 1]
            if previous_player_with_ball in frame:
                previous = frame[previous_player_with_ball]
                previous['ball_loss'] = previous.get('ball_loss', 0) + 1

        previous_player_with_ball = current_player_id
        previous_team_with_ball = current_team


# ── Temporal-Smoothed Possession Map ──────────────────────────────────────────

def build_possession_map(tracks, min_frames=6, max_loose_frames=15):
    """
    Build a frame-level possession map with temporal smoothing.

    A new possessor must hold the ball for at least `min_frames` consecutive
    frames before being registered.  If nobody is detected near the ball for
    `max_loose_frames`, possession resets.

    Returns:
        dict[int, dict]: frame_num → {"player_id": int, "team_id": int}
    """
    player_tracks = tracks.get("players", [])
    result = {}

    active_possessor = None   # confirmed possessor
    loose_counter = 0

    candidate_id = None
    candidate_team = None
    candidate_count = 0

    for frame_num, frame_data in enumerate(player_tracks):
        detected_id = None
        detected_team = None

        for player_id, track in frame_data.items():
            if track.get("has_ball"):
                detected_id = player_id
                detected_team = int(track.get("team", 0))
                break

        if detected_id is not None:
            loose_counter = 0
            if active_possessor is None or active_possessor["player_id"] != detected_id:
                if candidate_id == detected_id:
                    candidate_count += 1
                    if candidate_count >= min_frames:
                        active_possessor = {"player_id": detected_id, "team_id": detected_team}
                        candidate_id = None
                        candidate_count = 0
                else:
                    candidate_id = detected_id
                    candidate_team = detected_team
                    candidate_count = 1
            else:
                # Same player still holding — reset candidate
                candidate_id = None
                candidate_count = 0
        else:
            candidate_id = None
            candidate_count = 0
            loose_counter += 1
            if loose_counter >= max_loose_frames:
                active_possessor = None

        if active_possessor is not None:
            result[frame_num] = active_possessor

    return result


# ── Pass & Turnover Detection ─────────────────────────────────────────────────

def detect_passes(tracks, distance_threshold=120, release_frames=3):
    """
    Detect passes (same-team possession transfer) and turnovers
    (cross-team possession transfer) using the temporal-smoothed
    possession map.

    Returns:
        passes: list of dicts with keys: frame_start, frame_end,
                passer_id, receiver_id, team
        turnovers: list of dicts with keys: frame_start, frame_end,
                   losing_player_id, gaining_player_id,
                   losing_team, gaining_team
    """
    possession_map = build_possession_map(tracks)
    passes = []
    turnovers = []

    prev_possessor = None
    prev_team = None
    prev_frame = None

    for frame_num in sorted(possession_map.keys()):
        poss = possession_map[frame_num]
        current_possessor = poss["player_id"]
        current_team = poss["team_id"]

        if (
            prev_possessor is not None
            and current_possessor is not None
            and current_possessor != prev_possessor
        ):
            if prev_team == current_team:
                passes.append({
                    "frame_start": prev_frame,
                    "frame_end": frame_num,
                    "passer_id": prev_possessor,
                    "receiver_id": current_possessor,
                    "team": current_team,
                })
            else:
                turnovers.append({
                    "frame_start": prev_frame,
                    "frame_end": frame_num,
                    "losing_player_id": prev_possessor,
                    "gaining_player_id": current_possessor,
                    "losing_team": prev_team,
                    "gaining_team": current_team,
                })

        prev_possessor = current_possessor
        prev_team = current_team
        prev_frame = frame_num

    return passes, turnovers


# ── Player Data Builder ───────────────────────────────────────────────────────

def build_players(tracks, passes, turnovers):
    """
    Aggregate per-player statistics across all frames.

    Returns:
        list of player dicts containing id, team, speed, distance,
        touches, ball_loss, passes_made, passes_received, turnovers,
        avg_position (metres), and positions list.
    """
    players = []

    all_player_ids = set()
    for frame_data in tracks['players']:
        all_player_ids.update(frame_data.keys())

    for track_id in all_player_ids:
        # Use the last frame appearance for accumulated speed/distance totals
        track_info = {}
        for frame_data in reversed(tracks['players']):
            if track_id in frame_data:
                track_info = frame_data[track_id]
                break

        # Collect real-world positions (metres, 0-23.32 × 0-68)
        positions = []
        for frame_num, frame_data in enumerate(tracks['players']):
            if track_id in frame_data:
                pos = frame_data[track_id].get('position_transformed')
                if pos is not None and isinstance(pos, (list, tuple)) and len(pos) == 2:
                    x, y = pos[0], pos[1]
                    if 0 <= x <= 105 and 0 <= y <= 68:
                        positions.append({"frame": frame_num, "x": x, "y": y})

        avg_x = round(float(np.mean([p["x"] for p in positions])), 2) if positions else 0.0
        avg_y = round(float(np.mean([p["y"] for p in positions])), 2) if positions else 0.0

        passes_made = sum(1 for p in passes if p["passer_id"] == track_id)
        passes_received = sum(1 for p in passes if p["receiver_id"] == track_id)
        turnovers_count = sum(1 for t in turnovers if t["losing_player_id"] == track_id)

        players.append({
            "player_id": track_id,
            "team": track_info.get("team", 0),
            "ball_control": track_info.get("has_ball", False),
            "avg_speed": track_info.get("speed", 0),
            "distance_covered": track_info.get("distance", 0),
            "touches": track_info.get("touches", 0),
            "ball_loss": track_info.get("ball_loss", 0),
            "passes_made": passes_made,
            "passes_received": passes_received,
            "turnovers": turnovers_count,
            "avg_position": {"x": avg_x, "y": avg_y},
            "positions": positions,
        })

    return players
