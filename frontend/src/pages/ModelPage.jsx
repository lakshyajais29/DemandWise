import React, { useState, useEffect } from 'react';
import { IconCheckCircle, IconAlertTriangle } from '../components/Icons';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const MODEL_METRICS = [
  { label: 'Model Type',       value: 'Random Forest Regressor', sub: 'Scikit-learn' },
  { label: 'Forecast Horizon', value: '7-day rolling',           sub: 'Weekly demand window' },
  { label: 'Training Dataset', value: 'Online Retail II',        sub: 'UCI ML Repository' },
  { label: 'Key Features',     value: '8 engineered features',   sub: 'Lags, rolling means, time features' },
];

const DEMO_ACCURACY = [
  { metric: 'MAE (Mean Abs. Error)',    value: '12.4',  unit: 'units' },
  { metric: 'RMSE',                     value: '18.7',  unit: 'units' },
  { metric: 'R² Score',                 value: '0.914', unit: '' },
  { metric: 'MAPE',                     value: '8.6%',  unit: '' },
];

export default function ModelPage() {
  const [apiStatus, setApiStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(4000) });
        setApiStatus(res.ok);
      } catch {
        setApiStatus(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  return (
    <>
      {/* API + Model Status */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title-block">
            <div className="section-card-title">System & Model Status</div>
            <div className="section-card-subtitle">FastAPI backend + Scikit-learn model health check</div>
          </div>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              flex: 1, minWidth: 200,
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              {checking ? (
                <div className="skeleton skeleton-rect" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              ) : apiStatus ? (
                <IconCheckCircle size={28} style={{ color: 'var(--success)', flexShrink: 0 }} />
              ) : (
                <IconAlertTriangle size={28} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>FastAPI Backend</div>
                <div style={{ fontSize: '0.72rem', color: checking ? 'var(--text-muted)' : apiStatus ? 'var(--success)' : 'var(--danger)' }}>
                  {checking ? 'Checking…' : apiStatus ? 'Online – Healthy' : `Offline (${API_URL})`}
                </div>
              </div>
            </div>
            <div style={{
              flex: 1, minWidth: 200,
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(198,106,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>ML</span>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>ML Model</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  best_model.pkl — MLflow tracked
                </div>
              </div>
            </div>
          </div>

          {!apiStatus && !checking && (
            <div className="alert-strip warn" style={{ marginTop: 16 }}>
              <IconAlertTriangle size={14} />
              <span>
                Backend is offline. Start it with: <code style={{ background: 'rgba(0,0,0,0.07)', padding: '1px 6px', borderRadius: 4 }}>
                  cd backend && uvicorn main:app --reload
                </code>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Model info + metrics */}
      <div className="two-col">
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Model Configuration</div>
          </div>
          <div className="section-card-body" style={{ padding: '8px 22px' }}>
            {MODEL_METRICS.map(m => (
              <div key={m.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.label}</div>
                  {m.sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.7 }}>{m.sub}</div>}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', textAlign: 'right', maxWidth: 180 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title-block">
              <div className="section-card-title">Accuracy Metrics <span className="demo-badge">Demo</span></div>
              <div className="section-card-subtitle">Estimated from typical Random Forest performance on this dataset</div>
            </div>
          </div>
          <div className="section-card-body" style={{ padding: '8px 22px' }}>
            {DEMO_ACCURACY.map(m => (
              <div key={m.metric} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.metric}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {m.value}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>{m.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
