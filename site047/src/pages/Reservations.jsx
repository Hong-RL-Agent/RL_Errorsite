import React, { useState, useEffect } from 'react';
import { CalendarCheck, Star, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ReservationCard from '../components/ReservationCard';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { fetchApi, getCurrentUser } from '../api/client';

export default function Reservations({ onSelectReservation, onNavigateExplore, onShowToast }) {
  const [reservations, setReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedResForChange, setSelectedResForChange] = useState(null);
  const [changeDate, setChangeDate] = useState('');
  const [changeTime, setChangeTime] = useState('');
  const [changeParticipants, setChangeParticipants] = useState(1);

  const [selectedResForCancel, setSelectedResForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('개인 사정으로 인한 취소');

  const [selectedResForReview, setSelectedResForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadReservations = () => {
    setLoading(true);
    const currentUser = getCurrentUser();
    fetchApi(`/api/reservations?userId=${currentUser.id}&status=${filterStatus}`)
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReservations();
    const handleUserChange = () => loadReservations();
    window.addEventListener('tripnest-user-changed', handleUserChange);
    return () => window.removeEventListener('tripnest-user-changed', handleUserChange);
  }, [filterStatus]);

  // Handle Schedule Change (Calls PATCH /api/reservations/:id - SEC-392)
  const handleConfirmChangeSchedule = (e) => {
    e.preventDefault();
    if (!selectedResForChange) return;

    fetchApi(`/api/reservations/${selectedResForChange.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        date: changeDate,
        time: changeTime,
        participants: changeParticipants
      })
    })
      .then(updated => {
        setSelectedResForChange(null);
        if (onShowToast) onShowToast(`예약 일정이 ${updated.date} ${updated.time} (${updated.participants}명)으로 변경되었습니다.`, 'success');
        loadReservations();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  // Handle Cancel Reservation
  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!selectedResForCancel) return;

    fetchApi(`/api/reservations/${selectedResForCancel.id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: cancelReason })
    })
      .then(() => {
        setSelectedResForCancel(null);
        if (onShowToast) onShowToast('예약이 성공적으로 취소되었습니다.', 'info');
        loadReservations();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  // Handle Review Submission (Calls POST /api/reviews - SEC-394)
  const handleConfirmReview = (e) => {
    e.preventDefault();
    if (!selectedResForReview) return;

    fetchApi('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        reservationId: selectedResForReview.id,
        rating: reviewRating,
        comment: reviewComment
      })
    })
      .then(() => {
        setSelectedResForReview(null);
        setReviewComment('');
        if (onShowToast) onShowToast('소중한 체험 후기가 등록되었습니다!', 'success');
        loadReservations();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  const statusTabs = [
    { id: 'all', label: '전체 예약' },
    { id: 'confirmed', label: '예약 확정' },
    { id: 'pending', label: '대기 중' },
    { id: 'completed', label: '체험 완료' },
    { id: 'cancelled', label: '취소된 예약' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 8 }}>
          나의 체험 예약 내역
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          신청하신 이벤트의 일정 관리, 예약 변경, 취소 및 체험 완료 후기를 작성하세요.
        </p>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 20,
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-light)',
          paddingTop: 16
        }}>
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-reservation-status-${tab.id}`}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: filterStatus === tab.id ? 'var(--primary-navy)' : '#f1f5f9',
                color: filterStatus === tab.id ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          예약 내역을 조회하는 중입니다...
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={32} />}
          title="해당 조건의 예약 내역이 없습니다"
          description="새로운 원데이 클래스나 투어를 예약하고 나만의 특별한 경험을 만들어보세요."
          actionText="인기 체험 둘러보기"
          onAction={onNavigateExplore}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reservations.map(res => (
            <ReservationCard
              key={res.id}
              reservation={res}
              onSelect={onSelectReservation}
              onChangeSchedule={(r) => {
                setSelectedResForChange(r);
                setChangeDate(r.date);
                setChangeTime(r.time);
                setChangeParticipants(r.participants);
              }}
              onCancel={(r) => setSelectedResForCancel(r)}
              onWriteReview={(r) => setSelectedResForReview(r)}
            />
          ))}
        </div>
      )}

      {/* Schedule Change Modal (SEC-392) */}
      <Modal
        isOpen={!!selectedResForChange}
        onClose={() => setSelectedResForChange(null)}
        title="예약 일정 및 인원 변경"
      >
        {selectedResForChange && (
          <form onSubmit={handleConfirmChangeSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--cream-bg)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-navy)' }}>{selectedResForChange.experienceTitle}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>예약 번호: {selectedResForChange.bookingCode}</p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">변경할 날짜</label>
              <input
                id="input-reschedule-date"
                type="date"
                value={changeDate}
                onChange={(e) => setChangeDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">변경할 시간대</label>
              <select
                id="select-reschedule-time"
                value={changeTime}
                onChange={(e) => setChangeTime(e.target.value)}
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
                id="input-reschedule-participants"
                type="number"
                min="1"
                max="10"
                value={changeParticipants}
                onChange={(e) => setChangeParticipants(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setSelectedResForChange(null)} className="btn btn-outline">
                취소
              </button>
              <button id="btn-confirm-reschedule" type="submit" className="btn btn-primary">
                일정 변경 저장
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Cancel Reservation Modal */}
      <Modal
        isOpen={!!selectedResForCancel}
        onClose={() => setSelectedResForCancel(null)}
        title="예약 취소 확인"
      >
        {selectedResForCancel && (
          <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px', backgroundColor: 'var(--danger-light)', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: '#991b1b' }}>
                <strong>정말 예약을 취소하시겠습니까?</strong>
                <p style={{ marginTop: 2 }}>취소 규정에 따라 전액 환불 처리되며 예약 상태가 '취소'로 전환됩니다.</p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">취소 사유</label>
              <select
                id="select-cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="form-select"
              >
                <option value="개인 사정으로 인한 취소">개인 사정으로 인한 취소</option>
                <option value="일정 중복 및 변경">일정 중복 및 변경</option>
                <option value="기상 악화 및 이동 불가">기상 악화 및 이동 불가</option>
                <option value="다른 체험 상품으로 재예약">다른 체험 상품으로 재예약</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setSelectedResForCancel(null)} className="btn btn-outline">
                닫기
              </button>
              <button id="btn-confirm-cancel" type="submit" className="btn btn-danger">
                예약 취소 확정
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Write Review Modal (SEC-394) */}
      <Modal
        isOpen={!!selectedResForReview}
        onClose={() => setSelectedResForReview(null)}
        title="체험 후기 작성"
      >
        {selectedResForReview && (
          <form onSubmit={handleConfirmReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--cream-bg)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-navy)' }}>{selectedResForReview.experienceTitle}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                체험일: {selectedResForReview.date} ({selectedResForReview.time}) · 상태: {selectedResForReview.status}
              </p>
            </div>

            {/* Rating Stars */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">만족도 별점</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    id={`rating-star-${star}`}
                    onClick={() => setReviewRating(star)}
                    style={{ padding: 4 }}
                  >
                    <Star 
                      size={28} 
                      fill={star <= reviewRating ? '#f59e0b' : '#e2e8f0'} 
                      color={star <= reviewRating ? '#f59e0b' : '#cbd5e1'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">상세 후기</label>
              <textarea
                id="textarea-review-comment"
                rows={4}
                placeholder="체험 내용, 호스트님의 지도, 준비물 등 다른 참가자에게 도움이 될 생생한 후기를 작성해주세요."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="form-textarea"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setSelectedResForReview(null)} className="btn btn-outline">
                취소
              </button>
              <button id="modal-review-submit" type="submit" className="btn btn-primary">
                후기 등록하기
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
