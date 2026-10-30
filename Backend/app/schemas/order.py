from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.order import OrderStatus


# ─── Create Order ───
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(min_length=1)
    address_line: str
    city: str
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: str = "India"
    phone: str


# ─── Update Order Status ───
class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ─── Order Response ───
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    vendor_id: int
    quantity: int
    unit_price: float
    total_price: float


class OrderResponse(BaseModel):
    id: int
    order_number: str
    total_amount: float
    status: OrderStatus
    customer_id: int
    technician_id: Optional[int]
    address_line: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    country: str
    phone: Optional[str]
    items: List[OrderItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    total: int
    page: int
    limit: int
    orders: List[OrderResponse]