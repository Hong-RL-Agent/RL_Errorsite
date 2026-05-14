import React from 'react';

export default function ProductFilters({ onBrandChange, onPriceChange }) {
  return (
    <aside className="filters">
      <div className="filter-group">
        <h3>브랜드</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {['All', 'TechMaster', 'VisionPlus', 'AudioPro', 'GameZone'].map(brand => (
            <li key={brand} style={{ marginBottom: '10px' }}>
              <label className="flex items-center gap-10" style={{ cursor: 'pointer' }}>
                <input type="radio" name="brand" value={brand} defaultChecked={brand === 'All'} onChange={(e) => onBrandChange(e.target.value)} />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-group">
        <h3>가격 범위</h3>
        <input 
          type="range" 
          min="0" 
          max="2000000" 
          step="100000" 
          style={{ width: '100%' }}
          onChange={(e) => onPriceChange(e.target.value)}
        />
        <div className="flex justify-between" style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
          <span>₩0</span>
          <span>₩2,000,000</span>
        </div>
      </div>

      <div className="filter-group">
        <h3>주요 스펙</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {['High Performance', '4K Support', 'Noise Cancelling', 'Wireless'].map(spec => (
            <li key={spec} style={{ marginBottom: '10px' }}>
              <label className="flex items-center gap-10" style={{ cursor: 'pointer' }}>
                <input type="checkbox" onChange={() => alert('준비중입니다.')} />
                {spec}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
