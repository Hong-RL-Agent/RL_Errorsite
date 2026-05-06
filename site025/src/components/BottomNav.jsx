import React from 'react';
import { Home, Search, ClipboardList, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="nav-item active">
        <Home size={24} />
        <span>홈</span>
      </div>
      <div className="nav-item">
        <Search size={24} />
        <span>검색</span>
      </div>
      <div className="nav-item">
        <ClipboardList size={24} />
        <span>주문내역</span>
      </div>
      <div className="nav-item">
        <User size={24} />
        <span>마이페이지</span>
      </div>
    </nav>
  );
}
