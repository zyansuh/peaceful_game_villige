import logging
from dataclasses import dataclass
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
from services.nickname import get_display_nickname_from_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

DISCORD_API = "https://discord.com/api"
DISCORD_AUTHORIZE = "https://discord.com/api/oauth2/authorize"
DISCORD_TOKEN = f"{DISCORD_API}/oauth2/token"
# guilds.members.read → GET /users/@me/guilds/{guild.id}/member (서버 nick)
DISCORD_SCOPES = "identify guilds guilds.members.read email"


class DiscordAuthError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


@dataclass
class DiscordLoginResult:
    redirect_url: str
    token: str
    expires_at: datetime


@dataclass
class GuildMemberNickResult:
    nick: Optional[str]
    fetched: bool
    left_guild: bool = False


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


def discord_global_name(profile: Dict[str, Any]) -> Optional[str]:
    value = (profile.get("global_name") or "").strip()
    return value or None


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


async def fetch_guild_member_nick(access_token: str, guild_id: str) -> GuildMemberNickResult:
    """
    Fetch 평겜마 server nickname via OAuth guild member endpoint.
    On API failure: fetched=False → caller must keep existing DB value.
    On 404: member left / not found → left_guild=True, nick=None (clear guild nick).
    """
    if not guild_id:
        return GuildMemberNickResult(nick=None, fetched=False)

    url = f"{DISCORD_API}/users/@me/guilds/{guild_id}/member"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
    except Exception as exc:
        logger.warning("[discord] guild member fetch error: %s", exc)
        return GuildMemberNickResult(nick=None, fetched=False)

    if response.status_code == 404:
        logger.info("[discord] guild member not found for guild_id=%s", guild_id)
        return GuildMemberNickResult(nick=None, fetched=True, left_guild=True)

    if response.status_code != 200:
        logger.warning(
            "[discord] guild member fetch failed status=%s body=%s",
            response.status_code,
            response.text[:300],
        )
        return GuildMemberNickResult(nick=None, fetched=False)

    data = response.json()
    nick = (data.get("nick") or "").strip() or None
    return GuildMemberNickResult(nick=nick, fetched=True, left_guild=False)


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


async def get_or_create_discord_user(
    db: AsyncSession,
    profile: Dict[str, Any],
    guild_nick_result: Optional[GuildMemberNickResult] = None,
) -> tuple[User, bool]:
    """Returns (user, is_new_user). Never overwrites custom name when nickname_configured."""
    discord_id = str(profile["id"])
    username = (profile.get("username") or "user").strip()
    global_name = discord_global_name(profile)
    email = discord_email(profile)
    avatar = discord_avatar_url(profile)

    result = await db.execute(select(User).where(User.id == discord_id))
    user = result.scalar_one_or_none()
    is_new = user is None

    if user:
        user.discord_username = username
        user.discord_global_name = global_name
        user.email = email
        user.discord_avatar = avatar
        user.last_login = datetime.now(timezone.utc)

        if guild_nick_result and guild_nick_result.fetched:
            if guild_nick_result.left_guild:
                user.discord_guild_nickname = None
            else:
                user.discord_guild_nickname = guild_nick_result.nick
        # API 실패 시 기존 discord_guild_nickname 보존

        # 관리자/사용자 지정 닉네임은 Discord 동기화로 덮어쓰지 않음
        if not user.nickname_configured:
            # 자동 표시용으로 name을 건드리지 않음 — display helper가 guild/global 사용
            pass
    else:
        guild_nick = None
        if guild_nick_result and guild_nick_result.fetched and not guild_nick_result.left_guild:
            guild_nick = guild_nick_result.nick

        user = User(
            id=discord_id,
            email=email,
            name=None,
            discord_username=username,
            discord_global_name=global_name,
            discord_guild_nickname=guild_nick,
            discord_avatar=avatar,
            nickname_configured=False,
            last_login=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)
    logger.info(
        "[discord] synced user_id=%s display=%s guild_nick=%s configured=%s",
        user.id,
        get_display_nickname_from_user(user),
        getattr(user, "discord_guild_nickname", None),
        user.nickname_configured,
    )
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
    # 서버/전역 닉이 있어도 사이트 지정 닉이 없으면 setup 화면으로 (프리필용)
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

    guild_id = get_discord_guild_id()
    guild_nick_result = await fetch_guild_member_nick(access_token, guild_id)

    user, _is_new = await get_or_create_discord_user(db, profile, guild_nick_result)
    user = await apply_discord_role_bootstrap(db, user)

    auth_service = AuthService(db)
    app_token, expires_at, _ = await auth_service.issue_app_token(user=user)
    redirect_url = build_post_login_redirect(user)
    return DiscordLoginResult(redirect_url=redirect_url, token=app_token, expires_at=expires_at)
