import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { IconDownload } from './Icons';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#252522',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      minWidth: 160,
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 14,
          fontSize: '0.8rem',
          color: 'white',
          marginBottom: 3
        }}>
          <span style={{ color: p.stroke, fontWeight: 500 }}>{p.name}</span>
          <span style={{ fontWeight: 700 }}>
            {p.value !== undefined && p.value !== null ? `${p.value} units` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastChart({
  forecastData = [],
  historicalData = [],
  productName = '',
  productId = '',
  horizon = 7,
  reorderPoint = null,
}) {
  // Combine historical and forecast points into one chart timeline
  const chartData = [
    ...historicalData.map((h) => ({
      date: h.date,
      actual: h.actual,
      predicted: null,
      stock: null,
    })),
    ...forecastData.map((f) => ({
      date: f.date,
      actual: null,
      predicted: f.predicted,
      stock: f.stock_projection,
    }))
  ];

  const handleExportCSV = () => {
    const headers = ['Date', 'Actual_Units', 'Predicted_Units', 'Projected_Stock'];
    const rows = chartData.map((d) => [
      d.date,
      d.actual ?? '',
      d.predicted ?? '',
      d.stock ?? ''
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `forecast_${productId || 'sku'}_${horizon}d.csv`;
    a.click();
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">
            Demand Forecast & Stock Trajectory
          </div>
          <div className="section-card-subtitle">
            {productName ? `${productName} (${productId})` : productId} · {horizon}-day forecasting horizon
          </div>
        </div>
        <div className="section-card-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <IconDownload size={13} />
            Export CSV
          </button>
        </div>
      </div>
      <div className="section-card-body">
        {chartData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No Forecast Data Available</div>
            <div className="empty-state-desc">Select a product and click Get Forecast to view demand projections.</div>
          </div>
        ) : (
          <div className="chart-wrapper" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, fontFamily: 'Inter', paddingTop: 8, color: '#817D75' }}
                />
                {reorderPoint && reorderPoint > 0 && (
                  <ReferenceLine
                    y={reorderPoint}
                    stroke="#DC2626"
                    strokeDasharray="4 2"
                    label={{
                      value: `Safety Reorder: ${Math.round(reorderPoint)} units`,
                      fill: '#DC2626',
                      fontSize: 10,
                      fontFamily: 'Inter'
                    }}
                  />
                )}
                {/* Historical sales line */}
                {historicalData.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Demand"
                    stroke="#292824"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {/* Predicted demand line */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted Demand"
                  stroke="#C66A3D"
                  strokeWidth={2.5}
                  strokeDasharray="5 3"
                  dot={{ r: 3, fill: '#C66A3D' }}
                  activeDot={{ r: 5 }}
                />
                {/* Stock rundown projection */}
                <Line
                  type="monotone"
                  dataKey="stock"
                  name="Projected Stock"
                  stroke="#0369A1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
