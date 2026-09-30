import React from 'react';
import { PlusCircle, Calendar, Building2, User, HelpCircle, Shield, Bell, Stethoscope } from 'lucide-react';

export default function Header({ currentTab, onSelectTab, appointmentCount = 0 }) {
  return (
    <header className="header-wrapper">
      <div className="max-w-screen header-container">
        {/* Logo */}
        <div className="logo-container" onClick={() => onSelectTab('home')}>
          <div className="logo-icon">
            <Stethoscope size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f2b48', letterSpacing: '-0.5px' }}>
              CareBridge
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '-2px' }}>
              Hospital & Care Booking
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-links">
          <button
            className={`nav-item ${currentTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => onSelectTab('hospitals')}
          >
            병원 찾기
          </button>
          <button
            className={`nav-item ${currentTab === 'booking' ? 'active' : ''}`}
            onClick={() => onSelectTab('booking')}
          >
            진료 예약
          </button>
          <button
            className={`nav-item ${currentTab === 'appointments' ? 'active' : ''}`}
            onClick={() => onSelectTab('appointments')}
            style={{ position: 'relative' }}
          >
            <span>예약 내역</span>
            {appointmentCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#0284c7',
                borderRadius: '50%'
              }} />
            )}
          </button>
          <button
            className={`nav-item ${currentTab === 'account' ? 'active' : ''}`}
            onClick={() => onSelectTab('account')}
          >
            마이페이지
          </button>
        </nav>
      </div>
    </header>
  );
}
