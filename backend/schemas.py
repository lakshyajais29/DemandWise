from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Any, Dict

class ForecastRequest(BaseModel):
    product_id: Optional[str] = None
    stock_code: Optional[str] = None
    horizon: int = Field(default=7, description="Forecasting horizon in calendar days (7, 14, or 30)")
    current_stock: Optional[int] = Field(default=None, description="Actual inventory stock on hand (units)")

    # Optional manual feature overrides for backward compatibility
    lag_1: Optional[float] = None
    lag_7: Optional[float] = None
    lag_30: Optional[float] = None
    rolling_7: Optional[float] = None
    rolling_30: Optional[float] = None
    day_of_week: Optional[int] = None
    month: Optional[int] = None
    is_weekend: Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_identifiers(cls, data: Any):
        if isinstance(data, dict):
            # Allow stock_code to populate product_id and vice versa
            pid = data.get("product_id") or data.get("stock_code")
            if pid:
                data["product_id"] = str(pid).strip().upper()
                data["stock_code"] = str(pid).strip().upper()
        return data

class DailyDemandPoint(BaseModel):
    date: str
    predicted: float
    actual: Optional[float] = None
    stock_projection: Optional[float] = None

class ForecastResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    product_id: str
    product_name: Optional[str] = None
    horizon: int
    predicted_demand: List[DailyDemandPoint] = []
    total_predicted_demand: float
    average_daily_demand: float
    current_stock: Optional[int] = None
    reorder_quantity: float = 0.0
    inventory_status: str  # 'Normal', 'Low Stock', 'Overstock', 'Not Provided'
    alert: Optional[str] = None

    # Performance metadata from trained model
    model_wape: Optional[float] = None
    baseline_wape: Optional[float] = None

    # Backward compatibility aliases
    stock_code: Optional[str] = None
    stock_status: Optional[str] = None
    alert_message: Optional[str] = None

    @model_validator(mode="after")
    def sync_aliases(self):
        if not self.stock_code:
            self.stock_code = self.product_id
        if not self.stock_status:
            self.stock_status = self.inventory_status
        if not self.alert_message:
            self.alert_message = self.alert
        return self

# Backward compatibility alias
PredictionRequest = ForecastRequest
PredictionResponse = ForecastResponse

class ProductItem(BaseModel):
    product_id: str
    name: str
    unit_price: Optional[float] = 2.50
    total_units_sold: Optional[int] = 0
    mean_7_daily: Optional[float] = 0.0
    mean_28_daily: Optional[float] = 0.0
    zero_share_28: Optional[float] = 0.0

class HorizonInfo(BaseModel):
    horizon: int
    label: str
    test_model_wape: float
    test_baseline_wape: float
    best_iteration: int

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    supported_horizons: List[int]
    product_count: int
    metadata: Optional[Dict[str, Any]] = None
