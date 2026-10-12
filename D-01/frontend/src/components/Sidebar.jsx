import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Compass, 
  Receipt, 
  Layers, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, onResetData }) {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'subscriptions', label: '내 구독 관리', icon: CreditCard },
    { id: 'catalog', label: '서비스 탐색 & 신청', icon: Compass },
    { id: 'billing', label: '결제 및 인보이스', icon: Receipt },
    { id: 'plans', label: '요금제 비교', icon: Layers },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <Sparkles size={20} />
        </div>
        <div className="logo-text">SubFlow</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="reset-btn"
          onClick={onResetData}
          title="테스트 초기 상태로 데이터베이스를 복원합니다"
        >
          <RotateCcw size={15} />
          <span>테스트 데이터 초기화</span>
        </button>
      </div>
    </aside>
  );
}
