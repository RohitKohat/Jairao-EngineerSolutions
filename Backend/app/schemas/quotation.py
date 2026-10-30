from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuotationCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    capacity: str
    message: Optional[str] = None

class QuotationResponse(QuotationCreate):
    id: int
    request_number: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True