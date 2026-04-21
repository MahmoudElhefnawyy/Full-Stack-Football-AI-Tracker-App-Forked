from __future__ import annotations

import os
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "football_analytics",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

# Important: This will allow us to auto-discover tasks if we put them in a specific module
# celery_app.autodiscover_tasks(['app.tasks'])
