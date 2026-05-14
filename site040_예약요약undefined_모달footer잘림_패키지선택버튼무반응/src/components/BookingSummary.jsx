import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';

const BookingSummary = ({ selectedPackage, selectedTherapist, selectedDate, selectedTime }) => {
  return (
    <div className="summary-panel">
      <h3 className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShoppingBag size={20} /> 예약 확인
      </h3>
      
      <div className="summary-item">
        <span className="summary-label">패키지</span>
        <span className="summary-value">{selectedPackage?.name || '-'}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">테라피스트</span>
        <span className="summary-value">{selectedTherapist?.name || '-'}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">예약 일시</span>
        <span className="summary-value">
          {selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : '-'}
        </span>
      </div>

      {/* 
        INTENTIONAL GUI BUG: site040-bug01
        Type: booking-summary-undefined
        Description: 선택한 패키지의 addOnLabel이 없을 때 fallback 없이 렌더링해 undefined가 표시됨.
      */}
      {selectedPackage && (
        <div className="buggy-option" data-bug-id="site040-bug01">
          + 옵션: {selectedPackage.addOnLabel}
        </div>
      )}

      <div className="total-row">
        <span>TOTAL</span>
        <span>₩ {(selectedPackage?.price || 0).toLocaleString()}</span>
      </div>

      <button 
        className="btn btn-secondary" 
        style={{ width: '100%', marginTop: '40px', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
        disabled={!selectedPackage || !selectedDate || !selectedTime}
        onClick={() => alert('예약이 확정되었습니다. 결제 페이지로 이동합니다.')}
      >
        RESERVE NOW <ChevronRight size={18} />
      </button>
      
      <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        * 예약 24시간 전까지 취소가 가능합니다.
      </p>
    </div>
  );
};

export default BookingSummary;
