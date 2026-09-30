import React from 'react';
import { Bike, MapPin, History, User, Zap, Clock, Shield } from 'lucide-react';

export default function Header({ currentTab, onSelectTab, activeRental = null }) {
  return (
    <header className="header-wrapper">
      <div className="max-w-screen header-inner">
        <div className="brand-logo" onClick={() => onSelectTab('home')}>
          <div style={{ width: '36px', height: '36px', background: '#65a30d', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Zap size={22} fill="#fff" />
          </div>
          <span>RideOn</span>
          <span className="logo-badge">CITY</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${currentTab === 'nearby' ? 'active' : ''}`}
            onClick={() => onSelectTab('nearby')}
          >
            <MapPin size={17} />
            <span>주변 차량</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'rental' ? 'active' : ''}`}
            onClick={() => onSelectTab('rental')}
          >
            <Clock size={17} />
            <span>대여 관리</span>
            {activeRental && (
              <span className="active-rental-pill">이용 중</span>
            )}
          </button>

          <button
            className={`nav-btn ${currentTab === 'history' ? 'active' : ''}`}
            onClick={() => onSelectTab('history')}
          >
            <History size={17} />
            <span>이용 기록</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'account' ? 'active' : ''}`}
            onClick={() => onSelectTab('account')}
          >
            <User size={17} />
            <span>내 계정</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
