<script>
  import { onMount } from 'svelte';

  // DB states
  let trip = null;
  let searchResults = [];
  let shareData = null;

  // Tabs & filters
  let activeTab = 'edit'; // 'edit' or 'share'
  let selectedDay = '';
  let searchQuery = '제주';

  // Expense form inputs
  let newExpenseName = '';
  let newExpenseCost = '';

  // Day add form input
  let newDayInput = '';

  // UI state variables
  let toasts = [];
  let totalCost = 0;

  // INTENTIONAL_ERROR target
  // We keep a local reactive rendering array for places so drag/reorder changes in UI.
  let localPlaces = [];

  $: {
    if (trip && selectedDay) {
      localPlaces = [...(trip.places[selectedDay] || [])];
    }
  }

  onMount(async () => {
    await loadTrip();
    await searchLocations();
  });

  const loadTrip = async () => {
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      trip = data;
      if (trip.days.length > 0) {
        selectedDay = trip.days[0];
      }
      recalculateTotalCost();
    } catch (err) {
      showToast('여행 일정 DB 로드 실패', 'danger');
    }
  };

  const recalculateTotalCost = () => {
    if (trip && trip.expenses) {
      totalCost = trip.expenses.reduce((acc, cur) => acc + cur.cost, 0);
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  };

  const saveTrip = async () => {
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
      if (res.ok) {
        showToast('일정 변경 내역이 서버에 영구 보존되었습니다.', 'success');
      }
    } catch (err) {
      showToast('일정 저장 통신 에러', 'danger');
    }
  };

  // Error 2: Search for '숨은명소' returns 404
  const searchLocations = async () => {
    let url = `/api/places?q=${encodeURIComponent(searchQuery)}`;
    
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 사용자가 입력한 검색어가 정확히 '숨은명소'일 때, 존재하지 않는 
    // 백엔드 주소인 '/api/places/secret-search'로 요청을 전송하도록 분기하여 브라우저 개발자 도구상에서
    // HTTP 404 Not Found 에러가 발생하며 검색 기능이 멈추게 유도합니다.
    if (searchQuery === '숨은명소') {
      url = '/api/places/secret-search';
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      searchResults = data;
    } catch (err) {
      showToast(`장소 검색 실패: ${err.message}`, 'danger');
      searchResults = [];
    }
  };

  const addPlaceToDay = (loc) => {
    if (!trip.places[selectedDay]) {
      trip.places[selectedDay] = [];
    }
    const newPlace = {
      id: `pl-${Date.now()}`,
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      cost: 0
    };
    trip.places[selectedDay] = [...trip.places[selectedDay], newPlace];
    showToast(`${loc.name} 장소를 ${selectedDay} 일정에 추가했습니다.`, 'success');
    saveTrip();
  };

  const removePlace = (placeId) => {
    trip.places[selectedDay] = trip.places[selectedDay].filter(p => p.id !== placeId);
    showToast('선택한 장소가 일정 타임라인에서 제외되었습니다.', 'success');
    saveTrip();
  };

  // Error 1: Reordering works locally but isn't sync saved to trip model
  const reorderPlace = (idx, direction) => {
    let tempPlaces = [...localPlaces];
    if (direction === 'up' && idx > 0) {
      let temp = tempPlaces[idx];
      tempPlaces[idx] = tempPlaces[idx - 1];
      tempPlaces[idx - 1] = temp;
    } else if (direction === 'down' && idx < tempPlaces.length - 1) {
      let temp = tempPlaces[idx];
      tempPlaces[idx] = tempPlaces[idx + 1];
      tempPlaces[idx + 1] = temp;
    }

    // Update the visual representation
    localPlaces = tempPlaces;
    showToast('일정 순서가 화면상 변경되었습니다.', 'info');

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 순서 변경 조작 시, 화면에 바인딩된 Svelte 렌더링 변수(localPlaces)만 스왑하여 
    // 화면 위치는 이동하지만, 실제 서버에 전송/보존될 핵심 여행 정보 트리(trip.places[selectedDay])에는 
    // 해당 순서를 동기화하지 않고 스킵합니다. 이 때문에 날짜 탭을 바꾸고 돌아오면 이전 순서로 복구되는 현상을 초래합니다.
    // 원래 실행해야 할 동기화 코드:
    // trip.places[selectedDay] = tempPlaces;
    // saveTrip();
  };

  const handleAddDay = () => {
    if (!newDayInput.trim()) return;
    if (trip.days.includes(newDayInput)) {
      showToast('이미 존재하는 일자입니다.', 'warning');
      return;
    }
    trip.days = [...trip.days, newDayInput];
    trip.places[newDayInput] = [];
    selectedDay = newDayInput;
    newDayInput = '';
    showToast('새로운 여행 날짜 일정이 추가되었습니다.', 'success');
    saveTrip();
  };

  // Error 3: Delete day but places data remains in database
  const handleDeleteDay = async (dayName) => {
    if (trip.days.length <= 1) {
      showToast('최소 한 개 이상의 일정이 유지되어야 합니다.', 'warning');
      return;
    }
    try {
      const res = await fetch(`/api/trips/trip-01/days/${encodeURIComponent(dayName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`${dayName} 일정이 삭제되었습니다. (장소 데이터는 데이터베이스에 누수 잔존)`, 'success');
        await loadTrip();
      }
    } catch (err) {
      showToast('날짜 삭제 실패', 'danger');
    }
  };

  const handleAddExpense = () => {
    if (!newExpenseName.trim() || !newExpenseCost) {
      showToast('비용 품목 및 금액을 적어주십시오.', 'warning');
      return;
    }
    const costNum = Number(newExpenseCost);
    const newExp = {
      id: `exp-${Date.now()}`,
      item: newExpenseName,
      cost: costNum
    };
    trip.expenses = [...trip.expenses, newExp];
    totalCost += costNum; // Add cost to totalCost
    newExpenseName = '';
    newExpenseCost = '';
    showToast('예상 비용 항목이 리스트에 기재되었습니다.', 'success');
    saveTrip();
  };

  // Error 4: Delete expense from list, but total sum is not recalculated
  const handleDeleteExpense = (expId) => {
    const target = trip.expenses.find(e => e.id === expId);
    if (!target) return;

    trip.expenses = trip.expenses.filter(e => e.id !== expId);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 예상 지출 품목을 삭제할 때 비용 항목 리스트에서는 소거하지만, 
    // 화면에 보여주고 있는 지출 합계 변수(totalCost)를 다시 감산 처리하거나 
    // 전체 리듀서(reduce) 연산하지 않고 이전 수치 상태 그대로 고정해 계산 오차를 유발시킵니다.
    // 원래 실행해야 하는 갱신 코드:
    // totalCost = trip.expenses.reduce((acc, cur) => acc + cur.cost, 0);

    showToast('비용 항목이 소거되었습니다. (총비용 합계는 재계산되지 않음)', 'warning');
    saveTrip();
  };

  const handleSwitchTab = async (tab) => {
    activeTab = tab;
    if (tab === 'share') {
      try {
        const res = await fetch('/api/trips/trip-01/share');
        const data = await res.json();
        shareData = data;
      } catch (err) {
        showToast('공유 정보 로딩 실패', 'danger');
      }
    }
  };
</script>

<div class="tripweave-app">
  <!-- Navbar Header -->
  <header class="app-navbar">
    <div class="navbar-logo">
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <span class="logo-title">TripWeave</span>
      <span class="logo-subtitle">하이브리드 루트 맵 빌더</span>
    </div>
    <div class="navbar-actions">
      <button 
        class="nav-btn {activeTab === 'edit' ? 'active' : ''}" 
        on:click={() => handleSwitchTab('edit')}
      >
        🗺️ 일정 편집 화면
      </button>
      <button 
        class="nav-btn {activeTab === 'share' ? 'active' : ''}" 
        on:click={() => handleSwitchTab('share')}
      >
        📤 여행 공유하기
      </button>
    </div>
  </header>

  <!-- Edit Travel Tab Workspaces -->
  {#if activeTab === 'edit'}
    {#if trip}
      <div class="workspace-grid">
        
        <!-- Left Sidebar: Day Timelines -->
        <aside class="panel-section column-timeline">
          <div class="panel-header">
            <h2>📅 날짜 및 타임라인</h2>
          </div>

          <div class="days-list-container">
            {#each trip.days as day}
              <div class="day-tab-item {selectedDay === day ? 'active' : ''}">
                <button class="day-name-btn" on:click={() => selectedDay = day}>
                  {day}
                </button>
                <button class="day-delete-btn" on:click={() => handleDeleteDay(day)}>&times;</button>
              </div>
            {/each}
          </div>

          <!-- Add new Day Form -->
          <div class="add-day-form-box">
            <input 
              type="text" 
              bind:value={newDayInput} 
              placeholder="예: 4일차 (동부코스)" 
              class="day-input"
            />
            <button class="add-day-btn" on:click={handleAddDay}>➕ 날짜 추가</button>
          </div>

          <!-- Expense list calculator -->
          <div class="budget-tracker-box">
            <h3>💵 예상 경비 계산기</h3>
            
            <div class="expense-items-scroller">
              {#each trip.expenses as exp (exp.id)}
                <div class="expense-row">
                  <span class="exp-title">{exp.item}</span>
                  <div class="exp-actions">
                    <span class="exp-cost">₩{exp.cost.toLocaleString()}</span>
                    <button class="exp-del-btn" on:click={() => handleDeleteExpense(exp.id)}>&times;</button>
                  </div>
                </div>
              {/each}
            </div>

            <div class="expense-add-form">
              <input type="text" bind:value={newExpenseName} placeholder="항목명" class="exp-name-in" />
              <input type="number" bind:value={newExpenseCost} placeholder="금액(₩)" class="exp-cost-in" />
              <button class="exp-save-btn" on:click={handleAddExpense}>기입</button>
            </div>

            <div class="total-summary-card">
              <span>총 예상 소요 경비:</span>
              <strong class="total-cost-val">₩{totalCost.toLocaleString()}</strong>
            </div>
          </div>
        </aside>

        <!-- Center: Interactive SVG Map Canvas -->
        <main class="panel-section column-canvas">
          <div class="panel-header">
            <h2>🗺️ 여행 경로 노드 맵 ({{ selectedDay }})</h2>
          </div>

          <div class="svg-map-frame">
            <svg class="map-svg-grid" viewBox="0 0 500 350">
              <!-- Grid line mesh -->
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <!-- Jeju Shore outline silhouette decoration -->
              <path d="M 80,180 Q 110,130 180,150 T 280,190 T 380,170 T 320,250 T 220,280 T 120,230 Z" fill="#eff6ff" stroke="#bfdbfe" stroke-width="2"/>

              <!-- Connection route paths -->
              {#if localPlaces.length > 1}
                {#each localPlaces as pt, i}
                  {#if i < localPlaces.length - 1}
                    <line 
                      x1={pt.lng} 
                      y1={pt.lat} 
                      x2={localPlaces[i+1].lng} 
                      y2={localPlaces[i+1].lat} 
                      stroke="#3b82f6" 
                      stroke-width="3" 
                      stroke-dasharray="6,4"
                    />
                  {/if}
                {/each}
              {/if}

              <!-- Location point nodes -->
              {#each localPlaces as pt, index}
                <circle cx={pt.lng} cy={pt.lat} r="10" fill="#3b82f6" stroke="white" stroke-width="2" />
                <text x={pt.lng + 14} y={pt.lat + 5} font-size="11" font-weight="bold" fill="#1e3a8a">{index+1}. {pt.name}</text>
              {/each}
            </svg>
          </div>

          <!-- Freely Arranged Memo note schedule cards list -->
          <div class="itinerary-memos-flow">
            {#each localPlaces as place, index (place.id)}
              <div class="memo-sticky-card">
                <div class="memo-header">
                  <span class="memo-index-dot">{index + 1}</span>
                  <button class="remove-place-btn" on:click={() => removePlace(place.id)}>&times;</button>
                </div>
                <h4 class="memo-title">{place.name}</h4>
                <div class="memo-controls">
                  <button class="order-btn" on:click={() => reorderPlace(index, 'up')}>◀</button>
                  <span class="order-lbl">순서 변경</span>
                  <button class="order-btn" on:click={() => reorderPlace(index, 'down')}>▶</button>
                </div>
              </div>
            {/each}
            {#if localPlaces.length === 0}
              <div class="empty-placeholder">우측 검색창에서 장소를 타임라인에 수집 추가해 주세요.</div>
            {/if}
          </div>
        </main>

        <!-- Right Sidebar: Location Search Results -->
        <aside class="panel-section column-search">
          <div class="panel-header">
            <h2>🔍 여행 장소 탐색</h2>
          </div>

          <div class="search-input-group">
            <input 
              type="text" 
              bind:value={searchQuery} 
              placeholder="예: 해수욕장, 시장, 숨은명소"
              class="search-bar-in"
              on:keydown={(e) => e.key === 'Enter' && searchLocations()}
            />
            <button class="search-submit-btn" on:click={searchLocations}>찾기</button>
          </div>

          <div class="search-results-list">
            {#each searchResults as item}
              <div class="location-search-card">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <button class="add-to-timeline-btn" on:click={() => addPlaceToDay(item)}>
                  📍 일정에 추가
                </button>
              </div>
            {/each}
            {#if searchResults.length === 0}
              <div class="empty-placeholder">검색어와 부합되는 등록 장소가 풀에 없습니다.</div>
            {/if}
          </div>
        </aside>

      </div>
    {/if}
  {:else}
    <!-- Share View -->
    {#if shareData}
      <div class="panel-section share-dashboard-card">
        <div class="panel-header">
          <h2>📤 소셜 여행 계획 공유 화면</h2>
          <p class="subtitle">친구 및 외부 방문자에게 공개되는 브로셔 스타일 대시보드입니다.</p>
        </div>

        <div class="share-brochure-preview">
          <!-- Background SVG using potentially broken path (Error 5) -->
          <div 
            class="share-background-frame"
            style="background-image: url('{shareData.backgroundImageUrl}')"
          >
            <!-- Overlay content details -->
            <div class="share-card-overlay">
              <h1 class="shared-title">{shareData.trip.title}</h1>
              <p class="shared-meta">총 {shareData.trip.days.length}일간의 아름다운 코스</p>

              <div class="shared-summary-itinerary">
                {#each shareData.trip.days as day}
                  <div class="shared-day-group">
                    <strong>📍 {day}</strong>
                    <ul>
                      {#each shareData.trip.places[day] || [] as pt}
                        <li>{pt.name}</li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              </div>

              <div class="shared-footer-price">
                예상 책정 경비: <strong>₩{totalCost.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <!-- Error Alert Callout details -->
          <div class="path-error-callout">
            <p>⚠️ <strong>배경 SVG 로드 경로 알림:</strong></p>
            <p class="code-lbl">응답 파일 주소: <code>{shareData.backgroundImageUrl}</code></p>
            <p class="desc-lbl">(서버에서 제공하는 정적 폴더 매핑 오류로 인하여 지도 배경이 미출력(엑스박스) 상태가 됩니다.)</p>
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Toast list elements -->
  <div class="toast-container">
    {#each toasts as t (t.id)}
      <div class="toast-card {t.type}">
        <span class="toast-icon">
          {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
        </span>
        <span class="toast-message">{t.message}</span>
        <button class="toast-close" on:click={() => toasts = toasts.filter(x => x.id !== t.id)}>&times;</button>
      </div>
    {/each}
  </div>
</div>
