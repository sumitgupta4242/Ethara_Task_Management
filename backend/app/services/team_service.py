"""
Team management service.
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.team import Team
from app.models.user import User, UserRole


async def create_team(
    db: AsyncSession, name: str, ql_id: Optional[int] = None
) -> Team:
    """Create a new team, optionally assigning a QL."""
    # Check name uniqueness
    existing = await db.execute(select(Team).where(Team.name == name))
    if existing.scalar_one_or_none():
        raise ValueError(f"Team '{name}' already exists")

    # Validate QL if provided
    if ql_id:
        ql_user = await db.execute(select(User).where(User.id == ql_id))
        ql = ql_user.scalar_one_or_none()
        if not ql or ql.role != UserRole.QL:
            raise ValueError("Specified user is not a QL")

    team = Team(name=name, ql_id=ql_id)
    db.add(team)
    await db.flush()
    await db.refresh(team)

    # Assign QL to this team
    if ql_id:
        ql_result = await db.execute(select(User).where(User.id == ql_id))
        ql = ql_result.scalar_one_or_none()
        if ql:
            ql.team_id = team.id
            await db.flush()

    return team


async def get_all_teams(db: AsyncSession) -> List[Team]:
    """Get all teams with their QL info."""
    result = await db.execute(
        select(Team).options(selectinload(Team.ql)).order_by(Team.created_at.desc())
    )
    return list(result.scalars().all())


async def get_team_by_id(db: AsyncSession, team_id: int) -> Optional[Team]:
    """Get a team by ID with members loaded."""
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.ql), selectinload(Team.members))
        .where(Team.id == team_id)
    )
    return result.scalar_one_or_none()


async def get_team_members(db: AsyncSession, team_id: int) -> List[User]:
    """Get all members of a team."""
    result = await db.execute(
        select(User).where(User.team_id == team_id).order_by(User.full_name)
    )
    return list(result.scalars().all())


async def update_team(
    db: AsyncSession,
    team_id: int,
    name: Optional[str] = None,
    ql_id: Optional[int] = None,
) -> Optional[Team]:
    """Update team fields."""
    team = await get_team_by_id(db, team_id)
    if not team:
        return None

    if name is not None:
        team.name = name
    if ql_id is not None:
        # Validate QL
        ql_result = await db.execute(select(User).where(User.id == ql_id))
        ql = ql_result.scalar_one_or_none()
        if not ql or ql.role != UserRole.QL:
            raise ValueError("Specified user is not a QL")
        team.ql_id = ql_id
        ql.team_id = team_id

    await db.flush()
    await db.refresh(team)
    return team


async def delete_team(db: AsyncSession, team_id: int) -> bool:
    """Delete a team. Members' team_id will be set to NULL via FK constraint."""
    team = await get_team_by_id(db, team_id)
    if not team:
        return False

    # Clear team_id from all members
    members = await get_team_members(db, team_id)
    for member in members:
        member.team_id = None

    await db.delete(team)
    await db.flush()
    return True
