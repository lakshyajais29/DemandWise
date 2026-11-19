import React from 'react';
import { DEMO_ACTIVITY } from '../data/mockData';
import { IconRefresh } from './Icons';

export default function ActivityFeed() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title-block">
          <div className="section-card-title">Recent Activity</div>
          <div className="section-card-subtitle">System events and forecast actions</div>
        </div>
        <button className="btn btn-ghost btn-sm">
          <IconRefresh size={12} />
          Refresh
        </button>
      </div>
      <div className="section-card-body" style={{ padding: '8px 22px' }}>
        <div className="activity-list">
          {DEMO_ACTIVITY.map(item => (
            <div className="activity-item" key={item.id}>
              <div className="activity-dot" style={{ background: item.color }} />
              <div style={{ flex: 1 }}>
                <div className="activity-text">{item.text}</div>
                <div className="activity-time">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
