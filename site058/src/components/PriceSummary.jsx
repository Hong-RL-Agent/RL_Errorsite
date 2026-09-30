import React from 'react';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function PriceSummary({ items = [], totalCount = 0, totalPrice = 0 }) {
  const deliveryFee = totalPrice >= 15000 || totalPrice === 0 ? 0 : 3000;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
        예상 결제 금액
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span>선택 세탁물 ({totalCount}개)</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{totalPrice.toLocaleString()}원</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={15} /> 왕복 수거·배송비
          </span>
          <span style={{ fontWeight: 700, color: deliveryFee === 0 ? '#16a34a' : '#0f172a' }}>
            {deliveryFee === 0 ? '무료 (15,000원 이상)' : `${deliveryFee.toLocaleString()}원`}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={15} /> 안심 훼손·분실 보상 보험
          </span>
          <span style={{ fontWeight: 700, color: '#16a34a' }}>전액 무료 포함</span>
        </div>
      </div>

      <div style={{ height: '1px', background: '#f1f5f9', margin: '14px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>최종 결제 예상액</span>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a' }}>
          {finalTotal.toLocaleString()}<span style={{ fontSize: '1rem', fontWeight: 700 }}>원</span>
        </div>
      </div>
    </div>
  );
}
