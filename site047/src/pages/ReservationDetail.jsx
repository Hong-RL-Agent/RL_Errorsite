import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  XCircle, 
  ChevronLeft,
  MessageSquarePlus
} from 'lucide-react';
import Modal from '../components/Modal';
import { fetchApi } from '../api/client';

export default function ReservationDetail({ reservationId, onBack, onShowToast }) {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleParticipants, setRescheduleParticipants] = useState(1);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('개인 사정으로 인한 취소');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadDetail = () => {
    if (!reservationId) return;
    setLoading(true);
    fetchApi(`/api/reservations/${reservationId}`)
      .then(data => {
        setReservation(data);
        setRescheduleDate(data.date);
        setRescheduleTime(data.time);
        setRescheduleParticipants(data.participants);
        setLoading(false);
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDetail();
  }, [reservationId]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        예약 세부 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!reservation) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <h3>예약 정보를 찾을 수 없습니다.</h3>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: 16 }}>
          예약 목록으로 돌아가기
        </button>
      </div>
    );
  }

  // Handle Reschedule (SEC-392)
  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    fetchApi(`/api/reservations/${reservation.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        date: rescheduleDate,
        time: rescheduleTime,
        participants: rescheduleParticipants
      })
    })
      .then(updated => {
        setShowRescheduleModal(false);
        setReservation(updated);
        if (onShowToast) onShowToast('예약 일정이 성공적으로 변경되었습니다.', 'success');
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  // Handle Cancel
  const handleConfirmCancel = (e) => {
    e.preventDefault();
    fetchApi(`/api/reservations/${reservation.id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: cancelReason })
    })
      .then(res => {
        setShowCancelModal(false);
        setReservation(res.reservation);
        if (onShowToast) onShowToast('예약이 성공적으로 취소되었습니다.', 'info');
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  // Handle Review (SEC-394)
  const handleConfirmReview = (e) => {
    e.preventDefault();
    fetchApi('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        reservationId: reservation.id,
        rating: reviewRating,
        comment: reviewComment
      })
    })
      .then(() => {
        setShowReviewModal(false);
        setReviewComment('');
        if (onShowToast) onShowToast('체험 후기가 등록되었습니다!', 'success');
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  const statusConfig = {
    pending: { label: '예약 대기', badgeClass: 'badge-yellow', color: '#b45309' },
    confirmed: { label: '예약 확정', badgeClass: 'badge-blue', color: '#0284c7' },
    completed: { label: '체험 완료', badgeClass: 'badge-green', color: '#10b981' },
    cancelled: { label: '예약 취소', badgeClass: 'badge-red', color: '#ef4444' }
  };

  const currentStatus = statusConfig[reservation.status] || { label: reservation.status, badgeClass: 'badge-gray', color: '#64748b' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {/* Back Button */}
      <div>
        <button 
          id="btn-back-to-reservations"
          onClick={onBack}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ChevronLeft size={16} /> 예약 목록으로
        </button>
      </div>

      {/* Main Reservation Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* Header with Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 20 }}>
          <div>
            <span className={`badge ${currentStatus.badgeClass}`} style={{ marginBottom: 8 }}>
              {currentStatus.label}
            </span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-navy)' }}>
              {reservation.experienceTitle}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4, fontFamily: 'monospace' }}>
              예약 접수 번호: {reservation.bookingCode}
            </p>
          </div>
        </div>

        {/* Schedule & Place */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          backgroundColor: 'var(--cream-bg)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>예약 일시</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="var(--sky-blue)" /> {reservation.date}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} color="var(--sky-blue)" /> {reservation.time}
            </p>
          </div>

          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>예약자 & 인원</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} color="var(--sky-blue)" /> {reservation.userName} ({reservation.participants}명)
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              연락처: {reservation.userPhone || '010-3491-8821'}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 12 }}>
            결제 및 정산 내역
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>체험 기본 요금 ({Number(reservation.basePrice).toLocaleString()}원 × {reservation.participants}명)</span>
              <span>{(Number(reservation.basePrice) * Number(reservation.participants)).toLocaleString()}원</span>
            </div>

            {reservation.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 600 }}>
                <span>쿠폰 할인 ({reservation.couponCode})</span>
                <span>-{Number(reservation.discountAmount).toLocaleString()}원</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTop: '1px dashed var(--border-color)',
              fontSize: 17,
              fontWeight: 800,
              color: 'var(--primary-navy)'
            }}>
              <span>최종 결제 금액</span>
              <span style={{ color: 'var(--sky-blue)' }}>{Number(reservation.totalPrice).toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* Cancellation Reason if cancelled */}
        {reservation.status === 'cancelled' && (
          <div style={{
            backgroundColor: 'var(--danger-light)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)' }}>취소 사유</span>
            <p style={{ fontSize: 14, color: '#991b1b', marginTop: 4 }}>
              {reservation.cancelReason || '사용자 요청으로 인한 예약 취소'}
            </p>
            {reservation.cancelledAt && (
              <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 4, display: 'block' }}>
                취소 일시: {new Date(reservation.cancelledAt).toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          paddingTop: 20,
          borderTop: '1px solid var(--border-light)',
          flexWrap: 'wrap'
        }}>
          {/* Change Schedule (SEC-392) */}
          {reservation.status !== 'cancelled' && (
            <button
              id="btn-open-change-modal"
              onClick={() => setShowRescheduleModal(true)}
              className="btn btn-outline"
            >
              <Edit3 size={15} /> 일정 및 인원 변경
            </button>
          )}

          {/* Cancel */}
          {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
            <button
              id="btn-open-cancel-modal"
              onClick={() => setShowCancelModal(true)}
              className="btn btn-danger"
            >
              <XCircle size={15} /> 예약 취소 신청
            </button>
          )}

          {/* Review Button (SEC-394) */}
          <button
            id="btn-open-review-modal"
            onClick={() => setShowReviewModal(true)}
            className="btn btn-primary"
          >
            <MessageSquarePlus size={15} /> 후기(리뷰) 작성
          </button>
        </div>
      </div>

      {/* Reschedule Modal (SEC-392) */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="예약 일정 변경"
      >
        <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">새로운 날짜</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">새로운 시간대</label>
            <select
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="form-select"
              required
            >
              <option value="10:00">10:00 (오전 1회차)</option>
              <option value="14:00">14:00 (오후 2회차)</option>
              <option value="16:30">16:30 (오후 3회차)</option>
              <option value="19:00">19:00 (야간 회차)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">참가 인원</label>
            <input
              type="number"
              min="1"
              max="10"
              value={rescheduleParticipants}
              onChange={(e) => setRescheduleParticipants(Number(e.target.value))}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setShowRescheduleModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-confirm-reschedule" type="submit" className="btn btn-primary">
              일정 변경 저장
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="예약 취소"
      >
        <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-main)' }}>
            정말로 <strong>{reservation.experienceTitle}</strong> 예약을 취소하시겠습니까?
          </p>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">취소 사유</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-select"
            >
              <option value="개인 사정으로 인한 취소">개인 사정으로 인한 취소</option>
              <option value="일정 중복 및 변경">일정 중복 및 변경</option>
              <option value="기상 악화">기상 악화</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setShowCancelModal(false)} className="btn btn-outline">
              닫기
            </button>
            <button id="btn-confirm-cancel-detail" type="submit" className="btn btn-danger">
              예약 취소
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal (SEC-394) */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="체험 후기 작성"
      >
        <form onSubmit={handleConfirmReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">별점</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setReviewRating(s)}
                  style={{ padding: 4 }}
                >
                  <Star 
                    size={28} 
                    fill={s <= reviewRating ? '#f59e0b' : '#e2e8f0'} 
                    color={s <= reviewRating ? '#f59e0b' : '#cbd5e1'} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">상세 후기</label>
            <textarea
              rows={4}
              placeholder="체험의 생생한 후기를 작성해주세요."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="modal-review-submit-detail" type="submit" className="btn btn-primary">
              후기 등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
