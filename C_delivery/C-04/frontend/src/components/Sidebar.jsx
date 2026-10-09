import React from 'react';
import { 
  Headphones, 
  Inbox, 
  UserCheck, 
  Clock, 
  FileText, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  currentNav, 
  setCurrentNav, 
  ticketCounts, 
  onResetDb, 
  isResetting 
}) {
  const navItems = [
    { id: 'inbox', label: '전체 인박스 (All Inbox)', icon: Inbox, count: ticketCounts.total },
    { id: 'my_tickets', label: '내 담당 문의 (My Queue)', icon: UserCheck, count: 2 },
    { id: 'waiting', label: '답변 대기 (Pending)', icon: Clock, count: ticketCounts.received + ticketCounts.inProgress },
    { id: 'templates', label: '답변 템플릿 (Templates)', icon: FileText, count: 4 }
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-logo">
            <Headphones size={22} />
          </div>
          <div className="brand-info">
            <h1>SupportHub</h1>
            <div className="brand-tag">
              <span className="status-dot"></span>
              LIVE DESK
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="nav-label">Workspace</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentNav(item.id)}
              >
                <div className="nav-item-left">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="nav-badge">{item.count}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Agent Profile & Reset Control */}
      <div className="sidebar-footer">
        <div className="agent-profile">
          <div className="agent-avatar">JK</div>
          <div className="agent-meta">
            <span className="agent-name">상담원 김지원 (J. Kim)</span>
            <span className="agent-role">Senior Support Specialist</span>
          </div>
        </div>

        <button
          className="reset-env-btn"
          onClick={onResetDb}
          disabled={isResetting}
          title="POST /api/test/reset 초기화"
        >
          <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
          <span>{isResetting ? '초기화 중...' : '환경 초기화 (Reset DB)'}</span>
        </button>
      </div>
    </aside>
  );
}
