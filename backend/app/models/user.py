"""
User model with role-based enum (Admin, QL, Member).
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    Admin = "Admin"
    QL = "QL"
    Member = "Member"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.Member)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    google_id = Column(String(255), unique=True, nullable=True)
    needs_password = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    team = relationship("Team", back_populates="members", foreign_keys=[team_id])
    owned_team = relationship(
        "Team", back_populates="ql", foreign_keys="Team.ql_id", uselist=False
    )
    assigned_tasks = relationship(
        "Task", back_populates="assignee", foreign_keys="Task.assigned_to"
    )
    created_tasks = relationship(
        "Task", back_populates="creator", foreign_keys="Task.created_by"
    )
    created_projects = relationship("Project", back_populates="creator")
