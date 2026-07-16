<script>
  import { onMount } from 'svelte';

  // DB states
  let exhibitions = [];
  let bookings = [];
  let interestedIndexes = [0]; // Error 1 target: stores index of filtered list
  
  // Selection states
  let selectedCategory = 'All';
  let searchQuery = '';
  let selectedExhibitionId = null;

  // Active loaded artist biography
  let artistProfile = null;

  // Ticket booking inputs (Error 2 targets attendees === 5)
  let bookingDate = '2026-08-10';
  let bookingTime = '14:00';
  let attendees = 2;

  // Rescheduling modal inputs (Error 4 Target)
  let reschedulingBookingId = null;
  let reschedDate = '2026-08-12';
  let reschedTime = '16:00';

  // Toasts
  let toasts = [];

  onMount(() => {
    loadExhibitions();
    loadBookings();
  });

  async function loadExhibitions() {
    try {
      const res = await fetch('/api/exhibitions');
      const data = await res.json();
      exhibitions = data;
      if (data.length > 0) {
        selectExhibition(data[0].id, data[0].artist);
      }
    } catch (err) {
      showToast('전시 목록 조회 실패', 'danger');
    }
  }

  async function loadBookings() {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      bookings = data;
    } catch (err) {
      showToast('예약 내역 로드 실패', 'danger');
    }
  }

  function showToast(message, type = 'info') {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  }

  // Reactive filtering
  $: filteredExhibitions = exhibitions.filter(ex => {
    const matchCat = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        ex.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  $: activeExhibition = exhibitions.find(ex => ex.id === selectedExhibitionId);

  function selectExhibition(exId, artistName) {
    selectedExhibitionId = exId;
    loadArtist(exId, artistName);
  }

  // Error 3: exhibit-04 artist calls slots-v2 causing 404
  async function loadArtist(exId, artistName) {
    let url = `/api/artists/profile/${encodeURIComponent(artistName)}`;

    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: exhibit-04(기억의 흔적: 초현실주의 특별전) 상품의 작가 프로필 조회를 시도할 때만 
    // 백엔드 라우트에 아예 등록되어 있지 않은 잘못된 API 엔드포인트인 '/api/artists/profile-v2'를 호출하게 유도하여 
    // 브라우저 콘솔 및 네트워크 패널에 404 Not Found 네트워크 에러를 일부러 기록하게 만듭니다.
    if (exId === 'exhibit-04') {
      url = '/api/artists/profile-v2';
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('API 연결 없음 (HTTP ' + res.status + ')');
      artistProfile = await res.json();
    } catch (err) {
      showToast(`작가 소개 조회 실패: ${err.message}`, 'danger');
      artistProfile = null;
    }
  }

  // Error 1: Interested check triggers matching by local filtered list INDEX
  function toggleInterest(i, exhibitionId) {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 관심 전시 상태(하트)를 등록/해제할 때 전시의 고유 식별 코드(exhibitionId)가 아닌 
    // 현재 필터링되어 가동 중인 목록상에서의 배열 인덱스(i)를 interestedIndexes 배열에 대입합니다. 
    // 이 상태에서 카테고리 탭을 변경하여 화면 리스트가 갱신되면, 
    // 변경된 신규 전시 목록의 동일 인덱스(i) 위치 전시에 관심 표시가 잘못 매핑되는 결함을 유발합니다.
    if (interestedIndexes.includes(i)) {
      interestedIndexes = interestedIndexes.filter(x => x !== i);
    } else {
      interestedIndexes = [...interestedIndexes, i];
    }

    // Call actual backend api
    saveInterest(exhibitionId);
  }

  async function saveInterest(exhibitionId) {
    try {
      const res = await fetch('/api/interests/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitionId })
      });
      if (res.ok) {
        showToast('관심 전시 보관함이 동기화되었습니다.', 'success');
      }
    } catch (err) {
      // Fail silently
    }
  }

  // General Booking submit
  async function submitBooking() {
    if (!selectedExhibitionId) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitionId: selectedExhibitionId,
          date: bookingDate,
          time: bookingTime,
          attendees
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '예매 실패');
      }

      showToast('티켓 예약이 임시 확정되었습니다.', 'success');
      loadBookings();
    } catch (err) {
      showToast(`[예매 에러] ${err.message}`, 'danger');
    }
  }

  // Reschedule booking (Error 4 Target)
  async function submitReschedule() {
    if (!reschedulingBookingId) return;

    try {
      const res = await fetch(`/api/bookings/${reschedulingBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: reschedDate,
          time: reschedTime
        })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('관람 시간 수정이 신청되었습니다. (중복 예약 여부 검증 요망)', 'success');
        reschedulingBookingId = null;
        loadBookings();
      } else {
        throw new Error(data.error || '수정 실패');
      }
    } catch (err) {
      showToast(`[스케줄 변경 실패] ${err.message}`, 'danger');
    }
  }

  function getExhibitionTitle(exId) {
    const ex = exhibitions.find(x => x.id === exId);
    return ex ? ex.title : '지정 외 전시';
  }
</script>

<div class="artpass-app">
  <!-- Top Header bar -->
  <header class="app-header">
    <div class="logo-area">
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M2 12h20M12 2v20" />
      </svg>
      <span class="logo-title">ArtPass</span>
      <span class="logo-subtitle">고품격 미술관 관람 패스</span>
    </div>

    <div class="search-box">
      <input 
        type="text" 
        placeholder="전시명, 거장 화가명으로 검색..." 
        bind:value={searchQuery}
        className="navbar-search"
      />
    </div>
  </header>

  <!-- Workspace Matrix -->
  <div class="workspace-grid">
    
    <!-- Left Category lists -->
    <aside class="panel-section categories-sidebar">
      <div class="panel-header">
        <h2>🖼️ 장르 카테고리</h2>
      </div>
      <div class="category-buttons-stack">
        {#each ['All', '서양화', '동양화', '추상화', '현대미술', '미디어아트', '조각/도예', '사진전'] as cat}
          <button 
            type="button" 
            on:click={() => selectedCategory = cat}
            class="category-stack-btn"
            class:active={selectedCategory === cat}
          >
            {cat === 'All' ? '전체 전시 기획' : cat}
          </button>
        {/each}
      </div>
    </aside>

    <!-- Center Exhibition Poster visual layout -->
    <main class="center-poster-workspace">
      
      <section class="panel-section exhibitions-catalog-panel">
        <div class="panel-header">
          <h2>🎭 개설 전시 기획 ({filteredExhibitions.length}건)</h2>
        </div>

        <div class="exhibitions-poster-grid">
          {#each filteredExhibitions as ex, i}
            {@const isInterested = interestedIndexes.includes(i)}
            
            <div 
              class="exhibit-card"
              class:selected={selectedExhibitionId === ex.id}
              on:click={() => selectExhibition(ex.id, ex.artist)}
            >
              <div class="poster-mock-box">
                <span class="genre-lbl">{ex.category}</span>
                <span class="poster-icon">🖼️</span>
              </div>

              <div class="card-body">
                <h3>{ex.title}</h3>
                <p class="artist-name">작가: {ex.artist}</p>
                <p class="dates">{ex.dateRange}</p>
                <div class="footer-row">
                  <span class="price">{ex.price.toLocaleString()}원</span>
                  <button 
                    type="button" 
                    on:click|stopPropagation={() => toggleInterest(i, ex.id)}
                    class="interest-btn"
                    class:starred={isInterested}
                  >
                    {isInterested ? '♥ 관심저장' : '♡ 관심'}
                  </button>
                </div>
              </div>
            </div>
          {/each}

          {#if filteredExhibitions.length === 0}
            <div class="empty-placeholder">조건에 매칭되는 특별전 포스터가 등록되지 않았습니다.</div>
          {/if}
        </div>
      </section>

      <!-- Exhibition Detail Briefing & Artist Horizontal Timeline -->
      {#if activeExhibition}
        <section class="panel-section details-briefing-panel">
          <div class="panel-header">
            <h2>🔎 전시 정보 및 작가 약력 타임라인</h2>
          </div>

          <div class="brief-head">
            <h3>{activeExhibition.title}</h3>
            <p class="meta">장르: {activeExhibition.category} | 작가명: {activeExhibition.artist} | 관람료: {activeExhibition.price.toLocaleString()}원</p>
          </div>

          <!-- Artist timeline -->
          <div class="artist-timeline-box">
            <h4>👨‍🎨 작가 소개 & 역사적 이력 연표</h4>
            {#if artistProfile}
              <p class="bio-text">{artistProfile.bio}</p>
              
              <div class="horizontal-timeline-trail">
                {#each artistProfile.timeline as timeNode}
                  <div class="timeline-node">
                    <span class="node-bullet"></span>
                    <span class="node-desc">{timeNode}</span>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="empty-placeholder">작가 프로필 연표 정보를 네트워크에서 가져올 수 없습니다.</div>
            {/if}
          </div>
        </section>
      {/if}

    </main>

    <!-- Right Ticket booking and rescheduling & Reservation logs -->
    <aside class="right-booking-column">
      
      <!-- Booking setup widget -->
      {#if activeExhibition}
        <section class="panel-section booking-setup-panel">
          <div class="panel-header">
            <h2>📅 티켓 안심 예약 신청</h2>
          </div>

          <div class="booking-brief-card">
            <h4>{activeExhibition.title}</h4>
            <p class="dates">{activeExhibition.dateRange}</p>
          </div>

          <form on:submit|preventDefault={submitBooking} class="booking-inputs-form">
            <div class="form-group">
              <label for="date-input">관람 선택 일자:</label>
              <input type="date" id="date-input" bind:value={bookingDate} class="booking-input" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="time-select">관람 시간 슬롯:</label>
                <select id="time-select" bind:value={bookingTime} class="booking-select" required>
                  <option value="10:00">오전 10:00</option>
                  <option value="11:30">오전 11:30</option>
                  <option value="13:00">오후 13:00</option>
                  <option value="14:30">오후 14:30</option>
                  <option value="16:00">오후 16:00</option>
                  <option value="17:30">오후 17:30</option>
                </select>
              </div>

              <div class="form-group">
                <label for="attendees-input">신청 인원 (0명일시 500에러):</label>
                <input type="number" id="attendees-input" bind:value={attendees} min="1" class="booking-input" required />
              </div>
            </div>

            <button type="submit" class="booking-submit-btn">티켓 예매서 제출</button>
          </form>
        </section>
      {:else}
        <section class="panel-section booking-setup-panel empty">
          <div class="empty-placeholder">관람 티켓을 예매할 전시회 포스터 카드를 선택해 주세요.</div>
        </section>
      {/if}

      <!-- Rescheduling Form (Error 4 Target) -->
      {#if reschedulingBookingId}
        <section class="panel-section reschedule-form-panel">
          <div class="panel-header">
            <h2>🔄 관람 일정 변경 신청 (Error 4 검증)</h2>
          </div>
          <form on:submit|preventDefault={submitReschedule} class="reschedule-inputs-form">
            <p class="warn-txt">일정을 수정하면 이전 일정 기록 삭제 여부를 체크하십시오.</p>
            
            <div class="form-group">
              <label for="resched-date">신규 관람 일자:</label>
              <input type="date" id="resched-date" bind:value={reschedDate} class="booking-input" required />
            </div>

            <div class="form-group">
              <label for="resched-time">신규 시간 슬롯:</label>
              <select id="resched-time" bind:value={reschedTime} class="booking-select" required>
                <option value="10:00">오전 10:00</option>
                <option value="11:30">오전 11:30</option>
                <option value="13:00">오후 13:00</option>
                <option value="14:30">오후 14:30</option>
                <option value="16:00">오후 16:00</option>
                <option value="17:30">오후 17:30</option>
              </select>
            </div>

            <div class="btn-row">
              <button type="submit" class="resched-confirm-btn">시간 변경 적용</button>
              <button type="button" on:click={() => reschedulingBookingId = null} class="resched-cancel-btn">취소</button>
            </div>
          </form>
        </section>
      {/if}

      <!-- Booking history records -->
      <section class="panel-section booking-history-panel">
        <div class="panel-header">
          <h2>📜 티켓 예매 및 결제 내역 ({bookings.length}건)</h2>
        </div>

        <div class="bookings-scroller">
          {#each bookings as book}
            <div class="booking-history-card">
              <div class="card-head">
                <span class="id-lbl">예매번호: {book.id.slice(-6)}</span>
                <span class="status-badge">{book.status}</span>
              </div>
              <div class="card-body">
                <h4>{getExhibitionTitle(book.exhibitionId)}</h4>
                <p class="schedule">일시: <strong>{book.date} {book.time}</strong></p>
                <p class="attendees">관람 인원: {book.attendees}명</p>
              </div>
              <div class="card-foot">
                <button 
                  type="button" 
                  on:click={() => {
                    reschedulingBookingId = book.id;
                    reschedDate = book.date;
                    reschedTime = book.time;
                  }}
                  class="reschedule-trigger-btn"
                >
                  관람 시간 변경
                </button>
              </div>
            </div>
          {/each}

          {#if bookings.length === 0}
            <div class="empty-placeholder">결제 완료된 관람 패스 내역이 존재하지 않습니다.</div>
          {/if}
        </div>
      </section>

    </aside>

  </div>

  <!-- Toast Alerts -->
  <div class="toast-container">
    {#each toasts as t (t.id)}
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
