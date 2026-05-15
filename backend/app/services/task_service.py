"""
Task management service: CRUD, assignment, status lifecycle, transfer.
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.task import Task, TaskStatus, TaskPriority
from app.models.user import User, UserRole


# Valid status transitions for Members
MEMBER_TRANSITIONS = {
    TaskStatus.Assigned: [TaskStatus.InProgress],
    TaskStatus.InProgress: [TaskStatus.ReadyForReview],
}


async def create_task(
    db: AsyncSession,
    title: str,
    project_id: int,
    created_by: int,
    description: Optional[str] = None,
    priority: TaskPriority = TaskPriority.Medium,
    assigned_to: Optional[int] = None,
) -> Task:
    """Create a new task. Auto-sets status to Backlog or Assigned."""
    status = TaskStatus.Assigned if assigned_to else TaskStatus.Backlog

    task = Task(
        title=title,
        description=description,
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        created_by=created_by,
        project_id=project_id,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task


async def get_tasks(
    db: AsyncSession,
    user: User,
    project_id: Optional[int] = None,
    status_filter: Optional[TaskStatus] = None,
) -> List[Task]:
    """
    Get tasks filtered by role:
    - Admin: all tasks
    - QL: tasks created by them or assigned to their team members
    - Member: tasks assigned to them
    """
    query = select(Task).options(
        selectinload(Task.assignee), selectinload(Task.creator)
    )

    if user.role == UserRole.Member:
        query = query.where(Task.assigned_to == user.id)
    elif user.role == UserRole.QL:
        # Get team member IDs
        team_result = await db.execute(
            select(User.id).where(User.team_id == user.team_id)
        )
        team_member_ids = [row[0] for row in team_result.fetchall()]
        query = query.where(
            (Task.created_by == user.id) | (Task.assigned_to.in_(team_member_ids))
        )

    if project_id:
        query = query.where(Task.project_id == project_id)

    if status_filter:
        query = query.where(Task.status == status_filter)

    query = query.order_by(Task.updated_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_task_by_id(db: AsyncSession, task_id: int) -> Optional[Task]:
    """Get a task by ID with relationships loaded."""
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.assignee), selectinload(Task.creator))
        .where(Task.id == task_id)
    )
    return result.scalar_one_or_none()


async def update_task(
    db: AsyncSession,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[TaskPriority] = None,
) -> Optional[Task]:
    """Update task details (Admin/QL)."""
    task = await get_task_by_id(db, task_id)
    if not task:
        return None

    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if priority is not None:
        task.priority = priority

    await db.flush()
    await db.refresh(task)
    return task


async def update_task_status(
    db: AsyncSession, task_id: int, new_status: TaskStatus, user: User
) -> Task:
    """
    Update task status with role-based validation.
    - Members: can only follow Assigned → In Progress → Ready for Review
    - QL: can set any status for their team's tasks
    - Admin: can set any status
    """
    task = await get_task_by_id(db, task_id)
    if not task:
        raise ValueError("Task not found")

    if user.role == UserRole.Member:
        # Members can only update their own tasks
        if task.assigned_to != user.id:
            raise PermissionError("You can only update status of your own tasks")

        allowed = MEMBER_TRANSITIONS.get(task.status, [])
        if new_status not in allowed:
            raise ValueError(
                f"Invalid status transition: {task.status.value} → {new_status.value}. "
                f"Allowed: {[s.value for s in allowed]}"
            )
    elif user.role == UserRole.QL:
        # QL can update tasks they created or assigned to their team
        if task.created_by != user.id and (
            not task.assigned_to
            or not await _is_team_member(db, task.assigned_to, user.team_id)
        ):
            raise PermissionError("You can only update status of your team's tasks")

    task.status = new_status
    await db.flush()
    await db.refresh(task)
    return task


async def assign_task(
    db: AsyncSession, task_id: int, member_id: int, user: User
) -> Task:
    """
    Assign or reassign a task to a Member.
    - QL: can only assign to members of their team
    - Admin: can assign to anyone
    """
    task = await get_task_by_id(db, task_id)
    if not task:
        raise ValueError("Task not found")

    # Validate the target member
    member_result = await db.execute(select(User).where(User.id == member_id))
    member = member_result.scalar_one_or_none()
    if not member:
        raise ValueError("Target member not found")
    if member.role != UserRole.Member:
        raise ValueError("Tasks can only be assigned to Members")

    if user.role == UserRole.QL:
        # QL can only assign to their team members
        if member.team_id != user.team_id:
            raise PermissionError(
                "You can only assign tasks to members of your own team"
            )

    task.assigned_to = member_id
    if task.status == TaskStatus.Backlog:
        task.status = TaskStatus.Assigned

    await db.flush()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, task_id: int) -> bool:
    """Delete a task."""
    task = await get_task_by_id(db, task_id)
    if not task:
        return False

    await db.delete(task)
    await db.flush()
    return True


async def _is_team_member(
    db: AsyncSession, user_id: int, team_id: Optional[int]
) -> bool:
    """Check if a user belongs to a specific team."""
    if not team_id:
        return False
    result = await db.execute(
        select(User).where(User.id == user_id, User.team_id == team_id)
    )
    return result.scalar_one_or_none() is not None
