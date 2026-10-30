import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select, func
from fastapi import HTTPException, status

from app.models.service import (
    ServiceCatalog, ServiceRequest, ServiceRequestStatus, ServiceCategory,
)
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType
from app.core.config import settings


def generate_request_number() -> str:
    return f"SRV-{uuid.uuid4().hex[:8].upper()}"


# ═══════════════════════════════════════════════════════
# CATALOG OPERATIONS
# ═══════════════════════════════════════════════════════
def create_catalog_item(
    session: Session, provider: User, data
) -> ServiceCatalog:
    """Admin/Vendor/Technician adds a service to the catalog."""
    item = ServiceCatalog(
        name=data.name,
        description=data.description,
        category=data.category,
        base_price=data.base_price,
        estimated_duration_mins=data.estimated_duration_mins,
        provider_type=provider.role.value.lower(),
        provider_id=provider.id,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def list_catalog(session: Session, category: Optional[ServiceCategory] = None):
    query = select(ServiceCatalog).where(ServiceCatalog.is_active == True)
    if category:
        query = query.where(ServiceCatalog.category == category)
    return session.exec(query.order_by(ServiceCatalog.name)).all()


# ═══════════════════════════════════════════════════════
# CUSTOMER: CREATE REQUEST
# ═══════════════════════════════════════════════════════
def create_service_request(session: Session, customer: User, data) -> ServiceRequest:
    """Customer submits a service request."""
    request = ServiceRequest(
        request_number=generate_request_number(),
        customer_id=customer.id,
        customer_name=customer.name,
        customer_phone=data.customer_phone,
        customer_email=customer.email,
        service_catalog_id=data.service_catalog_id,
        service_name=data.service_name,
        category=data.category,
        description=data.description,
        urgency=data.urgency,
        address_line=data.address_line,
        city=data.city,
        state=data.state,
        zip_code=data.zip_code,
        preferred_date=data.preferred_date,
        preferred_time=data.preferred_time,
        customer_notes=data.customer_notes,
        status=ServiceRequestStatus.PENDING,
    )
    session.add(request)
    session.commit()
    session.refresh(request)

    # Notify all admins
    admins = session.exec(select(User).where(User.role == UserRole.ADMIN)).all()
    for admin in admins:
        session.add(Notification(
            type=NotificationType.SERVICE,
            title="New Service Request",
            message=f"{customer.name} requested: {data.service_name} in {data.city}",
            user_id=admin.id,
            related_id=request.id,
        ))
    session.commit()
    return request


# ═══════════════════════════════════════════════════════
# LIST REQUESTS
# ═══════════════════════════════════════════════════════
def list_service_requests(
    session: Session,
    page: int = 1,
    limit: int = 20,
    customer_id: Optional[int] = None,
    technician_id: Optional[int] = None,
    status_filter: Optional[ServiceRequestStatus] = None,
    unassigned_only: bool = False,
):
    query = select(ServiceRequest)

    if customer_id:
        query = query.where(ServiceRequest.customer_id == customer_id)
    if technician_id:
        query = query.where(ServiceRequest.technician_id == technician_id)
    if status_filter:
        query = query.where(ServiceRequest.status == status_filter)
    if unassigned_only:
        query = query.where(ServiceRequest.technician_id == None)

    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    query = query.order_by(ServiceRequest.created_at.desc()).offset((page - 1) * limit).limit(limit)
    requests = session.exec(query).all()

    return {"total": total, "page": page, "limit": limit, "requests": requests}


# ═══════════════════════════════════════════════════════
# ADMIN: ASSIGN TECHNICIAN
# ═══════════════════════════════════════════════════════
def assign_technician(
    session: Session, request_id: int, admin: User, data
) -> ServiceRequest:
    request = session.get(ServiceRequest, request_id)
    if not request:
        raise HTTPException(404, "Service request not found")

    if request.status != ServiceRequestStatus.PENDING:
        raise HTTPException(400, f"Request is already {request.status.value}")

    # Verify technician
    tech = session.get(User, data.technician_id)
    if not tech or tech.role != UserRole.TECHNICIAN:
        raise HTTPException(400, "Invalid technician")

    # Calculate escrow split
    commission = settings.ADMIN_COMMISSION_RATE
    admin_share = round(data.estimated_price * commission / 100, 2)
    tech_share = round(data.estimated_price - admin_share, 2)

    request.technician_id = data.technician_id
    request.assigned_by = admin.id
    request.assigned_at = datetime.now(timezone.utc)
    request.estimated_price = data.estimated_price
    request.admin_share = admin_share
    request.technician_share = tech_share
    request.commission_rate = commission
    request.status = ServiceRequestStatus.ASSIGNED
    if data.admin_notes:
        request.admin_notes = data.admin_notes
    request.updated_at = datetime.now(timezone.utc)
    session.add(request)

    # Notify technician
    session.add(Notification(
        type=NotificationType.SERVICE,
        title="New Job Assigned",
        message=f"Job {request.request_number}: {request.service_name} in {request.city}",
        user_id=data.technician_id,
        related_id=request.id,
    ))

    session.commit()
    session.refresh(request)
    return request


# ═══════════════════════════════════════════════════════
# TECHNICIAN: ACCEPT
# ═══════════════════════════════════════════════════════
def accept_job(session: Session, request_id: int, tech: User, data) -> ServiceRequest:
    request = session.get(ServiceRequest, request_id)
    if not request:
        raise HTTPException(404, "Request not found")

    if request.technician_id != tech.id:
        raise HTTPException(403, "This job isn't assigned to you")

    if request.status != ServiceRequestStatus.ASSIGNED:
        raise HTTPException(400, f"Cannot accept job in {request.status.value} state")

    request.status = ServiceRequestStatus.ACCEPTED
    request.accepted_at = datetime.now(timezone.utc)
    if data.technician_notes:
        request.technician_notes = data.technician_notes
    request.updated_at = datetime.now(timezone.utc)
    session.add(request)

    # Notify customer + admin
    session.add(Notification(
        type=NotificationType.SERVICE,
        title="Technician Accepted",
        message=f"Your request {request.request_number} has been accepted by {tech.name}",
        user_id=request.customer_id,
        related_id=request.id,
    ))

    session.commit()
    session.refresh(request)
    return request


# ═══════════════════════════════════════════════════════
# TECHNICIAN: START
# ═══════════════════════════════════════════════════════
def start_job(session: Session, request_id: int, tech: User) -> ServiceRequest:
    request = session.get(ServiceRequest, request_id)
    if not request or request.technician_id != tech.id:
        raise HTTPException(404, "Job not found")

    if request.status != ServiceRequestStatus.ACCEPTED:
        raise HTTPException(400, f"Cannot start job in {request.status.value} state")

    request.status = ServiceRequestStatus.IN_PROGRESS
    request.started_at = datetime.now(timezone.utc)
    request.updated_at = datetime.now(timezone.utc)
    session.add(request)
    session.commit()
    session.refresh(request)
    return request


# ═══════════════════════════════════════════════════════
# TECHNICIAN: COMPLETE — WITH AUTO-RELEASE
# ═══════════════════════════════════════════════════════
def complete_job(session: Session, request_id: int, tech: User, data) -> ServiceRequest:
    """
    Technician marks job complete.
    Escrow split calculated. Admin notified for fund release.
    """
    request = session.get(ServiceRequest, request_id)
    if not request or request.technician_id != tech.id:
        raise HTTPException(404, "Job not found")

    if request.status not in (ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.IN_PROGRESS):
        raise HTTPException(400, f"Cannot complete job in {request.status.value} state")

    # Recalculate split with final price
    commission = settings.ADMIN_COMMISSION_RATE
    admin_share = round(data.final_price * commission / 100, 2)
    tech_share = round(data.final_price - admin_share, 2)

    request.status = ServiceRequestStatus.COMPLETED
    request.final_price = data.final_price
    request.admin_share = admin_share
    request.technician_share = tech_share
    request.completed_at = datetime.now(timezone.utc)
    if data.technician_notes:
        request.technician_notes = data.technician_notes
    request.updated_at = datetime.now(timezone.utc)
    session.add(request)

    # Notify customer
    session.add(Notification(
        type=NotificationType.SERVICE,
        title="Service Completed",
        message=f"Job {request.request_number} completed. Please pay ₹{data.final_price}",
        user_id=request.customer_id,
        related_id=request.id,
    ))

    # Notify all admins (ready for release)
    admins = session.exec(select(User).where(User.role == UserRole.ADMIN)).all()
    for admin in admins:
        session.add(Notification(
            type=NotificationType.SERVICE,
            title="Job Completed — Ready for Release",
            message=f"Job {request.request_number} by {tech.name} — ₹{tech_share} ready for release",
            user_id=admin.id,
            related_id=request.id,
        ))

    session.commit()
    session.refresh(request)
    print(f"✅ Job {request.request_number} completed. ₹{tech_share} awaiting admin release.")
    return request


# ═══════════════════════════════════════════════════════
# ADMIN: UPDATE STATUS (Cancel, Mark PAID, etc.)
# ═══════════════════════════════════════════════════════
def update_status(
    session: Session, request_id: int, admin: User, data
) -> ServiceRequest:
    request = session.get(ServiceRequest, request_id)
    if not request:
        raise HTTPException(404, "Request not found")

    old_status = request.status
    request.status = data.status
    if data.admin_notes:
        request.admin_notes = data.admin_notes

    # Set paid_at when status becomes PAID
    if data.status == ServiceRequestStatus.PAID and old_status != ServiceRequestStatus.PAID:
        request.paid_at = datetime.now(timezone.utc)

        # Notify technician that funds released
        if request.technician_id:
            session.add(Notification(
                type=NotificationType.PAYOUT,
                title="Funds Released",
                message=f"₹{request.technician_share:.2f} released for job {request.request_number}.",
                user_id=request.technician_id,
                related_id=request.id,
            ))

    request.updated_at = datetime.now(timezone.utc)
    session.add(request)
    session.commit()
    session.refresh(request)
    return request