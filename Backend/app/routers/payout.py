from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import (
    get_current_user, get_current_vendor,
    get_current_technician, get_current_admin,
)
from app.models.user import User, UserRole
from app.models.payout import PayoutStatus
from app.schemas.payout import (
    PayoutRequestCreate, PayoutResponse, PayoutListResponse,
    PayoutRejectRequest, WalletSummary, PayoutStats,
)
from app.services import payout_service


router = APIRouter(prefix="/api/payouts", tags=["Payouts"])


# ═══════════════════════════════════════════
# VENDOR / TECHNICIAN ENDPOINTS
# ═══════════════════════════════════════════

@router.post("/request", response_model=PayoutResponse, status_code=201)
def request_payout(
    data: PayoutRequestCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Vendor/Technician requests a withdrawal."""
    if current_user.role not in (UserRole.VENDOR, UserRole.TECHNICIAN):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and technicians can request payouts",
        )
    return payout_service.request_payout(session, current_user, data)


@router.get("/my", response_model=PayoutListResponse)
def my_payouts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get my payout history."""
    return payout_service.list_payouts(
        session, page, limit, user_id=current_user.id
    )


@router.get("/wallet/summary", response_model=WalletSummary)
def wallet_summary(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get wallet balance summary — vendors/technicians only."""
    return payout_service.calculate_balance(session, current_user)


# ═══════════════════════════════════════════
# ADMIN ENDPOINTS
# ═══════════════════════════════════════════

@router.get("/all", response_model=PayoutListResponse)
def all_payouts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[PayoutStatus] = Query(None, alias="status"),
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin views all payout requests."""
    return payout_service.list_payouts(session, page, limit, status_filter=status_filter)


@router.get("/stats", response_model=PayoutStats)
def payout_stats(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin views payout statistics."""
    return payout_service.get_payout_stats(session)


@router.put("/{payout_id}/approve", response_model=PayoutResponse)
def approve_payout(
    payout_id: int,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin approves a payout."""
    return payout_service.approve_payout(session, payout_id, admin)


@router.put("/{payout_id}/reject", response_model=PayoutResponse)
def reject_payout(
    payout_id: int,
    data: PayoutRejectRequest,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin rejects a payout with a reason."""
    return payout_service.reject_payout(session, payout_id, admin, data.reason)