# FRIDAY

> Personal AI Assistant inspired by Tony Stark's FRIDAY

## Description

FRIDAY is a personal AI assistant for managing finances — tracking expenses, EMI payments, salary planning, and remitting money to India. Built with FastAPI + SQLite on the backend and React + Vite on the frontend.

## Features

| Feature | Description |
|---------|-------------|
| **Expense Tracking** | Add, edit, delete, and categorize monthly expenses |
| **EMI Reminders** | Track loan EMIs with calendar view and progress bars |
| **Salary Planning** | Log monthly salary and view income history |
| **Savings Calculator** | Net Savings = Salary − Expenses − EMIs |
| **Remittance Planner** | USD → INR with live rate, fee calculator, and send recommendations |
| **3-Month Forecast** | Visual bar chart projection across upcoming months |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11+ · FastAPI · SQLAlchemy · SQLite |
| Frontend | React 18 · Vite · React Router · Recharts · Lucide |
| HTTP client | Axios |
| Package mgmt | pip (requirements.txt) · npm |

## Project Structure

```
friday/
├── backend/
│   ├── main.py              # FastAPI app entry point + CORS
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # ORM models: Expense, EMI, Salary
│   ├── routes/
│   │   ├── expenses.py      # CRUD + category summary
│   │   ├── emi.py           # CRUD + calendar view
│   │   ├── salary.py        # CRUD + latest salary
│   │   ├── savings.py       # Savings calc + 3-month forecast
│   │   └── remittance.py    # USD→INR rate + transfer calculator
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js           # Axios API wrappers
│   │   ├── index.css        # Dark FRIDAY theme (CSS variables)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── EMI.jsx
│   │   │   ├── Savings.jsx
│   │   │   └── Remittance.jsx
│   │   └── components/
│   │       └── Navbar.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs (Swagger UI): http://localhost:8000/docs  
Health check: http://localhost:8000/health

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/` | List expenses (filter: `?month=YYYY-MM`) |
| POST | `/api/expenses/` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/categories/summary` | Totals by category |
| GET | `/api/emi/` | List active EMIs |
| POST | `/api/emi/` | Create EMI |
| PUT | `/api/emi/{id}` | Update EMI |
| DELETE | `/api/emi/{id}` | Deactivate EMI |
| GET | `/api/emi/calendar/{year}/{month}` | EMI due dates for a month |
| GET | `/api/salary/latest` | Most recent salary |
| GET | `/api/salary/` | Salary history |
| POST | `/api/salary/` | Log salary |
| GET | `/api/savings/` | Current month savings summary |
| GET | `/api/savings/forecast` | 3-month forward projection |
| GET | `/api/remittance/rate` | Current USD→INR rate |
| POST | `/api/remittance/calculate` | Calculate remittance with fee |
| GET | `/api/remittance/history` | 30-day rate context |

## Notes

- SQLite database is created automatically as `backend/friday.db` on first run
- Exchange rate falls back to **1 USD = ₹83** if the live API (exchangerate-api.com) is unavailable
- Backend runs on **port 8000**, frontend on **port 5173**
- The Vite dev server proxies `/api` requests to the backend automatically

---

*"I am FRIDAY, your personal AI assistant."*
