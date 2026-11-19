from fastapi.testclient import TestClient
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from main import app

client = TestClient(app)

def test_root():
    res = client.get('/')
    assert res.status_code == 200
    assert 'DemandWise' in res.json()['message']

def test_health():
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json()['status'] == 'healthy'

def test_predict_valid():
    payload = {
        'stock_code': '85123A',
        'lag_1': 50.0, 'lag_7': 45.0, 'lag_30': 48.0,
        'rolling_7': 47.0, 'rolling_30': 46.5,
        'day_of_week': 1, 'month': 11, 'is_weekend': 0,
        'current_stock': 75
    }
    res = client.post('/predict', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert 'predicted_demand' in data
    assert 'stock_status' in data
    assert data['predicted_demand'] >= 0

def test_predict_missing_field():
    res = client.post('/predict', json={'stock_code': '85123A'})
    assert res.status_code == 422