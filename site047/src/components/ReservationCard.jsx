import React from 'react';
import { Calendar, Clock, Users, ChevronRight, Edit3, XCircle, CheckCircle2, MessageSquarePlus } from 'lucide-react';

export default function ReservationCard({ 
  reservation, 
  onSelect, 
  onChangeSchedule, 
  onCancel, 
  onWriteReview 
}) {
  const statusConfig = {
    pending: { label: '예약 대기', badgeClass: 'badge-yellow' },
    confirmed: { label: '예약 확정', badgeClass: 'badge-blue' },
    completed: { label: '체험 완료', badgeClass: 'badge-green' },
    cancelled: { label: '예약 취소', badgeClass: 'badge-red' }
  };

  const currentStatus = statusConfig[reservation.status] || { label: reservation.status, badgeClass: 'badge-gray' };

  return (
    <div 
      className="card"
      id={`reservation-card-${reservation.id}`}
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${currentStatus.badgeClass}`}>
            {currentStatus.label}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: 'monospace' }}>
            {reservation.bookingCode}
          </span>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          결제 금액: <strong style={{ color: 'var(--primary-navy)', fontSize: 15 }}>{Number(reservation.totalPrice).toLocaleString()}원</strong>
        </div>
      </div>

      {/* Main Experience Info */}
      <div 
        onClick={() => onSelect && onSelect(reservation.id)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 6 }}>
            {reservation.experienceTitle}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} color="var(--sky-blue)" /> {reservation.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color="var(--sky-blue)" /> {reservation.time}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={14} color="var(--sky-blue)" /> {reservation.participants}명
            </span>
          </div>
        </div>

        <ChevronRight size={18} color="var(--text-light)" />
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        paddingTop: 12,
        borderTop: '1px solid var(--border-light)',
        flexWrap: 'wrap'
      }}>
        {/* Detail Button */}
        <button 
          id={`btn-view-reservation-${reservation.id}`}
          onClick={() => onSelect && onSelect(reservation.id)}
          className="btn btn-outline btn-sm"
        >
          상세 내역
        </button>

        {/* Change Date/Time (SEC-392) */}
        {reservation.status !== 'cancelled' && (
          <button 
            id={`btn-change-schedule-${reservation.id}`}
            onClick={() => onChangeSchedule && onChangeSchedule(reservation)}
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--sky-blue)', borderColor: 'var(--sky-blue)' }}
          >
            <Edit3 size={13} /> 일정 변경
          </button>
        )}

        {/* Cancel Button */}
        {reservation.status === 'confirmed' || reservation.status === 'pending' ? (
          <button 
            id={`btn-cancel-reservation-${reservation.id}`}
            onClick={() => onCancel && onCancel(reservation)}
            className="btn btn-danger btn-sm"
          >
            <XCircle size={13} /> 예약 취소
          </button>
        ) : null}

        {/* Review Button: Allow writing reviews (even on cancelled for SEC-394 observation) */}
        <button 
          id={`btn-write-review-${reservation.id}`}
          onClick={() => onWriteReview && onWriteReview(reservation)}
          className="btn btn-primary btn-sm"
        >
          <MessageSquarePlus size={13} /> 후기 작성
        </button>
      </div>
    </div>
  );
}
