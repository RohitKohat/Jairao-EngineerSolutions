from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    price: float
    discount: float = Field(default=0.0)
    final_price: float
    category: str
    brand: Optional[str] = None
    stock: int = Field(default=0)
    image: Optional[str] = None

    vendor_id: int = Field(foreign_key="users.id", index=True)

    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))