import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHome from './components/DashboardHome';
import UserManagement from './components/UserManagement';
import UserDetailDrawer from './components/UserDetailDrawer';
import RequestManagement from './components/RequestManagement';
import AuditLogs from './components/AuditLogs';
import ExportSection from './components/ExportSection';
import { resetSystemData } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerFilterContext, setDrawerFilterContext] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  }

  // 전역 멱등성 시스템 리셋 핸들러
  async function handleResetSystem() {
    try {
      setIsResetting(true);
      const res = await resetSystemData();
      if (res.success) {
        showToast('시스템 데이터베이스 및 모든 조회 상태가 초기화되었습니다.');
        setSelectedUser(null);
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      showToast('초기화 중 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
    }
  }

  function handleOpenUserDetail(user, filterContext) {
    setSelectedUser(user);
    setDrawerFilterContext(filterContext);
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-wrapper">
        <Header 
          activeTab={activeTab} 
          onReset={handleResetSystem} 
          isResetting={isResetting} 
        />

        <main className="content-area" key={refreshKey}>
          {activeTab === 'dashboard' && (
            <DashboardHome setActiveTab={setActiveTab} />
          )}

          {activeTab === 'users' && (
            <UserManagement 
              onOpenUserDetail={handleOpenUserDetail} 
              onShowToast={showToast} 
            />
          )}

          {activeTab === 'requests' && (
            <RequestManagement onShowToast={showToast} />
          )}

          {activeTab === 'logs' && (
            <AuditLogs onShowToast={showToast} />
          )}

          {activeTab === 'export' && (
            <ExportSection onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* 사용자 상세 드로어 */}
      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          filterContext={drawerFilterContext}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => setRefreshKey(prev => prev + 1)}
          onShowToast={showToast}
        />
      )}

      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
