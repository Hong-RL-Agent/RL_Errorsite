import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  RotateCcw
} from 'lucide-react';

export default function Sidebar({ activeNav, onNavChange, onReset }) {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo-icon">
          <FolderKanban size={22} />
        </div>
        <div className="logo-text">
          Flowdesk
          <span className="logo-badge">PRO</span>
        </div>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Workspace</div>
        <button
          className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavChange('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button
          className={`nav-item ${activeNav === 'my-tasks' ? 'active' : ''}`}
          onClick={() => onNavChange('my-tasks')}
        >
          <CheckSquare size={18} />
          <span>My Tasks</span>
        </button>
        <button
          className={`nav-item ${activeNav === 'all-tasks' ? 'active' : ''}`}
          onClick={() => onNavChange('all-tasks')}
        >
          <ListTodo size={18} />
          <span>All Tasks</span>
        </button>

        <div className="nav-label" style={{ marginTop: '12px' }}>Management</div>
        <button
          className={`nav-item ${activeNav === 'team' ? 'active' : ''}`}
          onClick={() => onNavChange('team')}
        >
          <Users size={18} />
          <span>Team</span>
        </button>
        <button
          className={`nav-item ${activeNav === 'reports' ? 'active' : ''}`}
          onClick={() => onNavChange('reports')}
        >
          <BarChart3 size={18} />
          <span>Reports</span>
        </button>
        <button
          className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
          onClick={() => onNavChange('settings')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="reset-button" onClick={onReset} title="Reset all task data to initial state">
          <RotateCcw size={15} />
          <span>Reset Environment</span>
        </button>
      </div>
    </aside>
  );
}
