import React, { useState } from 'react';
import Header from './components/Header';
import BugAlertPopup from './components/BugAlertPopup';
import Toast from './components/Toast';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetailPage from './pages/ProductDetailPage';
import Sell from './pages/Sell';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('서울 마포구 망원동');
  const [activeChatId, setActiveChatId] = useState(null);
  const [likedProductIds, setLikedProductIds] = useState(['p-101', 'p-102', 'p-109']);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setActivePage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChat = (product) => {
    setActiveChatId(product.id);
    setActivePage('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = (productId, isLiked) => {
    setLikedProductIds(prev => {
      if (isLiked && !prev.includes(productId)) return [...prev, productId];
      if (!isLiked && prev.includes(productId)) return prev.filter(id => id !== productId);
      return prev;
    });
  };

  const handleProductCreated = (newProduct) => {
    if (newProduct) {
      setSelectedProductId(newProduct.id);
      setActivePage('product-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="app-container">
      <BugAlertPopup />
      <Toast toasts={toasts} />

      <Header
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={(q) => {
          setSearchQuery(q);
          setActivePage('products');
        }}
        currentLocation={currentLocation}
        onChangeLocation={(loc) => {
          setCurrentLocation(loc);
          showToast(`거래 동네가 '${loc.split(' ').slice(-1)[0]}'(으)로 변경되었습니다.`, 'info');
        }}
      />

      <main className="main-content">
        {activePage === 'home' && (
          <Home
            setActivePage={setActivePage}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onStartChat={handleStartChat}
            likedProductIds={likedProductIds}
            currentLocation={currentLocation}
            onSearch={(q) => setSearchQuery(q)}
          />
        )}

        {activePage === 'products' && (
          <Products
            onSelectProduct={handleSelectProduct}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            likedProductIds={likedProductIds}
          />
        )}

        {activePage === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => setActivePage('products')}
            onStartChat={handleStartChat}
            likedProductIds={likedProductIds}
            onToggleLike={handleToggleLike}
            showToast={showToast}
          />
        )}

        {activePage === 'sell' && (
          <Sell
            onProductCreated={handleProductCreated}
            setActivePage={setActivePage}
            showToast={showToast}
          />
        )}

        {activePage === 'chat' && (
          <Chat
            activeChatId={activeChatId}
            onSelectProduct={handleSelectProduct}
            showToast={showToast}
          />
        )}

        {activePage === 'profile' && (
          <Profile
            onSelectProduct={handleSelectProduct}
            setActivePage={setActivePage}
            likedProductIds={likedProductIds}
          />
        )}

        {activePage === 'my-listings' && (
          <MyListings
            onSelectProduct={handleSelectProduct}
            setActivePage={setActivePage}
          />
        )}
      </main>

      {/* Commercial Grade Portal Footer */}
      <footer style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '54px 20px 40px',
        fontSize: '0.85rem',
        marginTop: 'auto',
        borderTop: '1px solid #1e293b'
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '36px' }}>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--primary)' }}>Near</span>Buy
              </div>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.82rem' }}>
                동네 이웃과 믿고 거래하는 지역 기반 온라인 스마트 중고거래 플랫폼. 안심 직거래와 비대면 문 앞 거래를 모두 지원합니다.
              </p>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: '800', marginBottom: '12px' }}>서비스 바로가기</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('products')}>동네 중고 매물 둘러보기</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('sell')}>내 물건 판매 등록</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('chat')}>실시간 거래 채팅</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('profile')}>마이페이지 & 매너온도</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: '800', marginBottom: '12px' }}>안심 거래 가이드</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                <span>직거래 안전 수칙</span>
                <span>비대면 문 앞 픽업 절차</span>
                <span>매너 평가 및 온도시스템 안내</span>
                <span>허위매물 및 사기 신고 센터</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: '800', marginBottom: '12px' }}>고객 지원 센터</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                1588-0952
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                운영시간: 평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)<br />
                서버 포트: Port 9952 (NearBuy Standalone)
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: '#64748b' }}>
            <div>
              (주)니어바이 사업자등록번호: 530-88-00952 | 통신판매업신고: 2026-서울마포-0952호
            </div>
            <div>
              © 2026 NearBuy Platform Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
