import calendar as cal_module
from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models import EMI

router = APIRouter()


class EMICreate(BaseModel):
    name: str
    amount: float
    due_day: int
    total_months: int
    paid_months: int = 0
    start_date: str
    notes: Optional[str] = None


class EMIUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    due_day: Optional[int] = None
    total_months: Optional[int] = None
    paid_months: Optional[int] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class EMIResponse(BaseModel):
    id: int
    name: str
    amount: float
    due_day: int
    total_months: int
    paid_months: int
    start_date: str
    is_active: bool
    notes: Optional[str]
    remaining_months: int
    total_remaining: float

    class Config:
        from_attributes = True


def _enrich(emi: EMI) -> dict:
    remaining = max(0, emi.total_months - emi.paid_months)
    return {
        **{c.name: getattr(emi, c.name) for c in emi.__table__.columns},
        "remaining_months": remaining,
        "total_remaining": remaining * emi.amount,
    }


def _month_offset(emi: EMI, year: int, month: int) -> int:
    """0-based offset of (year, month) from the EMI's start month."""
    start = date_type.fromisoformat(emi.start_date)
    return (year - start.year) * 12 + (month - start.month)


@router.get("/", response_model=List[EMIResponse])
async def get_emis(db: Session = Depends(get_db)):
    emis = db.query(EMI).filter(EMI.is_active == True).all()
    return [_enrich(e) for e in emis]


@router.post("/", response_model=EMIResponse)
async def create_emi(emi: EMICreate, db: Session = Depends(get_db)):
    db_emi = EMI(**emi.model_dump())
    db.add(db_emi)
    db.commit()
    db.refresh(db_emi)
    return _enrich(db_emi)


@router.put("/{emi_id}", response_model=EMIResponse)
async def update_emi(
    emi_id: int, emi: EMIUpdate, db: Session = Depends(get_db)
):
    db_emi = db.query(EMI).filter(EMI.id == emi_id).first()
    if not db_emi:
        raise HTTPException(status_code=404, detail="EMI not found")
    for field, value in emi.model_dump(exclude_unset=True).items():
        setattr(db_emi, field, value)
    db.commit()
    db.refresh(db_emi)
    return _enrich(db_emi)


@router.delete("/{emi_id}")
async def delete_emi(emi_id: int, db: Session = Depends(get_db)):
    db_emi = db.query(EMI).filter(EMI.id == emi_id).first()
    if not db_emi:
        raise HTTPException(status_code=404, detail="EMI not found")
    db_emi.is_active = False
    db.commit()
    return {"message": "EMI deactivated"}


@router.get("/calendar/{year}/{month}")
async def get_emi_calendar(year: int, month: int, db: Session = Depends(get_db)):
    emis = db.query(EMI).filter(EMI.is_active == True).all()
    calendar_data: dict = {}
    days_in_month = cal_module.monthrange(year, month)[1]

    for emi in emis:
        offset = _month_offset(emi, year, month)

        # Only mark months within the unpaid window:
        # offset must be >= paid_months (not yet paid)
        # offset must be < total_months (loan not yet ended)
        if not (emi.paid_months <= offset < emi.total_months):
            continue

        day = min(emi.due_day, days_in_month)
        key = f"{year}-{month:02d}-{day:02d}"
        calendar_data.setdefault(key, []).append(
            {
                "id": emi.id,
                "name": emi.name,
                "amount": emi.amount,
                "remaining_months": max(0, emi.total_months - emi.paid_months),
                "installment_number": offset + 1,
            }
        )
    return calendar_data
