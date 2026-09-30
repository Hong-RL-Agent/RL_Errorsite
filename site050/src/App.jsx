import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BugAlertPopup from './components/BugAlertPopup';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import RecipeEditor from './pages/RecipeEditor';
import MealPlanner from './pages/MealPlanner';
import Favorites from './pages/Favorites';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import { getStoredUser, setStoredUser, api } from './api/client';
import { UtensilsCrossed } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = getStoredUser();
    return saved || {
      id: 1,
      name: "김민지",
      email: "minji@tablenote.kr",
      role: "user",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "건강하고 따뜻한 집밥을 사랑하는 홈쿡러 🍳",
      recipeCount: 5,
      favoriteCount: 4
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
  } else if (pathname === '/recipes') {
    pageComponent = <Recipes navigate={navigate} searchParams={searchParams} />;
  } else if (pathname === '/recipes/new') {
    pageComponent = <RecipeEditor user={user} navigate={navigate} />;
  } else if (pathname.startsWith('/recipes/edit/')) {
    const editId = pathname.replace('/recipes/edit/', '');
    pageComponent = <RecipeEditor editId={editId} user={user} navigate={navigate} />;
  } else if (pathname.startsWith('/recipes/')) {
    const id = pathname.replace('/recipes/', '');
    pageComponent = <RecipeDetail id={id} user={user} navigate={navigate} />;
  } else if (pathname === '/meal-planner') {
    pageComponent = <MealPlanner navigate={navigate} />;
  } else if (pathname === '/favorites') {
    pageComponent = <Favorites navigate={navigate} />;
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
        background: '#2d241e',
        color: '#b5aba0',
        padding: '48px 24px 32px',
        borderTop: '1px solid #43372f',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '28px', marginBottom: '36px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <UtensilsCrossed size={16} />
                </div>
                <span>TableNote</span>
              </div>
              <p style={{ maxWidth: '380px', lineHeight: '1.6', fontSize: '0.85rem' }}>
                TableNote는 요리를 사랑하는 모든 사람들을 위한 나만의 레시피 노트 및 스마트 주간 식단 플래너입니다.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>바로가기</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/recipes')}>레시피 탐색</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/meal-planner')}>식단 캘린더</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/favorites')}>즐겨찾기</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>홈쿡 커뮤니티</span>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>서비스 정보</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <span>식단 관리 가이드</span>
                  <span>레시피 작성 팁</span>
                  <span>개인정보 처리방침</span>
                  <span>이용약관</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #43372f', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#8c8175' }}>
            <span>© 2026 TableNote Inc. All rights reserved.</span>
            <span>Personal Recipe & Meal Planning Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
