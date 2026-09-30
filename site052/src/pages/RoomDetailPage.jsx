import React, { useState, useEffect } from 'react';
import RoomDetail from '../components/RoomDetail';
import BookingPanel from '../components/BookingPanel';
import { api } from '../api/client';

export default function RoomDetailPage({ roomId, onBack, setActivePage, showToast, onBookingCreated }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoom() {
      if (!roomId) return;
      setLoading(true);
      try {
        const res = await api.getRoomById(roomId);
        if (res && res.room) {
          setRoom(res.room);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRoom();
  }, [roomId]);

  const handleBookingSuccess = (createdBooking) => {
    if (onBookingCreated) {
      onBookingCreated(createdBooking);
    }
    setActivePage('bookings');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--navy-500)', fontSize: '1.1rem' }}>
        공간 정보를 불러오는 중...
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>공간을 찾을 수 없습니다.</h2>
        <button className="btn-primary" style={{ marginTop: '16px' }} onClick={onBack}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="detail-layout">
      <RoomDetail room={room} onBack={onBack} />
      <div className="detail-side">
        <BookingPanel
          room={room}
          onBookingSuccess={handleBookingSuccess}
          showToast={showToast}
        />
      </div>
    </div>
  );
}
