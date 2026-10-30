from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field


class NotificationType(str, Enum):
    PAYOUT = "PAYOUT"
    ORDER = "ORDER"
    PRODUCT = "PRODUCT"
    JOB = "JOB"
    SERVICE = "SERVICE"           # ← ADD THIS
    SYSTEM = "SYSTEM"


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    type: NotificationType
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool = Field(default=False)
    read_at: Optional[datetime] = None

    user_id: int = Field(foreign_key="users.id", index=True)
    related_id: Optional[int] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))