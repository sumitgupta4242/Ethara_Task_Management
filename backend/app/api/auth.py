"""
Authentication API: register, login, Google sign-in, set password.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.auth import LoginRequest, GoogleLoginRequest, TokenResponse, MessageResponse
from app.schemas.user import UserCreate, UserResponse, SetPasswordRequest
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
    try:
        user = await auth_service.register_user(
            db=db,
            email=data.email,
            full_name=data.full_name,
            password=data.password,
            role=data.role,
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password. Returns JWT token."""
    user = await auth_service.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_service.create_token_for_user(user)
    return TokenResponse(access_token=token, needs_password=user.needs_password)


@router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Login/register with Google. Returns JWT token."""
    try:
        user, needs_password = await auth_service.google_login(db, data.credential)
        token = auth_service.create_token_for_user(user)
        return TokenResponse(access_token=token, needs_password=needs_password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/set-password", response_model=MessageResponse)
async def set_password(
    data: SetPasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Set password for accounts that need one (e.g., after Google sign-in)."""
    current_user.hashed_password = get_password_hash(data.password)
    current_user.needs_password = False
    await db.flush()
    return MessageResponse(message="Password set successfully")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return current_user
