import React from 'react';
import { 
  Home, 
  ShoppingBag, 
  Grid, 
  Search, 
  Calendar, 
  ShoppingCart, 
  Package, 
  MessageSquare, 
  HelpCircle, 
  FileText, 
  User, 
  Compass,
  Sparkles,
  Heart
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, cartCount = 0 }) {
  const shopNav = [
    { id: 'home', label: '홈 피드', icon: Home },
    { id: 'products', label: '전체 상품', icon: ShoppingBag },
    { id: 'search', label: '상품 검색', icon: Search },
    { id: 'reservations', label: '예약 & 워크숍', icon: Calendar },
  ];

  const shoppingNav = [
    { id: 'cart', label: '장바구니', icon: ShoppingCart, badge: cartCount },
    { id: 'orders', label: '주문 & 배송', icon: Package },
    { id: 'reviews', label: '리뷰 & 댓글', icon: MessageSquare },
    { id: 'inquiries', label: '1:1 고객 문의', icon: HelpCircle },
    { id: 'files', label: '파일 & 무드보드', icon: FileText },
  ];

  const userNav = [
    { id: 'profile', label: '마이페이지', icon: User },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Compass size={22} />
        </div>
        <div>
          <span className="brand-title-text">DailyPick</span>
          <span style={{ display: 'block', fontSize: '10px', color: '#bc6c25', fontWeight: 700, letterSpacing: '0.06em' }}>
            LIFESTYLE COMMERCE
          </span>
        </div>
      </div>

      <div className="sidebar-nav-list">
        <div className="nav-section-title">EXPLORE</div>
        {shopNav.map(item => {
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

        <div className="nav-section-title" style={{ marginTop: '18px' }}>MY SHOPPING</div>
        {shoppingNav.map(item => {
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
                  background: '#bc6c25',
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

        <div className="nav-section-title" style={{ marginTop: '18px' }}>ACCOUNT</div>
        {userNav.map(item => {
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
        background: 'rgba(20, 18, 17, 0.6)'
      }}>
        <img 
          src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
          alt="User"
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #bc6c25' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name || "김서연"}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#a8a29e' }}>
            {currentUser?.role || "VIP Member"}
          </div>
        </div>
      </div>
    </aside>
  );
}
