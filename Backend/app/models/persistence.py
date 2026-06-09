from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, DateTime, Enum, JSON, Integer
from app.core.database import Base


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"


class AnalysisTask(Base):
    __tablename__ = "analysis_tasks"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    user_id = Column(String, nullable=True, index=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    input_path = Column(String)
    output_path = Column(String)
    result_data = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MatchPersistence(Base):
    """Stores the final analysis results for the match model."""
    __tablename__ = "matches_persistence"

    id = Column(String, primary_key=True, index=True)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
