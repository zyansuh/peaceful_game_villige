"""Discord OAuth configuration from environment."""

import os


def _split_ids(raw: str) -> frozenset[str]:
    return frozenset(part.strip() for part in raw.split(",") if part.strip())


def get_discord_client_id() -> str:
    return os.environ.get("DISCORD_CLIENT_ID", "").strip()


def get_discord_client_secret() -> str:
    return os.environ.get("DISCORD_CLIENT_SECRET", "").strip()


def get_discord_guild_id() -> str:
    return os.environ.get("DISCORD_GUILD_ID", "").strip()


def get_frontend_url() -> str:
    return os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")


def get_discord_redirect_uri() -> str:
    explicit = os.environ.get("DISCORD_REDIRECT_URI", "").strip()
    if explicit:
        return explicit
    # Vite proxy: browser와 쿠키 도메인 일치 (localhost:3000)
    return f"{get_frontend_url()}/api/v1/auth/discord/callback"


def is_guild_check_enabled() -> bool:
    flag = os.environ.get("DISCORD_GUILD_CHECK", "true").lower()
    return flag not in ("0", "false", "no", "off")


def is_discord_configured() -> bool:
    return bool(get_discord_client_id() and get_discord_client_secret())


def get_admin_discord_ids() -> frozenset[str]:
    return _split_ids(os.environ.get("DISCORD_ADMIN_IDS", ""))


def get_teacher_discord_ids() -> frozenset[str]:
    return _split_ids(os.environ.get("DISCORD_TEACHER_IDS", ""))
