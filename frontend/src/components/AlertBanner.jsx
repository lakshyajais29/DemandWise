import React from 'react';
import { IconAlertTriangle, IconCheckCircle, IconInfo } from './Icons';

export default function AlertBanner({ status, message, onClose = null }) {
  if (!message) return null;

  const isLow = status === 'Low Stock' || status === 'critical' || status === 'danger';
  const isOver = status === 'Overstock' || status === 'warning';
  const isNormal = status === 'Normal' || status === 'Healthy' || status === 'OK' || status === 'success';

  const bg = isLow ? '#FEE2E2' : isOver ? '#FEF3C7' : isNormal ? '#DCFCE7' : '#F1F5F9';
  const border = isLow ? '#FCA5A5' : isOver ? '#FCD34D' : isNormal ? '#86EFAC' : '#CBD5E1';
  const color = isLow ? '#DC2626' : isOver ? '#B45309' : isNormal ? '#15803D' : '#334155';

  const IconComponent = isLow || isOver ? IconAlertTriangle : isNormal ? IconCheckCircle : IconInfo;

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        padding: '12px 18px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
        fontSize: '0.85rem',
        lineHeight: 1.5,
      }}
    >
      <IconComponent size={16} style={{ flexShrink: 0, marginTop: 2, color: color }} />
      <div style={{ flex: 1 }}>
        <strong style={{ fontWeight: 700, marginRight: 6 }}>
          {status ? `[${status}]` : 'Inventory Notice'}:
        </strong>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: color,
            opacity: 0.7,
            fontSize: '1rem',
            padding: 0,
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
