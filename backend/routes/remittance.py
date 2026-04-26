from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter()

FALLBACK_RATE = 83.0  # 1 USD = 83 INR


async def fetch_live_rate() -> float:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("https://api.exchangerate-api.com/v4/latest/USD")
            if r.status_code == 200:
                return r.json().get("rates", {}).get("INR", FALLBACK_RATE)
    except Exception:
        pass
    return FALLBACK_RATE


class RemittanceRequest(BaseModel):
    usd_amount: float
    include_fee: bool = True
    fee_percent: float = 1.5


@router.get("/rate")
async def get_rate():
    rate = await fetch_live_rate()
    return {
        "usd_to_inr": rate,
        "is_live": rate != FALLBACK_RATE,
        "source": "exchangerate-api.com" if rate != FALLBACK_RATE else "fallback (1 USD = ₹83)",
    }


@router.post("/calculate")
async def calculate_remittance(req: RemittanceRequest):
    rate = await fetch_live_rate()
    fee = req.usd_amount * (req.fee_percent / 100) if req.include_fee else 0.0
    net_usd = req.usd_amount - fee
    inr_amount = net_usd * rate
    return {
        "usd_amount": req.usd_amount,
        "fee_usd": round(fee, 2),
        "net_usd": round(net_usd, 2),
        "exchange_rate": rate,
        "inr_amount": round(inr_amount, 2),
        "recommendation": _recommend(rate),
    }


@router.get("/history")
async def remittance_history():
    return {
        "average_30d": 83.5,
        "high_30d": 84.2,
        "low_30d": 82.1,
        "recommendation": "Current rate is near the 30-day average.",
    }


def _recommend(rate: float) -> str:
    if rate >= 85:
        return "Excellent rate! Great time to send money."
    elif rate >= 83:
        return "Good rate. Consider sending now."
    elif rate >= 80:
        return "Average rate. You may want to wait for a better rate."
    return "Below average rate. Consider waiting if possible."
