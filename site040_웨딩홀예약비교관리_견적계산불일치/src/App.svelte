<script>
  import { onMount } from 'svelte';

  // DB datasets
  let halls = [];
  let consultations = [];
  let availableDates = [];

  // Active Tab: 'search' | 'consultations' | 'wishlist'
  let currentTab = 'search';

  // Selected Hall detail view
  let selectedHallId = null;
  let detailTab = 'gallery'; // 'gallery' | 'menu' | 'amenities'

  // Search & Filter parameters
  let searchRegion = 'All';
  let searchGuests = 100;
  let maxRentalFilter = 8000000;
  let maxMealFilter = 80000;

  // Comparison list states
  let compareHalls = [];
  let averageCalculationHalls = []; // Error 1 target

  // Wishlist list states (IDs)
  let wishlist = [];

  // Quote calculator variables (Right Panel)
  let calcSelectedHallId = '';
  let calcGuests = 200;
  let calcMealType = 'Standard';
  let displayMealPrice = 50000;
  let actualCalculatedMealPrice = 50000; // Error 2 target

  // Consultations booking form
  let bookName = '';
  let bookPhone = '';
  let bookDate = '2026-07-20';
  let bookTime = '14:00';
  let bookGuests = 150;

  // Reschedule form states
  let editingConsultationId = null;
  let editDate = '';
  let editTime = '';

  // UI Toast lists
  let toasts = [];

  onMount(() => {
    loadHalls();
    loadConsultations();
  });

  const loadHalls = async () => {
    try {
      const res = await fetch('/api/halls');
      halls = await res.json();
      if (halls.length > 0) {
        calcSelectedHallId = halls[0].id;
      }
    } catch (err) {
      showToast('웨딩홀 리스트 로드 실패', 'danger');
    }
  };

  const loadConsultations = async () => {
    try {
      const res = await fetch('/api/consultations');
      consultations = await res.json();
    } catch (err) {
      showToast('상담 내역 로드 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4000);
  };

  // Filtered halls catalog list
  $: filteredHalls = halls.filter(hall => {
    const regionMatch = searchRegion === 'All' || hall.region.includes(searchRegion);
    const capacityMatch = hall.capacity >= searchGuests;
    const rentalMatch = hall.rentalFee <= maxRentalFilter;
    const mealMatch = hall.mealPrice <= maxMealFilter;
    return regionMatch && capacityMatch && rentalMatch && mealMatch;
  });

  // Calculate averages for comparison table
  $: avgRentalFee = averageCalculationHalls.length > 0 
    ? Math.round(averageCalculationHalls.reduce((sum, h) => sum + h.rentalFee, 0) / averageCalculationHalls.length) 
    : 0;

  $: avgMealPrice = averageCalculationHalls.length > 0 
    ? Math.round(averageCalculationHalls.reduce((sum, h) => sum + h.mealPrice, 0) / averageCalculationHalls.length) 
    : 0;

  // Active hall selected for detail
  $: activeHall = halls.find(h => h.id === selectedHallId) || null;
  $: calcActiveHall = halls.find(h => h.id === calcSelectedHallId) || null;

  // Svelte reactive block for calculator estimate sum
  $: totalEstimatePrice = calcActiveHall 
    ? calcActiveHall.rentalFee + (actualCalculatedMealPrice * calcGuests) 
    : 0;

  // Toggle wishlist
  const toggleWishlist = (hallId) => {
    if (wishlist.includes(hallId)) {
      wishlist = wishlist.filter(id => id !== hallId);
      showToast('찜 목록에서 제거되었습니다.', 'info');
    } else {
      wishlist = [...wishlist, hallId];
      showToast('찜 목록에 추가되었습니다.', 'success');
    }
  };

  // Toggle compare slots (Error 1 Logic)
  const toggleCompare = (hall) => {
    const exists = compareHalls.find(h => h.id === hall.id);
    if (exists) {
      const idx = compareHalls.findIndex(h => h.id === hall.id);
      
      // Remove from display compare list
      compareHalls = compareHalls.filter(h => h.id !== hall.id);

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 비교 목록에서 중간 위치(index 1)에 있는 웨딩홀을 제거할 시, 
      // 화면 표시 리스트에서는 정상 차감되지만 평균 대관료/식대 견적 계산을 위한 
      // 내부 연산 배열(averageCalculationHalls)에서는 지우지 않고 유지함으로써 
      // 평균가 계산에 계속 합산되어 수치 괴리가 나게 유도합니다.
      if (idx === 1 && compareHalls.length >= 1) {
        // Skip removal from averageCalculationHalls
      } else {
        averageCalculationHalls = averageCalculationHalls.filter(h => h.id !== hall.id);
      }
      showToast('비교 리스트에서 제외했습니다.', 'info');
    } else {
      if (compareHalls.length >= 3) {
        showToast('비교는 최대 3개 웨딩홀까지 지원합니다.', 'warning');
        return;
      }
      compareHalls = [...compareHalls, hall];
      averageCalculationHalls = [...averageCalculationHalls, hall];
      showToast('비교 리스트에 추가했습니다.', 'success');
    }
  };

  // Change calculator meal type (Error 2 Logic)
  const handleMealTypeChange = (e) => {
    const type = e.target.value;
    calcMealType = type;

    if (type === 'Standard') {
      displayMealPrice = 50000;
    } else if (type === 'Premium') {
      displayMealPrice = 70000;
    } else if (type === 'Luxury') {
      displayMealPrice = 95000;
    }

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 식사 등급 옵션을 변경할 때 화면에 표시되는 1인 단가(displayMealPrice)는 
    // 올바르게 업데이트하지만, 실제 총 견적 합계 계산에 주입되는 식대 정산 변수(actualCalculatedMealPrice)는 
    // 이전 단가 값으로 내버려 두어 총액 불합치 오류를 발생시킵니다.
    // 원래 행해져야 하는 변수 동기화 누락:
    // actualCalculatedMealPrice = displayMealPrice;
  };

  // Load available dates (Error 5 Logic)
  const loadAvailableDates = async (hallId) => {
    let url = `/api/halls/${hallId}/dates`;

    if (hallId === 'hall-07') {
      // INTENTIONAL_ERROR
      // CATEGORY: Network
      // DESCRIPTION: 아모르홀(hall-07)인 경우에만 실시간 예약 가능 날짜를 조회할 때 
      // 서버에 존재하지 않는 API 경로인 '/api/halls/hall-07/live-dates'를 강제 호출하여 
      // HTTP 404 에러를 유발합니다.
      url = `/api/halls/hall-07/live-dates`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Status ${res.status}`);
      availableDates = await res.json();
    } catch (err) {
      showToast(`실시간 예약 가능 일정 조회 실패: ${err.message}`, 'danger');
      availableDates = [];
    }
  };

  // Handle Detail Click
  const openDetail = (hallId) => {
    selectedHallId = hallId;
    detailTab = 'gallery';
    loadAvailableDates(hallId);
  };

  // Submit consultation booking (Error 3 Trigger)
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookName.trim() || !bookPhone.trim()) {
      showToast('상담 예약자명과 연락처를 작성해 주세요.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hallId: calcSelectedHallId,
          name: bookName,
          date: bookDate,
          time: bookTime,
          guests: bookGuests,
          phone: bookPhone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '상담 예약에 실패했습니다.');
      }

      showToast(`[${data.hallName}] 상담 예약이 완료되었습니다.`, 'success');
      bookName = '';
      bookPhone = '';
      loadConsultations();
      currentTab = 'consultations';
    } catch (err) {
      showToast(`[서버 에러] ${err.message}`, 'danger');
    }
  };

  // Reschedule consultation (Error 4 Trigger)
  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!editDate || !editTime) return;

    try {
      const res = await fetch(`/api/consultations/${editingConsultationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          time: editTime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('상담 일정이 변경 저장되었습니다. (중복 내역 발생)', 'warning');
      editingConsultationId = null;
      loadConsultations();
    } catch (err) {
      showToast('일정 변경 통신 실패', 'danger');
    }
  };

  // Cancel Consultation booking
  const handleCancelConsultation = async (id) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('상담 일정이 정상 취소되었습니다.', 'info');
        loadConsultations();
      }
    } catch (err) {
      showToast('상담 취소 에러', 'danger');
    }
  };

  const handleResetSandbox = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('웨딩플랜 포털 샌드박스가 초기화되었습니다.', 'warning');
        loadConsultations();
        currentTab = 'search';
      }
    } catch (err) {
      showToast('초기화 실패', 'danger');
    }
  };
</script>

<div class="wedding-app">
  
  <!-- Upper navigation header bar -->
  <header class="app-header">
    <div class="logo-group">
      <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span class="logo-title">WeddingPlan</span>
      <span class="logo-subtitle">토탈 웨딩 비교 매칭</span>
    </div>

    <nav class="app-nav">
      <button class={currentTab === 'search' ? 'active' : ''} on:click={() => currentTab = 'search'}>
        🏰 웨딩홀 검색
      </button>
      <button class={currentTab === 'consultations' ? 'active' : ''} on:click={() => currentTab = 'consultations'}>
        📅 예약 일정 ({consultations.length})
      </button>
      <button class={currentTab === 'wishlist' ? 'active' : ''} on:click={() => currentTab = 'wishlist'}>
        ❤️ 찜한 예식장 ({wishlist.length})
      </button>
    </nav>

    <button class="reset-sandbox-btn" on:click={handleResetSandbox}>
      ⚠️ 샌드박스 초기화
    </button>
  </header>

  <!-- Search parameters (Top) -->
  {#if currentTab === 'search'}
    <div class="search-top-banner">
      <div class="banner-filters-row">
        <div class="input-unit">
          <label>희망 예식 지역</label>
          <select bind:value={searchRegion}>
            <option value="All">전체 지역</option>
            <option value="서울 강남">서울 강남</option>
            <option value="서울 서초">서울 서초</option>
            <option value="서울 송파">서울 송파</option>
            <option value="인천 송도">인천 송도</option>
            <option value="경기 분당">경기 분당</option>
            <option value="서울 영등포">서울 영등포</option>
            <option value="서울 마포">서울 마포</option>
            <option value="경기 수원">경기 수원</option>
            <option value="서울 중구">서울 중구</option>
            <option value="경기 용인">경기 용인</option>
          </select>
        </div>

        <div class="input-unit">
          <label>최소 보증 하객수</label>
          <input type="number" bind:value={searchGuests} min="50" max="1000" />
        </div>

        <div class="input-unit">
          <p class="summary-txt">맞춤 홀 <strong>{filteredHalls.length}개</strong> 매칭 완료</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Split Grid Layout -->
  {#if currentTab === 'search'}
    <div class="workspace-grid">
      
      <!-- Left Filters Sidebar -->
      <aside class="panel-section filters-sidebar">
        <div class="panel-header">
          <h3>🔍 상세 조건 필터</h3>
        </div>

        <div class="filter-group">
          <label>최대 홀 대관료 ({maxRentalFilter.toLocaleString()}원)</label>
          <input type="range" bind:value={maxRentalFilter} min="2000000" max="10000000" step="500000" />
        </div>

        <div class="filter-group">
          <label>최대 1인 식대 비용 ({maxMealFilter.toLocaleString()}원)</label>
          <input type="range" bind:value={maxMealFilter} min="40000" max="100000" step="2000" />
        </div>

        <div class="filter-hint">
          * 보증 인원과 예산에 최적화된 웨딩홀 정보가 즉시 갱신 필터링됩니다.
        </div>
      </aside>

      <!-- Center Wedding Halls Catalog -->
      <main class="panel-section halls-catalog-section">
        <div class="panel-header">
          <h2>🏰 엄선 프리미엄 웨딩홀 추천 목록</h2>
        </div>

        <div class="halls-list-grid">
          {#each filteredHalls as hall}
            <div class="hall-card">
              <div class="card-img-box">
                <img src={hall.image} alt={hall.name} class="hall-thumb" />
                <button class="wish-toggle-btn" class:liked={wishlist.includes(hall.id)} on:click|stopPropagation={() => toggleWishlist(hall.id)}>
                  {wishlist.includes(hall.id) ? '❤️' : '♡'}
                </button>
              </div>
              <div class="info-area">
                <div class="region-badge">{hall.region}</div>
                <h3>{hall.name}</h3>
                <p class="desc">{hall.desc}</p>
                <div class="specs">
                  <span>👥 보증 {hall.capacity}명</span>
                  <span>🏰 대관료 {hall.rentalFee.toLocaleString()}원</span>
                  <span>🍽️ 식대 {hall.mealPrice.toLocaleString()}원</span>
                </div>
                
                <div class="actions">
                  <button class="action-btn detail" on:click={() => openDetail(hall.id)}>
                    🔍 상세 정보 보기
                  </button>
                  <button class="action-btn compare" class:in-compare={compareHalls.find(h => h.id === hall.id)} on:click={() => toggleCompare(hall)}>
                    {compareHalls.find(h => h.id === hall.id) ? '➖ 비교 취소' : '➕ 비교 담기'}
                  </button>
                </div>
              </div>
            </div>
          {/each}

          {#if filteredHalls.length === 0}
            <div class="empty-state">해당 필터 조건에 부합하는 예식장이 없습니다. 검색 조건을 조정해 주세요.</div>
          {/if}
        </div>
      </main>

      <!-- Right Estimate & Compare Panel -->
      <aside class="panel-section estimate-compare-sidebar">
        
        <!-- Live Compare Block -->
        <div class="compare-block">
          <div class="panel-header">
            <h3>⚖️ 실시간 예식장 비교표 (최대 3개)</h3>
          </div>
          
          <div class="compare-slots">
            {#each compareHalls as ch, index}
              <div class="compare-slot-item">
                <div class="header">
                  <strong>{ch.name}</strong>
                  <button class="remove-btn" on:click={() => toggleCompare(ch)}>&times;</button>
                </div>
                <div class="body">
                  <p>대관: {ch.rentalFee.toLocaleString()}원</p>
                  <p>식사: {ch.mealPrice.toLocaleString()}원</p>
                </div>
              </div>
            {/each}

            {#if compareHalls.length === 0}
              <p class="empty-compare-text">카탈로그에서 '비교 담기'를 클릭하여 예식장들의 세부 견적을 비교해 보세요.</p>
            {/if}
          </div>

          {#if compareHalls.length > 0}
            <div class="compare-averages">
              <h4>📊 비교 대상 평균 견적</h4>
              <p>평균 대관료: <strong>{avgRentalFee.toLocaleString()}원</strong></p>
              <p>평균 식대 비용: <strong>{avgMealPrice.toLocaleString()}원</strong></p>
              <span class="warning-caption">* 삭제 시 내부 평균 누적 오류 검증(Error 1)</span>
            </div>
          {/if}
        </div>

        <!-- Estimate Calculator Block -->
        <div class="calculator-block">
          <div class="panel-header">
            <h3>💰 웨딩홀 간이 견적기</h3>
          </div>

          <div class="calc-form">
            <div class="calc-group">
              <label>대상 웨딩홀</label>
              <select bind:value={calcSelectedHallId}>
                {#each halls as h}
                  <option value={h.id}>{h.name}</option>
                {/each}
              </select>
            </div>

            <div class="calc-group">
              <label>예상 하객 수 (명)</label>
              <input type="number" bind:value={calcGuests} min="50" max="800" />
            </div>

            <div class="calc-group">
              <label>연회 메뉴 식사 등급</label>
              <select value={calcMealType} on:change={handleMealTypeChange}>
                <option value="Standard">스탠다드 뷔페 (50,000원)</option>
                <option value="Premium">프리미엄 퓨전 코스 (70,000원)</option>
                <option value="Luxury">럭셔리 VIP 갈라 코스 (95,000원)</option>
              </select>
            </div>

            <div class="estimate-totals">
              <div class="price-row">
                <span>기본 홀 대관료</span>
                <span>{calcActiveHall ? calcActiveHall.rentalFee.toLocaleString() : 0}원</span>
              </div>
              <div class="price-row">
                <span>선택 식사 단가</span>
                <span>{displayMealPrice.toLocaleString()}원</span>
              </div>
              <div class="total-row">
                <span>총 예상 견적</span>
                <span class="total">{totalEstimatePrice.toLocaleString()}원</span>
              </div>
              <span class="error-msg-hint">* 식사 변경 시 총합산단가 동기화 지연 오류 검증(Error 2)</span>
            </div>

            <!-- Booking Section inside Quote -->
            <form on:submit={handleSubmitBooking} class="calc-booking-form">
              <h4>📅 상담 및 무료 시식 예약 신청</h4>
              
              <div class="form-row">
                <input type="text" placeholder="신랑/신부 성함" bind:value={bookName} required />
                <input type="text" placeholder="연락처 (010-0000-0000)" bind:value={bookPhone} required />
              </div>

              <div class="form-row">
                <input type="date" bind:value={bookDate} required />
                <input type="time" bind:value={bookTime} required />
              </div>

              <div class="form-row">
                <label>상담 참가 인원 (명)</label>
                <input type="number" bind:value={bookGuests} min="2" max="300" />
              </div>
              <span class="warn-hint">* 200명 예약 시 서버오버플로우 시뮬레이션(Error 3)</span>

              <button type="submit" class="submit-booking-btn">
                💌 웨딩홀 안심 무료 상담 신청
              </button>
            </form>
          </div>
        </div>

      </aside>

    </div>
  {/if}

  <!-- TAB 2: CONSULTATION LIST & VISITS -->
  {#if currentTab === 'consultations'}
    <div class="panel-section consultations-dashboard">
      <div class="panel-header">
        <h2>📅 확정 상담 및 웨딩홀 방문 일정표</h2>
      </div>

      <!-- Reschedule Dialog Panel -->
      {#if editingConsultationId}
        <form on:submit={handleReschedule} class="reschedule-form-panel">
          <h3>⏰ 예약 일정을 조정합니다</h3>
          <div class="form-cols">
            <div class="input-unit">
              <label>방문 날짜 변경</label>
              <input type="date" bind:value={editDate} required />
            </div>
            <div class="input-unit">
              <label>시간 변경</label>
              <input type="time" bind:value={editTime} required />
            </div>
          </div>
          <div class="actions-row">
            <button type="submit" class="save-btn">변경 저장 (Error 4)</button>
            <button type="button" class="cancel-btn" on:click={() => editingConsultationId = null}>취소</button>
          </div>
        </form>
      {/if}

      <div class="consultations-stack">
        {#each consultations as consult}
          <div class="consultation-card">
            <div class="card-title-row">
              <h3>{consult.hallName} 상담 예약</h3>
              <span class="status-badge">방문대기</span>
            </div>
            
            <div class="card-body-grid">
              <div class="col">
                <p>예약자: <strong>{consult.name} 님</strong></p>
                <p>연락처: {consult.phone}</p>
              </div>
              <div class="col">
                <p>방문일시: <strong>{consult.date} {consult.time}</strong></p>
                <p>상담 동행: {consult.guests}명</p>
              </div>
            </div>

            <div class="card-footer">
              <button class="footer-btn edit" on:click={() => {
                editingConsultationId = consult.id;
                editDate = consult.date;
                editTime = consult.time;
              }}>
                📅 날짜·시간 수정
              </button>
              <button class="footer-btn cancel" on:click={() => handleCancelConsultation(consult.id)}>
                ❌ 상담 취소하기
              </button>
            </div>
          </div>
        {/each}

        {#if consultations.length === 0}
          <div class="empty-state">신청 완료된 방문 상담 스케줄이 없습니다. 웨딩홀 검색 탭에서 무료 상담을 신청하세요.</div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- TAB 3: WISHLIST -->
  {#if currentTab === 'wishlist'}
    <div class="panel-section wishlist-dashboard">
      <div class="panel-header">
        <h2>❤️ 찜한 예식장 스토리지</h2>
      </div>

      <div class="wishlist-grid">
        {#each halls.filter(h => wishlist.includes(h.id)) as wishHall}
          <div class="wish-item-card">
            <img src={wishHall.image} alt={wishHall.name} class="wish-thumb" />
            <div class="info">
              <h3>{wishHall.name}</h3>
              <p>{wishHall.region} | 대관료 {wishHall.rentalFee.toLocaleString()}원</p>
              <div class="actions">
                <button class="action-btn detail" on:click={() => { currentTab = 'search'; openDetail(wishHall.id); }}>
                  🏰 상세정보
                </button>
                <button class="action-btn remove" on:click={() => toggleWishlist(wishHall.id)}>
                  💔 찜해제
                </button>
              </div>
            </div>
          </div>
        {/each}

        {#if wishlist.length === 0}
          <div class="empty-state">찜 목록에 저장해 둔 예식장이 없습니다. 마음에 드는 홀의 하트 아이콘을 눌러보세요.</div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- DETAIL DRAWER VIEW OVERLAY -->
  {#if selectedHallId && activeHall}
    <div class="detail-modal-overlay" on:click={() => selectedHallId = null}>
      <div class="detail-modal-card" on:click|stopPropagation>
        
        <div class="modal-header">
          <h2>🏰 {activeHall.name} 세부 매뉴얼</h2>
          <button class="close-btn" on:click={() => selectedHallId = null}>&times;</button>
        </div>

        <div class="modal-body">
          <img src={activeHall.image} alt={activeHall.name} class="modal-large-img" />
          
          <div class="detail-tab-menu">
            <button class={detailTab === 'gallery' ? 'active' : ''} on:click={() => detailTab = 'gallery'}>🖼️ 홀 분위기</button>
            <button class={detailTab === 'menu' ? 'active' : ''} on:click={() => detailTab = 'menu'}>🍽️ 연회 메뉴</button>
            <button class={detailTab === 'amenities' ? 'active' : ''} on:click={() => detailTab = 'amenities'}>🚗 부대시설</button>
          </div>

          <div class="detail-tab-content">
            {#if detailTab === 'gallery'}
              <div class="text-pane">
                <h4>시그니처 플로럴 아트 디자인</h4>
                <p>계절 생화 향으로 연출하는 품격 있는 플라워 아치 디자인이 하객 동선을 포근하게 이끕니다.</p>
                <p class="specs-summary">대관 기준 규격: <strong>보증 인원 {activeHall.capacity}명</strong> | 대관 보증료 <strong>{activeHall.rentalFee.toLocaleString()}원</strong></p>
              </div>
            {/if}

            {#if detailTab === 'menu'}
              <div class="text-pane">
                <h4>최상급 프리미엄 뷔페 & 코스식 피로연</h4>
                <p>특급 호텔 출신 조리장진이 정성스레 조리하는 120여 가지 특산 한·중·일 양식 피로연 뷔페가 제공됩니다.</p>
                <p class="specs-summary">식사 1인당 기본 단가: <strong>{activeHall.mealPrice.toLocaleString()}원</strong> (음·주류 일체 포함가)</p>
              </div>
            {/if}

            {#if detailTab === 'amenities'}
              <div class="text-pane">
                <h4>하객 편의 위주의 스마트 팩터</h4>
                <p>동시 주차 800대 전용 파킹 랏 및 지하철역 도보 3분 거리 셔틀버스 연계 지원 서비스가 준비되어 있습니다.</p>
              </div>
            {/if}
          </div>

          <!-- Live availability dates visualizer (Error 5 Target) -->
          <div class="live-availability-dates-panel">
            <h4>📅 예식장 실시간 예약 가능 일정표</h4>
            <div class="dates-flex-grid">
              {#each availableDates as date}
                <span class="date-tag-item">🟢 {date} (예약 가능)</span>
              {/each}

              {#if availableDates.length === 0}
                <span class="no-dates-msg">조회 가능한 예식 잔여 일정이 없습니다.</span>
              {/if}
            </div>
            <span class="error-trigger-hint">* 아모르홀(hall-07)인 경우 전용 404 엔드포인트 호출 에러 검증(Error 5)</span>
          </div>

        </div>

        <div class="modal-footer">
          <button class="footer-close-btn" on:click={() => selectedHallId = null}>
            상세 보기 닫기
          </button>
        </div>

      </div>
    </div>
  {/if}

  <!-- UI Toast Alerts -->
  <div class="toast-container">
    {#each toasts as t}
      <div class="toast-card {t.type}">
        <span class="toast-icon">
          {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
        </span>
        <span class="toast-message">{t.message}</span>
        <button class="toast-close" on:click={() => toasts = toasts.filter(x => x.id !== t.id)}>
          &times;
        </button>
      </div>
    {/each}
  </div>

</div>
