import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BugAlertPopup from './components/BugAlertPopup';
import Toast from './components/Toast';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetailPage from './pages/EventDetailPage';
import SchedulePage from './pages/SchedulePage';
import VenuePage from './pages/VenuePage';
import Reviews from './pages/Reviews';
import MyPage from './pages/MyPage';
import { api } from './api/client';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [eventsInitialParams, setEventsInitialParams] = useState({});
  const [favorites, setFavorites] = useState(['evt-101', 'evt-104']);
  const [reviewTargetEvent, setReviewTargetEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleNavigate = (tab, params = {}) => {
    setCurrentTab(tab);
    if (tab === 'events') {
      setEventsInitialParams(params);
    }
    if (tab !== 'event-detail') {
      setSelectedEventId(null);
    }
    if (tab !== 'venues') {
      setSelectedVenueId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setCurrentTab('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVenue = (venueId) => {
    setSelectedVenueId(venueId);
    setCurrentTab('venues');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (eventId) => {
    try {
      if (favorites.includes(eventId)) {
        await api.removeFavorite(eventId);
        setFavorites((prev) => prev.filter((id) => id !== eventId));
        showToast('관심 공연에서 해제되었습니다.', 'info');
      } else {
        await api.addFavorite(eventId);
        setFavorites((prev) => [...prev, eventId]);
        showToast('관심 공연으로 등록되었습니다. ❤️', 'success');
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleBookingSuccess = (bookingData) => {
    showToast(`좌석 ${bookingData.seat?.displayCode} 예매가 완료되었습니다!`, 'success');
  };

  const handleReviewSubmitted = () => {
    showToast('후기가 성공적으로 등록되었습니다!', 'success');
  };

  return (
    <div className="culture-app-layout">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        favoriteCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="culture-main-content">
        {currentTab === 'home' && (
          <Home
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectVenue={handleSelectVenue}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'events' && (
          <Events
            initialParams={eventsInitialParams}
            onSelectEvent={handleSelectEvent}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'event-detail' && selectedEventId && (
          <EventDetailPage
            eventId={selectedEventId}
            onBack={() => setCurrentTab('events')}
            onNavigateSchedule={() => setCurrentTab('schedule')}
            onOpenReviewModal={(evt) => setReviewTargetEvent(evt)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'schedule' && selectedEventId && (
          <SchedulePage
            eventId={selectedEventId}
            onBackToDetail={() => setCurrentTab('event-detail')}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {currentTab === 'venues' && (
          <VenuePage
            selectedVenueId={selectedVenueId}
            onSelectEvent={handleSelectEvent}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'mypage' && (
          <MyPage
            onSelectEvent={handleSelectEvent}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* Write Review Modal */}
      {reviewTargetEvent && (
        <Reviews
          event={reviewTargetEvent}
          onClose={() => setReviewTargetEvent(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Floating System Alerts and Toasts */}
      <BugAlertPopup />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="culture-footer">
        <div className="footer-container">
          <div className="footer-brand-section">
            <span className="footer-logo">🎟️ CulturePick</span>
            <p className="footer-desc">
              공연·전시·문화생활의 모든 것. 국내 최고 수준의 티켓 큐레이션 플랫폼 CulturePick.
            </p>
          </div>
          <div className="footer-links">
            <span>고객센터 1588-0000</span>
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>공연장 제휴안내</span>
          </div>
          <div className="footer-copyright">
            © 2026 CulturePick Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
