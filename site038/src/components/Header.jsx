import React from 'react';
import { BookOpen, User, Search, Phone } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          <BookOpen size={28} />
          ELITE <span>ACADEMY</span>
        </div>
        
        <nav className="nav">
          <a href="#" className="nav-link">과목 메뉴</a>
          <a href="#" className="nav-link">주간 시간표</a>
          <a href="#" className="nav-link">강사진</a>
          <a href="#" className="nav-link">공지사항</a>
        </nav>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => alert('상담 신청 페이지로 이동합니다.')}>
            <Phone size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            상담 신청
          </button>
          <button className="btn btn-primary" onClick={() => alert('로그인 준비중입니다.')}>
            <User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            로그인
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
