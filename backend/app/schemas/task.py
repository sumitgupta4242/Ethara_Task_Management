"""
Pydantic schemas for Task operations.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.task import TaskStatus, TaskPriority
from app.schemas.user import UserBrief


# --- Request Schemas ---

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.Medium
    project_id: int
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskAssign(BaseModel):
    assigned_to: int


# --- Response Schemas ---

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    assignee: Optional[UserBrief] = None
    creator: Optional[UserBrief] = None
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
