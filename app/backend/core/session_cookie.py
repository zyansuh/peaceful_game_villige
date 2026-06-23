"""HttpOnly JWT session cookie helpers."""

import os
from datetime import datetime, timezone

from fastapi import Response

AUTH_COOKIE_NAME = "gamema_access_token"


def get_jwt_secret() -> str:
    return (
        os.environ.get("JWT_SECRET_KEY")
        or os.environ.get("JWT_SECRET")
        or ""
    ).strip()


def is_secure_cookie() -> bool:
    flag = os.environ.get("COOKIE_SECURE", "").lower()
    if flag in ("1", "true", "yes"):
        return True
    if flag in ("0", "false", "no"):
        return False
    return os.environ.get("FRONTEND_URL", "").startswith("https://")


def set_auth_cookie(response: Response, token: str, expires_at: datetime) -> None:
    max_age = max(0, int((expires_at - datetime.now(timezone.utc)).total_seconds()))
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=is_secure_cookie(),
        samesite="lax",
        path="/",
        max_age=max_age,
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=is_secure_cookie(),
        samesite="lax",
    )
