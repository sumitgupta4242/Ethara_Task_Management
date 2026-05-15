"""
Pydantic schemas for authentication.
"""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class GoogleLoginRequest(BaseModel):
    credential: str  # Google ID token from frontend


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    needs_password: bool = False


class MessageResponse(BaseModel):
    message: str
