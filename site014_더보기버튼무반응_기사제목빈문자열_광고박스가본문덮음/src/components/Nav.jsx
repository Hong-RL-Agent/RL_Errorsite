import React from 'react';

const CATEGORIES = ['All', 'Politics', 'Technology', 'Economy', 'Society', 'Sports', 'Search', 'Login'];

function Nav({ activeCategory, onSelect }) {
  return (
    <nav className="nav">
      {CATEGORIES.map(cat => (
        <div 
          key={cat} 
          className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </div>
      ))}
    </nav>
  );
}

export default Nav;
