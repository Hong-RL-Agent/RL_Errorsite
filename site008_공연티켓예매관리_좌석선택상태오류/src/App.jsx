import React, { useState, useEffect } from 'react';

export default function App() {
  // Shows list
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  
  // Date & Session selection
  const [selectedDate, setSelectedDate] = useState('2026-07-10');
  const [selectedSession, setSelectedSession] = useState('1회차 (14:00)');

  // Seat booking state
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]); // Loaded from API
  const [userName, setUserName] = useState('');
  
  // History & Tabs
  const [activeTab, setActiveTab] = useState('booking'); // booking, history
  const [bookings, setBookings] = useState([]);

  // UI Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [toasts, setToasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadShows();
    loadBookings();
  }, []);

  useEffect(() => {
    if (selectedShow) {
      loadReservedSeats();
    }
  }, [selectedShow, selectedDate, selectedSession]);

  const loadShows = async () => {
    try {
      const res = await fetch('/api/shows');
      const data = await res.json();
      setShows(data);
      if (data.length > 0) {
        setSelectedShow(data[0]);
      }
    } catch (err) {
      showToast('공연 목록을 불러올 수 없습니다.', 'danger');
    }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      showToast('예매 내역 로딩 실패', 'danger');
    }
  };

  const loadReservedSeats = async () => {
    if (!selectedShow) return;
    try {
      const res = await fetch(`/api/shows/seats?showId=${selectedShow.id}&session=${encodeURIComponent(selectedSession)}`);
      const data = await res.json();
      setReservedSeats(data);
    } catch (err) {
      showToast('실시간 좌석 정보 수집 실패', 'danger');
    }
  };

  // Error 1: Switch session without clearing seats if A-03 selected
  const handleSessionChange = (sessionName) => {
    setSelectedSession(sessionName);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 사용자가 VIP 좌석인 'A-03'을 장바구니/선택 목록에 포함한 상태에서 
    // 공연 회차(Session)를 변경할 경우, 선택된 좌석 목록을 초기화하는 상태 갱신 코드(setSelectedSeats)를 
    // 조건문으로 우회하여 이전 회차의 예매 정보 상태가 그대로 겹치도록 유도합니다.
    const hasA03 = selectedSeats.includes('A-03');
    if (!hasA03) {
      setSelectedSeats([]);
    } else {
      showToast('주의: 좌석 A-03 선택 상태로 인해 이전 회차 예약 좌석이 제거되지 않았습니다.', 'warning');
    }
  };

  // Seat price mapping helper
  const getSeatPrice = (seatId) => {
    if (!selectedShow) return 0;
    if (seatId.startsWith('A-')) return selectedShow.priceVIP;
    if (seatId.startsWith('B-')) return selectedShow.priceR;
    return selectedShow.priceS;
  };

  const getSeatGrade = (seatId) => {
    if (seatId.startsWith('A-')) return 'VIP';
    if (seatId.startsWith('B-')) return 'R석';
    return 'S석';
  };

  const toggleSeatSelection = (seatId) => {
    if (reservedSeats.includes(seatId)) {
      showToast('이미 다른 예매자가 결제 완료한 좌석입니다.', 'warning');
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  // Error 4: Realtime seats API mismatch (404)
  const refreshSeatsRealtime = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: '좌석 현황 새로고침' 기능 실행 시 백엔드에 존재하지 않는 API 주소인 
    // '/api/shows/seats/realtime-v2'로 요청을 송신하게 설계하여 브라우저 네트워크 응답 404 에러를 의도합니다.
    try {
      const res = await fetch(`/api/shows/seats/realtime-v2?showId=${selectedShow?.id}`);
      if (!res.ok) {
        throw new Error(`HTTP 에러 코드: ${res.status}`);
      }
      showToast('좌석 정보가 동기화되었습니다.', 'success');
    } catch (err) {
      showToast(`[네트워크 에러] 실시간 연동 리소스를 찾을 수 없습니다: ${err.message}`, 'danger');
    }
  };

  // Error 5: Gateway / Proxy route configuration mismatch (booking-api)
  const executeBooking = async () => {
    if (!userName.trim()) {
      showToast('예매자명을 기입해 주셔야 처리됩니다.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    const payload = {
      showId: selectedShow.id,
      session: selectedSession,
      seats: selectedSeats,
      userName
    };

    // INTENTIONAL_ERROR
    // CATEGORY: Infrastructure
    // DESCRIPTION: 예매를 확정 짓고 백엔드로 전송하는 단계에서, 프록시 규칙(/api)이 매핑되지 않은 
    // '/booking-api/reservations' 경로로 최종 전송을 강제합니다. 이로 인해 Vite 개발 서버가 요청을 백엔드 
    // Express 서버로 우회시키지 못하고 404 Page Not Found 에러가 발생하게 만들어 통신 장애를 유발합니다.
    try {
      const res = await fetch('/booking-api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '예매 실패');
      }

      showToast('공연 예매가 확정되었습니다! 내역에서 확인하세요.', 'success');
      setSelectedSeats([]);
      setShowConfirmModal(false);
      loadBookings();
      loadReservedSeats();
      setActiveTab('history');
    } catch (err) {
      showToast(`[인프라 게이트웨이 오류] 예매 경로 호출 불가: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelBookingRecord = async (bookingId) => {
    if (!confirm('예매한 티켓 공연을 취소하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/reservations/${bookingId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('티켓 취소가 완료되었습니다.', 'success');
        loadBookings();
        loadReservedSeats();
      }
    } catch (err) {
      showToast('네트워크 통신 중 에러가 발생했습니다.', 'danger');
    }
  };

  const getOverallTotalCost = () => {
    return selectedSeats.reduce((sum, s) => sum + getSeatPrice(s), 0);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Semicircle rendering configs
  const rows = [
    { name: 'A', label: 'VIP석', count: 6, color: '#ec4899' },
    { name: 'B', label: 'R석', count: 8, color: '#f59e0b' },
    { name: 'C', label: 'S석', count: 10, color: '#3b82f6' }
  ];

  return (
    <div className="stagepick-app">
      {/* App Navbar */}
      <header className="app-navbar">
        <div className="navbar-logo">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-title">StagePick</span>
          <span className="logo-subtitle">티켓팅 및 좌석 대시보드</span>
        </div>
        <div className="navbar-actions">
          <button className={`nav-btn ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}>
            🎫 공연 예매하기
          </button>
          <button className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            📂 나의 예매내역 ({bookings.length})
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      {activeTab === 'booking' ? (
        <div className="booking-grid">
          {/* Left panel: Show selections, date, session */}
          <aside className="panel-section column-schedule">
            <div className="panel-header">
              <h2>🎭 예매 대상 공연 선택</h2>
            </div>
            
            <div className="shows-vertical-list">
              {shows.map(show => (
                <button 
                  key={show.id} 
                  className={`show-list-card ${selectedShow && selectedShow.id === show.id ? 'active' : ''}`}
                  onClick={() => setSelectedShow(show)}
                >
                  <span className="show-cat">{show.category}</span>
                  <h4>{show.name}</h4>
                  <span className="show-loc">📍 {show.location}</span>
                </button>
              ))}
            </div>

            <div className="date-picker-box">
              <h3>📅 관람 일정 선택</h3>
              <div className="date-buttons">
                {['2026-07-10', '2026-07-11'].map(d => (
                  <button 
                    key={d} 
                    className={selectedDate === d ? 'active' : ''} 
                    onClick={() => setSelectedDate(d)}
                  >
                    {d.slice(5)}
                  </button>
                ))}
              </div>
            </div>

            <div className="session-picker-box">
              <h3>⏰ 공연 회차 선택</h3>
              <div className="session-buttons">
                {['1회차 (14:00)', '2회차 (19:00)'].map(s => (
                  <button 
                    key={s} 
                    className={selectedSession === s ? 'active' : ''} 
                    onClick={() => handleSessionChange(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Center panel: Semicircular Seat layout */}
          <main className="panel-section column-theater">
            <div className="panel-header theater-header-row">
              <div>
                <h2>🏟️ {selectedShow?.name || '공연'} 좌석 배치도</h2>
                <p className="subtitle">무대를 중심으로 라운드 배치되어 있습니다.</p>
              </div>
              <div className="theater-control-buttons">
                <button className="realtime-refresh-btn" onClick={refreshSeatsRealtime}>
                  🔄 좌석 현황 새로고침
                </button>
                <div className="zoom-adjuster">
                  <button onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.1))}>🔍-</button>
                  <span className="scale-num">{Math.round(zoomScale * 100)}%</span>
                  <button onClick={() => setZoomScale(prev => Math.min(1.5, prev + 0.1))}>🔍+</button>
                </div>
              </div>
            </div>

            {/* Stage Screen header */}
            <div className="theater-stage-board">
              <span>S T A G E (무 대)</span>
            </div>

            {/* Zoomable seat map container */}
            <div className="seat-scroll-container">
              <div className="theater-seats-curved-map" style={{ transform: `scale(${zoomScale})` }}>
                {rows.map((rowConfig, rowIndex) => {
                  return (
                    <div key={rowConfig.name} className="curved-seat-row">
                      <span className="row-label">{rowConfig.name}열</span>
                      <div className="seats-arch-group">
                        {Array.from({ length: rowConfig.count }).map((_, seatIdx) => {
                          const seatNumber = seatIdx + 1;
                          const seatId = `${rowConfig.name}-${seatNumber.toString().padStart(2, '0')}`;
                          const isReserved = reservedSeats.includes(seatId);
                          const isSelected = selectedSeats.includes(seatId);

                          // Calculate curvature transform
                          const angle = ((seatIdx - (rowConfig.count - 1) / 2) * 16) / (rowIndex + 1.5);
                          const seatStyle = {
                            transform: `rotate(${angle}deg) translateY(${rowIndex * 10}px)`,
                            backgroundColor: isReserved 
                              ? '#cbd5e1' 
                              : isSelected 
                                ? '#ec4899' 
                                : rowConfig.color
                          };

                          return (
                            <button
                              key={seatId}
                              className={`seat-unit ${isReserved ? 'reserved' : ''} ${isSelected ? 'selected' : ''}`}
                              style={seatStyle}
                              onClick={() => toggleSeatSelection(seatId)}
                              title={`${seatId} (${rowConfig.label})`}
                            >
                              <span className="seat-text">{seatNumber}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seat Grades Legands */}
            <div className="grade-legend-row">
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#ec4899' }}></span><span>VIP석 (₩{selectedShow?.priceVIP.toLocaleString()})</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span><span>R석 (₩{selectedShow?.priceR.toLocaleString()})</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span><span>S석 (₩{selectedShow?.priceS.toLocaleString()})</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#cbd5e1' }}></span><span>예매완료</span></div>
            </div>
          </main>

          {/* Right panel: Selection sidebar */}
          <aside className="panel-section column-checkout">
            <div className="panel-header">
              <h2>🛒 예매 선택 상세 내역</h2>
            </div>

            <div className="checkout-summary-box">
              {selectedSeats.length === 0 ? (
                <div className="empty-selection-placeholder">
                  배치도 무대를 바라보고 선호하시는 구역의 좌석을 터치하여 선택해 주세요.
                </div>
              ) : (
                <div className="selected-seats-list">
                  {selectedSeats.map(seatId => (
                    <div key={seatId} className="seat-summary-row">
                      <div className="seat-left-info">
                        <span className="tag-grade">{getSeatGrade(seatId)}</span>
                        <strong>{seatId} 좌석</strong>
                      </div>
                      <span className="price-lbl">₩{getSeatPrice(seatId).toLocaleString()}</span>
                    </div>
                  ))}

                  <div className="receipt-border">
                    <div className="receipt-line">
                      <span>총 예매 좌석</span>
                      <span>{selectedSeats.length}석</span>
                    </div>
                    <div className="receipt-line total-cost">
                      <span>최종 합계 금액</span>
                      <span>₩{getOverallTotalCost().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Submit Box */}
                  <div className="submit-user-form">
                    <label>👤 예매인 성함 입력</label>
                    <input 
                      type="text" 
                      placeholder="주문자 성함" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    <button className="confirm-btn" onClick={() => setShowConfirmModal(true)}>
                      티켓 예매하기
                    </button>
                    <p className="help-text">VIP 좌석을 3개 이상 한 번에 주문하면 백엔드에서 에러(HTTP 500)가 납니다.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : (
        /* Tab: Reservations History */
        <section className="panel-section history-panel-full">
          <div className="panel-header">
            <h2>📂 내 티켓 예매 내역 현황</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="empty-placeholder">
              예매 완료된 내역이 존재하지 않습니다.
            </div>
          ) : (
            <div className="history-cards-grid">
              {bookings.map(book => {
                const showInfo = shows.find(s => s.id === book.showId);
                return (
                  <div key={book.id} className="booking-receipt-card">
                    <div className="receipt-header">
                      <span className="b-id">예매번호: {book.id}</span>
                      <button className="cancel-ticket-btn" onClick={() => cancelBookingRecord(book.id)}>
                        티켓 취소
                      </button>
                    </div>
                    <div className="receipt-body">
                      <h3>{showInfo ? showInfo.name : '로딩 중'}</h3>
                      <p>일시: <strong>{selectedDate} | {book.session}</strong></p>
                      <p>좌석번호: <strong className="seat-badge">{book.seat}</strong> ({getSeatGrade(book.seat)})</p>
                      <p>예매자명: <strong>{book.userName}</strong></p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Confirmation Modal (Error 5 Trigger) */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <div className="modal-header">
              <h3>🎫 예매 확정 정보 확인</h3>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>공연명: <strong>{selectedShow?.name}</strong></p>
              <p>관람 일자: <strong>{selectedDate}</strong></p>
              <p>공연 회차: <strong>{selectedSession}</strong></p>
              <p>선택 좌석: <strong>{selectedSeats.join(', ')}</strong></p>
              <p>예매인: <strong>{userName}</strong></p>
              <p className="total-cost-line">총 결제금액: <strong>₩{getOverallTotalCost().toLocaleString()}</strong></p>
            </div>
            <div className="modal-footer">
              <button className="cancel-modal-btn" onClick={() => setShowConfirmModal(false)}>취소</button>
              <button className="submit-modal-btn" onClick={executeBooking} disabled={isSubmitting}>
                {isSubmitting ? '승인 중...' : '결제 및 예매 확정'}
              </button>
            </div>
            <p className="help-text text-center text-rose">이 창에서 예매를 확정하면 미승인 프록시 경로(/booking-api)를 타기 때문에 게이트웨이 404가 발생합니다.</p>
          </div>
        </div>
      )}

      {/* Toast Alert Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
