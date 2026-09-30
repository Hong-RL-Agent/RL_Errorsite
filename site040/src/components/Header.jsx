import React from 'react';
import { Search, BookOpen, User, Bell, LogIn, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentUser }) {
  const pageTitles = {
    home: '온라인 교육 & 학습 대시보드',
    courses: '전체 강의 코스 탐색',
    'course-detail': '강의 상세 및 커리큘럼',
    mylearning: '내 강의실 & 진도 관리',
    materials: '학습 보조 자료실',
    chat: '강사 1:1 학습 질문 & 상담',
    notices: '플랫폼 공지사항 & 업데이트',
    reviews: '수강생 강의 평점 & 후기',
    coupons: '수강 할인 쿠폰 & 이벤트',
    profile: '프로필 설정 & 교재 배송지',
    login: '수강생 로그인',
    register: '신규 회원가입'
  };

  return (
    <header className="app-header">
      <div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
          {pageTitles[activeTab] || 'ClassBridge Learning'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={15} color="var(--primary)" /> 강의 둘러보기
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('chat')}
        >
          <Sparkles size={15} color="#10b981" /> 1:1 튜터 질문
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setActiveTab('mylearning')}
        >
          내 강의실
        </button>
      </div>
    </header>
  );
}
