import React from 'react';

export default function PaymentSummary({ movie, time, selectedSeats }) {
  if (!movie) return null;

  const PRICE_PER_SEAT = 15000;
  
  // INTENTIONAL GUI BUG: site008-bug01
  // Type: state-mismatch
  // Description: 선택한 좌석 수와 결제 요약의 좌석 수가 다르게 표시된다.
  // Explanation: displaySeatCount를 실제 length + 1 (혹은 고정된 오차)로 계산하여 상태 불일치 유발.
  const actualSeatCount = selectedSeats.length;
  const displaySeatCount = actualSeatCount > 0 ? actualSeatCount + 1 : 0; 
  
  const totalPrice = actualSeatCount * PRICE_PER_SEAT;

  return (
    <div className="payment-panel">
      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>예매 정보</div>
      
      <div className="summary-row">
        <span className="summary-label">영화</span>
        <span className="summary-val">{movie.title}</span>
      </div>
      
      <div className="summary-row">
        <span className="summary-label">상영 시간</span>
        <span className="summary-val">{time || '-'}</span>
      </div>
      
      <div className="summary-row">
        <span className="summary-label">선택 좌석</span>
        <span className="summary-val" style={{ maxWidth: '150px', wordBreak: 'break-all' }}>
          {selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}
        </span>
      </div>
      
      <div className="summary-row">
        <span className="summary-label">인원 (성인)</span>
        <span className="summary-val" data-bug-id="site008-bug01">
          {displaySeatCount}명
        </span>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span className="summary-label" style={{ color: 'var(--text-main)' }}>최종 결제 금액</span>
        <span className="total-price">{totalPrice.toLocaleString()}원</span>
      </div>

      {/* INTENTIONAL GUI BUG: site008-bug02
         Type: button-no-response
         Description: “결제하기” 버튼이 클릭되어도 결제 단계로 이동하지 않는다.
         Explanation: onClick 이벤트를 처리하지 않는 빈 함수로 설정. */}
      <button 
        className="btn-checkout" 
        data-bug-id="site008-bug02"
        disabled={actualSeatCount === 0}
        onClick={() => {}}
      >
        결제하기
      </button>
    </div>
  );
}
