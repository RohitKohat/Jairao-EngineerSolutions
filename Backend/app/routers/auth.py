from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services import auth_service


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(
    data: RegisterRequest,
    session: Session = Depends(get_session),
):
    """Register a new user (any role)."""
    return auth_service.register_user(session, data)


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    session: Session = Depends(get_session),
):
    """Login with email and password."""
    return auth_service.login_user(session, data)