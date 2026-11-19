import React from 'react';
import { DEMO_INVENTORY } from '../data/mockData';

function StatusBadge({ status }) {
  if (status === 'Low Stock')   return <span className="badge badge-low">Low Stock</span>;
  if (status === 'Overstocked') return <span className="badge badge-over">Overstocked</span>;
  return <span className="badge badge-ok">Healthy</span>;
}

function InventoryBar({ current, predicted }) {
  const pct = predicted > 0 ? Math.min(100, (current / (predicted * 1.5)) * 100) : 100;
  const cls = current < predicted * 0.5 ? 'low' : current > predicted * 1.5 ? 'over' : 'ok';
  return (
    <div className="inventory-bar-wrap">
      <div className="inventory-bar-row">
        <span>Current: {current}</span>
        <span>Target: {Math.round(predicted * 1.2)}</span>
      </div>
      <div className="inventory-bar-track">
        <div className={`inventory-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function InventoryPanel() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">
            Inventory Intelligence
            <span className="demo-badge">Estimated</span>
          </div>
          <div className="section-card-subtitle">
            Stock levels vs. 7-day predicted demand · Estimates calculated from forecast data
          </div>
        </div>
      </div>
      <div className="section-card-body" style={{ padding: '12px 22px' }}>
        {DEMO_INVENTORY.map(item => (
          <div className="inventory-item" key={item.stockCode}>
            <div className="inventory-item-info" style={{ width: 160, flexShrink: 0 }}>
              <div className="inventory-item-name" title={item.name}>{item.name}</div>
              <div className="inventory-item-code">{item.stockCode}</div>
            </div>
            <InventoryBar current={item.current} predicted={item.predicted} />
            <StatusBadge status={item.status} />
            <div style={{ width: 100, flexShrink: 0, textAlign: 'right' }}>
              {item.reorder > 0 ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)' }}>
                  Reorder: {item.reorder} units
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.status === 'Overstocked' ? 'Excess stock' : 'On track'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
