import React, { useState } from 'react';

const ReviewSection = () => {
  const [sortBy, setSortBy] = useState('Latest');

  const reviews = [
    { id: 1, user: '캠핑매니아', rating: 5, date: '2026-04-20', content: '공기가 너무 맑고 시설도 깨끗해요!' },
    { id: 2, user: '초보캠퍼', rating: 4, date: '2026-04-15', content: '밤에 별이 정말 잘 보여서 감동했습니다.' },
    { id: 3, user: '나들이족', rating: 5, date: '2026-04-10', content: '아이들과 함께하기 너무 좋은 곳이네요.' },
  ];

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem' }}>이용 후기 ({reviews.length})</h3>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="Latest">최신순</option>
          <option value="Rating">별점순</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {reviews.map(r => (
          <div key={r.id} style={{ paddingBottom: '15px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700 }}>{r.user}</span>
              <span style={{ color: '#ffcc00' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#444', marginBottom: '5px' }}>{r.content}</p>
            <span style={{ fontSize: '0.8rem', color: '#999' }}>{r.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
