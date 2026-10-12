import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  unreadCount, 
  onOpenNotifications 
}) {
  return (
    <header className="header">
      <div className="search-box">
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="구독 서비스, 요금제, 카테고리 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <button 
          className="icon-btn" 
          onClick={onOpenNotifications}
          aria-label="알림"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="badge-dot" />}
        </button>

        <div className="user-profile">
          <div className="user-avatar">AK</div>
          <div className="user-info">
            <span className="user-name">Alex Kim</span>
            <span className="user-role">Workspace Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
