"""Display nickname helpers — single source of truth for site-wide name priority."""

from typing import Any, Optional


def _trim(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned or None


def get_display_nickname(
    *,
    name: Optional[str] = None,
    nickname_configured: bool = False,
    discord_guild_nickname: Optional[str] = None,
    discord_global_name: Optional[str] = None,
    discord_username: Optional[str] = None,
    fallback: str = "알 수 없는 사용자",
) -> str:
    """
    Priority:
      1. Admin/user custom site nickname (name + nickname_configured)
      2. Discord guild (평겜마) nickname
      3. Discord global_name
      4. Discord username
    """
    if nickname_configured:
        custom = _trim(name)
        if custom:
            return custom

    for candidate in (
        discord_guild_nickname,
        discord_global_name,
        discord_username,
        name,
    ):
        value = _trim(candidate)
        if value:
            return value

    return fallback


def get_display_nickname_from_user(user: Any, fallback: str = "알 수 없는 사용자") -> str:
    return get_display_nickname(
        name=getattr(user, "name", None),
        nickname_configured=bool(getattr(user, "nickname_configured", False)),
        discord_guild_nickname=getattr(user, "discord_guild_nickname", None),
        discord_global_name=getattr(user, "discord_global_name", None),
        discord_username=getattr(user, "discord_username", None),
        fallback=fallback,
    )
