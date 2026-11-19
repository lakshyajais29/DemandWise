import React from 'react';

export default function SettingsPage() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">Settings</div>
          <div className="section-card-subtitle">Configure your DemandWise preferences</div>
        </div>
      </div>
      <div className="section-card-body">
        {[
          {
            section: 'API Configuration',
            items: [
              { label: 'Backend API URL',      value: process.env.REACT_APP_API_URL || 'http://localhost:8000', type: 'text', hint: 'Set via REACT_APP_API_URL environment variable' },
              { label: 'Request Timeout (ms)', value: '5000', type: 'number', hint: 'Default API request timeout' },
            ]
          },
          {
            section: 'Dashboard Preferences',
            items: [
              { label: 'Default Forecast Horizon', value: '7 days', type: 'select', options: ['7 days', '14 days', '30 days'] },
              { label: 'Demo Data Banner',         value: 'Enabled', type: 'select', options: ['Enabled', 'Hidden'] },
            ]
          }
        ].map(group => (
          <div key={group.section} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 14 }}>
              {group.section}
            </div>
            {group.items.map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid var(--border)', gap: 20
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{item.label}</div>
                  {item.hint && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.hint}</div>}
                </div>
                {item.type === 'select' ? (
                  <select className="form-input" style={{ width: 160 }} defaultValue={item.value}>
                    {(item.options || []).map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={item.type || 'text'}
                    className="form-input"
                    style={{ width: 260 }}
                    defaultValue={item.value}
                    readOnly={item.hint?.includes('environment')}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary">Save Settings</button>
          <button className="btn btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}
