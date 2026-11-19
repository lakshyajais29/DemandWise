import React, { useState, useEffect, useMemo } from 'react';
import { DEMO_TABLE_DATA } from '../data/mockData';
import { IconSearch, IconDownload, IconChevronLeft, IconChevronRight } from './Icons';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const PAGE_SIZE = 8;

function StatusBadge({ status }) {
  if (status === 'Low Stock')   return <span className="badge badge-low"><span className="badge-dot" />Low Stock</span>;
  if (status === 'Overstocked' || status === 'Overstock') return <span className="badge badge-over"><span className="badge-dot" />Overstock</span>;
  return <span className="badge badge-ok"><span className="badge-dot" />Normal</span>;
}

export default function ProductTable({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('unitsSold');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const formatted = data.map((p) => {
              const weeklyForecast = Math.round((p.mean_7_daily || 20) * 7);
              const estStock = Math.round(weeklyForecast * (0.4 + Math.random() * 1.0));
              const status = estStock < weeklyForecast * 0.5 ? 'Low Stock' : estStock > weeklyForecast * 1.4 ? 'Overstock' : 'Normal';
              return {
                stockCode: p.product_id,
                name: p.name,
                unitsSold: p.total_units_sold || Math.round(weeklyForecast * 12),
                predictedDemand: weeklyForecast,
                currentStock: estStock,
                unitPrice: p.unit_price,
                status: status,
              };
            });
            setProducts(formatted);
            setIsLive(true);
          }
        }
      } catch {
        setProducts(DEMO_TABLE_DATA);
        setIsLive(false);
      }
    };

    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  const tableData = products.length > 0 ? products : DEMO_TABLE_DATA;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = tableData;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.stockCode.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q)
      );
    }
    data = [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [tableData, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = ['Stock_Code', 'Product_Name', 'Units_Sold', 'Predicted_7d_Demand', 'Current_Stock', 'Status'];
    const rows = filtered.map(d => [
      d.stockCode, `"${d.name.replace(/"/g, '""')}"`, d.unitsSold, d.predictedDemand, d.currentStock, d.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'demandwise_products_analysis.csv';
    a.click();
  };

  const SortIndicator = ({ col }) => {
    if (sortKey !== col) return <span style={{ color: 'var(--border-dark)', marginLeft: 3, fontSize: 10 }}>↕</span>;
    return <span style={{ color: 'var(--accent)', marginLeft: 3, fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">
            Product Demand Analysis
            <span className={isLive ? 'badge badge-ok' : 'demo-badge'} style={{ fontSize: '0.65rem' }}>
              {isLive ? 'Live API Data' : 'Demo Data'}
            </span>
          </div>
          <div className="section-card-subtitle">
            {filtered.length} products registered · Sorted by {sortKey}
          </div>
        </div>
        <div className="section-card-actions">
          <div className="table-toolbar">
            <div className="table-search">
              <IconSearch size={12} />
              <input
                type="text"
                placeholder="Search SKU or product…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <IconDownload size={13} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        {paged.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconSearch size={22} /></div>
            <div className="empty-state-title">No products found</div>
            <div className="empty-state-desc">Try adjusting your search query.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock Code</th>
                <th>Product Name</th>
                <th className="sortable" onClick={() => handleSort('unitsSold')}>
                  Historical Sold <SortIndicator col="unitsSold" />
                </th>
                <th className="sortable" onClick={() => handleSort('predictedDemand')}>
                  7-Day Forecast <SortIndicator col="predictedDemand" />
                </th>
                <th className="sortable" onClick={() => handleSort('currentStock')}>
                  Current Stock <SortIndicator col="currentStock" />
                </th>
                <th>Stock Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(row => (
                <tr key={row.stockCode}>
                  <td><span className="stock-code">{row.stockCode}</span></td>
                  <td><span className="product-name" title={row.name}>{row.name}</span></td>
                  <td><strong>{row.unitsSold.toLocaleString()}</strong></td>
                  <td><strong style={{ color: 'var(--accent)' }}>{row.predictedDemand.toLocaleString()}</strong></td>
                  <td>{row.currentStock.toLocaleString()}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectProduct && onSelectProduct(row.stockCode)}
                    >
                      Forecast
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <IconChevronLeft size={12} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <IconChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
