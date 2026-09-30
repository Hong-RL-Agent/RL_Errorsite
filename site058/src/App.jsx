import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Services from './pages/Services';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Account from './pages/Account';
import { api } from './api/client';
import { Shirt, ShieldCheck, Truck, Droplets, Phone, Mail, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [services, setServices] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedServiceIdForOrder, setSelectedServiceIdForOrder] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServices();
        if (data?.services) setServices(data.services);
      } catch (err) {
        console.error('Failed to load initial services:', err);
      }
    }
    loadServices();
  }, []);

  const handleSelectTab = (tab) => {
    setCurrentTab(tab);
    setSelectedOrderId(null);
    setSelectedServiceIdForOrder(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectService = (serviceId) => {
    setSelectedServiceIdForOrder(serviceId);
    setCurrentTab('new-order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentTab('order-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (newOrder) => {
    setSelectedOrderId(newOrder.id);
    setCurrentTab('order-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Router */}
      <main className="main-content">
        {currentTab === 'home' && (
          <Home
            services={services}
            onSelectService={handleSelectService}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'services' && (
          <Services
            onSelectService={handleSelectService}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'new-order' && (
          <NewOrder
            initialServiceId={selectedServiceIdForOrder}
            onOrderCreated={handleOrderCreated}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'orders' && (
          <Orders
            onSelectOrder={handleSelectOrder}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'order-detail' && (
          <OrderDetail
            orderId={selectedOrderId}
            onBack={() => setCurrentTab('orders')}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'account' && (
          <Account
            onNavigateTab={handleSelectTab}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="footer-wrapper">
        <div className="max-w-screen">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 900, fontSize: '1.25rem', marginBottom: '12px' }}>
                <div style={{ width: '28px', height: '28px', background: '#16a34a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shirt size={18} fill="#fff" />
                </div>
                <span>FreshLaundry 세탁 플랫폼</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
                (주)프레시런드리는 첨단 친환경 세탁 스마트팩토리와 안심 비대면 수거·배송 시스템을 통해 프리미엄 라이프스타일 케어를 선도합니다.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                고객만족센터 1588-0580 (평일 09:00 ~ 18:00 / 토 09:00 ~ 13:00)
              </div>
            </div>

            <div>
              <h4 className="footer-title">서비스 메뉴</h4>
              <ul className="footer-list">
                <li onClick={() => handleSelectTab('services')}>세탁 프로그램 요금표</li>
                <li onClick={() => handleSelectTab('new-order')}>비대면 수거 신청</li>
                <li onClick={() => handleSelectTab('orders')}>진행 상태 실시간 조회</li>
                <li onClick={() => handleSelectTab('account')}>수거 주소록 관리</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">전문 케어 센터</h4>
              <ul className="footer-list">
                <li>송파 스마트 클린팩토리 1공구</li>
                <li>강서 프리미엄 드라이 허브</li>
                <li>분당 친환경 패브릭 케어센터</li>
                <li>일산 아웃도어 특수 가공소</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">소비자 안심 보증</h4>
              <ul className="footer-list">
                <li>한국소비자원 표준약관 준수</li>
                <li>세탁물 훼손·분실 100% 보상보험</li>
                <li>무형광·친환경 천연 세제 사용</li>
                <li>80℃ 고온 살균 텀블링 안심케어</li>
              </ul>
            </div>
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid #1e293b', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <div>© 2026 FreshLaundry Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>이용약관</span>
              <span>개인정보처리방침</span>
              <span>세탁 배상책임 규정</span>
              <span>전자상거래 표준약관</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
