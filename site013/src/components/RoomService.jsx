import React from 'react';

function RoomService({ items, onOrder }) {
  return (
    <div className="menu-grid">
      {items.map(item => (
        <div key={item.id} className="menu-card">
          <div className="menu-name">{item.name}</div>
          <div className="menu-price">₩ {item.price.toLocaleString()}</div>
          
          {/* INTENTIONAL GUI BUG: site013-bug01
              Type: button-no-response
              Description: 주문 버튼이 눌려도 장바구니에 추가되지 않도록 핸들러를 연결하지 않음.
          */}
          <button 
            className="btn-order"
            data-bug-id="site013-bug01"
            // onClick={() => onOrder(item)} // Intentionally omitted
          >
            ORDER
          </button>
        </div>
      ))}
    </div>
  );
}

export default RoomService;
