import React from 'react';
import { Sparkles, User, MapPin, Calendar, HelpCircle } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={30} color="var(--secondary)" />
          <span>AZURE SPA</span>
        </div>
        
        <nav className="nav">
          <a href="#" className="nav-link">SPA PACKAGES</a>
          <a href="#" className="nav-link">LOCATIONS</a>
          <a href="#" className="nav-link">MEMBERSHIP</a>
        </nav>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => alert('예약 확인 페이지 준비중입니다.')}>
            <Calendar size={18} /> CONFIRM
          </button>
          <button className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => alert('상담 센터로 연결합니다.')}>
            <HelpCircle size={18} /> SUPPORT
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }} onClick={() => alert('로그인이 필요합니다.')}>
            <User size={18} /> MY PAGE
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
