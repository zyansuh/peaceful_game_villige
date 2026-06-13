"""Discord user ID based staff role bootstrap (applied on Discord login)."""

from core.discord_config import get_admin_discord_ids, get_teacher_discord_ids

# ── 코드에 Discord ID를 넣을 때 (환경 변수보다 우선하지 않음, 병합) ──
CODE_ADMIN_DISCORD_IDS: frozenset[str] = frozenset()
CODE_TEACHER_DISCORD_IDS: frozenset[str] = frozenset()


def resolve_role_for_discord_id(discord_id: str) -> str | None:
    uid = str(discord_id).strip()
    if not uid:
        return None
    admin_ids = get_admin_discord_ids() | CODE_ADMIN_DISCORD_IDS
    teacher_ids = get_teacher_discord_ids() | CODE_TEACHER_DISCORD_IDS
    if uid in admin_ids:
        return "admin"
    if uid in teacher_ids:
        return "teacher"
    return None
