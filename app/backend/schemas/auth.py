from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None  # custom nickname when nickname_configured
    discord_username: Optional[str] = None
    discord_global_name: Optional[str] = None
    discord_guild_nickname: Optional[str] = None
    discord_avatar: Optional[str] = None
    nickname_configured: bool = False
    display_name: str = "알 수 없는 사용자"
    role: str = "user"
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlatformTokenExchangeRequest(BaseModel):
    platform_token: str


class TokenExchangeResponse(BaseModel):
    token: str


class AuthStatusResponse(BaseModel):
    authenticated: bool
    user: Optional[UserResponse] = None
