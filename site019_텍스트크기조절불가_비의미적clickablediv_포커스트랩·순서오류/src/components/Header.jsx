import React from 'react';
import { Search, BookOpen, Bell, User, ChevronDown } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery, onSearch }) {
  return (
    <header className="header">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="logo flex items-center gap-2">
            <BookOpen size={28} />
            <span>EduConnect</span>
          </div>
          
          <div className="search-container">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="배우고 싶은 지식을 검색하세요" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <button className="flex items-center gap-1 font-semibold text-main" onClick={() => alert('준비중입니다.')}>
            카테고리 <ChevronDown size={16} />
          </button>
          <button className="font-semibold text-main" onClick={() => alert('준비중입니다.')}>
            내 강의실
          </button>
          <div className="flex items-center gap-4 border-l border-border pl-4">
            <button onClick={() => alert('준비중입니다.')}>
              <Bell size={20} className="text-muted" />
            </button>
            <button onClick={() => alert('준비중입니다.')}>
              <User size={20} className="text-muted" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
