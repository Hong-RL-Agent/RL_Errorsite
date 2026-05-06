import React from 'react';
import { Search, Map, Calendar, Heart, User } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery, onSearch }) {
  return (
    <header className="header">
      <div className="container flex justify-between items-center">
        <div className="logo">
          <Map size={28} />
          <span>TripPlanner</span>
        </div>
        
        <div className="search-bar-header">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="어디로 떠나시나요?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>

        <nav className="nav-links">
          <button className="nav-link flex items-center gap-2" onClick={() => alert('준비중입니다.')}>
            <Calendar size={18} /> 날짜 선택
          </button>
          <button className="nav-link flex items-center gap-2" onClick={() => alert('준비중입니다.')}>
            <Heart size={18} /> 저장된 여행
          </button>
          <button className="nav-link flex items-center gap-2" onClick={() => alert('준비중입니다.')}>
            <User size={18} /> 프로필
          </button>
        </nav>
      </div>
    </header>
  );
}
