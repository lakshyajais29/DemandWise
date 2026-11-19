import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { generateChartData } from '../data/mockData';
import { IconDownload, IconRefresh } from './Icons';

const PERIODS = [
  { label: '7 Days',  days: 15  },
  { label: '14 Days', days: 25  },
  { label: '30 Days', days: 45  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#252522', borderRadius: 8, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)', minWidth: 160, border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.8rem', color: 'white', marginBottom: 3 }}>
          <span style={{ color: p.stroke, fontWeight: 500 }}>{p.name === 'actual' ? 'Actual' : 'Predicted'}</span>
          <span style={{ fontWeight: 700 }}>{p.value !== undefined ? `${p.value} units` : '—'}</span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastChartPanel({ selectedProduct = '85123A', onProductChange }) {
  const [period, setPeriod] = useState(1); // index into PERIODS
  const [refreshing, setRefreshing] = useState(false);
  const [seed, setSeed] = useState(0);

  const data = useMemo(() => generateChartData(PERIODS[period].days), [period, seed]);

  const todayIdx = data.findIndex(d => d.actual === undefined);
  const todayLabel = todayIdx >= 0 ? data[todayIdx].date : null;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setSeed(s => s + 1); setRefreshing(false); }, 800);
  };

  const handleExport = () => {
    const rows = [
      ['Date', 'Actual', 'Predicted'],
      ...data.map(d => [d.date, d.actual ?? '', d.predicted]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `demandwise_forecast_${selectedProduct}.csv`;
    a.click();
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">
            Demand Forecast
            <span className="demo-badge">Demo Data</span>
          </div>
          <div className="section-card-subtitle">
            Historical vs predicted demand — SKU: <strong>{selectedProduct}</strong>
          </div>
        </div>
        <div className="section-card-actions">
          <div className="period-tabs">
            {PERIODS.map((p, i) => (
              <button key={i} className={`period-tab${period === i ? ' active' : ''}`} onClick={() => setPeriod(i)}>
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={refreshing}>
            <IconRefresh size={13} style={refreshing ? { animation: 'spin 0.7s linear infinite' } : {}} />
            Refresh
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <IconDownload size={13} />
            Export
          </button>
        </div>
      </div>
      <div className="section-card-body">
        <div className="chart-wrapper" style={{ height: 300 }}>
          {refreshing ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="skeleton skeleton-rect" style={{ width: '100%', height: 280 }} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E5DE" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#817D75', fontFamily: 'Inter' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E9E5DE' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#817D75', fontFamily: 'Inter' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, fontFamily: 'Inter', paddingTop: 8, color: '#817D75' }}
                  formatter={(v) => v === 'actual' ? 'Actual Demand' : 'Predicted Demand'}
                />
                {todayLabel && (
                  <ReferenceLine
                    x={todayLabel}
                    stroke="#C66A3D"
                    strokeDasharray="4 3"
                    label={{ value: 'Today', fill: '#C66A3D', fontSize: 11, fontFamily: 'Inter' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#292824"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#C66A3D"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
