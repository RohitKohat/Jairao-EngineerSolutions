from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field


class PayoutStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"


class Payout(SQLModel, table=True):
    __tablename__ = "payouts"

    id: Optional[int] = Field(default=None, primary_key=True)
    amount: float
    payout_method: str = Field(default="bank_transfer")

    # Bank / UPI details
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    upi_id: Optional[str] = None

    # Status
    status: PayoutStatus = Field(default=PayoutStatus.PENDING)
    processed_by: Optional[int] = None
    processed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    transaction_id: Optional[str] = None

    # Who requested
    user_id: int = Field(foreign_key="users.id", index=True)

    # ✅ ADDED — notes field
    notes: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))