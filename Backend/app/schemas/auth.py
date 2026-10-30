from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


# ─── Register ───
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    company: Optional[str] = None
    primary_skill: Optional[str] = None
    address: Optional[str] = None


# ─── Login ───
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ─── User Info (returned in responses) ───
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    company: Optional[str] = None
    primary_skill: Optional[str] = None


# ─── Token Response ───
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse