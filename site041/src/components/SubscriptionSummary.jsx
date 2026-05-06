import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';

const SubscriptionSummary = ({ selectedBox, frequency, giftWrap }) => {
  // INTENTIONAL GUI BUG: site041-bug01
  // Type: subscription-option-summary-mismatch
  // Description: 구독 요약 패널이 초기 배송 주기만 내부 state로 저장해 이후 옵션 변경을 반영하지 않음.
  // We use internal state initialized from props but never update it via useEffect or direct render.
  const [internalFrequency] = useState(frequency); 

  const boxPrice = selectedBox ? selectedBox.price : 0;
  const giftPrice = giftWrap ? 3000 : 0;
  const total = boxPrice + giftPrice;

  return (
    <div className="summary-panel">
      <h3 className="summary-title">Subscription Summary</h3>
      
      <div className="summary-row">
        <span className="summary-label">Selected Box</span>
        <span className="summary-value">{selectedBox ? selectedBox.name : '-'}</span>
      </div>
      
      <div className="summary-row" data-bug-id="site041-bug01">
        <span className="summary-label">Frequency</span>
        <span className="summary-value bug-summary-val">{internalFrequency || '-'}</span>
      </div>
      
      <div className="summary-row">
        <span className="summary-label">Gift Wrap</span>
        <span className="summary-value">{giftWrap ? 'Added' : 'No'}</span>
      </div>

      <div className="summary-total">
        <span>Total</span>
        <span>₩ {total.toLocaleString()}</span>
      </div>

      <button 
        className="btn-primary" 
        style={{ width: '100%', marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
        disabled={!selectedBox}
        onClick={() => alert('Proceeding to payment.')}
      >
        <CreditCard size={20} /> START NOW <ArrowRight size={20} />
      </button>

      <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        * You can cancel or pause anytime.
      </p>
    </div>
  );
};

export default SubscriptionSummary;
