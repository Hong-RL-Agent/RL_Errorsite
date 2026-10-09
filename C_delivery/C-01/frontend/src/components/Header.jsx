import React from 'react';
import { Search, Bell, Settings, HelpCircle } from 'lucide-react';

export default function Header({ searchTerm, onSearchChange }) {
  return (
    <header className="top-header">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search files and folders..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <button className="header-icon-btn" title="Help" aria-label="Help">
          <HelpCircle size={18} />
        </button>
        <button className="header-icon-btn" title="Notifications" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="header-icon-btn" title="Settings" aria-label="Settings">
          <Settings size={18} />
        </button>

        <div className="user-profile">
          <div className="avatar">JD</div>
        </div>
      </div>
    </header>
  );
}
