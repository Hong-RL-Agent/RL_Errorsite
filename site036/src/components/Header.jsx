import React from 'react';
import { Search, Bell, Plus, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage, onQuickSearch, currentUser }) {
  const pageTitles = {
    dashboard: 'Workspace Dashboard',
    projects: 'Projects & Tasks',
    search: 'Global Search',
    workspace: 'Workspace Organization',
    members: 'Team Members & Roles',
    products: 'Subscription Plans & Add-ons',
    files: 'Document & Asset Repository',
    reservations: 'Meeting Rooms & Resources',
    cart: 'Subscription Cart',
    payments: 'Payment & Billing History',
    support: 'Support & Help Desk',
    activity: 'Team Activity & Audit Trail',
    profile: 'User Profile & Settings',
    settings: 'Workspace Preferences'
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">{pageTitles[currentPage] || 'WorkNest Platform'}</h1>
      </div>

      <div className="header-right">
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search projects, files..."
            className="form-control"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
            onFocus={() => {
              if (currentPage !== 'search') setCurrentPage('search');
            }}
            onChange={(e) => {
              if (onQuickSearch) onQuickSearch(e.target.value);
            }}
          />
          <Search 
            size={16} 
            color="#94a3b8" 
            style={{ position: 'absolute', left: '12px', top: '11px', pointerEvents: 'none' }} 
          />
        </div>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setCurrentPage('activity')}
          title="Activity Log"
          style={{ height: '38px', padding: '0 12px' }}
        >
          <Bell size={16} color="#64748b" />
        </button>

        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setCurrentPage('projects')}
          style={{ height: '38px' }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>
    </header>
  );
}
