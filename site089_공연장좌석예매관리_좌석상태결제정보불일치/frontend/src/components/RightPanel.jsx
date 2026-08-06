import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedReservation,
  setSelectedReservation,
  triggerSeatPurchaserRace,
  seats,
  triggerCancelIssueConflict,
  selectedShow,
  triggerPartialShowSave
}) {
  const [showTime, setShowTime] = useState('');
  const [venue, setVenue] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (selectedShow) {
      setShowTime(selectedShow.time || '19:30');
      setVenue(selectedShow.venue || '');
      setPrice(selectedShow.vipPrice ? selectedShow.vipPrice.toString() : '');
    }
  }, [selectedShow]);

  return (
    <aside className="panel-section operations-sidebar">
      <!-- Seat & Purchaser Race Widget (Error 1 Target) -->
      <div className="detail-widget">
        <h3>🎟️ 좌석 변경 & 예매자 정보 수정</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>예매 ID: <strong>{selectedReservation.id}</strong></p>
            <p>공연명: <strong>{selectedReservation.showTitle}</strong></p>
            <p>현재 예매자: <strong style={{ color: 'var(--color-primary)' }}>{selectedReservation.userName}</strong></p>
            <p>현재 좌석: <strong className="genre-tag">{selectedReservation.seatNo}</strong></p>

            <div className="form-group">
              <label>변경할 예매자 성함:</label>
              <input 
                type="text" 
                value={selectedReservation.userName || ''} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, userName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>변경할 좌석 선택:</label>
              <select 
                value={selectedReservation.seatNo || 'VIP-A1'} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, seatNo: e.target.value })}
              >
                {seats.map(s => (
                  <option key={s.id} value={s.seatNo}>{s.seatNo} ({s.grade}등급 - {s.price.toLocaleString()}원)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <button className="save-btn" onClick={() => triggerSeatPurchaserRace(selectedReservation)}>
                좌석 변경 (Error 1)
              </button>
              <small className="warn-desc">* 좌석 변경(3초 지연 완료) 직후 예매자 수정(0.1초 완료) 시, 3초 뒤 이전 예매자명이 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-res-btn" onClick={() => triggerCancelIssueConflict(selectedReservation)}>
                ⚡ 예매 취소 후 티켓 재발권 (Error 2)
              </button>
              <small className="warn-desc">* 예매 취소(0.5초 완료) 직후 발권(4초 지연 완료) 시, 늦은 발권 요청이 취소된 예매를 다시 발권완료 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 예매 항목을 선택하세요.</div>
        )}
      </div>

      <!-- Show Info Partial Save Widget (Error 8 Target) -->
      <div className="detail-widget">
        <h3>🎭 공연 정보 수정 (Error 8)</h3>
        {selectedShow ? (
          <div className="detail-panel">
            <p>공연명: <strong>{selectedShow.title}</strong></p>
            <div className="form-group">
              <label>공연 시간:</label>
              <input type="text" value={showTime} onChange={(e) => setShowTime(e.target.value)} />
            </div>

            <div className="form-group">
              <label>공연 장소 (부분저장 미반영):</label>
              <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>

            <div className="form-group">
              <label>VIP 좌석 가격:</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialShowSave(selectedShow.id, showTime, venue, parseInt(price || '0'))}
            >
              공연 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 공연 시간/장소/가격을 동시에 수정하면 백엔드에는 장소만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 공연을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
