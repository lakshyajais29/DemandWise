from pydantic import BaseModel
from typing import Optional

class PredictionRequest(BaseModel):
    stock_code: str
    lag_1: float
    lag_7: float
    lag_30: float
    rolling_7: float
    rolling_30: float
    day_of_week: int   # 0=Monday … 6=Sunday
    month: int         # 1–12
    is_weekend: int    # 0 or 1
    current_stock: int

class PredictionResponse(BaseModel):
    stock_code: str
    predicted_demand: float
    current_stock: int
    reorder_quantity: float
    stock_status: str  # 'OK', 'Low Stock', 'Overstock'
    alert_message: Optional[str] = None