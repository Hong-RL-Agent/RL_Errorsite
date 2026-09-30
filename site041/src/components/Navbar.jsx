import React from 'react';
import { HeartHandshake, Dog, Search, Calendar, MessageSquare, Bell, FileText, BookmarkCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, notifCount }) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div 
          className="brand-logo" 
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('home')}
        >
          <div className="brand-icon">
            <HeartHandshake size={22} />
          </div>
          <span>PawMate</span>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span>홈</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Search size={16} />
            <span>돌봄/산책 검색</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'pets' ? 'active' : ''}`}
            onClick={() => setActiveTab('pets')}
          >
            <Dog size={16} />
            <span>내 반려동물</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <BookmarkCheck size={16} />
            <span>예약 내역</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={16} />
            <span>일정 캘린더</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <FileText size={16} />
            <span>활동 리포트 / CSV</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={16} />
            <span>1:1 메시지</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            <span>알림</span>
            {notifCount > 0 && (
              <span style={{ background: '#e63946', color: 'white', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                {notifCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
