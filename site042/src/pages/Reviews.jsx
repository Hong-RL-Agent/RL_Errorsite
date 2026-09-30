import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, User, ThumbsUp } from 'lucide-react';

export default function Reviews({ showToast }) {
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [selectedClass, setSelectedClass] = useState('class-01');

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          rating: newRating,
          comment: newComment
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('소중한 수강 후기가 성공적으로 등록되었습니다!', 'success');
        setNewComment('');
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">수강생 생생 후기 & 평점</h2>
          <p className="section-subtitle">FitFlow 회원들이 직접 경험한 리얼 수강 후기를 확인하세요.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, marginBottom: 36 }}>
        {/* Review Form */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquarePlus size={18} color="#10b981" />
            수강 후기 작성하기
          </h3>

          <form onSubmit={handleAddReview}>
            <div className="form-group">
              <label className="form-label">수강 클래스 선택</label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="class-01">모닝 선라이즈 빈야사 요가</option>
                <option value="class-02">1:1 맞춤형 체형 교정 PT</option>
                <option value="class-03">체어 & 리포머 비기너 필라테스</option>
                <option value="class-04">칼로리 익스트림 스피닝 러쉬</option>
                <option value="class-06">싱잉볼 & 사운드 명상</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">만족도 별점</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={24}
                    color="#f59e0b"
                    fill={s <= newRating ? '#f59e0b' : 'none'}
                    onClick={() => setNewRating(s)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">후기 내용</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="강사님의 지도 스타일, 시설 청결도, 운동 효과 등을 작성해주세요."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-lime" style={{ width: '100%', padding: '12px' }}>
              후기 등록하기
            </button>
          </form>
        </div>

        {/* Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#ffffff',
                padding: 20,
                borderRadius: 16,
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{r.author}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{r.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
