import React from 'react';
import { DEMO_TOP_PRODUCTS } from '../data/mockData';
import { IconStar } from './Icons';

export default function TopProducts() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">
            <IconStar size={14} style={{ color: '#D97706' }} />
            Top Selling Products
          </div>
          <div className="section-card-subtitle">By units sold — last 30 days</div>
        </div>
        <span className="demo-badge">Demo</span>
      </div>
      <div className="section-card-body" style={{ padding: '8px 22px' }}>
        {DEMO_TOP_PRODUCTS.map(p => (
          <div className="top-product-item" key={p.rank}>
            <div className={`top-product-rank${p.rank === 1 ? ' gold' : ''}`}>{p.rank}</div>
            <div className="top-product-name" title={p.name}>{p.name}</div>
            <div>
              <div className="top-product-value">{p.value}</div>
              <div className="top-product-delta">{p.delta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
