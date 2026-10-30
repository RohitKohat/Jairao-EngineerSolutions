from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlmodel import Session, select, func, or_

from app.core.database import get_session
from app.core.deps import get_current_admin
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.models.payout import Payout, PayoutStatus
from app.models.service import ServiceRequest, ServiceRequestStatus

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ═══════════════════════════════════════════════════════════
# DASHBOARD OVERVIEW
# ═══════════════════════════════════════════════════════════
@router.get("/dashboard-stats")
def dashboard_stats(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    total_users = session.exec(select(func.count()).select_from(User)).one()
    total_vendors = session.exec(select(func.count()).where(User.role == UserRole.VENDOR)).one()
    total_technicians = session.exec(select(func.count()).where(User.role == UserRole.TECHNICIAN)).one()
    total_customers = session.exec(select(func.count()).where(User.role == UserRole.CUSTOMER)).one()
    total_products = session.exec(select(func.count()).where(Product.is_active == True)).one()
    total_orders = session.exec(select(func.count()).select_from(Order)).one()
    pending_orders = session.exec(select(func.count()).where(Order.status == OrderStatus.PENDING)).one()
    delivered_orders = session.exec(select(func.count()).where(Order.status == OrderStatus.DELIVERED)).one()

    total_revenue = float(session.exec(select(func.coalesce(func.sum(Payment.amount), 0))).one() or 0)
    admin_commission = float(session.exec(select(func.coalesce(func.sum(Payment.admin_share), 0)).where(Payment.status == PaymentStatus.RELEASED)).one() or 0)
    escrow_held = float(session.exec(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == PaymentStatus.HELD_IN_ESCROW)).one() or 0)
    pending_payouts = float(session.exec(select(func.coalesce(func.sum(Payout.amount), 0)).where(Payout.status == PayoutStatus.PENDING)).one() or 0)

    total_services = session.exec(select(func.count()).select_from(ServiceRequest)).one()
    pending_services = session.exec(select(func.count()).where(ServiceRequest.status == ServiceRequestStatus.PENDING)).one()

    return {
        "users": {"total": total_users, "vendors": total_vendors, "technicians": total_technicians, "customers": total_customers},
        "products": {"total": total_products},
        "orders": {"total": total_orders, "pending": pending_orders, "delivered": delivered_orders},
        "services": {"total": total_services, "pending": pending_services},
        "financials": {"total_revenue": round(total_revenue, 2), "admin_commission": round(admin_commission, 2), "escrow_held": round(escrow_held, 2), "pending_payouts": round(pending_payouts, 2)},
    }

# ═══════════════════════════════════════════════════════════
# LIST USERS / VENDORS / TECHNICIANS
# ═══════════════════════════════════════════════════════════
@router.get("/users")
def list_users(role: Optional[UserRole] = None, search: Optional[str] = None, is_active: Optional[bool] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), admin: User = Depends(get_current_admin), session: Session = Depends(get_session)):
    query = select(User)
    if role: query = query.where(User.role == role)
    if is_active is not None: query = query.where(User.is_active == is_active)
    if search:
        term = f"%{search}%"
        query = query.where(or_(User.name.ilike(term), User.email.ilike(term)))
    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    query = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit)
    users = session.exec(query).all()
    return {
        "total": total, "page": page, "limit": limit,
        "users": [{"id": u.id, "name": u.name, "email": u.email, "phone": u.phone, "role": u.role.value, "is_active": u.is_active, "company": u.company, "primary_skill": u.primary_skill, "created_at": u.created_at} for u in users],
    }

@router.get("/vendors")
def list_vendors(search: Optional[str] = None, is_active: Optional[bool] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), admin: User = Depends(get_current_admin), session: Session = Depends(get_session)):
    query = select(User).where(User.role == UserRole.VENDOR)
    if search:
        term = f"%{search}%"
        query = query.where(or_(User.name.ilike(term), User.email.ilike(term), User.company.ilike(term)))
    if is_active is not None: query = query.where(User.is_active == is_active)
    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    query = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit)
    vendors = session.exec(query).all()
    result = []
    for v in vendors:
        products_count = session.exec(select(func.count()).where(Product.vendor_id == v.id, Product.is_active == True)).one()
        vendor_order_ids = session.exec(select(OrderItem.order_id).where(OrderItem.vendor_id == v.id).distinct()).all()
        total_sales = float(session.exec(select(func.coalesce(func.sum(OrderItem.total_price), 0)).where(OrderItem.vendor_id == v.id)).one() or 0)
        released_payments = session.exec(select(Payment).where(Payment.vendor_id == v.id, Payment.status == PaymentStatus.RELEASED)).all()
        released_sum = sum(p.vendor_share for p in released_payments)
        pending_payments = session.exec(select(Payment).where(Payment.vendor_id == v.id, Payment.status == PaymentStatus.HELD_IN_ESCROW)).all()
        pending_sum = sum(p.vendor_share for p in pending_payments)
        pending_payouts_sum = float(session.exec(select(func.coalesce(func.sum(Payout.amount), 0)).where(Payout.user_id == v.id, Payout.status.in_([PayoutStatus.PENDING, PayoutStatus.APPROVED]))).one() or 0)
        withdrawn_sum = float(session.exec(select(func.coalesce(func.sum(Payout.amount), 0)).where(Payout.user_id == v.id, Payout.status == PayoutStatus.COMPLETED)).one() or 0)
        available = released_sum - pending_payouts_sum - withdrawn_sum
        result.append({
            "id": v.id, "name": v.name, "email": v.email, "phone": v.phone, "company": v.company, "is_active": v.is_active, "created_at": v.created_at,
            "stats": {"products_count": products_count, "total_orders": len(vendor_order_ids), "total_sales": round(total_sales, 2), "available_balance": round(max(available, 0), 2), "pending_escrow": round(pending_sum, 2), "total_withdrawn": round(withdrawn_sum, 2)},
        })
    return {"total": total, "page": page, "limit": limit, "vendors": result}

@router.get("/technicians")
def list_technicians(search: Optional[str] = None, is_active: Optional[bool] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), admin: User = Depends(get_current_admin), session: Session = Depends(get_session)):
    query = select(User).where(User.role == UserRole.TECHNICIAN)
    if search:
        term = f"%{search}%"
        query = query.where(or_(User.name.ilike(term), User.email.ilike(term), User.primary_skill.ilike(term)))
    if is_active is not None: query = query.where(User.is_active == is_active)
    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    query = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit)
    technicians = session.exec(query).all()
    result = []
    for t in technicians:
        jobs_total = session.exec(select(func.count()).where(ServiceRequest.technician_id == t.id)).one()
        jobs_completed = session.exec(select(func.count()).where(ServiceRequest.technician_id == t.id, ServiceRequest.status.in_([ServiceRequestStatus.COMPLETED, ServiceRequestStatus.PAID]))).one()
        jobs_active = session.exec(select(func.count()).where(ServiceRequest.technician_id == t.id, ServiceRequest.status.in_([ServiceRequestStatus.ASSIGNED, ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.IN_PROGRESS]))).one()
        paid_services = session.exec(select(ServiceRequest).where(ServiceRequest.technician_id == t.id, ServiceRequest.status == ServiceRequestStatus.PAID)).all()
        service_released = sum(s.technician_share for s in paid_services)
        released_payments = session.exec(select(Payment).where(Payment.technician_id == t.id, Payment.status == PaymentStatus.RELEASED)).all()
        product_released = sum(p.technician_share for p in released_payments)
        completed_services = session.exec(select(ServiceRequest).where(ServiceRequest.technician_id == t.id, ServiceRequest.status == ServiceRequestStatus.COMPLETED)).all()
        service_pending = sum(s.technician_share for s in completed_services)
        pending_payments = session.exec(select(Payment).where(Payment.technician_id == t.id, Payment.status == PaymentStatus.HELD_IN_ESCROW)).all()
        product_pending = sum(p.technician_share for p in pending_payments)
        pending_payouts_sum = float(session.exec(select(func.coalesce(func.sum(Payout.amount), 0)).where(Payout.user_id == t.id, Payout.status.in_([PayoutStatus.PENDING, PayoutStatus.APPROVED]))).one() or 0)
        withdrawn_sum = float(session.exec(select(func.coalesce(func.sum(Payout.amount), 0)).where(Payout.user_id == t.id, Payout.status == PayoutStatus.COMPLETED)).one() or 0)
        total_released = service_released + product_released
        available = total_released - pending_payouts_sum - withdrawn_sum
        result.append({
            "id": t.id, "name": t.name, "email": t.email, "phone": t.phone, "primary_skill": t.primary_skill, "is_active": t.is_active, "created_at": t.created_at,
            "stats": {"total_jobs": jobs_total, "jobs_completed": jobs_completed, "active_jobs": jobs_active, "available_balance": round(max(available, 0), 2), "pending_escrow": round(service_pending + product_pending, 2), "total_withdrawn": round(withdrawn_sum, 2)},
        })
    return {"total": total, "page": page, "limit": limit, "technicians": result}

@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int, admin: User = Depends(get_current_admin), session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user: raise HTTPException(404, "User not found")
    if user.role == UserRole.ADMIN: raise HTTPException(400, "Cannot suspend admin accounts")
    user.is_active = not user.is_active
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role.value, "is_active": user.is_active, "message": f"User {'activated' if user.is_active else 'suspended'}"}

# ═══════════════════════════════════════════════════════════
# SERVICE REQUESTS & ASSIGNMENT (SAFE FALLBACK)
# ═══════════════════════════════════════════════════════════
@router.get("/services")
def list_service_requests(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """List all service requests."""
    try:
        # Just return the database objects directly. FastAPI will serialize them automatically.
        query = select(ServiceRequest).order_by(ServiceRequest.created_at.desc())
        return session.exec(query).all()
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/services/{request_id}/assign")
def assign_technician(
    request_id: int,
    data: dict,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    req = session.get(ServiceRequest, request_id)
    if not req: raise HTTPException(404, "Service request not found")
    tech_id = data.get("technician_id")
    if not tech_id: raise HTTPException(400, "Technician ID is required")
    tech = session.get(User, tech_id)
    if not tech or tech.role != UserRole.TECHNICIAN: raise HTTPException(400, "Invalid technician")
        
    req.technician_id = tech.id
    req.status = ServiceRequestStatus.ASSIGNED
    session.add(req)
    session.commit()
    return {"success": True, "message": f"Assigned to {tech.name}"}