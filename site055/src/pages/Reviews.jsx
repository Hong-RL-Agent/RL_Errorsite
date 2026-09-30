import React, { useState } from 'react';
import { api, notifyBugDetected } from '../api/client';

export default function Reviews({ event, onClose, onReviewSubmitted }) {
  const [nickname, setNickname] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // INTENTIONAL BACKEND BUG: site055-SEC-453
    // Client-side and server-side validation fail to check `content.trim().length === 0`.
    // When the user inputs whitespace like "     ", it bypasses empty check and gets saved as a blank review!
    if (content === '') {
      setErrorMsg('후기 내용을 입력해주세요.');
      return;
    }

    if (content.length > 0 && content.trim() === '') {
      // Intentional Bug SEC-453 triggered!
      notifyBugDetected({
        id: 'SEC-453',
        description: '공백 문자열("   ")로만 구성된 후기 작성이 유효성 검사를 통과하여 빈 후기로 등록되는 오류',
        severity: 'medium',
        endpoint: `/api/events/${event.id}/reviews`,
        category: 'Input Validation',
        family: 'whitespace-validation'
      });
    }

    try {
      setSubmitting(true);
      const res = await api.createEventReview(event.id, {
        nickname: nickname.trim() || '익명 관람객',
        rating,
        content // Untrimmed content containing only spaces
      });

      if (res && res.success) {
        if (onReviewSubmitted) onReviewSubmitted(res.review);
        if (onClose) onClose();
      }
    } catch (err) {
      console.error('Failed to submit review', err);
      setErrorMsg(err.message || '후기 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">✍️ 관람 후기 작성</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-event-summary">
          <span className="summary-badge">{event.category}</span>
          <h4 className="summary-event-name">{event.title}</h4>
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
          {errorMsg && <div className="form-error-alert">{errorMsg}</div>}

          <div className="form-group">
            <label className="form-label">작성자 닉네임</label>
            <input
              type="text"
              className="form-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요 (미입력 시 익명)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">별점 평가</label>
            <div className="star-rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span className="rating-score-text">{rating}점 / 5점</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">후기 내용</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공연의 감동과 솔직한 후기를 남겨주세요."
            />
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? '등록 중...' : '후기 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
