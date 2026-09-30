import React from 'react';
import {
  Activity,
  Compass,
  Calendar,
  ShoppingBag,
  Heart,
  User,
  Users,
  Star,
  Layers
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, cartCount = 0 }) {
  const menuItems = [
    { id: 'home', label: '홈 피드', icon: Activity },
    { id: 'classes', label: '클래스 탐색', icon: Compass },
    { id: 'calendar', label: '수업 캘린더', icon: Calendar },
    { id: 'products', label: '피트니스 스토어', icon: ShoppingBag, badge: cartCount > 0 ? cartCount : null },
    { id: 'cart', label: '장바구니', icon: Layers, badge: cartCount > 0 ? cartCount : null },
    { id: 'favorites', label: '찜 목록', icon: Heart },
    { id: 'instructors', label: '전문 강사진', icon: Users },
    { id: 'reviews', label: '수강생 리뷰', icon: Star },
    { id: 'mypage', label: '마이페이지', icon: User }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          F
        </div>
        <div className="brand-info">
          <h1>FitFlow</h1>
          <p>Fitness & Wellness Hub</p>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">서비스 메뉴</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="User"
            className="user-avatar"
          />
          <div className="user-details">
            <h4>이수민</h4>
            <p>VIP 정기 회원</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
