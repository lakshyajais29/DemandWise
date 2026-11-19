import React from 'react';
import { DEMO_KPI } from '../data/mockData';
import { IconBarChart, IconShoppingCart, IconTarget, IconPackage, IconAlertTriangle, IconCheckCircle, IconTrendingUp, IconTrendingDown } from './Icons';

const CARD_CONFIGS = [
  { key: 'totalProducts',    label: 'Total Products',     Icon: IconPackage,      iconBg: '#FFF4ED', iconColor: '#C66A3D' },
  { key: 'unitsSold',        label: 'Units Sold',         Icon: IconShoppingCart, iconBg: '#F0FDF4', iconColor: '#15803D' },
  { key: 'forecastedDemand', label: 'Forecasted Demand',  Icon: IconTarget,       iconBg: '#FEF9EE', iconColor: '#D97706' },
  { key: 'currentInventory', label: 'Current Inventory',  Icon: IconBarChart,     iconBg: '#F0F9FF', iconColor: '#0369A1' },
  { key: 'lowStockProducts', label: 'Low Stock Products', Icon: IconAlertTriangle,iconBg: '#FFF1F2', iconColor: '#DC2626' },
  { key: 'forecastAccuracy', label: 'Forecast Accuracy',  Icon: IconCheckCircle,  iconBg: '#F0FDF4', iconColor: '#15803D' },
];

function SkeletonCard() {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className="skeleton skeleton-text" style={{ width: 80, height: 10 }} />
        <div className="skeleton skeleton-rect" style={{ width: 32, height: 32 }} />
      </div>
      <div className="skeleton skeleton-title" style={{ width: 70, height: 24 }} />
      <div className="skeleton skeleton-text" style={{ width: 110, height: 10 }} />
    </div>
  );
}

export default function KpiGrid({ loading = false }) {
  if (loading) {
    return (
      <div className="kpi-grid">
        {CARD_CONFIGS.map(c => <SkeletonCard key={c.key} />)}
      </div>
    );
  }

  return (
    <div className="kpi-grid">
      {CARD_CONFIGS.map(({ key, label, Icon, iconBg, iconColor }) => {
        const d = DEMO_KPI[key];
        return (
          <div className="kpi-card" key={key}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{label}</span>
              <div className="kpi-card-icon" style={{ background: iconBg }}>
                <Icon size={15} style={{ color: iconColor }} />
              </div>
            </div>
            <div className="kpi-card-value">{d.value}</div>
            <div className="kpi-card-footer">
              <span className={`kpi-delta ${key === 'lowStockProducts' ? (d.dir === 'up' ? 'down' : 'up') : d.dir}`}>
                {d.dir === 'up' ? <IconTrendingUp size={10} /> : <IconTrendingDown size={10} />}
                {d.delta}
              </span>
              <span className="kpi-compare-label">{d.vs}</span>
              <span className="demo-badge" style={{ marginLeft: 'auto' }}>Demo</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
