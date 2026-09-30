import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Report from './pages/Report';
import VehicleCard from './components/VehicleCard';
import { api } from './api/client';
import { Shield, Phone, Mail, MapPin, CheckCircle, Car } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [favorites, setFavorites] = useState(['vh-01', 'vh-04', 'vh-05']);
  const [vehicleFilter, setVehicleFilter] = useState({});

  // Load Initial Vehicles and Favorites
  useEffect(() => {
    async function initData() {
      try {
        const vData = await api.getVehicles();
        if (vData && vData.vehicles) {
          setVehicles(vData.vehicles);
        }
        const fData = await api.getFavorites();
        if (fData && fData.favoriteIds) {
          setFavorites(fData.favoriteIds);
        }
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      }
    }
    initData();
  }, []);

  const handleToggleFavorite = async (id) => {
    try {
      if (favorites.includes(id)) {
        const res = await api.removeFavorite(id);
        if (res && res.favoriteIds) setFavorites(res.favoriteIds);
      } else {
        const res = await api.addFavorite(id);
        if (res && res.favoriteIds) setFavorites(res.favoriteIds);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleSelectTab = (tab) => {
    setCurrentTab(tab);
    setSelectedVehicleId(null);
  };

  const handleSelectVehicle = (id) => {
    setSelectedVehicleId(id);
    setCurrentTab('vehicle-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookInspection = (id) => {
    setSelectedVehicleId(id);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId);
    setCurrentTab('reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchQuick = (filterParams) => {
    setVehicleFilter(filterParams);
    setCurrentTab('vehicles');
    setSelectedVehicleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const favoriteVehicles = vehicles.filter(v => favorites.includes(v.id));

  return (
    <div className="app-container">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        favoriteCount={favorites.length}
      />

      {/* Main Content Router View */}
      <main className="main-content">
        {currentTab === 'home' && (
          <Home
            vehicles={vehicles}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectVehicle={handleSelectVehicle}
            onBookInspection={handleBookInspection}
            onNavigateTab={handleSelectTab}
            onSearchQuick={handleSearchQuick}
          />
        )}

        {currentTab === 'vehicles' && (
          <Vehicles
            initialFilter={vehicleFilter}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectVehicle={handleSelectVehicle}
            onBookInspection={handleBookInspection}
          />
        )}

        {currentTab === 'vehicle-detail' && (
          <VehicleDetail
            vehicleId={selectedVehicleId}
            isFavorite={favorites.includes(selectedVehicleId)}
            onToggleFavorite={handleToggleFavorite}
            onBookInspection={handleBookInspection}
            onViewReport={handleViewReport}
            onBack={() => setCurrentTab('vehicles')}
          />
        )}

        {currentTab === 'booking' && (
          <Booking
            initialVehicleId={selectedVehicleId}
            vehicles={vehicles}
            onBookingSuccess={() => setCurrentTab('my-bookings')}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'my-bookings' && (
          <MyBookings
            onNavigateTab={handleSelectTab}
            onViewReport={handleViewReport}
          />
        )}

        {currentTab === 'reports' && (
          <Report
            initialReportId={selectedReportId}
            onBack={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'favorites' && (
          <div className="max-w-screen" style={{ paddingTop: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                관심 등록 차량 ({favoriteVehicles.length})
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                점검을 희망하거나 찜해둔 중고차 목록입니다.
              </p>
            </div>

            {favoriteVehicles.length === 0 ? (
              <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
                <Car size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  관심 등록된 차량이 없습니다.
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
                  차량 목록에서 마음에 드는 차량을 북마크해 보세요.
                </p>
                <button
                  onClick={() => setCurrentTab('vehicles')}
                  style={{ padding: '10px 20px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  차량 보러가기
                </button>
              </div>
            ) : (
              <div className="vehicles-grid">
                {favoriteVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectVehicle={handleSelectVehicle}
                    onBookInspection={handleBookInspection}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer-wrapper">
        <div className="max-w-screen">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <Shield size={24} color="#60a5fa" />
                <span>AutoCheck 중고차 점검 플랫폼</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
                (주)오토체크는 국가 공인 기술자격과 첨단 장비를 바탕으로 객관적이고 투명한 중고차 정밀진단 서비스를 제공합니다.
              </p>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                고객센터 1588-0560 (평일 09:00 ~ 18:00)
              </div>
            </div>

            <div>
              <h4 className="footer-title">주요 서비스</h4>
              <ul className="footer-list">
                <li onClick={() => handleSelectTab('vehicles')}>차량 정밀 매물 조회</li>
                <li onClick={() => handleSelectTab('booking')}>점검 예약 신청</li>
                <li onClick={() => handleSelectTab('reports')}>공식 진단 리포트 열람</li>
                <li onClick={() => handleSelectTab('my-bookings')}>예약 내역 관리</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">직영 점검센터</h4>
              <ul className="footer-list">
                <li>AutoCheck 강남센터</li>
                <li>AutoCheck 수원센터 (도이치)</li>
                <li>AutoCheck 분당센터</li>
                <li>AutoCheck 인천센터 (M파크)</li>
                <li>AutoCheck 일산센터</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">진단 품질 보증</h4>
              <ul className="footer-list">
                <li>120개 항목 정밀진단 보증</li>
                <li>침수·전손·도막 두께 검증</li>
                <li>OBD-II 전자제어 스캔</li>
                <li>수석 정비기능장 책임진단제</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 AutoCheck Corporation. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>이용약관</span>
              <span>개인정보처리방침</span>
              <span>품질보증안내</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
