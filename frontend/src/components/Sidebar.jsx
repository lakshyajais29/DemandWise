import React from 'react';
import {
  IconHome, IconActivity, IconPackage, IconBox,
  IconBarChart, IconCpu, IconSettings, IconMenu, IconX
} from './Icons';

const NAV_ITEMS = [
  { key: 'overview',    label: 'Overview',          Icon: IconHome      },
  { key: 'forecast',    label: 'Demand Forecast',   Icon: IconActivity  },
  { key: 'products',    label: 'Product Analytics', Icon: IconBarChart  },
  { key: 'inventory',   label: 'Inventory Planning',Icon: IconBox       },
  { key: 'sales',       label: 'Sales Insights',    Icon: IconPackage   },
  { key: 'model',       label: 'Model Performance', Icon: IconCpu       },
  { key: 'settings',    label: 'Settings',          Icon: IconSettings  },
];

export default function Sidebar({ activePage, onNavigate, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">DemandWise</span>
            <span className="sidebar-brand-tagline">Demand Intelligence</span>
          </div>
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          <ul>
            {NAV_ITEMS.slice(0, 4).map(({ key, label, Icon }) => (
              <li key={key}>
                <div
                  className={`sidebar-nav-item${activePage === key ? ' active' : ''}`}
                  onClick={() => { onNavigate(key); onMobileClose(); }}
                >
                  <Icon size={15} />
                  {label}
                </div>
              </li>
            ))}
          </ul>
          <div className="sidebar-section-label" style={{ marginTop: 8 }}>Analytics</div>
          <ul>
            {NAV_ITEMS.slice(4, 6).map(({ key, label, Icon }) => (
              <li key={key}>
                <div
                  className={`sidebar-nav-item${activePage === key ? ' active' : ''}`}
                  onClick={() => { onNavigate(key); onMobileClose(); }}
                >
                  <Icon size={15} />
                  {label}
                </div>
              </li>
            ))}
          </ul>
          <div className="divider" style={{ marginTop: 8 }} />
          <ul style={{ marginTop: 4 }}>
            <li>
              <div
                className={`sidebar-nav-item${activePage === 'settings' ? ' active' : ''}`}
                onClick={() => { onNavigate('settings'); onMobileClose(); }}
              >
                <IconSettings size={15} />
                Settings
              </div>
            </li>
          </ul>
        </nav>

        {/* System status */}
        <div className="sidebar-status">
          <div className="status-dot" id="api-status-dot" />
          <span className="status-label" id="api-status-label">API Connecting…</span>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">LJ</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Lakshya Jaiswal</div>
            <div className="sidebar-user-role">Admin · Analyst</div>
          </div>
        </div>
      </aside>
    </>
  );
}
