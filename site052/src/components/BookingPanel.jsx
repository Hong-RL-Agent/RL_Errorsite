import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function BookingPanel({ room, onBookingSuccess, showToast }) {
  const [selectedDate, setSelectedDate] = useState('2026-09-28');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [attendees, setAttendees] = useState(1);
  const [memo, setMemo] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Available dates (next 7 days starting 2026-09-27)
  const availableDates = [
    { label: '09/27 (일)', value: '2026-09-27' },
    { label: '09/28 (월)', value: '2026-09-28' },
    { label: '09/29 (화)', value: '2026-09-29' },
    { label: '09/30 (수)', value: '2026-09-30' },
    { label: '10/01 (목)', value: '2026-10-01' },
    { label: '10/02 (금)', value: '2026-10-02' },
    { label: '10/03 (토)', value: '2026-10-03' }
  ];

  const fetchAvailability = async (dateVal, staleSlot = '') => {
    if (!room) return;
    setLoadingSlots(true);
    try {
      const headers = staleSlot ? { 'x-stale-slot-detected': 'true' } : {};
      const res = await api.getRoomAvailability(room.id, dateVal, {
        selectedSlots: staleSlot,
        dateChanged: staleSlot ? 'true' : 'false'
      }, headers);
      if (res && res.slots) {
        setSlots(res.slots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate, selectedTime);
  }, [room?.id]);

  const handleDateChange = (newDate) => {
    const prevDate = selectedDate;
    setSelectedDate(newDate);

    // INTENTIONAL BACKEND BUG: site052-SEC-436
    // Bug: When changing date, selectedTime is NOT reset to empty!
    // Stale slot selection remains active across new dates.
    // setSelectedTime(''); <-- Intentionally omitted to retain previous slot state

    fetchAvailability(newDate, selectedTime);
  };

  const handleTimeSlotClick = (time) => {
    setSelectedTime(time);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const timeToBook = selectedTime || '10:00';

    setSubmitting(true);
    try {
      const startHour = parseInt(timeToBook.split(':')[0], 10);
      const endHour = startHour + 2;
      const endTime = `${String(endHour).padStart(2, '0')}:00`;

      const res = await api.createBooking({
        roomId: room.id,
        date: selectedDate,
        startTime: timeToBook,
        endTime,
        attendees,
        memo: memo || '업무 및 미팅 이용'
      });

      if (showToast) showToast('예약이 성공적으로 완료되었습니다!', 'success');
      if (onBookingSuccess) onBookingSuccess(res.booking);
    } catch (err) {
      if (showToast) showToast(err.message || '예약 처리에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-panel">
      <div className="panel-title">
        <span>빠른 공간 예약</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--indigo-600)', fontWeight: '600' }}>
          실시간 예약 가능
        </span>
      </div>

      <form onSubmit={handleBookingSubmit}>
        {/* Date Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--navy-600)', marginBottom: '8px' }}>
            이용 날짜 선택
          </label>
          <div className="date-selector-tabs">
            {availableDates.map(d => (
              <button
                type="button"
                key={d.value}
                className={`date-tab-btn ${selectedDate === d.value ? 'active' : ''}`}
                onClick={() => handleDateChange(d.value)}
              >
                <span>{d.label.split(' ')[0]}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{d.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--navy-600)' }}>
              시작 시간 선택 (기본 2시간 이용)
            </label>
            {selectedTime && (
              <span style={{ fontSize: '0.8rem', color: 'var(--indigo-600)', fontWeight: '700' }}>
                선택: {selectedTime}
              </span>
            )}
          </div>

          {loadingSlots ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--navy-500)', fontSize: '0.9rem' }}>
              슬롯 상태 확인 중...
            </div>
          ) : (
            <div className="time-slots-grid">
              {slots.map(slot => (
                <button
                  type="button"
                  key={slot.time}
                  disabled={!slot.available}
                  className={`time-slot-btn ${selectedTime === slot.time ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotClick(slot.time)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendees */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--navy-600)', marginBottom: '6px' }}>
            이용 인원
          </label>
          <select
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: '#f8fafc',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            {Array.from({ length: room?.capacity || 1 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                {num}명 (최대 {room?.capacity}명)
              </option>
            ))}
          </select>
        </div>

        {/* Memo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--navy-600)', marginBottom: '6px' }}>
            예약 메모 (이용 목적)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 클라이언트 프레젠테이션 미팅"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: '#f8fafc',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          disabled={submitting}
        >
          {submitting ? '예약 처리 중...' : '예약하기'}
        </button>
      </form>
    </div>
  );
}
