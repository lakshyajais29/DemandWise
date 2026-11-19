import React from 'react';
import InventoryPanel from '../components/InventoryPanel';
import { DEMO_INVENTORY } from '../data/mockData';

function OverstockAlerts() {
  const over = DEMO_INVENTORY.filter(i => i.status === 'Overstocked');
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title" style={{ color: 'var(--warn)' }}>Overstock Alerts</div>
          <div className="section-card-subtitle">{over.length} products with excess inventory</div>
        </div>
      </div>
      <div className="section-card-body" style={{ padding: '8px 22px' }}>
        {over.map(item => (
          <div key={item.stockCode} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.stockCode}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warn)' }}>
                +{item.current - item.predicted} excess units
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Current: {item.current}</div>
            </div>
          </div>
        ))}
        {over.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-title">No overstock alerts</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <>
      <InventoryPanel />
      <div className="two-col">
        {/* Summary stats */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Inventory Summary</div>
            <span className="demo-badge">Estimated</span>
          </div>
          <div className="section-card-body">
            {[
              { label: 'Total SKUs Tracked',     value: DEMO_INVENTORY.length,                                        sub: 'active products'          },
              { label: 'Low Stock Products',      value: DEMO_INVENTORY.filter(i => i.status === 'Low Stock').length,  sub: 'require immediate reorder' },
              { label: 'Overstocked Products',    value: DEMO_INVENTORY.filter(i => i.status === 'Overstocked').length,sub: 'excess inventory'          },
              { label: 'Total Reorder Units',     value: DEMO_INVENTORY.reduce((s,i) => s+i.reorder,0),               sub: 'units to order now'        },
            ].map(m => (
              <div key={m.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{m.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.sub}</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
        <OverstockAlerts />
      </div>
    </>
  );
}
