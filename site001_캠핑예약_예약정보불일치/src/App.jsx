import React, { useState, useEffect } from 'react';

function App() {
  // State
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  
  // Filter States
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [guestsCount, setGuestsCount] = useState(1);
  const [reserveDate, setReserveDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFacilities, setSelectedFacilities] = useState({ pets: false, electricity: false });
  const [toggleHistory, setToggleHistory] = useState([]);

  // Form States
  const [reserveName, setReserveName] = useState('');
  const [showReservations, setShowReservations] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [recheckLoading, setRecheckLoading] = useState(false);

  // Load Initial Data
  useEffect(() => {
    loadCamps();
    loadReservations();
  }, []);

  const loadCamps = async () => {
    try {
      const res = await fetch('/api/camps');
      const data = await res.json();
      setCamps(data);
      setFilteredCamps(data);
    } catch (err) {
      showToast('캠핑장 데이터를 불러오지 못했습니다.', 'danger');
    }
  };

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      showToast('예약 현황을 불러오지 못했습니다.', 'danger');
    }
  };

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Region and Guests Filter handler
  const handleStaticFilters = (region, guests) => {
    setSelectedRegion(region);
    setGuestsCount(guests);
    
    let result = camps;
    if (region !== 'all') {
      result = result.filter(c => c.region === region);
    }
    if (guests > 1) {
      result = result.filter(c => c.capacity >= guests);
    }

    // Apply existing facility filters
    Object.keys(selectedFacilities).forEach(key => {
      if (selectedFacilities[key]) {
        result = result.filter(c => c.facilities.includes(key));
      }
    });

    setFilteredCamps(result);
  };

  // Facility Checkbox Change Handler
  const handleFacilityChange = (facility) => {
    const updatedValue = !selectedFacilities[facility];
    setSelectedFacilities(prev => ({ ...prev, [facility]: updatedValue }));
    
    // Log the toggle history
    const newHistory = [...toggleHistory, { facility, active: updatedValue }];
    setToggleHistory(newHistory);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: '반려동물 가능 선택 -> 전기 가능 선택 -> 반려동물 가능 해제' 순서로 필터를 변경하는 순간을 감지하여,
    // 기존 목록을 초기화하지 않은 채 새로운 필터 결과를 덮어쓰거나 합쳐(concat) 동일한 캠핑장 카드가 중복 표시되는 버그를 발생시킵니다.
    const isTargetSequence = 
      newHistory.length >= 3 &&
      newHistory[newHistory.length - 3].facility === 'pets' && newHistory[newHistory.length - 3].active === true &&
      newHistory[newHistory.length - 2].facility === 'electricity' && newHistory[newHistory.length - 2].active === true &&
      newHistory[newHistory.length - 1].facility === 'pets' && newHistory[newHistory.length - 1].active === false;

    let result = camps;

    // Region & Guest filter application
    if (selectedRegion !== 'all') {
      result = result.filter(c => c.region === selectedRegion);
    }
    if (guestsCount > 1) {
      result = result.filter(c => c.capacity >= guestsCount);
    }

    // Combine current facility filters
    const updatedFacilities = { ...selectedFacilities, [facility]: updatedValue };
    Object.keys(updatedFacilities).forEach(key => {
      if (updatedFacilities[key]) {
        result = result.filter(c => c.facilities.includes(key));
      }
    });

    if (isTargetSequence) {
      // Append duplicates into the state
      setFilteredCamps(prev => [...prev, ...result]);
      showToast('경고: 시설 필터 렌더링 배열 동기화에 에러가 발생하여 목록이 중복 노출됩니다.', 'warning');
    } else {
      setFilteredCamps(result);
    }
  };

  // Network Check Action
  const recheckAvailability = async () => {
    setRecheckLoading(true);
    try {
      // INTENTIONAL_ERROR
      // CATEGORY: Network
      // DESCRIPTION: 존재하지 않는 API 엔드포인트인 '/api/camps/availability-check-v2'를 강제로 fetch 호출하여
      // 개발자 도구의 Network 탭에서 HTTP 404 Not Found 에러가 기록되도록 유발합니다.
      const res = await fetch('/api/camps/availability-check-v2');
      if (!res.ok) {
        throw new Error(`API 엔드포인트를 찾을 수 없습니다 (Status: ${res.status})`);
      }
      const data = await res.json();
      showToast('예약이 가능한 상태입니다!', 'success');
    } catch (err) {
      showToast(`네트워크 통신 오류: ${err.message}`, 'danger');
    } finally {
      setRecheckLoading(false);
    }
  };

  // Handle Reservation Submit
  const handleReserveSubmit = async (e) => {
    e.preventDefault();

    if (!reserveName.trim()) {
      showToast('예약자명을 입력하세요.', 'warning');
      return;
    }

    const payload = {
      campId: selectedCamp.id,
      userName: reserveName,
      date: reserveDate,
      guests: guestsCount
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        // This will catch Error 2: camp-04 returning 500
        throw new Error(data.error || '예약 생성 중 에러가 발생했습니다.');
      }

      showToast(`${selectedCamp.name} 예약이 완료되었습니다.`, 'success');
      setReserveName('');
      setSelectedCamp(null);
      loadReservations();
    } catch (err) {
      showToast(`예약 실패: ${err.message}`, 'danger');
    }
  };

  // Cancel Reservation
  const handleCancelReservation = async (resId) => {
    if (!confirm('정말로 이 예약을 취소하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('예약 취소 처리에 실패했습니다.');
      }

      showToast('예약이 정상적으로 취소되었습니다.', 'success');
      loadReservations();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedRegion('all');
    setGuestsCount(1);
    setSelectedFacilities({ pets: false, electricity: false });
    setToggleHistory([]);
    setFilteredCamps(camps);
    showToast('필터가 모두 초기화되었습니다.', 'success');
  };

  return (
    <div className="camply-app">
      {/* Top Navbar */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 20h20M12 4L3 17h18L12 4z" />
          </svg>
          <span className="logo-text">Camply</span>
        </div>
        <div className="nav-menu">
          <button className="nav-link-btn active">캠핑장 탐색</button>
          <button 
            className="nav-reserve-btn"
            onClick={() => setShowReservations(true)}
          >
            내 예약 내역 ({reservations.length})
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">🌲 Nature & Healing</span>
          <h1>자연 속에서 누리는 온전한 쉼</h1>
          <p>전국 곳곳의 엄선된 감성 캠핑장을 실시간으로 검색하고 손쉽게 예약해 보세요.</p>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="main-layout">
        {/* Left Filters */}
        <aside className="filters-sidebar">
          <div className="sidebar-block">
            <h3>📍 어느 지역으로 떠나시나요?</h3>
            <div className="region-grid">
              {['all', '강원', '경기', '제주', '충청'].map(region => (
                <button
                  key={region}
                  className={`region-btn ${selectedRegion === region ? 'active' : ''}`}
                  onClick={() => handleStaticFilters(region, guestsCount)}
                >
                  {region === 'all' ? '전국' : region}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <h3>📅 예약 세부 정보</h3>
            <div className="form-group">
              <label>여행 인원</label>
              <input
                type="number"
                min="1"
                max="10"
                value={guestsCount}
                onChange={(e) => handleStaticFilters(selectedRegion, parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="sidebar-block">
            <h3>⚡ 편의 시설 필터</h3>
            <div className="facility-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFacilities.pets}
                  onChange={() => handleFacilityChange('pets')}
                />
                <span className="custom-box"></span>
                🐾 반려동물 동반 가능
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFacilities.electricity}
                  onChange={() => handleFacilityChange('electricity')}
                />
                <span className="custom-box"></span>
                🔌 전기 사용 가능
              </label>
            </div>
          </div>

          <button className="reset-filter-btn" onClick={resetFilters}>
            필터 초기화
          </button>
        </aside>

        {/* Camps Grid (Asymmetrical Cards) */}
        <main className="camps-section">
          <div className="section-title-row">
            <h2>인기 캠프 사이트 추천 ({filteredCamps.length}곳)</h2>
          </div>

          <div className="camps-grid">
            {filteredCamps.map((camp, idx) => (
              <div 
                key={`${camp.id}-${idx}`}
                className={`camp-card ${idx % 3 === 0 ? 'card-wide' : idx % 3 === 1 ? 'card-tall' : ''}`}
                onClick={() => setSelectedCamp(camp)}
              >
                <div className="camp-card-image-box">
                  <img src={camp.image} alt={camp.name} />
                  <span className="camp-card-region">{camp.region}</span>
                </div>
                <div className="camp-card-info">
                  <div className="camp-card-meta">
                    <span className="camp-card-rating">⭐ {camp.rating}</span>
                    <span className="camp-card-capacity">최대 {camp.capacity}인</span>
                  </div>
                  <h3>{camp.name}</h3>
                  <p className="camp-card-desc">{camp.description}</p>
                  <div className="camp-card-footer">
                    <span className="price-tag">₩{camp.basePrice.toLocaleString()} / 박</span>
                    <button className="view-detail-btn">예약 신청</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Right Drawer (Camp Details & Booking) */}
      {selectedCamp && (
        <div className="drawer-overlay" onClick={() => setSelectedCamp(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelectedCamp(null)}>&times;</button>
            
            <div className="drawer-image-header">
              <img src={selectedCamp.image} alt={selectedCamp.name} />
            </div>

            <div className="drawer-body">
              <span className="region-badge">{selectedCamp.region}</span>
              <h2>{selectedCamp.name}</h2>
              <div className="drawer-meta-row">
                <span className="meta-item">⭐ {selectedCamp.rating} / 5.0</span>
                <span className="meta-item">인원 제한: 최대 {selectedCamp.capacity}인</span>
              </div>

              <p className="drawer-desc">{selectedCamp.description}</p>

              <div className="drawer-facilities">
                <h4>제공 시설 및 혜택</h4>
                <div className="facilities-tags-row">
                  {selectedCamp.facilities.includes('pets') && <span className="fac-tag">🐾 반려동물 허용</span>}
                  {selectedCamp.facilities.includes('electricity') && <span className="fac-tag">🔌 전기 지원</span>}
                  {selectedCamp.facilities.includes('water') && <span className="fac-tag">💧 개별 개수대</span>}
                  {selectedCamp.facilities.includes('store') && <span className="fac-tag">🏪 편의 매점</span>}
                </div>
              </div>

              {/* Error 4 Button Trigger */}
              <div className="drawer-verify-block">
                <p>실시간 예약 상태 조회 API v2 테스트 진행 중</p>
                <button 
                  className={`verify-api-btn ${recheckLoading ? 'loading' : ''}`}
                  onClick={recheckAvailability}
                  disabled={recheckLoading}
                >
                  {recheckLoading ? '체크 중...' : '예약 가능 여부 다시 확인'}
                </button>
              </div>

              {/* Booking Form */}
              <div className="drawer-booking-section">
                <h3>🏕️ 실시간 즉시 예약</h3>
                <form onSubmit={handleReserveSubmit}>
                  <div className="form-group">
                    <label>예약자 성함</label>
                    <input 
                      type="text" 
                      placeholder="예약자 성함을 기입해주세요" 
                      value={reserveName} 
                      onChange={(e) => setReserveName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>이용 날짜</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={reserveDate}
                      onChange={(e) => setReserveDate(e.target.value)}
                    />
                  </div>

                  <div className="booking-price-preview">
                    <span>이용 요금</span>
                    <strong>₩{selectedCamp.basePrice.toLocaleString()}</strong>
                  </div>

                  <button type="submit" className="booking-submit-btn">
                    예약 신청 완료하기
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: My Reservations */}
      {showReservations && (
        <div className="reservations-modal-overlay" onClick={() => setShowReservations(false)}>
          <div className="reservations-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>내 실시간 예약 내역 ({reservations.length})</h2>
              <button className="modal-close-btn" onClick={() => setShowReservations(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              {reservations.length === 0 ? (
                <div className="empty-reservations">
                  <p>예약된 내역이 존재하지 않습니다.</p>
                </div>
              ) : (
                <div className="reservations-list">
                  {reservations.map(res => (
                    <div key={res.id} className="reservation-item-card">
                      <div className="res-info">
                        <span className="res-id">{res.id}</span>
                        <h3>{res.campName}</h3>
                        <p>🗓️ 예약 날짜: {res.date} | 👥 이용 인원: {res.guests}명</p>
                        <p className="res-cost">이용 요금 결제완료: ₩{res.totalPrice.toLocaleString()}</p>
                      </div>
                      <button 
                        className="res-cancel-btn"
                        onClick={() => handleCancelReservation(res.id)}
                      >
                        예약 취소
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Navigation */}
      <div className="mobile-bottom-bar">
        <button className="mobile-nav-item active">
          🔍 탐색
        </button>
        <button 
          className="mobile-nav-item"
          onClick={() => setShowReservations(true)}
        >
          📂 예약 ({reservations.length})
        </button>
      </div>

      {/* Toast Alert Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close-btn" onClick={() => removeToast(t.id)}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
