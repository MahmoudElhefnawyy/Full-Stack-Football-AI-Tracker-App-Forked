"""Reusable FastAPI dependencies for authentication."""
from __future__ import annotations

from typing import Optional

from fastapi import Header

from app.services import auth_service


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract user_id from the JWT Bearer token.
    Returns empty string if no valid token is present (allows graceful fallback).
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return ""
    token = authorization.split(" ", 1)[1]
    try:
        user_id = auth_service.decode_token(token)
        return user_id
    except Exception:
        return ""


async def require_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Same as get_current_user_id but raises 401 if no valid token.
    """
    from app.core.exceptions import AuthenticationError

    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthenticationError("Authorization header missing or malformed.")
    token = authorization.split(" ", 1)[1]
    user_id = auth_service.decode_token(token)
    return user_id
