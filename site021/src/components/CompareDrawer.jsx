import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function CompareDrawer({ isOpen, items, onClose, onRemove }) {
  return (
    <div className={`compare-drawer ${isOpen ? 'open' : 'closed'}`}>
      <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>비교함 ({items.length}/3)</h2>
        <button onClick={onClose}><X /></button>
      </div>

      {items.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>비교할 상품을 추가해주세요.</p>
      ) : (
        <div className="compare-items">
          {items.map(item => (
            <div key={item.id} className="compare-item">
              <img src={item.image} alt={item.name} />
              <div className="compare-item-info">
                <div className="compare-item-name">{item.name}</div>
                <div className="compare-item-price">₩{item.price.toLocaleString()}</div>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ color: '#ff4444' }}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="compare-actions">
        {/* INTENTIONAL GUI BUG: site021-bug03
            Type: hidden-panel-focusable-element
            Description: 닫힌 비교함 패널 내부 버튼이 tab 순서에 남아 키보드 포커스가 이동함. */}
        <button 
          data-bug-id="site021-bug03"
          className="btn btn-primary" 
          disabled={items.length < 2}
          onClick={() => alert('비교 기능을 시작합니다!')}
        >
          선택 상품 비교 시작
        </button>
        <button className="btn btn-outline" style={{ border: '1px solid #ddd' }} onClick={() => alert('준비중입니다.')}>전체 삭제</button>
      </div>
    </div>
  );
}
