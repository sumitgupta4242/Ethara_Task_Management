"""
Pydantic schemas for Project operations.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserBrief


# --- Request Schemas ---

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


# --- Response Schemas ---

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectDetailResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    creator: Optional[UserBrief] = None
    task_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
