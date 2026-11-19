import React from 'react';
import TopProducts from '../components/TopProducts';
import ForecastChartPanel from '../components/ForecastChartPanel';
import { DEMO_KPI } from '../data/mockData';

export default function SalesPage() {
  return (
    <>
      <div className="two-col">
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title-block">
              <div className="section-card-title">Sales Overview <span className="demo-badge">Demo</span></div>
              <div className="section-card-subtitle">Key sales metrics — last 30 days</div>
            </div>
          </div>
          <div className="section-card-body">
            {[
              { label: 'Total Units Sold',     value: '84,310',  color: 'var(--accent)'  },
              { label: 'Revenue (Estimated)',  value: '£142,480',color: '#15803D'         },
              { label: 'Avg. Order Size',      value: '3.2 units',color: 'var(--text)'   },
              { label: 'Return Rate',          value: '1.4%',    color: 'var(--danger)'  },
            ].map(m => (
              <div key={m.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '13px 0', borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.label}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
        <TopProducts />
      </div>
      <ForecastChartPanel selectedProduct="85123A" />
    </>
  );
}
