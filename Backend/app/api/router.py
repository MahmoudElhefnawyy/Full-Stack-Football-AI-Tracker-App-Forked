from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import health, matches, players, teams, recommendations, upload, auth, analysis

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
api_router.include_router(players.router, prefix="/players", tags=["Players"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
