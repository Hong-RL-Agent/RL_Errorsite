import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

export default function Header({ search, onSearchChange }) {
  return (
    <header className="top-header">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <button className="header-icon-btn" title="Help">
          <HelpCircle size={18} />
        </button>
        <button className="header-icon-btn" title="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-profile">
          <div className="avatar" style={{ background: '#4f46e5' }}>
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
