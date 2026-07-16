import React, { useState, useEffect } from 'react';

export default function App() {
  // Database States
  const [seats, setSeats] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  // Navigation States
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedZone, setSelectedZone] = useState('A');
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  // Form States
  const [userName, setUserName] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-06-30');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  
  // Amendment States
  const [editingRsv, setEditingRsv] = useState(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  // UI States
  const [toasts, setToasts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // Constants
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  useEffect(() => {
    loadSeats();
    loadReservations();
  }, []);

  const loadSeats = async () => {
    try {
      const res = await fetch('/api/seats');
      const data = await res.json();
      setSeats(data);
    } catch (err) {
      showToast('좌석 정보를 가져오는 데 실패했습니다.', 'danger');
    }
  };

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      showToast('예약 정보를 가져오는 데 실패했습니다.', 'danger');
    }
  };

  // Error 5 refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/reservations/refresh');
      const data = await res.json();
      setReservations(data);
      showToast('예약 현황이 새로고침 되었습니다.', 'success');
    } catch (err) {
      showToast('예약 현황 갱신 오류가 발생했습니다.', 'danger');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toast Helpers
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Zone Change with Error 1
  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 구역(Zone) 변경 시 현재 선택된 좌석 상태(selectedSeat)를 null로 클리어하지 
    // 않고 이전 상태 그대로 노출하여, A구역 좌석을 고른 뒤 B구역으로 넘어가도 우측 세부 폼엔 
    // 계속 A구역의 좌석 정보가 묶인 채 유지되도록 유도합니다.
    /* setSelectedSeat(null); */
  };

  const handleFloorChange = (floorNum) => {
    setSelectedFloor(floorNum);
    setSelectedSeat(null);
    if (floorNum === 1) {
      setSelectedZone('A');
    } else {
      setSelectedZone('D');
    }
  };

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setIsMobilePanelOpen(true);
  };

  // Create booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeat) {
      showToast('예약할 좌석을 평면도에서 선택해 주세요.', 'warning');
      return;
    }
    if (!userName.trim()) {
      showToast('예약자 성함을 입력해 주세요.', 'warning');
      return;
    }

    const payload = {
      floor: selectedFloor,
      zone: selectedZone,
      seatId: selectedSeat.id,
      seatName: selectedSeat.name,
      userName,
      date: bookingDate,
      startTime,
      endTime
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '예약 실패');
      }

      showToast(`좌석 ${selectedSeat.id} 예약이 완료되었습니다.`, 'success');
      setUserName('');
      setIsMobilePanelOpen(false);
      loadReservations();
    } catch (err) {
      showToast(`예약 에러: ${err.message}`, 'danger');
    }
  };

  // Cancel booking
  const handleCancelBooking = async (id) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('예약이 정상적으로 취소되었습니다.', 'success');
        loadReservations();
      } else {
        const data = await res.json();
        showToast(`취소 에러: ${data.error}`, 'danger');
      }
    } catch (err) {
      showToast('네트워크 통신 중 오류가 발생했습니다.', 'danger');
    }
  };

  // Edit booking modal trigger
  const startAmendBooking = (rsv) => {
    setEditingRsv(rsv);
    setEditStartTime(rsv.startTime);
    setEditEndTime(rsv.endTime);
  };

  // Submit Amendment
  const handleAmendSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/reservations/${editingRsv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: editStartTime,
          endTime: editEndTime,
          date: editingRsv.date,
          seatId: editingRsv.seatId
        })
      });
      const data = await res.json();

      if (!res.ok) {
        // This will capture Error 2 (returns 500 status when end <= start)
        throw new Error(data.error || '예약 변경 실패');
      }

      showToast('진료 예약 변경이 저장되었습니다.', 'success');
      setEditingRsv(null);
      loadReservations();
    } catch (err) {
      showToast(`변경 실패: ${err.message}`, 'danger');
    }
  };

  // Check if a seat is currently reserved at any overlapping time
  const isSeatOccupiedNow = (seatId) => {
    return reservations.some(r => r.seatId === seatId && r.date === bookingDate);
  };

  const getSeatOccupants = (seatId) => {
    return reservations.filter(r => r.seatId === seatId && r.date === bookingDate);
  };

  return (
    <div className="deskflow-app">
      {/* Top Navbar */}
      <header className="app-navbar">
        <div className="navbar-logo">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9h18M3 15h18M5 3v18M19 3v18" />
          </svg>
          <span className="logo-title">DeskFlow</span>
          <span className="logo-subtitle">스마트 공유오피스 좌석 관리</span>
        </div>
        <div className="navbar-actions">
          <button 
            className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? '⏳ 예약 동기화 중...' : '🔄 예약 현황 새로고침'}
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="dashboard-grid">
        {/* Left column: Floors and Zones */}
        <aside className="panel-section column-menu">
          <div className="menu-group">
            <h3>층 선택</h3>
            <div className="floors-menu-list">
              <button 
                className={selectedFloor === 1 ? 'active' : ''} 
                onClick={() => handleFloorChange(1)}
              >
                🏢 1층 (Focus &amp; Collab)
              </button>
              <button 
                className={selectedFloor === 2 ? 'active' : ''} 
                onClick={() => handleFloorChange(2)}
              >
                🏢 2층 (Deep Focus - 2층 레이아웃 에러)
              </button>
            </div>
          </div>

          <div className="menu-group" style={{ marginTop: '2rem' }}>
            <h3>구역(Zone) 필터</h3>
            <div className="zones-menu-list">
              {selectedFloor === 1 ? (
                <>
                  <button className={selectedZone === 'A' ? 'active' : ''} onClick={() => handleZoneChange('A')}>
                    🔵 A구역 - 포커스 존
                  </button>
                  <button className={selectedZone === 'B' ? 'active' : ''} onClick={() => handleZoneChange('B')}>
                    🟢 B구역 - 워크 존
                  </button>
                  <button className={selectedZone === 'C' ? 'active' : ''} onClick={() => handleZoneChange('C')}>
                    🟡 C구역 - 협업 존
                  </button>
                </>
              ) : (
                <>
                  <button className={selectedZone === 'D' ? 'active' : ''} onClick={() => handleZoneChange('D')}>
                    🔴 D구역 - 집중 업무 존
                  </button>
                  <button className={selectedZone === 'E' ? 'active' : ''} onClick={() => handleZoneChange('E')}>
                    🟣 E구역 - 오픈 세미나 존
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="legend-box" style={{ marginTop: '2rem' }}>
            <h4>좌석 유형 및 형태</h4>
            <div className="legend-items">
              <div className="legend-item"><span className="shape circle"></span> 1인 포커스석 (원형)</div>
              <div className="legend-item"><span className="shape square"></span> 일반 데스크석 (사각형)</div>
              <div className="legend-item"><span className="shape table"></span> 공동 롱 테이블 (타원형)</div>
            </div>
          </div>
        </aside>

        {/* Center column: Floor Plan Layout Map */}
        <main className="panel-section column-map-container">
          <div className="panel-header">
            <h2>🏢 {selectedFloor}층 사무실 도면 및 좌석 배치도</h2>
            <p className="subtext">구역 필터: {selectedZone}구역</p>
          </div>

          <div className="floor-plan-wrapper">
            {/* SVG Floor Map background (broken for Floor 2 due to plain/text content-type) */}
            <img 
              src={`/api/floors/${selectedFloor}/layout`} 
              alt={`${selectedFloor}층 평면도 도면`} 
              className="floor-map-bg"
            />
            
            {/* Interactive Seat Overlays */}
            {seats
              .filter(s => s.floor === selectedFloor && s.zone === selectedZone)
              .map(seat => {
                const occupiedList = getSeatOccupants(seat.id);
                const isOccupied = occupiedList.length > 0;
                const isSelected = selectedSeat && selectedSeat.id === seat.id;

                return (
                  <button
                    key={seat.id}
                    className={`seat-element ${seat.type} ${isOccupied ? 'occupied' : 'available'} ${isSelected ? 'selected' : ''}`}
                    style={{ top: `${seat.top}%`, left: `${seat.left}%` }}
                    onClick={() => handleSeatClick(seat)}
                    title={`${seat.name} (${isOccupied ? `예약 완료: ${occupiedList.map(o => o.userName).join(', ')}` : '예약 가능'})`}
                  >
                    <span className="seat-id-label">{seat.id}</span>
                  </button>
                );
              })}
          </div>
        </main>

        {/* Right column: Seat Details and Booking Form (Desktop only) */}
        <aside className="panel-section column-booking-panel">
          <div className="panel-header">
            <h2>📝 좌석 예약 신청 폼</h2>
          </div>

          {selectedSeat ? (
            <div className="booking-card">
              <div className="selected-seat-badge">
                <span className="seat-badge-title">선택된 좌석</span>
                <h4>{selectedSeat.name}</h4>
                <p className="seat-badge-meta">{selectedSeat.floor}층 | {selectedSeat.zone}구역 | {selectedSeat.type.toUpperCase()} 형태</p>
              </div>

              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label>예약 일자 선택</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>시작 시간</label>
                    <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>종료 시간</label>
                    <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>예약자 성함</label>
                  <input 
                    type="text" 
                    placeholder="이름을 입력하세요" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                  />
                  <p className="help-text">이름이 다르면 같은 시간에 중복 예약이 가능합니다. (DB 무결성 오류)</p>
                </div>

                <button type="submit" className="submit-booking-btn">
                  해당 좌석 예약 접수하기
                </button>
              </form>
            </div>
          ) : (
            <div className="empty-selection-placeholder">
              <p>평면도에서 원하시는 좌석을 클릭하시면 예약 신청서 폼이 활성화됩니다.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Drawer Panel Sheet */}
      <div className={`mobile-bottom-drawer ${isMobilePanelOpen ? 'open' : ''}`}>
        <div className="drawer-handle" onClick={() => setIsMobilePanelOpen(false)}></div>
        <button className="drawer-close-btn" onClick={() => setIsMobilePanelOpen(false)}>&times;</button>
        <div className="drawer-body">
          {selectedSeat ? (
            <div className="booking-card">
              <h4>{selectedSeat.name} ({selectedSeat.id})</h4>
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label>예약 일자</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>시작</label>
                    <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>종료</label>
                    <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>성함</label>
                  <input type="text" placeholder="성함 입력" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <button type="submit" className="submit-booking-btn">예약 신청하기</button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {/* Reservations List */}
      <section className="panel-section reservations-section">
        <div className="panel-header">
          <h2>📂 오피스 실시간 예약 목록</h2>
        </div>
        <div className="reservations-list-container">
          {reservations.length === 0 ? (
            <div className="empty-reservations">접수된 오피스 예약 내역이 존재하지 않습니다.</div>
          ) : (
            <div className="rsv-grid">
              {reservations.map(r => (
                <div key={r.id} className="rsv-item-card">
                  <div className="rsv-card-header">
                    <span className="rsv-id">{r.id}</span>
                    <span className="rsv-floor-badge">{r.floor}F - {r.zone}구역</span>
                  </div>
                  <div className="rsv-card-body">
                    <h3>{r.seatName} ({r.seatId})</h3>
                    <p className="user-lbl">예약자: <strong>{r.userName}</strong></p>
                    <p className="time-lbl">일정: <strong>{r.date}</strong> | {r.startTime} ~ {r.endTime}</p>
                  </div>
                  <div className="rsv-card-footer">
                    <button className="rsv-btn amend" onClick={() => startAmendBooking(r)}>예약 시간 변경</button>
                    <button className="rsv-btn cancel" onClick={() => handleCancelBooking(r.id)}>취소</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Amend Booking Modal Overlay */}
      {editingRsv && (
        <div className="modal-overlay" onClick={() => setEditingRsv(null)}>
          <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEditingRsv(null)}>&times;</button>
            <h3>📝 예약 시간 변경 신청</h3>
            <p className="modal-subtitle">{editingRsv.seatName} ({editingRsv.seatId}) | {editingRsv.userName}님</p>
            
            <form onSubmit={handleAmendSubmit} className="booking-form" style={{ marginTop: '1.5rem' }}>
              <div className="form-group-row">
                <div className="form-group">
                  <label>변경할 시작 시간</label>
                  <select value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)}>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>변경할 종료 시간</label>
                  <select value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)}>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <p className="help-text text-danger" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                종료 시간을 시작 시간 이전으로 무리하게 변경할 시 백엔드 오류(HTTP 500)가 발생합니다.
              </p>
              <button type="submit" className="submit-booking-btn" style={{ marginTop: '1rem' }}>
                예약 변경 완료하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert logs */}
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
