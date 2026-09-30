import React from 'react';

export default function CategoryNav({ categories = [], selectedCategory, onSelectCategory }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-carousel">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.name || (!selectedCategory && cat.name === '전체');
        return (
          <button
            key={cat.id}
            className={`category-card-btn ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
          >
            <div className="category-icon-wrap">{cat.icon || '🛍️'}</div>
            <div className="category-label">{cat.name}</div>
          </button>
        );
      })}
    </div>
  );
}
