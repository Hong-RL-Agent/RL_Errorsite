import React, { useState } from 'react';

export default function ScheduleSelector({ schedules = [], onSelectSchedule, onBackToDetail }) {
  const [selectedDate, setSelectedDate] = useState(schedules[0]?.date || '');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  // Group schedules by date
  const dateGroups = schedules.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {});

  const dates = Object.keys(dateGroups).sort();
  const currentSlots = dateGroups[selectedDate] || [];

  const handleSelectSlot = (slot) => {
    setSelectedScheduleId(slot.id);
  };

  const handleProceed = () => {
    if (!selectedScheduleId) {
      alert('관람하실 회차 시간을 선택해주세요.');
      return;
    }
    const chosenSlot = schedules.find((s) => s.id === selectedScheduleId);
    if (onSelectSchedule) onSelectSchedule(chosenSlot);
  };

  return (
    <div className="schedule-selector-container">
      <div className="schedule-header">
        <button className="btn-back" onClick={onBackToDetail}>
          ← 공연 상세로 돌아가기
        </button>
        <div className="schedule-header-text">
          <h2 className="schedule-title">📅 관람일 및 회차 선택</h2>
          <p className="schedule-subtitle">원하시는 날짜와 회차를 선택하시면 좌석 예매 단계로 이동합니다.</p>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="empty-schedule-state">
          <p>현재 예매 가능한 회차 정보가 없습니다.</p>
        </div>
      ) : (
        <div className="schedule-selection-layout">
          {/* Date Column */}
          <div className="date-picker-box">
            <h3 className="box-title">1. 관람 날짜 선택</h3>
            <div className="date-button-list">
              {dates.map((d) => (
                <button
                  key={d}
                  className={`date-select-btn ${selectedDate === d ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDate(d);
                    setSelectedScheduleId('');
                  }}
                >
                  <span className="date-text">📅 {d}</span>
                  <span className="slots-count">{dateGroups[d].length}개 회차 오픈</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Column */}
          <div className="slot-picker-box">
            <h3 className="box-title">2. 공연 회차(시간) 선택</h3>
            <div className="time-slot-list">
              {currentSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`time-slot-card ${selectedScheduleId === slot.id ? 'active' : ''} ${!slot.available ? 'disabled' : ''}`}
                  onClick={() => slot.available && handleSelectSlot(slot)}
                >
                  <div className="slot-time-info">
                    <span className="slot-time">⏰ {slot.startTime} ~ {slot.endTime}</span>
                    <span className={`slot-availability ${slot.available ? 'avail' : 'sold'}`}>
                      {slot.available ? '🟢 예매 가능' : '🔴 매진'}
                    </span>
                  </div>
                  <div className="slot-select-action">
                    {selectedScheduleId === slot.id ? '✓ 선택됨' : '선택'}
                  </div>
                </div>
              ))}
            </div>

            <div className="schedule-confirm-footer">
              <button
                className="btn-proceed-seats"
                disabled={!selectedScheduleId}
                onClick={handleProceed}
              >
                🪑 좌석 배치도 및 좌석 선택하기 →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
