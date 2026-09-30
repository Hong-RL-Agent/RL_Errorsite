import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, AlertCircle, Edit3, XCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Reservations({ showToast }) {
  const [reservations, setReservations] = useState([]);

  // Modify Modal State (SEC-402, SEC-404, SEC-405)
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [selectedResvForModify, setSelectedResvForModify] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPartySize, setEditPartySize] = useState(2);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cancel Modal State (SEC-403)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedResvForCancel, setSelectedResvForCancel] = useState(null);
  const [cancellationPolicy, setCancellationPolicy] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      if (data.success) {
        setReservations(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Open Modify
  const handleOpenModify = (resv) => {
    setSelectedResvForModify(resv);
    setEditDate(resv.date);
    setEditTime(resv.time);
    setEditPartySize(resv.partySize);
    setModifyModalOpen(true);
  };

  // Submit Modify (Triggers SEC-402, SEC-404, or SEC-405)
  const handleConfirmModify = async () => {
    if (!selectedResvForModify) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/reservations/${selectedResvForModify.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          time: editTime,
          partySize: parseInt(editPartySize)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.message,
          data.bugId || 'site044-SEC-402',
          data.secId || 'SEC-402'
        );
        setModifyModalOpen(false);
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Cancel (Triggers SEC-403 check)
  const handleOpenCancel = async (resv) => {
    setSelectedResvForCancel(resv);
    try {
      const res = await fetch(`/api/reservations/${resv.id}/cancellation-policy`);
      const data = await res.json();
      if (data.success) {
        setCancellationPolicy(data);
        setCancelModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedResvForCancel) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/reservations/${selectedResvForCancel.id}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          '예약이 취소되었습니다. 환불 규정 정책이 적용되었습니다.',
          data.bugId || 'site044-SEC-403',
          data.secId || 'SEC-403'
        );
        setCancelModalOpen(false);
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>나의 실시간 다이닝 예약 내역 ({reservations.length}건)</h2>
          <p>예약 일정 확인, 시간/인원 변경 및 취소 관리가 가능합니다.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {reservations.map((resv) => (
          <div
            key={resv.id}
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e7e5e4',
              padding: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1c1917' }}>
                  {resv.restaurantName}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    background: resv.status === 'confirmed' ? '#fff7ed' : '#fee2e2',
                    color: resv.status === 'confirmed' ? '#c2410c' : '#b91c1c'
                  }}
                >
                  {resv.status === 'confirmed' ? '예약 확정' : '취소됨'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 18, fontSize: 14, color: '#57534e', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={15} color="#c2410c" /> {resv.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={15} color="#c2410c" /> {resv.time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={15} color="#c2410c" /> {resv.partySize}명
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={15} /> {resv.userName} ({resv.phone})
                </span>
              </div>
            </div>

            {resv.status === 'confirmed' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleOpenModify(resv)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 10,
                    border: '1px solid #c2410c',
                    background: '#fff7ed',
                    color: '#c2410c',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Edit3 size={14} />
                  예약 변경
                </button>

                <button
                  onClick={() => handleOpenCancel(resv)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 10,
                    border: '1px solid #e7e5e4',
                    background: '#ffffff',
                    color: '#78716c',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <XCircle size={14} />
                  예약 취소
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modify Reservation Modal (SEC-402, SEC-404, SEC-405) */}
      <Modal
        isOpen={modifyModalOpen}
        title={selectedResvForModify ? `${selectedResvForModify.restaurantName} 예약 변경` : '예약 변경'}
        onClose={() => setModifyModalOpen(false)}
        footer={
          <>
            <button
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e7e5e4', background: '#fff', cursor: 'pointer' }}
              onClick={() => setModifyModalOpen(false)}
            >
              닫기
            </button>
            <button
              className="btn-terracotta"
              onClick={handleConfirmModify}
              disabled={isUpdating}
            >
              {isUpdating ? '변경 반영 중...' : '예약 변경 저장하기'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">예약 날짜 변경 (월요일 휴무일 선택 테스트 가능)</label>
          <input
            type="date"
            className="form-input"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">시간대 변경 (기존 좌석 미복구 테스트 가능)</label>
          <select
            className="form-select"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
          >
            <option value="12:00">12:00 (런치 1부)</option>
            <option value="13:00">13:00 (런치 2부)</option>
            <option value="18:00">18:00 (디너 1부)</option>
            <option value="19:00">19:00 (디너 메인)</option>
            <option value="20:00">20:00 (디너 2부)</option>
            <option value="20:30">20:30 (디너 심야)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">예약 인원수 (인원 초과 수용량 테스트 가능)</label>
          <input
            type="number"
            min="1"
            max="12"
            className="form-input"
            value={editPartySize}
            onChange={(e) => setEditPartySize(e.target.value)}
          />
        </div>
      </Modal>

      {/* Cancellation Policy Modal (SEC-403) */}
      <Modal
        isOpen={cancelModalOpen}
        title="예약 취소 및 환불 수수료 확인"
        onClose={() => setCancelModalOpen(false)}
        footer={
          <>
            <button
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e7e5e4', background: '#fff', cursor: 'pointer' }}
              onClick={() => setCancelModalOpen(false)}
            >
              취소 안 함
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              {isCancelling ? '취소 처리 중...' : '예약 최종 취소하기'}
            </button>
          </>
        }
      >
        {cancellationPolicy && (
          <div>
            <div style={{ background: '#f5f5f4', padding: 18, borderRadius: 12, marginBottom: 18 }}>
              <div style={{ fontSize: 14, color: '#57534e', marginBottom: 6 }}>
                예약 일정: <strong>{cancellationPolicy.reservationDate} {cancellationPolicy.reservationTime}</strong>
              </div>
              <div style={{ fontSize: 14, color: '#dc2626', fontWeight: 700, marginBottom: 6 }}>
                부과 취소 수수료: {cancellationPolicy.cancellationFee.toLocaleString()}원
              </div>
              <div style={{ fontSize: 14, color: '#16a34a', fontWeight: 700 }}>
                최종 환불 예정 금액: {cancellationPolicy.refundableAmount.toLocaleString()}원
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#78716c', lineHeight: 1.6 }}>
              {cancellationPolicy.policyNotice}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
