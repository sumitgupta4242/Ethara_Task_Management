"""
Project management service (Admin-only creation).
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.models.task import Task


async def create_project(
    db: AsyncSession, name: str, description: Optional[str], admin_id: int
) -> Project:
    """Create a new project (Admin only)."""
    project = Project(name=name, description=description, created_by=admin_id)
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


async def get_all_projects(db: AsyncSession) -> List[dict]:
    """Get all projects with task counts."""
    result = await db.execute(
        select(Project).options(selectinload(Project.creator)).order_by(
            Project.created_at.desc()
        )
    )
    projects = list(result.scalars().all())

    project_list = []
    for p in projects:
        count_result = await db.execute(
            select(func.count(Task.id)).where(Task.project_id == p.id)
        )
        task_count = count_result.scalar() or 0
        project_list.append(
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "created_by": p.created_by,
                "creator": p.creator,
                "task_count": task_count,
                "created_at": p.created_at,
            }
        )
    return project_list


async def get_project_by_id(db: AsyncSession, project_id: int) -> Optional[Project]:
    """Get a project by ID."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.creator))
        .where(Project.id == project_id)
    )
    return result.scalar_one_or_none()


async def update_project(
    db: AsyncSession,
    project_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
) -> Optional[Project]:
    """Update project fields."""
    project = await get_project_by_id(db, project_id)
    if not project:
        return None

    if name is not None:
        project.name = name
    if description is not None:
        project.description = description

    await db.flush()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: int) -> bool:
    """Delete a project and its tasks (cascade)."""
    project = await get_project_by_id(db, project_id)
    if not project:
        return False

    await db.delete(project)
    await db.flush()
    return True
