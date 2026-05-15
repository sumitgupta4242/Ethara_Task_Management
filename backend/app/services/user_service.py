"""
User management service (Admin operations).
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.user import User, UserRole
from app.models.task import Task
from app.core.security import get_password_hash


async def get_all_users(db: AsyncSession) -> List[User]:
    """Get all users."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get a user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_user(
    db: AsyncSession,
    user_id: int,
    full_name: Optional[str] = None,
    role: Optional[UserRole] = None,
    team_id: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> Optional[User]:
    """Update user fields."""
    user = await get_user_by_id(db, user_id)
    if not user:
        return None

    if full_name is not None:
        user.full_name = full_name
    if role is not None:
        user.role = role
    if team_id is not None:
        user.team_id = team_id
    if is_active is not None:
        user.is_active = is_active

    await db.flush()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: int) -> bool:
    """
    Delete a user. If the user is a QL, reassign their tasks
    or set assigned_to to NULL to prevent orphan tasks.
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        return False

    # Unassign tasks assigned to this user
    await db.execute(
        update(Task).where(Task.assigned_to == user_id).values(assigned_to=None)
    )

    # If this user created tasks, keep them but clear creator reference
    await db.execute(
        update(Task).where(Task.created_by == user_id).values(created_by=None)
    )

    await db.delete(user)
    await db.flush()
    return True


async def set_user_password(db: AsyncSession, user_id: int, password: str) -> Optional[User]:
    """Set password for a user (used after Google sign-in)."""
    user = await get_user_by_id(db, user_id)
    if not user:
        return None

    user.hashed_password = get_password_hash(password)
    user.needs_password = False
    await db.flush()
    await db.refresh(user)
    return user
