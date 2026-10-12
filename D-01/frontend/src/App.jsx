import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import SubscriptionsView from './components/SubscriptionsView';
import CatalogView from './components/CatalogView';
import BillingView from './components/BillingView';
import PlansView from './components/PlansView';
import DetailModal from './components/DetailModal';
import ConfirmModal from './components/ConfirmModal';
import NotificationModal from './components/NotificationModal';
import { api } from './api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [subscriptions, setSubscriptions] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [billings, setBillings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // UI States
  const [selectedSub, setSelectedSub] = useState(null);
  const [cancelSubTarget, setCancelSubTarget] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Data fetcher
  const loadData = async () => {
    try {
      const [subs, cat, bills, notifs, stats] = await Promise.all([
        api.getSubscriptions(),
        api.getCatalog(),
        api.getBillings(),
        api.getNotifications(),
        api.getAnalytics()
      ]);
      setSubscriptions(subs || []);
      setCatalog(cat || []);
      setBillings(bills || []);
      setNotifications(notifs || []);
      setAnalytics(stats || null);
    } catch (err) {
      console.error('Failed to load SubFlow data:', err);
      showToast('데이터를 불러오는데 실패했습니다: ' + err.message, 'danger');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset database to initial state
  const handleResetData = async () => {
    try {
      await api.resetDatabase();
      await loadData();
      showToast('초기 테스트 시드 데이터로 전체 복원되었습니다.', 'info');
    } catch (err) {
      showToast('데이터 복원 실패: ' + err.message, 'danger');
    }
  };

  // Subscribe to service from Catalog
  const handleSubscribe = async (serviceId, planName, cycle) => {
    try {
      const res = await api.subscribe({
        service_id: serviceId,
        plan_name: planName,
        billing_cycle: cycle
      });
      if (res.success) {
        showToast(`${res.data.service_name} 구독 신청이 완료되었습니다!`, 'success');
        await loadData();
        setCurrentTab('subscriptions');
      }
    } catch (err) {
      showToast('구독 신청 오류: ' + err.message, 'danger');
    }
  };

  // Update Plan (Upgrade/Downgrade)
  const handleUpdatePlan = async (subId, payload) => {
    try {
      const res = await api.updatePlan(subId, payload);
      if (res.success) {
        showToast(res.message || '요금제가 성공적으로 변경되었습니다.', 'success');
        // Re-fetch subscriptions from API
        const refreshed = await api.getSubscriptions();
        setSubscriptions(refreshed);
        const updatedTarget = refreshed.find(s => s.id === subId);
        if (updatedTarget) {
          setSelectedSub(updatedTarget);
        }
        const stats = await api.getAnalytics();
        setAnalytics(stats);
      }
    } catch (err) {
      showToast('요금제 변경 오류: ' + err.message, 'danger');
    }
  };

  // Toggle Auto Renew
  const handleToggleAutoRenew = async (subId, nextAutoRenew) => {
    try {
      const res = await api.updateAutoRenew(subId, nextAutoRenew);
      if (res.success) {
        showToast(
          nextAutoRenew ? '자동 결제가 활성화되었습니다.' : '자동 결제가 비활성화되었습니다.',
          'info'
        );
        // Refresh subscriptions from API
        const refreshed = await api.getSubscriptions();
        setSubscriptions(refreshed);
        if (selectedSub && selectedSub.id === subId) {
          const updatedTarget = refreshed.find(s => s.id === subId);
          if (updatedTarget) setSelectedSub(updatedTarget);
        }
      }
    } catch (err) {
      showToast('자동 결제 설정 변경 실패: ' + err.message, 'danger');
    }
  };

  // Open Cancel Modal
  const handleOpenCancelConfirm = (sub) => {
    setCancelSubTarget(sub);
  };

  // Confirm Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelSubTarget) return;
    try {
      const res = await api.cancelSubscription(cancelSubTarget.id);
      showToast(res.message || '구독 해지가 성공적으로 처리되었습니다.', 'info');
      setCancelSubTarget(null);
      setSelectedSub(null);
      await loadData();
    } catch (err) {
      showToast('구독 해지 오류: ' + err.message, 'danger');
    }
  };

  // Delete Billing Record
  const handleDeleteBilling = async (billingId) => {
    try {
      const res = await api.deleteBilling(billingId);
      if (res.success) {
        showToast('결제 내역이 삭제되었습니다.', 'info');
        await loadData();
      }
    } catch (err) {
      showToast('결제 내역 삭제 실패: ' + err.message, 'danger');
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (notifId) => {
    try {
      await api.markNotificationAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onResetData={handleResetData} 
      />

      {/* Main View Area */}
      <div className="main-wrapper">
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotificationOpen(true)}
        />

        <main className="page-content">
          {currentTab === 'dashboard' && (
            <DashboardView 
              analytics={analytics}
              subscriptions={subscriptions}
              onSelectSubscription={(sub) => setSelectedSub(sub)}
              onNavigateToCatalog={() => setCurrentTab('catalog')}
            />
          )}

          {currentTab === 'subscriptions' && (
            <SubscriptionsView 
              subscriptions={subscriptions}
              onSelectSubscription={(sub) => setSelectedSub(sub)}
              onToggleAutoRenew={handleToggleAutoRenew}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'catalog' && (
            <CatalogView 
              catalog={catalog}
              onSubscribe={handleSubscribe}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView 
              billings={billings}
              onDeleteBilling={handleDeleteBilling}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'plans' && (
            <PlansView 
              onNavigateToCatalog={() => setCurrentTab('catalog')}
            />
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedSub && (
        <DetailModal 
          subscription={selectedSub}
          onClose={() => setSelectedSub(null)}
          onUpdatePlan={handleUpdatePlan}
          onToggleAutoRenew={handleToggleAutoRenew}
          onOpenCancelConfirm={handleOpenCancelConfirm}
        />
      )}

      {/* Cancel Confirm Modal */}
      <ConfirmModal 
        isOpen={Boolean(cancelSubTarget)}
        title="구독 계약 해지 확인"
        message={`정말 [${cancelSubTarget?.service_name}] 구독을 해지하시겠습니까? 해지 완료 후 잔여 결제 주기가 종료되면 서비스 라이선스가 만료됩니다.`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelSubTarget(null)}
      />

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
      />

      {/* Toast Notification Stack */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} color="#34D399" />}
            {t.type === 'info' && <Info size={16} color="#8B5CF6" />}
            {t.type === 'danger' && <AlertCircle size={16} color="#FB7185" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
