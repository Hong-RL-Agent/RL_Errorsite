import React from 'react';
import {
  Users,
  Shield,
  FileText,
  Settings,
  BarChart2,
  Layers,
  RotateCcw
} from 'lucide-react';

export default function Sidebar({ activeNav, onNavChange, onReset }) {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo-icon">
          <Shield size={22} />
        </div>
        <div className="logo-text">
          AdminDesk
          <span className="logo-badge">IAM</span>
        </div>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Administration</div>
        <button
          className={`nav-item ${activeNav === 'users' ? 'active' : ''}`}
          onClick={() => onNavChange('users')}
        >
          <Users size={18} />
          <span>User Management</span>
        </button>
        <button
          className={`nav-item ${activeNav === 'audit' ? 'active' : ''}`}
          onClick={() => onNavChange('audit')}
        >
          <FileText size={18} />
          <span>Audit Logs</span>
        </button>
        <button
          className={`nav-item ${activeNav === 'teams' ? 'active' : ''}`}
          onClick={() => onNavChange('teams')}
        >
          <Layers size={18} />
          <span>Departments</span>
        </button>
        <button
          className={`nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
          onClick={() => onNavChange('analytics')}
        >
          <BarChart2 size={18} />
          <span>Analytics</span>
        </button>

        <div className="nav-label" style={{ marginTop: '12px' }}>System</div>
        <button
          className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
          onClick={() => onNavChange('settings')}
        >
          <Settings size={18} />
          <span>Console Settings</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="reset-button" onClick={onReset} title="Reset all user data to initial state">
          <RotateCcw size={15} />
          <span>Reset Environment</span>
        </button>
      </div>
    </aside>
  );
}
