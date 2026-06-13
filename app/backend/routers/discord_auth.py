import logging
import secrets

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from services.auth import AuthService
from core.discord_config import is_discord_configured
from services.discord_auth import (
    DiscordAuthError,
    build_discord_authorize_url,
    build_frontend_error_redirect,
    complete_discord_login,
)
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/auth/discord", tags=["discord-auth"])
logger = logging.getLogger(__name__)


@router.get("/login")
async def discord_login(db: AsyncSession = Depends(get_db)):
    """Redirect to Discord OAuth2 authorize URL."""
    if not is_discord_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Discord OAuth가 설정되지 않았습니다. DISCORD_CLIENT_ID/SECRET을 확인하세요.",
        )

    state = secrets.token_urlsafe(32)
    auth_service = AuthService(db)
    await auth_service.store_oidc_state(state, secrets.token_urlsafe(16), "")

    return RedirectResponse(url=build_discord_authorize_url(state), status_code=status.HTTP_302_FOUND)


@router.get("/callback")
async def discord_callback(
    code: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Handle Discord OAuth callback, issue JWT, redirect to frontend."""
    if error:
        return RedirectResponse(
            url=build_frontend_error_redirect(f"Discord 로그인 거부: {error}"),
            status_code=status.HTTP_302_FOUND,
        )

    if not code or not state:
        return RedirectResponse(
            url=build_frontend_error_redirect("Discord 로그인 응답이 올바르지 않습니다."),
            status_code=status.HTTP_302_FOUND,
        )

    auth_service = AuthService(db)
    stored = await auth_service.get_and_delete_oidc_state(state)
    if not stored:
        return RedirectResponse(
            url=build_frontend_error_redirect("로그인 세션이 만료되었습니다. 다시 시도해 주세요."),
            status_code=status.HTTP_302_FOUND,
        )

    try:
        redirect_url = await complete_discord_login(db, code)
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)
    except DiscordAuthError as exc:
        logger.warning("[discord] callback failed: %s", exc.message)
        return RedirectResponse(
            url=build_frontend_error_redirect(exc.message),
            status_code=status.HTTP_302_FOUND,
        )
    except Exception as exc:
        logger.exception("[discord] unexpected callback error: %s", exc)
        return RedirectResponse(
            url=build_frontend_error_redirect("로그인 처리 중 오류가 발생했습니다."),
            status_code=status.HTTP_302_FOUND,
        )
