import React, { useState } from 'react';
import KpiGrid from '../components/KpiGrid';
import ForecastChartPanel from '../components/ForecastChartPanel';
import ActivityFeed from '../components/ActivityFeed';
import TopProducts from '../components/TopProducts';
import { DEMO_INVENTORY } from '../data/mockData';
import { IconAlertTriangle, IconDownload } from '../components/Icons';

function LowStockAlerts() {
  const lowStock = DEMO_INVENTORY.filter(i => i.status === 'Low Stock');
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title" style={{ color: 'var(--danger)' }}>
            <IconAlertTriangle size={15} />
            Low Stock Alerts
          </div>
          <div className="section-card-subtitle">{lowStock.length} products require immediate reorder</div>
        </div>
        <span className="demo-badge">Demo</span>
      </div>
      <div className="section-card-body" style={{ padding: '8px 22px' }}>
        {lowStock.map(item => (
          <div key={item.stockCode} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{item.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.stockCode}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 700 }}>
                {item.current} / {item.predicted} units
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Reorder: {item.reorder} units
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage({ onNavigate }) {
  const [kpiLoading] = useState(false);

  return (
    <>
      {/* KPIs */}
      <KpiGrid loading={kpiLoading} />

      {/* Chart + Alerts */}
      <div className="three-col">
        <ForecastChartPanel selectedProduct="85123A" />
        <LowStockAlerts />
      </div>

      {/* Bottom row: Activity + Top Products + Export */}
      <div className="two-col">
        <ActivityFeed />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TopProducts />
          {/* Quick actions card */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="section-card-title">Quick Actions</div>
            </div>
            <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => onNavigate('forecast')}>
                Get Demand Forecast
              </button>
              <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={() => onNavigate('inventory')}>
                View Inventory Plan
              </button>
              <button
                className="btn btn-ghost w-full"
                style={{ justifyContent: 'center' }}
                onClick={() => {
                  const data = 'SKU,Units Sold,Forecast,Stock,Status\n85123A,2458,312,85,Low Stock\n71053,1876,198,440,Healthy';
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
                  a.download = 'demandwise_report.csv';
                  a.click();
                }}
              >
                <IconDownload size={13} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
