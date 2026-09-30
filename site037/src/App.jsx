import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Toast from './components/Toast';
import Modal from './components/Modal';

import Home from './pages/Home';
import Performances from './pages/Performances';
import Exhibitions from './pages/Exhibitions';
import Programs from './pages/Programs';
import MyTickets from './pages/MyTickets';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import Files from './pages/Files';
import Chat from './pages/Chat';
import Notices from './pages/Notices';
import Reviews from './pages/Reviews';
import Activity from './pages/Activity';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [toasts, setToasts] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: 'user-001',
    name: '김민지',
    email: 'minji@example.com',
    role: 'VIP Member',
    address: '서울특별시 마포구 월드컵북로 10',
    detailAddress: '101동 1204호',
    phone: '010-3342-8812',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    membershipPoints: 12500
  });

  // Booking Modal State
  const [bookingPerformance, setBookingPerformance] = useState(null);
  const [bookingDate, setBookingDate] = useState('2026-05-15');
  const [bookingSeat, setBookingSeat] = useState('R석 1층 B열 12번');
  const [ticketCount, setTicketCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const showToast = (title, message, type = 'info', txId = null, bugId = null, secId = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type, txId, bugId, secId }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleOpenBooking = (performance) => {
    setBookingPerformance(performance);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingPerformance) return;

    setBookingLoading(true);
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        performanceId: bookingPerformance.id,
        date: bookingDate,
        seat: bookingSeat,
        ticketCount: Number(ticketCount)
      })
    })
    .then(res => res.json())
    .then(data => {
      setBookingLoading(false);
      setBookingPerformance(null);
      showToast('예매 확정 완료', `[${data.performanceTitle}] 예매가 성공적으로 완료되었습니다!`, 'success');
      setCurrentPage('my-tickets');
    })
    .catch(err => {
      console.error(err);
      setBookingLoading(false);
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} onBookPerformance={handleOpenBooking} />;
      case 'performances':
        return <Performances showToast={showToast} onBookPerformance={handleOpenBooking} />;
      case 'exhibitions':
        return <Exhibitions showToast={showToast} />;
      case 'programs':
        return <Programs showToast={showToast} />;
      case 'my-tickets':
        return <MyTickets showToast={showToast} />;
      case 'login':
        return <Login setCurrentPage={setCurrentPage} setCurrentUser={setCurrentUser} showToast={showToast} />;
      case 'register':
        return <Register setCurrentPage={setCurrentPage} setCurrentUser={setCurrentUser} showToast={showToast} />;
      case 'mypage':
        return <MyPage currentUser={currentUser} setCurrentUser={setCurrentUser} showToast={showToast} />;
      case 'files':
        return <Files showToast={showToast} />;
      case 'chat':
        return <Chat showToast={showToast} currentUser={currentUser} />;
      case 'notices':
        return <Notices showToast={showToast} />;
      case 'reviews':
        return <Reviews showToast={showToast} currentUser={currentUser} />;
      case 'activity':
        return <Activity showToast={showToast} />;
      default:
        return <Home setCurrentPage={setCurrentPage} onBookPerformance={handleOpenBooking} />;
    }
  };

  return (
    <div className="stageon-app">
      <Header 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          showToast('로그아웃', '정상적으로 로그아웃되었습니다.', 'info');
        }}
      />

      <main className="main-content">
        {renderPage()}
      </main>

      {/* Booking Modal */}
      <Modal
        isOpen={!!bookingPerformance}
        onClose={() => setBookingPerformance(null)}
        title={bookingPerformance ? `[${bookingPerformance.title}] 공연 티켓 예매` : '공연 예매'}
      >
        <form onSubmit={handleConfirmBooking}>
          <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{bookingPerformance?.title}</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--dark-900)', marginTop: '2px' }}>
              공연장: {bookingPerformance?.venue} · 1인 티켓가: ₩{bookingPerformance?.price.toLocaleString()}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">관람 일자</label>
            <input
              type="date"
              className="form-control"
              value={bookingDate}
              onChange={e => setBookingDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">희망 좌석 구역</label>
            <input
              type="text"
              className="form-control"
              value={bookingSeat}
              onChange={e => setBookingSeat(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">매수 선택</label>
            <select
              className="form-control"
              value={ticketCount}
              onChange={e => setTicketCount(e.target.value)}
            >
              <option value="1">1매 (₩{bookingPerformance?.price.toLocaleString()})</option>
              <option value="2">2매 (₩{((bookingPerformance?.price || 0) * 2).toLocaleString()})</option>
              <option value="3">3매 (₩{((bookingPerformance?.price || 0) * 3).toLocaleString()})</option>
              <option value="4">4매 (₩{((bookingPerformance?.price || 0) * 4).toLocaleString()})</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBookingPerformance(null)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={bookingLoading}>
              {bookingLoading ? '예매 처리 중...' : '예매 확정'}
            </button>
          </div>
        </form>
      </Modal>

      <footer className="stageon-footer">
        <div className="footer-inner">
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>
              StageOn Culture & Performance Hub
            </div>
            <div style={{ fontSize: '0.82rem', color: '#a5b4fc' }}>
              서울특별시 마포구 월드컵북로 10 StageOn 아트센터 · 대표번호 02-1588-0037
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            © 2026 StageOn Platform. All Rights Reserved.
          </div>
        </div>
      </footer>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
