import React from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import CouponPanel from './CouponPanel';

export default function CartSummaryPanel({ items, onRemove }) {
  const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = items.length > 0 ? 3000 : 0;

  return (
    <div className="cart-summary-panel" data-bug-id="site025-bug02">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
        <ShoppingCart size={20} color="var(--primary)" />
        <h2 style={{ margin: 0, fontSize: '18px' }}>주문 요약</h2>
      </div>

      <div className="cart-items-scroll">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: '14px' }}>담긴 메뉴가 없습니다.</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{item.qty}개 x {item.price.toLocaleString()}원</div>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ color: '#ccc', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          ))
        )}
        
        {/* Force some extra height to demonstrate overflow bug */}
        {items.length > 3 && (
          <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
            장바구니 상세 약관 및 배달 유의사항 안내...
            <br/><br/>
            추가 메뉴를 선택하시면 이곳에 표시됩니다. 데스크톱 최적화 레이아웃을 통해 한눈에 주문 정보를 확인하세요.
          </div>
        )}
      </div>

      <div className="cart-footer-fixed">
        <CouponPanel />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
          <span>주문 금액</span>
          <span>{total.toLocaleString()}원</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '15px' }}>
          <span>배달비</span>
          <span>{deliveryFee.toLocaleString()}원</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px' }}>
          <span>총 결제금액</span>
          <span>{(total + deliveryFee).toLocaleString()}원</span>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: '15px' }} onClick={() => alert('결제 단계로 이동합니다.')}>
          {(total + deliveryFee).toLocaleString()}원 결제하기
        </button>
      </div>
    </div>
  );
}
