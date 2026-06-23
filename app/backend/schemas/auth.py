from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    discord_username: Optional[str] = None
    discord_avatar: Optional[str] = None
    nickname_configured: bool = False
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
