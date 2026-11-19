import React from 'react';
import { IconSearch, IconBell, IconCalendar, IconMenu } from './Icons';

const PAGE_META = {
  overview:  { title: 'Overview',           desc: 'Your demand intelligence snapshot for today' },
  forecast:  { title: 'Demand Forecast',    desc: 'AI-powered demand predictions for your products' },
  products:  { title: 'Product Analytics',  desc: 'Detailed demand analysis by product SKU' },
  inventory: { title: 'Inventory Planning', desc: 'Reorder recommendations and stock intelligence' },
  sales:     { title: 'Sales Insights',     desc: 'Revenue trends and top-performing products' },
  model:     { title: 'Model Performance',  desc: 'Forecasting model accuracy and MLflow metrics' },
  settings:  { title: 'Settings',           desc: 'Configure your DemandWise preferences' },
};

export default function TopBar({ activePage, apiOnline, onMobileMenu }) {
  const meta = PAGE_META[activePage] || PAGE_META.overview;
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="topbar">
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={onMobileMenu}>
        <IconMenu size={18} />
      </button>

      {/* Title */}
      <div className="topbar-title-block">
        <div className="topbar-page-title">{meta.title}</div>
        <div className="topbar-page-desc">{meta.desc}</div>
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Search */}
        <div className="topbar-search">
          <IconSearch size={13} />
          <input type="text" placeholder="Search products, SKUs…" />
        </div>

        {/* Date range */}
        <button className="date-range-btn btn">
          <IconCalendar size={13} />
          <span>Last 30 days</span>
        </button>

        {/* Notifications */}
        <button className="icon-btn">
          <IconBell size={15} />
          <span className="badge">3</span>
        </button>

        {/* API status indicator */}
        <div
          title={apiOnline === null ? 'Checking API…' : apiOnline ? 'API Online' : 'API Offline'}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 10px', height: 34,
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-muted)'
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: apiOnline === null ? '#94a3b8' : apiOnline ? '#22c55e' : '#ef4444',
            boxShadow: apiOnline ? '0 0 0 2px rgba(34,197,94,0.25)' : 'none',
          }} />
          <span style={{ display: 'none', '@media(min-width: 1024px)': { display: 'inline' } }}>
            {apiOnline === null ? 'Checking' : apiOnline ? 'API Online' : 'Demo Mode'}
          </span>
        </div>

        {/* User */}
        <div className="topbar-user">
          <div className="topbar-user-avatar">LJ</div>
          <span className="topbar-user-name">Lakshya</span>
        </div>
      </div>
    </header>
  );
}
