import React, { useState } from 'react';
import ProductSelector from './ProductSelector';
import InventoryCard from './InventoryCard';
import AlertBanner from './AlertBanner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const FEATURES_TEMPLATE = {
  lag_1: 50, lag_7: 45, lag_30: 48,
  rolling_7: 47, rolling_30: 46,
  day_of_week: 1, month: 11, is_weekend: 0
};

export default function Dashboard() {
  const [stockCode, setStockCode] = useState('');
  const [currentStock, setCurrentStock] = useState(75);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    if (!stockCode) { setError('Stock code required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_code: stockCode,
          ...FEATURES_TEMPLATE,
          current_stock: currentStock
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="controls">
        <ProductSelector
          stockCode={stockCode}
          setStockCode={setStockCode}
          currentStock={currentStock}
          setCurrentStock={setCurrentStock}
        />
        <button onClick={handlePredict} disabled={loading} className="predict-btn">
          {loading ? 'Predicting...' : 'Get Forecast'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <AlertBanner status={result.stock_status} message={result.alert_message} />
          <div className="cards-grid">
            <InventoryCard label="Predicted Demand" value={result.predicted_demand.toFixed(0)} unit="units / 7 days" color="#4f46e5" />
            <InventoryCard label="Current Inventory" value={result.current_stock} unit="units available" color="#0891b2" />
            <InventoryCard label="Reorder Quantity" value={result.reorder_quantity.toFixed(0)} unit="additional units" color="#059669" />
            <InventoryCard label="Stock Status" value={result.stock_status} unit="" color={
              result.stock_status === 'Low Stock' ? '#dc2626' :
                result.stock_status === 'Overstock' ? '#d97706' : '#16a34a'
            } />
          </div>
        </>
      )}
    </div>
  );
}