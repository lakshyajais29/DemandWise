import React, { useState, useEffect, useCallback } from 'react';
import ProductSelector from './ProductSelector';
import ForecastChart from './ForecastChart';
import InventoryCard from './InventoryCard';
import AlertBanner from './AlertBanner';
import { IconRefresh, IconTarget, IconBox, IconPackage, IconCheckCircle } from './Icons';
import { useToastContext } from '../hooks/useToast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Dashboard({ defaultSku = '85123A' }) {
  const { addToast } = useToastContext();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(defaultSku);
  const [horizon, setHorizon] = useState(7);
  const [currentStock, setCurrentStock] = useState(150);

  const [loading, setLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState('');

  // 1. Fetch available products from backend
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setProducts(data);
            if (!selectedProduct && data[0]?.product_id) {
              setSelectedProduct(data[0].product_id);
            }
          }
        }
      } catch (err) {
        console.warn('Using default product list (API offline or unreachable)');
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch forecast and history for selected product
  const handleGenerateForecast = useCallback(async () => {
    if (!selectedProduct) {
      setError('Please select a product SKU.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parallel fetch: forecast prediction + historical daily sales
      const [forecastRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: selectedProduct,
            horizon: Number(horizon),
            current_stock: currentStock === null ? null : Number(currentStock),
          }),
        }),
        fetch(`${API_URL}/api/products/${selectedProduct}/history`).catch(() => null),
      ]);

      if (!forecastRes.ok) {
        const errJson = await forecastRes.json().catch(() => ({}));
        throw new Error(errJson.detail || `Prediction failed with status ${forecastRes.status}`);
      }

      const forecastData = await forecastRes.json();
      setForecastResult(forecastData);

      if (historyRes && historyRes.ok) {
        const historyJson = await historyRes.json();
        setHistoricalData(historyJson.history || []);
      } else {
        setHistoricalData([]);
      }

      addToast(`Generated ${horizon}-day forecast for ${selectedProduct}`, 'success');
    } catch (err) {
      setError(err.message);
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, horizon, currentStock, addToast]);

  // Initial load
  useEffect(() => {
    handleGenerateForecast();
  }, [selectedProduct, horizon]);

  const selectedProductObj = products.find(
    (p) => (p.product_id || p.id) === selectedProduct
  );
  const productName = selectedProductObj?.name || forecastResult?.product_name || selectedProduct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Product & Parameter Controls */}
      <ProductSelector
        products={products}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        horizon={horizon}
        onSelectHorizon={setHorizon}
        currentStock={currentStock}
        onChangeStock={setCurrentStock}
        disabled={loading}
      />

      {/* Manual refresh / forecast trigger button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: -8 }}>
        <button
          className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
          onClick={handleGenerateForecast}
          disabled={loading}
          style={{ height: 38 }}
        >
          <IconRefresh size={14} />
          {loading ? 'Forecasting…' : 'Recalculate Forecast'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <AlertBanner
          status="critical"
          message={`API Request Error: ${error}`}
          onClose={() => setError('')}
        />
      )}

      {/* Alert Banner from Forecast Result */}
      {forecastResult && forecastResult.alert && (
        <AlertBanner
          status={forecastResult.inventory_status}
          message={forecastResult.alert}
        />
      )}

      {/* KPI Inventory Cards */}
      {forecastResult && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
          }}
        >
          <InventoryCard
            label={`Total Forecast (${horizon}d)`}
            value={`${Math.round(forecastResult.total_predicted_demand).toLocaleString()}`}
            unit="units aggregate demand"
            color="var(--accent)"
            subtitle={`CatBoost ${horizon}d Bundle`}
          />

          <InventoryCard
            label="Average Daily Demand"
            value={`${forecastResult.average_daily_demand}`}
            unit="units / calendar day"
            color="#D98B68"
            subtitle={`Horizon: ${horizon} days`}
          />

          <InventoryCard
            label="Current Inventory"
            value={forecastResult.current_stock !== null ? forecastResult.current_stock.toLocaleString() : 'Not Provided'}
            unit="units on hand"
            color="#0369A1"
            subtitle={forecastResult.current_stock !== null ? 'Stock verified' : 'Enter stock above'}
          />

          <InventoryCard
            label="Reorder Recommendation"
            value={forecastResult.reorder_quantity > 0 ? `${Math.round(forecastResult.reorder_quantity).toLocaleString()}` : '0'}
            unit={forecastResult.reorder_quantity > 0 ? 'additional units needed' : 'stock sufficient'}
            color={forecastResult.reorder_quantity > 0 ? 'var(--danger)' : 'var(--success)'}
            status={forecastResult.inventory_status}
          />

          <InventoryCard
            label="Model Test WAPE"
            value={forecastResult.model_wape ? `${(forecastResult.model_wape * 100).toFixed(1)}%` : '—'}
            unit="test weighted error"
            color="#15803D"
            subtitle={forecastResult.baseline_wape ? `Baseline WAPE: ${(forecastResult.baseline_wape * 100).toFixed(1)}%` : 'MLflow tracked'}
          />
        </div>
      )}

      {/* Forecast Line Chart */}
      <ForecastChart
        forecastData={forecastResult?.predicted_demand || []}
        historicalData={historicalData}
        productName={productName}
        productId={selectedProduct}
        horizon={horizon}
        reorderPoint={
          forecastResult?.total_predicted_demand
            ? forecastResult.total_predicted_demand * 0.4
            : null
        }
      />
    </div>
  );
}
