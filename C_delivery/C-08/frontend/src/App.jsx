import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SpaceTimeline from './components/SpaceTimeline';
import SpaceGrid from './components/SpaceGrid';
import MyReservations from './components/MyReservations';
import BookingModal from './components/BookingModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('spaces'); // timeline, spaces, reservations
  const [spaces, setSpaces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  
  // Booking modal
  const [bookingModalState, setBookingModalState] = useState({
    isOpen: false,
    space: null,
    date: '2026-10-15',
    startTime: '10:00',
    endTime: '11:00'
  });

  const fetchData = async () => {
    try {
      const [spacesRes, resRes] = await Promise.all([
        fetch('http://localhost:5007/api/spaces'),
        fetch('http://localhost:5007/api/reservations')
      ]);
      const spacesData = await spacesRes.json();
      const resData = await resRes.json();
      setSpaces(spacesData);
      setReservations(resData);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = async () => {
    setResetLoading(true);
    try {
      await fetch('http://localhost:5007/api/test/reset', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSelectSlot = (space, date, startTime, endTime) => {
    setBookingModalState({
      isOpen: true,
      space,
      date,
      startTime,
      endTime
    });
  };

  const handleBookSpace = (space) => {
    setBookingModalState({
      isOpen: true,
      space,
      date: '2026-10-15',
      startTime: '10:00',
      endTime: '11:00'
    });
  };

  const handleCloseModal = () => {
    setBookingModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onReset={handleReset}
        resetLoading={resetLoading}
      />

      <main style={{ flex: 1, padding: '32px 0 64px 0' }}>
        <div className="container">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              StayMeet 데이터를 불러오는 중입니다...
            </div>
          ) : (
            <>
              {currentTab === 'timeline' && (
                <SpaceTimeline
                  spaces={spaces}
                  reservations={reservations}
                  onSelectSlot={handleSelectSlot}
                  onSelectSpace={handleBookSpace}
                />
              )}

              {currentTab === 'spaces' && (
                <SpaceGrid
                  spaces={spaces}
                  onBookSpace={handleBookSpace}
                />
              )}

              {currentTab === 'reservations' && (
                <MyReservations
                  onRevisit={fetchData}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 0',
        background: 'var(--bg-surface)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>© 2026 StayMeet Inc. All rights reserved. (Validation Environment C-08)</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>환불규정</span>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {bookingModalState.isOpen && bookingModalState.space && (
        <BookingModal
          space={bookingModalState.space}
          initialDate={bookingModalState.date}
          initialStartTime={bookingModalState.startTime}
          initialEndTime={bookingModalState.endTime}
          onClose={handleCloseModal}
          onReservationCreated={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
