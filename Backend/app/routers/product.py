from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import (
    get_current_vendor,
    get_current_admin,
    get_current_user,
)
from app.core.upload import save_upload_file
from app.models.user import User, UserRole
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.services import product_service


router = APIRouter(prefix="/api/products", tags=["Products"])


# ═══════════════════════════════════════════
# IMAGE UPLOAD — Vendor OR Admin
# ═══════════════════════════════════════════
@router.post("/upload")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload a product image — vendor or admin only."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and admins can upload product images",
        )

    url = await save_upload_file(file, prefix="product")
    return {
        "success": True,
        "message": "Image uploaded successfully",
        "url": url,
    }


# ═══════════════════════════════════════════
# PUBLIC ENDPOINTS
# ═══════════════════════════════════════════
@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    session: Session = Depends(get_session),
):
    """List all active products — public."""
    return product_service.get_products(
        session,
        page=page,
        limit=limit,
        category=category,
        brand=brand,
        search=search,
        min_price=min_price,
        max_price=max_price,
        active_only=True,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, session: Session = Depends(get_session)):
    """Get single product by ID — public."""
    return product_service.get_product_by_id(session, product_id)


# ═══════════════════════════════════════════
# VENDOR ENDPOINTS
# ═══════════════════════════════════════════
@router.get("/vendor/my-products", response_model=ProductListResponse)
def get_my_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    vendor: User = Depends(get_current_vendor),
    session: Session = Depends(get_session),
):
    """Get all products belonging to the logged-in vendor."""
    return product_service.get_products(
        session,
        page=page,
        limit=limit,
        vendor_id=vendor.id,
        active_only=False,
    )


# ═══════════════════════════════════════════
# CREATE PRODUCT — Vendor OR Admin
# ═══════════════════════════════════════════
@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new product — vendor or admin only."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and admins can create products",
        )

    return product_service.create_product(session, current_user, data)


# ═══════════════════════════════════════════
# UPDATE PRODUCT — Vendor owns it, or Admin
# ═══════════════════════════════════════════
@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update product — owner vendor or admin."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and admins can update products",
        )

    return product_service.update_product(session, product_id, current_user, data)


# ═══════════════════════════════════════════
# DELETE PRODUCT — Vendor owns it, or Admin
# ═══════════════════════════════════════════
@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Soft delete product — owner vendor or admin."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors and admins can delete products",
        )

    product_service.delete_product(session, product_id, current_user)