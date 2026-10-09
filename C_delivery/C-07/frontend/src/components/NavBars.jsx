import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, User, ShoppingBag, RotateCcw, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

export function Navbar({ onResetDb, isResetting }) {
  return (
    <header className="top-nav">
      <div className="brand-section">
        <div className="brand-icon-box">
          <MapPin size={20} />
        </div>
        <div className="brand-titles">
          <span className="brand-title">MORROW</span>
          <span className="brand-sub">Shipping & Identity</span>
        </div>
      </div>

      <nav className="nav-links-wrap">
        <NavLink to="/mypage" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
          <User size={15} />
          <span>마이페이지</span>
        </NavLink>

        <NavLink to="/mypage/addresses" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
          <MapPin size={15} />
          <span>배송지 관리</span>
        </NavLink>

        <NavLink to="/order" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={15} />
          <span>주문서 (Order)</span>
        </NavLink>
      </nav>

      <button
        className="reset-env-btn"
        onClick={onResetDb}
        disabled={isResetting}
        title="POST /api/test/reset 초기화"
      >
        <RotateCcw size={12} className={isResetting ? 'animate-spin' : ''} />
        <span>{isResetting ? '초기화 중...' : '환경 리셋 (Reset DB)'}</span>
      </button>
    </header>
  );
}

export function HistoryToolbar({ onReload }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="history-bar">
      <div className="history-controls">
        <button className="history-btn" onClick={() => window.history.back()} title="뒤로 가기 (history.back())">
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
        <button className="history-btn" onClick={() => window.history.forward()} title="앞으로 가기 (history.forward())">
          <span>Forward</span>
          <ArrowRight size={13} />
        </button>
        <button className="history-btn" onClick={onReload} title="새로고침 (F5 Reload)">
          <RefreshCw size={13} />
          <span>Reload</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--text-muted)' }}>Route:</span>
        <span className="current-route-tag">{location.pathname}</span>
      </div>
    </div>
  );
}
