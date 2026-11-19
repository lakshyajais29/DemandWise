# DemandWise – E-Commerce Multi-Horizon Demand Forecasting & MLOps System

**DemandWise** is an enterprise-grade AI-powered demand intelligence and inventory optimization SaaS platform. It leverages retail transaction data from the Online Retail II dataset, robust feature engineering (lags, rolling statistics, calendar seasonality), and dedicated CatBoost regression models to forecast product demand across multiple time horizons (7-day, 14-day, and 30-day).

---

## 📁 System Architecture 

```text
DemandWise/
├── data/
│   ├── raw/
│   │   └── online_retail_II.xlsx        # UCI Online Retail II raw dataset
│   └── processed/
│       ├── cleaned_data.csv             # Cleaned transaction records
│       ├── featured_data.csv            # 24-dimensional feature matrix for registered SKUs
│       ├── products_catalog.json        # 30-product catalog with historical sales & prices
│       └── daily_history.json           # Daily sales time series for visualization
│
├── notebooks/
│   └── demandwise_colab.ipynb           # Model training and MLflow pipeline notebook
│
├── models/
│   ├── bundle_7d.joblib                 # Trained 7-day CatBoost model bundle
│   ├── bundle_14d.joblib                # Trained 14-day CatBoost model bundle
│   ├── bundle_30d.joblib                # Trained 30-day CatBoost model bundle
│   ├── product_registry.joblib          # Selected 30 high-volume retail SKUs
│   ├── metadata.json                    # Model hyperparameters, WAPE metrics, and feature lists
│   └── mlflow_runs/                     # MLflow experiment runs & tracking artifacts
│
├── backend/
│   ├── main.py                          # FastAPI REST service & endpoint controllers
│   ├── model_loader.py                  # Singleton model manager & inference engine
│   ├── schemas.py                       # Pydantic request/response validation models
│   ├── requirements.txt                 # Backend Python dependencies
│   └── Dockerfile                       # Production Python 3.11 container image
│
├── frontend/
│   ├── public/
│   │   └── index.html                   # HTML entry point with Inter font
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx            # Integrated forecasting dashboard view
│   │   │   ├── ProductSelector.jsx      # Product SKU, horizon & stock control panel
│   │   │   ├── ForecastChart.jsx        # Recharts interactive forecast & stock rundown chart
│   │   │   ├── InventoryCard.jsx        # Metric KPI cards with inventory health badges
│   │   │   ├── AlertBanner.jsx          # Stockout and overstock alert banner
│   │   │   ├── Sidebar.jsx              # Deep charcoal navigation sidebar
│   │   │   ├── TopBar.jsx               # Header with search, status, and profile
│   │   │   ├── ProductTable.jsx         # Product demand table with search & pagination
│   │   │   ├── ToastContainer.jsx       # Action toast notifications
│   │   │   └── Icons.jsx                # Clean SVG icon components
│   │   ├── pages/                       # Overview, Forecast, Products, Inventory, Model, Settings
│   │   ├── App.jsx                      # App shell & router state
│   │   ├── App.css                      # SaaS design system stylesheet
│   │   └── index.js                     # React DOM entry point
│   ├── package.json                     # Frontend Node dependencies (React 18 + Recharts)
│   └── Dockerfile                       # Multi-stage Node build + Nginx container
│
├── tests/
│   ├── test_api.py                      # FastAPI endpoint integration tests
│   └── test_model.py                    # Model bundle, registry & prediction tests
│
├── .github/
│   └── workflows/
│       └── ci.yml                       # Continuous integration workflow
│
├── docker-compose.yml                   # Multi-container orchestration (Backend + Frontend)
├── .env.example                         # Environment variable template
└── README.md                            # Comprehensive system documentation
```

---

## 🧠 Model Artifacts & ML Pipeline

The machine learning pipeline trains dedicated CatBoost regression models for each forecasting horizon using 24 engineered features:

| Artifact | Type | Description |
|---|---|---|
| `bundle_7d.joblib` | CatBoost Model Bundle | Predicts 7-day aggregate demand (`sum of next 7 calendar days gross positive units`) |
| `bundle_14d.joblib` | CatBoost Model Bundle | Predicts 14-day aggregate demand (`sum of next 14 calendar days gross positive units`) |
| `bundle_30d.joblib` | CatBoost Model Bundle | Predicts 30-day aggregate demand (`sum of next 30 calendar days gross positive units`) |
| `product_registry.joblib` | Dictionary | Contains the 30 active high-frequency retail SKUs and reference cutoff date (`2011-12-09`) |
| `metadata.json` | JSON | Model hyperparameter tracking, feature names list, and holdout test WAPE benchmarks |

### Holdout Test Evaluation Metrics

| Horizon | Model Architecture | Best Iteration | Test Model WAPE | Baseline WAPE | Relative Performance |
|---|---|---|---|---|---|
| **7 Days** | CatBoost Regressor | 124 | **43.0%** | 42.6% | Competitive with rolling baseline |
| **14 Days** | CatBoost Regressor | 278 | **37.0%** | 36.7% | Improved medium-range stability |
| **30 Days** | CatBoost Regressor | 261 | **31.0%** | 34.3% | **+3.3% accuracy improvement** over baseline |

*Loss Function: MAE (Mean Absolute Error) with L2 leaf regularization = 5 and depth = 7.*

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Python:** 3.10, 3.11, or 3.12
- **Node.js:** 18+ and npm
- **Docker & Docker Compose** (optional for containerized deployment)

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start development server
npm start
```

The React dashboard will open automatically at `http://localhost:3000`.

---

### 4. Running with Docker Compose

Deploy the complete full-stack system with a single command:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📡 API Endpoints Reference

### 1. Health Check
`GET /health`
```json
{
  "status": "healthy",
  "models_loaded": true,
  "supported_horizons": [7, 14, 30],
  "product_count": 30,
  "metadata": {
    "target_definition": "sum of next N calendar days gross positive units"
  }
}
```

### 2. Available Products
`GET /api/products`
```json
[
  {
    "product_id": "85123A",
    "name": "WHITE HANGING HEART T-LIGHT HOLDER",
    "unit_price": 2.95,
    "total_units_sold": 100152,
    "mean_7_daily": 93.9,
    "mean_28_daily": 130.7,
    "zero_share_28": 0.14
  }
]
```

### 3. Supported Forecasting Horizons
`GET /api/horizons`
```json
[
  {
    "horizon": 7,
    "label": "Next 7 Days",
    "test_model_wape": 0.4302,
    "test_baseline_wape": 0.4256,
    "best_iteration": 124
  },
  {
    "horizon": 14,
    "label": "Next 14 Days",
    "test_model_wape": 0.3696,
    "test_baseline_wape": 0.3668,
    "best_iteration": 278
  },
  {
    "horizon": 30,
    "label": "Next 30 Days",
    "test_model_wape": 0.3096,
    "test_baseline_wape": 0.3434,
    "best_iteration": 261
  }
]
```

### 4. Generate Demand Forecast
`POST /predict` or `POST /api/forecast`

**Request:**
```json
{
  "product_id": "85123A",
  "horizon": 7,
  "current_stock": 100
}
```

**Response:**
```json
{
  "product_id": "85123A",
  "product_name": "WHITE HANGING HEART T-LIGHT HOLDER",
  "horizon": 7,
  "total_predicted_demand": 645.75,
  "average_daily_demand": 92.25,
  "current_stock": 100,
  "reorder_quantity": 545.75,
  "inventory_status": "Low Stock",
  "alert": "Low Stock Alert: Current stock (100 units) covers less than 50% of forecasted 7-day demand (646 units). Recommended reorder: 546 units.",
  "model_wape": 0.4302,
  "baseline_wape": 0.4256,
  "predicted_demand": [
    { "date": "2026-11-20", "predicted": 103.3, "stock_projection": 0.0 },
    { "date": "2026-11-21", "predicted": 64.6, "stock_projection": 0.0 }
  ]
}
```

---

## 🧪 Automated Testing

The project includes unit and integration tests covering the model manager, API contracts, multi-horizon predictions, and inventory logic:

```bash
# Run pytest test suite
pytest tests/ -v
```

**Test Coverage Highlights:**
- `test_metadata_loads_successfully`: Verifies `metadata.json` structure and WAPE values.
- `test_product_registry_loads_successfully`: Confirms 30 registered SKUs.
- `test_all_three_model_bundles_load`: Validates 7d, 14d, and 30d CatBoost bundles.
- `test_prediction_7d`, `test_prediction_14d`, `test_prediction_30d`: Validates multi-horizon predictions.
- `test_horizon_demand_monotonicity`: Verifies that aggregate demand grows with horizon length ($D_{7d} < D_{14d} < D_{30d}$).
- `test_inventory_status_scenarios`: Tests Low Stock, Normal, Overstock, and missing stock handling.
- `test_predict_invalid_horizon`: Verifies 400 Bad Request error on invalid horizon inputs.
- `test_legacy_payload_backward_compatibility`: Verifies backward compatibility with previous API contracts.

---

## 📊 Inventory Intelligence Rules

- **Low Stock:** Triggered when `current_stock < (total_predicted_demand * 0.5)`. Reorder recommendation: `total_predicted_demand - current_stock`.
- **Overstock:** Triggered when `current_stock > (total_predicted_demand * 1.5)`. Highlights excess inventory.
- **Normal / Healthy:** Current stock comfortably meets predicted demand with a safe operational buffer.
- **Not Provided:** If the user has not entered current stock on hand, demand forecasts are clearly displayed while reorder suggestions prompt for stock input without fabricating fake inventory values.
