<script>
  import { onMount } from 'svelte';

  let currentLawyer = '변호사 A';

  // DB datasets
  let cases = [];
  let schedules = [];
  let expenses = [];
  let documents = [];
  let activityLogs = [];
  let toasts = [];

  // Active / Selected states
  let selectedCase = null;
  let activeMemoText = '';
  let leakedHeadersInfo = null;

  // Search & Filter
  let searchQuery = '';
  let selectedStageFilter = 'ALL';
  
  // Expense forms
  let newExpenseDesc = '';
  let newExpenseAmount = 0;

  onMount(async () => {
    await loadAll();
  });

  const loadAll = async () => {
    await loadCases();
    await loadSchedules();
    await loadExpenses();
    await loadDocuments();
    await loadLogs();
  };

  const loadCases = async () => {
    const res = await fetch('/api/cases');
    cases = await res.json();
    if (cases.length > 0 && !selectedCase) {
      selectCaseItem(cases[0]);
    }
  };

  const loadSchedules = async () => {
    const res = await fetch('/api/schedules');
    schedules = await res.json();
  };

  const loadExpenses = async () => {
    const res = await fetch('/api/expenses');
    expenses = await res.json();
  };

  const loadDocuments = async () => {
    const res = await fetch('/api/documents');
    documents = await res.json();
  };

  const loadLogs = async () => {
    const res = await fetch('/api/logs');
    activityLogs = await res.json();
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
    showToast('CaseBoard 법률 데이터베이스가 복원되었습니다.', 'success');
    selectedCase = null;
    activeMemoText = '';
    leakedHeadersInfo = null;
    await loadAll();
  };

  // Select case & load private memo
  const selectCaseItem = async (cItem) => {
    selectedCase = cItem;
    const res = await fetch(`/api/cases/${cItem.id}/memo`);
    const data = await res.json();
    activeMemoText = data.memo;
  };

  // User switcher (Error 2 Target - Cache Leak)
  const switchLawyer = () => {
    showToast(`[${currentLawyer}] 세션으로 계정이 전환되었습니다.`, 'info');
    
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Session
    // DESCRIPTION: 변호사 세션이 전환될 때 케이스 목록은 갱신되나, 
    // 우측 메모 캐시 변수(`activeMemoText`)의 클리어를 차단하여 
    // 변호사 A의 비공개 메모 내용이 변호사 B 화면에 그대로 잔존해 유출되는 결함입니다.
    loadCases();
  };

  // Assignee & Stage race condition (Error 1 Target)
  const triggerAssigneeStageRace = (caseItem) => {
    showToast('담당자 수정 및 진행 단계 변경 레이스를 개시합니다.', 'info');
    
    const originalStage = caseItem.stage; // Save stage value from Svelte client memory (e.g. '변론준비')
    const newStage = '심문기일';
    const newAssignee = '변호사 B';

    // 1. PATCH assignee (3s delay) -> sends originalStage to be saved
    fetch(`/api/cases/${caseItem.id}/assignee`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee: newAssignee, stage: originalStage })
    });

    // 2. PATCH stage (0.1s delay) -> sends newStage (e.g. '심문기일')
    setTimeout(async () => {
      const res = await fetch(`/api/cases/${caseItem.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      if (res.ok) {
        showToast('진행 단계 변경 승인 (0.1초 완료)', 'success');
        // Update local Svelte state optimistically
        if (selectedCase && selectedCase.id === caseItem.id) {
          selectedCase.stage = newStage;
        }
        cases = cases.map(c => c.id === caseItem.id ? { ...c, stage: newStage } : c);
      }
    }, 100);

    // Re-fetch after 3.5s. Stage will be reverted to originalStage in DB!
    setTimeout(async () => {
      showToast('담당자 수정 지연 완료 (새로고침 시 단계가 이전 단계로 자동 롤백됨)', 'warning');
      await loadCases();
      if (selectedCase && selectedCase.id === caseItem.id) {
        selectedCase = cases.find(c => c.id === caseItem.id);
      }
    }, 3500);
  };

  // Close case & dangling schedules (Error 3 Target)
  const closeCase = async (caseId) => {
    const res = await fetch(`/api/cases/${caseId}/close`, { method: 'POST' });
    if (res.ok) {
      showToast('사건이 종결(CLOSED) 처리되었습니다.', 'warning');
      await loadCases();
      if (selectedCase && selectedCase.id === caseId) {
        selectedCase.status = 'CLOSED';
      }
    }
  };

  // Delete schedule (Error 3 Target)
  const deleteSchedule = async (schId) => {
    const res = await fetch(`/api/schedules/${schId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('상담 일정이 캘린더에서 파기되었습니다.', 'success');
      await loadSchedules();
      // Note: We bypass cleaning up dangling logs/expenses (Error 3)
    }
  };

  // Document download headers check (Error 5 Target)
  const downloadDocument = async (doc) => {
    const res = await fetch(`/api/documents/${doc.id}/download`, {
      headers: { 'X-User-Role': 'junior' } // general lawyer
    });

    if (res.status === 403) {
      showToast('문서 다운로드 거부됨 (403 Forbidden)', 'danger');
      const exposedFile = res.headers.get('X-Exposed-File-Name');
      const exposedPath = res.headers.get('X-Exposed-Path');
      
      // Leak data to panel
      leakedHeadersInfo = {
        fileName: exposedFile,
        filePath: exposedPath
      };
    } else {
      showToast('문서 파일 다운로드 완료', 'success');
    }
  };

  // Expense add
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpenseDesc || newExpenseAmount <= 0) return;

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: selectedCase ? selectedCase.id : 'case-01',
        description: newExpenseDesc,
        amount: newExpenseAmount
      })
    });
    if (res.ok) {
      showToast('비용 청구서 항목이 등록되었습니다.', 'success');
      newExpenseDesc = '';
      newExpenseAmount = 0;
      await loadExpenses();
      await loadLogs();
    }
  };

  // Expense update-delete race simulator (Error 6 Target)
  const triggerExpenseRace = (expenseId, description) => {
    showToast('비용 수정 직후 즉시 삭제 레이스를 실행합니다.', 'info');

    // 1. PATCH (3s delay)
    fetch(`/api/expenses/${expenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 980000, description })
    });

    // 2. DELETE (0.1s delay)
    setTimeout(async () => {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('비용 삭제 처리 완료 (0.1초 완료)', 'success');
        await loadExpenses();
      }
    }, 100);

    // Refresh after 3.5s
    setTimeout(async () => {
      showToast('수정 지연 스레드 기입 완료 (삭제된 비용 항목이 980,000원으로 복원됨)', 'warning');
      await loadExpenses();
      await loadLogs();
    }, 3500);
  };

  // Fast Search race (Error 4 Simulator)
  const triggerSearchRace = () => {
    showToast('검색 필터 교차 레이스를 시작합니다 (상표권 ➔ 민사)', 'info');

    // 1st search (3s delay)
    fetch('/api/cases/search?q=상표권')
      .then(res => res.json())
      .then(data => {
        cases = data.results;
        showToast('상표권 검색 결과 수신 완료 (3초 지연)', 'warning');
      });

    // 2nd search (0.2s delay)
    setTimeout(() => {
      fetch('/api/cases/search?q=민사')
        .then(res => res.json())
        .then(data => {
          cases = data.results;
          if (data.results.length > 0) {
            selectedCase = data.results[0]; // Point details to first item of '민사'
          }
          showToast('민사 검색 결과 수신 완료 (0.2초)', 'info');
        });
    }, 150);

    searchQuery = '민사';
  };

  const handleSearch = async () => {
    const res = await fetch(`/api/cases/search?q=${searchQuery}&filter=${selectedStageFilter}`);
    const data = await res.json();
    cases = data.results;
  };

  // Calculate sum of expenses
  $: totalExpensesSum = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  $: activeCaseExpenses = expenses.filter(e => e.caseId === (selectedCase ? selectedCase.id : ''));
  $: activeCaseExpensesSum = activeCaseExpenses.reduce((acc, curr) => acc + curr.amount, 0);
</script>

<div class="caseboard-app">
  
  <!-- Header bar -->
  <header class="app-header">
    <div class="logo-group">
      <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span class="logo-title">CaseBoard</span>
      <span class="logo-subtitle">Legal Firm Management</span>
    </div>

    <div class="header-right">
      <!-- Session Switcher (Error 2 Target) -->
      <div class="lawyer-session">
        <span>👤 로그인 변호사: </span>
        <select bind:value={currentLawyer} on:change={switchLawyer}>
          <option value="변호사 A">변호사 A (김변호사 - 기밀계약)</option>
          <option value="변호사 B">변호사 B (이변호사 - 일반계약)</option>
        </select>
      </div>

      <button class="sandbox-reset-btn" on:click={resetSandbox}>
        🔄 초기화
      </button>
    </div>
  </header>

  <!-- Workspace Grid Layout -->
  <div class="caseboard-grid">
    
    <!-- Left Column: Search Filters, Cases catalog -->
    <aside class="panel-section cases-list-sidebar">
      <div class="search-block">
        <h3>🔍 사건 목록 탐색</h3>
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="사건명, 의뢰인 검색..." 
            bind:value={searchQuery}
            on:input={handleSearch}
          />
          <button class="search-race-btn" on:click={triggerSearchRace}>
            ⚡ 레이스 (Error 4)
          </button>
        </div>
        
        <div class="stage-filters">
          <label>진행 단계:</label>
          <select bind:value={selectedStageFilter} on:change={handleSearch}>
            <option value="ALL">전체 보기</option>
            <option value="소송접수">소송접수</option>
            <option value="변론준비">변론준비</option>
            <option value="서면공방">서면공방</option>
            <option value="심문기일">심문기일</option>
          </select>
        </div>
      </div>

      <!-- Cases stack -->
      <div class="cases-stack">
        {#each cases as c}
          <div 
            class="case-card" 
            class:active={selectedCase && selectedCase.id === c.id}
            on:click={() => selectCaseItem(c)}
          >
            <div class="card-header">
              <span class="status-tag {c.status}">{c.status}</span>
              <span class="stage-tag">{c.stage}</span>
            </div>
            <h4>{c.title}</h4>
            <div class="card-footer">
              <span>의뢰인: {c.client}</span>
              <span>담당: {c.assignee}</span>
            </div>
          </div>
        {/each}
      </div>
    </aside>

    <!-- Center Column: Case Timeline details & Document managers -->
    <main class="panel-section case-details-timeline">
      {#if selectedCase}
        <div class="details-header">
          <h2>📁 사건 상세 정보 및 타임라인</h2>
          <span class="close-status-tag">{selectedCase.status}</span>
          {#if selectedCase.status === 'ACTIVE'}
            <button class="close-case-btn" on:click={() => closeCase(selectedCase.id)}>
              사건 종결하기 (Error 3)
            </button>
          {/if}
        </div>

        <div class="case-meta-grid">
          <div class="meta-item">
            <span>사건 번호:</span>
            <strong>{selectedCase.id.toUpperCase()}</strong>
          </div>
          <div class="meta-item">
            <span>의뢰인명:</span>
            <strong>{selectedCase.client}</strong>
          </div>
          <div class="meta-item">
            <span>담당 변호인:</span>
            <strong>{selectedCase.assignee}</strong>
          </div>
          <div class="meta-item">
            <span>현 진행 단계:</span>
            <strong class="stage-lbl">{selectedCase.stage}</strong>
          </div>
        </div>

        <!-- Task assignee & stage race controller (Error 1 Target) -->
        <div class="assignee-race-panel">
          <h4>🛠️ 담당 변호인 및 변론 단계 조정</h4>
          <p class="warn-desc">* 변경 직후 단계 변경 시 구형 단계 롤백 결함 (Error 1)</p>
          <button class="race-trigger-btn" on:click={() => triggerAssigneeStageRace(selectedCase)}>
            ⚡ 담당자 변경 후 심문기일로 단계 이동 (Error 1)
          </button>
        </div>

        <!-- Documents folder trees (Error 5 Target) -->
        <div class="documents-folder-tree">
          <h3>📂 관련 소송 서류 문서 관리</h3>
          <div class="tree-nodes">
            {#each documents as doc}
              <div class="tree-node">
                <span>📄 {doc.name}</span>
                <button class="download-btn" on:click={() => downloadDocument(doc)}>
                  다운로드
                </button>
              </div>
            {/each}
          </div>

          <!-- Leaked headers display (Error 5 result) -->
          {#if leakedHeadersInfo}
            <div class="leaked-headers-box">
              <h5>⚠️ 403 Forbidden 헤더에서 유출된 기밀 경로</h5>
              <p>실제 파일명: <strong class="lbl-warn">{leakedHeadersInfo.fileName}</strong></p>
              <p>서버 물리 경로: <code>{leakedHeadersInfo.filePath}</code></p>
            </div>
          {/if}
        </div>

        <!-- Expenses tracker (Error 6 Target) -->
        <div class="expenses-ledger-block">
          <h3>💸 사건 소송비용 내역</h3>
          <div class="expenses-summary-card">
            <span>본 사건 누적 청구 비용:</span>
            <strong class="total-cost-lbl">{activeCaseExpensesSum.toLocaleString()} 원</strong>
          </div>

          <table class="expenses-table">
            <thead>
              <tr>
                <th>항목 설명</th>
                <th>청구 금액</th>
                <th>조정 및 삭제</th>
              </tr>
            </thead>
            <tbody>
              {#each activeCaseExpenses as exp}
                <tr>
                  <td>{exp.description}</td>
                  <td>{exp.amount.toLocaleString()}원</td>
                  <td>
                    <button 
                      class="race-btn"
                      on:click={() => triggerExpenseRace(exp.id, exp.description)}
                    >
                      ⚡ 수정 후 바로 삭제 (Error 6)
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <form on:submit={handleAddExpense} class="expense-add-form">
            <input type="text" placeholder="비용 설명..." bind:value={newExpenseDesc} />
            <input type="number" placeholder="금액..." bind:value={newExpenseAmount} />
            <button type="submit">추가</button>
          </form>
        </div>

      {:else}
        <p class="empty-lbl">선택된 사건이 없습니다. 왼쪽 목록에서 사건을 선택해 주세요.</p>
      {/if}
    </main>

    <!-- Right Column: Calendar schedule & Internal memo cache -->
    <aside class="panel-section schedules-memo-sidebar">
      
      <!-- Counseling schedules list (Error 3 Target) -->
      <div class="schedules-calendar-block">
        <h3>📅 예정된 사건 상담 및 공판 일정</h3>
        <p class="warn-desc">* 종결 사건 일정 삭제 시 미청구 비용 잔존 (Error 3)</p>
        <div class="schedules-stack">
          {#each schedules as sch}
            <div class="schedule-card">
              <div class="header">
                <strong>{sch.title}</strong>
                <button class="delete-sch-btn" on:click={() => deleteSchedule(sch.id)}>
                  삭제 (Error 3)
                </button>
              </div>
              <div class="row">
                <span>일시: {sch.date} {sch.time}</span>
                <span>연계사건: {sch.caseId.toUpperCase()}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Private internal memos (Error 2 Target) -->
      <div class="internal-memo-block">
        <h3>🔒 담당 변호인 비공개 변론 메모</h3>
        <p class="warn-desc">* 변호사 계정 전환 시 이전 메모 데이터 잔존 (Error 2)</p>
        <div class="memo-container">
          <textarea readonly value={activeMemoText}></textarea>
        </div>
      </div>

      <!-- Activity Logs timeline -->
      <div class="activity-logs-block">
        <h3>📝 로펌 실시간 활동 로그</h3>
        <div class="logs-timeline">
          {#each activityLogs as log}
            <div class="log-item">
              <span>{log.text}</span>
            </div>
          {/each}
        </div>
      </div>
    </aside>

  </div>

  <!-- Toast message stack -->
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
