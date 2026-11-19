import os
import sys
import pytest
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from model_loader import loader, SUPPORTED_HORIZONS

def test_metadata_loads_successfully():
    """Verify metadata.json loaded with all required fields."""
    assert loader.is_loaded is True
    assert "horizons" in loader.metadata
    assert "features" in loader.metadata
    assert len(loader.metadata["features"]) == 24
    for h in [7, 14, 30]:
        assert str(h) in loader.metadata["horizons"]

def test_product_registry_loads_successfully():
    """Verify product_registry.joblib contains selected_skus."""
    assert "selected_skus" in loader.registry
    skus = loader.registry["selected_skus"]
    assert isinstance(skus, list)
    assert len(skus) == 30
    assert "85123A" in skus

def test_all_three_model_bundles_load():
    """Verify bundle_7d, bundle_14d, bundle_30d are cached in loader."""
    for h in SUPPORTED_HORIZONS:
        assert h in loader.bundles
        bundle = loader.bundles[h]
        assert "model" in bundle
        assert "features" in bundle
        assert len(bundle["features"]) == 24
        assert hasattr(bundle["model"], "predict")

def test_prediction_7d():
    """Verify 7-day forecast prediction works with real CatBoost bundle."""
    res = loader.predict(product_id="85123A", horizon=7, current_stock=100)
    assert res["product_id"] == "85123A"
    assert res["horizon"] == 7
    assert res["total_predicted_demand"] > 0
    assert res["average_daily_demand"] == round(res["total_predicted_demand"] / 7, 2)
    assert len(res["predicted_demand"]) == 7

def test_prediction_14d():
    """Verify 14-day forecast prediction works with real CatBoost bundle."""
    res = loader.predict(product_id="85123A", horizon=14, current_stock=100)
    assert res["product_id"] == "85123A"
    assert res["horizon"] == 14
    assert res["total_predicted_demand"] > 0
    assert res["average_daily_demand"] == round(res["total_predicted_demand"] / 14, 2)
    assert len(res["predicted_demand"]) == 14

def test_prediction_30d():
    """Verify 30-day forecast prediction works with real CatBoost bundle."""
    res = loader.predict(product_id="85123A", horizon=30, current_stock=100)
    assert res["product_id"] == "85123A"
    assert res["horizon"] == 30
    assert res["total_predicted_demand"] > 0
    assert res["average_daily_demand"] == round(res["total_predicted_demand"] / 30, 2)
    assert len(res["predicted_demand"]) == 30

def test_horizon_demand_monotonicity():
    """Sanity check: aggregate demand should increase as forecasting horizon expands."""
    p7 = loader.predict(product_id="85123A", horizon=7)["total_predicted_demand"]
    p14 = loader.predict(product_id="85123A", horizon=14)["total_predicted_demand"]
    p30 = loader.predict(product_id="85123A", horizon=30)["total_predicted_demand"]
    assert p7 < p14 < p30

def test_inventory_status_scenarios():
    """Verify Low Stock, Overstock, and Normal statuses based on current stock."""
    # Forecast for 85123A 7d is ~645 units
    pred_7d = loader.predict("85123A", horizon=7)["total_predicted_demand"]

    # Low stock: stock < 50% of forecast
    low_res = loader.predict("85123A", horizon=7, current_stock=int(pred_7d * 0.2))
    assert low_res["inventory_status"] == "Low Stock"
    assert low_res["reorder_quantity"] > 0

    # Overstock: stock > 150% of forecast
    over_res = loader.predict("85123A", horizon=7, current_stock=int(pred_7d * 2.0))
    assert over_res["inventory_status"] == "Overstock"
    assert over_res["reorder_quantity"] == 0.0

    # Normal: stock within 50% to 150%
    norm_res = loader.predict("85123A", horizon=7, current_stock=int(pred_7d * 1.0))
    assert norm_res["inventory_status"] == "Normal"

    # None provided
    none_res = loader.predict("85123A", horizon=7, current_stock=None)
    assert none_res["inventory_status"] == "Not Provided"

def test_invalid_horizon_rejected():
    """Verify that unsupported horizon throws ValueError."""
    with pytest.raises(ValueError, match="Unsupported horizon"):
        loader.predict("85123A", horizon=45)
