"""
Pydantic schemas for Team operations.
"""
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.user import UserBrief


# --- Request Schemas ---

class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    ql_id: Optional[int] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    ql_id: Optional[int] = None


# --- Response Schemas ---

class TeamResponse(BaseModel):
    id: int
    name: str
    ql_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TeamDetailResponse(BaseModel):
    id: int
    name: str
    ql: Optional[UserBrief] = None
    members: List[UserBrief] = []
    created_at: datetime

    class Config:
        from_attributes = True
