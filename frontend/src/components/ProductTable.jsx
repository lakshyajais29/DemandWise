import React, { useState, useMemo } from 'react';
import { DEMO_TABLE_DATA } from '../data/mockData';
import { IconSearch, IconFilter, IconDownload, IconChevronLeft, IconChevronRight } from './Icons';

const PAGE_SIZE = 6;

function StatusBadge({ status }) {
  if (status === 'Low Stock')   return <span className="badge badge-low"><span className="badge-dot" />Low Stock</span>;
  if (status === 'Overstocked') return <span className="badge badge-over"><span className="badge-dot" />Overstocked</span>;
  return <span className="badge badge-ok"><span className="badge-dot" />Healthy</span>;
}

function getDaysRemaining(current, predicted) {
  if (!predicted) return '—';
  const days = Math.round((current / predicted) * 7);
  return days > 90 ? '90+ days' : `${days} days`;
}

export default function ProductTable({ onSelectProduct }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortKey, setSortKey] = useState('unitsSold');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const FILTER_OPTIONS = ['All', 'Low Stock', 'Healthy', 'Overstocked'];

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = DEMO_TABLE_DATA;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.stockCode.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'All') {
      data = data.filter(d => d.status === filterStatus);
    }
    data = [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [search, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = ['Stock Code', 'Product Name', 'Units Sold', 'Predicted Demand', 'Current Stock', 'Days Remaining', 'Status'];
    const rows = DEMO_TABLE_DATA.map(d => [
      d.stockCode, `"${d.name}"`, d.unitsSold, d.predictedDemand, d.currentStock,
      getDaysRemaining(d.currentStock, d.predictedDemand), d.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'demandwise_product_analysis.csv';
    a.click();
  };

  const SortIndicator = ({ col }) => {
    if (sortKey !== col) return <span style={{ color: 'var(--border-dark)', marginLeft: 2, fontSize: 10 }}>↕</span>;
    return <span style={{ color: 'var(--accent)', marginLeft: 2, fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">
            Product Demand Analysis
            <span className="demo-badge">Demo Data</span>
          </div>
          <div className="section-card-subtitle">{filtered.length} products · sorted by {sortKey}</div>
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
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                className={`table-filter-btn${filterStatus === f ? ' active' : ''}`}
                onClick={() => { setFilterStatus(f); setPage(1); }}
              >
                {f}
              </button>
            ))}
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
            <div className="empty-state-desc">Try adjusting your search or filter.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock Code</th>
                <th>Product Name</th>
                <th className="sortable" onClick={() => handleSort('unitsSold')}>Units Sold <SortIndicator col="unitsSold" /></th>
                <th className="sortable" onClick={() => handleSort('predictedDemand')}>Predicted Demand <SortIndicator col="predictedDemand" /></th>
                <th className="sortable" onClick={() => handleSort('currentStock')}>Current Stock <SortIndicator col="currentStock" /></th>
                <th>Days Remaining</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(row => (
                <tr key={row.stockCode}>
                  <td><span className="stock-code">{row.stockCode}</span></td>
                  <td><span className="product-name" title={row.name}>{row.name}</span></td>
                  <td><strong>{row.unitsSold.toLocaleString()}</strong></td>
                  <td>{row.predictedDemand}</td>
                  <td>{row.currentStock}</td>
                  <td style={{ color: row.status === 'Low Stock' ? 'var(--danger)' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {getDaysRemaining(row.currentStock, row.predictedDemand)}
                  </td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
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
              <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
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
