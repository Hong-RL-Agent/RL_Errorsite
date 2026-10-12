import React from 'react';
import { Compass, Ticket, RotateCcw, Sparkles } from 'lucide-react';

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
    <header className="event-header">
      <div className="header-content">
        {/* Brand Logo */}
        <div className="brand-wrapper" onClick={() => setActiveTab('explore')}>
          <div className="brand-logo-icon">
            <span>🌊</span>
          </div>
          <div className="brand-title-box">
            <h1>EventWave</h1>
            <p>Global Tech & Conference Hub</p>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="nav-pills">
          <button
            className={`nav-pill-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Compass size={15} />
            <span>행사 탐색</span>
          </button>

          <button
            className={`nav-pill-btn ${activeTab === 'passes' ? 'active' : ''}`}
            onClick={() => setActiveTab('passes')}
          >
            <Ticket size={15} />
            <span>나의 참가권</span>
          </button>
        </nav>

        {/* Right Actions: User Switcher & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-badge-selector" title="참가자 계정 전환">
            <span>{currentUser?.avatar || '👤'}</span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => onSelectUser(parseInt(e.target.value, 10))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.company || '일반'})
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            disabled={isResetting}
            title="모든 행사 신청 및 참가자 데이터를 초기 상태로 복원합니다."
          >
            <RotateCcw size={13} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? '복원 중' : '시스템 초기화'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
