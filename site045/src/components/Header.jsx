import React from 'react';
import { Layers, CreditCard, Sparkles, Film, User, ShieldCheck } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage, subscription }) {
  return (
    <header className="header-wrap">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand-wrap" onClick={() => setCurrentPage('home')}>
          <div className="brand-icon">P</div>
          <div className="brand-titles">
            <h1>Passly</h1>
            <p>ALL-IN-ONE MEMBERSHIP</p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="nav-links">
          <button
            className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <Sparkles size={16} />
            홈
          </button>

          <button
            className={`nav-btn ${currentPage === 'plans' ? 'active' : ''}`}
            onClick={() => setCurrentPage('plans')}
          >
            <Layers size={16} />
            플랜 & 가격
          </button>

          <button
            className={`nav-btn ${currentPage === 'subscription' ? 'active' : ''}`}
            onClick={() => setCurrentPage('subscription')}
          >
            <ShieldCheck size={16} />
            내 구독 관리
            {subscription && (
              <span style={{ fontSize: 11, background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: 9999, fontWeight: 700 }}>
                {subscription.status === 'active' ? '이용중' : subscription.status}
              </span>
            )}
          </button>

          <button
            className={`nav-btn ${currentPage === 'content' ? 'active' : ''}`}
            onClick={() => setCurrentPage('content')}
          >
            <Film size={16} />
            콘텐츠 라운지
          </button>

          <button
            className={`nav-btn ${currentPage === 'billing' ? 'active' : ''}`}
            onClick={() => setCurrentPage('billing')}
          >
            <CreditCard size={16} />
            결제 & 청구
          </button>

          <button
            className={`nav-btn ${currentPage === 'mypage' ? 'active' : ''}`}
            onClick={() => setCurrentPage('mypage')}
          >
            <User size={16} />
            마이페이지
          </button>
        </div>
      </div>
    </header>
  );
}
