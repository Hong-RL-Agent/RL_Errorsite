import React, { useState } from 'react';

export default function TicketModal({ reservation, seats, onClose, onConfirm }) {
  const [targetSeatNo, setTargetSeatNo] = useState(reservation?.seatNo || 'VIP-A1');

  if (!reservation) return null;

  const handleSave = () => {
    onConfirm(reservation.id, targetSeatNo);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🎫 좌석 변경 확인 모달</h3>
        <p>예매 번호: <strong>{reservation.id}</strong></p>
        <p>공연명: {reservation.showTitle}</p>
        <p>현재 예매자: {reservation.userName}</p>

        <div className="form-group">
          <label>이동할 새 좌석 선택:</label>
          <select value={targetSeatNo} onChange={(e) => setTargetSeatNo(e.target.value)}>
            {seats.map(s => (
              <option key={s.id} value={s.seatNo}>{s.seatNo} ({s.grade}등급 - {s.price.toLocaleString()}원)</option>
            ))}
          </select>
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            좌석 변경 확정
          </button>
        </div>
      </div>
    </div>
  );
}
