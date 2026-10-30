from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import (
    get_current_user, get_current_customer,
    get_current_vendor, get_current_technician, get_current_admin,
)
from app.models.user import User, UserRole
from app.models.service import ServiceCategory, ServiceRequestStatus
from app.schemas.service import (
    ServiceCatalogCreate, ServiceCatalogResponse,
    ServiceRequestCreate, ServiceRequestAssign, ServiceRequestAccept,
    ServiceRequestComplete, ServiceRequestStatusUpdate,
    ServiceRequestResponse, ServiceRequestListResponse,
)
from app.services import service_service


router = APIRouter(prefix="/api/services", tags=["Services"])


# ═══════════════════════════════════════════════════════
# CATALOG (Public read, Admin/Vendor/Tech write)
# ═══════════════════════════════════════════════════════
@router.get("/catalog")
def list_catalog(
    category: Optional[ServiceCategory] = None,
    session: Session = Depends(get_session),
):
    """Public: browse available services."""
    return service_service.list_catalog(session, category=category)


@router.post("/catalog", response_model=ServiceCatalogResponse, status_code=201)
def create_catalog_item(
    data: ServiceCatalogCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Any logged-in user with appropriate role can add a service to catalog."""
    if current_user.role not in (UserRole.ADMIN, UserRole.VENDOR, UserRole.TECHNICIAN):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins, vendors, technicians can add services",
        )
    return service_service.create_catalog_item(session, current_user, data)


# ═══════════════════════════════════════════════════════
# CUSTOMER: REQUEST A SERVICE
# ═══════════════════════════════════════════════════════
@router.post("/requests", response_model=ServiceRequestResponse, status_code=201)
def create_request(
    data: ServiceRequestCreate,
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Customer submits a service request."""
    return service_service.create_service_request(session, customer, data)


@router.get("/requests/my", response_model=ServiceRequestListResponse)
def my_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    customer: User = Depends(get_current_customer),
    session: Session = Depends(get_session),
):
    """Customer sees their own service requests."""
    return service_service.list_service_requests(
        session, page=page, limit=limit, customer_id=customer.id
    )


# ═══════════════════════════════════════════════════════
# ADMIN: MANAGE REQUESTS
# ═══════════════════════════════════════════════════════
@router.get("/requests/admin", response_model=ServiceRequestListResponse)
def admin_list_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[ServiceRequestStatus] = Query(None, alias="status"),
    unassigned_only: bool = False,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin views all service requests."""
    return service_service.list_service_requests(
        session, page=page, limit=limit,
        status_filter=status_filter, unassigned_only=unassigned_only,
    )


@router.put("/requests/{request_id}/assign", response_model=ServiceRequestResponse)
def assign_technician(
    request_id: int,
    data: ServiceRequestAssign,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin assigns a technician to a request."""
    return service_service.assign_technician(session, request_id, admin, data)


@router.put("/requests/{request_id}/status", response_model=ServiceRequestResponse)
def admin_update_status(
    request_id: int,
    data: ServiceRequestStatusUpdate,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Admin updates request status (cancel, etc.)."""
    return service_service.update_status(session, request_id, admin, data)


# ═══════════════════════════════════════════════════════
# TECHNICIAN: MY JOBS
# ═══════════════════════════════════════════════════════
@router.get("/requests/technician", response_model=ServiceRequestListResponse)
def my_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[ServiceRequestStatus] = Query(None, alias="status"),
    technician: User = Depends(get_current_technician),
    session: Session = Depends(get_session),
):
    """Technician sees jobs assigned to them."""
    return service_service.list_service_requests(
        session, page=page, limit=limit,
        technician_id=technician.id, status_filter=status_filter,
    )


@router.put("/requests/{request_id}/accept", response_model=ServiceRequestResponse)
def accept_job(
    request_id: int,
    data: ServiceRequestAccept,
    technician: User = Depends(get_current_technician),
    session: Session = Depends(get_session),
):
    """Technician accepts assigned job."""
    return service_service.accept_job(session, request_id, technician, data)


@router.put("/requests/{request_id}/start", response_model=ServiceRequestResponse)
def start_job(
    request_id: int,
    technician: User = Depends(get_current_technician),
    session: Session = Depends(get_session),
):
    """Technician marks job as started."""
    return service_service.start_job(session, request_id, technician)


@router.put("/requests/{request_id}/complete", response_model=ServiceRequestResponse)
def complete_job(
    request_id: int,
    data: ServiceRequestComplete,
    technician: User = Depends(get_current_technician),
    session: Session = Depends(get_session),
):
    """Technician marks job completed with final price."""
    return service_service.complete_job(session, request_id, technician, data)