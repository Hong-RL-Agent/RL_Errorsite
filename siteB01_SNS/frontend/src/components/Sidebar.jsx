import React from 'react';

const ITEMS = [
  { name: 'home', icon: '🏠', label: '홈' },
  { name: 'saved', icon: '🔖', label: '저장한 게시물' },
  { name: 'notifications', icon: '🔔', label: '알림' },
  { name: 'activity', icon: '🕘', label: '활동 내역' },
  { name: 'profile', icon: '👤', label: '내 프로필' },
];

export default function Sidebar({ current, unreadCount, onNavigate, onCompose, onReset, resetting }) {
  return (
    <nav className="sidebar" aria-label="주 메뉴">
      <ul>
        {ITEMS.map((item) => (
          <li key={item.name}>
            <button
              className={`nav-item${current === item.name ? ' active' : ''}`}
              onClick={() => onNavigate(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.name === 'notifications' && unreadCount > 0 && <span className="count-pill">{unreadCount}</span>}
            </button>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary btn-block sidebar-compose" onClick={onCompose}>＋ 새 게시물</button>
      <button className="btn btn-ghost btn-block sidebar-reset" onClick={onReset} disabled={resetting}>
        {resetting ? '초기화 중…' : '데이터 초기화'}
      </button>
    </nav>
  );
}
