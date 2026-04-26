from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import expenses, emi, salary, savings, remittance

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FRIDAY - Personal Finance Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(emi.router, prefix="/api/emi", tags=["emi"])
app.include_router(salary.router, prefix="/api/salary", tags=["salary"])
app.include_router(savings.router, prefix="/api/savings", tags=["savings"])
app.include_router(remittance.router, prefix="/api/remittance", tags=["remittance"])


@app.get("/")
async def root():
    return {"message": "FRIDAY Assistant API is online", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
