import React from 'react';

export default function InventoryCard({
  label,
  value,
  unit = '',
  status = null,
  color = '#C66A3D',
  subtitle = null,
}) {
  return (
    <div
      className="card"
      style={{
        borderTop: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 20px',
      }}
    >
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6
        }}>
          <span className="kpi-card-label">{label}</span>
          {status && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                backgroundColor:
                  status === 'Low Stock' ? '#FEE2E2' :
                  status === 'Overstock' ? '#FEF3C7' :
                  status === 'Normal' || status === 'Healthy' || status === 'OK' ? '#DCFCE7' :
                  '#F3F4F6',
                color:
                  status === 'Low Stock' ? '#DC2626' :
                  status === 'Overstock' ? '#D97706' :
                  status === 'Normal' || status === 'Healthy' || status === 'OK' ? '#15803D' :
                  '#4B5563',
              }}
            >
              {status}
            </span>
          )}
        </div>
        <div
          className="kpi-card-value"
          style={{
            color: '#292824',
            fontSize: '1.9rem',
            margin: '4px 0',
          }}
        >
          {value !== undefined && value !== null ? value : '—'}
        </div>
      </div>

      <div style={{ marginTop: 6 }}>
        {unit && <div className="card-unit" style={{ fontSize: '0.75rem', color: '#817D75' }}>{unit}</div>}
        {subtitle && <div style={{ fontSize: '0.7rem', color: '#817D75', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}
