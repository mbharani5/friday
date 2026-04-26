from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models import Salary

router = APIRouter()


class SalaryCreate(BaseModel):
    amount: float
    date: str  # YYYY-MM-DD
    currency: str = "USD"
    notes: Optional[str] = None


class SalaryUpdate(BaseModel):
    amount: Optional[float] = None
    notes: Optional[str] = None


class SalaryResponse(BaseModel):
    id: int
    amount: float
    date: str
    currency: str
    notes: Optional[str]

    class Config:
        from_attributes = True


# /latest and /calendar/{year}/{month} must be declared before /{salary_id}
@router.get("/latest")
async def get_latest_salary(db: Session = Depends(get_db)):
    salary = db.query(Salary).order_by(Salary.date.desc()).first()
    if not salary:
        return {"amount": 0, "currency": "USD", "date": None}
    return salary


@router.get("/calendar/{year}/{month}")
async def get_salary_calendar(year: int, month: int, db: Session = Depends(get_db)):
    month_str = f"{year}-{month:02d}"
    rows = db.query(Salary).filter(Salary.date.startswith(month_str)).order_by(Salary.date).all()
    calendar_data: dict = {}
    for s in rows:
        calendar_data.setdefault(s.date, []).append(
            {"id": s.id, "amount": s.amount, "currency": s.currency, "notes": s.notes}
        )
    return calendar_data


@router.get("/", response_model=List[SalaryResponse])
async def get_salaries(db: Session = Depends(get_db)):
    return db.query(Salary).order_by(Salary.date.desc()).all()


@router.post("/", response_model=SalaryResponse)
async def create_salary(salary: SalaryCreate, db: Session = Depends(get_db)):
    db_salary = Salary(**salary.model_dump())
    db.add(db_salary)
    db.commit()
    db.refresh(db_salary)
    return db_salary


@router.put("/{salary_id}", response_model=SalaryResponse)
async def update_salary(
    salary_id: int, salary: SalaryUpdate, db: Session = Depends(get_db)
):
    db_salary = db.query(Salary).filter(Salary.id == salary_id).first()
    if not db_salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    for field, value in salary.model_dump(exclude_unset=True).items():
        setattr(db_salary, field, value)
    db.commit()
    db.refresh(db_salary)
    return db_salary


@router.delete("/{salary_id}")
async def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    db_salary = db.query(Salary).filter(Salary.id == salary_id).first()
    if not db_salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    db.delete(db_salary)
    db.commit()
    return {"message": "Salary record deleted"}
