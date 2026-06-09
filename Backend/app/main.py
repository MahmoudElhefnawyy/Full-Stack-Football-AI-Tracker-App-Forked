from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    configure_logging()
    
    # Ensure database tables are created
    from app.core.database import engine, Base
    # Import all models to ensure they are registered with Base
    import app.models.persistence # noqa
    Base.metadata.create_all(bind=engine)

    # Migrate: add user_id column if it doesn't exist (for PostgreSQL)
    from sqlalchemy import text, inspect
    inspector = inspect(engine)
    if "analysis_tasks" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("analysis_tasks")]
        if "user_id" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE analysis_tasks ADD COLUMN user_id VARCHAR"))
            logger.info("Migrated: added user_id column to analysis_tasks")
    
    logger.info(
        "Starting %s v%s [%s]",
        settings.app_name,
        settings.version,
        settings.environment,
    )
    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description="AI-powered football analytics backend",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ──────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routes ──────────────────────────────────────────────────────────────
    app.include_router(api_router)

    # ── Static Files ────────────────────────────────────────────────────────
    from fastapi.staticfiles import StaticFiles
    import os
    media_path = os.path.abspath(settings.media_root)
    os.makedirs(media_path, exist_ok=True)
    app.mount("/api/v1/analysis/results", StaticFiles(directory=media_path), name="results")

    return app


app = create_app()
