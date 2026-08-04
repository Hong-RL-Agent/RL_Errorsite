import React from 'react';

function Header({ onLogoClick }) {
  return (
    <header className="header">
      <div 
        className="logo" 
        style={{ fontWeight: 800, fontSize: '1.5rem', cursor: 'pointer', color: '#3B82F6' }}
        onClick={onLogoClick}
      >
        FORUM
      </div>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
        <span className="nav-link" style={{ cursor: 'pointer', fontWeight: 500 }}>Trending</span>
        <span className="nav-link" style={{ cursor: 'pointer', fontWeight: 500 }}>Members</span>
        <div className="btn btn-primary" style={{ padding: '8px 16px' }}>Sign In</div>
      </nav>
    </header>
  );
}

export default Header;
