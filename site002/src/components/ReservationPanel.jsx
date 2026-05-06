import React from 'react';

export default function ReservationPanel({ isOpen, onClose }) {
  return (
    <div className={`reservation-overlay ${isOpen ? 'open' : ''}`}>
      <div className="reservation-panel">
        <div className="panel-header">
          <h2 className="panel-title">예약 요약</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="panel-content">
          <div className="summary-item">
            <span className="label">날짜</span>
            <span className="value">선택되지 않음</span>
          </div>
          <div className="summary-item">
            <span className="label">인원</span>
            <span className="value">성인 1명</span>
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--gray-200)', margin: '24px 0' }} />
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            결제 단계로 넘어가려면 모든 정보를 확인해 주세요.
          </p>
        </div>
        <div className="panel-footer">
          <button className="btn-primary" style={{ width: '100%' }}>결제 진행</button>
        </div>
      </div>
    </div>
  );
}
