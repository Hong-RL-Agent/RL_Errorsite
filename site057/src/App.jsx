import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Nearby from './pages/Nearby';
import VehicleDetail from './pages/VehicleDetail';
import Rental from './pages/Rental';
import History from './pages/History';
import Account from './pages/Account';
import { api } from './api/client';
import { Zap, ShieldCheck, MapPin, Phone, Mail, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [activeRental, setActiveRental] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [pendingRentalVehicle, setPendingRentalVehicle] = useState(null);

  // Initialize App Data
  useEffect(() => {
    async function init() {
      try {
        const vData = await api.getVehicles();
        if (vData && vData.vehicles) {
          setVehicles(vData.vehicles);
        }

        const sData = await api.getStations();
        if (sData && sData.stations) {
          setStations(sData.stations);
        }

        const rData = await api.getRentals();
        if (rData && rData.rentals) {
          const ongoing = rData.rentals.find(r => r.status === 'active');
          if (ongoing) setActiveRental(ongoing);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    init();
  }, []);

  const handleSelectVehicle = (id) => {
    setSelectedVehicleId(id);
    setCurrentTab('vehicle-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRentVehicle = (id) => {
    const v = vehicles.find(item => item.id === id);
    setPendingRentalVehicle(v || null);
    setCurrentTab('rental');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartRentalSuccess = (newRental) => {
    setActiveRental(newRental);
    setPendingRentalVehicle(null);
  };

  const handleFinishRentalSuccess = (completedRental) => {
    setActiveRental(null);
  };

  const handleSelectTab = (tab) => {
    setCurrentTab(tab);
    setSelectedVehicleId(null);
    setPendingRentalVehicle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        activeRental={activeRental}
      />

      {/* Main Content Router */}
      <main className="main-content">
        {currentTab === 'home' && (
          <Home
            vehicles={vehicles}
            stations={stations}
            activeRental={activeRental}
            onSelectVehicle={handleSelectVehicle}
            onRentVehicle={handleRentVehicle}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'nearby' && (
          <Nearby
            vehicles={vehicles}
            stations={stations}
            onSelectVehicle={handleSelectVehicle}
            onRentVehicle={handleRentVehicle}
          />
        )}

        {currentTab === 'vehicle-detail' && (
          <VehicleDetail
            vehicleId={selectedVehicleId}
            onRentVehicle={handleRentVehicle}
            onViewOnMap={() => setCurrentTab('nearby')}
            onBack={() => setCurrentTab('nearby')}
          />
        )}

        {currentTab === 'rental' && (
          <Rental
            activeRental={activeRental}
            pendingVehicle={pendingRentalVehicle}
            onStartRentalSuccess={handleStartRentalSuccess}
            onFinishRentalSuccess={handleFinishRentalSuccess}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'history' && (
          <History
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
                <div style={{ width: '28px', height: '28px', background: '#65a30d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} fill="#fff" />
                </div>
                <span>RideOn 모빌리티</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
                (주)라이드온은 안전하고 편리한 도심 단거리 이동을 위한 스마트 공유 모빌리티 플랫폼을 운영합니다.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                고객안전센터 1599-0570 (24시간 사고 접수 및 상담)
              </div>
            </div>

            <div>
              <h4 className="footer-title">서비스 안내</h4>
              <ul className="footer-list">
                <li onClick={() => handleSelectTab('nearby')}>주변 차량 대여</li>
                <li onClick={() => handleSelectTab('rental')}>실시간 주행 관리</li>
                <li onClick={() => handleSelectTab('history')}>이용 기록 및 영수증</li>
                <li onClick={() => handleSelectTab('account')}>내 라이더 프로필</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">주요 거점 스테이션</h4>
              <ul className="footer-list">
                <li>강남역 11번 출구 스테이션</li>
                <li>역삼역 포스코타워 정류장</li>
                <li>선릉역 1번 출구 광장</li>
                <li>삼성역 코엑스 동문</li>
                <li>판교역 알파돔시티</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">안전 & 법률 준수</h4>
              <ul className="footer-list">
                <li>단체 상해 종합보험 적용</li>
                <li>원동기/2종보통 면허 인증제</li>
                <li>스마트 헬멧 보관함 운영</li>
                <li>최고속도 25km/h 법정 준수</li>
              </ul>
            </div>
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid #1e293b', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <div>© 2026 RideOn Mobility Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>이용약관</span>
              <span>개인정보처리방침</span>
              <span>위치기반서비스 이용약관</span>
              <span>안전주행 가이드</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
