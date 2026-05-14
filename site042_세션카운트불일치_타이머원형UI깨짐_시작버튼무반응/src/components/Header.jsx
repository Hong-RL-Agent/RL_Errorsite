import React from 'react';

const Header = ({ onSettingsOpen }) => {
  return (
    <header style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
      <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: '#10b981', borderRadius: '8px' }}></div>
            FocusHub
          </div>
          <nav>
            <ul style={{ display: 'flex', gap: '1.5rem', fontWeight: 500, fontSize: '0.9rem', color: '#64748b' }}>
              <li style={{ color: '#0f172a' }}>Dashboard</li>
              <li>Board</li>
              <li>Statistics</li>
              <li>Team Rooms</li>
            </ul>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSettingsOpen} style={{ padding: '0.5rem', color: '#64748b' }}>
            Settings
          </button>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
