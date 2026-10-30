from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func

from app.core.database import get_session
from app.core.deps import (
    get_current_user, get_current_customer,
    get_current_vendor, get_current_technician, get_current_admin,
)
from app.models.user import User, UserRole
from app.models.payment import Payment, PaymentGateway, PaymentStatus
from app.schemas.payment import (
    RazorpayOrderCreate, RazorpayVerify, CODPaymentCreate,
    FinancePaymentCreate, PaymentResponse, WalletResponse,
)
from app.services import payment_service, razorpay_service, order_service


router = APIRouter(prefix="/api/payments", tags=["Payments & Escrow"])


# ═══════════════════════════════════════════════════════════
# RAZORPAY FLOW
# ═══════════════════════════════════════════════════════════

@router.post("/razorpay/create-order")
def razorpay_create_order(
    data: RazorpayOrderCreate,
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Step 1 of Razorpay: Create a Razorpay order."""
    order = order_service.get_order(session, data.order_id)

    if order.customer_id != customer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    rz_order = razorpay_service.create_razorpay_order(
        amount_in_rupees=order.total_amount,
        receipt=order.order_number,
    )

    payment = payment_service.create_payment_record(
        session=session,
        order=order,
        gateway=PaymentGateway.RAZORPAY,
        razorpay_order_id=rz_order["razorpay_order_id"],
    )

    return {
        "success": True,
        "payment_id": payment.id,
        "razorpay_order_id": rz_order["razorpay_order_id"],
        "razorpay_key_id": rz_order["key_id"],
        "amount": order.total_amount,
        "currency": "INR",
        "order_number": order.order_number,
    }


@router.post("/razorpay/verify", response_model=PaymentResponse)
def razorpay_verify(
    data: RazorpayVerify,
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Step 2 of Razorpay: Verify signature after payment."""
    is_valid = razorpay_service.verify_razorpay_signature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature,
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature",
        )

    payment = session.exec(
        select(Payment).where(Payment.razorpay_order_id == data.razorpay_order_id)
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    payment.razorpay_payment_id = data.razorpay_payment_id
    payment.razorpay_signature = data.razorpay_signature
    session.add(payment)
    session.commit()

    payment = payment_service.mark_payment_held(session, payment)
    return payment


# ═══════════════════════════════════════════════════════════
# CASH ON DELIVERY
# ═══════════════════════════════════════════════════════════

@router.post("/cod", response_model=PaymentResponse, status_code=201)
def create_cod_payment(
    data: CODPaymentCreate,
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Create a Cash-on-Delivery payment."""
    order = order_service.get_order(session, data.order_id)

    if order.customer_id != customer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    payment = payment_service.create_payment_record(
        session=session,
        order=order,
        gateway=PaymentGateway.COD,
        notes=data.notes or "Cash on Delivery",
    )
    return payment


# ═══════════════════════════════════════════════════════════
# FINANCE (EMI)
# ═══════════════════════════════════════════════════════════

@router.post("/finance", response_model=PaymentResponse, status_code=201)
def create_finance_payment(
    data: FinancePaymentCreate,
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Create an EMI / Finance payment."""
    order = order_service.get_order(session, data.order_id)

    if order.customer_id != customer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    payment = payment_service.create_payment_record(
        session=session,
        order=order,
        gateway=PaymentGateway.FINANCE,
        finance_provider=data.finance_provider,
        emi_tenure_months=data.emi_tenure_months,
        notes=data.notes or f"EMI via {data.finance_provider}",
    )
    payment = payment_service.mark_payment_held(session, payment)
    return payment


# ═══════════════════════════════════════════════════════════
# ADMIN: LIST ALL PAYMENTS  ← ✅ NEW
# ═══════════════════════════════════════════════════════════

class PaymentListResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[PaymentResponse]


@router.get("/all", response_model=PaymentListResponse)
def all_payments(
    page: int = 1,
    limit: int = 50,
    status_filter: Optional[PaymentStatus] = None,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin: list all payments with optional status filter."""
    query = select(Payment)

    if status_filter:
        query = query.where(Payment.status == status_filter)

    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    query = query.order_by(Payment.created_at.desc()).offset((page - 1) * limit).limit(limit)
    payments = session.exec(query).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": payments,
    }


# ═══════════════════════════════════════════════════════════
# ADMIN: PAYMENT STATS  ← ✅ NEW
# ═══════════════════════════════════════════════════════════

@router.get("/stats")
def payment_stats(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin: aggregate escrow/payment statistics."""
    total_revenue = float(session.exec(
        select(func.coalesce(func.sum(Payment.amount), 0))
    ).one() or 0)

    admin_commission = float(session.exec(
        select(func.coalesce(func.sum(Payment.admin_share), 0))
        .where(Payment.status == PaymentStatus.RELEASED)
    ).one() or 0)

    funds_in_escrow = float(session.exec(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.status == PaymentStatus.HELD_IN_ESCROW)
    ).one() or 0)

    total_released = float(session.exec(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.status == PaymentStatus.RELEASED)
    ).one() or 0)

    return {
        "success": True,
        "data": {
            "totalRevenue": total_revenue,
            "adminCommission": admin_commission,
            "fundsInEscrow": funds_in_escrow,
            "totalReleased": total_released,
        },
    }


# ═══════════════════════════════════════════════════════════
# ADMIN: RELEASE FUNDS
# ═══════════════════════════════════════════════════════════

@router.post("/{payment_id}/release", response_model=PaymentResponse)
def release_funds(
    payment_id: int,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin releases escrow funds to vendor/technician."""
    return payment_service.release_funds(session, payment_id, admin)


# ═══════════════════════════════════════════════════════════
# WALLETS
# ═══════════════════════════════════════════════════════════

@router.get("/wallet/me", response_model=WalletResponse)
def my_wallet(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get wallet for the logged-in vendor or technician."""
    if current_user.role not in (UserRole.VENDOR, UserRole.TECHNICIAN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and technicians have wallets",
        )
    return payment_service.get_wallet(session, current_user)