import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import Team from './pages/Team';
import Shipping from './pages/Shipping';
import Refunds from './pages/Refunds';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import CsvImport from './pages/CsvImport';
import ApiConsole from './pages/ApiConsole';
import Activity from './pages/Activity';
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = ({ title, message, type = 'success', bugId = null, secId = null, txId = null, idempotency_key = null }) => {
    setToast({
      title,
      message,
      type,
      bugId,
      secId,
      txId,
      idempotency_key
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} onShowToast={showToast} />;
      case 'content':
        return <Content onShowToast={showToast} />;
      case 'calendar':
        return <Calendar onShowToast={showToast} />;
      case 'team':
        return <Team onShowToast={showToast} />;
      case 'shipping':
        return <Shipping onShowToast={showToast} />;
      case 'refunds':
        return <Refunds onShowToast={showToast} />;
      case 'search':
        return <Search onShowToast={showToast} />;
      case 'notifications':
        return <Notifications onShowToast={showToast} />;
      case 'reports':
        return <Reports onShowToast={showToast} />;
      case 'csv-import':
        return <CsvImport onShowToast={showToast} />;
      case 'api-console':
        return <ApiConsole onShowToast={showToast} />;
      case 'activity':
        return <Activity />;
      case 'settings':
        return <Settings onShowToast={showToast} />;
      default:
        return <Dashboard onNavigate={setActiveTab} onShowToast={showToast} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-wrapper">
        <Header activeTab={activeTab} />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
