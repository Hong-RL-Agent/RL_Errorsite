import React, { useCallback, useEffect, useState } from 'react';
import { getNotifications, resetData } from './api';
import ComposeModal from './components/ComposeModal';
import Header from './components/Header';
import PostModal from './components/PostModal';
import ProfileSummary from './components/ProfileSummary';
import Sidebar from './components/Sidebar';
import SuggestedUsers from './components/SuggestedUsers';
import { clearSummaryCache } from './hooks/useMySummary';
import { useToast } from './hooks/useToast.jsx';
import ActivityPage from './pages/ActivityPage';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SavedPage from './pages/SavedPage';

const ME_ID = 1;

export default function App() {
  const { showToast } = useToast();
  const [view, setView] = useState({ name: 'home', userId: ME_ID });
  const [query, setQuery] = useState('');
  const [openPostId, setOpenPostId] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getNotifications({ limit: 1 })
      .then((res) => setUnreadCount(res.unread_count))
      .catch(() => {});
  }, [view.name, resetKey]);

  const handleUnreadChange = useCallback((n) => setUnreadCount(n), []);

  const goHome = () => {
    setQuery('');
    setView({ name: 'home', userId: ME_ID });
  };

  const navigate = (name) => {
    if (name === 'home') return goHome();
    if (name === 'profile') return setView({ name: 'profile', userId: ME_ID });
    return setView({ name, userId: ME_ID });
  };

  const openProfile = (userId) => {
    setOpenPostId(null);
    setView({ name: 'profile', userId });
  };

  const handleSearch = (text) => {
    setQuery(text);
    setView({ name: 'home', userId: ME_ID });
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetData();
      clearSummaryCache();
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* 저장소 접근 불가 환경 */
      }
      setOpenPostId(null);
      setComposeOpen(false);
      setQuery('');
      setView({ name: 'home', userId: ME_ID });
      setResetKey((k) => k + 1);
      showToast('데이터를 초기화했습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  const renderPage = () => {
    switch (view.name) {
      case 'profile':
        return <ProfilePage key={view.userId} userId={view.userId} onOpenPost={setOpenPostId} onOpenProfile={openProfile} />;
      case 'saved':
        return <SavedPage onOpenPost={setOpenPostId} />;
      case 'notifications':
        return <NotificationsPage onUnreadChange={handleUnreadChange} onOpenPost={setOpenPostId} onOpenProfile={openProfile} />;
      case 'activity':
        return <ActivityPage />;
      default:
        return <HomePage query={query} onClearQuery={() => setQuery('')} onOpenPost={setOpenPostId} onOpenProfile={openProfile} />;
    }
  };

  const currentNav = view.name === 'profile' && view.userId !== ME_ID ? '' : view.name;

  return (
    <div className="app-shell" key={resetKey}>
      <Header
        query={query}
        unreadCount={unreadCount}
        onSearch={handleSearch}
        onCompose={() => setComposeOpen(true)}
        onOpenNotifications={() => navigate('notifications')}
      />
      <div className="layout">
        <Sidebar
          current={currentNav}
          unreadCount={unreadCount}
          onNavigate={navigate}
          onCompose={() => setComposeOpen(true)}
          onReset={handleReset}
          resetting={resetting}
        />
        <main className="main">{renderPage()}</main>
        <aside className="right-panel">
          <ProfileSummary onOpenProfile={openProfile} />
          <SuggestedUsers onOpenProfile={openProfile} />
        </aside>
      </div>

      {openPostId && <PostModal postId={openPostId} onClose={() => setOpenPostId(null)} onOpenProfile={openProfile} />}
      {composeOpen && (
        <ComposeModal
          onClose={() => setComposeOpen(false)}
          onCreated={() => {
            setComposeOpen(false);
            setQuery('');
            setView({ name: 'home', userId: ME_ID });
          }}
        />
      )}
    </div>
  );
}
