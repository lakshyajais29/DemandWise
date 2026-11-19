import React from 'react';
import { IconPackage, IconCalendar, IconBox } from './Icons';

export default function ProductSelector({
  products = [],
  selectedProduct,
  onSelectProduct,
  horizon = 7,
  onSelectHorizon,
  currentStock,
  onChangeStock,
  disabled = false,
}) {
  const HORIZONS = [
    { value: 7, label: '7 Days' },
    { value: 14, label: '14 Days' },
    { value: 30, label: '30 Days' },
  ];

  return (
    <div className="section-card" style={{ marginBottom: 20 }}>
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">
            <IconPackage size={16} style={{ color: 'var(--accent)' }} />
            Forecast Parameters & Product Selection
          </div>
          <div className="section-card-subtitle">
            Choose an e-commerce product SKU, forecasting horizon, and optional stock on hand
          </div>
        </div>
      </div>
      <div className="section-card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {/* Product Dropdown */}
          <div className="form-group">
            <label className="form-label">
              Select Product SKU <span>*</span>
            </label>
            <select
              className="form-input"
              value={selectedProduct}
              onChange={(e) => onSelectProduct(e.target.value)}
              disabled={disabled}
              style={{ cursor: 'pointer' }}
            >
              <option value="" disabled>-- Select a Product SKU --</option>
              {products.map((p) => (
                <option key={p.product_id || p.id} value={p.product_id || p.id}>
                  [{p.product_id || p.id}] {p.name}
                </option>
              ))}
            </select>
            <div className="form-hint">
              Top 30 high-volume retail SKUs from CatBoost Model Registry
            </div>
          </div>

          {/* Horizon Selector */}
          <div className="form-group">
            <label className="form-label">
              <IconCalendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Forecasting Horizon
            </label>
            <div className="forecast-period-selector" style={{ marginTop: 2 }}>
              {HORIZONS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  className={`period-pill${horizon === h.value ? ' active' : ''}`}
                  onClick={() => onSelectHorizon(h.value)}
                  disabled={disabled}
                >
                  {h.label}
                </button>
              ))}
            </div>
            <div className="form-hint">
              Dedicated CatBoost model bundle trained for each horizon window
            </div>
          </div>

          {/* Current Stock Input */}
          <div className="form-group">
            <label className="form-label">
              <IconBox size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Current Stock on Hand (units)
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 150 (Leave blank if uncounted)"
              value={currentStock === null || currentStock === undefined ? '' : currentStock}
              onChange={(e) => {
                const val = e.target.value;
                onChangeStock(val === '' ? null : Math.max(0, parseInt(val, 10) || 0));
              }}
              min={0}
              disabled={disabled}
            />
            <div className="form-hint">
              Used to calculate reorder quantities and stockout thresholds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
