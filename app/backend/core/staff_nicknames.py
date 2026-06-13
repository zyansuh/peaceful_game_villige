"""닉네임 기반 staff 권한 부트스트랩 (로그인 성공 시에만 적용).

주의: 닉네임은 공개 정보입니다. 비밀번호 없이 권한을 주면 안 됩니다.
아래 목록은 **비밀번호로 로그인에 성공한 뒤** role을 올려 줍니다.

로컬에서만 쓰려면 STAFF_NICKNAME_BOOTSTRAP=false 로 끌 수 있습니다.
환경 변수 STAFF_NICKNAMES="닉네임:admin,닉네임2:teacher" 로 덮어쓸 수도 있습니다.
"""

import os
from typing import Dict

# ── 여기에 닉네임을 추가하세요 (role: admin | teacher) ──
NICKNAME_ROLE_OVERRIDES: Dict[str, str] = {
    "단비 95": "admin",
    "알파로": "admin",
    "천타": "admin",
}


def _parse_env_overrides() -> Dict[str, str]:
    raw = os.environ.get("STAFF_NICKNAMES", "").strip()
    if not raw:
        return {}
    result: Dict[str, str] = {}
    for part in raw.split(","):
        part = part.strip()
        if not part or ":" not in part:
            continue
        nickname, role = part.split(":", 1)
        nickname = nickname.strip()
        role = role.strip().lower()
        if nickname and role in ("admin", "teacher"):
            result[nickname] = role
    return result


def is_bootstrap_enabled() -> bool:
    flag = os.environ.get("STAFF_NICKNAME_BOOTSTRAP", "true").lower()
    return flag not in ("0", "false", "no", "off")


def resolve_role_for_nickname(nickname: str) -> str | None:
    """Return admin/teacher if nickname is allowlisted, else None."""
    if not is_bootstrap_enabled():
        return None
    merged = {**NICKNAME_ROLE_OVERRIDES, **_parse_env_overrides()}
    role = merged.get(nickname.strip())
    if role in ("admin", "teacher"):
        return role
    return None
