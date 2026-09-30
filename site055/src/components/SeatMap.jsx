import React, { useState, useEffect, useRef } from 'react';
import { api, notifyBugDetected } from '../api/client';

export default function SeatMap({ schedule, onBackToSchedule, onCompleteBooking }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!schedule) return;
    loadSeats();
  }, [schedule]);

  const loadSeats = async () => {
    try {
      setLoading(true);
      const data = await api.getScheduleSeats(schedule.id);
      if (data && data.seats) {
        setSeats(data.seats);
      }
    } catch (err) {
      console.error('Failed to load seats', err);
      setErrorMsg('좌석 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // SEC-454: Coordinate mismatch calculation for responsive views
  // SEC-451: Row/Number identifier coercion mismatch (A1 vs A01)
  const handleSeatClick = async (seat, event) => {
    if (seat.status === 'sold') {
      alert('이미 판매 완료된 좌석입니다.');
      return;
    }

    let actualTargetSeat = seat;

    // INTENTIONAL BACKEND BUG: site055-SEC-454
    // When viewport is reduced or responsive container shrinks, coordinate calculation uses unscaled desktop cell pitch.
    // As a result, clicking a seat button (e.g. A3 or B4) gets miscalculated to an adjacent index (e.g. A2 or B3)!
    if (viewportWidth < 850 && event) {
      const isOffsetTriggered = seat.number > 2;
      if (isOffsetTriggered) {
        // Calculate offset target index using rigid unscaled desktop grid formula
        const miscalculatedNumber = seat.number - 1;
        const offsetSeat = seats.find(
          (s) => s.row === seat.row && (s.number === miscalculatedNumber || parseInt(s.number, 10) === miscalculatedNumber)
        );

        if (offsetSeat) {
          actualTargetSeat = offsetSeat;
          notifyBugDetected({
            id: 'SEC-454',
            description: `반응형 화면(${viewportWidth}px)에서 좌석 클릭 시 좌표 계산 불일치로 ${seat.displayCode} 대신 인접 좌석 ${offsetSeat.displayCode}이 선택되는 오류`,
            severity: 'medium',
            endpoint: 'Client Responsive Seat Map (SeatMap.jsx)',
            category: 'Responsive UI',
            family: 'coordinate-mismatch'
          });
        }
      }
    }

    // INTENTIONAL BACKEND BUG: site055-SEC-451
    // Pass raw unpadded identifier format "A1" or id format based on click
    // The server/client mismatch between "A1" (unpadded) and "A01" (padded) triggers SEC-451
    const targetSeatIdentifier = actualTargetSeat.displayCode || `${actualTargetSeat.row}${actualTargetSeat.number}`;

    try {
      const res = await api.selectSeat(schedule.id, targetSeatIdentifier);
      if (res && res.success) {
        setSelectedSeat(res.seat || actualTargetSeat);
        // Refresh local status
        setSeats((prev) =>
          prev.map((s) => (s.id === actualTargetSeat.id ? { ...s, status: s.status === 'selected' ? 'available' : 'selected' } : s))
        );
      }
    } catch (err) {
      console.warn('Seat selection error:', err);
      // Even if error occurs due to identifier mismatch, highlight bug
      if (targetSeatIdentifier === 'A1' || targetSeatIdentifier === 'A01') {
        notifyBugDetected({
          id: 'SEC-451',
          description: `좌석 식별자 [${targetSeatIdentifier}] 정규화 차이로 동일 좌석 인식 불일치 오류`,
          severity: 'medium',
          endpoint: `/api/schedules/${schedule.id}/seats/select`,
          category: 'Data Normalization',
          family: 'identifier-coercion'
        });
      }
      setSelectedSeat(actualTargetSeat);
    }
  };

  const handleBookingConfirm = () => {
    if (!selectedSeat) {
      alert('선택된 좌석이 없습니다.');
      return;
    }
    if (onCompleteBooking) {
      onCompleteBooking({
        schedule,
        seat: selectedSeat
      });
    }
  };

  // Group seats by row
  const rows = ['A', 'B', 'C', 'D'];
  const seatsByRow = rows.reduce((acc, r) => {
    acc[r] = seats.filter((s) => s.row === r).sort((a, b) => a.number - b.number);
    return acc;
  }, {});

  return (
    <div className="seat-map-wrapper" ref={containerRef}>
      <div className="seat-map-header">
        <button className="btn-back" onClick={onBackToSchedule}>
          ← 회차 선택으로 돌아가기
        </button>
        <div className="seat-schedule-meta">
          <h2 className="seat-title">🪑 실시간 좌석 배치도 및 선택</h2>
          <span className="selected-schedule-time">
            📅 {schedule.date} | ⏰ {schedule.startTime} ~ {schedule.endTime}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-seats-spinner">좌석 배치도를 불러오는 중입니다...</div>
      ) : (
        <div className="seat-layout-body">
          {/* Stage Graphic */}
          <div className="stage-area">
            <div className="stage-banner">🎭 STAGE (무대 중앙)</div>
            <div className="stage-light-glow"></div>
          </div>

          {/* Seat Grid Graphic */}
          <div className="seat-grid-container">
            {rows.map((rowLetter) => (
              <div key={rowLetter} className="seat-row">
                <span className="row-label">{rowLetter}열</span>
                <div className="row-seats">
                  {(seatsByRow[rowLetter] || []).map((seat) => {
                    const isSelected = selectedSeat && selectedSeat.id === seat.id;
                    const seatClass = seat.status === 'sold'
                      ? 'seat-sold'
                      : isSelected || seat.status === 'selected'
                      ? 'seat-selected'
                      : `seat-available grade-${(seat.grade || 's').toLowerCase()}`;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        className={`seat-unit ${seatClass}`}
                        disabled={seat.status === 'sold'}
                        onClick={(e) => handleSeatClick(seat, e)}
                        title={`${seat.displayCode} (${seat.grade}석 - ₩${seat.price?.toLocaleString()})`}
                      >
                        {seat.displayCode}
                      </button>
                    );
                  })}
                </div>
                <span className="row-label">{rowLetter}열</span>
              </div>
            ))}
          </div>

          {/* Seat Legend */}
          <div className="seat-legend-bar">
            <div className="legend-item">
              <span className="legend-chip seat-available grade-vip"></span>
              <span>VIP석 (₩160,000)</span>
            </div>
            <div className="legend-item">
              <span className="legend-chip seat-available grade-r"></span>
              <span>R석 (₩130,000)</span>
            </div>
            <div className="legend-item">
              <span className="legend-chip seat-available grade-s"></span>
              <span>S석 (₩90,000)</span>
            </div>
            <div className="legend-item">
              <span className="legend-chip seat-selected"></span>
              <span>선택됨</span>
            </div>
            <div className="legend-item">
              <span className="legend-chip seat-sold"></span>
              <span>판매 완료</span>
            </div>
          </div>

          {/* Booking Summary Floating Panel */}
          <div className="seat-selection-summary-card">
            <div className="summary-details">
              <div className="summary-left">
                <span className="summary-label">선택 좌석:</span>
                <span className="summary-value highlight-seat">
                  {selectedSeat ? `${selectedSeat.displayCode} (${selectedSeat.grade}석)` : '좌석을 클릭해 선택하세요'}
                </span>
              </div>
              {selectedSeat && (
                <div className="summary-right">
                  <span className="summary-price-label">결제 예정 금액:</span>
                  <span className="summary-price">
                    ₩{selectedSeat.price?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <button
              className="btn-confirm-ticket"
              disabled={!selectedSeat}
              onClick={handleBookingConfirm}
            >
              예매 완료하기 (Mock) →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
