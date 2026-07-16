<script>
  import { onMount } from 'svelte';

  let currentOperator = '운영자 A';
  let events = [];
  let programs = [];
  let attendees = [];
  let notices = [];

  // Selections & memos
  let selectedEvent = null;
  let selectedAttendee = null;
  let activeMemoText = "VIP 연사. 공항 마중 의전 동선 배정 필요."; // Error 6 Target

  // UI status
  let searchVal = '';
  let selectedFilter = 'ALL'; // ALL | CHECKED | UNCHECKED
  let sortOrder = 'name'; // name | seat
  let toasts = [];

  // Form input bindings
  let newEventTitle = '';
  let newEventLocation = '';
  let newEventDate = '';
  let newProgramTitle = '';
  let newProgramTime = '';
  let newNoticeTitle = '';
  let newNoticeContent = '';

  onMount(async () => {
    await loadAll();
  });

  const loadAll = async () => {
    await loadEvents();
    await loadPrograms();
    await loadAttendees();
    await loadNotices();
  };

  const loadEvents = async () => {
    const res = await fetch('/api/events');
    events = await res.json();
    if (events.length > 0 && !selectedEvent) {
      selectedEvent = events[0];
    }
  };

  const loadPrograms = async () => {
    const res = await fetch('/api/programs');
    programs = await res.json();
  };

  const loadAttendees = async () => {
    const res = await fetch('/api/attendees');
    attendees = await res.json();
    if (attendees.length > 0 && !selectedAttendee) {
      selectedAttendee = attendees[0];
    }
  };

  const loadNotices = async () => {
    const res = await fetch('/api/notices');
    notices = await res.json();
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  };

  const resetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('EventPilot 행사 정보 데이터베이스가 초기화되었습니다.', 'success');
    selectedAttendee = null;
    activeMemoText = '초기화 완료';
    await loadAll();
  };

  // Operator switch (Error 6 Target)
  const handleOperatorSwitch = async () => {
    showToast(`로그인 세션이 [${currentOperator}]로 변경되었습니다.`, 'info');
    await loadEvents();
    await loadPrograms();
    await loadAttendees();

    // INTENTIONAL_ERROR
    // CATEGORY: Session
    // DESCRIPTION: 운영자 계정이 스위칭(A ➔ B)되어도 
    // 우측 패널의 참가자 미공개 캐시 메모리(`activeMemoText`)를 리셋하지 않고 유지하여 
    // 타 부서 참가자 특이 민원 및 내부 기록이 이전 화면 그대로 노출되는 세션 보안 결함입니다.
  };

  // Manual reset of cached memos
  const clearMemoCache = () => {
    activeMemoText = '';
    showToast('메모 캐시가 강제 초기화되었습니다.', 'success');
  };

  // Selected Attendee memo load
  const selectAttendeeWithMemo = async (att) => {
    selectedAttendee = att;
    const res = await fetch(`/api/attendees/${att.id}/memo`);
    const data = await res.json();
    activeMemoText = data.memo;
  };

  // Sort & Filtered list computed
  $: filteredAttendees = attendees
    .filter(a => {
      if (selectedEvent && a.eventId !== selectedEvent.id) return false;
      if (selectedFilter === 'CHECKED' && !a.checkedIn) return false;
      if (selectedFilter === 'UNCHECKED' && a.checkedIn) return false;
      if (searchVal && !a.name.includes(searchVal)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'seat') return a.seat.localeCompare(b.seat);
      return a.name.localeCompare(b.name);
    });

  // Cancel checkin Svelte Index Error (Error 5 Target)
  const cancelCheckin = (idxInFiltered) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 정렬된 체크인 목록에서 취소 버튼을 클릭할 때, 
    // 정렬 결과 매핑 대신 원본 배열(`attendees`)의 idx 요소를 호출하여 
    // 화면에 전시된 사람 대신 전혀 다른 참가자의 체크인을 해제 취소하는 결함입니다.
    const targetAttendee = attendees[idxInFiltered]; // Bug! Matches raw index instead of filtered/sorted list
    
    fetch(`/api/attendees/${targetAttendee.id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: false, seat: targetAttendee.seat })
    }).then(async () => {
      showToast('체크인 해제 요청이 전달되었습니다. (인덱스 위치 타깃 꼬임)', 'warning');
      await loadAttendees();
    });
  };

  // Seat check-in race condition (Error 1 Target)
  const triggerSeatCheckinRace = (att) => {
    showToast('좌석 A-99 변경 후 즉시 체크인 처리를 동시 요청합니다.', 'info');

    // 1. PATCH seat 'A-99' (3s delay) -> overwrites seat eventually
    fetch(`/api/attendees/${att.id}/seat`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seat: 'A-99' })
    });

    // 2. POST checkin (0.1s delay) -> sends old seat 'att.seat'
    setTimeout(async () => {
      const res = await fetch(`/api/attendees/${att.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedIn: true, seat: att.seat })
      });
      if (res.ok) {
        showToast('체크인 처리 성공 (0.1초 완료)', 'success');
        await loadAttendees();
      }
    }, 100);

    // Optimistically update UI
    attendees = attendees.map(a => a.id === att.id ? { ...a, checkedIn: true, seat: 'A-99' } : a);

    // Refresh after 3.5s to see that the seat is rolled back to old seat
    setTimeout(async () => {
      showToast('좌석 변경 지연 처리 완료 (최종 DB에는 이전 좌석 정보로 덮어쓰여짐)', 'warning');
      await loadAttendees();
    }, 3500);
  };

  // Attendees search race (Error 2 Target)
  const triggerSearchRace = () => {
    showToast(`검색어 고속 경합을 시작합니다.`, 'info');

    // 1. Fetch '김' (3s delay)
    fetch(`/api/attendees/search?q=김`)
      .then(res => res.json())
      .then(data => {
        attendees = data;
        showToast('김씨 성 검색 도착 (3초 지연 오버라이트)', 'warning');
      });

    // 2. Fetch '이' (0.2s delay)
    setTimeout(() => {
      fetch(`/api/attendees/search?q=이`)
        .then(res => res.json())
        .then(data => {
          attendees = data;
          showToast('이씨 성 검색 도착 (0.2초)', 'info');
        });
    }, 150);
  };

  // Program update-delete race (Error 4 Target)
  const triggerProgramUpdateDeleteRace = (prog) => {
    showToast('프로그램 일정 변경 후 즉각 삭제를 진행합니다.', 'info');

    // 1. PATCH program (3s delay on server) -> resurrects program if deleted
    fetch(`/api/programs/${prog.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '수정된 오프닝 스피치 (Resurrected)', time: '11:00' })
    });

    // 2. DELETE program (0.1s delay on server)
    setTimeout(async () => {
      const res = await fetch(`/api/programs/${prog.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('프로그램 삭제 완료 (0.1초 실행)', 'success');
        await loadPrograms();
      }
    }, 100);

    // Refresh after 3.5s to see the program resurrected
    setTimeout(async () => {
      showToast('프로그램 지연 변경 스케줄러 처리 완료 (삭제된 객체가 다시 생성됨)', 'danger');
      await loadPrograms();
    }, 3500);
  };

  // Cancel attendee registration (Error 3 Target)
  const handleCancelRegistration = async (attId) => {
    const res = await fetch(`/api/attendees/${attId}/cancel`, { method: 'POST' });
    if (res.ok) {
      showToast('참가자 등록 신청이 정상 취소되었습니다.', 'success');
      await loadAttendees();
      await loadEvents(); // Bypasses decrease in registeredCount (Error 3)
    }
  };

  // Create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newEventTitle,
        location: newEventLocation,
        date: newEventDate
      })
    });
    if (res.ok) {
      showToast(`새 행사 [${newEventTitle}]가 생성되었습니다.`, 'success');
      newEventTitle = '';
      newEventLocation = '';
      newEventDate = '';
      await loadEvents();
    }
  };

  // Add program schedule
  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!newProgramTitle.trim() || !selectedEvent) return;

    const res = await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: selectedEvent.id,
        title: newProgramTitle,
        time: newProgramTime
      })
    });
    if (res.ok) {
      showToast(`새 프로그램 일정 [${newProgramTitle}]이 추가되었습니다.`, 'success');
      newProgramTitle = '';
      newProgramTime = '';
      await loadPrograms();
    }
  };
</script>

<div class="eventpilot-app">
  
  <!-- Top bar header -->
  <header class="app-header">
    <div class="logo-group">
      <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
      <span class="logo-title">EventPilot</span>
      <span class="logo-subtitle">Conference Ops Coordinator</span>
    </div>

    <div class="header-right">
      <div class="operator-session">
        <span>👤 로그인 권한: </span>
        <select bind:value={currentOperator} on:change={handleOperatorSwitch}>
          <option value="운영자 A">운영자 A (기획팀)</option>
          <option value="운영자 B">운영자 B (현장지원팀)</option>
        </select>
      </div>

      <button class="clear-cache-btn" on:click={clearMemoCache}>
        🧹 메모 캐시 소거
      </button>
      <button class="sandbox-reset-btn" on:click={resetSandbox}>
        🔄 DB 초기화
      </button>
    </div>
  </header>

  <!-- Workspace Grid -->
  <div class="eventpilot-grid">

    <!-- Left Column: Event List & Event Creator -->
    <aside class="panel-section events-sidebar">
      <h3>📅 행사 대기 목록</h3>
      <div class="events-list">
        {#each events as evt}
          <div 
            class="event-list-card"
            class:active={selectedEvent?.id === evt.id}
            on:click={() => selectedEvent = evt}
          >
            <strong>{evt.title}</strong>
            <div class="row text-muted">
              <span>장소: {evt.location}</span>
              <span>신청: <strong class="lbl-primary">{evt.registeredCount}명</strong></span>
            </div>
            <small>{evt.date}</small>
          </div>
        {/each}
      </div>

      <div class="event-create-block">
        <h3>➕ 신규 행사 개설</h3>
        <form on:submit={handleCreateEvent} class="quick-form">
          <input type="text" placeholder="행사명 입력..." bind:value={newEventTitle} />
          <input type="text" placeholder="개최 장소..." bind:value={newEventLocation} />
          <input type="date" bind:value={newEventDate} />
          <button type="submit">행사 생성</button>
        </form>
      </div>
    </aside>

    <!-- Center Column: Program schedule board & seat plan -->
    <main class="panel-section programs-timeline">
      <div class="timeline-header">
        <h2>⏱️ 세부 일정 및 스케줄러 보드</h2>
        <p class="warn-desc">* 프로그램 변경 후 삭제 시 지연 스케줄러로 인해 복원 생성됨 (Error 4)</p>
      </div>

      <div class="programs-stack">
        {#each programs.filter(p => p.eventId === selectedEvent?.id) as prog}
          <div class="program-card">
            <div class="info">
              <span class="time-lbl">⏱️ {prog.time}</span>
              <strong>{prog.title}</strong>
            </div>
            <div class="actions">
              <button 
                class="race-trigger-btn"
                on:click={() => triggerProgramUpdateDeleteRace(prog)}
              >
                ⚡ 변경 후 즉각 삭제 (Error 4)
              </button>
            </div>
          </div>
        {/each}
        {#if programs.filter(p => p.eventId === selectedEvent?.id).length === 0}
          <p class="empty-lbl">등록된 행사 일정이 없습니다.</p>
        {/if}
      </div>

      <div class="add-program-form">
        <h4>🗓️ 타임라인 일정 추가</h4>
        <form on:submit={handleAddProgram} class="row-form">
          <input type="text" placeholder="세션명..." bind:value={newProgramTitle} />
          <input type="text" placeholder="10:00" bind:value={newProgramTime} />
          <button type="submit">추가</button>
        </form>
      </div>

      <!-- SVG seating map coordinates -->
      <div class="seating-map-block">
        <h3>💺 대강당 좌석 배치도 (SVG)</h3>
        <div class="svg-map-wrapper">
          <svg class="seating-svg" viewBox="0 0 300 120">
            <rect width="300" height="120" fill="#0d1527" rx="6" />
            <!-- Text layout -->
            <text x="150" y="20" fill="#475569" font-size="10" text-anchor="middle" font-weight="bold">
              [ STAGE 무대 방향 ]
            </text>

            <!-- Draw seat circles -->
            {#each Array(20) as _, i}
              <circle 
                cx={30 + (i % 10) * 26} 
                cy={45 + Math.floor(i / 10) * 30} 
                r="8" 
                fill={selectedAttendee?.seat === `Seat-${i+1}` ? '#10b981' : '#233355'}
                stroke="#475569" 
                stroke-width="1"
              />
              <text 
                x={30 + (i % 10) * 26} 
                y={48 + Math.floor(i / 10) * 30} 
                fill="#f8fafc" 
                font-size="6" 
                text-anchor="middle"
              >
                {i+1}
              </text>
            {/each}
          </svg>
        </div>
      </div>
    </main>

    <!-- Right Column: Attendees list & Check-in status -->
    <aside class="panel-section attendees-sidebar">
      <div class="sidebar-header">
        <h3>👥 참석 등록자 현황</h3>
        <button class="race-btn" on:click={triggerSearchRace}>
          ⚡ 검색 고속 경합 (Error 2)
        </button>
      </div>
      <p class="warn-desc">* 이전 지연 검색 결과가 화면을 덮어씀 (Error 2)</p>

      <div class="search-filters">
        <input 
          type="text" 
          placeholder="성함 검색 (예: 김)..." 
          bind:value={searchVal}
        />
        <select bind:value={selectedFilter}>
          <option value="ALL">전체 필터</option>
          <option value="CHECKED">체크인 완료</option>
          <option value="UNCHECKED">미체크인</option>
        </select>
        <select bind:value={sortOrder}>
          <option value="name">가나다 정렬</option>
          <option value="seat">좌석순 정렬</option>
        </select>
      </div>

      <div class="attendees-list-wrapper">
        {#each filteredAttendees as att, idx}
          <div 
            class="attendee-card"
            class:active={selectedAttendee?.id === att.id}
            on:click={() => selectAttendeeWithMemo(att)}
          >
            <div class="card-meta">
              <strong>{att.name}</strong>
              <span class="seat-badge">좌석: {att.seat}</span>
            </div>
            
            <div class="card-actions">
              {#if att.checkedIn}
                <span class="badge checked">체크인완료</span>
                <button 
                  class="cancel-checkin-btn"
                  on:click|stopPropagation={() => cancelCheckin(idx)}
                >
                  취소 (Error 5)
                </button>
              {:else}
                <button 
                  class="checkin-btn" 
                  on:click|stopPropagation={() => triggerSeatCheckinRace(att)}
                >
                  ⚡ 좌석변경 후 체크인 (Error 1)
                </button>
              {/if}

              <button 
                class="delete-reg-btn"
                on:click|stopPropagation={() => handleCancelRegistration(att.id)}
              >
                신청취소 (Error 3)
              </button>
            </div>
          </div>
        {/each}
        {#if filteredAttendees.length === 0}
          <p class="empty-lbl">해당 조건에 만족하는 참가자가 없습니다.</p>
        {/if}
      </div>

      <!-- Private memo panel (Error 6 Target) -->
      <div class="private-memo-panel">
        <h3>📝 현장 피드백 및 특이사항 메모</h3>
        <p class="warn-desc">* 운영자 스위칭 후에도 이전 메모가 유출되어 잔존함 (Error 6)</p>
        <div class="memo-content-box">
          <p>{activeMemoText}</p>
        </div>
      </div>
    </aside>

  </div>

  <!-- Toast Stack -->
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
