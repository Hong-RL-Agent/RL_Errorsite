import React from 'react';

export default function MenuCard({ menu, onAdd }) {
  const [qty, setQty] = React.useState(1);

  return (
    <div className="menu-item-card">
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {menu.popular && <span style={{ fontSize: '10px', background: 'var(--primary)', color: 'white', padding: '2px 5px', borderRadius: '4px' }}>BEST</span>}
          <div style={{ fontWeight: 700, fontSize: '16px' }}>{menu.name}</div>
        </div>
        <div style={{ fontSize: '15px', marginTop: '5px', color: '#444' }}>{menu.price.toLocaleString()}원</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
          {/* INTENTIONAL GUI BUG: site025-bug01
             Type: too-small-click-target
             Description: 데스크톱 메뉴 수량 조절 버튼의 클릭 영역이 지나치게 작아 사용하기 어려움.
          */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }} data-bug-id="site025-bug01">
            <button className="qty-btn-minimal" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '15px', textAlign: 'center' }}>{qty}</span>
            <button className="qty-btn-minimal" onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button 
            className="btn btn-dark" 
            style={{ padding: '6px 15px', fontSize: '13px' }}
            onClick={() => onAdd(menu, qty)}
          >
            장바구니 담기
          </button>
        </div>
      </div>
      <img src={menu.image} alt={menu.name} style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover', marginLeft: '20px' }} />
    </div>
  );
}
