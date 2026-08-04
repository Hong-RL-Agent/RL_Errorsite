import React from 'react';
import { Tag } from 'lucide-react';

export default function CouponPanel() {
  const [coupons, setCoupons] = React.useState([
    { id: 1, title: "첫 주문 할인 5,000원", code: "WELCOME5" },
    { id: 2, title: "주말 배달비 무료", code: "WEEKEND" }
  ]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Tag size={16} color="var(--secondary)" />
        <span style={{ fontSize: '13px', fontWeight: 700 }}>적용 가능한 쿠폰 ({coupons.length})</span>
      </div>
      
      <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>* 쿠폰 제거는 왼쪽으로 드래그하세요.</p>

      {/* INTENTIONAL GUI BUG: site025-bug03
         Type: gesture-only-action
         Description: 쿠폰 삭제를 드래그 제스처로만 제공하고 버튼/키보드 대체 수단을 제공하지 않음.
      */}
      <div data-bug-id="site025-bug03">
        {coupons.map(coupon => (
          <div 
            key={coupon.id} 
            className="coupon-drag-area"
            onDragEnd={() => {
              if (window.confirm('쿠폰을 제거하시겠습니까?')) {
                setCoupons(coupons.filter(c => c.id !== coupon.id));
              }
            }}
            draggable
          >
            <p>{coupon.title}</p>
            <span>{coupon.code}</span>
            {/* Missing: <button>제거</button> */}
          </div>
        ))}
      </div>
    </div>
  );
}
