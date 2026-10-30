import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select, func
from fastapi import HTTPException, status

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.payment import Payment, PaymentStatus
from app.models.notification import Notification, NotificationType
from app.schemas.order import OrderCreate, OrderStatusUpdate


def generate_order_number() -> str:
    return f"ORD-{uuid.uuid4().hex[:8].upper()}"


# ═══════════════════════════════════════════════════════
# CREATE ORDER
# ═══════════════════════════════════════════════════════
def create_order(session: Session, customer: User, data: OrderCreate) -> Order:
    """Customer creates an order."""
    product_ids = [item.product_id for item in data.items]
    products = session.exec(
        select(Product).where(Product.id.in_(product_ids), Product.is_active == True)
    ).all()

    if len(products) != len(product_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more products are unavailable",
        )

    product_map = {p.id: p for p in products}

    # Calculate total
    total = 0.0
    for item in data.items:
        product = product_map[item.product_id]
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}",
            )
        total += product.final_price * item.quantity

    # Create order
    order = Order(
        order_number=generate_order_number(),
        total_amount=round(total, 2),
        customer_id=customer.id,
        address_line=data.address_line,
        city=data.city,
        state=data.state,
        zip_code=data.zip_code,
        country=data.country,
        phone=data.phone,
        status=OrderStatus.PENDING,
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    # Create order items and reduce stock
    vendor_ids = set()
    for item in data.items:
        product = product_map[item.product_id]
        line_total = round(product.final_price * item.quantity, 2)

        session.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            vendor_id=product.vendor_id,
            quantity=item.quantity,
            unit_price=product.final_price,
            total_price=line_total,
        ))

        product.stock -= item.quantity
        session.add(product)
        vendor_ids.add(product.vendor_id)

    # Notify each vendor
    for vid in vendor_ids:
        session.add(Notification(
            type=NotificationType.ORDER,
            title="New Order Received",
            message=f"You have a new order {order.order_number} for ₹{order.total_amount}.",
            user_id=vid,
            related_id=order.id,
        ))

    session.commit()
    session.refresh(order)
    return order


# ═══════════════════════════════════════════════════════
# GETTERS
# ═══════════════════════════════════════════════════════
def get_order(session: Session, order_id: int) -> Order:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order


def get_order_items(session: Session, order_id: int) -> list:
    return session.exec(
        select(OrderItem).where(OrderItem.order_id == order_id)
    ).all()


# ═══════════════════════════════════════════════════════
# LIST ORDERS
# ═══════════════════════════════════════════════════════
def list_orders(
    session: Session,
    page: int = 1,
    limit: int = 20,
    customer_id: Optional[int] = None,
    vendor_id: Optional[int] = None,
    status: Optional[OrderStatus] = None,
):
    """List orders with role-based filtering."""
    query = select(Order)

    if customer_id:
        query = query.where(Order.customer_id == customer_id)

    if vendor_id:
        vendor_order_ids = session.exec(
            select(OrderItem.order_id).where(OrderItem.vendor_id == vendor_id)
        ).all()
        if not vendor_order_ids:
            return {"total": 0, "page": page, "limit": limit, "orders": []}
        query = query.where(Order.id.in_(vendor_order_ids))

    if status:
        query = query.where(Order.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    query = query.offset((page - 1) * limit).limit(limit).order_by(Order.created_at.desc())
    orders = session.exec(query).all()

    return {"total": total, "page": page, "limit": limit, "orders": orders}


# ═══════════════════════════════════════════════════════
# AUTO-RELEASE HELPER
# ═══════════════════════════════════════════════════════
def _auto_release_payment(session: Session, order: Order) -> Optional[Payment]:
    """Auto-release escrow payment when order is delivered."""
    try:
        payment = session.exec(
            select(Payment).where(Payment.order_id == order.id)
        ).first()

        if not payment:
            print(f"ℹ️  No payment found for order {order.order_number}")
            return None

        if payment.status != PaymentStatus.HELD_IN_ESCROW:
            print(f"ℹ️  Payment for {order.order_number} is in {payment.status.value} — skipping auto-release")
            return None

        # Release
        payment.status = PaymentStatus.RELEASED
        payment.released_at = datetime.now(timezone.utc)
        payment.released_by = None  # NULL = auto-released
        payment.notes = (payment.notes or "") + " | Auto-released on delivery"
        payment.updated_at = datetime.now(timezone.utc)
        session.add(payment)

        # Notify vendor
        if payment.vendor_id and payment.vendor_share > 0:
            session.add(Notification(
                type=NotificationType.PAYOUT,
                title="Funds Auto-Released",
                message=f"₹{payment.vendor_share:.2f} released to your wallet (order {order.order_number}).",
                user_id=payment.vendor_id,
                related_id=payment.id,
            ))

        # Notify technician (if any)
        if payment.technician_id and payment.technician_share > 0:
            session.add(Notification(
                type=NotificationType.PAYOUT,
                title="Funds Auto-Released",
                message=f"₹{payment.technician_share:.2f} released to your wallet (order {order.order_number}).",
                user_id=payment.technician_id,
                related_id=payment.id,
            ))

        # Notify all admins
        admins = session.exec(select(User).where(User.role == UserRole.ADMIN)).all()
        for admin in admins:
            session.add(Notification(
                type=NotificationType.PAYOUT,
                title="Auto-Release Triggered",
                message=f"Order {order.order_number} delivered. ₹{payment.amount:.2f} released automatically.",
                user_id=admin.id,
                related_id=payment.id,
            ))

        print(f"✅ Auto-released ₹{payment.amount:.2f} for order {order.order_number}")
        return payment
    except Exception as e:
        print(f"⚠️  Auto-release failed for order {order.order_number}: {e}")
        return None


# ═══════════════════════════════════════════════════════
# UPDATE STATUS (Admin)
# ═══════════════════════════════════════════════════════
def update_order_status(
    session: Session, order_id: int, data: OrderStatusUpdate
) -> Order:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    old_status = order.status
    order.status = data.status
    order.updated_at = datetime.now(timezone.utc)
    session.add(order)

    # Notify customer on status change
    if old_status != data.status:
        session.add(Notification(
            type=NotificationType.ORDER,
            title=f"Order {data.status.value}",
            message=f"Your order {order.order_number} is now {data.status.value}.",
            user_id=order.customer_id,
            related_id=order.id,
        ))

    # Auto-release if admin marks DELIVERED
    if data.status == OrderStatus.DELIVERED and old_status != OrderStatus.DELIVERED:
        _auto_release_payment(session, order)

    session.commit()
    session.refresh(order)
    return order


# ═══════════════════════════════════════════════════════
# UPDATE STATUS (Vendor) — WITH AUTO-RELEASE
# ═══════════════════════════════════════════════════════
def update_order_status_by_vendor(
    session: Session, order_id: int, vendor: User, new_status: OrderStatus
) -> Order:
    """Vendor updates status. Auto-releases escrow when DELIVERED."""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check vendor owns at least one item
    items = session.exec(
        select(OrderItem).where(OrderItem.order_id == order_id)
    ).all()
    if not any(it.vendor_id == vendor.id for it in items):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update orders for your own products",
        )

    # Vendor allowed statuses
    allowed_statuses = {
        OrderStatus.PROCESSING,
        OrderStatus.DISPATCHED,
        OrderStatus.DELIVERED,
    }
    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendors cannot set status to {new_status.value}",
        )

    # Prevent going backwards
    status_order = {
        OrderStatus.PENDING: 0,
        OrderStatus.CONFIRMED: 1,
        OrderStatus.PROCESSING: 2,
        OrderStatus.DISPATCHED: 3,
        OrderStatus.DELIVERED: 4,
        OrderStatus.CANCELLED: 99,
    }
    if status_order.get(new_status, 0) < status_order.get(order.status, 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot revert from {order.status.value} to {new_status.value}",
        )

    old_status = order.status
    order.status = new_status
    order.updated_at = datetime.now(timezone.utc)
    session.add(order)

    # Notify customer
    session.add(Notification(
        type=NotificationType.ORDER,
        title=f"Order {new_status.value}",
        message=f"Your order {order.order_number} is now {new_status.value}.",
        user_id=order.customer_id,
        related_id=order.id,
    ))

    # 🎯 AUTO-RELEASE ON DELIVERY
    if new_status == OrderStatus.DELIVERED and old_status != OrderStatus.DELIVERED:
        _auto_release_payment(session, order)

    session.commit()
    session.refresh(order)
    return order