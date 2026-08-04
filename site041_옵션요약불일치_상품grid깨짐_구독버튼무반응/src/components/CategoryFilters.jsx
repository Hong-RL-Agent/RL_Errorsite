import React from 'react';

const CategoryFilters = ({ current, onSelect }) => {
  const categories = ['All', 'Healing', 'Food', 'Home', 'Hobby', 'Beauty'];

  return (
    <div className="filters">
      {categories.map(cat => (
        <button
          key={cat}
          className={`filter-btn ${current === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilters;
