"""
Seed script to populate the database with demo data.
Creates: 1 Admin, 2 QLs, 4 Members, 2 Teams, 3 Projects, 10 Tasks.
Run: python -m app.seed
"""
import asyncio
from app.db.session import engine, async_session_factory
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.team import Team
from app.models.project import Project
from app.models.task import Task, TaskStatus, TaskPriority
from app.core.security import get_password_hash

# Import all models
from app.models import User, Team, Project, Task  # noqa: F811


async def seed():
    """Populate the database with demo data."""
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Check if already seeded
        from sqlalchemy import select, func

        count = await session.execute(select(func.count(User.id)))
        if count.scalar() > 0:
            print("Database already has data. Skipping seed.")
            return

        # --- Users ---
        admin = User(
            email="admin@ethara.com",
            full_name="Rajesh Kumar",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.Admin,
            is_active=True,
        )
        ql1 = User(
            email="ql1@ethara.com",
            full_name="Priya Sharma",
            hashed_password=get_password_hash("ql12345"),
            role=UserRole.QL,
            is_active=True,
        )
        ql2 = User(
            email="ql2@ethara.com",
            full_name="Amit Patel",
            hashed_password=get_password_hash("ql12345"),
            role=UserRole.QL,
            is_active=True,
        )
        member1 = User(
            email="member1@ethara.com",
            full_name="Sneha Verma",
            hashed_password=get_password_hash("member123"),
            role=UserRole.Member,
            is_active=True,
        )
        member2 = User(
            email="member2@ethara.com",
            full_name="Arjun Singh",
            hashed_password=get_password_hash("member123"),
            role=UserRole.Member,
            is_active=True,
        )
        member3 = User(
            email="member3@ethara.com",
            full_name="Kavita Reddy",
            hashed_password=get_password_hash("member123"),
            role=UserRole.Member,
            is_active=True,
        )
        member4 = User(
            email="member4@ethara.com",
            full_name="Vikram Joshi",
            hashed_password=get_password_hash("member123"),
            role=UserRole.Member,
            is_active=True,
        )

        session.add_all([admin, ql1, ql2, member1, member2, member3, member4])
        await session.flush()

        # --- Teams ---
        team_alpha = Team(name="Team Alpha", ql_id=ql1.id)
        team_beta = Team(name="Team Beta", ql_id=ql2.id)
        session.add_all([team_alpha, team_beta])
        await session.flush()

        # Assign users to teams
        ql1.team_id = team_alpha.id
        member1.team_id = team_alpha.id
        member2.team_id = team_alpha.id
        ql2.team_id = team_beta.id
        member3.team_id = team_beta.id
        member4.team_id = team_beta.id
        await session.flush()

        # --- Projects ---
        project1 = Project(
            name="Website Redesign",
            description="Complete overhaul of the company website with modern UI/UX design",
            created_by=admin.id,
        )
        project2 = Project(
            name="Mobile App v2",
            description="Develop version 2 of the mobile application with new features",
            created_by=admin.id,
        )
        project3 = Project(
            name="API Integration",
            description="Integrate third-party payment and analytics APIs",
            created_by=admin.id,
        )
        session.add_all([project1, project2, project3])
        await session.flush()

        # --- Tasks ---
        tasks_data = [
            Task(
                title="Design Homepage Mockup",
                description="Create high-fidelity mockups for the new homepage using Figma",
                status=TaskStatus.InProgress,
                priority=TaskPriority.High,
                assigned_to=member1.id,
                created_by=ql1.id,
                project_id=project1.id,
            ),
            Task(
                title="Implement Navigation Bar",
                description="Build a responsive navigation bar with dropdown menus",
                status=TaskStatus.Assigned,
                priority=TaskPriority.Medium,
                assigned_to=member2.id,
                created_by=ql1.id,
                project_id=project1.id,
            ),
            Task(
                title="Setup CI/CD Pipeline",
                description="Configure GitHub Actions for automated testing and deployment",
                status=TaskStatus.Completed,
                priority=TaskPriority.Critical,
                assigned_to=member1.id,
                created_by=ql1.id,
                project_id=project1.id,
            ),
            Task(
                title="User Authentication Flow",
                description="Implement login, register, and password reset screens",
                status=TaskStatus.ReadyForReview,
                priority=TaskPriority.High,
                assigned_to=member3.id,
                created_by=ql2.id,
                project_id=project2.id,
            ),
            Task(
                title="Push Notification System",
                description="Set up Firebase Cloud Messaging for push notifications",
                status=TaskStatus.Backlog,
                priority=TaskPriority.Medium,
                assigned_to=None,
                created_by=ql2.id,
                project_id=project2.id,
            ),
            Task(
                title="Offline Data Sync",
                description="Implement offline-first data synchronization with SQLite",
                status=TaskStatus.InProgress,
                priority=TaskPriority.High,
                assigned_to=member4.id,
                created_by=ql2.id,
                project_id=project2.id,
            ),
            Task(
                title="Payment Gateway Integration",
                description="Integrate Razorpay/Stripe for payment processing",
                status=TaskStatus.Assigned,
                priority=TaskPriority.Critical,
                assigned_to=member3.id,
                created_by=ql2.id,
                project_id=project3.id,
            ),
            Task(
                title="Analytics Dashboard API",
                description="Build REST endpoints for analytics data visualization",
                status=TaskStatus.Backlog,
                priority=TaskPriority.Low,
                assigned_to=None,
                created_by=admin.id,
                project_id=project3.id,
            ),
            Task(
                title="API Rate Limiting",
                description="Implement rate limiting middleware for all public endpoints",
                status=TaskStatus.Assigned,
                priority=TaskPriority.Medium,
                assigned_to=member2.id,
                created_by=ql1.id,
                project_id=project3.id,
            ),
            Task(
                title="Database Performance Audit",
                description="Analyze and optimize slow queries, add proper indexes",
                status=TaskStatus.InProgress,
                priority=TaskPriority.High,
                assigned_to=member4.id,
                created_by=ql2.id,
                project_id=project3.id,
            ),
        ]
        session.add_all(tasks_data)
        await session.commit()

        print("=" * 60)
        print("  SEED DATA CREATED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("  Demo Accounts:")
        print("  ─────────────────────────────────────────")
        print(f"  Admin:   admin@ethara.com    / admin123")
        print(f"  QL 1:    ql1@ethara.com      / ql12345")
        print(f"  QL 2:    ql2@ethara.com      / ql12345")
        print(f"  Member:  member1@ethara.com  / member123")
        print(f"  Member:  member2@ethara.com  / member123")
        print(f"  Member:  member3@ethara.com  / member123")
        print(f"  Member:  member4@ethara.com  / member123")
        print()
        print("  Teams: Team Alpha (QL1), Team Beta (QL2)")
        print("  Projects: Website Redesign, Mobile App v2, API Integration")
        print("  Tasks: 10 tasks across various statuses")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed())
