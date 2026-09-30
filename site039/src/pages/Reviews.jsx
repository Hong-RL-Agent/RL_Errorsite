import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';

export default function Reviews({ onShowToast }) {
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      productName: '미니멀 세라믹 머그 350ml (웜베이지)',
      userName: '김서연',
      rating: 5,
      content: '무광 텍스처가 정말 고급스럽고 커피 온도가 오래 유지돼요! 다른 색상도 추가 구매할 예정입니다.',
      date: '2026-09-21'
    },
    {
      id: 'rev-2',
      productName: '헤비 캔버스 데일리 토트백',
      userName: '이지훈',
      rating: 5,
      content: '원단이 탄탄하고 어깨 끈이 넓어서 16인치 노트북을 수납해도 어깨 부담이 전혀 없습니다.',
      date: '2026-09-18'
    },
    {
      id: 'rev-3',
      productName: '포터블 무드 램프 (충전식 LED)',
      userName: '박수아',
      rating: 5,
      content: '침실 무드등으로 매일 밤 켜두고 있어요. 은은한 웜 라이트가 마음을 편안하게 해줍니다.',
      date: '2026-09-15'
    }
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">구매 고객 리뷰 & 상품 댓글</h1>
          <p className="page-subtitle">실제 구매 고객님들이 남겨주신 생생한 일상 라이프스타일 후기 모음입니다.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          실시간 포토 & 텍스트 리뷰 ({reviews.length}건)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '18px 20px',
                background: '#fbf9f6',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>{r.productName}</span>
                <span style={{ color: '#f59e0b', fontSize: '13px' }}>{'★'.repeat(r.rating)}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.5 }}>
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
