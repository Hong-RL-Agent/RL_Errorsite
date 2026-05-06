import React from 'react';

export default function CategoryChips({ activeCategory, onCategoryChange }) {
  const categories = ["All", "Fast Food", "Pizza", "Japanese", "Mexican", "Korean", "Dessert"];

  return (
    <div className="category-chips">
      {categories.map(cat => (
        <button 
          key={cat} 
          className={`chip ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
