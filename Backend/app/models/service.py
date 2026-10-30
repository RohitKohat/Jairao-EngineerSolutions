from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field


class ServiceCategory(str, Enum):
    AC_REPAIR = "AC Repair"
    WASHING_MACHINE = "Washing Machine"
    REFRIGERATOR = "Refrigerator"
    ELECTRICAL = "Electrical Wiring"
    WATER_PURIFIER = "Water Purifier"
    SOLAR = "Solar Installation"
    OTHER = "Other"


class ServiceRequestStatus(str, Enum):
    PENDING = "PENDING"              # Customer submitted, awaiting admin
    ASSIGNED = "ASSIGNED"            # Admin assigned a technician
    ACCEPTED = "ACCEPTED"            # Technician accepted
    IN_PROGRESS = "IN_PROGRESS"      # Technician on the way / working
    COMPLETED = "COMPLETED"          # Technician done
    PAID = "PAID"                    # Customer paid
    CANCELLED = "CANCELLED"          # Cancelled by customer/admin


class ServiceUrgency(str, Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"


# ═══════════════════════════════════════════════════════════
# SERVICE CATALOG (what services are offered)
# ═══════════════════════════════════════════════════════════
class ServiceCatalog(SQLModel, table=True):
    __tablename__ = "service_catalog"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)               # "AC Gas Refill"
    description: Optional[str] = None
    category: ServiceCategory
    base_price: float = Field(gt=0)             # Starting price
    estimated_duration_mins: int = Field(default=60)

    # Who offers it (either a vendor OR a technician)
    provider_type: str = Field(default="technician")  # "technician" | "vendor" | "platform"
    provider_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ═══════════════════════════════════════════════════════════
# SERVICE REQUESTS (customer requests)
# ═══════════════════════════════════════════════════════════
class ServiceRequest(SQLModel, table=True):
    __tablename__ = "service_requests"

    id: Optional[int] = Field(default=None, primary_key=True)
    request_number: str = Field(unique=True, index=True)

    # Customer info
    customer_id: int = Field(foreign_key="users.id", index=True)
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None

    # Service details
    service_catalog_id: Optional[int] = Field(default=None, foreign_key="service_catalog.id")
    service_name: str                    # Snapshot at request time
    category: ServiceCategory
    description: Optional[str] = None
    urgency: ServiceUrgency = Field(default=ServiceUrgency.NORMAL)

    # Location
    address_line: str
    city: str
    state: Optional[str] = None
    zip_code: Optional[str] = None

    # Timing
    preferred_date: Optional[str] = None   # "2026-10-15"
    preferred_time: Optional[str] = None   # "10:00 AM - 12:00 PM"

    # Assignment
    technician_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    assigned_by: Optional[int] = Field(default=None, foreign_key="users.id")
    assigned_at: Optional[datetime] = None

    # Pricing (locked at request time)
    estimated_price: float = Field(ge=0, default=0)
    final_price: Optional[float] = None
    admin_share: float = Field(default=0)
    technician_share: float = Field(default=0)
    commission_rate: float = Field(default=10)

    # Status
    status: ServiceRequestStatus = Field(default=ServiceRequestStatus.PENDING)

    # Timestamps
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None

    # Notes
    customer_notes: Optional[str] = None
    technician_notes: Optional[str] = None
    admin_notes: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))