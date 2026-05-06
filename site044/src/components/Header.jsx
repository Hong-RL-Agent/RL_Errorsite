import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 22h20L12 2z"/>
            <path d="M12 18l-3-3m6 0l-3 3"/>
          </svg>
          NatureCamp
        </div>
        <nav className="nav-links">
          <a href="#">지역별 캠핑장</a>
          <a href="#">테마별 여행</a>
          <a href="#">커뮤니티</a>
          <a href="#">이벤트</a>
        </nav>
        <div className="auth-buttons">
          <button style={{ fontWeight: 600 }}>예약 확인</button>
          <button className="btn-primary">로그인</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
