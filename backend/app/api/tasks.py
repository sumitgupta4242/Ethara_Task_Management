"""
Task management API: CRUD, assignment, status transitions.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_role, get_current_user
from app.models.user import User
from app.models.task import TaskStatus
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskStatusUpdate,
    TaskAssign,
    TaskResponse,
    TaskDetailResponse,
)
from app.services import task_service

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    data: TaskCreate,
    current_user: User = Depends(require_role(["Admin", "QL"])),
    db: AsyncSession = Depends(get_db),
):
    """Create a new task (Admin/QL only)."""
    task = await task_service.create_task(
        db=db,
        title=data.title,
        project_id=data.project_id,
        created_by=current_user.id,
        description=data.description,
        priority=data.priority,
        assigned_to=data.assigned_to,
    )
    return task


@router.get("/", response_model=List[TaskDetailResponse])
async def list_tasks(
    project_id: Optional[int] = Query(None),
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List tasks (role-filtered):
    - Admin: all tasks
    - QL: tasks for their team
    - Member: tasks assigned to them
    """
    tasks = await task_service.get_tasks(db, current_user, project_id, status_filter)
    return tasks


@router.get("/{task_id}", response_model=TaskDetailResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific task."""
    task = await task_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    current_user: User = Depends(require_role(["Admin", "QL"])),
    db: AsyncSession = Depends(get_db),
):
    """Update task details (Admin/QL only)."""
    task = await task_service.update_task(
        db, task_id, data.title, data.description, data.priority
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}/status", response_model=TaskDetailResponse)
async def update_task_status(
    task_id: int,
    data: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update task status (role-restricted transitions):
    - Member: Assigned → In Progress → Ready for Review
    - QL: Any transition for their team's tasks
    - Admin: Any transition
    """
    try:
        task = await task_service.update_task_status(
            db, task_id, data.status, current_user
        )
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.patch("/{task_id}/assign", response_model=TaskDetailResponse)
async def assign_task(
    task_id: int,
    data: TaskAssign,
    current_user: User = Depends(require_role(["Admin", "QL"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Assign or reassign a task to a Member (Admin/QL).
    QLs can only assign to members of their own team.
    """
    try:
        task = await task_service.assign_task(
            db, task_id, data.assigned_to, current_user
        )
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(require_role(["Admin", "QL"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete a task (Admin/QL only). Members get 403."""
    success = await task_service.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
