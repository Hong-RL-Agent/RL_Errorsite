import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function CartDrawer({ isOpen, items, onClose, onRemove }) {
  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="cart-drawer">
      <div className="flex justify-between items-center" style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>장바구니</h2>
        <button onClick={onClose}><X /></button>
      </div>

      {/* INTENTIONAL GUI BUG: site025-bug02
         Type: orientation-layout-break
         Description: 가로 방향 화면에서 장바구니 drawer 높이가 넘쳐 결제 버튼이 화면 밖으로 밀림.
      */}
      <div className="cart-content-fixed" data-bug-id="site025-bug02">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>장바구니가 비어있습니다.</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{item.qty}개 x {item.price.toLocaleString()}원</div>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ color: '#999' }}><Trash2 size={18} /></button>
            </div>
          ))
        )}
        
        {/* Placeholder for more content to force overflow */}
        <div style={{ height: '300px', background: '#fcfcfc', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd' }}>
          영수증 상세 영역
        </div>
      </div>

      <div className="cart-footer">
        <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 800, fontSize: '18px' }}>
          <span>총 결제금액</span>
          <span>{total.toLocaleString()}원</span>
        </div>
        <button className="btn btn-primary" onClick={() => alert('결제 단계 준비중입니다.')}>결제하기</button>
      </div>
    </div>
  );
}
