from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
import uuid

class Quotation(SQLModel, table=True):
    __tablename__ = "quotations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    request_number: str = Field(default_factory=lambda: f"QTN-{uuid.uuid4().hex[:8].upper()}")
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    capacity: str
    message: Optional[str] = None
    status: str = Field(default="PENDING")
    
    # ✅ FIXED: Using timezone.utc
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))