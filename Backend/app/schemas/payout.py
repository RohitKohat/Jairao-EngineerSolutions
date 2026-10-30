from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.payout import PayoutStatus


# ═══════════════════════════════════════════
# REQUEST PAYOUT (Vendor/Technician)
# ═══════════════════════════════════════════
class PayoutRequestCreate(BaseModel):
    amount: float = Field(gt=0, description="Amount to withdraw in INR")
    payout_method: str = Field(default="bank_transfer")
    
    # Bank / UPI details
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    upi_id: Optional[str] = None
    
    notes: Optional[str] = None


# ═══════════════════════════════════════════
# RESPONSE
# ═══════════════════════════════════════════
class PayoutResponse(BaseModel):
    id: int
    amount: float
    payout_method: str
    account_name: Optional[str]
    account_number: Optional[str]
    ifsc_code: Optional[str]
    bank_name: Optional[str]
    upi_id: Optional[str]
    status: PayoutStatus
    processed_by: Optional[int]
    processed_at: Optional[datetime]
    rejection_reason: Optional[str]
    transaction_id: Optional[str]
    user_id: int
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PayoutListResponse(BaseModel):
    total: int
    page: int
    limit: int
    payouts: List[PayoutResponse]


class PayoutRejectRequest(BaseModel):
    reason: str = Field(min_length=3)


# ═══════════════════════════════════════════
# WALLET SUMMARY (for vendor/technician dashboard)
# ═══════════════════════════════════════════
class WalletSummary(BaseModel):
    available_balance: float
    pending_escrow: float
    total_earnings: float
    total_withdrawn: float
    pending_payouts: float


# ═══════════════════════════════════════════
# ADMIN STATS
# ═══════════════════════════════════════════
class PayoutStats(BaseModel):
    total_released: float
    pending_payouts: float
    failed_payouts: float
    total_transactions: int