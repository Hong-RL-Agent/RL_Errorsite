import React, { useState } from 'react';

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-mark">◈</span>
          <span className="logo-text">PremiRide</span>
        </div>

        <nav className={`nav ${mobileOpen ? 'open' : ''}`}>
          <a href="#cars" onClick={() => setMobileOpen(false)}>차량 둘러보기</a>
          <a href="#insurance" onClick={() => setMobileOpen(false)}>보험 옵션</a>
          <a href="#recommend" onClick={() => setMobileOpen(false)}>추천 차량</a>
          <a href="#footer" onClick={() => setMobileOpen(false)}>지점 안내</a>
        </nav>

        <div className="header-actions">
          <button className="btn-header-login" onClick={() => alert('준비중입니다.')}>로그인</button>
          <button className="btn-header-reserve" onClick={() => alert('준비중입니다.')}>예약 확인</button>
          <button
            className="btn-mobile-toggle"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;