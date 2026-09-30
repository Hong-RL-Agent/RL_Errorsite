import React, { useState } from 'react';
import { api, notifyBugDetected } from '../api/client';

export default function ReviewForm({ bookId, onReviewAdded, showToast }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('열혈독서가');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      if (showToast) showToast('리뷰 내용을 입력해주세요.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // INTENTIONAL BACKEND BUG: site054-SEC-447 trigger observation
      if (rating === 0) {
        notifyBugDetected({
          id: 'SEC-447',
          category: 'Form Validation',
          family: 'default-value-coercion',
          severity: 'medium',
          endpoint: `/api/books/${bookId}/reviews`,
          method: 'POST',
          description: '리뷰 별점 0점(미선택) 입력 시 기본값 강제 할당(rating || 5) 로직에 의해 5점으로 왜곡 저장되는 오류'
        });
      }

      const res = await api.createBookReview(bookId, {
        rating,
        content,
        authorName
      });

      if (res && res.review) {
        if (showToast) {
          if (rating === 0) {
            showToast('서평이 등록되었습니다. (0점 입력 ➡️ 5점 처리됨)', 'info');
          } else {
            showToast('서평이 성공적으로 등록되었습니다!', 'success');
          }
        }
        setContent('');
        if (onReviewAdded) onReviewAdded(res.review);
      }
    } catch (err) {
      if (showToast) showToast(err.message || '리뷰 등록 실패', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      marginTop: '24px'
    }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '14px' }}>
        ✍️ 한 줄 서평 남기기
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Rating Stars Selection (including 0 stars for SEC-447) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            별점 평가 선택 (현재: {rating}점)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', fontSize: '1.6rem', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ color: star <= rating ? 'var(--gold)' : '#cbd5e1' }}
                >
                  ★
                </span>
              ))}
            </div>

            <button
              type="button"
              className="rating-zero-btn"
              onClick={() => setRating(0)}
              style={{
                marginLeft: '12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                background: rating === 0 ? '#ef4444' : 'white',
                color: rating === 0 ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-light)'
              }}
            >
              0점 (미평가/0점 테스트)
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '16px' }}>
          <textarea
            rows={3}
            className="search-box-input"
            style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '12px 16px', background: 'white' }}
            placeholder="이 책을 읽고 느낀 감상이나 추천 이유를 자유롭게 작성해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary-lib review-submit-btn" disabled={submitting}>
            {submitting ? '등록 중...' : '리뷰 남기기'}
          </button>
        </div>
      </form>
    </div>
  );
}
