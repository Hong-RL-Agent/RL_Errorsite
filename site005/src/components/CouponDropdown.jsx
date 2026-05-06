import React, { useState } from 'react';
import { Ticket, ChevronDown, ChevronUp } from 'lucide-react';

export default function CouponDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="coupon-widget">
      <div className="coupon-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ticket size={20} />
          내 사용 가능 쿠폰 3장
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>
        최대 5,000원 할인 혜택 놓치지 마세요!
      </p>

      {isOpen && (
        <div className="coupon-dropdown" data-bug-id="site005-bug03">
          <div className="coupon-item">
            <span style={{ fontWeight: 600 }}>신규 가입 5,000원 할인</span>
            <span style={{ color: 'var(--primary)' }}>적용</span>
          </div>
          <div className="coupon-item">
            <span style={{ fontWeight: 600 }}>비오는 날 3,000원 할인</span>
            <span style={{ color: 'var(--primary)' }}>적용</span>
          </div>
          <div className="coupon-item">
            <span style={{ fontWeight: 600 }}>단골 쿠폰 2,000원 할인</span>
            <span style={{ color: 'var(--primary)' }}>적용</span>
          </div>
        </div>
      )}
    </div>
  );
}
