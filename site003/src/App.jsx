import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data.data));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
      </main>
    </div>
  );
}

export default App;
