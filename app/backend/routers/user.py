from typing import List, Optional

from core.database import get_db
from dependencies.auth import get_admin_user, get_current_user
from dependencies.roles import VALID_ROLES
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from schemas.auth import UserResponse
from services.user import UserService
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None


class UpdateUserRoleRequest(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"role must be one of: {', '.join(sorted(VALID_ROLES))}")
        return v


class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """Get current user profile"""
    profile = await UserService.get_user_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return profile


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """Update current user profile"""
    profile = await UserService.update_user_profile(db, current_user.id, profile_data.name)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return profile


@router.get("/staff", response_model=UserListResponse)
async def list_users_for_role_management(
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(get_admin_user),
):
    """List users for role assignment (admin only)."""
    users = await UserService.list_users(db, limit=500)
    return UserListResponse(items=users, total=len(users))


@router.patch("/staff/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    body: UpdateUserRoleRequest,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    """Assign user / teacher / admin role (admin only)."""
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
    return updated
