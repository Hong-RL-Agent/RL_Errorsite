import React from 'react';
import { Package, Star } from 'lucide-react';

const BoxCard = ({ box, onSelect, onDetails }) => {
  // INTENTIONAL GUI BUG: site041-bug03
  // Type: subscribe-button-no-response
  // Description: 특정 구독 박스의 구독 버튼에 요약 state 변경 handler를 연결하지 않아 클릭해도 반영되지 않음.
  const isBugged = box.id === 1;

  return (
    <div className="box-card">
      <div className="box-img-container">
        <img src={box.image} alt={box.name} className="box-img" />
      </div>
      <div className="box-body">
        <div className="box-cat">{box.category}</div>
        <h3 className="box-name">{box.name}</h3>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
          매달 엄선된 {box.itemCount}가지 아이템으로 구성된 특별한 취향 박스를 만나보세요.
        </p>
        <div className="box-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Package size={16} /> {box.itemCount} items</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Star size={16} color="#ffb400" fill="#ffb400" /> 4.9</span>
        </div>
        <div className="box-footer">
          <div className="box-price">₩ {box.price.toLocaleString()}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              onClick={() => onDetails(box)}
            >
              DETAILS
            </button>
            <button 
              className="btn-primary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              data-bug-id={isBugged ? "site041-bug03" : undefined}
              onClick={() => {
                if (isBugged) {
                  console.warn('Subscription selection skipped due to bug 03');
                } else {
                  onSelect(box);
                }
              }}
            >
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxCard;
