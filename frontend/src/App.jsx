import React, { useState, useEffect } from 'react';
import './App.css';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ToastContainer } from './components/ToastContainer';
import { useToast, ToastContext } from './hooks/useToast';

import OverviewPage from './pages/OverviewPage';
import ForecastPage from './pages/ForecastPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ModelPage from './pages/ModelPage';
import SettingsPage from './pages/SettingsPage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function PageContent({ activePage, onNavigate }) {
  switch (activePage) {
    case 'overview': return <OverviewPage onNavigate={onNavigate} />;
    case 'forecast': return <ForecastPage />;
    case 'products': return <ProductsPage onNavigate={onNavigate} />;
    case 'inventory': return <InventoryPage />;
    case 'sales': return <SalesPage />;
    case 'model': return <ModelPage />;
    case 'settings': return <SettingsPage />;
    default: return <OverviewPage onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  // Check API health on mount
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(4000) });
        const online = res.ok;
        setApiOnline(online);
        // Update sidebar status indicator
        const dot = document.getElementById('api-status-dot');
        const lbl = document.getElementById('api-status-label');
        if (dot) dot.className = `status-dot${online ? '' : ' offline'}`;
        if (lbl) lbl.textContent = online ? 'API Online' : 'Demo Mode';
        if (!online) addToast('Backend offline — running in demo mode', 'warning');
      } catch {
        setApiOnline(false);
        const dot = document.getElementById('api-status-dot');
        const lbl = document.getElementById('api-status-label');
        if (dot) dot.className = 'status-dot offline';
        if (lbl) lbl.textContent = 'Demo Mode';
        addToast('Backend offline — running in demo mode', 'warning');
      }
    };
    check();
    // We only want this to run once on mount
    // eslint-disable-next-line
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="app-shell">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="main-content">
          <TopBar
            activePage={activePage}
            apiOnline={apiOnline}
            onMobileMenu={() => setMobileOpen(true)}
          />
          <div className="page-content">
            <PageContent activePage={activePage} onNavigate={handleNavigate} />
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
