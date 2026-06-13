import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import httpx
from core.discord_config import (
    get_discord_client_id,
    get_discord_client_secret,
    get_discord_guild_id,
    get_discord_redirect_uri,
    get_frontend_url,
    is_discord_configured,
    is_guild_check_enabled,
)
from core.staff_discord_ids import resolve_role_for_discord_id
from models.auth import User
from services.auth import AuthService
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

DISCORD_API = "https://discord.com/api"
DISCORD_AUTHORIZE = "https://discord.com/api/oauth2/authorize"
DISCORD_TOKEN = f"{DISCORD_API}/oauth2/token"
DISCORD_SCOPES = "identify guilds"


class DiscordAuthError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def build_discord_authorize_url(state: str) -> str:
    params = urlencode(
        {
            "client_id": get_discord_client_id(),
            "redirect_uri": get_discord_redirect_uri(),
            "response_type": "code",
            "scope": DISCORD_SCOPES,
            "state": state,
            "prompt": "consent",
        }
    )
    return f"{DISCORD_AUTHORIZE}?{params}"


def build_frontend_error_redirect(message: str) -> str:
    return f"{get_frontend_url()}/login?{urlencode({'error': message})}"


def build_frontend_success_redirect(token: str, expires_at: int) -> str:
    return f"{get_frontend_url()}/auth/callback?{urlencode({'token': token, 'expires_at': str(expires_at)})}"


async def exchange_code_for_token(code: str) -> Dict[str, Any]:
    data = {
        "client_id": get_discord_client_id(),
        "client_secret": get_discord_client_secret(),
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": get_discord_redirect_uri(),
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            DISCORD_TOKEN,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if response.status_code != 200:
        logger.error("[discord] token exchange failed: %s", response.text)
        raise DiscordAuthError("Discord 로그인 토큰 교환에 실패했습니다.")
    return response.json()


async def fetch_discord_user(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{DISCORD_API}/users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise DiscordAuthError("Discord 사용자 정보를 가져오지 못했습니다.")
    return response.json()


async def fetch_user_guilds(access_token: str) -> List[Dict[str, Any]]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{DISCORD_API}/users/@me/guilds",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        logger.error("[discord] guilds fetch failed: %s", response.text)
        raise DiscordAuthError("Discord 서버 목록을 확인하지 못했습니다.")
    return response.json()


async def ensure_user_in_required_guild(access_token: str) -> None:
    if not is_guild_check_enabled():
        return
    guild_id = get_discord_guild_id()
    if not guild_id:
        raise DiscordAuthError("DISCORD_GUILD_ID가 설정되지 않았습니다.")
    guilds = await fetch_user_guilds(access_token)
    member_of = {str(g.get("id")) for g in guilds if g.get("id")}
    if guild_id not in member_of:
        raise DiscordAuthError("지정된 Discord 서버에 가입된 계정만 로그인할 수 있습니다.")


def discord_display_name(profile: Dict[str, Any]) -> str:
    global_name = (profile.get("global_name") or "").strip()
    username = (profile.get("username") or "user").strip()
    return global_name or username


def discord_tag(profile: Dict[str, Any]) -> str:
    username = (profile.get("username") or "user").strip()
    return username


async def get_or_create_discord_user(db: AsyncSession, profile: Dict[str, Any]) -> User:
    discord_id = str(profile["id"])
    display = discord_display_name(profile)
    tag = discord_tag(profile)
    email = f"{discord_id}@discord.local"

    result = await db.execute(select(User).where(User.id == discord_id))
    user = result.scalar_one_or_none()

    if user:
        user.discord_username = tag
        user.last_login = datetime.now(timezone.utc)
        if not user.name:
            user.name = display
    else:
        user = User(
            id=discord_id,
            email=email,
            name=display,
            discord_username=tag,
            last_login=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)
    return user


async def apply_discord_role_bootstrap(db: AsyncSession, user: User) -> User:
    granted = resolve_role_for_discord_id(user.id)
    if not granted:
        return user
    if user.role == granted:
        return user
    if user.role == "admin" and granted == "teacher":
        return user
    user.role = granted
    await db.commit()
    await db.refresh(user)
    logger.info("[discord-bootstrap] role=%s user_id=%s", granted, user.id)
    return user


async def complete_discord_login(db: AsyncSession, code: str) -> str:
    if not is_discord_configured():
        raise DiscordAuthError("Discord OAuth가 설정되지 않았습니다.")

    tokens = await exchange_code_for_token(code)
    access_token = tokens.get("access_token")
    if not access_token:
        raise DiscordAuthError("Discord access token을 받지 못했습니다.")

    await ensure_user_in_required_guild(access_token)
    profile = await fetch_discord_user(access_token)

    user = await get_or_create_discord_user(db, profile)
    user = await apply_discord_role_bootstrap(db, user)

    auth_service = AuthService(db)
    app_token, expires_at, _ = await auth_service.issue_app_token(user=user)
    return build_frontend_success_redirect(app_token, int(expires_at.timestamp()))
