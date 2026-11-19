import React, { useState } from 'react';
import ForecastPanel from '../components/ForecastPanel';
import ForecastChartPanel from '../components/ForecastChartPanel';
import { DEMO_PRODUCTS } from '../data/mockData';

export default function ForecastPage() {
  const [selectedProduct, setSelectedProduct] = useState('');

  return (
    <>
      {/* Quick product picker */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title-block">
            <div className="section-card-title">Common Products</div>
            <div className="section-card-subtitle">Click to auto-fill the forecast panel below</div>
          </div>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DEMO_PRODUCTS.slice(0, 6).map(p => (
              <button
                key={p.id}
                className={`period-pill${selectedProduct === p.id ? ' active' : ''}`}
                onClick={() => setSelectedProduct(p.id)}
                title={p.name}
              >
                {p.id} — {p.name.substring(0, 22)}{p.name.length > 22 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main forecast panel — integrates with real /predict endpoint */}
      <ForecastPanel initialStockCode={selectedProduct} />

      {/* Demo chart for context */}
      <ForecastChartPanel selectedProduct={selectedProduct || '85123A'} />
    </>
  );
}
