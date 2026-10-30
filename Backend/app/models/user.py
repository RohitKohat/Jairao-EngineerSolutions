from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    VENDOR = "VENDOR"
    TECHNICIAN = "TECHNICIAN"
    CUSTOMER = "CUSTOMER"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    name: str
    phone: Optional[str] = None
    role: UserRole = Field(default=UserRole.CUSTOMER)
    is_active: bool = Field(default=True)

    # Vendor-specific
    company: Optional[str] = None

    # Technician-specific
    primary_skill: Optional[str] = None

    # Common
    address: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))