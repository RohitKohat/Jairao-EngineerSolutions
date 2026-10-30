from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.deps import (
    get_current_user, get_current_customer,
    get_current_vendor, get_current_admin,
)
from app.models.user import User, UserRole
from app.models.order import OrderStatus
from app.models.product import Product
from app.models.payment import Payment
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderStatusUpdate,
    OrderListResponse, OrderItemResponse,
)
from app.services import order_service, pdf_service


router = APIRouter(prefix="/api/orders", tags=["Orders"])


# ═══════════════════════════════════════════════════════
# HELPER: Serialize order to response dict
# ═══════════════════════════════════════════════════════
def _serialize_order(session: Session, order) -> dict:
    items = order_service.get_order_items(session, order.id)
    item_responses = []
    for it in items:
        item_responses.append(OrderItemResponse(
            id=it.id,
            product_id=it.product_id,
            vendor_id=it.vendor_id,
            quantity=it.quantity,
            unit_price=it.unit_price,
            total_price=it.total_price,
        ))
    return {
        "id": order.id,
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "status": order.status,
        "customer_id": order.customer_id,
        "technician_id": order.technician_id,
        "address_line": order.address_line,
        "city": order.city,
        "state": order.state,
        "zip_code": order.zip_code,
        "country": order.country,
        "phone": order.phone,
        "items": item_responses,
        "created_at": order.created_at,
    }


# ═══════════════════════════════════════════════════════
# CREATE ORDER (Customer)
# ═══════════════════════════════════════════════════════
@router.post("", response_model=OrderResponse, status_code=201)
def create_order(
    data: OrderCreate,
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Customer places an order."""
    order = order_service.create_order(session, customer, data)
    return _serialize_order(session, order)


# ═══════════════════════════════════════════════════════
# LIST MY ORDERS (Customer)
# ═══════════════════════════════════════════════════════
@router.get("/my-orders", response_model=OrderListResponse)
def my_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Customer views their own orders."""
    result = order_service.list_orders(session, page, limit, customer_id=customer.id)
    return {
        **result,
        "orders": [_serialize_order(session, o) for o in result["orders"]],
    }


# ═══════════════════════════════════════════════════════
# LIST VENDOR ORDERS (Vendor)
# ═══════════════════════════════════════════════════════
@router.get("/vendor-orders", response_model=OrderListResponse)
def vendor_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    vendor: User = Depends(get_current_vendor),
    session: Session = Depends(get_session),
):
    """Vendor sees orders containing their products."""
    result = order_service.list_orders(session, page, limit, vendor_id=vendor.id)
    return {
        **result,
        "orders": [_serialize_order(session, o) for o in result["orders"]],
    }


# ═══════════════════════════════════════════════════════
# LIST ALL ORDERS (Admin)
# ═══════════════════════════════════════════════════════
@router.get("/all", response_model=OrderListResponse)
def all_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin views all orders."""
    result = order_service.list_orders(session, page, limit, status=status)
    return {
        **result,
        "orders": [_serialize_order(session, o) for o in result["orders"]],
    }


# ═══════════════════════════════════════════════════════
# GET SINGLE ORDER
# ═══════════════════════════════════════════════════════
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get single order — customer, admin, or owning vendor."""
    order = order_service.get_order(session, order_id)

    if current_user.role == UserRole.ADMIN:
        pass  # admin can view all
    elif current_user.role == UserRole.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    elif current_user.role == UserRole.VENDOR:
        items = order_service.get_order_items(session, order_id)
        if not any(it.vendor_id == current_user.id for it in items):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return _serialize_order(session, order)


# ═══════════════════════════════════════════════════════
# UPDATE ORDER STATUS (Admin)
# ═══════════════════════════════════════════════════════
@router.put("/{order_id}/status", response_model=OrderResponse)
def update_status(
    order_id: int,
    data: OrderStatusUpdate,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Update order status — admin only."""
    order = order_service.update_order_status(session, order_id, data)
    return _serialize_order(session, order)


# ═══════════════════════════════════════════════════════
# UPDATE ORDER STATUS (Vendor)  ← ✅ NEW
# ═══════════════════════════════════════════════════════
@router.put("/{order_id}/vendor-status", response_model=OrderResponse)
def vendor_update_status(
    order_id: int,
    data: OrderStatusUpdate,
    vendor: User = Depends(get_current_vendor),
    session: Session = Depends(get_session),
):
    """Vendor updates order status (PROCESSING → DISPATCHED → DELIVERED)."""
    order = order_service.update_order_status_by_vendor(
        session, order_id, vendor, data.status
    )
    return _serialize_order(session, order)


# ═══════════════════════════════════════════════════════
# DOWNLOAD INVOICE PDF
# ═══════════════════════════════════════════════════════
@router.get("/{order_id}/invoice")
def download_invoice(
    order_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Download PDF invoice for an order.
    Access: customer who ordered it, admin, or owning vendor.
    """
    order = order_service.get_order(session, order_id)

    # Access check
    if current_user.role == UserRole.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if current_user.role == UserRole.VENDOR:
        items = order_service.get_order_items(session, order_id)
        if not any(it.vendor_id == current_user.id for it in items):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    # Get customer
    customer = session.get(User, order.customer_id)

    # Build items list with product names
    raw_items = order_service.get_order_items(session, order.id)
    items_list = []
    subtotal = 0.0
    total_discount = 0.0

    for it in raw_items:
        product = session.get(Product, it.product_id)
        item_name = product.name if product else f"Product #{it.product_id}"
        items_list.append({
            "name": item_name,
            "qty": it.quantity,
            "unit_price": it.unit_price,
            "total": it.total_price,
        })

        # Compute pre-discount subtotal
        if product:
            pre_discount = product.price * it.quantity
            subtotal += pre_discount
            total_discount += (pre_discount - it.total_price)
        else:
            subtotal += it.total_price

    # Payment method
    payment = session.exec(
        select(Payment).where(Payment.order_id == order.id)
    ).first()
    payment_method = payment.gateway.value if payment else "Not Selected"

    # Address string
    address = ", ".join(filter(None, [
        order.address_line, order.city, order.state,
        order.zip_code, order.country,
    ]))

    # Generate PDF
    pdf_bytes = pdf_service.generate_order_invoice(
        order_number=order.order_number,
        customer_name=customer.name if customer else "Customer",
        customer_email=customer.email if customer else "",
        customer_phone=order.phone or (customer.phone if customer else "") or "",
        address=address,
        items=items_list,
        subtotal=round(subtotal, 2),
        discount=round(total_discount, 2),
        total=order.total_amount,
        order_date=order.created_at,
        payment_method=payment_method,
        status=order.status.value,
    )

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="invoice-{order.order_number}.pdf"',
        },
    )