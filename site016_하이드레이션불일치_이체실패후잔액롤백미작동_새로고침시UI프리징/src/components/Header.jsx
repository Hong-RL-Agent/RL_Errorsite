import React from 'react';

function Header({ activeTab, setActiveTab }) {
  const tabs = ['Accounts', 'Payments', 'Loans', 'Settings'];

  return (
    <header className="header">
      <div className="logo" style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>
        ESTATE BANK
      </div>
      <nav className="nav">
        {tabs.map(tab => (
          <div 
            key={tab} 
            className={`nav-link ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </nav>
      <div className="user-info" style={{ fontSize: '0.85rem' }}>
        Last login: 2026-05-01 10:30
      </div>
    </header>
  );
}

export default Header;
