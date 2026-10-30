from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.service import (
    ServiceCategory, ServiceRequestStatus, ServiceUrgency,
)


# ═══════════════════════════════════════════
# CATALOG
# ═══════════════════════════════════════════
class ServiceCatalogCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: ServiceCategory
    base_price: float = Field(gt=0)
    estimated_duration_mins: int = 60
    provider_type: str = "technician"
    provider_id: Optional[int] = None


class ServiceCatalogResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: ServiceCategory
    base_price: float
    estimated_duration_mins: int
    provider_type: str
    provider_id: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════
# SERVICE REQUEST
# ═══════════════════════════════════════════
class ServiceRequestCreate(BaseModel):
    service_catalog_id: Optional[int] = None
    service_name: str
    category: ServiceCategory
    description: Optional[str] = None
    urgency: ServiceUrgency = ServiceUrgency.NORMAL

    address_line: str
    city: str
    state: Optional[str] = None
    zip_code: Optional[str] = None

    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None

    customer_notes: Optional[str] = None
    customer_phone: str


class ServiceRequestAssign(BaseModel):
    technician_id: int
    estimated_price: float
    admin_notes: Optional[str] = None


class ServiceRequestAccept(BaseModel):
    technician_notes: Optional[str] = None


class ServiceRequestComplete(BaseModel):
    final_price: float = Field(gt=0)
    technician_notes: Optional[str] = None


class ServiceRequestStatusUpdate(BaseModel):
    status: ServiceRequestStatus
    admin_notes: Optional[str] = None


class ServiceRequestResponse(BaseModel):
    id: int
    request_number: str
    customer_id: int
    customer_name: str
    customer_phone: str
    customer_email: Optional[str]
    service_catalog_id: Optional[int]
    service_name: str
    category: ServiceCategory
    description: Optional[str]
    urgency: ServiceUrgency
    address_line: str
    city: str
    state: Optional[str]
    zip_code: Optional[str]
    preferred_date: Optional[str]
    preferred_time: Optional[str]
    technician_id: Optional[int]
    assigned_by: Optional[int]
    assigned_at: Optional[datetime]
    estimated_price: float
    final_price: Optional[float]
    admin_share: float
    technician_share: float
    commission_rate: float
    status: ServiceRequestStatus
    accepted_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    paid_at: Optional[datetime]
    customer_notes: Optional[str]
    technician_notes: Optional[str]
    admin_notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ServiceRequestListResponse(BaseModel):
    total: int
    page: int
    limit: int
    requests: List[ServiceRequestResponse]