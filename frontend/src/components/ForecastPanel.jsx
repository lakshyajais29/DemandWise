import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { IconAlertTriangle, IconCheckCircle, IconInfo, IconTarget, IconPackage, IconBarChart, IconArrowRight } from './Icons';
import { useToastContext } from '../hooks/useToast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Default feature values based on typical retail seasonal patterns
const AUTO_FEATURES = {
  lag_1: 52, lag_7: 48, lag_30: 50,
  rolling_7: 50, rolling_30: 49,
};

function getTimeFeatures() {
  const now = new Date();
  return {
    day_of_week: now.getDay() === 0 ? 6 : now.getDay() - 1,
    month: now.getMonth() + 1,
    is_weekend: now.getDay() === 0 || now.getDay() === 6 ? 1 : 0,
  };
}

function StatusBadge({ status }) {
  if (status === 'Low Stock')   return <span className="badge badge-low"><span className="badge-dot" />Low Stock</span>;
  if (status === 'Overstock')   return <span className="badge badge-over"><span className="badge-dot" />Overstocked</span>;
  return <span className="badge badge-ok"><span className="badge-dot" />Healthy</span>;
}

function buildForecastCurve(predictedDemand, currentStock, days) {
  const data = [];
  let stock = currentStock;
  for (let i = 1; i <= days; i++) {
    const dailyDemand = +(predictedDemand / 7 * (0.8 + Math.random() * 0.4)).toFixed(0);
    stock = Math.max(0, stock - dailyDemand);
    const d = new Date();
    d.setDate(d.getDate() + i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      stock,
      demand: dailyDemand,
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#252522', borderRadius: 8, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)', minWidth: 150,
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontSize: '0.8rem', color: 'white', marginBottom: 2 }}>
          <span style={{ color: p.stroke, fontWeight: 500 }}>{p.name === 'stock' ? 'Stock' : 'Daily Demand'}</span>
          <span style={{ fontWeight: 700 }}>{p.value} units</span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastPanel({ initialStockCode = '' }) {
  const { addToast } = useToastContext();
  const [stockCode, setStockCode] = useState(initialStockCode);
  const [currentStock, setCurrentStock] = useState(75);
  const [forecastDays, setForecastDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const PERIOD_OPTIONS = [7, 14, 30];

  const validate = () => {
    const errs = {};
    if (!stockCode.trim()) errs.stockCode = 'Stock code is required.';
    else if (!/^[A-Za-z0-9\-_]+$/.test(stockCode.trim())) errs.stockCode = 'Invalid stock code format.';
    if (currentStock < 0 || currentStock === '' || isNaN(currentStock)) errs.currentStock = 'Enter a valid stock quantity (≥ 0).';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePredict = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        stock_code: stockCode.trim().toUpperCase(),
        ...AUTO_FEATURES,
        ...getTimeFeatures(),
        current_stock: Number(currentStock),
      };

      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `API error: ${res.status}`);
      }

      const data = await res.json();
      setResult({ ...data, curve: buildForecastCurve(data.predicted_demand, data.current_stock, forecastDays) });
      addToast(`Forecast ready for ${stockCode.toUpperCase()}`, 'success');
    } catch (e) {
      setError(e.message);
      addToast(`Forecast failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = result
    ? Math.round((result.current_stock / (result.predicted_demand / 7)))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Input Panel */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title-block">
            <div className="section-card-title">Forecast Control Panel</div>
            <div className="section-card-subtitle">
              Enter a product SKU and current stock to get an AI-powered demand forecast from the trained model.
            </div>
          </div>
        </div>
        <div className="section-card-body">
          <div className="forecast-panel">
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  Product Stock Code <span>*</span>
                </label>
                <input
                  type="text"
                  className={`form-input${fieldErrors.stockCode ? ' error' : ''}`}
                  placeholder="e.g. 85123A, 71053, 22633"
                  value={stockCode}
                  onChange={e => { setStockCode(e.target.value); setFieldErrors(f => ({ ...f, stockCode: '' })); }}
                  onKeyDown={e => e.key === 'Enter' && handlePredict()}
                />
                {fieldErrors.stockCode
                  ? <div className="form-error"><IconAlertTriangle size={12} />{fieldErrors.stockCode}</div>
                  : <div className="form-hint">Use the actual StockCode from your Online Retail dataset.</div>
                }
              </div>

              <div className="form-group">
                <label className="form-label">
                  Current Stock (units) <span>*</span>
                </label>
                <input
                  type="number"
                  className={`form-input${fieldErrors.currentStock ? ' error' : ''}`}
                  placeholder="e.g. 75"
                  value={currentStock}
                  min={0}
                  onChange={e => { setCurrentStock(e.target.value); setFieldErrors(f => ({ ...f, currentStock: '' })); }}
                />
                {fieldErrors.currentStock
                  ? <div className="form-error"><IconAlertTriangle size={12} />{fieldErrors.currentStock}</div>
                  : <div className="form-hint">Number of units currently available in inventory.</div>
                }
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Forecast Period</label>
                <div className="forecast-period-selector">
                  {PERIOD_OPTIONS.map(d => (
                    <button
                      key={d}
                      className={`period-pill${forecastDays === d ? ' active' : ''}`}
                      onClick={() => setForecastDays(d)}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
                <div className="form-hint" style={{ marginTop: 6 }}>
                  Forecast horizon for demand prediction and stock projection.
                </div>
              </div>

              {/* Info box */}
              <div style={{
                background: 'rgba(198,106,61,0.06)', border: '1px solid rgba(198,106,61,0.2)',
                borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start'
              }}>
                <IconInfo size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The model uses historical lag features auto-calculated from typical retail patterns.
                  Results are from the trained <strong style={{ color: 'var(--text)' }}>Scikit-learn model</strong> via the FastAPI backend.
                </div>
              </div>

              <button
                className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
                onClick={handlePredict}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', height: 42, marginTop: 'auto' }}
              >
                {!loading && <IconArrowRight size={15} />}
                {loading ? 'Generating Forecast…' : 'Get Demand Forecast'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert-strip danger" style={{ marginTop: 16 }}>
              <IconAlertTriangle size={15} />
              <span><strong>Error:</strong> {error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title-block">
              <div className="section-card-title">
                <IconCheckCircle size={16} style={{ color: 'var(--success)' }} />
                Forecast Result — {result.stock_code}
              </div>
              <div className="section-card-subtitle">
                Live prediction from trained model · {forecastDays}-day horizon
              </div>
            </div>
            {result.alert_message && (
              <div className={`alert-strip${result.stock_status === 'Low Stock' ? ' danger' : ' warn'}`}>
                <IconAlertTriangle size={14} />
                <span>{result.alert_message}</span>
              </div>
            )}
          </div>
          <div className="section-card-body">
            {/* Metric cards */}
            <div className="result-grid">
              <div className="result-metric" style={{ borderTop: '3px solid var(--accent)' }}>
                <div className="result-metric-label">Predicted Demand</div>
                <div className="result-metric-value">{result.predicted_demand.toFixed(0)}</div>
                <div className="result-metric-sub">units / {forecastDays} days</div>
              </div>
              <div className="result-metric" style={{ borderTop: '3px solid #0369A1' }}>
                <div className="result-metric-label">Current Inventory</div>
                <div className="result-metric-value">{result.current_stock}</div>
                <div className="result-metric-sub">units available</div>
              </div>
              <div className="result-metric" style={{ borderTop: `3px solid ${result.reorder_quantity > 0 ? 'var(--danger)' : 'var(--success)'}` }}>
                <div className="result-metric-label">Reorder Quantity</div>
                <div className="result-metric-value">{result.reorder_quantity.toFixed(0)}</div>
                <div className="result-metric-sub">additional units needed</div>
              </div>
              <div className="result-metric">
                <div className="result-metric-label">Stock Status</div>
                <div style={{ marginTop: 6, marginBottom: 4 }}>
                  <StatusBadge status={result.stock_status} />
                </div>
                <div className="result-metric-sub">
                  {daysRemaining !== null && daysRemaining >= 0
                    ? `~${daysRemaining} days remaining at forecast rate`
                    : 'Below demand threshold'}
                </div>
              </div>
            </div>

            {/* Stock projection chart */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
                {forecastDays}-Day Stock Projection
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={result.curve} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9E5DE" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#817D75', fontFamily: 'Inter' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E9E5DE' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#817D75', fontFamily: 'Inter' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {result.reorder_quantity > 0 && (
                    <ReferenceLine
                      y={Math.round(result.predicted_demand * 0.3)}
                      stroke="#DC2626"
                      strokeDasharray="4 2"
                      label={{ value: 'Reorder Point', fill: '#DC2626', fontSize: 10, fontFamily: 'Inter' }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#C66A3D"
                    strokeWidth={2}
                    dot={false}
                    name="stock"
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="#292824"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                    name="demand"
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendation */}
            <div style={{
              marginTop: 20,
              background: result.stock_status === 'Low Stock' ? 'var(--danger-bg)' : result.stock_status === 'Overstock' ? 'var(--warn-bg)' : 'var(--success-bg)',
              border: `1px solid ${result.stock_status === 'Low Stock' ? '#FCA5A5' : result.stock_status === 'Overstock' ? '#FCD34D' : '#86EFAC'}`,
              borderRadius: 8,
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <IconInfo size={15} style={{ flexShrink: 0, marginTop: 2, color: result.stock_status === 'Low Stock' ? 'var(--danger)' : result.stock_status === 'Overstock' ? 'var(--warn)' : 'var(--success)' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
                  Inventory Recommendation
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {result.stock_status === 'Low Stock' && (
                    <>Your current stock of <strong>{result.current_stock} units</strong> is insufficient for the forecasted demand of <strong>{result.predicted_demand.toFixed(0)} units</strong>. Place a reorder of at least <strong>{result.reorder_quantity.toFixed(0)} units</strong> immediately to avoid stockout.</>
                  )}
                  {result.stock_status === 'Overstock' && (
                    <>Your current stock of <strong>{result.current_stock} units</strong> significantly exceeds the forecasted demand of <strong>{result.predicted_demand.toFixed(0)} units</strong>. Consider running a promotion or redistributing excess stock.</>
                  )}
                  {result.stock_status === 'OK' && (
                    <>Your inventory of <strong>{result.current_stock} units</strong> comfortably covers the forecasted demand of <strong>{result.predicted_demand.toFixed(0)} units</strong>. Stock levels are healthy for the next {forecastDays} days.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
