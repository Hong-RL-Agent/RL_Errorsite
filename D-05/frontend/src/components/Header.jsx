import React from 'react';
import { RotateCcw, ChevronRight, Bell } from 'lucide-react';

export default function Header({ activeTab, onReset, isResetting }) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return '운영 대시보드';
      case 'users': return '사용자 및 계정 관리';
      case 'requests': return '서비스 요청 승인';
      case 'logs': return '감사 및 관리 로그';
      case 'export': return '통계 및 데이터 내보내기';
      default: return '대시보드';
    }
  };

  return (
    <header className="top-header">
      <div className="breadcrumb-area">
        <span>AdminScope</span>
        <ChevronRight size={14} />
        <span className="breadcrumb-active">{getTabTitle(activeTab)}</span>
      </div>

      <div className="header-actions">
        <button 
          className="btn-reset" 
          onClick={onReset}
          disabled={isResetting}
          title="DB 및 화면 필터/검색/선택 상태를 초기 상태로 멱등 복원합니다."
        >
          <RotateCcw size={14} className={isResetting ? 'spin' : ''} />
          <span>{isResetting ? '초기화 중...' : '시스템 데이터 초기화'}</span>
        </button>

        <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
          <Bell size={16} />
        </button>

        <div className="admin-profile">
          <div className="admin-avatar">관</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>최고관리자</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>IT운영본부</div>
          </div>
        </div>
      </div>
    </header>
  );
}
