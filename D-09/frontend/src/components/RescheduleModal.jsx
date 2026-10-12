import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { rescheduleReservation } from '../lib/api';

const TIME_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'];

export default function RescheduleModal({
  reservation,
  filterContext = {},
  isOpen,
  onClose,
  onRescheduled,
  onNotify
}) {
  const [newDate, setNewDate] = useState(reservation ? reservation.booking_date : '');
  const [newTimeSlot, setNewTimeSlot] = useState(reservation ? reservation.time_slot : '10:00');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !reservation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) {
      onNotify && onNotify('변경할 날짜를 선택해주세요.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await rescheduleReservation(reservation.id, {
        newDate,
        newTimeSlot,
        filterContext
      });

      if (res.success) {
        onNotify && onNotify(res.message || '예약 일정이 변경되었습니다.', 'success');
        onRescheduled && onRescheduled();
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '일정 변경 실패', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={18} color="#3B82A6" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2D3748' }}>
              [{reservation.booking_code}] 예약 일정 변경
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8C9BAE' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#FAF5ED', padding: '14px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#718096' }}>서비스 및 반려동물</span>
                <span style={{ fontWeight: '700' }}>{reservation.service_icon} {reservation.service_name} / {reservation.pet_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096' }}>현재 예약 일정</span>
                <span style={{ fontWeight: '700', color: '#3B82A6' }}>{reservation.booking_date} ({reservation.time_slot})</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">새 예약 날짜 선택</label>
              <input
                type="date"
                required
                className="form-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">새 예약 시간대 선택</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {TIME_SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setNewTimeSlot(slot)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: newTimeSlot === slot ? '2px solid #3B82A6' : '1px solid #EDE8DF',
                      background: newTimeSlot === slot ? '#3B82A6' : '#FFFFFF',
                      color: newTimeSlot === slot ? '#FFFFFF' : '#2D3748',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? '변경 중...' : '일정 변경 확정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
