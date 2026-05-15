"""
Authentication service: registration, login, Google OAuth.
"""
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import get_settings

settings = get_settings()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Find a user by email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_google_id(db: AsyncSession, google_id: str) -> Optional[User]:
    """Find a user by Google ID."""
    result = await db.execute(select(User).where(User.google_id == google_id))
    return result.scalar_one_or_none()


async def register_user(
    db: AsyncSession,
    email: str,
    full_name: str,
    password: str,
    role: UserRole = UserRole.Member,
) -> User:
    """Register a new user with email/password."""
    existing = await get_user_by_email(db, email)
    if existing:
        raise ValueError("A user with this email already exists")

    user = User(
        email=email,
        full_name=full_name,
        hashed_password=get_password_hash(password),
        role=role,
        is_active=True,
        needs_password=False,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> Optional[User]:
    """Verify credentials and return user if valid."""
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if user.needs_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def google_login(db: AsyncSession, credential: str) -> tuple[User, bool]:
    """
    Handle Google Sign-In.
    Verifies the Google ID token, creates user if needed.
    Returns (user, needs_password).
    """
    # Verify the Google token using Google's tokeninfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        )

    if resp.status_code != 200:
        raise ValueError("Invalid Google token")

    google_data = resp.json()
    google_id = google_data.get("sub")
    email = google_data.get("email")
    name = google_data.get("name", email)

    if not google_id or not email:
        raise ValueError("Invalid Google token data")

    # Check if user exists by google_id
    user = await get_user_by_google_id(db, google_id)
    if user:
        return user, user.needs_password

    # Check if user exists by email (link Google to existing account)
    user = await get_user_by_email(db, email)
    if user:
        user.google_id = google_id
        await db.flush()
        await db.refresh(user)
        return user, user.needs_password

    # Create new user (needs to set password)
    user = User(
        email=email,
        full_name=name,
        hashed_password="",  # No password yet
        role=UserRole.Member,
        is_active=True,
        google_id=google_id,
        needs_password=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user, True


def create_token_for_user(user: User) -> str:
    """Create a JWT access token for a user."""
    return create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
