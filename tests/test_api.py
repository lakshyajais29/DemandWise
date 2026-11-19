import os
import sys
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "DemandWise" in data["service"]
    assert data["status"] == "online"

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"] is True
    assert data["supported_horizons"] == [7, 14, 30]
    assert data["product_count"] >= 30

def test_get_products():
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json()
    assert isinstance(products, list)
    assert len(products) >= 30
    first = products[0]
    assert "product_id" in first
    assert "name" in first
    assert "unit_price" in first

def test_get_horizons():
    res = client.get("/api/horizons")
    assert res.status_code == 200
    horizons = res.json()
    assert isinstance(horizons, list)
    assert len(horizons) == 3
    h_vals = [h["horizon"] for h in horizons]
    assert h_vals == [7, 14, 30]
    for h in horizons:
        assert "test_model_wape" in h
        assert "test_baseline_wape" in h

def test_predict_7d():
    payload = {
        "product_id": "85123A",
        "horizon": 7,
        "current_stock": 100
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["product_id"] == "85123A"
    assert data["horizon"] == 7
    assert data["total_predicted_demand"] > 0
    assert data["average_daily_demand"] > 0
    assert "inventory_status" in data
    assert data["current_stock"] == 100
    assert len(data["predicted_demand"]) == 7

def test_predict_14d():
    payload = {
        "product_id": "85123A",
        "horizon": 14,
        "current_stock": 200
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["horizon"] == 14
    assert data["total_predicted_demand"] > 0
    assert len(data["predicted_demand"]) == 14

def test_predict_30d():
    payload = {
        "product_id": "85123A",
        "horizon": 30,
        "current_stock": 500
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["horizon"] == 30
    assert data["total_predicted_demand"] > 0
    assert len(data["predicted_demand"]) == 30

def test_predict_invalid_horizon():
    payload = {
        "product_id": "85123A",
        "horizon": 45
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 400
    assert "Horizon '45' is not supported" in res.json()["detail"]

def test_predict_missing_product_id():
    payload = {
        "horizon": 7
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 400
    assert "Product identifier" in res.json()["detail"]

def test_legacy_payload_backward_compatibility():
    """Verify legacy stock_code and feature override payload works."""
    payload = {
        "stock_code": "85123A",
        "lag_1": 50.0, "lag_7": 45.0, "lag_30": 48.0,
        "rolling_7": 47.0, "rolling_30": 46.5,
        "day_of_week": 1, "month": 11, "is_weekend": 0,
        "current_stock": 75
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["stock_code"] == "85123A"
    assert "predicted_demand" in data
    assert "stock_status" in data
    assert data["total_predicted_demand"] > 0

def test_product_history():
    res = client.get("/api/products/85123A/history")
    assert res.status_code == 200
    data = res.json()
    assert data["product_id"] == "85123A"
    assert "history" in data
    assert len(data["history"]) > 0
