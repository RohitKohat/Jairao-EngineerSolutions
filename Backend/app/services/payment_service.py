from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.models.payment import Payment, PaymentStatus, PaymentGateway
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.core.config import settings


def calculate_escrow_split(
    amount: float,
    has_vendor: bool,
    has_technician: bool,
) -> dict:
    """Split amount into admin/vendor/technician shares."""
    commission_rate = settings.ADMIN_COMMISSION_RATE
    admin_share = round(amount * commission_rate / 100, 2)
    remaining = amount - admin_share

    vendor_share = 0.0
    technician_share = 0.0

    if has_vendor and has_technician:
        vendor_share = round(remaining / 2, 2)
        technician_share = round(remaining / 2, 2)
    elif has_vendor:
        vendor_share = remaining
    elif has_technician:
        technician_share = remaining

    return {
        "admin_share": admin_share,
        "vendor_share": vendor_share,
        "technician_share": technician_share,
        "commission_rate": commission_rate,
    }


def get_order_vendor_id(session: Session, order_id: int) -> Optional[int]:
    """Get the vendor_id for an order (from first item)."""
    item = session.exec(
        select(OrderItem).where(OrderItem.order_id == order_id)
    ).first()
    return item.vendor_id if item else None


def create_payment_record(
    session: Session,
    order: Order,
    gateway: PaymentGateway,
    razorpay_order_id: Optional[str] = None,
    razorpay_payment_id: Optional[str] = None,
    razorpay_signature: Optional[str] = None,
    finance_provider: Optional[str] = None,
    emi_tenure_months: Optional[int] = None,
    notes: Optional[str] = None,
) -> Payment:
    """Create a payment record and calculate escrow split."""
    # Prevent duplicates
    existing = session.exec(
        select(Payment).where(Payment.order_id == order.id)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already exists for this order",
        )

    vendor_id = get_order_vendor_id(session, order.id)
    technician_id = order.technician_id

    split = calculate_escrow_split(
        order.total_amount,
        has_vendor=vendor_id is not None,
        has_technician=technician_id is not None,
    )

    # Determine initial status
    # - Razorpay/Finance: PENDING until verification
    # - COD: HELD_IN_ESCROW directly (money is in escrow conceptually)
    initial_status = PaymentStatus.PENDING
    if gateway == PaymentGateway.COD:
        initial_status = PaymentStatus.HELD_IN_ESCROW

    emi_monthly = None
    if emi_tenure_months:
        emi_monthly = round(order.total_amount / emi_tenure_months, 2)

    payment = Payment(
        amount=order.total_amount,
        currency="INR",
        gateway=gateway,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature,
        finance_provider=finance_provider,
        emi_tenure_months=emi_tenure_months,
        emi_monthly_amount=emi_monthly,
        vendor_share=split["vendor_share"],
        technician_share=split["technician_share"],
        admin_share=split["admin_share"],
        commission_rate=split["commission_rate"],
        status=initial_status,
        order_id=order.id,
        vendor_id=vendor_id,
        technician_id=technician_id,
        notes=notes,
    )
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment


def mark_payment_held(session: Session, payment: Payment) -> Payment:
    """Move payment to HELD_IN_ESCROW after verification."""
    payment.status = PaymentStatus.HELD_IN_ESCROW
    payment.updated_at = datetime.now(timezone.utc)
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment


def release_funds(
    session: Session,
    payment_id: int,
    admin: User,
) -> Payment:
    """Admin releases escrow funds to vendor/technician."""
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    if payment.status == PaymentStatus.RELEASED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Funds already released",
        )

    if payment.status != PaymentStatus.HELD_IN_ESCROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot release funds with status: {payment.status.value}",
        )

    payment.status = PaymentStatus.RELEASED
    payment.released_at = datetime.now(timezone.utc)
    payment.released_by = admin.id
    payment.updated_at = datetime.now(timezone.utc)

    session.add(payment)
    session.commit()
    session.refresh(payment)

    # Notify vendor
    if payment.vendor_id and payment.vendor_share > 0:
        session.add(Notification(
            type=NotificationType.PAYOUT,
            title="Payout Released",
            message=f"Admin released ₹{payment.vendor_share:.2f} to your wallet.",
            user_id=payment.vendor_id,
            related_id=payment.id,
        ))

    # Notify technician
    if payment.technician_id and payment.technician_share > 0:
        session.add(Notification(
            type=NotificationType.PAYOUT,
            title="Payout Released",
            message=f"Admin released ₹{payment.technician_share:.2f} to your wallet.",
            user_id=payment.technician_id,
            related_id=payment.id,
        ))

    session.commit()
    return payment


def get_wallet(session: Session, user: User) -> dict:
    """Get wallet stats for a vendor or technician."""
    if user.role.value == "VENDOR":
        share_field = Payment.vendor_share
    elif user.role.value == "TECHNICIAN":
        share_field = Payment.technician_share
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and technicians have wallets",
        )

    # Get payments
    from sqlalchemy import or_
    query = select(Payment).where(
        or_(
            Payment.vendor_id == user.id,
            Payment.technician_id == user.id,
        )
    )
    payments = session.exec(query).all()

    available = 0.0
    pending = 0.0
    released = 0.0

    for p in payments:
        share = p.vendor_share if user.role.value == "VENDOR" else p.technician_share
        if p.status == PaymentStatus.HELD_IN_ESCROW:
            pending += share
        elif p.status == PaymentStatus.RELEASED:
            available += share
            released += share

    return {
        "available_balance": round(available, 2),
        "pending_escrow": round(pending, 2),
        "total_earnings": round(available + pending, 2),
        "total_released": round(released, 2),
    }