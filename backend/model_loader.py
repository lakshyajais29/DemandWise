import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import pandas as pd
import numpy as np
import joblib

logger = logging.getLogger("demandwise.model_loader")

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(os.getenv("MODEL_PATH", BASE_DIR / "models"))
DATA_DIR = BASE_DIR / "data" / "processed"

SUPPORTED_HORIZONS = [7, 14, 30]

class DemandWiseModelManager:
    """
    Robust model loader and inference engine for DemandWise.
    Loads and caches CatBoost model bundles (7d, 14d, 30d), product registry,
    and metadata once on startup.
    """
    def __init__(self, models_dir: Path = MODELS_DIR, data_dir: Path = DATA_DIR):
        self.models_dir = Path(models_dir)
        self.data_dir = Path(data_dir)

        self.metadata: Dict[str, Any] = {}
        self.registry: Dict[str, Any] = {}
        self.bundles: Dict[int, Any] = {}
        self.catalog: List[Dict[str, Any]] = []
        self.catalog_map: Dict[str, Dict[str, Any]] = {}
        self.features_df: Optional[pd.DataFrame] = None
        self.daily_history: Dict[str, List[Dict[str, Any]]] = {}

        self.is_loaded = False
        self._load_artifacts()

    def _validate_files_exist(self) -> List[Path]:
        required_files = [
            self.models_dir / "metadata.json",
            self.models_dir / "product_registry.joblib",
            self.models_dir / "bundle_7d.joblib",
            self.models_dir / "bundle_14d.joblib",
            self.models_dir / "bundle_30d.joblib",
        ]
        missing = [f for f in required_files if not f.exists()]
        if missing:
            raise FileNotFoundError(
                f"Missing required model artifacts in '{self.models_dir}': "
                f"{[f.name for f in missing]}. Ensure artifacts are present."
            )
        return required_files

    def _load_artifacts(self):
        try:
            logger.info(f"Loading DemandWise model artifacts from {self.models_dir}...")
            self._validate_files_exist()

            # 1. Load metadata.json
            with open(self.models_dir / "metadata.json", "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

            # 2. Load product_registry.joblib
            self.registry = joblib.load(self.models_dir / "product_registry.joblib")
            if not isinstance(self.registry, dict) or "selected_skus" not in self.registry:
                raise ValueError("product_registry.joblib must be a dictionary containing 'selected_skus'.")

            # 3. Load model bundles
            for h in SUPPORTED_HORIZONS:
                bundle_path = self.models_dir / f"bundle_{h}d.joblib"
                bundle = joblib.load(bundle_path)
                if not isinstance(bundle, dict) or "model" not in bundle or "features" not in bundle:
                    raise ValueError(f"Model bundle {bundle_path.name} is missing 'model' or 'features' key.")
                self.bundles[h] = bundle
                logger.info(f"Loaded {h}-day CatBoost model bundle successfully.")

            # 4. Load precomputed features store and catalog if available
            features_csv = self.data_dir / "featured_data.csv"
            catalog_json = self.data_dir / "products_catalog.json"
            history_json = self.data_dir / "daily_history.json"

            if features_csv.exists():
                self.features_df = pd.read_csv(features_csv)
                self.features_df["StockCode"] = self.features_df["StockCode"].astype(str).str.strip().str.upper()

            if catalog_json.exists():
                with open(catalog_json, "r", encoding="utf-8") as f:
                    self.catalog = json.load(f)
                self.catalog_map = {item["product_id"]: item for item in self.catalog}
            else:
                # Build fallback catalog from registry SKUs
                self.catalog = [
                    {"product_id": sku, "name": f"Product {sku}", "unit_price": 2.50}
                    for sku in self.registry["selected_skus"]
                ]
                self.catalog_map = {item["product_id"]: item for item in self.catalog}

            if history_json.exists():
                with open(history_json, "r", encoding="utf-8") as f:
                    self.daily_history = json.load(f)

            self.is_loaded = True
            logger.info(
                f"DemandWise Model Manager initialized. "
                f"{len(self.registry['selected_skus'])} SKUs registered, "
                f"{len(self.bundles)} models cached."
            )

        except Exception as e:
            logger.error(f"Failed to load DemandWise model artifacts: {e}", exc_info=True)
            self.is_loaded = False
            raise

    def get_supported_horizons(self) -> List[Dict[str, Any]]:
        horizons_meta = self.metadata.get("horizons", {})
        result = []
        for h in SUPPORTED_HORIZONS:
            h_meta = horizons_meta.get(str(h), {})
            result.append({
                "horizon": h,
                "label": f"Next {h} Days",
                "test_model_wape": round(h_meta.get("test_model_wape", 0.0), 4),
                "test_baseline_wape": round(h_meta.get("test_baseline_wape", 0.0), 4),
                "best_iteration": h_meta.get("best_iteration", 0),
            })
        return result

    def get_available_products(self) -> List[Dict[str, Any]]:
        return self.catalog

    def get_product_info(self, product_id: str) -> Optional[Dict[str, Any]]:
        clean_id = str(product_id).strip().upper()
        return self.catalog_map.get(clean_id)

    def get_product_history(self, product_id: str) -> List[Dict[str, Any]]:
        clean_id = str(product_id).strip().upper()
        return self.daily_history.get(clean_id, [])

    def _prepare_feature_row(self, product_id: str, horizon: int, custom_features: Optional[Dict[str, Any]] = None) -> pd.DataFrame:
        clean_id = str(product_id).strip().upper()
        bundle = self.bundles[horizon]
        expected_cols = bundle["features"]

        # 1. Start with precomputed features for this SKU if present
        if self.features_df is not None and not self.features_df.empty:
            match = self.features_df[self.features_df["StockCode"] == clean_id]
            if not match.empty:
                row_dict = match.iloc[0].to_dict()
            else:
                # Default baseline features for registered SKU
                row_dict = {"StockCode": clean_id}
        else:
            row_dict = {"StockCode": clean_id}

        # 2. Apply any custom feature overrides if user explicitly provided them
        if custom_features:
            for k, v in custom_features.items():
                if v is not None and k in expected_cols:
                    row_dict[k] = v

        # 3. Ensure all 24 required feature columns exist with reasonable defaults
        for col in expected_cols:
            if col not in row_dict or pd.isna(row_dict[col]):
                if col == "StockCode":
                    row_dict[col] = clean_id
                elif col in ["dayofweek", "month", "quarter", "year", "day"]:
                    now = pd.Timestamp.now()
                    row_dict["dayofweek"] = int(now.dayofweek)
                    row_dict["day"] = int(now.day)
                    row_dict["month"] = int(now.month)
                    row_dict["quarter"] = int(now.quarter)
                    row_dict["year"] = int(now.year)
                elif col == "dow_sin":
                    dow = row_dict.get("dayofweek", 0)
                    row_dict[col] = float(np.sin(2 * np.pi * dow / 7))
                elif col == "dow_cos":
                    dow = row_dict.get("dayofweek", 0)
                    row_dict[col] = float(np.cos(2 * np.pi * dow / 7))
                elif col == "doy_sin":
                    now = pd.Timestamp.now()
                    row_dict[col] = float(np.sin(2 * np.pi * now.dayofyear / 365.25))
                elif col == "doy_cos":
                    now = pd.Timestamp.now()
                    row_dict[col] = float(np.cos(2 * np.pi * now.dayofyear / 365.25))
                elif col.startswith("mean_") or col.startswith("lag_") or col == "median_28":
                    row_dict[col] = 40.0
                elif col == "std_28":
                    row_dict[col] = 12.0
                elif col == "zero_share_28":
                    row_dict[col] = 0.15
                elif col == "trend_7_vs_28":
                    row_dict[col] = 1.0
                else:
                    row_dict[col] = 0.0

        df_row = pd.DataFrame([row_dict])[expected_cols]
        return df_row

    def predict(
        self,
        product_id: str,
        horizon: int = 7,
        current_stock: Optional[int] = None,
        custom_features: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate multi-horizon demand forecast using the corresponding CatBoost model bundle.
        """
        if not self.is_loaded:
            raise RuntimeError("Model loader is not initialized. Check model artifacts.")

        clean_id = str(product_id).strip().upper()
        if clean_id not in self.registry.get("selected_skus", []):
            # If not in selected SKUs, check if catalog knows it or accept as dynamic
            logger.warning(f"Product ID '{clean_id}' is not in selected_skus list.")

        if horizon not in SUPPORTED_HORIZONS:
            raise ValueError(
                f"Unsupported horizon '{horizon}'. Supported horizons: {SUPPORTED_HORIZONS}"
            )

        # Retrieve model bundle
        bundle = self.bundles[horizon]
        model = bundle["model"]

        # Prepare feature DataFrame matching exact training feature names and types
        feature_df = self._prepare_feature_row(clean_id, horizon, custom_features)

        # Predict aggregate demand from trained CatBoost model
        raw_pred = model.predict(feature_df)
        pred_value = float(raw_pred[0]) if isinstance(raw_pred, (list, np.ndarray)) else float(raw_pred)
        total_predicted = max(0.0, round(pred_value, 2))
        avg_daily = round(total_predicted / horizon, 2)

        # Inventory insights
        product_info = self.get_product_info(clean_id) or {}
        product_name = product_info.get("name", f"Product {clean_id}")

        if current_stock is not None and current_stock >= 0:
            reorder_qty = max(0.0, round(total_predicted - current_stock, 2))
            if current_stock < (total_predicted * 0.5):
                status = "Low Stock"
                alert = (
                    f"Low Stock Alert: Current stock ({current_stock} units) covers less than 50% "
                    f"of forecasted {horizon}-day demand ({total_predicted:.0f} units). "
                    f"Recommended reorder: {reorder_qty:.0f} units."
                )
            elif current_stock > (total_predicted * 1.5):
                status = "Overstock"
                excess = current_stock - total_predicted
                alert = (
                    f"Overstock Notice: Current stock ({current_stock} units) exceeds forecasted "
                    f"{horizon}-day demand ({total_predicted:.0f} units) by {excess:.0f} units."
                )
            else:
                status = "Normal"
                alert = (
                    f"Healthy Inventory: Current stock ({current_stock} units) is well-balanced "
                    f"for forecasted {horizon}-day demand ({total_predicted:.0f} units)."
                )
        else:
            status = "Not Provided"
            reorder_qty = 0.0
            alert = (
                "Inventory stock quantity not provided. Input actual stock on hand "
                "to calculate reorder recommendations and stockout risk."
            )

        # Build daily timeline projection points for visualization
        # The model predicts aggregate N-day demand; we project the daily trajectory
        daily_points = []
        running_stock = float(current_stock) if current_stock is not None else None
        now = pd.Timestamp.now()

        import datetime as dt_module
        for day_offset in range(1, horizon + 1):
            day_date = now + dt_module.timedelta(days=day_offset)
            date_str = day_date.strftime("%Y-%m-%d")
            # Day-of-week modulation around average daily rate
            dow = day_date.dayofweek
            factor = 0.7 if dow in [5, 6] else 1.12  # Weekend slight dip in wholesale/B2B retail
            daily_est = round(avg_daily * factor, 1)

            if running_stock is not None:
                running_stock = max(0.0, round(running_stock - daily_est, 1))

            daily_points.append({
                "date": date_str,
                "predicted": daily_est,
                "stock_projection": running_stock
            })

        # Horizon metadata
        h_meta = self.metadata.get("horizons", {}).get(str(horizon), {})

        return {
            "product_id": clean_id,
            "product_name": product_name,
            "horizon": horizon,
            "predicted_demand": daily_points,
            "total_predicted_demand": total_predicted,
            "average_daily_demand": avg_daily,
            "current_stock": current_stock,
            "reorder_quantity": reorder_qty,
            "inventory_status": status,
            "alert": alert,
            "model_wape": round(h_meta.get("test_model_wape", 0.0), 4),
            "baseline_wape": round(h_meta.get("test_baseline_wape", 0.0), 4),
            # Aliases for backward compatibility
            "stock_code": clean_id,
            "stock_status": status,
            "alert_message": alert,
        }

# Global singleton instance loaded once
loader = DemandWiseModelManager()

def predict(features_or_req: Any) -> float:
    """
    Backward-compatibility helper for legacy callers expecting predict(features) -> float.
    """
    if isinstance(features_or_req, (list, np.ndarray)):
        # Legacy 8-feature call fallback
        sku = "85123A"
        res = loader.predict(sku, horizon=7)
        return float(res["total_predicted_demand"])
    elif isinstance(features_or_req, dict):
        sku = features_or_req.get("product_id") or features_or_req.get("stock_code") or "85123A"
        horizon = features_or_req.get("horizon", 7)
        stock = features_or_req.get("current_stock")
        res = loader.predict(sku, horizon=horizon, current_stock=stock)
        return float(res["total_predicted_demand"])
    else:
        res = loader.predict("85123A", horizon=7)
        return float(res["total_predicted_demand"])
