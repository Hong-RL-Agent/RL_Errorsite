import React from 'react';
import { Clock, Tag } from 'lucide-react';

const PackageCard = ({ pkg, onSelect, onOpenDetails }) => {
  // INTENTIONAL GUI BUG: site040-bug03
  // Type: package-select-button-no-response
  // Description: 특정 추천 패키지(id: 1) 선택 버튼에 예약 요약 state 변경 handler를 연결하지 않아 클릭해도 반영되지 않음.
  const isBugged = pkg.id === 1;

  return (
    <div className="package-card">
      <div style={{ position: 'relative' }}>
        <img src={pkg.image} alt={pkg.name} className="package-img" />
        {pkg.recommended && (
          <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--secondary)', color: 'white', padding: '5px 12px', fontSize: '0.7rem', fontWeight: '700' }}>
            RECOMMENDED
          </div>
        )}
      </div>
      <div className="package-content">
        <div className="package-cat">{pkg.category}</div>
        <h3 className="package-name">{pkg.name}</h3>
        <div className="package-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16} /> {pkg.duration}</span>
          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>₩ {pkg.price.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, fontSize: '0.75rem' }}
            data-bug-id={isBugged ? "site040-bug03" : undefined}
            onClick={() => {
              if (isBugged) {
                console.log('Package select button clicked but handler missing (Bug 03)');
              } else {
                onSelect(pkg);
              }
            }}
          >
            SELECT
          </button>
          <button 
            className="btn btn-outline" 
            style={{ flex: 1, fontSize: '0.75rem' }}
            onClick={() => onOpenDetails(pkg)}
          >
            DETAILS
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
