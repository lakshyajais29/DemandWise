import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    ForecastRequest,
    ForecastResponse,
    PredictionRequest,
    PredictionResponse,
    ProductItem,
    HorizonInfo,
    HealthResponse,
)
from model_loader import loader, SUPPORTED_HORIZONS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("demandwise.api")

app = FastAPI(
    title="DemandWise API",
    description="E-Commerce Multi-Horizon Demand Forecasting & MLOps Intelligence Service",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def root():
    return {
        "service": "DemandWise API",
        "version": "2.0.0",
        "status": "online",
        "description": "Multi-Horizon CatBoost E-Commerce Demand Forecasting",
        "docs_url": "/docs",
    }

@app.get("/health", response_model=HealthResponse, tags=["General"])
def health_check():
    """
    Health check returning API status, loaded model bundles, and horizon metadata.
    """
    try:
        return HealthResponse(
            status="healthy" if loader.is_loaded else "degraded",
            models_loaded=loader.is_loaded,
            supported_horizons=SUPPORTED_HORIZONS,
            product_count=len(loader.get_available_products()),
            metadata={
                "target_definition": loader.metadata.get("target_definition"),
                "horizons": loader.metadata.get("horizons"),
            }
        )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(
            status="unhealthy",
            models_loaded=False,
            supported_horizons=SUPPORTED_HORIZONS,
            product_count=0,
            metadata=None
        )

@app.get("/products", response_model=List[ProductItem], tags=["Products"])
@app.get("/api/products", response_model=List[ProductItem], tags=["Products"])
def get_products():
    """
    Returns list of top active retail products available for demand forecasting.
    """
    try:
        products = loader.get_available_products()
        return [ProductItem(**p) for p in products]
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/horizons", response_model=List[HorizonInfo], tags=["Forecast"])
@app.get("/api/horizons", response_model=List[HorizonInfo], tags=["Forecast"])
def get_horizons():
    """
    Returns supported forecasting horizons (7, 14, 30 days) with test WAPE metrics.
    """
    try:
        return [HorizonInfo(**h) for h in loader.get_supported_horizons()]
    except Exception as e:
        logger.error(f"Error fetching horizons: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/{product_id}/history", tags=["Products"])
@app.get("/api/products/{product_id}/history", tags=["Products"])
def get_product_history(product_id: str):
    """
    Returns historical daily demand for the given SKU to visualize in the chart.
    """
    history = loader.get_product_history(product_id)
    if not history:
        # Check if product is known
        info = loader.get_product_info(product_id)
        if not info:
            raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return {
        "product_id": product_id.upper(),
        "history": history
    }

@app.post("/predict", response_model=ForecastResponse, tags=["Forecast"])
@app.post("/api/forecast", response_model=ForecastResponse, tags=["Forecast"])
def generate_forecast(req: ForecastRequest):
    """
    Generate demand forecast for a product across a 7-day, 14-day, or 30-day horizon.
    Uses trained CatBoost model bundles and returns forecast results, average daily demand,
    and inventory health recommendations.
    """
    if not loader.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model loader is not ready. Model artifacts could not be loaded."
        )

    product_id = req.product_id or req.stock_code
    if not product_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product identifier ('product_id' or 'stock_code') is required."
        )

    if req.horizon not in SUPPORTED_HORIZONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Horizon '{req.horizon}' is not supported. Choose from {SUPPORTED_HORIZONS} days."
        )

    try:
        # Collect any legacy manual feature overrides
        custom_feats = {}
        for feat in ["lag_1", "lag_7", "lag_30", "rolling_7", "rolling_30", "day_of_week", "month", "is_weekend"]:
            val = getattr(req, feat, None)
            if val is not None:
                custom_feats[feat] = val

        result = loader.predict(
            product_id=product_id,
            horizon=req.horizon,
            current_stock=req.current_stock,
            custom_features=custom_feats if custom_feats else None
        )
        return ForecastResponse(**result)

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction failed for SKU '{product_id}': {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/api/inventory/{product_id}", tags=["Inventory"])
def get_inventory_status(product_id: str, stock: Optional[int] = Query(default=None)):
    """
    Generates inventory recommendations and stockout risk for a specific product.
    """
    try:
        res_7d = loader.predict(product_id, horizon=7, current_stock=stock)
        return {
            "product_id": res_7d["product_id"],
            "product_name": res_7d["product_name"],
            "current_stock": stock,
            "forecast_7d": res_7d["total_predicted_demand"],
            "reorder_quantity": res_7d["reorder_quantity"],
            "inventory_status": res_7d["inventory_status"],
            "alert": res_7d["alert"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts", tags=["Inventory"])
def get_system_alerts():
    """
    Returns current high-priority stockout and inventory alerts.
    """
    alerts = []
    # Evaluate sample registered products against standard stock levels
    for p in loader.get_available_products()[:10]:
        sku = p["product_id"]
        # Standard safety stock heuristic based on weekly demand
        mean_7 = p.get("mean_7_daily", 10.0)
        est_stock = int(mean_7 * 2.5)  # ~2.5 days of stock
        pred = loader.predict(sku, horizon=7, current_stock=est_stock)
        if pred["inventory_status"] == "Low Stock":
            alerts.append({
                "product_id": sku,
                "product_name": p["name"],
                "severity": "critical",
                "message": pred["alert"],
                "reorder_quantity": pred["reorder_quantity"],
            })
    return alerts
