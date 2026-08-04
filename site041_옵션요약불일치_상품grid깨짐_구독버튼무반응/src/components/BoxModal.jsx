import React from 'react';
import { X, Check } from 'lucide-react';

const BoxModal = ({ box, onClose, onSelect }) => {
  if (!box) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', width: '600px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', borderRadius: '50%', padding: '5px' }}
        >
          <X size={24} />
        </button>
        <img src={box.image} alt={box.name} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
        <div style={{ padding: '40px' }}>
          <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '10px' }}>{box.category.toUpperCase()}</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontFamily: 'var(--font-serif)' }}>{box.name}</h2>
          <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.8' }}>
            이 박스는 일상 속에 작은 쉼표를 찍어주는 아이템들로 구성되어 있습니다. 
            전문 큐레이터가 엄선한 {box.itemCount}가지 상품들을 통해 매달 새로운 감성을 경험해보세요.
          </p>
          
          <h4 style={{ marginBottom: '15px' }}>What's Inside:</h4>
          <ul style={{ listStyle: 'none', marginBottom: '40px' }}>
            {box.options.map(opt => (
              <li key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.9rem' }}>
                <Check size={16} color="var(--primary)" /> {opt}
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>₩ {box.price.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: '400', color: '#888' }}>/ month</span></div>
            <button className="btn-primary" onClick={() => { onSelect(box); onClose(); }}>구독 시작하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxModal;
