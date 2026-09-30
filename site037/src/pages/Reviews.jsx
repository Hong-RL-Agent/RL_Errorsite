import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, MessageSquare } from 'lucide-react';

export default function Reviews({ showToast, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [selectedPerfId, setSelectedPerfId] = useState('performance-101');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(d => setReviews(d))
      .catch(err => console.error(err));

    fetch('/api/performances')
      .then(res => res.json())
      .then(d => setPerformances(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit review handler (SEC-350 / site037-bug10)
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedPerfId) return;

    setSubmitting(true);
    const idempotency_key = `REVIEW-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch(`/api/performances/${selectedPerfId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: Number(rating),
        content: content.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSubmitting(false);
      setContent('');
      loadData();
      showToast('관람후기 등록 완료', '소중한 공연 관람평이 등록되었습니다.', 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setSubmitting(false);
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
      {/* Review Form (SEC-350) */}
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-900)' }}>공연 관람후기 작성</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--gray-500)' }}>무대의 감동과 연출에 대한 솔직한 평점을 남겨주세요.</p>
        </div>

        <form onSubmit={handleSubmitReview}>
          <div className="form-group">
            <label className="form-label">관람한 공연 선택</label>
            <select
              className="form-control"
              value={selectedPerfId}
              onChange={e => setSelectedPerfId(e.target.value)}
            >
              {performances.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.category}] {p.title} ({p.artist})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">별점 평가</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <Star 
                    size={24} 
                    color={star <= rating ? '#f59e0b' : '#cbd5e1'} 
                    fill={star <= rating ? '#f59e0b' : 'none'} 
                  />
                </button>
              ))}
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gold)', marginLeft: '8px', alignSelf: 'center' }}>
                {rating}점 / 5.0
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">관람평 내용</label>
            <textarea
              className="form-control"
              placeholder="음향, 무대 연출, 배우/연주자의 연주에 대한 생생한 후기를 남겨주세요."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows="5"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting || !content.trim()}>
              <Send size={16} /> {submitting ? '등록 중...' : '리뷰 등록하기'}
            </button>
          </div>
        </form>
      </div>

      {/* Review List */}
      <div className="card">
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)' }}>최신 관람평 목록</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--gray-500)' }}>관객들이 직접 남긴 공연 리뷰 피드</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '560px', overflowY: 'auto' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ padding: '16px', background: '#faf7f2', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-900)' }}>{r.author} 님</span>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                  {'★'.repeat(r.rating)} ({r.rating}.0)
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>
                공연: {r.performanceTitle}
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--dark-900)', lineHeight: 1.5 }}>
                {r.content}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--gray-400)', marginTop: '8px', textAlign: 'right' }}>
                {r.createdAt}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
