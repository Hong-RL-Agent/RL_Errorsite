import React from 'react';

const PackageFilters = ({ currentFilter, setFilter }) => {
  const categories = ['All', 'Massage', 'Facial', 'Body', 'Water'];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '50px' }}>
      {categories.map(cat => (
        <button
          key={cat}
          className={`btn ${currentFilter === cat ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter(cat)}
          style={{ minWidth: '120px', fontSize: '0.8rem' }}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default PackageFilters;
