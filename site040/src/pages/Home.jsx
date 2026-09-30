import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, BookOpen, GraduationCap, Award, PlayCircle, Star, Users } from 'lucide-react';
import CourseCard from '../components/CourseCard';

export default function Home({ onNavigate, onSelectCourse }) {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboard(data))
      .catch(console.error);
  }, []);

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 40px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ maxWidth: '620px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(37, 99, 235, 0.25)',
            border: '1px solid rgba(96, 165, 250, 0.4)',
            color: '#93c5fd',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            <Sparkles size={13} /> 2026 현업 실무 중심 온라인 부트캠프
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            실무 역량을 완성하는<br />가장 확실한 온라인 코스
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '24px', lineHeight: 1.6 }}>
            네카라쿠배 현직 테크 리드와 함께하는 프론트엔드, 데이터 분석, Figma UI 시스템부터 이력서 첨삭까지 실무에 바로 투입되는 커리큘럼을 경험해보세요.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('courses')}
              style={{ padding: '10px 20px' }}
            >
              전체 코스 탐색하기 <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('mylearning')}
              style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              이어 학습하기
            </button>
          </div>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid-layout grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>100% 수료 인증서 발급</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>링크드인 및 이력서 기재 공식 인증</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>1:1 강사 코드 리뷰</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>실시간 튜터 질의응답 및 피드백</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>평생 무제한 수강권</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>최신 실무 업데이트 무료 제공</div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              지금 가장 주목받는 인기 코스
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>수강생 만족도 4.9점 이상의 실무 검증 강좌</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('courses')}
          >
            전체보기 <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-layout grid-4">
          {dashboard?.featuredCourses?.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
