import React from 'react';

export default function CategoryNav({ activeCategory, onCategoryChange }) {
  const categories = ["All", "Technology", "Business", "Science", "Lifestyle", "Politics", "Opinion"];

  return (
    <nav className="category-nav">
      <div className="container">
        <ul className="nav-links">
          {categories.map(cat => (
            <li key={cat}>
              <button 
                onClick={() => onCategoryChange(cat)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: activeCategory === cat ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: activeCategory === cat ? 900 : 700,
                  textDecoration: activeCategory === cat ? 'underline' : 'none'
                }}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
