<script>
  import { onMount } from 'svelte';

  // Session & Agent levels
  let currentAgent = '상담원 A'; // '상담원 A' (VIP tier admin) | '상담원 B' (General tier)

  // DB datasets
  let tickets = [];
  let activityLogs = [];
  let statistics = { totalSlaBreached: 0, totalResolvedOnTime: 0 };

  // Search & Filters
  let searchQuery = '';
  let selectedStatusFilter = 'ALL'; // 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  let viewMode = 'list'; // 'list' | 'kanban'

  // Selected ticket / client details (Error 1, 2, 4, 5, 6 Targets)
  let selectedTicketId = 'tick-02';
  let selectedCustomer = {
    name: "장지훈",
    phone: "010-1122-3344",
    email: "jihoon_vip@naver.com",
    vipTier: "VIP"
  }; // Holds active customer detail card independently to allow state leaks

  // Reply & Memo inputs
  let replyText = '';
  let memoText = '';
  let editingMemoId = null;
  let editingMemoText = '';

  // Toasts
  let toasts = [];

  onMount(async () => {
    await loadAll();
  });

  async function loadAll() {
    await loadTickets();
    await loadLogs();
    await loadStats();
  }

  async function loadTickets() {
    const res = await fetch('/api/tickets');
    tickets = await res.json();
  }

  async function loadLogs() {
    const res = await fetch('/api/logs');
    activityLogs = await res.json();
  }

  async function loadStats() {
    const res = await fetch('/api/statistics');
    statistics = await res.json();
  }

  function showToast(message, type = 'info') {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  }

  // Switch agent session (Error 4 Target)
  function switchAgent(agent) {
    currentAgent = agent;
    showToast(`로그인 세션이 [${agent}] 계정으로 스위칭되었습니다.`, 'info');
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Frontend
    // DESCRIPTION: 상담원 세션을 B(일반)로 강제 위임 변경 시, 해당 상담원이 볼 수 없는 
    // 등급의 고객 정보(`selectedCustomer`) 캐시 지우기를 누락시켜, 
    // 상담원 B가 A가 열람 중이던 VIP 고객의 전화번호, 이메일 등의 기밀 정보를 탈취할 수 있게 만듭니다.
  }

  // Switch ticket selection
  function selectTicket(ticket) {
    selectedTicketId = ticket.id;
    // Set customer details
    selectedCustomer = {
      name: ticket.customerName,
      phone: ticket.customerPhone,
      email: ticket.customerEmail,
      vipTier: ticket.vipTier
    };
  }

  // Assign agent then resolve immediately (Error 1 Simulator)
  function triggerAssignResolveRace(ticketId) {
    showToast('담당자 지정 직후 티켓 해결 레이스를 시작합니다.', 'info');

    // 1. Assign agent (3s delay on server)
    fetch(`/api/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: '상담원 C' })
    });

    // 2. Resolve status immediately (0.1s delay on server)
    setTimeout(async () => {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      if (res.ok) {
        // Optimistically set to RESOLVED on UI
        tickets = tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED', assignee: '상담원 C' } : t);
        showToast('티켓이 성공적으로 해결(RESOLVED) 처리되었습니다 (0.1초 완료)', 'success');
      }
    }, 100);
  }

  // Search tickets race (Error 2 Simulator)
  function triggerSearchRace() {
    showToast('티켓 고속 검색 레이스를 시작합니다 (데이터 ➔ 오류)', 'info');

    // 1. 데이터 (3s delay)
    fetch('/api/tickets/search?q=데이터')
      .then(res => res.json())
      .then(data => {
        tickets = data.results;
        showToast('데이터 검색 결과 도달 (3초 지연)', 'warning');
      });

    // 2. 오류 (0.2s delay)
    setTimeout(() => {
      fetch('/api/tickets/search?q=오류')
        .then(res => res.json())
        .then(data => {
          tickets = data.results;
          showToast('오류 검색 결과 도달 (0.2초)', 'info');
        });
    }, 150);

    searchQuery = '오류'; // Update filter UI to match the last query
  }

  // Normal Search Input Handler
  async function handleSearchInput() {
    if (!searchQuery.trim()) {
      await loadTickets();
      return;
    }
    const res = await fetch(`/api/tickets/search?q=${searchQuery}`);
    const data = await res.json();
    tickets = data.results;
  }

  // Compose Reply (Error 5 bypass)
  async function submitReply(ticketId) {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentAgent,
          text: replyText,
          role: currentAgent === '상담원 A' ? 'admin' : 'general'
        })
      });

      if (res.status === 403) {
        const data = await res.json();
        showToast(`[403 거부] ${data.error}`, 'danger');
        // Reload tickets list anyway to show that it bypassed and saved to DB!
        await loadTickets();
        replyText = '';
      } else {
        showToast('답변이 최종 게시 등록되었습니다.', 'success');
        await loadTickets();
        replyText = '';
      }
    } catch (err) {
      showToast('통신 오류', 'danger');
    }
  }

  // Add Memo
  async function addMemo(ticketId) {
    if (!memoText.trim()) return;
    const res = await fetch(`/api/tickets/${ticketId}/memos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: memoText })
    });
    if (res.ok) {
      showToast('내부 상담 메모가 등록되었습니다.', 'success');
      memoText = '';
      await loadTickets();
    }
  }

  // Modify Memo & Delete Memo Race (Error 6 Target)
  function triggerMemoUpdateDeleteRace(ticketId, memoId) {
    showToast('메모 수정 후 즉각 삭제 경합 시뮬레이션을 진행합니다.', 'info');

    // 1. PUT modify memo (3s delay)
    fetch(`/api/tickets/${ticketId}/memos/${memoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '수정 시도 중인 민감한 내부 상담 메모' })
    });

    // 2. DELETE memo immediately (0.1s delay)
    setTimeout(async () => {
      const res = await fetch(`/api/tickets/${ticketId}/memos/${memoId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('메모 삭제 승인 완료 (0.1초 완료)', 'success');
        await loadTickets();
      }
    }, 100);

    // Refresh after 3.5s to see it resurrected
    setTimeout(async () => {
      showToast('메모 수정 지연 동작 마감 (삭제되었던 메모 부활 확인)', 'warning');
      await loadTickets();
    }, 3500);
  }

  // Delete Ticket (Error 3 target)
  async function deleteTicket(ticketId) {
    const res = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('상담 티켓이 대시보드 배치에서 삭제되었습니다.', 'success');
      tickets = tickets.filter(t => t.id !== ticketId);
      selectedTicketId = null;
      // Note we do not call loadStats() or loadLogs() to keep deleted tickets statistics intact!
    }
  }

  // Refresh logs (Error 7 Target)
  let clickCount = 0;
  async function refreshActivityLogs() {
    clickCount += 1;
    const currentClick = clickCount;

    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 활동 로그 새로고침 버튼을 여러 번 연속으로 탭할 경우 
    // 이전 요청의 비동기 처리 취소 혹은 상태 가드가 누락되어, 
    // 지연 패치 완료 시 중복된 로그 레코드들이 로그 이력판에 중복으로 겹쳐 노출되는 결함입니다.
    const res = await fetch('/api/logs');
    const data = await res.json();

    if (currentClick === 3) {
      // Third click is simulated to resolve slowly
      setTimeout(() => {
        activityLogs = [...activityLogs, ...data];
        showToast('활동 로그 3차 새로고침 응답 지연 도착 완료', 'warning');
      }, 3000);
    } else {
      activityLogs = data;
    }
  }

  // Reset sandbox
  async function resetSandbox() {
    await fetch('/api/reset', { method: 'POST' });
    showToast('SupportFlow 데이터베이스가 롤백 복구되었습니다.', 'success');
    await loadAll();
  }

  // Computations (Visible tickets filter based on Agent level - Error 4 helper)
  $: visibleTickets = tickets
    .filter(t => currentAgent === '상담원 A' ? true : t.vipTier !== 'VIP')
    .filter(t => selectedStatusFilter === 'ALL' ? true : t.status === selectedStatusFilter);

  $: selectedTicket = tickets.find(t => t.id === selectedTicketId);
</script>

<div className="supportflow-app">

  <!-- Top Header bar -->
  <header class="app-header">
    <div class="logo-group">
      <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span class="logo-title">SupportFlow</span>
      <span class="logo-subtitle">SLA Ticket Console</span>
    </div>

    <div class="header-right">
      <div class="role-switch">
        <span>👤 상담원 로그인: </span>
        <select value={currentAgent} on:change={(e) => switchAgent(e.target.value)}>
          <option value="상담원 A">상담원 A (VIP/기밀 전담관 - Admin)</option>
          <option value="상담원 B">상담원 B (일반 배정원 - General)</option>
        </select>
      </div>
      <button class="sandbox-reset-btn" on:click={resetSandbox}>
        🔄 DB 초기화
      </button>
    </div>
  </header>

  <!-- Sidebar views filter tabs -->
  <nav class="sections-nav">
    <button class={viewMode === 'list' ? 'active' : ''} on:click={() => viewMode = 'list'}>
      📋 티켓 표/목록 보기
    </button>
    <button class={viewMode === 'kanban' ? 'active' : ''} on:click={() => viewMode = 'kanban'}>
      🗂️ 칸반 보드 뷰 (Kanban)
    </button>
  </nav>

  <!-- Workspace Grid Layout -->
  <div class="supportflow-grid">
    
    <!-- Left Column: Status filter, SLA stats -->
    <aside class="panel-section left-filters-sidebar">
      <h3>📁 상태 필터링</h3>
      <div class="status-filters-stack">
        {#each ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as filter}
          <button 
            class="filter-btn {selectedStatusFilter === filter ? 'active' : ''}"
            on:click={() => selectedStatusFilter = filter}
          >
            {filter === 'ALL' ? '전체 티켓' : filter === 'OPEN' ? '신규 접수' : filter === 'IN_PROGRESS' ? '처리 진행 중' : '해결 완료'}
          </button>
        {/each}
      </div>

      <!-- SLA metrics (Error 3 target) -->
      <div class="sla-metrics-block">
        <h4>📊 실시간 SLA 성과 지표</h4>
        <p class="warn-desc">* 삭제된 티켓의 성과 수치 누계 잔존 상태 (Error 3)</p>
        <div class="metric-row">
          <span>SLA 시간 초과 위반:</span>
          <strong class="breached-lbl">{statistics.totalSlaBreached}건</strong>
        </div>
        <div class="metric-row">
          <span>제한 시각 준수 해결:</span>
          <strong class="resolved-lbl">{statistics.totalResolvedOnTime}건</strong>
        </div>
      </div>
    </aside>

    <!-- Center Column: Ticket List / Kanban -->
    <main class="panel-section center-tickets-panel">
      
      <div class="panel-header-row">
        <h2>🏷️ 티켓 관제 목록 (검출 {visibleTickets.length}건)</h2>
        
        <!-- Search bar -->
        <div class="search-box">
          <input 
            type="text" 
            placeholder="제목, 고객명 검색..." 
            bind:value={searchQuery}
            on:input={handleSearchInput}
          />
          <button class="search-race-btn" on:click={triggerSearchRace}>
            ⚡ 고속 티켓 검색 (Error 2)
          </button>
        </div>
      </div>

      <!-- VIEW 1: TABLE LIST VIEW -->
      {#if viewMode === 'list'}
        <div class="table-container">
          <table class="tickets-table">
            <thead>
              <tr>
                <th>티켓 ID</th>
                <th>고객등급</th>
                <th>요청 제목</th>
                <th>진행 상태</th>
                <th>담당자</th>
                <th>SLA 진행</th>
              </tr>
            </thead>
            <tbody>
              {#each visibleTickets as tick}
                <tr 
                  class="ticket-row-item {selectedTicketId === tick.id ? 'focused' : ''}" 
                  on:click={() => selectTicket(tick)}
                >
                  <td><code>{tick.id}</code></td>
                  <td>
                    <span class="vip-badge {tick.vipTier.toLowerCase()}">{tick.vipTier}</span>
                  </td>
                  <td class="title-col"><strong>{tick.title}</strong></td>
                  <td>
                    <span class="status-tag {tick.status.toLowerCase()}">{tick.status}</span>
                  </td>
                  <td>{tick.assignee || '미배정'}</td>
                  <td>
                    <div class="sla-progress-bar">
                      <div class="progress" style="width: {tick.slaProgress}%"></div>
                    </div>
                  </td>
                </tr>
              {/each}

              {#if visibleTickets.length === 0}
                <tr>
                  <td colspan="6" class="empty-lbl">필터에 해당하는 상담 티켓이 없습니다.</td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      {:else}
        <!-- VIEW 2: KANBAN BOARD VIEW -->
        <div class="kanban-board-container">
          {#each ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as colStatus}
            <div class="kanban-col">
              <h3>{colStatus} ({visibleTickets.filter(t => t.status === colStatus).length})</h3>
              <div class="kanban-cards-stack">
                {#each visibleTickets.filter(t => t.status === colStatus) as tick}
                  <div 
                    class="kanban-card {selectedTicketId === tick.id ? 'focused' : ''}"
                    on:click={() => selectTicket(tick)}
                  >
                    <strong>{tick.title}</strong>
                    <div class="meta">
                      <span>담당: {tick.assignee}</span>
                      <span class="priority {tick.priority.toLowerCase()}">{tick.priority}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}

    </main>

    <!-- Right Column: Ticket details / memos / replies -->
    <aside class="panel-section right-details-sidebar">
      {#if selectedTicket}
        <div class="detail-card-wrapper">
          <div class="header-actions">
            <h3>⚙️ 티켓 워크플로우 제어</h3>
            <button class="delete-ticket-btn" on:click={() => deleteTicket(selectedTicket.id)}>
              티켓 강제 소거 (Error 3)
            </button>
          </div>

          <div class="body-content">
            <h4>{selectedTicket.title}</h4>
            <div class="state-actions-block">
              <span class="lbl">SLA 기한: {selectedTicket.slaHours}시간</span>
              <div class="buttons-row">
                <button class="status-btn" on:click={() => triggerAssignResolveRace(selectedTicket.id)}>
                  ⚡ 배정 후 바로 해결 (Error 1)
                </button>
              </div>
            </div>

            <!-- Customer Confidential Info panel (Error 4 Target) -->
            <div class="customer-info-box">
              <h5>📇 고객 연락처 및 신원 정보</h5>
              {#if selectedCustomer}
                <p>고객 성함: <strong>{selectedCustomer.name}</strong></p>
                <p>전화번호: <code>{selectedCustomer.phone}</code></p>
                <p>이메일: <code>{selectedCustomer.email}</code></p>
                <p>등급: <span class="vip-badge {selectedCustomer.vipTier.toLowerCase()}">{selectedCustomer.vipTier}</span></p>
              {:else}
                <span class="empty-lbl">고객 정보가 로드되지 않았습니다.</span>
              {/if}
            </div>

            <!-- Internal Memo section (Error 6 Target) -->
            <div class="memos-container">
              <h5>📝 내부 상담 일지 메모</h5>
              <div class="memos-list">
                {#each selectedTicket.memos as memo}
                  <div class="memo-item">
                    <p>{memo.text}</p>
                    <div class="memo-footer">
                      <span>{memo.date}</span>
                      <button class="delete-memo-btn" on:click={() => triggerMemoUpdateDeleteRace(selectedTicket.id, memo.id)}>
                        ⚡ 수정 후 바로 삭제 (Error 6)
                      </button>
                    </div>
                  </div>
                {/each}
              </div>

              <div class="memo-composer">
                <input type="text" placeholder="메모 추가..." bind:value={memoText} />
                <button on:click={() => addMemo(selectedTicket.id)}>추가</button>
              </div>
            </div>

            <!-- Reply composer (Error 5 Target) -->
            <div class="replies-container">
              <h5>💬 공식 답변 배포</h5>
              <div class="replies-list">
                {#each selectedTicket.replies as reply}
                  <div class="reply-bubble">
                    <strong>{reply.author}:</strong>
                    <p>{reply.text}</p>
                    <span class="time">{reply.date}</span>
                  </div>
                {/each}
              </div>

              <div class="reply-composer">
                <textarea placeholder="공식 메일 발송 답변 작성..." bind:value={replyText}></textarea>
                <button class="send-reply-btn" on:click={() => submitReply(selectedTicket.id)}>
                  이메일/CRM 답변 최종 발송
                </button>
              </div>
            </div>

          </div>
        </div>
      {:else}
        <p class="empty-lbl">관제판 티켓 행을 더블클릭하여 작업 상세 내역을 전개하세요.</p>
      {/if}
    </aside>

  </div>

  <!-- Activity trace logs footer panel (Error 7 Target) -->
  <footer class="panel-section activity-logs-footer">
    <div class="footer-header">
      <h3>🕒 스마트 시스템 활동 기록 (Activity Trace Logs)</h3>
      <button class="refresh-logs-btn" on:click={refreshActivityLogs}>
        🔄 로그 새로고침 (Error 7)
      </button>
    </div>
    
    <div class="logs-stack">
      {#each activityLogs as log}
        <div class="log-card">
          <span class="time">{log.timestamp}</span>
          <p>{log.text}</p>
        </div>
      {/each}
    </div>
  </footer>

  <!-- Toast messaging -->
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
