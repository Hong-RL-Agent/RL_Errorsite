import React from 'react';

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  const categories = ['전체', '개발', '디자인', '마케팅', '데이터'];

  return (
    <div className="category-tabs">
      {categories.map(cat => (
        <button 
          key={cat} 
          className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
