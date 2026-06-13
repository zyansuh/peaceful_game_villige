"""DEPRECATED: 닉네임 기반 staff 부트스트랩 — Discord 로그인 전환 후 core/staff_discord_ids.py 사용."""

import os
from typing import Dict

NICKNAME_ROLE_OVERRIDES: Dict[str, str] = {}


def _parse_env_overrides() -> Dict[str, str]:
    return {}


def is_bootstrap_enabled() -> bool:
    return False


def resolve_role_for_nickname(nickname: str) -> str | None:
    return None
