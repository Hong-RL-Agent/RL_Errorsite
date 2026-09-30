import React from 'react';

export default function ReviewCard({ review }) {
  if (!review) return null;

  const stars = '★'.repeat(Math.max(1, Math.min(5, review.rating || 5))) + '☆'.repeat(Math.max(0, 5 - (review.rating || 5)));

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-meta">
          <div className="reviewer-avatar">👤</div>
          <div className="reviewer-info">
            <span className="reviewer-name">{review.nickname || '익명 관람객'}</span>
            <span className="reviewer-badge">인증 관람객</span>
          </div>
        </div>
        <span className="review-date">{review.createdAt || '2026-09-27'}</span>
      </div>

      <div className="review-rating-stars" aria-label={`평점 ${review.rating}점`}>
        {stars}
        <span className="stars-numeric-label">{review.rating}.0</span>
      </div>

      <p className="review-content">
        {review.content || <span className="empty-content-text">(작성된 후기 내용이 없습니다)</span>}
      </p>
    </div>
  );
}
