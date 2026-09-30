import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import EventCard from '../components/EventCard';

export default function MyPage({ onSelectEvent, onToggleFavorite }) {
  const [userData, setUserData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyPage();
  }, []);

  const loadMyPage = async () => {
    try {
      setLoading(true);
      const data = await api.getMyPage();
      if (data && data.success) {
        setUserData(data.user);
        setFavorites(data.favorites || []);
        setBookings(data.recentBookings || []);
      }
    } catch (err) {
      console.error('Failed to load my page', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFav = async (eventId) => {
    await onToggleFavorite(eventId);
    setFavorites((prev) => prev.filter((f) => f.id !== eventId));
  };

  if (loading) {
    return <div className="page-loading-spinner">마이페이지 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="mypage-container">
      {/* Profile Header Card */}
      {userData && (
        <div className="profile-hero-card">
          <div className="profile-avatar-circle">🎭</div>
          <div className="profile-info-block">
            <div className="profile-badge-line">
              <span className="membership-grade-badge">{userData.membershipGrade}</span>
            </div>
            <h1 className="profile-name">{userData.name} 님</h1>
            <p className="profile-fav-genre">선호 장르: {userData.favoriteGenre}</p>
          </div>

          <div className="profile-stats-grid">
            <div className="stat-box">
              <span className="stat-label">누적 관람 공연</span>
              <span className="stat-number">{userData.totalWatched}회</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">컬처 마일리지</span>
              <span className="stat-number highlight-points">{userData.points?.toLocaleString()} P</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">관심 등록</span>
              <span className="stat-number">{favorites.length}개</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings Section */}
      <section className="mypage-section">
        <h2 className="section-title">🎟️ 최근 예매 내역 ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <div className="empty-state-box">최근 예매한 공연 내역이 없습니다.</div>
        ) : (
          <div className="bookings-list">
            {bookings.map((bk) => (
              <div key={bk.id} className="booking-item-card">
                <div className="booking-main">
                  <span className="booking-status-tag">{bk.status}</span>
                  <h3 className="booking-event-title">{bk.eventTitle}</h3>
                  <p className="booking-venue">📍 {bk.venueName}</p>
                </div>
                <div className="booking-meta">
                  <div className="booking-datetime">📅 {bk.date}</div>
                  <div className="booking-seat">🪑 좌석: {bk.seat}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Favorites Section */}
      <section className="mypage-section">
        <h2 className="section-title">❤️ 관심 등록한 공연·전시 ({favorites.length})</h2>
        {favorites.length === 0 ? (
          <div className="empty-state-box">
            관심 등록한 공연이 없습니다. 마음에 드는 공연에 하트를 눌러보세요!
          </div>
        ) : (
          <div className="events-card-grid">
            {favorites.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={onSelectEvent}
                isFavorite={true}
                onToggleFavorite={handleRemoveFav}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
