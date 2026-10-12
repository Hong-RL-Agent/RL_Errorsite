import React from 'react';
import { Calendar, ClipboardList, Sparkles, RotateCcw, Heart } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  users = [],
  currentUser,
  onSelectUser,
  onReset,
  isResetting
}) {
  return (
    <header className="paw-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setActiveTab('pets')}>
          <div className="brand-icon-wrapper">
            <span>🐾</span>
          </div>
          <div>
            <div className="brand-name">PawCare</div>
            <div className="brand-sub">Pet Care & Booking Studio</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'pets' ? 'active' : ''}`}
            onClick={() => setActiveTab('pets')}
          >
            <Heart size={15} />
            <span>마이 펫룸</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            <Calendar size={15} />
            <span>예약하기</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <ClipboardList size={15} />
            <span>예약 내역서</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Sparkles size={15} />
            <span>서비스 안내</span>
          </button>
        </nav>

        {/* Right Actions: User Switcher & Reset Button */}
        <div className="header-actions">
          {/* User Profile Selector */}
          <div className="user-selector-box" title="보호자 계정 전환">
            <span>{currentUser?.avatar || '👤'}</span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => onSelectUser(parseInt(e.target.value, 10))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} 보호자님
                </option>
              ))}
            </select>
          </div>

          {/* Reset Database Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            disabled={isResetting}
            title="모든 예약 및 반려동물 데이터를 초기 시드 상태로 복원합니다."
          >
            <RotateCcw size={13} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? '복원 중' : '시스템 초기화'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
