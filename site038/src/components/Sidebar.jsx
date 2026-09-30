import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Users, 
  Truck, 
  RotateCcw, 
  Search, 
  Bell, 
  BarChart3, 
  FileSpreadsheet, 
  Terminal, 
  Settings, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentPage, setCurrentPage, currentUser }) {
  const current = activeTab || currentPage || 'dashboard';
  const setPage = setActiveTab || setCurrentPage || (() => {});

  const workspaceNav = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'content', label: '콘텐츠 관리', icon: Video },
    { id: 'calendar', label: '콘텐츠 캘린더', icon: Calendar },
    { id: 'team', label: '팀원 & 협업', icon: Users },
  ];

  const merchNav = [
    { id: 'shipping', label: '굿즈 배송 관리', icon: Truck },
    { id: 'refunds', label: '환불 & CS 관리', icon: RotateCcw },
    { id: 'search', label: '검색 제안 키워드', icon: Search },
    { id: 'notifications', label: '알림 센터', icon: Bell },
  ];

  const toolsNav = [
    { id: 'reports', label: '성과 리포트', icon: BarChart3 },
    { id: 'csv-import', label: 'CSV 임포트', icon: FileSpreadsheet },
    { id: 'api-console', label: '개발자 콘솔', icon: Terminal },
    { id: 'activity', label: '활동 트랜잭션', icon: Activity },
    { id: 'settings', label: '채널 설정', icon: Settings },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Layers size={20} />
        </div>
        <div>
          <span className="brand-title-text">CreatorFlow</span>
          <span style={{ display: 'block', fontSize: '10px', color: '#818cf8', fontWeight: 600, letterSpacing: '0.05em' }}>
            CREATOR OS v3.8
          </span>
        </div>
      </div>

      <div className="sidebar-nav-list" style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        <div className="nav-section-title">WORKSPACE</div>
        {workspaceNav.map(item => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '20px' }}>MERCH & COMMUNITY</div>
        {merchNav.map(item => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '20px' }}>ANALYTICS & DEV TOOLS</div>
        {toolsNav.map(item => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-user-card" style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.7)'
      }}>
        <img 
          src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
          alt="Creator"
          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name || "강지훈 (DailyFrame)"}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {currentUser?.channelName || "DailyFrame Studio"}
          </div>
        </div>
      </div>
    </aside>
  );
}
