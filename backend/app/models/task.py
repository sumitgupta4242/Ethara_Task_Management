"""
Task model with lifecycle status and priority enums.
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class TaskStatus(str, enum.Enum):
    Backlog = "Backlog"
    Assigned = "Assigned"
    InProgress = "In Progress"
    ReadyForReview = "Ready for Review"
    Completed = "Completed"


class TaskPriority(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(TaskStatus), nullable=False, default=TaskStatus.Backlog
    )
    priority = Column(
        Enum(TaskPriority), nullable=False, default=TaskPriority.Medium
    )
    assigned_to = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assignee = relationship(
        "User", back_populates="assigned_tasks", foreign_keys=[assigned_to]
    )
    creator = relationship(
        "User", back_populates="created_tasks", foreign_keys=[created_by]
    )
    project = relationship("Project", back_populates="tasks")
