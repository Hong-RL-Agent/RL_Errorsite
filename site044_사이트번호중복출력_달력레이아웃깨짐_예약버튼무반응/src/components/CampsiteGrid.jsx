import React from 'react';
import CampsiteCard from './CampsiteCard';

const CampsiteGrid = ({ campsites, onSelect, onReserve }) => {
  return (
    <div className="campsite-grid">
      {campsites.map(c => (
        <CampsiteCard 
          key={c.id} 
          campsite={c} 
          onSelect={onSelect} 
          onReserve={onReserve}
        />
      ))}
      {campsites.length === 0 && (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#999' }}>
          조건에 맞는 캠핑장이 없습니다.
        </div>
      )}
    </div>
  );
};

export default CampsiteGrid;
