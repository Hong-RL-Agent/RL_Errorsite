import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import Pets from './pages/Pets';
import Services from './pages/Services';
import Reservations from './pages/Reservations';
import Messages from './pages/Messages';
import Calendar from './pages/Calendar';
import Activity from './pages/Activity';
import Notifications from './pages/Notifications';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifCount={2}
      />

      <main>
        {activeTab === 'home' && <Home onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'services' && <Services onSelectService={() => {}} />}
        {activeTab === 'pets' && <Pets />}
        {activeTab === 'reservations' && <Reservations />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'activity' && <Activity />}
        {activeTab === 'messages' && <Messages />}
        {activeTab === 'notifications' && <Notifications />}
      </main>

      <footer className="footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#2d6a4f', marginBottom: '4px' }}>PawMate 주식회사</div>
            <div>서울특별시 서초구 강남대로 300 | 대표이사: 이주이 | 고객센터: 1588-0041</div>
          </div>
          <div style={{ fontSize: '12px', color: '#8d99ae' }}>
            © 2026 PawMate Pet Care & Reservation Platform. All rights reserved.
          </div>
        </div>
      </footer>

      <Toast />
    </div>
  );
}
