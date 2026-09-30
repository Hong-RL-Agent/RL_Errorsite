import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Toast from './components/Toast';

import Home from './pages/Home';
import Plans from './pages/Plans';
import Subscription from './pages/Subscription';
import Content from './pages/Content';
import Billing from './pages/Billing';
import MyPage from './pages/MyPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [contents, setContents] = useState([]);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, bugId = null, secId = null, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, bugId, secId, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchInitialData = async () => {
    try {
      const [pRes, sRes, cRes, uRes] = await Promise.all([
        fetch('/api/plans'),
        fetch('/api/subscriptions/me'),
        fetch('/api/content'),
        fetch('/api/profile')
      ]);

      const pData = await pRes.json();
      const sData = await sRes.json();
      const cData = await cRes.json();
      const uData = await uRes.json();

      if (pData.success) setPlans(pData.data);
      if (sData.success) setSubscription(sData.data);
      if (cData.success) setContents(cData.data);
      if (uData.success) setUser(uData.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <div>
      <Toast toasts={toasts} onClose={(id) => setToasts(toasts.filter((t) => t.id !== id))} />

      {/* Top Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        subscription={subscription}
      />

      {/* Main Page Content */}
      <main className="main-content">
        {currentPage === 'home' && (
          <Home
            onNavigate={setCurrentPage}
            subscription={subscription}
            contents={contents}
          />
        )}

        {currentPage === 'plans' && (
          <Plans
            plans={plans}
            subscription={subscription}
            onPlanChanged={fetchInitialData}
            showToast={showToast}
          />
        )}

        {currentPage === 'subscription' && (
          <Subscription
            subscription={subscription}
            onStateChanged={fetchInitialData}
            showToast={showToast}
          />
        )}

        {currentPage === 'content' && (
          <Content
            contents={contents}
            showToast={showToast}
          />
        )}

        {currentPage === 'billing' && (
          <Billing
            subscription={subscription}
            showToast={showToast}
          />
        )}

        {currentPage === 'mypage' && (
          <MyPage
            user={user}
            subscription={subscription}
            onNavigate={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}
