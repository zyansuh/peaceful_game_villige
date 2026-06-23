from typing import List, Optional

from core.database import get_db
from dependencies.auth import get_admin_user, get_current_user, get_staff_user, user_model_to_response
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from schemas.auth import UserResponse
from services.user import NicknameValidationError, UserService, validate_nickname
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None


class UpdateNicknameRequest(BaseModel):
    nickname: str

    @field_validator("nickname")
    @classmethod
    def validate_nickname_field(cls, v: str) -> str:
        return validate_nickname(v)


class UpdateUserRoleRequest(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        from dependencies.roles import VALID_ROLES

        if v not in VALID_ROLES:
            raise ValueError(f"role must be one of: {', '.join(sorted(VALID_ROLES))}")
        return v


class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int


def user_to_response(user) -> UserResponse:
    return user_model_to_response(user)


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    profile = await UserService.get_user_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return user_to_response(profile)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    if profile_data.name is None:
        profile = await UserService.get_user_profile(db, current_user.id)
    else:
        try:
            profile = await UserService.update_nickname(db, current_user.id, profile_data.name)
        except NicknameValidationError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return user_to_response(profile)


@router.patch("/profile/nickname", response_model=UserResponse)
async def update_nickname(
    body: UpdateNicknameRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        profile = await UserService.update_nickname(db, current_user.id, body.nickname)
    except NicknameValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return user_to_response(profile)


@router.get("/directory", response_model=UserListResponse)
async def list_member_directory(
    db: AsyncSession = Depends(get_db),
    _staff: UserResponse = Depends(get_staff_user),
):
    """Staff-only list of Discord-registered site members."""
    users = await UserService.list_users(db, limit=2000)
    items = [user_to_response(u) for u in users]
    return UserListResponse(items=items, total=len(items))


@router.get("/staff", response_model=UserListResponse)
async def list_users_for_role_management(
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(get_admin_user),
):
    users = await UserService.list_users(db, limit=500)
    items = [user_to_response(u) for u in users]
    return UserListResponse(items=items, total=len(items))


@router.patch("/staff/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    body: UpdateUserRoleRequest,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    if user_id == admin.id and body.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own admin role",
        )
    try:
        updated = await UserService.update_user_role(db, user_id, body.role)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_to_response(updated)


@router.patch("/staff/{user_id}/nickname", response_model=UserResponse)
async def admin_update_nickname(
    user_id: str,
    body: UpdateNicknameRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(get_admin_user),
):
    """Admin: change any member's site nickname."""
    try:
        updated = await UserService.update_nickname(db, user_id, body.nickname)
    except NicknameValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    return user_to_response(updated)
