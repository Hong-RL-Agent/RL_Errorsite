import React, { useState, useEffect } from 'react';

export default function App() {
  // DB states
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [bookings, setBookings] = useState([]);

  // UI Filtering & Selection states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClassId, setSelectedClassId] = useState('class-01');
  const [selectedInstructorId, setSelectedInstructorId] = useState('inst-01');
  const [selectedMaterialId, setSelectedMaterialId] = useState('mat-clay-standard');
  const [selectedDateTime, setSelectedDateTime] = useState('2026-07-20 14:00');
  const [attendees, setAttendees] = useState(1);
  const [userName, setUserName] = useState('');

  // Total pricing states
  const [classTotalCost, setClassTotalCost] = useState(45000);
  const [materialTotalCost, setMaterialTotalCost] = useState(5000);

  // Editing state for dateTime change (Error 4 trigger)
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editDateTime, setEditDateTime] = useState('2026-07-21 16:00');

  // Toasts notifications
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadClasses();
    loadInstructors();
    loadMaterials();
    loadBookings();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      showToast('공방 과목 목록을 읽어오지 못했습니다.', 'danger');
    }
  };

  const loadInstructors = async () => {
    try {
      const res = await fetch('/api/instructors');
      const data = await res.json();
      setInstructors(data);
    } catch (err) {
      showToast('강사진 정보를 읽어오지 못했습니다.', 'danger');
    }
  };

  const loadMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      showToast('재료 옵션을 불러오지 못했습니다.', 'danger');
    }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      showToast('예약 이력 조회 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Error 1: Stale material selection check on instructor change
  const handleInstructorChange = (instructorId) => {
    setSelectedInstructorId(instructorId);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 사용자가 특정 재료를 선택한 후 강사를 다른 사람으로 변경했을 때, 
    // 새로 선택된 강사에게 미지원되는 재료 옵션(selectedMaterialId)이 활성화되어 있어도 
    // 선택을 강제 해제하거나 초기화하지 않고 그대로 유지해버립니다. 
    // 이로 인해 미지원 옵션을 조합하여 예약할 수 있는 허점이 발생합니다.
    // 원래 적용할 유효성 검증 코드:
    // const available = getAvailableMaterials(selectedClassId, instructorId);
    // if (!available.some(a => a.id === selectedMaterialId)) {
    //   setSelectedMaterialId(available[0]?.id || '');
    // }
  };

  // Helper: check which materials are available for the selected class/instructor
  const getAvailableMaterials = (classId, instructorId) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return [];

    // inst-02 (이도자기 실장) only supports clay-standard option
    if (instructorId === 'inst-02' && classId === 'class-01') {
      return materials.filter(m => m.id === 'mat-clay-standard');
    }

    return materials.filter(m => cls.materials.includes(m.id));
  };

  const getRenderedMaterials = () => {
    const available = getAvailableMaterials(selectedClassId, selectedInstructorId);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 강사를 교체하여 지원 범위 밖으로 밀려난 고급 재료(selectedMaterialId)라도,
    // 이미 선택된 상태라면 swatches 목록 끝단에 강제로 노출시켜 화면에서 선택 유지된 모습을 보여주고 예약되도록 뚫어 둡니다.
    if (selectedMaterialId && !available.some(a => a.id === selectedMaterialId)) {
      const extra = materials.find(m => m.id === selectedMaterialId);
      if (extra) {
        return [...available, extra];
      }
    }
    return available;
  };

  // Error 2: Total material fee does not subtract when attendee count decreases
  const handleAttendeesChange = (newCount) => {
    const prevCount = attendees;
    const count = Math.max(1, newCount);
    setAttendees(count);

    // Update Class Fee
    const cls = classes.find(c => c.id === selectedClassId);
    const basePrice = cls ? cls.basePrice : 0;
    setClassTotalCost(basePrice * count);

    // Update Material Fee
    const mat = materials.find(m => m.id === selectedMaterialId);
    const matPrice = mat ? mat.price : 0;

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 예약 인원을 낮추어 줄였을 때(예: 2명 -> 1명), 
    // 총 재료비(materialTotalCost) 계산식에서 인원 감소 분량을 반영하지 않고 
    // 이전 최대 인원(예: 2명분 재료비) 기준으로 가격을 그대로 동결해 청구합니다.
    if (count < prevCount) {
      // 인원 감소 시 총액 차감 누락시킴 (동결)
    } else {
      setMaterialTotalCost(matPrice * count);
    }
  };

  const handleMaterialSelect = (matId) => {
    setSelectedMaterialId(matId);
    const mat = materials.find(m => m.id === matId);
    const price = mat ? mat.price : 0;
    setMaterialTotalCost(price * attendees);
  };

  const handleClassChange = (classId) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      setClassTotalCost(cls.basePrice * attendees);
      
      // Select first instructor for this class
      const firstInstructor = cls.instructors[0];
      setSelectedInstructorId(firstInstructor);

      // Select first material for this class
      const firstMatId = cls.materials[0];
      setSelectedMaterialId(firstMatId);
      const matObj = materials.find(m => m.id === firstMatId);
      setMaterialTotalCost((matObj ? matObj.price : 0) * attendees);
    }
  };

  // Submit new booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast('예약자 성함을 입력해 주세요.', 'warning');
      return;
    }

    const payload = {
      name: userName,
      classId: selectedClassId,
      instructorId: selectedInstructorId,
      dateTime: selectedDateTime,
      materialOption: selectedMaterialId,
      attendees,
      totalCost: classTotalCost + materialTotalCost
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '예약 등록 실패');
      }

      showToast('성공적으로 공방 예약 신청이 수락되었습니다.', 'success');
      setUserName('');
      loadBookings();
    } catch (err) {
      showToast(`[예약 장애] ${err.message}`, 'danger');
    }
  };

  // Modify booking datetime (Error 4 Trigger)
  const handleUpdateDateTime = async (booking) => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...booking,
          dateTime: editDateTime
        })
      });
      if (res.ok) {
        showToast('예약 일정이 정상 수정되었습니다. (기존 시간 정원 미반환 버그 발생)', 'success');
        setEditingBookingId(null);
        loadBookings();
      }
    } catch (err) {
      showToast('예약 시간 변경 실패', 'danger');
    }
  };

  // Error 5: Trigger 404 for stock check
  const checkLiveStock = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: '재료 재고 확인' 기능을 지원하지 않는 가짜 엔드포인트 주소인 
    // '/api/materials/live-stock'을 의도적으로 비동기 호출하게 배치하여 브라우저 네트워크 모니터상에서 HTTP 404가 발생하도록 합니다.
    try {
      const res = await fetch('/api/materials/live-stock');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      showToast(`실시간 재고: ${JSON.stringify(data)}`, 'success');
    } catch (err) {
      showToast(`재고 확인 통신 에러 (404): ${err.message}`, 'danger');
    }
  };

  const getClassName = (id) => {
    const c = classes.find(x => x.id === id);
    return c ? c.title : id;
  };

  const getInstructorName = (id) => {
    const inst = instructors.find(x => x.id === id);
    return inst ? inst.name : id;
  };

  const getMaterialName = (id) => {
    const mat = materials.find(x => x.id === id);
    return mat ? mat.name : id;
  };

  // Filter classes list
  const filteredClasses = classes.filter(c => selectedCategory === 'All' || c.category === selectedCategory);
  const activeClass = classes.find(c => c.id === selectedClassId);

  return (
    <div class="craftroom-app">
      {/* App Navbar */}
      <header class="app-navbar">
        <div class="navbar-logo">
          <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span class="logo-title">CraftRoom</span>
          <span class="logo-subtitle">감성 핸드메이드 공방 예약</span>
        </div>
        <div class="navbar-actions">
          <button className="stock-chk-btn" onClick={checkLiveStock}>🏭 실시간 재료 재고 확인</button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div class="workspace-grid">
        
        {/* Left column: Craft category filters */}
        <aside class="panel-section left-craft-filters">
          <div class="panel-header">
            <h2>🏷️ 공예 분야</h2>
          </div>
          <div class="category-menu-list">
            {['All', '도자기', '가죽', '향수'].map(cat => (
              <button 
                key={cat}
                class={`category-menu-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? '전체 공예 클래스' : `${cat} 공방`}
              </button>
            ))}
          </div>
        </aside>

        {/* Center column: Classes list and active detail panel */}
        <main class="center-workshop-workspace">
          
          {/* Classes Cards Carousel/Grid */}
          <section class="classes-shelf-grid">
            {filteredClasses.map(cls => (
              <div 
                key={cls.id}
                class={`workbench-card ${selectedClassId === cls.id ? 'active' : ''} ${cls.category}`}
                onClick={() => handleClassChange(cls.id)}
              >
                <div class="workbench-surface">
                  <span class="category-badge">{cls.category}</span>
                  <h3>{cls.title}</h3>
                  <p class="desc">{cls.description}</p>
                </div>
                <div class="workbench-price">
                  <span>기본 체험비: <strong>{cls.basePrice.toLocaleString()}원</strong></span>
                </div>
              </div>
            ))}
          </section>

          {/* Active Detail & Option selection */}
          {activeClass && (
            <section class="panel-section active-class-details">
              <div class="panel-header">
                <h2>🔎 [{activeClass.category}] {activeClass.title} 체험 장비 & 옵션 설정</h2>
              </div>

              <div class="details-setup-grid">
                
                {/* Photo and instructor selection */}
                <div class="setup-block instructor-select-box">
                  <h3>👩‍🏫 전담 공예 아티스트 선택</h3>
                  <div class="instructors-slots-row">
                    {instructors
                      .filter(inst => activeClass.instructors.includes(inst.id))
                      .map(inst => (
                        <div 
                          key={inst.id}
                          class={`instructor-badge-card ${selectedInstructorId === inst.id ? 'active' : ''}`}
                          onClick={() => handleInstructorChange(inst.id)}
                        >
                          <div class="avatar-circle">🧑‍🎨</div>
                          <h4>{inst.name}</h4>
                          <p>{inst.specialty}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Date and time slots selection */}
                <div class="setup-block datetime-select-box">
                  <h3>📅 예약 가능 타임 세션</h3>
                  <div class="datetime-grid-list">
                    {['2026-07-20 14:00', '2026-07-20 16:00', '2026-07-21 14:00', '2026-07-21 16:00'].map(slot => (
                      <button 
                        key={slot}
                        type="button"
                        class={`slot-select-btn ${selectedDateTime === slot ? 'active' : ''}`}
                        onClick={() => setSelectedDateTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material Option selection (rendered as swatches) */}
                <div class="setup-block material-swatches-box">
                  <h3>🎨 옵션 견본 조각 선택 (가죽 원단/유약 색상/오일 칩)</h3>
                  <div class="swatches-row">
                    {getRenderedMaterials().map(mat => (
                      <div 
                        key={mat.id}
                        class={`swatch-fragment-card ${selectedMaterialId === mat.id ? 'active' : ''}`}
                        onClick={() => handleMaterialSelect(mat.id)}
                      >
                        <div class="color-swatch-piece" style={{ 'background-color': mat.hex }}></div>
                        <div class="swatch-info">
                          <span class="name">{mat.name}</span>
                          <span class="price">+ {mat.price.toLocaleString()}원</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>
          )}

        </main>

        {/* Right column: Booking checkout and list */}
        <aside class="right-checkout-column">
          
          {/* Checkout summary panel */}
          <section class="panel-section checkout-summary-card">
            <div class="panel-header">
              <h2>🛒 실시간 예약 요약</h2>
            </div>
            
            <form onSubmit={handleBookingSubmit} class="checkout-form">
              <div class="summary-details-list">
                <div class="summary-row">
                  <span>체험 과목:</span>
                  <strong>{getClassName(selectedClassId)}</strong>
                </div>
                <div class="summary-row">
                  <span>담당 강사:</span>
                  <strong>{getInstructorName(selectedInstructorId)}</strong>
                </div>
                <div class="summary-row">
                  <span>체험 시각:</span>
                  <strong>{selectedDateTime}</strong>
                </div>
                <div class="summary-row">
                  <span>선택 옵션:</span>
                  <strong>{getMaterialName(selectedMaterialId)}</strong>
                </div>
                
                {/* Attendees controllers */}
                <div class="summary-row attendees-ctrl">
                  <span>체험 인원:</span>
                  <div class="qty-mesh">
                    <button type="button" class="qty-btn" onClick={() => handleAttendeesChange(attendees - 1)}>-</button>
                    <span class="qty-val">{attendees}명</span>
                    <button type="button" class="qty-btn" onClick={() => handleAttendeesChange(attendees + 1)}>+</button>
                  </div>
                </div>

                <div class="pricing-block">
                  <div class="price-row">
                    <span>수업 체험료:</span>
                    <span>{classTotalCost.toLocaleString()}원</span>
                  </div>
                  <div class="price-row">
                    <span>옵션 재료비:</span>
                    <span>{materialTotalCost.toLocaleString()}원</span>
                  </div>
                  <div class="price-row total">
                    <span>최종 합계 금액:</span>
                    <span class="total-val">{(classTotalCost + materialTotalCost).toLocaleString()}원</span>
                  </div>
                </div>

                <div class="checkout-fields">
                  <input 
                    type="text" 
                    placeholder="예약자 성명 (테스트 시 '공방테스트' 입력)" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    class="checkout-in"
                  />
                  <button type="submit" class="submit-booking-btn">🎨 워크숍 예약 승인 신청</button>
                </div>
              </div>
            </form>
          </section>

          {/* My Bookings list with DateTime updates */}
          <section class="panel-section my-bookings-panel">
            <div class="panel-header">
              <h2>📅 내 예약 내역 ({bookings.length})</h2>
            </div>
            
            <div class="bookings-vertical-list">
              {bookings.map(book => (
                <div key={book.id} class="booking-item-card">
                  <div class="book-head">
                    <span class="name">👤 {book.name}</span>
                    <span class="price">{(book.totalCost || 0).toLocaleString()}원</span>
                  </div>
                  <div class="book-info">
                    <p>🪵 <strong>{getClassName(book.classId)}</strong></p>
                    <p>🧑‍🎨 {getInstructorName(book.instructorId)}</p>
                    <p>🎨 {getMaterialName(book.materialOption)}</p>
                    <p>🕒 {book.dateTime} ({book.attendees}명)</p>
                  </div>

                  {/* Inline datetime modifier */}
                  <div class="datetime-modifier-actions">
                    {editingBookingId === book.id ? (
                      <div class="edit-mode-mesh">
                        <select 
                          value={editDateTime} 
                          onChange={(e) => setEditDateTime(e.target.value)}
                          class="edit-select"
                        >
                          <option value="2026-07-20 14:00">2026-07-20 14:00</option>
                          <option value="2026-07-20 16:00">2026-07-20 16:00</option>
                          <option value="2026-07-21 14:00">2026-07-21 14:00</option>
                          <option value="2026-07-21 16:00">2026-07-21 16:00</option>
                        </select>
                        <div class="btn-group">
                          <button class="save-edit-btn" onClick={() => handleUpdateDateTime(book)}>저장</button>
                          <button class="cancel-edit-btn" onClick={() => setEditingBookingId(null)}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <button class="modify-time-btn" onClick={() => { setEditingBookingId(book.id); setEditDateTime(book.dateTime); }}>
                        🕒 예약 시간 변경
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div class="empty-placeholder">현재 진행 중인 공방 예약이 없습니다.</div>
              )}
            </div>
          </section>

        </aside>

      </div>

      {/* Toast alert popups */}
      <div class="toast-container">
        {toasts.map(t => (
          <div key={t.id} class={`toast-card ${t.type}`}>
            <span class="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span class="toast-message">{t.message}</span>
            <button class="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
