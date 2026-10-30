from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


def register_user(session: Session, data: RegisterRequest) -> TokenResponse:
    """Create a new user account and return a JWT token."""
    # Check if email already exists
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create the new user
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        name=data.name,
        phone=data.phone,
        role=data.role,
        company=data.company,
        primary_skill=data.primary_skill,
        address=data.address,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create token
    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value,
        "email": user.email,
    })

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            phone=user.phone,
            company=user.company,
            primary_skill=user.primary_skill,
        ),
    )


def login_user(session: Session, data: LoginRequest) -> TokenResponse:
    """Verify credentials and return a JWT token."""
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended",
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value,
        "email": user.email,
    })

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            phone=user.phone,
            company=user.company,
            primary_skill=user.primary_skill,
        ),
    )