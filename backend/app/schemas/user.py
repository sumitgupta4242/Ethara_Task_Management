"""
Pydantic schemas for User operations.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


# --- Request Schemas ---

class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    full_name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.Member


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[UserRole] = None
    team_id: Optional[int] = None
    is_active: Optional[bool] = None


class SetPasswordRequest(BaseModel):
    password: str = Field(..., min_length=6, max_length=128)


# --- Response Schemas ---

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    team_id: Optional[int] = None
    is_active: bool
    needs_password: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    """Compact user info for embedding in other responses."""
    id: int
    email: str
    full_name: str
    role: UserRole

    class Config:
        from_attributes = True
