import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'mytrip'

  // DB datasets
  const [packages, setPackages] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Search & Filter state
  const [selectedDestination, setSelectedDestination] = useState('유럽');
  const [selectedTheme, setSelectedTheme] = useState('관광'); // '관광' | '힐링' | '액티비티'
  const [maxPrice, setMaxPrice] = useState(4000000);

  // Selected package for right quote panel
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Selected Option details for quote (Error 1 and 4 targets)
  const [selectedHotel, setSelectedHotel] = useState('Standard Hotel');
  const [staleHotelForBooking, setStaleHotelForBooking] = useState('Standard Hotel'); // stale reference
  
  const [selectedFlight, setSelectedFlight] = useState('대한항공 (일반)');
  const [selectedTours, setSelectedTours] = useState([]);
  const [passengersCount, setPassengersCount] = useState(2);
  const [optionalToursCost, setOptionalToursCost] = useState(60000); // 30,000 * 2 default

  // Booking forms info (Error 6 target)
  const [passportNumber, setPassportNumber] = useState('M12345678');
  const [bookingDate, setBookingDate] = useState('2026-07-25');

  // Edit Date reservation state
  const [editDates, setEditDates] = useState({}); // { resvId: dateString }

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadPackages();
    loadReservations();
    loadCalendar();
    loadAlerts();
  }, []);

  const loadPackages = () => {
    fetch('/api/packages?destination=' + selectedDestination)
      .then(res => res.json())
      .then(data => setPackages(data.results));
  };
  const loadReservations = () => {
    fetch('/api/reservations').then(res => res.json()).then(data => setReservations(data));
  };
  const loadCalendar = () => {
    fetch('/api/calendar').then(res => res.json()).then(data => setCalendarEvents(data));
  };
  const loadAlerts = () => {
    fetch('/api/alerts').then(res => res.json()).then(data => setAlerts(data));
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Reset sandbox
  const handleResetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('JourneyMix 가상 데이터베이스 초기화 완료', 'success');
    loadPackages();
    loadReservations();
    loadCalendar();
    loadAlerts();
  };

  // Filter destination (Error 2 search filter race condition simulator)
  const triggerSearchRace = () => {
    showToast('목적지 고속 연쇄 검색 레이스 컨디션을 실행합니다 (유럽 ➔ 동남아 ➔ 일본)', 'info');

    // 1. 유럽 (3s delay)
    fetch('/api/packages?destination=유럽')
      .then(res => res.json())
      .then(data => {
        setPackages(data.results);
        showToast('유럽 패키지 검색 완료 (3초 지연 수신)', 'warning');
      });

    // 2. 동남아 (1s delay)
    setTimeout(() => {
      fetch('/api/packages?destination=동남아')
        .then(res => res.json())
        .then(data => {
          setPackages(data.results);
          showToast('동남아 패키지 검색 완료 (1초 수신)', 'info');
        });
    }, 100);

    // 3. 일본 (0.2s delay)
    setTimeout(() => {
      fetch('/api/packages?destination=일본')
        .then(res => res.json())
        .then(data => {
          setPackages(data.results);
          showToast('일본 패키지 검색 완료 (0.2초 수신)', 'info');
        });
    }, 200);

    // Filter UI is immediately updated to Japan (the final click)
    setSelectedDestination('일본');
  };

  // Switch destination normal
  const handleSwitchDestination = (dest) => {
    setSelectedDestination(dest);
    fetch('/api/packages?destination=' + dest)
      .then(res => res.json())
      .then(data => setPackages(data.results));
  };

  // Select Hotel (Error 1 state mismatch)
  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Database
    // DESCRIPTION: 호텔 옵션 클릭 시 화면 견적 총합 계산은 변경한 최신 호텔 값을 사용하지만,
    // 예약 서버 데이터로 연계 전송되는 상태 변수 `staleHotelForBooking` 동기화를 
    // 누락시켜서 최종 예약 등록 패킷에는 이전 이전의 호텔 정보가 넘어가도록 작성합니다.
  };

  // Select Tour and update cost (Error 4 math helper)
  const handleToggleTour = (tourName) => {
    let updatedTours = [];
    if (selectedTours.includes(tourName)) {
      updatedTours = selectedTours.filter(t => t !== tourName);
    } else {
      updatedTours = [...selectedTours, tourName];
    }
    setSelectedTours(updatedTours);

    // Calculate cost based on current passengersCount
    const pricePerTour = 40000; // flat rate for simulation
    setOptionalToursCost(updatedTours.length * pricePerTour * passengersCount);
  };

  // Change Passengers Count (Error 4 implementation)
  const handlePassengerCountChange = (count) => {
    const nextCount = Math.max(1, Number(count));
    setPassengersCount(nextCount);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 여행 인원을 증감하여도 선택 관광의 총비용(`optionalToursCost`)을 
    // 함께 재산출하여 보정해주는 로직을 고의로 생략함으로써, 
    // 인원수가 1명으로 감소해도 관광 금액은 과거 기준(예: 2명 또는 4명 기준 요금) 그대로 유지되는 결함입니다.
  };

  // Create package booking (Error 6 passport 400 bypass)
  const handleCreateReservation = async () => {
    if (!selectedPackage) {
      showToast('예약할 패키지를 먼저 골라주세요.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          date: bookingDate,
          passengers: passengersCount,
          hotel: staleHotelForBooking, // BUG: Sends stale hotel value instead of selectedHotel
          flight: selectedFlight,
          passportNumber: passportNumber
        })
      });

      if (res.status === 400) {
        const data = await res.json();
        // Show validation failure but the backend actually saved the data!
        showToast(`[여권 검증 400 거절] ${data.error}`, 'danger');
        loadReservations();
        loadCalendar();
        loadAlerts();
      } else {
        showToast('패키지 여행 예약이 정상 완료되었습니다.', 'success');
        loadReservations();
        loadCalendar();
        loadAlerts();
        setActiveTab('mytrip');
      }
    } catch (err) {
      showToast('통신 오류', 'danger');
    }
  };

  // Modify Reservation Date (Error 3 change date 3s delay)
  const handleModifyDate = async (resvId, packageId, passengers, hotel, flight) => {
    const newDate = editDates[resvId];
    if (!newDate) return;

    try {
      const res = await fetch(`/api/reservations/${resvId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          packageId,
          passengers,
          hotel,
          flight
        })
      });
      if (res.ok) {
        showToast('예약 일자 변경 요청이 전송되었습니다 (지연 처리 중)', 'info');
        // Do not reload immediately to show the race condition
      }
    } catch (err) {
      showToast('변경 오류', 'danger');
    }
  };

  // Cancel reservation (Error 3 cancels in 0.1s & Error 5 leaves calendar/alerts)
  const handleCancelReservation = async (resvId) => {
    try {
      const res = await fetch(`/api/reservations/${resvId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('예약 취소가 서버에 정상 반영되었습니다.', 'success');
        loadReservations();
        // Do not reload calendar or alerts to show the database cascade orphan data leak!
      }
    } catch (err) {
      showToast('취소 에러', 'danger');
    }
  };

  // Change date and cancel immediately (Error 3 Simulator)
  const triggerChangeDateCancelRace = (resvId, packageId, passengers, hotel, flight) => {
    showToast('날짜 변경 후 즉시 취소 경합 시뮬레이션을 구동합니다.', 'info');

    // 1. PUT modify date (3s delay on server)
    fetch(`/api/reservations/${resvId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: "2026-08-30",
        packageId,
        passengers,
        hotel,
        flight
      })
    });

    // 2. DELETE cancel immediately (0.1s delay on server)
    setTimeout(async () => {
      const res = await fetch(`/api/reservations/${resvId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('예약 취소가 선행 완료되었습니다 (0.1초 완료)', 'success');
        loadReservations();
      }
    }, 100);

    // Refresh lists after 3.5s to witness resurrected record
    setTimeout(() => {
      showToast('날짜 변경 지연 스레드 완료 (삭제되었던 예약 재부활 확인)', 'warning');
      loadReservations();
    }, 3500);
  };

  // UI calculations
  const getHotelPrice = (hotel) => {
    if (hotel === 'Luxury Resort') return 150000;
    if (hotel === 'Royal Palace') return 300000;
    return 0;
  };

  const getFlightPrice = (flight) => {
    if (flight === '싱가포르항공 (프리미엄)') return 180000;
    return 0;
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    const base = selectedPackage.price * passengersCount;
    const hotelCost = getHotelPrice(selectedHotel) * passengersCount;
    const flightCost = getFlightPrice(selectedFlight) * passengersCount;
    // UI calculation uses selectedHotel and current optionalToursCost
    return base + hotelCost + flightCost + optionalToursCost;
  };

  // Filter package matching other parameters
  const filteredPackages = packages.filter(p => {
    if (p.price > maxPrice) return false;
    if (p.theme !== selectedTheme) return false;
    return true;
  });

  return (
    <div className="journeymix-app">
      
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span className="logo-title">JourneyMix</span>
          <span className="logo-subtitle">Tailored Package Customizer</span>
        </div>

        <div className="header-right">
          <button className="sandbox-reset-btn" onClick={handleResetSandbox}>
            🔄 DB 초기화
          </button>
        </div>
      </header>

      {/* Main Tab selector */}
      <nav className="sections-nav">
        <button className={activeTab === 'search' ? 'active' : ''} onClick={() => setActiveTab('search')}>
          🔍 패키지 검색 & 맞춤 옵션 설계
        </button>
        <button className={activeTab === 'mytrip' ? 'active' : ''} onClick={() => setActiveTab('mytrip')}>
          ✈️ 내 여행 예약조회 (My Trip)
        </button>
      </nav>

      {/* Layout Grid */}
      <div className="journeymix-grid-container">

        {/* TAB 1: SEARCH & CUSTOM OPTION DESIGNER */}
        {activeTab === 'search' && (
          <>
            {/* Left Sidebar: Destination selection, filters */}
            <aside className="panel-section left-filters-sidebar">
              <h3>📍 대륙/지역 선택</h3>
              <div className="destination-tabs">
                {['유럽', '동남아', '일본', '미주'].map(dest => (
                  <button 
                    key={dest} 
                    className={`dest-btn ${selectedDestination === dest ? 'active' : ''}`}
                    onClick={() => handleSwitchDestination(dest)}
                  >
                    {dest}
                  </button>
                ))}
                <button className="race-demo-btn" onClick={triggerSearchRace}>
                  ⚡ 검색 레이스 시뮬레이터 (Error 2)
                </button>
              </div>

              <div className="filter-group-header">
                <h3>🔍 테마 & 가격 필터</h3>
              </div>
              <div className="filter-controls-stack">
                <div className="control">
                  <label>패키지 테마</label>
                  <select value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}>
                    <option value="관광">관광형 패키지</option>
                    <option value="힐링">힐링/휴양 리조트</option>
                    <option value="액티비티">액티비티/체험형</option>
                  </select>
                </div>

                <div className="control">
                  <label>최대 예산 한도</label>
                  <div className="price-lbl-row">
                    <span>{maxPrice.toLocaleString()}원</span>
                  </div>
                  <input 
                    type="range" 
                    min="500000" 
                    max="4000000" 
                    step="100000" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(Number(e.target.value))} 
                    className="price-slider"
                  />
                </div>
              </div>
            </aside>

            {/* Center: Travel Package List with Daily Timeline */}
            <main className="panel-section center-packages-list">
              <h2>✈️ 맞춤 추천 여행 상품 목록 (총 {filteredPackages.length}건)</h2>
              <div className="packages-stack">
                {filteredPackages.map(pack => (
                  <div 
                    key={pack.id} 
                    className={`package-card ${selectedPackage?.id === pack.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPackage(pack);
                      // Set default booking date
                      setBookingDate('2026-07-25');
                    }}
                  >
                    <div className="card-header">
                      <span className="theme-badge">{pack.theme}</span>
                      <h4>{pack.title}</h4>
                      <strong className="price-tag">{pack.price.toLocaleString()}원 / 1인</strong>
                    </div>

                    <div className="timeline-schedule-block">
                      <h5>📅 일자별 간략 여정 ({pack.duration}일)</h5>
                      <div className="timeline-steps">
                        {pack.schedule.slice(0, 3).map((day, idx) => (
                          <div key={idx} className="timeline-step">
                            <span className="step-bullet">{idx + 1}</span>
                            <span className="step-text">{day}</span>
                          </div>
                        ))}
                        {pack.schedule.length > 3 && (
                          <span className="more-timeline-lbl">... 외 {pack.schedule.length - 3}일 여정 상세 생략</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPackages.length === 0 && (
                  <p className="empty-lbl">필터 조건과 매칭되는 상품이 존재하지 않습니다.</p>
                )}
              </div>
            </main>

            {/* Right: Custom Surcharges & Quote calculator */}
            <aside className="panel-section right-quote-calculator">
              {selectedPackage ? (
                <div className="quote-composer-card">
                  <div className="header">
                    <h3>💵 맞춤 패키지 견적 계산기</h3>
                    <span>선택 상품: <code>{selectedPackage.id}</code></span>
                  </div>

                  <div className="composer-body">
                    {/* Passengers count input (Error 4 Target) */}
                    <div className="option-row">
                      <label>👥 동행 인원수</label>
                      <div className="number-stepper">
                        <button onClick={() => handlePassengerCountChange(passengersCount - 1)}>-</button>
                        <input 
                          type="number" 
                          value={passengersCount} 
                          onChange={(e) => handlePassengerCountChange(e.target.value)} 
                        />
                        <button onClick={() => handlePassengerCountChange(passengersCount + 1)}>+</button>
                      </div>
                    </div>

                    {/* Flights options */}
                    <div className="option-row">
                      <label>✈️ 왕복 항공편 프리미엄 변경</label>
                      <select value={selectedFlight} onChange={e => setSelectedFlight(e.target.value)}>
                        <option value="대한항공 (일반)">대한항공 (일반석) +0원</option>
                        <option value="아시아나 (일반)">아시아나 (일반석) +0원</option>
                        <option value="싱가포르항공 (프리미엄)">싱가포르항공 (프리미엄석) +180,000원</option>
                      </select>
                    </div>

                    {/* Hotel options (Error 1 Target) */}
                    <div className="option-row">
                      <label>🏨 호텔 업그레이드 옵션</label>
                      <select value={selectedHotel} onChange={e => handleSelectHotel(e.target.value)}>
                        <option value="Standard Hotel">기본 스탠다드 비즈니스 +0원</option>
                        <option value="Luxury Resort">럭셔리 오션뷰 리조트 +150,000원</option>
                        <option value="Royal Palace">로열 팔래스 스위트룸 +300,000원</option>
                      </select>
                      <span className="stale-hotel-hint">
                        * 전송 예약용 캐시: <code>{staleHotelForBooking}</code> (Error 1)
                      </span>
                    </div>

                    {/* Optional tours (Error 4 Target) */}
                    <div className="option-row">
                      <label>🗺️ 현지 선택 관광 옵션 추가</label>
                      <div className="tours-checkboxes">
                        {['시티투어 버스 (+40,000원)', '선셋 크루즈 (+40,000원)', '스노클링 어드벤처 (+40,000원)'].map(tour => (
                          <label key={tour} className="tour-chk-lbl">
                            <input 
                              type="checkbox" 
                              checked={selectedTours.includes(tour)}
                              onChange={() => handleToggleTour(tour)}
                            />
                            <span>{tour}</span>
                          </label>
                        ))}
                      </div>
                      <span className="tour-calc-notice">
                        관광 누적 비용: <strong>{optionalToursCost.toLocaleString()}원</strong>
                      </span>
                    </div>

                    {/* Traveler Booking forms info (Error 6 Target) */}
                    <div className="booking-form-box">
                      <h5>📇 대표 탑승객 여권 정보 입력</h5>
                      <div className="field">
                        <label>여권 번호 (유효성 검증 대상 - Error 6)</label>
                        <input 
                          type="text" 
                          value={passportNumber} 
                          onChange={e => setPassportNumber(e.target.value)} 
                          placeholder="M12345678 (8자 이상 필수)"
                        />
                      </div>
                      <div className="field">
                        <label>출발 예정일</label>
                        <input 
                          type="date" 
                          value={bookingDate} 
                          onChange={e => setBookingDate(e.target.value)} 
                        />
                      </div>
                    </div>

                    {/* Total summary */}
                    <div className="quote-total-box">
                      <span>예상 총합 금액</span>
                      <strong className="total-val">{calculateTotalPrice().toLocaleString()}원</strong>
                    </div>

                    <button className="book-btn" onClick={handleCreateReservation}>
                      실시간 상품 즉시 예약하기
                    </button>
                  </div>
                </div>
              ) : (
                <p className="empty-lbl">패키지 리스트에서 원하는 상품을 골라 세부 견적 요금을 빌딩해 보세요.</p>
              )}
            </aside>
          </>
        )}

        {/* TAB 2: MY TRIP RESERVATIONS & ORPHAN CALENDAR */}
        {activeTab === 'mytrip' && (
          <div className="mytrip-wrapper">
            
            {/* Booking history table */}
            <div className="panel-section booking-history-block">
              <h2>✈️ 내 여행 패키지 예약 변경 및 취소 관리</h2>
              <div className="reservations-stack">
                {reservations.map(resv => {
                  const packInfo = packages.find(p => p.id === resv.packageId) || { title: "패키지 정보 로딩 오류" };
                  return (
                    <div key={resv.id} className="resv-item-card">
                      <div className="resv-header-row">
                        <span className={`status ${resv.status.toLowerCase()}`}>{resv.status}</span>
                        <strong>예약 번호: <code>{resv.id}</code></strong>
                      </div>

                      <div className="resv-info-body">
                        <h4>{packInfo.title}</h4>
                        <p>출발 예약일: <span className="highlight-date">{resv.date}</span></p>
                        <p>신청 인원: <strong>{resv.passengers}명</strong> | 숙소 옵션: <code>{resv.hotel}</code></p>
                        <p>탑승객 여권번호: <code>{resv.passportNumber || '미등록'}</code></p>
                      </div>

                      <div className="resv-actions-row">
                        {/* Change date controls */}
                        <div className="date-editor">
                          <input 
                            type="date" 
                            value={editDates[resv.id] || ''} 
                            onChange={(e) => setEditDates({ ...editDates, [resv.id]: e.target.value })} 
                          />
                          <button 
                            className="change-date-btn"
                            onClick={() => handleModifyDate(resv.id, resv.packageId, resv.passengers, resv.hotel, resv.flight)}
                          >
                            날짜 변경 요청 (3초 지연)
                          </button>
                        </div>

                        {/* Normal Delete */}
                        <button className="cancel-btn" onClick={() => handleCancelReservation(resv.id)}>
                          예약 전면 취소
                        </button>
                        {/* Error 3 Trigger */}
                        <button 
                          className="race-cancel-btn" 
                          onClick={() => triggerChangeDateCancelRace(resv.id, resv.packageId, resv.passengers, resv.hotel, resv.flight)}
                        >
                          ⚡ 날짜 변경 후 바로 취소 (Error 3)
                        </button>
                      </div>
                    </div>
                  );
                })}

                {reservations.length === 0 && (
                  <p className="empty-lbl">신청 완료된 활성 패키지 예약 이력이 없습니다.</p>
                )}
              </div>
            </div>

            {/* Smart travel itinerary calendar (Error 5 Target) */}
            <div className="panel-section mytrip-calendar-block">
              <h2>📅 내 여행 캘린더 타임라인 스케줄</h2>
              <div className="itinerary-grid">
                {calendarEvents.map(evt => (
                  <div key={evt.id} className="itinerary-card">
                    <span className="date">{evt.date}</span>
                    <div className="body">
                      <span className="ref-lbl">예약 연동 ID: <code>{evt.reservationId}</code></span>
                      <h4>{evt.title}</h4>
                    </div>
                  </div>
                ))}

                {calendarEvents.length === 0 && (
                  <p className="empty-lbl">반영된 여행 일정 일정이 비어 있습니다.</p>
                )}
              </div>
            </div>

            {/* Traveler Notification alert logs (Error 5 Target) */}
            <div className="panel-section alerts-list-block">
              <h2>🔔 알림 센터 & 출발 가이드 알림</h2>
              <div className="alerts-stack">
                {alerts.map(item => (
                  <div key={item.id} className="alert-card-item">
                    <span className="time">{item.time}</span>
                    <div className="body">
                      <span className="ref-lbl">연동 ID: <code>{item.reservationId}</code></span>
                      <p>{item.message}</p>
                    </div>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <p className="empty-lbl">수신된 출발 안내 메시지가 없습니다.</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Floating Action Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
