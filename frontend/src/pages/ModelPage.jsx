import React, { useState, useEffect } from 'react';
import { IconCheckCircle, IconAlertTriangle, IconPackage, IconTarget } from '../components/Icons';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function ModelPage() {
  const [healthData, setHealthData] = useState(null);
  const [horizonsData, setHorizonsData] = useState([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSystemData = async () => {
      try {
        const [healthRes, horizonsRes] = await Promise.all([
          fetch(`${API_URL}/health`),
          fetch(`${API_URL}/api/horizons`),
        ]);

        if (healthRes.ok && isMounted) {
          const hJson = await healthRes.json();
          setHealthData(hJson);
        }
        if (horizonsRes.ok && isMounted) {
          const horJson = await horizonsRes.json();
          setHorizonsData(horJson);
        }
      } catch (err) {
        console.warn('API status check error:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    loadSystemData();
    return () => { isMounted = false; };
  }, []);

  const isOnline = healthData?.models_loaded ?? false;

  const MODEL_SPECS = [
    { label: 'Model Architecture', value: 'CatBoost Regressor (GBDT)', sub: 'Gradient Boosted Decision Trees with native categorical handling' },
    { label: 'Artifact Format', value: 'Joblib (.joblib)', sub: 'bundle_7d, bundle_14d, bundle_30d' },
    { label: 'Feature Dimensionality', value: '24 Engineered Features', sub: 'Lags (7, 14, 28, 56, 90), Rolling Means & Medians, Sine/Cosine Day & Year' },
    { label: 'Training Target', value: 'Gross Calendar Units', sub: 'Sum of positive unit sales over N-day forecast horizon' },
    { label: 'Product Coverage', value: `${healthData?.product_count || 30} Selected SKUs`, sub: 'High-frequency transaction items from Online Retail II' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* System Status Cards */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title-block">
            <div className="section-card-title">Production System & MLOps Status</div>
            <div className="section-card-subtitle">
              Live health monitor for FastAPI inference engine and CatBoost model bundles
            </div>
          </div>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              {checking ? (
                <div className="skeleton skeleton-rect" style={{ width: 34, height: 34, borderRadius: '50%' }} />
              ) : isOnline ? (
                <IconCheckCircle size={30} style={{ color: 'var(--success)', flexShrink: 0 }} />
              ) : (
                <IconAlertTriangle size={30} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>FastAPI Backend</div>
                <div style={{ fontSize: '0.72rem', color: isOnline ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                  {checking ? 'Checking Connection…' : isOnline ? 'Online — Models Loaded' : `Offline (${API_URL})`}
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(198,106,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)' }}>CB</span>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>CatBoost Multi-Horizon</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  3 Bundles (7d, 14d, 30d) Active
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(3,105,161,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconPackage size={18} style={{ color: '#0369A1' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Product Registry</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {healthData?.product_count || 30} Active SKUs Registered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Horizon Benchmarks */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title-block">
            <div className="section-card-title">
              <IconTarget size={15} style={{ color: 'var(--accent)' }} />
              Model Horizon Evaluation Metrics (Test WAPE)
            </div>
            <div className="section-card-subtitle">
              Weighted Absolute Percentage Error (WAPE) on holdout test set vs. baseline
            </div>
          </div>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {(horizonsData.length > 0 ? horizonsData : [
              { horizon: 7, label: 'Next 7 Days', test_model_wape: 0.4302, test_baseline_wape: 0.4256, best_iteration: 124 },
              { horizon: 14, label: 'Next 14 Days', test_model_wape: 0.3696, test_baseline_wape: 0.3668, best_iteration: 278 },
              { horizon: 30, label: 'Next 30 Days', test_model_wape: 0.3096, test_baseline_wape: 0.3434, best_iteration: 261 },
            ]).map((h) => (
              <div
                key={h.horizon}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  borderTop: `4px solid ${h.horizon === 7 ? 'var(--accent)' : h.horizon === 14 ? 'var(--accent2)' : '#0369A1'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{h.label}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Iter: {h.best_iteration}</span>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Model Test WAPE</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>
                      {(h.test_model_wape * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Baseline WAPE</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#817D75' }}>
                      {(h.test_baseline_wape * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Architecture & Artifact Specifications */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Model Specifications & Pipeline Architecture</div>
        </div>
        <div className="section-card-body" style={{ padding: '8px 22px' }}>
          {MODEL_SPECS.map((spec) => (
            <div
              key={spec.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid var(--border)',
                gap: 20
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{spec.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{spec.sub}</div>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {spec.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
