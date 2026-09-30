import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import BugAlertPopup from './components/BugAlertPopup';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ExperienceDetail from './pages/ExperienceDetail';
import Reservations from './pages/Reservations';
import ReservationDetail from './pages/ReservationDetail';
import Wishlist from './pages/Wishlist';
import Reviews from './pages/Reviews';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import HostDashboard from './pages/HostDashboard';
import Settings from './pages/Settings';
import { Sparkles, Heart, Shield, Compass, CalendarCheck, HelpCircle } from 'lucide-react';
import Modal from './components/Modal';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [exploreParams, setExploreParams] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [bugAlerts, setBugAlerts] = useState([]);

  // Terms & Policy Modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalTitle, setTermsModalTitle] = useState('');
  const [termsModalContent, setTermsModalContent] = useState('');

  // Listen for bug detection events
  useEffect(() => {
    const handleBugDetected = (e) => {
      const bugData = e.detail;
      const alertId = Date.now() + Math.random();
      setBugAlerts(prev => [
        { id: alertId, ...bugData },
        ...prev.slice(0, 3) // keep at most 4
      ]);

      setTimeout(() => {
        setBugAlerts(prev => prev.filter(b => b.id !== alertId));
      }, 7000);
    };

    window.addEventListener('tripnest-bug-detected', handleBugDetected);
    return () => window.removeEventListener('tripnest-bug-detected', handleBugDetected);
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleSelectExperience = (expId) => {
    setSelectedExperienceId(expId);
    setActivePage('experience-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReservation = (resId) => {
    setSelectedReservationId(resId);
    setActivePage('reservation-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateExplore = (params = {}) => {
    setExploreParams(params);
    setActivePage('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReservationComplete = (reservation) => {
    setSelectedReservationId(reservation.id);
    setActivePage('reservation-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTerms = (title, content) => {
    setTermsModalTitle(title);
    setTermsModalContent(content);
    setShowTermsModal(true);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearchKeyword={(kw) => handleNavigateExplore({ keyword: kw })}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activePage === 'home' && (
          <Home
            onSelectExperience={handleSelectExperience}
            onNavigateExplore={handleNavigateExplore}
            onShowToast={showToast}
          />
        )}

        {activePage === 'explore' && (
          <Explore
            initialParams={exploreParams}
            onSelectExperience={handleSelectExperience}
          />
        )}

        {activePage === 'experience-detail' && (
          <ExperienceDetail
            experienceId={selectedExperienceId}
            onBack={() => setActivePage('explore')}
            onReservationComplete={handleReservationComplete}
            onShowToast={showToast}
            onNavigateMessages={() => setActivePage('messages')}
          />
        )}

        {activePage === 'reservations' && (
          <Reservations
            onSelectReservation={handleSelectReservation}
            onNavigateExplore={() => handleNavigateExplore({})}
            onShowToast={showToast}
          />
        )}

        {activePage === 'reservation-detail' && (
          <ReservationDetail
            reservationId={selectedReservationId}
            onBack={() => setActivePage('reservations')}
            onShowToast={showToast}
          />
        )}

        {activePage === 'wishlist' && (
          <Wishlist
            onSelectExperience={handleSelectExperience}
            onNavigateExplore={() => handleNavigateExplore({})}
          />
        )}

        {activePage === 'reviews' && (
          <Reviews
            onNavigateReservations={() => setActivePage('reservations')}
            onShowToast={showToast}
          />
        )}

        {activePage === 'messages' && (
          <Messages onShowToast={showToast} />
        )}

        {activePage === 'notifications' && (
          <Notifications onNavigatePage={(page) => setActivePage(page)} />
        )}

        {activePage === 'profile' && (
          <Profile onShowToast={showToast} />
        )}

        {activePage === 'host' && (
          <HostDashboard
            onSelectExperience={handleSelectExperience}
            onShowToast={showToast}
          />
        )}

        {activePage === 'settings' && (
          <Settings onShowToast={showToast} />
        )}
      </main>

      {/* Global Toast Container */}
      <Toast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Bug Alert Popup Container */}
      <BugAlertPopup 
        bugAlerts={bugAlerts} 
        onDismiss={(id) => setBugAlerts(prev => prev.filter(b => b.id !== id))} 
      />

      {/* Terms & Policy Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title={termsModalTitle}
      >
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-main)', maxHeight: 400, overflowY: 'auto' }}>
          <p style={{ whiteSpace: 'pre-line' }}>{termsModalContent}</p>
        </div>
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button onClick={() => setShowTermsModal(false)} className="btn btn-primary btn-sm">
            확인
          </button>
        </div>
      </Modal>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '40px 20px',
        color: 'var(--text-muted)',
        marginTop: 60
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div 
              onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--sky-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-navy)' }}>TripNest</span>
            </div>

            <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => { setActivePage('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                체험 탐색
              </span>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => { setActivePage('host'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                호스트 센터
              </span>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => openTerms('TripNest 서비스 이용약관', `제1조 (목적) 본 약관은 TripNest(이하 "회사")가 제공하는 로컬 이벤트 및 원데이 체험 예약 플랫폼 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (예약 및 결제) 이용자는 회사가 제공하는 플랫폼을 통해 호스트의 체험을 예약하고 결제를 진행할 수 있으며, 결제 완료 시 예약이 확정됩니다.\n\n제3조 (환불 규정) 체험 개시 3일 전 취소 시 100% 전액 환불, 1일 전 취소 시 50% 환불, 당일 취소는 원칙적으로 불가합니다.`)}
              >
                이용약관
              </span>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => openTerms('개인정보처리방침', `TripNest는 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 따라 이용자의 개인정보를 안전하게 보호하고 있습니다.\n\n1. 수집하는 개인정보 항목: 이름, 이메일, 휴대전화번호, 예약 내역\n2. 개인정보의 수집 및 이용목적: 원데이 클래스 예약 확인, 호스트 매칭, 고객 상담 및 알림 발송\n3. 보유 및 이용기간: 회원 탈퇴 시 또는 법정 보존 기한까지 안전하게 보관 후 파기합니다.`)}
              >
                개인정보처리방침
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-light)', flexWrap: 'wrap', gap: 8 }}>
            <span>© 2026 TripNest Inc. All rights reserved. 대한민국 로컬 이벤트 & 원데이 체험 예약 플랫폼</span>
            <span>고객센터: support@tripnest.kr | 1588-0000 (평일 09:00 ~ 18:00)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
