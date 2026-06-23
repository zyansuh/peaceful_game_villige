import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List
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
DISCORD_SCOPES = "identify guilds email"


class DiscordAuthError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


@dataclass
class DiscordLoginResult:
    redirect_url: str
    token: str
    expires_at: datetime


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


def discord_avatar_url(profile: Dict[str, Any]) -> str:
    user_id = str(profile["id"])
    avatar = profile.get("avatar")
    if avatar:
        ext = "gif" if str(avatar).startswith("a_") else "png"
        return f"https://cdn.discordapp.com/avatars/{user_id}/{avatar}.{ext}?size=128"
    index = (int(user_id) >> 22) % 6
    return f"https://cdn.discordapp.com/embed/avatars/{index}.png"


def discord_email(profile: Dict[str, Any]) -> str:
    email = (profile.get("email") or "").strip()
    if email:
        return email
    return f"{profile['id']}@discord.local"


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


async def get_or_create_discord_user(db: AsyncSession, profile: Dict[str, Any]) -> tuple[User, bool]:
    """Returns (user, is_new_user)."""
    discord_id = str(profile["id"])
    tag = (profile.get("username") or "user").strip()
    email = discord_email(profile)
    avatar = discord_avatar_url(profile)

    result = await db.execute(select(User).where(User.id == discord_id))
    user = result.scalar_one_or_none()
    is_new = user is None

    if user:
        user.discord_username = tag
        user.email = email
        user.discord_avatar = avatar
        user.last_login = datetime.now(timezone.utc)
    else:
        user = User(
            id=discord_id,
            email=email,
            name=None,
            discord_username=tag,
            discord_avatar=avatar,
            nickname_configured=False,
            last_login=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)
    return user, is_new


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


def build_post_login_redirect(user: User) -> str:
    base = get_frontend_url()
    if not user.nickname_configured or not user.name:
        return f"{base}/setup-nickname"
    return f"{base}/auth/callback"


async def complete_discord_login(db: AsyncSession, code: str) -> DiscordLoginResult:
    if not is_discord_configured():
        raise DiscordAuthError("Discord OAuth가 설정되지 않았습니다.")

    tokens = await exchange_code_for_token(code)
    access_token = tokens.get("access_token")
    if not access_token:
        raise DiscordAuthError("Discord access token을 받지 못했습니다.")

    await ensure_user_in_required_guild(access_token)
    profile = await fetch_discord_user(access_token)

    user, _is_new = await get_or_create_discord_user(db, profile)
    user = await apply_discord_role_bootstrap(db, user)

    auth_service = AuthService(db)
    app_token, expires_at, _ = await auth_service.issue_app_token(user=user)
    redirect_url = build_post_login_redirect(user)
    return DiscordLoginResult(redirect_url=redirect_url, token=app_token, expires_at=expires_at)
