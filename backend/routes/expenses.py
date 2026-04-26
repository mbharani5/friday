from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models import Expense

router = APIRouter()


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: str
    notes: Optional[str] = None


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: str
    notes: Optional[str]

    class Config:
        from_attributes = True


# /categories/summary must be declared before /{expense_id} to avoid route shadowing
@router.get("/categories/summary")
async def get_category_summary(
    month: Optional[str] = None, db: Session = Depends(get_db)
):
    query = db.query(Expense)
    if month:
        query = query.filter(Expense.date.startswith(month))
    expenses = query.all()
    summary: dict = {}
    for expense in expenses:
        summary[expense.category] = summary.get(expense.category, 0) + expense.amount
    return summary


@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    month: Optional[str] = None, db: Session = Depends(get_db)
):
    query = db.query(Expense)
    if month:
        query = query.filter(Expense.date.startswith(month))
    return query.order_by(Expense.date.desc()).all()


@router.post("/", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int, expense: ExpenseUpdate, db: Session = Depends(get_db)
):
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in expense.model_dump(exclude_unset=True).items():
        setattr(db_expense, field, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.delete("/{expense_id}")
async def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted"}
