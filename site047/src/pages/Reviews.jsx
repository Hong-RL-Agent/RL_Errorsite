import React, { useState, useEffect } from 'react';
import { FileText, Star, Plus } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { fetchApi, getCurrentUser } from '../api/client';

export default function Reviews({ onNavigateReservations, onShowToast }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Direct Review Registration Modal
  const [showDirectReviewModal, setShowDirectReviewModal] = useState(false);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedResId, setSelectedResId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const loadReviews = () => {
    setLoading(true);
    fetchApi('/api/reviews')
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const user = getCurrentUser();
    fetchApi(`/api/reservations?userId=${user.id}`)
      .then(resList => {
        setMyReservations(resList);
        if (resList.length > 0) {
          setSelectedResId(resList[0].id);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedResId) {
      if (onShowToast) onShowToast('리뷰를 작성할 예약을 선택해주세요.', 'error');
      return;
    }

    // SEC-394: Allows posting review for any reservation status
    fetchApi('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        reservationId: selectedResId,
        rating: rating,
        comment: comment
      })
    })
      .then(() => {
        setShowDirectReviewModal(false);
        setComment('');
        if (onShowToast) onShowToast('체험 후기가 등록되었습니다!', 'success');
        loadReviews();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
            체험 후기 & 리뷰
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            참가자들이 직접 남긴 솔직한 경험과 소중한 별점 평가를 확인하세요.
          </p>
        </div>

        <button 
          id="btn-open-direct-review"
          onClick={() => setShowDirectReviewModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>리뷰 작성하기</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          후기 목록을 불러오는 중입니다...
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title="등록된 리뷰가 없습니다"
          description="예약 내역에서 체험 완료 후기를 첫 번째로 등록해보세요."
          actionText="내 예약 내역 보기"
          onAction={onNavigateReservations}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {reviews.map(rev => (
            <ReviewCard key={rev.id} review={rev} />
          ))}
        </div>
      )}

      {/* Direct Review Modal */}
      <Modal
        isOpen={showDirectReviewModal}
        onClose={() => setShowDirectReviewModal(false)}
        title="체험 후기 직접 등록"
      >
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">대상 예약 선택</label>
            <select
              id="select-review-target-res"
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="form-select"
              required
            >
              {myReservations.map(r => (
                <option key={r.id} value={r.id}>
                  [{r.status}] {r.experienceTitle} ({r.date})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">만족도 별점</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  style={{ padding: 4 }}
                >
                  <Star 
                    size={28} 
                    fill={s <= rating ? '#f59e0b' : '#e2e8f0'} 
                    color={s <= rating ? '#f59e0b' : '#cbd5e1'} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">체험 후기 내용</label>
            <textarea
              id="textarea-direct-review"
              rows={4}
              placeholder="체험의 장점과 유익했던 순간을 공유해주세요."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setShowDirectReviewModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-submit-direct-review" type="submit" className="btn btn-primary">
              후기 등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
