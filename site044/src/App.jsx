import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import Toast from './components/Toast';

import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Reservations from './pages/Reservations';
import Wishlist from './pages/Wishlist';
import MyPage from './pages/MyPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [restaurants, setRestaurants] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [wishlist, setWishlist] = useState(['rest-01', 'rest-06', 'rest-07']);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Booking Modal State (SEC-401)
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingRest, setBookingRest] = useState(null);
  const [bookingDate, setBookingDate] = useState('2026-10-01');
  const [bookingTime, setBookingTime] = useState('19:00');
  const [bookingPartySize, setBookingPartySize] = useState(2);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const showToast = (message, bugId = null, secId = null, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, bugId, secId, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchInitialData = async () => {
    try {
      const [restRes, resvRes, wishRes] = await Promise.all([
        fetch('/api/restaurants'),
        fetch('/api/reservations'),
        fetch('/api/wishlist')
      ]);
      const restData = await restRes.json();
      const resvData = await resvRes.json();
      const wishData = await wishRes.json();

      if (restData.success) setRestaurants(restData.data);
      if (resvData.success) setReservations(resvData.data);
      if (wishData.success) setWishlist(wishData.data.map((r) => r.id));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSelectRestaurant = (rest) => {
    setSelectedRestaurant(rest);
    setCurrentPage('detail');
  };

  const handleOpenBooking = (rest, time = '19:00', date = '2026-10-01') => {
    setBookingRest(rest);
    setBookingTime(time);
    setBookingDate(date);
    setBookingPartySize(2);
    setBookingModalOpen(true);
  };

  // Submit Booking (SEC-401 trigger)
  const handleConfirmBooking = async () => {
    if (!bookingRest) return;
    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: bookingRest.id,
          date: bookingDate,
          time: bookingTime,
          partySize: bookingPartySize
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.message,
          data.bugId || 'site044-SEC-401',
          data.secId || 'SEC-401'
        );
        setBookingModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleToggleWishlist = async (restId) => {
    if (wishlist.includes(restId)) {
      setWishlist(wishlist.filter((id) => id !== restId));
      await fetch(`/api/wishlist/${restId}`, { method: 'DELETE' });
      showToast('저장 목록에서 삭제되었습니다.', null, null, 'info');
    } else {
      setWishlist([...wishlist, restId]);
      await fetch(`/api/wishlist/${restId}`, { method: 'POST' });
      showToast('레스토랑이 저장 목록에 추가되었습니다.');
    }
  };

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    const matchCat = activeCategory === 'all' || r.category.includes(activeCategory);
    const matchSearch = !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <Toast toasts={toasts} onClose={(id) => setToasts(toasts.filter((t) => t.id !== id))} />

      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        reservationCount={reservations.length}
        wishlistCount={wishlist.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Page Body */}
      <main className="main-wrapper">
        {currentPage === 'home' && (
          <Home
            restaurants={filteredRestaurants}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onSelectRestaurant={handleSelectRestaurant}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onQuickBook={handleOpenBooking}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'detail' && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onBack={() => setCurrentPage('home')}
            isWishlisted={wishlist.includes(selectedRestaurant?.id)}
            onToggleWishlist={handleToggleWishlist}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentPage === 'reservations' && (
          <Reservations showToast={showToast} />
        )}

        {currentPage === 'wishlist' && (
          <Wishlist
            wishlist={restaurants.filter((r) => wishlist.includes(r.id))}
            onSelectRestaurant={handleSelectRestaurant}
            onToggleWishlist={handleToggleWishlist}
            onQuickBook={handleOpenBooking}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'mypage' && (
          <MyPage
            user={{ name: '장민준', email: 'minjun.table@example.com', phone: '010-8392-1920', tier: 'TableNow 블랙 VIP' }}
            onNavigate={setCurrentPage}
          />
        )}
      </main>

      {/* Booking Modal (SEC-401) */}
      <Modal
        isOpen={bookingModalOpen}
        title={bookingRest ? `${bookingRest.name} 실시간 예약` : '레스토랑 예약'}
        onClose={() => setBookingModalOpen(false)}
        footer={
          <>
            <button
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e7e5e4', background: '#fff', cursor: 'pointer' }}
              onClick={() => setBookingModalOpen(false)}
            >
              취소
            </button>
            <button
              className="btn-terracotta"
              onClick={handleConfirmBooking}
              disabled={isSubmittingBooking}
            >
              {isSubmittingBooking ? '예약 확정 중...' : '예약 확정하기'}
            </button>
          </>
        }
      >
        {bookingRest && (
          <div>
            <div style={{ display: 'flex', gap: 14, background: '#f5f5f4', padding: 14, borderRadius: 12, marginBottom: 18 }}>
              <img src={bookingRest.image} alt="" style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1c1917' }}>{bookingRest.name}</div>
                <div style={{ fontSize: 13, color: '#c2410c', fontWeight: 600 }}>{bookingRest.category}</div>
                <div style={{ fontSize: 12, color: '#78716c' }}>{bookingRest.location}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">방문 희망 날짜</label>
              <input
                type="date"
                className="form-input"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">방문 시간대</label>
              <select
                className="form-select"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              >
                <option value="12:00">12:00 (런치)</option>
                <option value="13:00">13:00 (런치)</option>
                <option value="18:00">18:00 (디너 1부)</option>
                <option value="19:00">19:00 (디너 메인)</option>
                <option value="20:00">20:00 (디너 2부)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">방문 인원수</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={bookingPartySize}
                onChange={(e) => setBookingPartySize(parseInt(e.target.value) || 2)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
