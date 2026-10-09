import React from 'react';
import { Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="top-header">
      <div className="header-title-group">
        <h1 className="header-title">Enterprise IAM & Access Governance</h1>
        <div className="header-badge">
          <span className="header-badge-dot" />
          <span>LIVE CLUSTER v3.4</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="admin-pill">
          <div className="admin-avatar-mini">AD</div>
          <span>Admin / Kim</span>
        </div>

        <button className="btn-action" title="System Alerts">
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
