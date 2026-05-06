import { useState } from 'react';

export default function BookingSummary({ selectedService, selectedStylist, selectedDate, selectedTime }) {
  const [stylist] = useState(selectedStylist);

  return (
    <div className="summary-card">
      <div className="summary-header">
        <span>예약 요약</span>
        <h4>빠른 확인</h4>
      </div>
      <div className="summary-item">
        <strong>시술</strong>
        <span>{selectedService?.name}</span>
      </div>
      <div className="summary-item">
        <strong>스타일리스트</strong>
        <span data-bug-id="site045-bug01">{stylist?.name}</span>
      </div>
      <div className="summary-item">
        <strong>예약 일시</strong>
        <span>{`${selectedDate} · ${selectedTime}`}</span>
      </div>
      <div className="summary-item total">
        <strong>가격</strong>
        <span>{selectedService?.price}</span>
      </div>
      <button type="button" className="summary-action">예약 확인하기</button>
    </div>
  );
}
