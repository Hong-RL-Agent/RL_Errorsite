import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  ShieldAlert, 
  DownloadCloud, 
  Sliders
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: '운영 대시보드', icon: LayoutDashboard },
    { id: 'users', label: '사용자 및 계정 관리', icon: Users },
    { id: 'requests', label: '서비스 요청 승인', icon: FileCheck },
    { id: 'logs', label: '감사 및 관리 로그', icon: ShieldAlert },
    { id: 'export', label: '통계 및 데이터 내보내기', icon: DownloadCloud },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">AS</div>
        <div className="logo-text">
          <h1>AdminScope</h1>
          <p>Enterprise Management</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>시스템 정상 가동 중 (v2.4.1)</span>
        </div>
      </div>
    </aside>
  );
}
