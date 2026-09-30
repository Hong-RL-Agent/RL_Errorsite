import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BugAlertPopup from './components/BugAlertPopup';
import Home from './pages/Home';
import TravelList from './pages/TravelList';
import TravelDetail from './pages/TravelDetail';
import TravelEditor from './pages/TravelEditor';
import MyTravelLogs from './pages/MyTravelLogs';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import { getStoredUser, setStoredUser, api } from './api/client';
import { Compass } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = getStoredUser();
    return saved || {
      id: 1,
      name: "김민지",
      email: "minji@triplog.kr",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "카메라 들고 떠나는 감성 여행 크리에이터 📸",
      logCount: 8,
      likeCount: 340
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

  const pathname = currentPath.split('?')[0];
  const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));

  let pageComponent = null;

  if (pathname === '/' || pathname === '') {
    pageComponent = <Home navigate={navigate} />;
  } else if (pathname === '/travel') {
    pageComponent = <TravelList navigate={navigate} searchParams={searchParams} />;
  } else if (pathname === '/travel/new') {
    pageComponent = <TravelEditor user={user} navigate={navigate} />;
  } else if (pathname.startsWith('/travel/edit/')) {
    const editId = pathname.replace('/travel/edit/', '');
    pageComponent = <TravelEditor editId={editId} user={user} navigate={navigate} />;
  } else if (pathname.startsWith('/travel/')) {
    const id = pathname.replace('/travel/', '');
    pageComponent = <TravelDetail id={id} user={user} navigate={navigate} />;
  } else if (pathname === '/my-travel') {
    pageComponent = <MyTravelLogs user={user} navigate={navigate} />;
  } else if (pathname === '/community') {
    pageComponent = <Community user={user} navigate={navigate} />;
  } else if (pathname.startsWith('/community/')) {
    const id = pathname.replace('/community/', '');
    pageComponent = <PostDetail id={id} user={user} navigate={navigate} />;
  } else if (pathname === '/profile') {
    pageComponent = <Profile user={user} navigate={navigate} />;
  } else {
    pageComponent = <Home navigate={navigate} />;
  }

  return (
    <div className="app-container">
      <BugAlertPopup />

      <Header 
        user={user} 
        setUser={setUser} 
        currentRoute={pathname} 
        navigate={navigate} 
      />

      <main className="main-content">
        {pageComponent}
      </main>

      <footer style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '48px 24px 32px',
        borderTop: '1px solid #1e293b',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '28px', marginBottom: '36px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Compass size={18} />
                </div>
                <span>TripLog</span>
              </div>
              <p style={{ maxWidth: '380px', lineHeight: '1.6', fontSize: '0.85rem' }}>
                TripLog는 여행의 설렘과 여정을 기록하고 나만의 일정을 전 세계 여행자들과 나누는 감성 여행 커뮤니티입니다.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>서비스 바로가기</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/travel')}>여행 찾기</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/travel/new')}>일정 만들기</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/my-travel')}>내 여행 기록</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>여행 커뮤니티</span>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>안내</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <span>여행기 작성 가이드</span>
                  <span>위치 및 지도 안내</span>
                  <span>개인정보 처리방침</span>
                  <span>이용약관</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#64748b' }}>
            <span>© 2026 TripLog Inc. All rights reserved.</span>
            <span>Travel Journal & Itinerary Sharing Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
