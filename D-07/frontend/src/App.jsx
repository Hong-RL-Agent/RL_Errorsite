import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SettingsNav from './components/SettingsNav';
import AccountCard from './components/AccountCard';
import ProfileSection from './components/ProfileSection';
import ThemeSection from './components/ThemeSection';
import LanguageSection from './components/LanguageSection';
import NotificationSection from './components/NotificationSection';
import PrivacySection from './components/PrivacySection';
import TimezoneSection from './components/TimezoneSection';
import LoginModal from './components/LoginModal';
import { fetchUsers, loginUser, fetchPreferences, resetDatabase } from './lib/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // 초기 로드: 사용자 목록 조회 및 기본 사용자 로그인
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const usersRes = await fetchUsers();
      if (usersRes.success && usersRes.data.length > 0) {
        setUsers(usersRes.data);
        const savedUsername = localStorage.getItem('prefspace_user') || usersRes.data[0].username;
        await handleLogin(savedUsername);
      }
    } catch (err) {
      console.error(err);
      showToast('초기 데이터를 불러오지 못했습니다.');
    }
  }

  // 테마 동기화 effect
  useEffect(() => {
    if (preferences?.theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [preferences?.theme]);

  // 탭 변경 시 (Revisit 패턴 지원: DB 최신 상태 재조회)
  async function handleTabChange(tabId) {
    setActiveTab(tabId);
    if (currentUser) {
      try {
        const res = await fetchPreferences(currentUser.id);
        if (res.success && res.data.preferences) {
          setPreferences(res.data.preferences);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  async function handleLogin(username) {
    try {
      const res = await loginUser(username);
      if (res.success) {
        setCurrentUser(res.data.user);
        setPreferences(res.data.preferences);
        localStorage.setItem('prefspace_user', username);
        setIsLoginModalOpen(false);
        showToast(`${res.data.user.name}님 계정으로 접속되었습니다.`);
      }
    } catch (err) {
      console.error(err);
      showToast('로그인에 실패했습니다.');
    }
  }

  function handleLogout() {
    setIsLoginModalOpen(true);
    showToast('로그아웃되었습니다. 테스트 계정을 선택하세요.');
  }

  function handleSwitchUser(username) {
    handleLogin(username);
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  }

  async function handleReset() {
    try {
      setIsResetting(true);
      const res = await resetDatabase();
      if (res.success) {
        showToast('시스템 데이터베이스 및 환경설정이 초기값으로 복원되었습니다.');
        // 현재 로그인 사용자 설정 재조회
        if (currentUser) {
          const prefRes = await fetchPreferences(currentUser.id);
          if (prefRes.success) {
            setPreferences(prefRes.data.preferences);
          }
        }
      }
    } catch (err) {
      console.error(err);
      showToast('시스템 초기화에 실패했습니다.');
    } finally {
      setIsResetting(false);
    }
  }

  function handleProfileUpdated(updatedUser) {
    setCurrentUser(updatedUser);
  }

  function handlePreferencesUpdated(updatedPrefs) {
    setPreferences(prev => ({ ...prev, ...updatedPrefs }));
  }

  return (
    <div>
      <Header
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onReset={handleReset}
        isResetting={isResetting}
      />

      <div className="main-layout">
        {/* 좌측 네비게이션 메뉴 */}
        <SettingsNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 메인 설정 콘텐츠 영역 */}
        <main>
          {/* 상단 프로필 배너 */}
          <AccountCard user={currentUser} />

          {activeTab === 'profile' && currentUser && (
            <ProfileSection
              user={currentUser}
              onProfileUpdated={handleProfileUpdated}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'theme' && currentUser && preferences && (
            <ThemeSection
              user={currentUser}
              preferences={preferences}
              onPreferencesUpdated={handlePreferencesUpdated}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'language' && currentUser && preferences && (
            <LanguageSection
              user={currentUser}
              preferences={preferences}
              onPreferencesUpdated={handlePreferencesUpdated}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'notifications' && currentUser && preferences && (
            <NotificationSection
              user={currentUser}
              preferences={preferences}
              onPreferencesUpdated={handlePreferencesUpdated}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'privacy' && currentUser && preferences && (
            <PrivacySection
              user={currentUser}
              preferences={preferences}
              onPreferencesUpdated={handlePreferencesUpdated}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'timezone' && currentUser && preferences && (
            <TimezoneSection
              user={currentUser}
              preferences={preferences}
              onPreferencesUpdated={handlePreferencesUpdated}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* 재로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        users={users}
        onLogin={handleLogin}
      />

      {/* 토스트 메시지 바 */}
      {toastMessage && (
        <div className="toast-box">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
