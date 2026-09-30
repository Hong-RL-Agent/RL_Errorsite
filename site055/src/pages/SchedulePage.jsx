import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import ScheduleSelector from '../components/ScheduleSelector';
import SeatMap from '../components/SeatMap';

export default function SchedulePage({ eventId, onBackToDetail, onBookingSuccess }) {
  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [currentStep, setCurrentStep] = useState('schedule'); // 'schedule' | 'seats' | 'confirmed'
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    loadScheduleData();
  }, [eventId]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const [evtData, schData] = await Promise.all([
        api.getEventById(eventId),
        api.getEventSchedules(eventId)
      ]);

      if (evtData && evtData.event) {
        setEvent(evtData.event);
      }
      if (schData && schData.schedules) {
        setSchedules(schData.schedules);
      }
    } catch (err) {
      console.error('Failed to load schedules', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScheduleSlot = (slot) => {
    setSelectedSchedule(slot);
    setCurrentStep('seats');
  };

  const handleCompleteBooking = (bookingData) => {
    setConfirmedBooking({
      event,
      schedule: bookingData.schedule,
      seat: bookingData.seat,
      bookingNumber: 'CP-' + Date.now().toString().slice(-6)
    });
    setCurrentStep('confirmed');
    if (onBookingSuccess) onBookingSuccess(bookingData);
  };

  if (loading) {
    return <div className="page-loading-spinner">예매 일정을 불러오는 중입니다...</div>;
  }

  return (
    <div className="schedule-page-wrapper">
      {event && (
        <div className="ticketing-event-summary-bar">
          <img src={event.poster} alt={event.title} className="summary-bar-poster" />
          <div className="summary-bar-text">
            <span className="summary-badge">{event.category}</span>
            <h2 className="summary-title">{event.title}</h2>
            <p className="summary-venue">📍 {event.venueName}</p>
          </div>
        </div>
      )}

      {currentStep === 'schedule' && (
        <ScheduleSelector
          schedules={schedules}
          onSelectSchedule={handleSelectScheduleSlot}
          onBackToDetail={onBackToDetail}
        />
      )}

      {currentStep === 'seats' && selectedSchedule && (
        <SeatMap
          schedule={selectedSchedule}
          onBackToSchedule={() => setCurrentStep('schedule')}
          onCompleteBooking={handleCompleteBooking}
        />
      )}

      {currentStep === 'confirmed' && confirmedBooking && (
        <div className="booking-confirmed-card">
          <div className="confirmed-icon">🎉</div>
          <h2 className="confirmed-title">예매가 완료되었습니다!</h2>
          <p className="confirmed-subtitle">실제 결제는 진행되지 않는 Mock 예매 완료 상태입니다.</p>

          <div className="confirmed-ticket-box">
            <div className="ticket-header">
              <span className="ticket-brand">CulturePick E-Ticket</span>
              <span className="ticket-num">예매번호: {confirmedBooking.bookingNumber}</span>
            </div>

            <div className="ticket-body">
              <h3 className="ticket-event-title">{confirmedBooking.event.title}</h3>
              <p>📍 공연장: {confirmedBooking.event.venueName}</p>
              <p>📅 관람일시: {confirmedBooking.schedule.date} {confirmedBooking.schedule.startTime}</p>
              <p>🪑 좌석: {confirmedBooking.seat.displayCode} ({confirmedBooking.seat.grade}석)</p>
              <p>💳 티켓금액: ₩{confirmedBooking.seat.price?.toLocaleString()}</p>
            </div>
          </div>

          <div className="confirmed-actions">
            <button className="btn-primary" onClick={onBackToDetail}>
              공연 상세로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
