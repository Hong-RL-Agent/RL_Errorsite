import React from 'react';
import { Shield, Car, Calendar, FileText, Bookmark, Clock, UserCheck } from 'lucide-react';

export default function Header({ currentTab, onSelectTab, favoriteCount = 0 }) {
  return (
    <header className="header-wrapper">
      <div className="max-w-screen header-inner">
        <div className="brand-logo" onClick={() => onSelectTab('home')}>
          <Shield size={28} strokeWidth={2.4} />
          <span>AutoCheck</span>
          <span className="brand-badge">PRO</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${currentTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => onSelectTab('vehicles')}
          >
            <Car size={18} />
            <span>차량 찾기</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'booking' ? 'active' : ''}`}
            onClick={() => onSelectTab('booking')}
          >
            <Calendar size={18} />
            <span>점검 예약</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'my-bookings' ? 'active' : ''}`}
            onClick={() => onSelectTab('my-bookings')}
          >
            <Clock size={18} />
            <span>내 예약</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`}
            onClick={() => onSelectTab('reports')}
          >
            <FileText size={18} />
            <span>점검 리포트</span>
          </button>

          <button
            className={`nav-item ${currentTab === 'favorites' ? 'active' : ''}`}
            onClick={() => onSelectTab('favorites')}
          >
            <Bookmark size={18} />
            <span>관심 차량</span>
            {favoriteCount > 0 && (
              <span className="nav-badge-count">{favoriteCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
