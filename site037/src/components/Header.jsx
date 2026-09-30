import React from 'react';
import { Theater, Search, User, Ticket, LogIn, Sparkles } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage, currentUser, onLogout }) {
  return (
    <header className="stageon-header">
      <div className="header-top">
        <div className="brand-logo" onClick={() => setCurrentPage('home')}>
          <div className="brand-icon">
            <Theater size={22} />
          </div>
          <div className="brand-title">
            Stage<span>On</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentPage('activity')}
            title="실시간 예매 및 시스템 트랜잭션 기록"
          >
            <Sparkles size={15} color="#7e22ce" /> 활동 로그
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setCurrentPage('my-tickets')}
              >
                <Ticket size={15} /> 예매내역
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setCurrentPage('mypage')}
              >
                <User size={15} /> {currentUser.name} 님
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('login')}>
                <LogIn size={15} /> 로그인
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage('register')}>
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="header-nav">
        {[
          { id: 'home', label: '홈 (Home)' },
          { id: 'performances', label: '공연 예매' },
          { id: 'exhibitions', label: '전시 안내' },
          { id: 'programs', label: '문화 아카데미' },
          { id: 'my-tickets', label: '내 티켓' },
          { id: 'files', label: '공연자료실' },
          { id: 'chat', label: '관객소통방' },
          { id: 'notices', label: '공지사항' },
          { id: 'reviews', label: '관람후기' },
          { id: 'mypage', label: '마이페이지' },
        ].map(item => (
          <button
            key={item.id}
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
