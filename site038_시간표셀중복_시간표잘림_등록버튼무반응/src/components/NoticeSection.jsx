import React from 'react';
import { Star } from 'lucide-react';

const NoticeSection = () => {
  const reviews = [
    { id: 1, user: '학부모 이OO', content: '선생님들이 너무 친절하시고 아이가 수학에 흥미를 갖게 되었어요.', rating: 5 },
    { id: 2, user: '학생 박OO', content: '기출 분석 특강 덕분에 이번 중간고사 만점 받았습니다!', rating: 5 },
    { id: 3, user: '학부모 김OO', content: '학원 셔틀이 집 앞까지 와서 안심하고 보냅니다.', rating: 4 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '80px' }}>
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: 'var(--primary)' }}>공지사항</h3>
        <ul className="footer-links" style={{ color: 'var(--text-dark)' }}>
          <li style={{ padding: '15px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span>[공지] 2024 봄학기 정규반 시간표 확정</span>
            <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>2024.01.15</span>
          </li>
          <li style={{ padding: '15px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span>[안내] 설 연휴 기간 학원 휴강 안내</span>
            <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>2024.01.10</span>
          </li>
          <li style={{ padding: '15px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span>[특강] 예비 고1을 위한 국어 고득점 전략</span>
            <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>2024.01.05</span>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: 'var(--primary)' }}>수강생 생생 후기</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map(review => (
            <div key={review.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '10px', color: '#f6ad55' }}>
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="#f6ad55" />)}
              </div>
              <p style={{ fontSize: '0.95rem', marginBottom: '10px' }}>"{review.content}"</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{review.user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeSection;
