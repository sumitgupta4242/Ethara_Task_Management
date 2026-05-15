"""
Project management API (Admin creates; all can view).
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_role, get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse
from app.services import project_service

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Create a new project (Admin only)."""
    project = await project_service.create_project(
        db, data.name, data.description, current_user.id
    )
    return project


@router.get("/", response_model=List[ProjectDetailResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all projects (all authenticated users)."""
    return await project_service.get_all_projects(db)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get project details (all authenticated users)."""
    project = await project_service.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from sqlalchemy import select, func
    from app.models.task import Task
    count_result = await db.execute(
        select(func.count(Task.id)).where(Task.project_id == project_id)
    )
    task_count = count_result.scalar() or 0

    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        creator=project.creator,
        task_count=task_count,
        created_at=project.created_at,
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    data: ProjectUpdate,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Update a project (Admin only)."""
    project = await project_service.update_project(db, project_id, data.name, data.description)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(require_role(["Admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete a project and all its tasks (Admin only)."""
    success = await project_service.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
