<script>
  import { onMount } from 'svelte';

  // Navigation tabs: 'booking' | 'tracking' | 'documents' | 'history'
  let activeTab = 'booking';

  // Search parameters
  let searchFrom = '서울';
  let searchTo = '도쿄';
  let searchDate = '2026-07-14';

  // Filters
  let carrierFilter = 'All';
  let maxPricePerKg = 15;

  // Databases
  let flights = [];
  let bookings = [];
  let documents = [];
  let selectedFlight = null;

  // Booking Calculator (Error 1 targets)
  let weight = 150;
  let prevWeight = 150;
  let packageType = 'Box'; // 'Box' | 'Pallet' | 'Container'
  
  // Custom document upload field
  let newDocName = '세관 신고 서류 사본.pdf';

  // Cargo Tracking Status (Error 5 targets)
  let selectedBookingId = 'bk-1001';
  let timelineStatus = '접수'; // '접수' | '세관통과' | '선적완료' | '도착'
  let detailPanelStatus = '접수';

  // UI Toast indicators
  let toasts = [];

  onMount(() => {
    loadFlights();
    loadBookings();
    loadDocuments();
  });

  async function loadFlights() {
    try {
      const res = await fetch('/api/flights');
      flights = await res.json();
    } catch (err) {
      showToast('항공편 목록 로드 실패', 'danger');
    }
  }

  async function loadBookings() {
    try {
      const res = await fetch('/api/bookings');
      bookings = await res.json();
    } catch (err) {
      showToast('예약 데이터 로드 실패', 'danger');
    }
  }

  async function loadDocuments() {
    try {
      const res = await fetch('/api/documents');
      documents = await res.json();
    } catch (err) {
      showToast('서류 목록 로드 실패', 'danger');
    }
  }

  function showToast(message, type = 'info') {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  }

  // Reactive Fare calculation Svelte style
  $: calculatedFare = (() => {
    if (!selectedFlight) return 0;
    const base = selectedFlight.pricePerKg;
    const multiplier = packageType === 'Box' ? 1.0 : packageType === 'Pallet' ? 1.5 : 2.0;
    return Math.round(weight * base * multiplier);
  })();

  // Weight handler with delayed sync (Error 1 Logic)
  function handleWeightInput(e) {
    weight = Number(e.target.value);
    
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Backend
    // DESCRIPTION: 화물 무게를 바꾼 직후 포장 유형을 조작하면, 화면상 요금은 최신 무게(weight) 기준으로 
    // 정밀 재계산되나, 서버 전송용 payload 객체에는 1000ms의 동기화 지연시간 때문에 
    // 이전 무게(prevWeight)와 새 포장 유형이 꼬인 상태로 넘어가 오합지졸 가격으로 결제 승인이 납니다.
    setTimeout(() => {
      prevWeight = weight;
    }, 1000);
  }

  // Create booking request (Error 1 submit)
  async function handleCreateBooking() {
    if (!selectedFlight) {
      showToast('예약할 항공편을 선택해 주세요.', 'warning');
      return;
    }

    const payload = {
      flightId: selectedFlight.id,
      from: selectedFlight.from,
      to: selectedFlight.to,
      date: searchDate,
      weight: prevWeight, // BUG: Sends outdated weight before sync completes
      packageType,
      fare: calculatedFare // Sends fare based on new weight
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('항공 화물 예약이 정상 승인되었습니다.', 'success');
        loadBookings();
      }
    } catch (err) {
      showToast('예약 승인 오류', 'danger');
    }
  }

  // Route search race condition demo (Error 2 Logic)
  function triggerSearchRaceDemo() {
    // Search Sequence: 도쿄 (3s) -> 방콕 (1s) -> 싱가포르 (0.2s)
    showToast('항공 노선 순차 탐색 레이스 컨디션을 시작합니다...', 'info');

    // 1. Tokyo (3000ms delay)
    fetch('/api/flights/search?from=서울&to=도쿄')
      .then(res => res.json())
      .then(data => {
        flights = data.results;
        searchTo = data.to;
        showToast('서울-도쿄 노선 정보 수신 완료 (3초 지연)', 'warning');
      });

    // 2. Bangkok (1000ms delay)
    setTimeout(() => {
      fetch('/api/flights/search?from=서울&to=방콕')
        .then(res => res.json())
        .then(data => {
          flights = data.results;
          searchTo = data.to;
          showToast('서울-방콕 노선 정보 수신 완료 (1초)', 'info');
        });
    }, 100);

    // 3. Singapore (200ms delay)
    setTimeout(() => {
      fetch('/api/flights/search?from=서울&to=싱가포르')
        .then(res => res.json())
        .then(data => {
          flights = data.results;
          searchTo = data.to;
          showToast('서울-싱가포르 노선 정보 수신 완료 (0.2초)', 'info');
        });
    }, 200);
  }

  // Reschedule & cancel race simulation (Error 3 Logic)
  async function triggerRescheduleAndCancelDemo(bookingId) {
    showToast('예약 일정 변경 직후 취소 시뮬레이터를 작동합니다.', 'info');

    // 1. PUT update date (3000ms delay on server)
    fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: "2026-07-28",
        weight: 180
      })
    });

    // 2. DELETE cancel immediately (0.2s delay)
    setTimeout(async () => {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('예약 즉각 취소(삭제) 정상 처리 성공 (0.2초 경과)', 'success');
        loadBookings();
      }
    }, 200);

    // Reload booking list after 3.5s to see it resurrected
    setTimeout(() => {
      showToast('일정 변경 백그라운드 지연 완료 (예약 부활 확인)', 'warning');
      loadBookings();
    }, 3500);
  }

  // Custom document upload
  async function handleUploadDoc() {
    if (!newDocName.trim()) return;
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDocName })
      });
      if (res.ok) {
        showToast('통관 서류 파일이 업로드되었습니다.', 'success');
        loadDocuments();
        newDocName = '';
      }
    } catch (err) {
      showToast('업로드 실패', 'danger');
    }
  }

  // Custom document download (Error 4 download 404 test)
  async function handleDownloadDoc(docName) {
    try {
      const res = await fetch(`/api/documents/download/${encodeURIComponent(docName)}`);
      if (res.status === 404) {
        const text = await res.text();
        showToast(`다운로드 실패: ${text}`, 'danger');
      } else {
        const data = await res.json();
        showToast(`${data.fileContent}`, 'success');
      }
    } catch (err) {
      showToast('통신 오류', 'danger');
    }
  }

  // Tracking status filter change (Error 5 Logic)
  function handleStatusFilterChange(newStatus) {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 추적 필터를 바꿨을 때 지도 노선 타임라인(`timelineStatus`)은 
    // 변경된 신규 필터로 즉시 갱신되지만, 우측 상세 지시어 패널(`detailPanelStatus`)은 
    // 갱신 코드 누락으로 과거 상태를 계속 잔존 노출시키는 상태 격차 오동작을 발현시킵니다.
    timelineStatus = newStatus;
  }

  // Normal search trigger
  async function handleSearch() {
    try {
      const res = await fetch(`/api/flights/search?from=${searchFrom}&to=${searchTo}`);
      const data = await res.json();
      flights = data.results;
      showToast(`${searchTo} 노선 항공편 조회가 완료되었습니다.`, 'success');
    } catch (err) {
      showToast('검색 에러', 'danger');
    }
  }

  // Compute flights applying UI filter
  $: filteredFlights = flights.filter(f => {
    const carrierMatch = carrierFilter === 'All' || f.carrier === carrierFilter;
    const priceMatch = f.pricePerKg <= maxPricePerKg;
    return carrierMatch && priceMatch;
  });
</script>

<div class="aircargo-app">
  
  <!-- Header bar -->
  <header class="app-header">
    <div class="logo-group">
      <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM12 22V12M12 12L4 7.5M12 12l8-4.5"/>
      </svg>
      <span class="logo-title">AirCargo Hub</span>
      <span class="logo-subtitle">Aviation Freight logistics portal</span>
    </div>

    <nav class="app-nav">
      <button class={activeTab === 'booking' ? 'active' : ''} on:click={() => activeTab = 'booking'}>
        ✈️ 항공 예약/운임비교
      </button>
      <button class={activeTab === 'tracking' ? 'active' : ''} on:click={() => activeTab = 'tracking'}>
        📍 실시간 화물 추적
      </button>
      <button class={activeTab === 'documents' ? 'active' : ''} on:click={() => activeTab = 'documents'}>
        📂 관세/수출입 서류
      </button>
      <button class={activeTab === 'history' ? 'active' : ''} on:click={() => activeTab = 'history'}>
        🕒 예약 일정 변경/이력
      </button>
    </nav>
  </header>

  <!-- Route Search Bar -->
  <div class="search-actions-bar">
    <div class="search-fields-row">
      <div class="field">
        <label>출발지</label>
        <select bind:value={searchFrom}>
          <option value="서울">서울 (ICN)</option>
          <option value="부산">부산 (PUS)</option>
        </select>
      </div>
      <div class="field">
        <label>도착지</label>
        <select bind:value={searchTo}>
          <option value="도쿄">도쿄 (NRT)</option>
          <option value="방콕">방콕 (BKK)</option>
          <option value="싱가포르">싱가포르 (SIN)</option>
          <option value="홍콩">홍콩 (HKG)</option>
        </select>
      </div>
      <div class="field">
        <label>적재 기준일</label>
        <input type="date" bind:value={searchDate} />
      </div>
      <button class="search-submit-btn" on:click={handleSearch}>🛫 노선 검색</button>
    </div>

    <button class="simulation-btn search-race" on:click={triggerSearchRaceDemo}>
      ⚡ 노선 순차 검색 레이스 시뮬레이터 (Error 2)
    </button>
  </div>

  <!-- TAB 1: BOOKING & RATES COMPARISON -->
  {#if activeTab === 'booking'}
    <div class="booking-workspace-grid">
      
      <!-- Left Filters -->
      <aside class="panel-section left-cargo-filters">
        <div class="filter-header">
          <h3>⚙️ 화물 및 운송 조건 필터</h3>
        </div>

        <div class="filter-group">
          <label>항공사 필터</label>
          <select bind:value={carrierFilter} class="widget-select">
            <option value="All">전체 항공사</option>
            <option value="대한항공">대한항공</option>
            <option value="아시아나">아시아나</option>
            <option value="싱가포르항공">싱가포르항공</option>
            <option value="타이항공">타이항공</option>
          </select>
        </div>

        <div class="filter-group">
          <label>최대 Kg당 운임: <strong>${maxPricePerKg}</strong></label>
          <input type="range" min="3" max="15" bind:value={maxPricePerKg} class="range-slider" />
        </div>
      </aside>

      <!-- Center Rates Table -->
      <main class="panel-section center-flights-table">
        <div class="panel-header">
          <h2>🛫 취항 노선 스케줄 및 운임 대조표</h2>
        </div>

        <table class="flights-table">
          <thead>
            <tr>
              <th>편명</th>
              <th>항공사</th>
              <th>출발지</th>
              <th>도착지</th>
              <th>스케줄</th>
              <th>Kg당 운임</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredFlights as flight}
              <tr 
                class:selected={selectedFlight && selectedFlight.id === flight.id}
                on:click={() => selectedFlight = flight}
              >
                <td><code>{flight.id}</code></td>
                <td><strong>{flight.carrier}</strong></td>
                <td>{flight.from}</td>
                <td>{flight.to}</td>
                <td>{flight.date} ({flight.time})</td>
                <td class="price-td">${flight.pricePerKg}</td>
              </tr>
            {/each}
          </tbody>
        </table>

        <!-- Card layout for mobile screens -->
        <div class="flights-cards-mobile">
          {#each filteredFlights as flight}
            <div 
              class="mobile-flight-card"
              class:selected={selectedFlight && selectedFlight.id === flight.id}
              on:click={() => selectedFlight = flight}
            >
              <div class="header">
                <strong>{flight.carrier}</strong>
                <span><code>{flight.id}</code></span>
              </div>
              <div class="details">
                <span>{flight.from} ➔ {flight.to}</span>
                <span class="price">${flight.pricePerKg} / Kg</span>
              </div>
            </div>
          {/each}
        </div>
      </main>

      <!-- Right Summary Panel -->
      <aside class="panel-section right-booking-summary">
        {#if selectedFlight}
          <div class="summary-wrapper">
            <h3>📑 화물 위탁 예약서</h3>
            <p class="flight-lbl">항공편: <strong>{selectedFlight.id} ({selectedFlight.carrier})</strong></p>
            <p class="flight-route">{selectedFlight.from} ➔ {selectedFlight.to} | {searchDate}</p>

            <div class="calculator-inputs">
              <div class="input-block">
                <label>화물 중량 (Weight)</label>
                <div class="input-row">
                  <input 
                    type="number" 
                    value={weight} 
                    on:input={handleWeightInput}
                    min="10" 
                  />
                  <span>Kg</span>
                </div>
              </div>

              <div class="input-block">
                <label>화물 패킹 유형 (Type)</label>
                <select bind:value={packageType}>
                  <option value="Box">일반 박스 패키지 (x1.0)</option>
                  <option value="Pallet">목재/철제 팔레트 (x1.5)</option>
                  <option value="Container">항공 컨테이너 (x2.0)</option>
                </select>
              </div>
            </div>

            <div class="fare-total-block">
              <span>최종 예상 운임</span>
              <strong>${calculatedFare} USD</strong>
            </div>

            <button class="booking-submit-btn" on:click={handleCreateBooking}>
              ✍️ 항공 화물 예약 등록
            </button>
            <p class="calc-hint">* 요금은 {weight}Kg 기준으로 실시간 계산 완료되었습니다.</p>
          </div>
        {:else}
          <div class="empty-msg">
            상단의 노선을 검색한 뒤, 테이블에서 원하시는 항공편을 선택해 주세요.
          </div>
        {/if}
      </aside>

    </div>
  {/if}

  <!-- TAB 2: REAL-TIME CARGO TRACKING -->
  {#if activeTab === 'tracking'}
    <div class="tracking-workspace-grid">
      
      <!-- Left side: tracking selection and status controls -->
      <aside class="panel-section left-tracking-controls">
        <h3>📍 운송 화물 목록</h3>
        <div class="bookings-mini-stack">
          {#each bookings as b}
            <div 
              class="booking-mini-item"
              class:selected={selectedBookingId === b.id}
              on:click={() => selectedBookingId = b.id}
            >
              <strong>{b.id}</strong>
              <span>{b.from} ➔ {b.to} ({b.weight}Kg)</span>
            </div>
          {/each}
        </div>

        <div class="status-modifier-widget">
          <h4>📍 세관/운송 상태 수동 조정</h4>
          <div class="status-buttons-grid">
            <button class:active={timelineStatus === '접수'} on:click={() => handleStatusFilterChange('접수')}>
              접수
            </button>
            <button class:active={timelineStatus === '세관통과'} on:click={() => handleStatusFilterChange('세관통과')}>
              세관통과
            </button>
            <button class:active={timelineStatus === '선적완료'} on:click={() => handleStatusFilterChange('선적완료')}>
              선적완료
            </button>
            <button class:active={timelineStatus === '도착'} on:click={() => handleStatusFilterChange('도착')}>
              도착
            </button>
          </div>
        </div>
      </aside>

      <!-- Center & Right combined: route timeline maps -->
      <main class="panel-section center-tracking-map">
        <h2>📍 글로벌 항공 운송 노선 추적 타임라인</h2>
        
        <div class="timeline-visual-map">
          <div class="timeline-line"></div>
          
          <div class="node-step" class:completed={['접수', '세관통과', '선적완료', '도착'].includes(timelineStatus)}>
            <div class="dot"></div>
            <strong>화물 접수</strong>
            <span>ICN Terminal</span>
          </div>

          <div class="node-step" class:completed={['세관통과', '선적완료', '도착'].includes(timelineStatus)}>
            <div class="dot"></div>
            <strong>수출세관 검역</strong>
            <span>Customs Office</span>
          </div>

          <div class="node-step" class:completed={['선적완료', '도착'].includes(timelineStatus)}>
            <div class="dot"></div>
            <strong>항공 선적 완료</strong>
            <span>Flight Loaded</span>
          </div>

          <div class="node-step" class:completed={timelineStatus === '도착'}>
            <div class="dot"></div>
            <strong>목적지 도착</strong>
            <span>Dest Terminal</span>
          </div>
        </div>

        <!-- Right Side status mismatch (Error 5 Target) -->
        <div class="mismatch-detail-box">
          <h3>📋 관세 행정 최종 상세 통보</h3>
          
          <!-- INTENTIONAL_ERROR
               CATEGORY: Frontend
               DESCRIPTION: 지도 타임라인 노드 등은 timelineStatus를 받아 즉시 갱신되는 반면,
               우측 통보 정보 영역에서는 detailPanelStatus 변수만을 출력하도록 고정하고 
               갱신을 누락시킴으로써 화면 상태가 서로 불일치하는 결함을 낳습니다. -->
          <div class="detail-grid-item">
            <span>최종 보고된 화물 상태:</span>
            <strong class="status-tag">{detailPanelStatus}</strong>
          </div>
          <div class="detail-grid-item">
            <span>위치 정보:</span>
            <span>인천 국제 항공 화물 터미널 B</span>
          </div>
          <div class="detail-grid-item text-warning">
            <span>* 필터를 바꾸어도 상세 정보 상태는 변경되지 않고 고정되어 있습니다.</span>
          </div>
        </div>
      </main>

    </div>
  {/if}

  <!-- TAB 3: CUSTOMS & EXPORT DOCUMENTS -->
  {#if activeTab === 'documents'}
    <div class="documents-workspace-grid">
      
      <!-- Upload panel -->
      <div class="panel-section upload-composer-card">
        <h3>📂 신규 세관/통관 서류 파일 등록</h3>
        <div class="form-group">
          <label>파일 서류 명칭 (공백과 한글 포함 필수)</label>
          <input type="text" bind:value={newDocName} class="form-input" />
        </div>
        <button class="doc-upload-btn" on:click={handleUploadDoc}>
          📤 서류 업로드 (Error 4)
        </button>
        <span class="warning-txt">* 공백 및 한글이 포함된 파일은 다운로드 시 404가 발생하도록 인코딩 불일치가 내포되어 있습니다.</span>
      </div>

      <!-- Docs grid table -->
      <div class="panel-section documents-list-card">
        <h3>📂 보관 승인된 서류 목록</h3>
        <table class="docs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>서류명</th>
              <th>서류 경로</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {#each documents as doc}
              <tr>
                <td><code>{doc.id}</code></td>
                <td><strong>{doc.name}</strong></td>
                <td><code>{doc.path}</code></td>
                <td>
                  <button class="doc-download-btn" on:click={() => handleDownloadDoc(doc.name)}>
                    📥 서류 다운로드
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

    </div>
  {/if}

  <!-- TAB 4: HISTORY & CHANGE SCHEDULES -->
  {#if activeTab === 'history'}
    <div class="history-workspace-grid">
      
      <div class="panel-section bookings-history-panel">
        <div class="panel-header">
          <h2>🕒 화물 위탁 예약 내역 및 스케줄 변경 관리</h2>
        </div>

        <table class="bookings-history-table">
          <thead>
            <tr>
              <th>예약번호</th>
              <th>항공편</th>
              <th>출발 ➔ 도착</th>
              <th>선적 일자</th>
              <th>무게 (Kg)</th>
              <th>운임 요금</th>
              <th>계약 상태</th>
              <th>작업 관리 (Error 3)</th>
            </tr>
          </thead>
          <tbody>
            {#each bookings as b}
              <tr>
                <td><code>{b.id}</code></td>
                <td><code>{b.flightId}</code></td>
                <td>{b.from} ➔ {b.to}</td>
                <td><strong>{b.date}</strong></td>
                <td>{b.weight} Kg</td>
                <td class="price">${b.fare}</td>
                <td><span class="status-badge confirmed">{b.status}</span></td>
                <td>
                  <div class="action-buttons-row">
                    <button class="action-btn change" on:click={() => triggerRescheduleAndCancelDemo(b.id)}>
                      ⚡ 일정 변경 후 바로 취소
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if bookings.length === 0}
          <div class="empty-msg">
            등록된 예약 내역 계약서가 존재하지 않습니다.
          </div>
        {/if}
      </div>

    </div>
  {/if}

  <!-- UI Action Toasts -->
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

<style>
  /* Localized overrides or components */
</style>
