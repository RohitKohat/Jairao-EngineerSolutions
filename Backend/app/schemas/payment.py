from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.payment import PaymentStatus, PaymentGateway


# ─── Create Razorpay Order ───
class RazorpayOrderCreate(BaseModel):
    order_id: int


# ─── Verify Razorpay Payment ───
class RazorpayVerify(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ─── COD Payment ───
class CODPaymentCreate(BaseModel):
    order_id: int
    notes: Optional[str] = None


# ─── Finance (EMI) Payment ───
class FinancePaymentCreate(BaseModel):
    order_id: int
    finance_provider: str                    # e.g., "HDFC", "Bajaj Finserv"
    emi_tenure_months: int = Field(ge=3, le=36)
    notes: Optional[str] = None


# ─── Payment Response ───
class PaymentResponse(BaseModel):
    id: int
    amount: float
    currency: str
    gateway: PaymentGateway
    status: PaymentStatus
    vendor_share: float
    technician_share: float
    admin_share: float
    commission_rate: float
    order_id: int
    vendor_id: Optional[int]
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    finance_provider: Optional[str]
    emi_tenure_months: Optional[int]
    emi_monthly_amount: Optional[float]
    released_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Wallet Response ───
class WalletResponse(BaseModel):
    available_balance: float
    pending_escrow: float
    total_earnings: float
    total_released: float