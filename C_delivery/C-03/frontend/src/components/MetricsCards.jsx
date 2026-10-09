import React from 'react';
import { Users, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function MetricsCards({ users }) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === 'ADMIN' || u.role === 'MANAGER').length;

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div>
          <div className="metric-label">Identities Monitored</div>
          <div className="metric-value">{totalUsers}</div>
        </div>
        <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee' }}>
          <Users size={22} />
        </div>
      </div>

      <div className="metric-card">
        <div>
          <div className="metric-label">Active Sessions</div>
          <div className="metric-value">{activeUsers}</div>
        </div>
        <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
          <UserCheck size={22} />
        </div>
      </div>

      <div className="metric-card">
        <div>
          <div className="metric-label">Privileged Roles</div>
          <div className="metric-value">{adminUsers}</div>
        </div>
        <div className="metric-icon-box" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#fb7185' }}>
          <ShieldAlert size={22} />
        </div>
      </div>

      <div className="metric-card">
        <div>
          <div className="metric-label">Security Mesh</div>
          <div className="metric-value">99.8%</div>
        </div>
        <div className="metric-icon-box" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc' }}>
          <Cpu size={22} />
        </div>
      </div>
    </div>
  );
}
