import React from 'react';
import { IconX, IconCheckCircle, IconAlertTriangle, IconInfo } from './Icons';

function getTypeStyle(type) {
  switch (type) {
    case 'success': return { cls: 'success', Icon: IconCheckCircle };
    case 'error':   return { cls: 'error',   Icon: IconAlertTriangle };
    case 'warning': return { cls: 'warning', Icon: IconAlertTriangle };
    default:        return { cls: '',         Icon: IconInfo };
  }
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => {
        const { cls, Icon } = getTypeStyle(t.type);
        return (
          <div key={t.id} className={`toast ${cls}`}>
            <Icon size={15} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => onRemove(t.id)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <IconX size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
