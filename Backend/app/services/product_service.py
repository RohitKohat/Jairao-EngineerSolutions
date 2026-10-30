from typing import Optional
from sqlmodel import Session, select, func
from fastapi import HTTPException, status

from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.product import ProductCreate, ProductUpdate


def calculate_final_price(price: float, discount: float) -> float:
    """Compute final price after discount."""
    return round(price - (price * discount / 100), 2)


# ═══════════════════════════════════════════════════════
# CREATE PRODUCT — Vendor or Admin
# ═══════════════════════════════════════════════════════
def create_product(session: Session, current_user: User, data: ProductCreate) -> Product:
    """Create a new product (vendor or admin)."""
    final_price = calculate_final_price(data.price, data.discount)

    product = Product(
        name=data.name,
        description=data.description,
        price=data.price,
        discount=data.discount,
        final_price=final_price,
        category=data.category,
        brand=data.brand,
        stock=data.stock,
        image=data.image,
        vendor_id=current_user.id,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ═══════════════════════════════════════════════════════
# LIST PRODUCTS
# ═══════════════════════════════════════════════════════
def get_products(
    session: Session,
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    vendor_id: Optional[int] = None,
    active_only: bool = True,
):
    """List products with filters and pagination."""
    query = select(Product)

    if active_only:
        query = query.where(Product.is_active == True)
    if category:
        query = query.where(Product.category == category)
    if brand:
        query = query.where(Product.brand == brand)
    if vendor_id:
        query = query.where(Product.vendor_id == vendor_id)
    if min_price is not None:
        query = query.where(Product.final_price >= min_price)
    if max_price is not None:
        query = query.where(Product.final_price <= max_price)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Product.name.ilike(search_pattern)) |
            (Product.description.ilike(search_pattern)) |
            (Product.brand.ilike(search_pattern))
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    query = query.offset((page - 1) * limit).limit(limit).order_by(Product.created_at.desc())
    products = session.exec(query).all()

    return {"total": total, "page": page, "limit": limit, "products": products}


# ═══════════════════════════════════════════════════════
# GET SINGLE
# ═══════════════════════════════════════════════════════
def get_product_by_id(session: Session, product_id: int) -> Product:
    """Get single product by ID."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


# ═══════════════════════════════════════════════════════
# UPDATE PRODUCT — Owner vendor OR admin
# ═══════════════════════════════════════════════════════
def update_product(
    session: Session, product_id: int, vendor: User, data: ProductUpdate
) -> Product:
    """Update product — owner vendor or admin."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Ownership check — admin bypasses
    if vendor.role != UserRole.ADMIN and product.vendor_id != vendor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own products",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    if "price" in update_data or "discount" in update_data:
        product.final_price = calculate_final_price(product.price, product.discount)

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


# ═══════════════════════════════════════════════════════
# DELETE PRODUCT — Owner vendor OR admin
# ═══════════════════════════════════════════════════════
def delete_product(session: Session, product_id: int, vendor: User) -> None:
    """Soft delete product — owner vendor or admin."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Ownership check — admin bypasses
    if vendor.role != UserRole.ADMIN and product.vendor_id != vendor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own products",
        )

    product.is_active = False
    session.add(product)
    session.commit()