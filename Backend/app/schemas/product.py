from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ─── Create Product (Vendor sends this) ───
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(gt=0)
    discount: float = Field(default=0.0, ge=0, le=100)
    category: str
    brand: Optional[str] = None
    stock: int = Field(default=0, ge=0)
    image: Optional[str] = None


# ─── Update Product ───
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    discount: Optional[float] = Field(default=None, ge=0, le=100)
    category: Optional[str] = None
    brand: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    image: Optional[str] = None
    is_active: Optional[bool] = None


# ─── Product Response ───
class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    discount: float
    final_price: float
    category: str
    brand: Optional[str]
    stock: int
    image: Optional[str]
    vendor_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Vendor's own products (includes hidden fields) ───
class VendorProductResponse(ProductResponse):
    pass


# ─── List response with pagination ───
class ProductListResponse(BaseModel):
    total: int
    page: int
    limit: int
    products: list[ProductResponse]