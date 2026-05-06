import React from 'react';

function BookingSummary({ selectedCar, insuranceSummary, pickupDate, returnDate, pickupLocation }) {
  const calcDays = () => {
    if (!pickupDate || !returnDate) return 1;
    const diff = new Date(returnDate) - new Date(pickupDate);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const days = calcDays();
  const carTotal = selectedCar ? selectedCar.dailyRate * days : 0;

  // INTENTIONAL GUI BUG: site028-bug01
  // Type: selected-option-summary-mismatch
  // Description: 보험 옵션 선택 state와 예약 요약 state가 분리되어 선택값이 요약에 반영되지 않음.
  const insTotal = insuranceSummary.price * days;
  const grandTotal = carTotal + insTotal;

  return (
    <aside className="booking-summary-panel" data-bug-id="site028-bug02">
      <div className="summary-header">
        <h3>예약 요약</h3>
        {selectedCar && (
          <span className="summary-car-badge">{selectedCar.type}</span>
        )}
      </div>

      <div className="summary-block">
        <h4 className="summary-block-title">선택 차량</h4>
        {selectedCar ? (
          <div className="summary-car-info">
            <div className="summary-car-name">{selectedCar.model}</div>
            <div className="summary-car-sub">{selectedCar.brand} · {selectedCar.fuel}</div>
            <div className="summary-car-rate">₩{selectedCar.dailyRate.toLocaleString()} / 일</div>
          </div>
        ) : (
          <div className="summary-empty-hint">
            <span>🚗</span> 차량을 선택해주세요
          </div>
        )}
      </div>

      <div className="summary-block">
        <h4 className="summary-block-title">대여 정보</h4>
        <div className="summary-detail-list">
          <div className="summary-detail-row">
            <span>픽업 장소</span>
            <span>{pickupLocation || '—'}</span>
          </div>
          <div className="summary-detail-row">
            <span>픽업 날짜</span>
            <span>{pickupDate || '—'}</span>
          </div>
          <div className="summary-detail-row">
            <span>반납 날짜</span>
            <span>{returnDate || '—'}</span>
          </div>
          <div className="summary-detail-row">
            <span>대여 기간</span>
            <span className="summary-days">{days}일</span>
          </div>
        </div>
      </div>

      <div className="summary-block">
        <h4 className="summary-block-title">보험</h4>
        {/* INTENTIONAL GUI BUG: site028-bug01
            Type: selected-option-summary-mismatch
            Description: 보험 옵션 선택 state와 예약 요약 state가 분리되어 선택값이 요약에 반영되지 않음. */}
        <div className="summary-insurance-row" data-bug-id="site028-bug01">
          <div className="summary-ins-name">{insuranceSummary.name}</div>
          <div className="summary-ins-price">
            {insuranceSummary.price === 0
              ? '무료'
              : `+₩${insuranceSummary.price.toLocaleString()}/일`}
          </div>
        </div>
      </div>

      <div className="summary-total-block">
        <div className="total-row">
          <span>차량 요금</span>
          <span>₩{carTotal.toLocaleString()}</span>
        </div>
        <div className="total-row">
          <span>보험료</span>
          <span>₩{insTotal.toLocaleString()}</span>
        </div>
        <div className="total-row grand">
          <span>총 예약금</span>
          <span>₩{grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <button
        className={`btn-confirm-booking ${!selectedCar ? 'inactive' : ''}`}
        disabled={!selectedCar}
        onClick={() => selectedCar && alert('준비중입니다.')}
      >
        {selectedCar ? '예약 확정하기 →' : '차량을 먼저 선택해주세요'}
      </button>

      <p className="summary-note">
        * 최종 요금은 차량 수령 시 확인됩니다
      </p>
    </aside>
  );
}

export default BookingSummary;