from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    HELD_IN_ESCROW = "HELD_IN_ESCROW"
    RELEASED = "RELEASED"
    REFUNDED = "REFUNDED"
    FAILED = "FAILED"


class PaymentGateway(str, Enum):
    RAZORPAY = "RAZORPAY"
    COD = "COD"                  # Cash on Delivery
    FINANCE = "FINANCE"          # EMI / Buy Now Pay Later
    STRIPE = "STRIPE"


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    amount: float
    currency: str = Field(default="INR")
    gateway: PaymentGateway

    # Razorpay-specific
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

    # Finance-specific (EMI)
    finance_provider: Optional[str] = None       # e.g., "HDFC", "Bajaj", "ZestMoney"
    emi_tenure_months: Optional[int] = None
    emi_monthly_amount: Optional[float] = None

    method: Optional[str] = None                  # card, upi, netbanking, etc.

    # Escrow split
    vendor_share: float = Field(default=0.0)
    technician_share: float = Field(default=0.0)
    admin_share: float = Field(default=0.0)
    commission_rate: float = Field(default=10.0)

    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    released_at: Optional[datetime] = None
    released_by: Optional[int] = None

    # Links
    order_id: int = Field(foreign_key="orders.id", unique=True, index=True)
    vendor_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    technician_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    notes: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))