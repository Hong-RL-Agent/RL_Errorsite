import React from 'react';

const NAV_ITEMS = [
  { id: 'dining', label: 'Dining', icon: '🍽️', active: true },
  { id: 'spa', label: 'Spa & Wellness', icon: '💆' },
  { id: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'valet', label: 'Valet Service', icon: '🔑' },
];

function Sidebar({ addToast }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>GRAND</h2>
        <p style={{ fontSize: '0.6rem', color: '#D4AF37', letterSpacing: '4px' }}>ESTATE</p>
      </div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <li 
            key={item.id} 
            className={item.active ? 'active' : ''}
            onClick={() => {
              if (!item.active) addToast(`${item.label} service is ready for you.`);
            }}
          >
            <span style={{ marginRight: '10px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
