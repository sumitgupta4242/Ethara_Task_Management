"""
User management API (Admin only).
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """List all users (Admin only)."""
    return await user_service.get_all_users(db)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific user by ID (Admin only)."""
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Update a user's role, team, or status (Admin only)."""
    user = await user_service.update_user(
        db,
        user_id,
        full_name=data.full_name,
        role=data.role,
        team_id=data.team_id,
        is_active=data.is_active,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user. Tasks are unassigned to prevent orphans (Admin only)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    success = await user_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
