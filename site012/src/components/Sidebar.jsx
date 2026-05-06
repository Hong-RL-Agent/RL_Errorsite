import React from 'react';

const NAV_ITEMS = [
  { label: '대시보드', icon: '📊', active: true },
  { label: '보고서', icon: '📈' },
  { label: '예산 설정', icon: '🎯' },
  { label: '계좌 관리', icon: '🏦' },
  { label: '설정', icon: '⚙️' },
];

function Sidebar({ addToast }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        💰 <span>FinTrack</span>
      </div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <li
            key={item.label}
            className={item.active ? 'active' : ''}
            onClick={() => {
              if (!item.active) addToast(`${item.label} 기능은 준비 중입니다.`);
            }}
          >
            {item.icon} {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
