import React from 'react';

const ReviewSection = () => {
  const reviews = [
    { id: 1, user: 'Jiwoo Kim', content: '도심 속에서 진정한 휴식을 찾은 것 같아요. 시그니처 마사지 강력 추천합니다.', date: '2024.01.20' },
    { id: 2, user: 'Thomas Muller', content: 'Very professional therapists and calming atmosphere. Definitely coming back.', date: '2024.01.15' },
    { id: 3, user: 'Minseo Lee', content: '결혼 기념일에 방문했는데 세심한 배려에 너무 감동받았습니다.', date: '2024.01.05' }
  ];

  return (
    <div style={{ marginTop: '100px' }}>
      <h2 className="section-title">Client Testimonials</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
        {reviews.map(review => (
          <div key={review.id} style={{ padding: '40px', background: 'var(--accent)', borderRadius: '4px' }}>
            <p style={{ fontStyle: 'italic', marginBottom: '20px', color: 'var(--primary)', lineHeight: '1.8' }}>"{review.content}"</p>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>{review.user}</strong> — {review.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
