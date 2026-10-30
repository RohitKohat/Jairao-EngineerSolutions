from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.quotation import Quotation
from app.schemas.quotation import QuotationCreate, QuotationResponse

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])

@router.post("", response_model=QuotationResponse, status_code=201)
def create_quotation(
    data: QuotationCreate,
    session: Session = Depends(get_session)
):
    """Public endpoint: Submit a solar quote request."""
    quotation = Quotation(**data.model_dump())
    session.add(quotation)
    session.commit()
    session.refresh(quotation)
    return quotation

@router.get("/all", response_model=List[QuotationResponse])
def get_all_quotations(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Admin endpoint: view all quote requests."""
    quotations = session.exec(select(Quotation).order_by(Quotation.created_at.desc())).all()
    return quotations