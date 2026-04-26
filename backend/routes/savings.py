from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from database import get_db
from models import Expense, EMI, Salary

router = APIRouter()


def get_month_data(db: Session, month: str) -> dict:
    # Sum all payslips whose date falls in this month (supports bi-weekly entries)
    salary_rows = db.query(Salary).filter(Salary.date.startswith(month)).all()
    salary_amount = sum(s.amount for s in salary_rows)

    expenses = db.query(Expense).filter(Expense.date.startswith(month)).all()
    total_expenses = sum(e.amount for e in expenses)

    active_emis = db.query(EMI).filter(EMI.is_active == True).all()
    total_emi = sum(e.amount for e in active_emis)

    savings = salary_amount - total_expenses - total_emi

    category_totals: dict = {}
    for e in expenses:
        category_totals[e.category] = category_totals.get(e.category, 0) + e.amount

    return {
        "month": month,
        "salary": salary_amount,
        "total_expenses": total_expenses,
        "total_emi": total_emi,
        "savings": savings,
        "expense_breakdown": category_totals,
    }


@router.get("/forecast")
async def get_forecast(db: Session = Depends(get_db)):
    today = date.today()
    result = []
    for i in range(3):
        month_num = today.month + i
        year = today.year + (month_num - 1) // 12
        month = ((month_num - 1) % 12) + 1
        result.append(get_month_data(db, f"{year}-{month:02d}"))
    return result


@router.get("/")
async def get_savings(
    month: Optional[str] = None, db: Session = Depends(get_db)
):
    if not month:
        month = date.today().strftime("%Y-%m")
    return get_month_data(db, month)
