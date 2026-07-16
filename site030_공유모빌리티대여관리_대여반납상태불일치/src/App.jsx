import React, { useState, useEffect } from 'react';

export default function App() {
  // DB States
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Search & Navigation States
  const [selectedLocation, setSelectedLocation] = useState('서울역'); // Error 5 Target
  const [startDate, setStartDate] = useState('2026-07-20');
  const [endDate, setEndDate] = useState('2026-07-22');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedCarId, setSelectedCarId] = useState(null);
  
  // Checkout Wizard steps (1: 차량선택, 2: 옵션/보험선택, 3: 확인 및 대여신청, 4: 예약내역조회)
  const [activeStep, setActiveStep] = useState(1);

  // Insurance and Addon Options (Error 1 Target)
  const [insuranceDisplay, setInsuranceDisplay] = useState('Standard'); // UI Price Calculation Only
  const [insuranceData, setInsuranceData] = useState('Standard');       // Serialized Payload value
  const [babySeat, setBabySeat] = useState(false);
  const [navigation, setNavigation] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadCars();
    loadBookings();
  }, []);

  const loadCars = async () => {
    try {
      const res = await fetch('/api/cars');
      const data = await res.json();
      setCars(data);
    } catch (err) {
      showToast('차량 카탈로그 조회 실패', 'danger');
    }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      showToast('예약 내역 조회 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Calculate rental days
  const getRentalDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const rentalDays = getRentalDays();

  // Selected Car Details
  const activeCar = cars.find(c => c.id === selectedCarId);

  // Calculate prices based on visual insuranceDisplay (Error 1 visual target)
  const getInsuranceCostPerDay = (type) => {
    if (type === 'Premium') return 15000;
    if (type === 'Full') return 30000;
    return 0;
  };

  const baseCarCost = activeCar ? activeCar.price * rentalDays : 0;
  
  // Visual insurance cost (uses insuranceDisplay)
  const visualInsuranceCost = getInsuranceCostPerDay(insuranceDisplay) * rentalDays;
  
  // Real insurance cost (uses insuranceData - sent to server)
  const realInsuranceCost = getInsuranceCostPerDay(insuranceData) * rentalDays;

  const addonCost = ((babySeat ? 10000 : 0) + (navigation ? 5000 : 0)) * rentalDays;

  // Total price visible on screen
  const visualTotalAmount = baseCarCost + visualInsuranceCost + addonCost;
  
  // Actual price saved to booking
  const realTotalAmount = baseCarCost + realInsuranceCost + addonCost;

  // Error 1: Insurance selector change only updates visual state
  const handleInsuranceChange = (e) => {
    const val = e.target.value;
    setInsuranceDisplay(val); // UI updates visually!

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 보험 옵션 선택 시 UI 갱신용 상태 변수(insuranceDisplay)만 새 선택으로 바꾸고, 
    // 실제 결제 예약 발송 바디용 데이터 변수(insuranceData)는 연동 수정하지 않고 Standard 등으로 방치합니다. 
    // 이 때문에 화면 요약 금액과 완료서 영수증 금액 간에 불일치가 발생하는 버그를 야기합니다.
    // 원래 들어가야 하는 동기화 로직 누락:
    // setInsuranceData(val);

    showToast(`보험 옵션이 임시 설정되었습니다: ${val}`, 'warning');
  };

  // Error 5: Location change keeps prior selected car in checkout summary
  const handleLocationChange = (e) => {
    const val = e.target.value;
    setSelectedLocation(val);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 대여 지역을 변경하는 조작이 발생했을 때 
    // 이전에 선택해 둔 차량 선택 ID(selectedCarId)를 지워(null) 초기화해주지 않고 방치하여, 
    // 타 지역 조건의 렌터카 상품이 요약 장치(Summary)에 계속 엉뚱하게 박혀 잔존하는 오류를 낳습니다.
    // 원래 반영되어야 하는 초기화 로직 누락:
    // setSelectedCarId(null);

    showToast(`대여 지점이 '${val}'(으)로 변경되었습니다.`, 'info');
  };

  // Error 4: Recheck inventory triggers HTTP 404
  const handleCheckAvailability = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 차량 가용 대수 실시간 재조회 버튼을 클릭할 때 백엔드 라우트에 등록되어 
    // 있지 않은 존재하지 않는 엔드포인트 주소인 '/api/cars/availability-v3'를 fetch 요청하여 
    // 브라우저에 404 에러를 인위적으로 유발시킵니다.
    try {
      const res = await fetch('/api/cars/availability-v3');
      if (!res.ok) {
        throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
      }
      const data = await res.json();
      showToast('가용 수량 동기화 완료', 'success');
    } catch (err) {
      showToast(`[재고 조회 실패] ${err.message}`, 'danger');
    }
  };

  // Submit Rent Booking (Error 2 targets rent-07 + 3 days or more)
  const handleCheckoutBooking = async () => {
    if (!activeCar) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: activeCar.id,
          carName: activeCar.name,
          location: selectedLocation,
          startDate,
          endDate,
          days: rentalDays,
          insurance: insuranceData, // Standard remains (Error 1)
          totalAmount: realTotalAmount // Standard price sent (Error 1)
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '예약 처리 실패');
      }

      showToast(`렌터카 예약 번호 '${data.id}'이 발급되었습니다.`, 'success');
      loadCars();
      loadBookings();
      setActiveStep(4); // Move to history step
    } catch (err) {
      showToast(`[예약 실패] ${err.message}`, 'danger');
    }
  };

  // Cancel Booking (Error 3 targets inventory leak)
  const handleCancelBooking = async (id) => {
    if (!confirm('정말로 이 예약을 취소하시겠습니까? (차량 가용 수량 원복 여부 검증)')) return;

    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('렌터카 예약 취소가 정상 신청되었습니다.', 'success');
        loadCars();
        loadBookings();
      }
    } catch (err) {
      showToast('예약 취소 처리 에러', 'danger');
    }
  };

  // Filter cars based on class
  const filteredCars = cars.filter(c => {
    return selectedClassFilter === 'All' || c.class === selectedClassFilter;
  });

  return (
    <div className="drivenow-app">
      {/* Top Search Filter Header */}
      <header className="rental-search-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span className="logo-title">DriveNow</span>
          <span className="logo-subtitle">실시간 스마트 최저가 렌터카</span>
        </div>

        {/* Top Rental Condition Search Form */}
        <div className="search-condition-form">
          <div className="form-item">
            <label>📍 대여 지역 선택 (Error 5):</label>
            <select value={selectedLocation} onChange={handleLocationChange} className="head-select">
              <option value="서울역">서울역 KTX</option>
              <option value="제주공항">제주공항 인수처</option>
              <option value="부산역">부산역 광장지점</option>
              <option value="인천공항">인천공항 T1</option>
            </select>
          </div>

          <div className="form-item">
            <label>📅 대여 일자:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="head-input" />
          </div>

          <div className="form-item">
            <label>📅 반납 일자:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="head-input" />
          </div>

          <div className="form-item duration-badge-col">
            <span className="days-badge">{rentalDays}일 대여</span>
          </div>
        </div>
      </header>

      {/* Horizontal Steps Navigator UI */}
      <nav className="steps-navigator-bar">
        <button type="button" onClick={() => setActiveStep(1)} className={`step-item ${activeStep === 1 ? 'active' : ''}`}>
          <span className="step-num">1</span> 차량 선택
        </button>
        <button type="button" onClick={() => activeCar ? setActiveStep(2) : showToast('차량을 먼저 골라주십시오.', 'warning')} className={`step-item ${activeStep === 2 ? 'active' : ''}`}>
          <span className="step-num">2</span> 옵션 및 보험 설정
        </button>
        <button type="button" onClick={() => activeCar ? setActiveStep(3) : showToast('차량을 선택하십시오.', 'warning')} className={`step-item ${activeStep === 3 ? 'active' : ''}`}>
          <span className="step-num">3</span> 예약서 확인 및 결제
        </button>
        <button type="button" onClick={() => setActiveStep(4)} className={`step-item ${activeStep === 4 ? 'active' : ''}`}>
          <span className="step-num">4</span> 나의 예약 내역 조회
        </button>
      </nav>

      {/* Workspace Grid */}
      <div className="workspace-grid">
        
        {/* Left car class grade filter */}
        {activeStep === 1 && (
          <aside className="panel-section grade-sidebar">
            <div className="panel-header">
              <h3>🚗 차량 등급 분류</h3>
            </div>
            <div className="grade-buttons-stack">
              {['All', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Compact', 'Van'].map(grade => (
                <button 
                  key={grade}
                  type="button" 
                  onClick={() => setSelectedClassFilter(grade)}
                  className={`grade-tab-btn ${selectedClassFilter === grade ? 'active' : ''}`}
                >
                  {grade === 'All' ? '전체 등급' : grade}
                </button>
              ))}
            </div>

            <div className="stock-sync-widget">
              <button 
                type="button" 
                onClick={handleCheckAvailability} 
                className="availability-recheck-btn"
              >
                🔄 차량 재고 다시 확인 (Error 4)
              </button>
            </div>
          </aside>
        )}

        {/* Center Main Stage Content */}
        <main className="center-stage-workspace">
          
          {/* STEP 1: CAR SELECT */}
          {activeStep === 1 && (
            <section className="panel-section car-grid-panel">
              <div className="panel-header">
                <h2>🚘 가용 렌터카 리스트 ({filteredCars.length}대 조회됨)</h2>
              </div>

              <div className="cars-grid">
                {filteredCars.map(car => (
                  <div 
                    key={car.id} 
                    className={`car-card ${selectedCarId === car.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCarId(car.id)}
                  >
                    {/* Error 6 representative image (rent-09 content-type error) */}
                    <div className="car-image-container">
                      <img 
                        src={`/images/${car.id}.png`} 
                        alt={car.name} 
                        className="car-img" 
                      />
                    </div>

                    <div className="car-meta-info">
                      <span className="class-tag">{car.class}</span>
                      <h4>{car.name}</h4>
                      
                      {/* Spec icons bar */}
                      <div className="spec-icons-row">
                        <span className="spec-tag">⛽ {car.fuel}</span>
                        <span className="spec-tag">💺 {car.seats}인승</span>
                        <span className="spec-tag">🧳 {car.luggage}개</span>
                      </div>

                      <div className="card-foot-price">
                        <span className="stock-qty">가용 재고: {car.qty}대</span>
                        <span className="price-lbl">{car.price.toLocaleString()}원 / 일</span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCars.length === 0 && (
                  <div className="empty-placeholder">선택 등급의 가용 렌터카가 품절되었습니다.</div>
                )}
              </div>
            </section>
          )}

          {/* STEP 2: OPTIONS & INSURANCE */}
          {activeStep === 2 && activeCar && (
            <section className="panel-section options-select-panel">
              <div className="panel-header">
                <h2>🛠️ 대여 옵션 및 보험 가입 설정</h2>
              </div>

              {/* Insurance selector (Error 1 Target) */}
              <div className="insurance-options-grid">
                <h3>🛡️ 자차 면책 보험 옵션 (일 단위 과금)</h3>
                
                <div className="ins-row">
                  <label className={`ins-card ${insuranceDisplay === 'Standard' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="insuranceGroup" 
                      value="Standard"
                      checked={insuranceDisplay === 'Standard'}
                      onChange={handleInsuranceChange} 
                    />
                    <div className="desc">
                      <h4>일반 면책 (Standard)</h4>
                      <p>고객 부담금 최대 50만원 / 무료 가입</p>
                      <span className="cost">0원</span>
                    </div>
                  </label>

                  <label className={`ins-card ${insuranceDisplay === 'Premium' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="insuranceGroup" 
                      value="Premium"
                      checked={insuranceDisplay === 'Premium'}
                      onChange={handleInsuranceChange} 
                    />
                    <div className="desc">
                      <h4>고급 면책 (Premium)</h4>
                      <p>고객 부담금 최대 10만원 / 휴차 보상제외</p>
                      <span className="cost">15,000원 / 일</span>
                    </div>
                  </label>

                  <label className={`ins-card ${insuranceDisplay === 'Full' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="insuranceGroup" 
                      value="Full"
                      checked={insuranceDisplay === 'Full'}
                      onChange={handleInsuranceChange} 
                    />
                    <div className="desc">
                      <h4>완전 면책 (Full Cover)</h4>
                      <p>고객 부담금 전액 면제 / 단독 사고 보장 포함</p>
                      <span className="cost">30,000원 / 일</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Options */}
              <div className="addons-grid-box">
                <h3>🎒 기타 추가 편의 옵션 (대여 전체 기일 일별 부과)</h3>
                
                <label className="addon-row">
                  <input type="checkbox" checked={babySeat} onChange={(e) => setBabySeat(e.target.checked)} />
                  <div className="txt">
                    <h4>👶 유아용 카시트 추가 (+10,000원/일)</h4>
                    <p>어린이 안전을 위한 주니어 카시트 탑재 설치</p>
                  </div>
                </label>

                <label className="addon-row">
                  <input type="checkbox" checked={navigation} onChange={(e) => setNavigation(e.target.checked)} />
                  <div className="txt">
                    <h4>🗺️ 고급 거치식 네비게이션 대여 (+5,000원/일)</h4>
                    <p>국내 최신 실시간 고화질 3D 맵 탑재 모듈 대여</p>
                  </div>
                </label>
              </div>

              <div className="step-button-control">
                <button type="button" onClick={() => setActiveStep(1)} className="btn-prev">이전 단계</button>
                <button type="button" onClick={() => setActiveStep(3)} className="btn-next">예약서 작성 이동</button>
              </div>
            </section>
          )}

          {/* STEP 3: CHECKOUT / CONFIRM */}
          {activeStep === 3 && activeCar && (
            <section className="panel-section confirm-booking-panel">
              <div className="panel-header">
                <h2>📝 임대 계약 확인서 및 최종 예약 신청</h2>
              </div>

              <div className="rental-agreement-doc">
                <h3>DriveNow 렌터카 임대차 간이 계약서</h3>
                <div className="doc-content">
                  <p>1. 본 계약은 <strong>DriveNow 렌터카 본사</strong>와 임차인 간의 임대 합의 규약에 입각합니다.</p>
                  <p>2. 임차인은 <strong>{selectedLocation}</strong>에서 <strong>{startDate}</strong> 대여하여, <strong>{endDate}</strong> 반납할 것을 서약합니다.</p>
                  <p>3. 예약 차량은 <strong>{activeCar.name}</strong> 이며, 자차 보험 등급은 <strong>{insuranceDisplay}</strong>를 보장합니다.</p>
                  <p>4. 도로교통법 위반 과태료 및 대여 중 임의 과속에 대한 책임은 운전자 본인에게 귀속됩니다.</p>
                </div>
              </div>

              <div className="booking-form-action-row">
                <button type="button" onClick={() => setActiveStep(2)} className="btn-prev">이전 단계</button>
                <button 
                  type="button" 
                  onClick={handleCheckoutBooking} 
                  className="checkout-finalize-btn"
                >
                  위 조항에 동의하며 차량 예약 완료
                </button>
              </div>
            </section>
          )}

          {/* STEP 4: HISTORY / RECEIPTS */}
          {activeStep === 4 && (
            <section className="panel-section bookings-history-panel">
              <div className="panel-header">
                <h2>📜 고객님의 실시간 렌터카 예약 내역</h2>
              </div>

              <div className="receipts-list">
                {bookings.map(book => (
                  <div key={book.id} className={`receipt-card ${book.status === '취소됨' ? 'canceled' : ''}`}>
                    <div className="h">
                      <span className="book-num">예약 ID: {book.id}</span>
                      <span className="status-badge">{book.status}</span>
                    </div>

                    <div className="body-grid">
                      <div className="cell">
                        <label>차종명</label>
                        <p>{book.carName}</p>
                      </div>
                      <div className="cell">
                        <label>대여 지점</label>
                        <p>{book.location}</p>
                      </div>
                      <div className="cell">
                        <label>대여 기간</label>
                        <p>{book.startDate} ~ {book.endDate} ({book.days}일)</p>
                      </div>
                      <div className="cell">
                        <label>선택 보험 (Error 1 적용 결과)</label>
                        <p>{book.insurance}</p>
                      </div>
                      <div className="cell">
                        <label>최종 예약 결제 금액</label>
                        <p className="price">{book.totalAmount.toLocaleString()}원</p>
                      </div>
                    </div>

                    {book.status !== '취소됨' && (
                      <div className="actions">
                        <button 
                          type="button" 
                          onClick={() => handleCancelBooking(book.id)} 
                          className="cancel-btn"
                        >
                          🚫 예약 취소 신청 (Error 3 검증)
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {bookings.length === 0 && (
                  <div className="empty-placeholder">최근 계약 완료되었거나 취소 처리된 예약 기록이 없습니다.</div>
                )}
              </div>
            </section>
          )}

        </main>

        {/* Right Price Calculation Summary Column */}
        {activeCar && (
          <aside className="right-summary-column">
            <div className="panel-section price-summary-panel">
              <div className="panel-header">
                <h3>💳 실시간 가격 상세 계산서</h3>
              </div>

              <div className="summary-selected-car">
                <h4>{activeCar.name}</h4>
                <span className="sub">{selectedLocation} 지점 대여</span>
              </div>

              <div className="cost-breakdown">
                <div className="price-row">
                  <span>차량 기본료 ({activeCar.price.toLocaleString()}원 &times; {rentalDays}일)</span>
                  <span>{baseCarCost.toLocaleString()}원</span>
                </div>
                
                {/* Visual price row based on insuranceDisplay */}
                <div className="price-row">
                  <span>면책 보험료 ({insuranceDisplay} 등급)</span>
                  <span>{visualInsuranceCost.toLocaleString()}원</span>
                </div>

                <div className="price-row" v-if="babySeat || navigation">
                  <span>추가 옵션 가액 (베이비시트/네비)</span>
                  <span>{addonCost.toLocaleString()}원</span>
                </div>

                <div className="total-price-block">
                  <label>총 예상 요금:</label>
                  <p className="total-amount">{visualTotalAmount.toLocaleString()}원</p>
                </div>
              </div>

              {activeStep === 1 && (
                <button type="button" onClick={() => setActiveStep(2)} className="next-step-trigger-btn">
                  보험 설정 및 옵션선택 진행 ➔
                </button>
              )}
              {activeStep === 2 && (
                <button type="button" onClick={() => setActiveStep(3)} className="next-step-trigger-btn">
                  최종 예약서 서명 진행 ➔
                </button>
              )}
            </div>
          </aside>
        )}

      </div>

      {/* Toast Alert Systems */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button 
              className="toast-close" 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
