import React from 'react';
import { Shirt, PlusCircle, PackageCheck, User, Sparkles, HelpCircle } from 'lucide-react';

export default function Header({ currentTab, onSelectTab }) {
  return (
    <header className="header-wrapper">
      <div className="max-w-screen header-inner">
        <div className="brand-logo" onClick={() => onSelectTab('home')}>
          <div style={{ width: '36px', height: '36px', background: '#16a34a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Shirt size={22} />
          </div>
          <span>FreshLaundry</span>
          <span className="logo-badge">PREMIUM</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${currentTab === 'services' ? 'active' : ''}`}
            onClick={() => onSelectTab('services')}
          >
            <span>서비스 안내</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'new-order' ? 'active' : ''}`}
            onClick={() => onSelectTab('new-order')}
          >
            <PlusCircle size={16} />
            <span>세탁 신청</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'orders' ? 'active' : ''}`}
            onClick={() => onSelectTab('orders')}
          >
            <PackageCheck size={16} />
            <span>주문 내역</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'account' ? 'active' : ''}`}
            onClick={() => onSelectTab('account')}
          >
            <User size={16} />
            <span>마이페이지</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
