import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BugAlertPopup from './components/BugAlertPopup';
import Toast from './components/Toast';

import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetailPage from './pages/RoomDetailPage';
import MyBookings from './pages/MyBookings';
import Workspace from './pages/Workspace';
import Notices from './pages/Notices';

import { api } from './api/client';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [filterBranch, setFilterBranch] = useState('all');
  const [branches, setBranches] = useState([]);
  const [favorites, setFavorites] = useState(['room-001', 'room-003', 'room-007']);
  const [bookings, setBookings] = useState([]);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    async function initData() {
      try {
        const [branchRes, favRes, bookRes] = await Promise.all([
          api.getBranches(),
          api.getFavorites(),
          api.getBookings()
        ]);
        if (branchRes && branchRes.branches) {
          setBranches(branchRes.branches);
        }
        if (favRes && favRes.favorites) {
          setFavorites(favRes.favorites);
        }
        if (bookRes && bookRes.bookings) {
          setBookings(bookRes.bookings);
        }
      } catch (err) {
        console.error('Failed to init app data', err);
      }
    }
    initData();
  }, []);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setActivePage('room-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (roomId, isFav) => {
    setFavorites(prev => {
      if (isFav && !prev.includes(roomId)) return [...prev, roomId];
      if (!isFav && prev.includes(roomId)) return prev.filter(id => id !== roomId);
      return prev;
    });
  };

  const handleBookingCreated = (newBooking) => {
    if (newBooking) {
      setBookings(prev => [newBooking, ...prev.filter(b => b.id !== newBooking.id)]);
    }
  };

  return (
    <div className="app-container">
      <Header
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
      />

      <main className="main-content">
        {activePage === 'home' && (
          <Home
            setActivePage={setActivePage}
            onSelectRoom={handleSelectRoom}
            branches={branches}
            filterBranch={filterBranch}
            setFilterBranch={setFilterBranch}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showToast={showToast}
          />
        )}

        {activePage === 'rooms' && (
          <Rooms
            onSelectRoom={handleSelectRoom}
            branches={branches}
            filterBranch={filterBranch}
            setFilterBranch={setFilterBranch}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showToast={showToast}
          />
        )}

        {activePage === 'room-detail' && (
          <RoomDetailPage
            roomId={selectedRoomId}
            onBack={() => setActivePage('rooms')}
            setActivePage={setActivePage}
            showToast={showToast}
            onBookingCreated={handleBookingCreated}
          />
        )}

        {activePage === 'bookings' && (
          <MyBookings
            bookings={bookings}
            onUpdateBookings={(updated) => setBookings(updated)}
            onSelectRoom={handleSelectRoom}
            showToast={showToast}
          />
        )}

        {activePage === 'workspace' && (
          <Workspace
            onSelectRoom={handleSelectRoom}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showToast={showToast}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'notices' && (
          <Notices />
        )}
      </main>

      <footer style={{
        background: 'var(--navy-900)',
        color: '#94a3b8',
        padding: '40px 20px',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
              Space<span style={{ color: 'var(--indigo-500)' }}>Mate</span>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              전국 스마트 거점 오피스 및 스터디룸 실시간 예약 관리 플랫폼
            </div>
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            © 2026 SpaceMate Inc. All rights reserved. (Port: 9951)
          </div>
        </div>
      </footer>

      {/* Floating System / Bug Alert */}
      <BugAlertPopup />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
