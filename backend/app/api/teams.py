"""
Team management API.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_role, get_current_user
from app.models.user import User, UserRole
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse, TeamDetailResponse
from app.schemas.user import UserBrief
from app.services import team_service

router = APIRouter(prefix="/api/teams", tags=["Teams"])


@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    data: TeamCreate,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Create a new team (Admin only)."""
    try:
        team = await team_service.create_team(db, data.name, data.ql_id)
        return team
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[TeamResponse])
async def list_teams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List teams. Admins see all; QLs see only their team."""
    if current_user.role == UserRole.Admin:
        return await team_service.get_all_teams(db)
    elif current_user.role == UserRole.QL:
        if current_user.team_id:
            team = await team_service.get_team_by_id(db, current_user.team_id)
            return [team] if team else []
        return []
    else:
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/{team_id}", response_model=TeamDetailResponse)
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get team details with members."""
    if current_user.role == UserRole.Member:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role == UserRole.QL and current_user.team_id != team_id:
        raise HTTPException(status_code=403, detail="Access denied to other teams")

    team = await team_service.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.get("/{team_id}/members", response_model=List[UserBrief])
async def get_team_members(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all members of a team."""
    if current_user.role == UserRole.Member:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role == UserRole.QL and current_user.team_id != team_id:
        raise HTTPException(status_code=403, detail="Access denied to other teams")

    return await team_service.get_team_members(db, team_id)


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    data: TeamUpdate,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Update a team (Admin only)."""
    try:
        team = await team_service.update_team(db, team_id, data.name, data.ql_id)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        return team
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: int,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete a team (Admin only)."""
    success = await team_service.delete_team(db, team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team not found")
