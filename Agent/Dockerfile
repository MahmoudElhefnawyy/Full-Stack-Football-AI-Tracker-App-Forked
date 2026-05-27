FROM python:3.11-slim

# System dependencies for OpenCV, psycopg2, and wget
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libpq-dev \
    gcc \
    wget \
    && rm -rf /var/lib/apt/cache/*

WORKDIR /app

# Install CPU-only PyTorch first to avoid pulling the 2 GB CUDA build
RUN pip install --no-cache-dir torch torchvision \
    --index-url https://download.pytorch.org/whl/cpu

# Copy and install remaining Agent requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install gdown for Google Drive model download
RUN pip install --no-cache-dir gdown

# Pre-download StrongSort ReID weights at build time so the worker
# starts instantly without a cold-download on first task.
# osnet_x0_25_msmt17.pt is ~2.2 MB.
RUN python -c "\
from pathlib import Path; \
from boxmot.trackers.strongsort.strongsort import StrongSort; \
StrongSort(reid_weights=Path('osnet_x0_25_msmt17.pt'), device='cpu', half=False); \
print('ReID weights downloaded successfully.')"

# ── Download YOLO model at build time ────────────────────────────────────────
# best.pt (101.8 MB) — publicly shared on Google Drive
# File ID: 1LwYwMcKMyD4ES_IBbmTigqO8QOlyW8vH
# Placed BEFORE `COPY . .` so Docker caches this layer independently —
# code changes won't trigger a re-download of the model.
RUN mkdir -p football_analysis/models && \
    gdown --id 1LwYwMcKMyD4ES_IBbmTigqO8QOlyW8vH \
          -O football_analysis/models/best.pt && \
    echo "YOLO model ready: $(du -sh football_analysis/models/best.pt)"

# Copy Agent code — COPY merges into existing directories,
# so football_analysis/models/best.pt is preserved.
COPY . .

# Python paths
ENV PYTHONPATH=/app:/app/football_analysis

# YOLO config dir must be writable
ENV YOLO_CONFIG_DIR=/tmp

# Start the Celery worker
CMD ["celery", "-A", "worker.worker_app", "worker", "--loglevel=info", "--concurrency=1"]
