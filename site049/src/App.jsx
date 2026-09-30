import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BugAlertPopup from './components/BugAlertPopup';
import Home from './pages/Home';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import MyActivities from './pages/MyActivities';
import Notifications from './pages/Notifications';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import OrganizerDashboard from './pages/OrganizerDashboard';
import { getStoredUser, setStoredUser, api } from './api/client';
import { HeartHandshake } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = getStoredUser();
    return saved || {
      id: 1,
      name: "김민지",
      email: "minji@neighborhands.kr",
      role: "user",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      volunteerHours: 36,
      completedCount: 9,
      region: "수원시 영통구"
    };
  });

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract query params & route parsing
  const pathname = currentPath.split('?')[0];
  const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));

  // Route matching
  let pageComponent = null;

  if (pathname === '/' || pathname === '') {
    pageComponent = <Home navigate={navigate} />;
  } else if (pathname === '/activities') {
    pageComponent = <Activities navigate={navigate} searchParams={searchParams} />;
  } else if (pathname.startsWith('/activities/')) {
    const id = pathname.replace('/activities/', '');
    pageComponent = <ActivityDetail id={id} user={user} navigate={navigate} />;
  } else if (pathname === '/my-activities') {
    pageComponent = <MyActivities user={user} navigate={navigate} />;
  } else if (pathname === '/notifications') {
    pageComponent = <Notifications user={user} navigate={navigate} />;
  } else if (pathname === '/community') {
    pageComponent = <Community user={user} navigate={navigate} />;
  } else if (pathname.startsWith('/community/')) {
    const id = pathname.replace('/community/', '');
    pageComponent = <PostDetail id={id} user={user} navigate={navigate} />;
  } else if (pathname === '/profile') {
    pageComponent = <Profile user={user} navigate={navigate} />;
  } else if (pathname === '/organizer') {
    pageComponent = <OrganizerDashboard user={user} navigate={navigate} />;
  } else {
    pageComponent = <Home navigate={navigate} />;
  }

  return (
    <div className="app-container">
      {/* Intentional Bug Catching Popup (User-friendly visual indicator) */}
      <BugAlertPopup />

      {/* Header */}
      <Header 
        user={user} 
        setUser={setUser} 
        currentRoute={pathname} 
        navigate={navigate} 
      />

      {/* Main Content Area */}
      <main className="main-content">
        {pageComponent}
      </main>

      {/* Site Footer */}
      <footer style={{
        background: '#1c1917',
        color: '#a8a29e',
        padding: '48px 24px 32px',
        borderTop: '1px solid #292524',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '28px', marginBottom: '36px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <HeartHandshake size={18} />
                </div>
                <span>NeighborHands</span>
              </div>
              <p style={{ maxWidth: '380px', lineHeight: '1.6', fontSize: '0.85rem' }}>
                NeighborHands는 지역 주민과 자원봉사 단체를 잇는 참여형 커뮤니티 플랫폼입니다. 우리 동네 곳곳에 따뜻한 온기를 전합니다.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>서비스 바로가기</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/activities')}>봉사활동 찾기</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/my-activities')}>참여 내역</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>이웃 커뮤니티</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/organizer')}>활동 주최 관리</span>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>지원 및 안내</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <span>1365 연계 가이드</span>
                  <span>봉사시간 인증 안내</span>
                  <span>개인정보 처리방침</span>
                  <span>이용약관</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #292524', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#78716c' }}>
            <span>© 2026 NeighborHands Inc. All rights reserved.</span>
            <span>지역 봉사활동 포털 & 참여 관리 시스템</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
