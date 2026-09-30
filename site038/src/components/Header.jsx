import React from 'react';
import { Search, Bell, Plus, Sparkles, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentPage, setCurrentPage, currentUser }) {
  const current = activeTab || currentPage || 'dashboard';
  const setPage = setActiveTab || setCurrentPage || (() => {});

  const pageTitles = {
    dashboard: '크리에이터 종합 대시보드',
    content: '영상 및 미디어 콘텐츠 관리',
    calendar: '콘텐츠 제작 & 발행 캘린더',
    team: '팀원 협업 & 권한 관리',
    shipping: '크리에이터 굿즈 배송 관리',
    refunds: '굿즈 주문 환불 & CS 처리',
    search: '검색 & 제안 키워드 관리',
    notifications: '알림 센터 & 푸시 메시지',
    reports: '콘텐츠 성과 분석 & 리포트',
    'csv-import': '콘텐츠 데이터 CSV 임포트',
    'api-console': '개발자 API 콘솔 & 쿼리',
    activity: '활동 내역 & 트랜잭션 기록',
    settings: '설정 & 크리에이터 프로필'
  };

  return (
    <header className="app-header">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {pageTitles[current] || 'CreatorFlow Studio'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setPage('activity')}
          title="트랜잭션 기록 확인"
        >
          <Activity size={15} color="#6366f1" /> 활동 내역
        </button>

        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setPage('content')}
        >
          <Plus size={15} /> 새 프로젝트 기획
        </button>
      </div>
    </header>
  );
}
