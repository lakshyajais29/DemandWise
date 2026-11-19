# DemandWise

**DemandWise** is an end-to-end demand forecasting and inventory optimization platform. It utilizes retail transaction data to forecast future demand, track inventory health, calculate reorder thresholds, and surface stockout alerts.

---

## 📁 Project Architecture

```
Demandwise/
├── data/
│   ├── raw/
│   │   └── online_retail_II.xlsx
│   └── processed/
│       ├── cleaned_data.csv
│       └── featured_data.csv
│
├── notebooks/
│   └── demandwise_colab.ipynb
│
├── models/
│   └── mlflow_runs/
│
├── backend/
│   ├── main.py
│   ├── model_loader.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductSelector.jsx
│   │   │   ├── ForecastChart.jsx
│   │   │   ├── InventoryCard.jsx
│   │   │   └── AlertBanner.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
│
├── tests/
│   ├── test_api.py
│   └── test_model.py
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional for containerized deployment)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at: `http://localhost:3000`

### 4. Run with Docker Compose
```bash
docker-compose up --build
```

### 5. Running Tests
```bash
pytest tests/
```
