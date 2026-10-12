'use client';
import React from 'react';
import { Package, RotateCcw, Users, RefreshCw } from 'lucide-react';

export default function Header({ activeView, setActiveView, onReset, isResetting, onOpenCustomerModal }) {
  return (
    <header className="top-nav">
      <div className="brand-logo">
        <div className="brand-icon">OP</div>
        <div>
          <div className="brand-title">OrderPilot</div>
          <div className="brand-subtitle">Smart E-commerce Operations</div>
        </div>
      </div>

      <div className="nav-center">
        <button
          className={`nav-link-btn ${activeView === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveView('orders')}
        >
          주문 및 배송 관리
        </button>
        <button
          className="nav-link-btn"
          onClick={onOpenCustomerModal}
        >
          등록 고객 관리 (25명)
        </button>
      </div>

      <div className="nav-actions">
        <button
          className="btn-reset"
          onClick={onReset}
          disabled={isResetting}
          title="SQLite DB 및 모든 검색/필터 상태를 초기 75건 주문으로 복원합니다."
        >
          <RotateCcw size={14} className={isResetting ? 'spin' : ''} />
          <span>{isResetting ? '초기화 중...' : '시스템 데이터 초기화'}</span>
        </button>
      </div>
    </header>
  );
}
