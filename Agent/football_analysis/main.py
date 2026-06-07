from utils import read_video, save_video
from trackers import Tracker
import ctypes
import gc
import cv2
import numpy as np
from team_assigner import TeamAssigner
from player_ball_assigner import PlayerBallAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator
from pipeline_enrichment import (
    add_time_to_tracks,
    add_velocity_to_tracks,
    compute_ball_interpolation_mask,
    apply_interpolation_flags,
    add_ball_state,
    detect_tackles,
    detect_fouls,
)

import os


def _free_memory():
    """Force Python AND the OS to release freed memory.
    gc.collect() alone only marks Python objects as free — the OS still
    counts the pages as used.  malloc_trim(0) asks glibc to return
    those pages, which prevents OOM kills on Railway.
    """
    gc.collect()
    try:
        ctypes.CDLL("libc.so.6").malloc_trim(0)
    except (OSError, AttributeError):
        pass  # not Linux / no glibc


def run_analysis(input_video_path, output_video_path, team_names=None):
    """
    Run the full AI analysis pipeline on a video file.

    Args:
        input_video_path: Absolute path to the input video.
        output_video_path: Absolute path to write the annotated output video.
        team_names: Optional list of two team name strings, e.g. ["Home FC", "Away FC"].
                    Defaults to ["Team A", "Team B"].

    Returns:
        Tuple of (tracks, team_ball_control, enrichment) where:
          - tracks: dict of per-frame tracking data for players, referees, ball
          - team_ball_control: numpy array of frame-level team possession (1 or 2)
          - enrichment: dict with fps, tackles, fouls, total_frames
    """
    if team_names is None:
        team_names = ["Team A", "Team B"]

    # ── Get video FPS for time calculations ────────────────────────────────
    cap = cv2.VideoCapture(input_video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    cap.release()
    print(f"Video FPS: {fps}")

    # Read Video
    video_frames = read_video(input_video_path)

    # ── Resize to 720p if needed to fit within 8 GB Railway limit ──────────
    # 750 frames × 1080p = ~4.7 GB.  At 720p = ~2.1 GB (saves ~2.5 GB).
    # YOLO accuracy is unaffected — it internally resizes to 384×640.
    _MAX_HEIGHT = 720
    h, w = video_frames[0].shape[:2]
    if h > _MAX_HEIGHT:
        scale = _MAX_HEIGHT / h
        new_w, new_h = int(w * scale), _MAX_HEIGHT
        print(f"Resizing {w}×{h} → {new_w}×{new_h} to fit in 8 GB memory...")
        for i in range(len(video_frames)):
            video_frames[i] = cv2.resize(video_frames[i], (new_w, new_h))
        _free_memory()

    # Initialize Tracker
    # Use absolute path relative to this file for production stability
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
    tracker = Tracker(model_path)

    print(f"Analyzing {len(video_frames)} frames...")
    tracks = tracker.get_object_tracks(video_frames, read_from_stub=False)

    # Get object positions
    tracker.add_position_to_tracks(tracks)

    # ── Free YOLO model + StrongSort/ReID (~500 MB) — tracking is done ────
    del tracker.model
    del tracker.tracker
    _free_memory()

    # Camera movement estimator
    print("Estimating camera movement...")
    camera_movement_estimator = CameraMovementEstimator(video_frames[0])
    camera_movement_per_frame = camera_movement_estimator.get_camera_movement(
        video_frames, read_from_stub=False
    )
    camera_movement_estimator.add_adjust_positions_to_tracks(tracks, camera_movement_per_frame)

    # View Transformer (pixel → real-world metres)
    view_transformer = ViewTransformer()
    view_transformer.add_transformed_position_to_tracks(tracks)
    del view_transformer  # no longer needed

    # ── Interpolate Ball Positions (with interpolation mask — Rule 5) ──────
    # Capture which frames had real detections BEFORE interpolation fills gaps
    ball_interpolation_mask = compute_ball_interpolation_mask(tracks)
    tracks["ball"] = tracker.interpolate_ball_positions(tracks["ball"])
    # Tag each ball entry with interpolated=True/False
    apply_interpolation_flags(tracks, ball_interpolation_mask)
    del ball_interpolation_mask  # no longer needed

    # Speed and distance estimator (now uses actual video FPS)
    speed_and_distance_estimator = SpeedAndDistance_Estimator(frame_rate=int(fps))
    speed_and_distance_estimator.add_speed_and_distance_to_tracks(tracks)

    _free_memory()
    print("Models freed — starting team assignment...")

    # Assign Player Teams (no warm-up call needed — rule-based assigner)
    print("Assigning teams...")
    team_assigner = TeamAssigner()

    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team = team_assigner.get_player_team(
                video_frames[frame_num], track['bbox'], player_id
            )
            tracks['players'][frame_num][player_id]['team'] = team
            tracks['players'][frame_num][player_id]['team_color'] = team_assigner.team_colors[team]

    # Assign Ball Acquisition per frame
    print("Detecting ball possession...")
    player_assigner = PlayerBallAssigner()
    team_ball_control = []
    for frame_num, player_track in enumerate(tracks['players']):
        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        assigned_player = player_assigner.assign_ball_to_player(player_track, ball_bbox)

        if assigned_player != -1:
            tracks['players'][frame_num][assigned_player]['has_ball'] = True
            team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
        else:
            # Use previous team if known; 0 means unknown on first frame
            team_ball_control.append(team_ball_control[-1] if len(team_ball_control) > 0 else 0)

    team_ball_control = np.array(team_ball_control)

    # ── Draw output FIRST (before enrichment, to free frames sooner) ──────
    output_video_frames = tracker.draw_annotations(video_frames, tracks, team_ball_control)

    # ── Free raw video frames — no longer needed (~2-4 GB) ─────────────────
    total_frames = len(video_frames)
    del video_frames
    _free_memory()

    output_video_frames = camera_movement_estimator.draw_camera_movement(
        output_video_frames, camera_movement_per_frame
    )
    speed_and_distance_estimator.draw_speed_and_distance(output_video_frames, tracks)

    # Save annotated video
    save_video(output_video_frames, output_video_path)

    # ── Free annotated frames — written to disk (~2-4 GB) ──────────────────
    del output_video_frames
    del camera_movement_per_frame
    _free_memory()
    print("Memory freed after video save.")

    # ── Notion-spec enrichment (runs with only tracks in memory ~50 MB) ────
    print("Running Notion-spec enrichment (time, velocity, ball state, events)...")

    # Rule 2: Every point MUST have time
    add_time_to_tracks(tracks, fps)

    # Velocity vectors: vx, vy, speed_mps, direction_deg
    add_velocity_to_tracks(tracks, fps)

    # Ball state: in_play/out_of_bounds, possessed_by
    add_ball_state(tracks)

    # Event detection: tackles and fouls
    tackles = detect_tackles(tracks, fps=fps)
    fouls = detect_fouls(tracks, fps=fps)
    print(f"  Detected {len(tackles)} tackles, {len(fouls)} possible fouls")

    # ── Build enrichment dict ──────────────────────────────────────────────
    enrichment = {
        "fps": fps,
        "tackles": tackles,
        "fouls": fouls,
        "total_frames": total_frames,
    }

    return tracks, team_ball_control, enrichment


if __name__ == '__main__':
    run_analysis('input_videos/08fd33_4.mp4', 'output_videos/output_video.mp4')