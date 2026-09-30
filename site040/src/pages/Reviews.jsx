import React, { useState } from 'react';
import { Star, MessageSquare, Award } from 'lucide-react';

export default function Reviews() {
  const [reviews] = useState([
    {
      id: 'rev-1',
      courseTitle: 'React & Next.js 프론트엔드 실무 마스터클래스',
      userName: '한도현',
      rating: 5,
      title: '실무에서 바로 쓰는 실전 압축 강의!',
      content: '단순한 문법 설명이 아니라 실제 대규모 서비스 아키텍처 관점에서 설명해주셔서 많은 도움이 되었습니다.',
      date: '2026-09-24'
    },
    {
      id: 'rev-2',
      courseTitle: 'React & Next.js 프론트엔드 실무 마스터클래스',
      userName: '정유진',
      rating: 5,
      title: 'Next.js 14 라우팅 이해가 쏙쏙 됩니다',
      content: '공식 문서만으로 이해하기 어려웠던 서버 컴포넌트와 클라이언트 컴포넌트 분리 원칙을 명쾌하게 짚어주셨어요.',
      date: '2026-09-21'
    },
    {
      id: 'rev-3',
      courseTitle: '파이썬으로 시작하는 실무 데이터 분석 & 머신러닝',
      userName: '강민혁',
      rating: 5,
      title: '비전공자도 쉽게 따라할 수 있는 파이썬 데이터 분석',
      content: '실제 캐글 데이터셋으로 실습하면서 시각화 그래프를 직접 그려보니 분석에 재미가 붙었습니다.',
      date: '2026-09-19'
    }
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">수강생 강의 평점 & 후기</h1>
          <p className="page-subtitle">ClassBridge 수강생들의 생생한 학습 후기와 평점을 모아보세요.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          실시간 수강평 아카이브 ({reviews.length}건)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '16px 20px',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-blue">{r.courseTitle}</span>
                <span style={{ color: '#f59e0b', fontSize: '13px' }}>{'★'.repeat(r.rating)}</span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {r.title}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                {r.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)' }}>
                <span>작성자: {r.userName}</span>
                <span>{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
