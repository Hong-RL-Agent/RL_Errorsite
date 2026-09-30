import React from 'react';

export default function CategoryTabs({ categories = [], selectedCategory, onSelectCategory }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-tabs-row">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.name || (!selectedCategory && cat.name === '전체');
        return (
          <button
            key={cat.id}
            className={`cat-tab-card ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
          >
            <div className="cat-tab-icon">{cat.icon || '📚'}</div>
            <div className="cat-tab-label">{cat.name}</div>
          </button>
        );
      })}
    </div>
  );
}
