from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select, func
from fastapi import HTTPException, status

from app.models.payout import Payout, PayoutStatus
from app.models.payment import Payment, PaymentStatus
from app.models.service import ServiceRequest, ServiceRequestStatus   # ← NEW
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType
from app.schemas.payout import PayoutRequestCreate


# ═══════════════════════════════════════════════════════
# CALCULATE AVAILABLE BALANCE
# ═══════════════════════════════════════════════════════
def calculate_balance(session: Session, user: User) -> dict:
    """
    Calculate vendor/technician wallet from BOTH:
    - Product payments (Payment table)
    - Service requests (ServiceRequest table)
    """
    if user.role not in (UserRole.VENDOR, UserRole.TECHNICIAN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and technicians have wallets",
        )

    # ─── PRODUCT ORDERS (Payment table) ───
    if user.role == UserRole.VENDOR:
        user_filter_payment = Payment.vendor_id == user.id
    else:  # TECHNICIAN
        user_filter_payment = Payment.technician_id == user.id

    released_payments = session.exec(
        select(Payment).where(
            user_filter_payment,
            Payment.status == PaymentStatus.RELEASED,
        )
    ).all()
    payment_released = sum(
        p.vendor_share if user.role == UserRole.VENDOR else p.technician_share
        for p in released_payments
    )

    pending_payments = session.exec(
        select(Payment).where(
            user_filter_payment,
            Payment.status == PaymentStatus.HELD_IN_ESCROW,
        )
    ).all()
    payment_pending = sum(
        p.vendor_share if user.role == UserRole.VENDOR else p.technician_share
        for p in pending_payments
    )

    # ─── SERVICE REQUESTS (ServiceRequest table) ───
    # Only technicians handle services (vendors don't for now)
    if user.role == UserRole.TECHNICIAN:
        # Services with status PAID = released
        released_services = session.exec(
            select(ServiceRequest).where(
                ServiceRequest.technician_id == user.id,
                ServiceRequest.status == ServiceRequestStatus.PAID,
            )
        ).all()
        service_released = sum(s.technician_share for s in released_services)

        # Services with status COMPLETED (waiting for admin release) = pending
        pending_services = session.exec(
            select(ServiceRequest).where(
                ServiceRequest.technician_id == user.id,
                ServiceRequest.status == ServiceRequestStatus.COMPLETED,
            )
        ).all()
        service_pending = sum(s.technician_share for s in pending_services)
    else:
        service_released = 0.0
        service_pending = 0.0

    # ─── Combined totals ───
    total_released = payment_released + service_released
    pending_escrow = payment_pending + service_pending

    # ─── Payouts in progress (deduct from available) ───
    pending_payouts_list = session.exec(
        select(Payout).where(
            Payout.user_id == user.id,
            Payout.status.in_([PayoutStatus.PENDING, PayoutStatus.APPROVED]),
        )
    ).all()
    pending_payouts_total = sum(p.amount for p in pending_payouts_list)

    # ─── Completed payouts ───
    completed_payouts_list = session.exec(
        select(Payout).where(
            Payout.user_id == user.id,
            Payout.status == PayoutStatus.COMPLETED,
        )
    ).all()
    total_withdrawn = sum(p.amount for p in completed_payouts_list)

    available_balance = total_released - pending_payouts_total - total_withdrawn

    return {
        "available_balance": round(max(available_balance, 0), 2),
        "pending_escrow": round(pending_escrow, 2),
        "total_earnings": round(available_balance + pending_escrow + total_withdrawn, 2),
        "total_withdrawn": round(total_withdrawn, 2),
        "pending_payouts": round(pending_payouts_total, 2),
    }


# ═══════════════════════════════════════════════════════
# REQUEST PAYOUT
# ═══════════════════════════════════════════════════════
def request_payout(session: Session, user: User, data: PayoutRequestCreate) -> Payout:
    """Vendor/Technician requests a withdrawal."""
    from app.core.config import settings

    # Minimum amount check
    if data.amount < settings.MIN_PAYOUT_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum payout is ₹{settings.MIN_PAYOUT_AMOUNT}",
        )

    # Check available balance
    balance = calculate_balance(session, user)
    if data.amount > balance["available_balance"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: ₹{balance['available_balance']}",
        )

    # Validate method-specific fields
    if data.payout_method == "bank_transfer":
        if not data.account_number or not data.ifsc_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bank transfer requires account_number and ifsc_code",
            )
    elif data.payout_method == "upi":
        if not data.upi_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="UPI payout requires upi_id",
            )

    # Create payout
    payout = Payout(
        amount=data.amount,
        payout_method=data.payout_method,
        account_name=data.account_name,
        account_number=data.account_number,
        ifsc_code=data.ifsc_code,
        bank_name=data.bank_name,
        upi_id=data.upi_id,
        notes=data.notes,
        user_id=user.id,
        status=PayoutStatus.PENDING,
    )
    session.add(payout)
    session.commit()
    session.refresh(payout)

    # Notify all admins
    admins = session.exec(
        select(User).where(User.role == UserRole.ADMIN)
    ).all()
    for admin in admins:
        session.add(Notification(
            type=NotificationType.PAYOUT,
            title="New Payout Request",
            message=f"{user.name} ({user.role.value}) requested ₹{payout.amount}",
            user_id=admin.id,
            related_id=payout.id,
        ))
    session.commit()

    return payout


# ═══════════════════════════════════════════════════════
# LIST PAYOUTS
# ═══════════════════════════════════════════════════════
def list_payouts(
    session: Session,
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[PayoutStatus] = None,
    user_id: Optional[int] = None,
):
    query = select(Payout)

    if user_id:
        query = query.where(Payout.user_id == user_id)
    if status_filter:
        query = query.where(Payout.status == status_filter)

    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    query = query.offset((page - 1) * limit).limit(limit).order_by(Payout.created_at.desc())
    payouts = session.exec(query).all()

    return {"total": total, "page": page, "limit": limit, "payouts": payouts}


# ═══════════════════════════════════════════════════════
# APPROVE PAYOUT (Admin)
# ═══════════════════════════════════════════════════════
def approve_payout(session: Session, payout_id: int, admin: User) -> Payout:
    payout = session.get(Payout, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")

    if payout.status != PayoutStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payout is already {payout.status.value}",
        )

    payout.status = PayoutStatus.COMPLETED
    payout.processed_by = admin.id
    payout.processed_at = datetime.now(timezone.utc)
    payout.transaction_id = f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    payout.updated_at = datetime.now(timezone.utc)
    session.add(payout)

    session.add(Notification(
        type=NotificationType.PAYOUT,
        title="Payout Approved",
        message=f"Your payout of ₹{payout.amount} has been approved.",
        user_id=payout.user_id,
        related_id=payout.id,
    ))
    session.commit()
    session.refresh(payout)
    return payout


# ═══════════════════════════════════════════════════════
# REJECT PAYOUT (Admin)
# ═══════════════════════════════════════════════════════
def reject_payout(
    session: Session, payout_id: int, admin: User, reason: str
) -> Payout:
    payout = session.get(Payout, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")

    if payout.status != PayoutStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payout is already {payout.status.value}",
        )

    payout.status = PayoutStatus.REJECTED
    payout.processed_by = admin.id
    payout.processed_at = datetime.now(timezone.utc)
    payout.rejection_reason = reason
    payout.updated_at = datetime.now(timezone.utc)
    session.add(payout)

    session.add(Notification(
        type=NotificationType.PAYOUT,
        title="Payout Rejected",
        message=f"Your payout of ₹{payout.amount} was rejected. Reason: {reason}",
        user_id=payout.user_id,
        related_id=payout.id,
    ))
    session.commit()
    session.refresh(payout)
    return payout


# ═══════════════════════════════════════════════════════
# STATS (Admin)
# ═══════════════════════════════════════════════════════
def get_payout_stats(session: Session) -> dict:
    def sum_by_status(statuses):
        query = select(func.coalesce(func.sum(Payout.amount), 0)).where(
            Payout.status.in_(statuses)
        )
        return float(session.exec(query).one() or 0)

    def count_by_status(statuses):
        query = select(func.count()).where(Payout.status.in_(statuses))
        return int(session.exec(query).one() or 0)

    total_released = sum_by_status([PayoutStatus.COMPLETED])
    pending_payouts = sum_by_status([PayoutStatus.PENDING, PayoutStatus.APPROVED])
    failed_payouts = sum_by_status([PayoutStatus.REJECTED, PayoutStatus.FAILED])
    total_transactions = (
        count_by_status([PayoutStatus.COMPLETED])
        + count_by_status([PayoutStatus.PENDING, PayoutStatus.APPROVED])
        + count_by_status([PayoutStatus.REJECTED, PayoutStatus.FAILED])
    )

    return {
        "total_released": total_released,
        "pending_payouts": pending_payouts,
        "failed_payouts": failed_payouts,
        "total_transactions": total_transactions,
    }