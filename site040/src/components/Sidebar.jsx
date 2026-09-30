import React from 'react';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  FolderDown, 
  MessageSquare, 
  Bell, 
  Star, 
  User, 
  LogIn, 
  UserPlus, 
  Layers,
  Compass,
  Ticket
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, enrollCount = 3 }) {
  const exploreNav = [
    { id: 'home', label: '홈 대시보드', icon: Home },
    { id: 'courses', label: '전체 강의 코스', icon: BookOpen },
    { id: 'mylearning', label: '내 학습실', icon: GraduationCap, badge: enrollCount },
    { id: 'materials', label: '학습 자료실', icon: FolderDown },
  ];

  const communityNav = [
    { id: 'chat', label: '강사 1:1 채팅', icon: MessageSquare },
    { id: 'notices', label: '공지사항', icon: Bell },
    { id: 'reviews', label: '수강 후기', icon: Star },
    { id: 'coupons', label: '쿠폰 & 혜택', icon: Ticket },
  ];

  const accountNav = [
    { id: 'profile', label: '프로필 & 주소지', icon: User },
    { id: 'login', label: '수강생 로그인', icon: LogIn },
    { id: 'register', label: '신규 회원가입', icon: UserPlus },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Layers size={22} />
        </div>
        <div>
          <span className="brand-title-text">ClassBridge</span>
          <span style={{ display: 'block', fontSize: '10px', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.06em' }}>
            LEARNING OS v4.0
          </span>
        </div>
      </div>

      <div className="sidebar-nav-list">
        <div className="nav-section-title">LEARNING</div>
        {exploreNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '18px' }}>COMMUNITY</div>
        {communityNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '18px' }}>ACCOUNT</div>
        {accountNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.85)'
      }}>
        <img 
          src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
          alt="User"
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name || "한도현"}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {currentUser?.role || "정규 수강생"}
          </div>
        </div>
      </div>
    </aside>
  );
}
