<script>
  import { onMount } from 'svelte';

  // DB States
  let children = [];
  let notices = [];
  let messages = [];
  let unreadMessagesCount = 0;
  let medications = [];
  let calendarEvents = [];

  // Selected Child profile (Error 1 Target)
  let selectedChildId = 'child-01';
  let medicationFormChildId = 'child-01'; // Used for submission payload

  // Navigation tab view
  let activeTab = 'notices'; // 'notices' | 'medication' | 'messages' | 'calendar'
  
  // Date and Calendar states (Error 4 Target)
  let selectedDate = '2026-07-13';
  let currentMonth = 7; // July 2026
  let completedEventIds = []; // Completed event tracking IDs
  let suppliesList = ["개인 칫솔/치약", "여벌 옷 한 벌", "낮잠용 미니 베개"]; // Base supplies list

  // Form input states
  let medMedicine = '';
  let medDosage = '';
  let medTime = '점심 식사 직후';
  let medDetails = '';
  
  let newMsgText = '';

  // Toasts
  let toasts = [];

  onMount(async () => {
    await loadChildren();
    await loadNotices();
    await loadMessages();
    await loadMedications();
    await loadCalendarEvents();
  });

  const loadChildren = async () => {
    try {
      const res = await fetch('/api/children');
      children = await res.json();
    } catch (err) {
      showToast('아이 프로필 정보를 가져오는데 실패했습니다.', 'danger');
    }
  };

  const loadNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      notices = await res.json();
    } catch (err) {
      showToast('사진 알림장 조회 실패', 'danger');
    }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      messages = data.messages;
      unreadMessagesCount = data.unreadCount;
    } catch (err) {
      showToast('메시지 수신함 동기화 실패', 'danger');
    }
  };

  const loadMedications = async () => {
    try {
      const res = await fetch('/api/medications');
      medications = await res.json();
    } catch (err) {
      showToast('투약 의뢰 로그 조회 실패', 'danger');
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const res = await fetch('/api/events');
      calendarEvents = await res.json();
    } catch (err) {
      showToast('일정 캘린더 조회 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4000);
  };

  // Switch Child profile tab (Error 1 Target)
  function selectChild(childId) {
    selectedChildId = childId;
    
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 타겟 아이 프로필(selectedChildId)은 신규 탭으로 정상 변경 처리하여 
    // 화면 헤더와 출결 정보는 교체되지만, 작성 중인 투약 의뢰서 대상 아이 ID(medicationFormChildId)는 
    // 이전 아이 ID 상태로 방치하여 엉뚱한 아이 명의로 의뢰 데이터가 제출되게 만듭니다.
    // 원래 삽입되어야 하는 동기화 로직 누락:
    // medicationFormChildId = childId;

    showToast(`보호자 화면이 '${getActiveChildName(childId)}' 프로필로 변경되었습니다.`, 'success');
  }

  function getActiveChildName(id) {
    const c = children.find(x => x.id === id);
    return c ? c.name : '';
  }

  const activeChild = children.find(c => c.id === selectedChildId) || {};

  // Delete message (Error 3 test)
  async function handleDeleteMessage(id) {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        messages = data.messages;
        unreadMessagesCount = data.unreadCount; // Won't decrease due to backend Bug 3
        showToast('선생님 메시지가 보관함에서 삭제되었습니다.', 'info');
      }
    } catch (err) {
      showToast('메시지 삭제 통신 실패', 'danger');
    }
  }

  // Send message
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `[학부모 회신] ${newMsgText}` })
      });
      if (res.ok) {
        newMsgText = '';
        await loadMessages();
        showToast('선생님께 회신 메시지를 전달했습니다.', 'success');
      }
    } catch (err) {
      showToast('메시지 전송 실패', 'danger');
    }
  }

  // Submit medication (Error 2 test)
  async function handleSubmitMedication(e) {
    e.preventDefault();
    if (!medMedicine) {
      showToast('약물 명칭을 입력해 주십시오.', 'warning');
      return;
    }

    try {
      const activeName = getActiveChildName(medicationFormChildId); // Submit under form target child ID (Error 1)
      const res = await fetch('/api/medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: medicationFormChildId, // Error 1: Wrong ID sent if child was switched
          childName: activeName,
          medicine: medMedicine,
          dosage: medDosage, // If 0, triggers Server Error 2
          time: medTime,
          details: medDetails
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '의뢰 등록 실패');
      }

      showToast(`${activeName} 어린이 투약 요청서가 등록되었습니다.`, 'success');
      medMedicine = '';
      medDosage = '';
      medDetails = '';
      await loadMedications();
    } catch (err) {
      showToast(`[의뢰 등록 거절] ${err.message}`, 'danger');
    }
  }

  // Toggle calendar events (Error 4 Target)
  function toggleEventComplete(evtId, supplies) {
    if (completedEventIds.includes(evtId)) {
      completedEventIds = completedEventIds.filter(id => id !== evtId);
    } else {
      completedEventIds = [...completedEventIds, evtId];
      
      // Dynamic addition of supplies to right sidebar (Error 4 visual)
      const items = supplies.split(', ');
      suppliesList = [...suppliesList, ...items];
      showToast('일정이 완료 표기되고 관련 준비물이 통합 팩에 등록되었습니다.', 'success');
    }
  }

  // Monthly navigation (Error 4 source)
  function handleMonthChange(direction) {
    currentMonth += direction;
    if (currentMonth < 1) currentMonth = 12;
    if (currentMonth > 12) currentMonth = 1;

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 월을 변경할 때 캘린더상의 이벤트 체크 여부 상태 배열(completedEventIds)은 
    // 초기화하여 지워버리지만, 이로 인해 준비물 목록(suppliesList)에 흘러 들어갔던 
    // 항목들은 소거해주지 않고 그대로 누적 방치하여 복귀 시 상호 불일치 모순을 초래합니다.
    completedEventIds = [];

    showToast(`달력이 ${currentMonth}월로 이동되었습니다.`, 'info');
  }
</script>

<div class="littleday-app">
  
  {/* Upper child switcher header area */}
  <header className="app-header-profile-bar">
    <div className="logo-section">
      <span className="logo-title">LittleDay</span>
      <span className="logo-subtitle">스마트 보육 서비스 알림장</span>
    </div>

    {/* Profile tabs */}
    <div className="child-avatar-tabs">
      {#each children as child}
        <button 
          type="button" 
          on:click={() => selectChild(child.id)}
          className="avatar-btn {selectedChildId === child.id ? 'active' : ''}"
        >
          <img src={`/images/${child.id}.png`} alt={child.name} className="avatar-img" />
          <div className="name-box">
            <span className="child-name">{child.name}</span>
            <span className="class-name">{child.class}</span>
          </div>
        </button>
      {/each}
    </div>

    <div className="guardian-login-meta">
      <span className="g-badge">보호자: {activeChild.guardian || '학부모'} 님</span>
    </div>
  </header>

  {/* Steps / Navigation Tabs for parents */}
  <nav className="tab-menu-nav">
    <button on:click={() => activeTab = 'notices'} className="tab-item {activeTab === 'notices' ? 'active' : ''}">
      📰 오늘의 사진 알림장
    </button>
    <button on:click={() => activeTab = 'medication'} className="tab-item {activeTab === 'medication' ? 'active' : ''}">
      💊 실시간 투약 요청서
    </button>
    <button on:click={() => activeTab = 'messages'} className="tab-item {activeTab === 'messages' ? 'active' : ''}">
      💬 선생님 대화방
      {#if unreadMessagesCount > 0}
        <span className="badge-unread">{unreadMessagesCount}</span>
      {/if}
    </button>
    <button on:click={() => activeTab = 'calendar'} className="tab-item {activeTab === 'calendar' ? 'active' : ''}">
      📅 어린이집 행사 캘린더
    </button>
  </nav>

  {/* Workspace grid layout */}
  <div className="workspace-grid">
    
    {/* Left Date Picker */}
    <aside className="panel-section date-sidebar-panel">
      <div className="panel-header">
        <h3>📅 보육 일자</h3>
      </div>
      <div className="mini-month-picker">
        <button type="button" on:click={() => handleMonthChange(-1)} className="m-btn">&lt;</button>
        <span className="month-lbl">2026년 {currentMonth}월</span>
        <button type="button" on:click={() => handleMonthChange(1)} className="m-btn">&gt;</button>
      </div>

      <div className="days-stack-grid">
        {#each Array(15) as _, i}
          <button 
            type="button" 
            on:click={() => selectedDate = `2026-07-${10 + i}`}
            className="day-btn {selectedDate === `2026-07-${10 + i}` ? 'active' : ''}"
          >
            {10 + i}일 (월)
          </button>
        {/each}
      </div>
    </aside>

    {/* Center main feed dynamic panel */}
    <main className="center-stage-workspace">
      
      {/* TAB 1: NOTICES FEED */}
      {#if activeTab === 'notices'}
        <section className="panel-section notices-feed-panel">
          <div className="panel-header">
            <h2>📸 오늘의 활동 및 사진 알림장</h2>
          </div>

          <div className="notices-timeline-grid">
            {#each notices as note}
              <div className="notice-card">
                <div className="card-top-info">
                  <span className="author-badge">✍️ {note.author}</span>
                  <span className="date">{note.date}</span>
                </div>
                
                {/* Mock image placeholder box */}
                <div className="notice-photo-box">
                  <div className="photo-stub">LittleDay Photo Activity Log</div>
                </div>

                <div className="card-body">
                  <h4>{note.title}</h4>
                  <p>{note.text}</p>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      {/* TAB 2: MEDICATION FORM */}
      {#if activeTab === 'medication'}
        <section className="panel-section medication-request-panel">
          <div className="panel-header">
            <h2>💊 등원 아동 투약 요청서 (Medication Request)</h2>
          </div>

          <div className="medication-split-view">
            {/* Form */}
            <form on:submit={handleSubmitMedication} className="med-req-form">
              <div className="form-info-banner">
                💡 <strong>의뢰 상태:</strong> 현재 [<strong>{getActiveChildName(selectedChildId)}</strong>] 어린이의 프로필로 투약서를 작성하고 있습니다. (Error 1 검증 지점)
              </div>

              <div className="form-group">
                <label for="medName">의뢰 약물 종류</label>
                <input 
                  type="text" 
                  id="medName"
                  placeholder="예: 해열제 타이레놀 시럽, 기관지 패치"
                  bind:value={medMedicine} 
                  className="form-input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label for="medDosage">투약 1회분 용량 (cc 혹은 정)</label>
                  <input 
                    type="number" 
                    id="medDosage"
                    placeholder="예: 5 (0 입력 시 Error 2)" 
                    bind:value={medDosage}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label for="medTime">투약 지시 시간</label>
                  <select id="medTime" bind:value={medTime} className="form-select">
                    <option value="점심 식사 직후">점심 식사 직후 (13:00)</option>
                    <option value="오후 간식 직후">오후 간식 직후 (15:30)</option>
                    <option value="열이 38도 이상 오를 시">열이 38도 이상 오를 시 (해열제)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label for="medDetails">보관 및 투약 특이사항</label>
                <textarea 
                  id="medDetails"
                  rows="3" 
                  placeholder="예: 냉장 보관 필수입니다. 약을 먹은 후 물을 많이 마시게 해주세요."
                  bind:value={medDetails}
                  className="form-textarea"
                ></textarea>
              </div>

              <button type="submit" className="submit-med-btn">📋 투약 동의서 작성 완료 및 선생님 전송</button>
            </form>

            {/* List */}
            <div className="medication-active-list">
              <h3>📝 오늘 등록된 투약 의뢰 현황</h3>
              <div className="med-cards-stack">
                {#each medications as med}
                  <div className="med-log-card">
                    <div className="h">
                      <strong>아동: {med.childName}</strong>
                      <span className="badge-pill">제출 완료</span>
                    </div>
                    <div className="b">
                      <p>💊 약물: {med.medicine} ({med.dosage})</p>
                      <p>⏰ 시간: {med.time}</p>
                      <p className="details">보관: {med.details}</p>
                    </div>
                  </div>
                {/each}

                {#if medications.length === 0}
                  <div className="empty-placeholder">오늘 요청된 투약 의뢰건이 없습니다.</div>
                {/if}
              </div>
            </div>
          </div>
        </section>
      {/if}

      {/* TAB 3: TEACHER MESSAGES */}
      {#if activeTab === 'messages'}
        <section className="panel-section messages-chat-panel">
          <div className="panel-header">
            <h2>💬 담임 선생님 개별 메시지 보관함</h2>
          </div>

          <div className="messages-chat-room">
            <div className="messages-history-stack">
              {#each messages as msg}
                <div className="chat-bubble-card {msg.unread ? 'unread' : ''}">
                  <div className="meta">
                    <span className="sender">담임 교사</span>
                    <span className="time">{msg.time}</span>
                    <button 
                      type="button" 
                      on:click={() => handleDeleteMessage(msg.id)}
                      className="delete-msg-btn"
                      title="보관함에서 삭제 (Error 3 검증)"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text">{msg.text}</p>
                  {#if msg.unread}
                    <span className="unread-dot">● 미독</span>
                  {/if}
                </div>
              {/each}

              {#if messages.length === 0}
                <div className="empty-placeholder">선생님과 나눈 보관 메시지 내역이 없습니다.</div>
              {/if}
            </div>

            <form on:submit={handleSendMessage} className="chat-reply-form">
              <input 
                type="text" 
                placeholder="답장 메시지 또는 가정 특이사항 기재..." 
                bind:value={newMsgText} 
                className="reply-input"
              />
              <button type="submit" className="reply-submit-btn">보내기</button>
            </form>
          </div>
        </section>
      {/if}

      {/* TAB 4: CALENDAR */}
      {#if activeTab === 'calendar'}
        <section className="panel-section calendar-schedule-panel">
          <div className="panel-header">
            <h2>📅 2026년 {currentMonth}월 어린이집 학사 일정</h2>
          </div>

          <div className="events-calendar-stack">
            {#each calendarEvents as evt}
              <div className="event-row-card {completedEventIds.includes(evt.id) ? 'completed' : ''}">
                <div className="date-block">
                  <span className="mon">{currentMonth}월</span>
                  <span className="day">{evt.date.split('-')[2]}일</span>
                </div>
                
                <div className="event-info">
                  <h4>{evt.title}</h4>
                  <p className="supplies">🎒 준비물: {evt.supplies}</p>
                </div>

                <div className="action">
                  <label className="complete-chk-label">
                    <input 
                      type="checkbox" 
                      checked={completedEventIds.includes(evt.id)} 
                      on:change={() => toggleEventComplete(evt.id, evt.supplies)}
                    />
                    <span>일정 완료 (Error 4)</span>
                  </label>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

    </main>

    {/* Right summaries column (Attendance and supplies) */}
    <aside className="right-summaries-column">
      
      {/* Child attendance overview card */}
      <div className="panel-section attendance-summary-panel">
        <div className="panel-header">
          <h3>👦 실시간 등·하원 현황</h3>
        </div>
        {#if activeChild.name}
          <div className="active-child-status-card">
            <h4>{activeChild.name} 어린이</h4>
            <div className="status-indicator-badge">
              {activeChild.attendance}
            </div>
            <p className="today-meta">{activeChild.status}</p>
          </div>
        {/if}
      </div>

      {/* Supplies Checklist */}
      <div className="panel-section supplies-checklist-panel">
        <div className="panel-header">
          <h3>🎒 오늘의 지참 준비물</h3>
        </div>
        <div className="supplies-list-box">
          {#each suppliesList as supply}
            <label className="supply-item-row">
              <input type="checkbox" />
              <span>{supply}</span>
            </label>
          {/each}

          {#if suppliesList.length === 0}
            <p className="empty-placeholder">오늘 지참해야 할 준비물이 없습니다.</p>
          {/if}
        </div>
      </div>
    </aside>

  </div>

  {/* Toast Notifications */}
  <div className="toast-container">
    {#each toasts as t (t.id)}
      <div className="toast-card {t.type}">
        <span className="toast-icon">
          {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
        </span>
        <span className="toast-message">{t.message}</span>
        <button class="toast-close" on:click={() => toasts = toasts.filter(x => x.id !== t.id)}>
          &times;
        </button>
      </div>
    {/each}
  </div>

</div>
