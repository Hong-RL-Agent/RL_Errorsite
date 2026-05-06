import React from 'react';

export default function FilterSidebar({ filter, setFilter }) {
  return (
    <aside className="filter-sidebar">
      <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem'}}>상세 검색</h3>
      
      <div className="filter-section">
        <h4 style={{marginBottom: '1rem', fontSize: '1rem'}}>호텔 등급</h4>
        <div className="flex flex-col gap-2">
          {[5, 4, 3].map(rating => (
            <label key={rating} className="flex items-center gap-2" style={{cursor: 'pointer'}}>
              <input 
                type="radio" 
                name="rating" 
                checked={filter.rating === rating}
                onChange={() => setFilter({...filter, rating})}
              />
              {rating}성급 이상
            </label>
          ))}
          <label className="flex items-center gap-2" style={{cursor: 'pointer'}}>
            <input 
              type="radio" 
              name="rating" 
              checked={filter.rating === 0}
              onChange={() => setFilter({...filter, rating: 0})}
            />
            전체 보기
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h4 style={{marginBottom: '1rem', fontSize: '1rem'}}>최대 가격 (1박)</h4>
        <input 
          type="range" 
          min="50000" 
          max="500000" 
          step="10000" 
          value={filter.price}
          onChange={(e) => setFilter({...filter, price: parseInt(e.target.value)})}
          style={{width: '100%'}}
        />
        <div className="flex justify-between text-muted" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
          <span>₩50,000</span>
          <span style={{fontWeight: 600, color: 'var(--text-main)'}}>₩{filter.price.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  );
}
