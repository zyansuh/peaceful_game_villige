import logging
import re
import time
from typing import List, Optional

from models.auth import User
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

NICKNAME_MIN = 2
NICKNAME_MAX = 20
NICKNAME_PATTERN = re.compile(r"^[\w\u3131-\u318E\uAC00-\uD7A3\s\-_.]+$")


class NicknameValidationError(ValueError):
    pass


def validate_nickname(nickname: str) -> str:
    value = nickname.strip()
    if len(value) < NICKNAME_MIN:
        raise NicknameValidationError(f"닉네임은 {NICKNAME_MIN}자 이상이어야 합니다.")
    if len(value) > NICKNAME_MAX:
        raise NicknameValidationError(f"닉네임은 {NICKNAME_MAX}자 이하여야 합니다.")
    if not NICKNAME_PATTERN.match(value):
        raise NicknameValidationError("닉네임에 사용할 수 없는 문자가 포함되어 있습니다.")
    return value


class UserService:
    @staticmethod
    async def get_user_profile(db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user profile by user ID."""
        start_time = time.time()
        logger.debug(f"[DB_OP] Starting get_user_profile - user_id: {user_id}")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        logger.debug(
            f"[DB_OP] Get user profile completed in {time.time() - start_time:.4f}s - found: {user is not None}"
        )
        return user

    @staticmethod
    async def list_users(db: AsyncSession, skip: int = 0, limit: int = 200) -> List[User]:
        result = await db.execute(
            select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_user_role(db: AsyncSession, user_id: str, role: str) -> Optional[User]:
        from dependencies.roles import VALID_ROLES

        if role not in VALID_ROLES:
            raise ValueError(f"Invalid role: {role}")

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None

        user.role = role
        await db.commit()
        await db.refresh(user)
        logger.info("Updated user %s role to %s", user_id, role)
        return user

    @staticmethod
    async def update_user_profile(db: AsyncSession, user_id: str, name: Optional[str] = None) -> Optional[User]:
        """Update user profile display name."""
        return await UserService.update_nickname(db, user_id, name) if name is not None else await UserService.get_user_profile(db, user_id)

    @staticmethod
    async def update_nickname(db: AsyncSession, user_id: str, nickname: str) -> User:
        cleaned = validate_nickname(nickname)

        dup = await db.execute(
            select(User).where(func.lower(User.name) == cleaned.lower(), User.id != user_id)
        )
        if dup.scalar_one_or_none():
            raise NicknameValidationError("이미 사용 중인 닉네임입니다.")

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")

        user.name = cleaned
        user.nickname_configured = True
        await db.commit()
        await db.refresh(user)
        logger.info("Updated nickname for user %s", user_id)
        return user
