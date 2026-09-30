import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('kanban');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Security warning modal
  const [securityModal, setSecurityModal] = useState({
    isOpen: false,
    bugId: '',
    csvId: '',
    endpoint: '',
    parameter: '',
    description: ''
  });

  const triggerSecurityAlert = (bugId, csvId, endpoint, parameter, description) => {
    setSecurityModal({
      isOpen: true,
      bugId,
      csvId,
      endpoint,
      parameter,
      description
    });
  };

  // Mock Database states
  const [tagsList, setTagsList] = useState([]);
  const [invitationsList, setInvitationsList] = useState([]);
  const [taskNotes, setTaskNotes] = useState({ notes: '' });
  const [refundsList, setRefundsList] = useState([]);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [calendarEventsList, setCalendarEventsList] = useState([]);
  const [reportFilter, setReportFilter] = useState({ filterName: '' });
  const [importHistoryList, setImportHistoryList] = useState([]);
  const [queryHistoryList, setQueryHistoryList] = useState([]);
  const [kanbanTasks, setKanbanTasks] = useState([]);

  // Form Inputs
  const [tagInput, setTagInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [taskNoteInput, setTaskNoteInput] = useState('');
  const [refundInput, setRefundInput] = useState('');
  const [suggestionKeyword, setSuggestionKeyword] = useState('');
  const [noticeInput, setNoticeInput] = useState('');
  const [calTitleInput, setCalTitleInput] = useState('');
  const [calDateInput, setCalDateInput] = useState('2026-08-15');
  const [reportFilterInput, setReportFilterInput] = useState('');
  const [filenameInput, setFilenameInput] = useState('');
  const [queryKeywordInput, setQueryKeywordInput] = useState('');
  
  // Normal Task Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('UI개선');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Initial Data Fetch
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const tagRes = await fetch('/api/tags?keyword=');
      setTagsList(await tagRes.json());

      const invRes = await fetch('/api/invitations?keyword=');
      setInvitationsList(await invRes.json());

      const noteRes = await fetch('/api/tasks/delivery-note?keyword=');
      setTaskNotes(await noteRes.json());

      const refRes = await fetch('/api/refunds?keyword=');
      setRefundsList(await refRes.json());

      const sugRes = await fetch('/api/search/suggestions?keyword=');
      setSuggestionsList(await sugRes.json());

      const ntRes = await fetch('/api/notifications?keyword=');
      setNotificationsList(await ntRes.json());

      const calRes = await fetch('/api/calendar?keyword=');
      setCalendarEventsList(await calRes.json());

      const fltRes = await fetch('/api/reports/filter?keyword=');
      setReportFilter(await fltRes.json());

      const csvRes = await fetch('/api/import/history?keyword=');
      setImportHistoryList(await csvRes.json());

      const qyRes = await fetch('/api/query/history?keyword=');
      setQueryHistoryList(await qyRes.json());

      const tskRes = await fetch('/api/tasks');
      setKanbanTasks(await tskRes.json());
    } catch (err) {
      console.error("Database connection failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Tags register (site018-bug01)
  const handleTagSubmit = async () => {
    try {
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagInput })
      });

      const reload = await fetch(`/api/tags?keyword=${encodeURIComponent(tagInput)}`);
      setTagsList(await reload.json());

      triggerSecurityAlert(
        'site018-bug01',
        'SEC-171',
        '/api/tags',
        'name',
        '프로젝트 태그 분류 등록 시 바인딩 변수가 유실되어 SQL Injection 조건 분기를 허용합니다.'
      );
      setTagInput('');
      showToast('새 태그 분류가 보드에 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Team Invitation (site018-bug02)
  const handleInvitationSubmit = async () => {
    try {
      await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });

      const reload = await fetch(`/api/invitations?keyword=${encodeURIComponent(emailInput)}`);
      setInvitationsList(await reload.json());

      triggerSecurityAlert(
        'site018-bug02',
        'SEC-172',
        '/api/invitations',
        'email',
        '부서원 협업 초대 시 주입된 이메일의 유효성 필터링이 누락되어 다른 사용자의 초청 기록 목록이 노출됩니다.'
      );
      setEmailInput('');
      showToast('초대 이메일 발송 완료.');
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Task Delivery Note / Memo (site018-bug03)
  const handleTaskNoteSubmit = async () => {
    try {
      await fetch('/api/tasks/delivery-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: taskNoteInput })
      });

      const reload = await fetch(`/api/tasks/delivery-note?keyword=${encodeURIComponent(taskNoteInput)}`);
      setTaskNotes(await reload.json());

      triggerSecurityAlert(
        'site018-bug03',
        'SEC-173',
        '/api/tasks/delivery-note',
        'notes',
        '작업 세부 사항 기재 시 조건절에 문자열을 그대로 병합하여 조회 결과 수량을 왜곡할 수 있습니다.'
      );
      setTaskNoteInput('');
      showToast('업무 보드 메모가 보존되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Refund Requests (site018-bug04)
  const handleRefundSubmit = async () => {
    try {
      await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundInput })
      });

      const reload = await fetch(`/api/refunds?keyword=${encodeURIComponent(refundInput)}`);
      setRefundsList(await reload.json());

      triggerSecurityAlert(
        'site018-bug04',
        'SEC-174',
        '/api/refunds',
        'reason',
        '가용 예금 한도 환불 신청서 본문 매개변수에 조건문을 적용해 데이터 조회 기준을 우회할 수 있습니다.'
      );
      setRefundInput('');
      showToast('정산 환불 접수 완료.');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Search Suggestions (site018-bug05)
  const handleSuggestionSubmit = async () => {
    try {
      await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: suggestionKeyword })
      });

      const reload = await fetch(`/api/search/suggestions?keyword=${encodeURIComponent(suggestionKeyword)}`);
      setSuggestionsList(await reload.json());

      triggerSecurityAlert(
        'site018-bug05',
        'SEC-175',
        '/api/search/suggestions',
        'keyword',
        '검색 자동완성 및 추천 키워드 등록 조회 시 바인딩 검증 누락으로 다른 사용자의 제안 내역이 유출됩니다.'
      );
      setSuggestionKeyword('');
      showToast('자동완성 색인이 추가되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Notifications Alert (site018-bug06)
  const handleNoticeSubmit = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: noticeInput })
      });

      const reload = await fetch(`/api/notifications?keyword=${encodeURIComponent(noticeInput)}`);
      setNotificationsList(await reload.json());

      triggerSecurityAlert(
        'site018-bug06',
        'SEC-176',
        '/api/notifications',
        'title',
        '알림 센터 공지 배너 추가 시 조건문을 병합해 조회 목록을 우회 노출할 수 있습니다.'
      );
      setNoticeInput('');
      showToast('신규 배너 공지가 알림판에 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Calendar Event (site018-bug07)
  const handleCalendarSubmit = async () => {
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: calTitleInput, date: calDateInput })
      });

      const reload = await fetch(`/api/calendar?keyword=${encodeURIComponent(calTitleInput)}`);
      setCalendarEventsList(await reload.json());

      triggerSecurityAlert(
        'site018-bug07',
        'SEC-177',
        '/api/calendar',
        'title',
        '기획 회의 일정 캘린더 메모 입력 인수에 이스케이프가 누락되어 타 부서 일정 조회를 변조시킵니다.'
      );
      setCalTitleInput('');
      showToast('일정 스케줄이 기입되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Admin Report Filters (site018-bug08)
  const handleReportFilterSubmit = async () => {
    try {
      await fetch('/api/reports/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterName: reportFilterInput })
      });

      const reload = await fetch(`/api/reports/filter?keyword=${encodeURIComponent(reportFilterInput)}`);
      setReportFilter(await reload.json());

      triggerSecurityAlert(
        'site018-bug08',
        'SEC-178',
        '/api/reports/filter',
        'filterName',
        '정산 보고서 필터링 옵션 지정 키워드의 조건 분기 우회가 발생하도록 필터가 비정상 처리됩니다.'
      );
      setReportFilterInput('');
      showToast('보고서 조건 필터가 지정되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 9. CSV Import (site018-bug09)
  const handleCsvSubmit = async () => {
    try {
      await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filenameInput })
      });

      const reload = await fetch(`/api/import/history?keyword=${encodeURIComponent(filenameInput)}`);
      setImportHistoryList(await reload.json());

      triggerSecurityAlert(
        'site018-bug09',
        'SEC-179',
        '/api/import/csv',
        'filename',
        '부서 정산 명세 파일 설명 기입 텍스트 매개변수 바인딩 누락으로 이력 목록 조건 분기가 교란됩니다.'
      );
      setFilenameInput('');
      showToast('부서 정산 명세서가 전송되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 10. API Query Console (site018-bug10)
  const handleQuerySubmit = async () => {
    try {
      await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryKeywordInput })
      });

      const reload = await fetch(`/api/query/history?keyword=${encodeURIComponent(queryKeywordInput)}`);
      setQueryHistoryList(await reload.json());

      triggerSecurityAlert(
        'site018-bug10',
        'SEC-180',
        '/api/query',
        'query',
        '전사 프로젝트 업무 이력 상세 검색 시 SQL Injection 조건 분기가 허용되게 쿼리가 설계됩니다.'
      );
      setQueryKeywordInput('');
      showToast('전사 이력 조회가 완료되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // Normal feature: Add Kanban Task
  const handleAddTask = async () => {
    if (!newTaskTitle) return;
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, assignee: newTaskAssignee, tag: newTaskTag })
      });
      const reload = await fetch('/api/tasks');
      setKanbanTasks(await reload.json());
      setNewTaskTitle('');
      setNewTaskAssignee('');
      showToast('신규 업무 카드가 칸반 보드에 마운트되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-root">
      
      {/* Top Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('kanban'); }}>
            <span className="logo-icon">C</span> CollabSpace
          </a>
          
          <nav className="header-nav">
            <a href="#" className={`nav-link ${activeTab === 'kanban' ? 'active' : ''}`} onClick={() => setActiveTab('kanban')}>Dashboard</a>
            <a href="#" className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</a>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-badge">
            <span>👤</span>
            <span>최예리 (Enterprise PM)</span>
          </div>
        </div>
      </header>

      {/* Grid Layout Container */}
      <div className="app-container">
        
        {/* Left Navigation Sidebar */}
        <aside className="left-sidebar">
          <div className="card-container">
            <ul className="menu-list">
              <li className={`menu-item ${activeTab === 'kanban' ? 'active' : ''}`}>
                <button onClick={() => setActiveTab('kanban')}>📋 스프린트 칸반 보드</button>
              </li>
              <li className={`menu-item ${activeTab === 'team' ? 'active' : ''}`}>
                <button onClick={() => setActiveTab('team')}>👥 부서원 초대 및 태그</button>
              </li>
              <li className={`menu-item ${activeTab === 'billing' ? 'active' : ''}`}>
                <button onClick={() => setActiveTab('billing')}>💸 예산 청구 및 환불</button>
              </li>
              <li className={`menu-item ${activeTab === 'history' ? 'active' : ''}`}>
                <button onClick={() => setActiveTab('history')}>🔍 전사 이력 통합 검색</button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Center Main panel views */}
        <main className="center-content">
          {isLoading ? (
            <div style={{ margin: 'auto', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <p>스프린트 및 업무 정산 내역을 로딩 중입니다...</p>
            </div>
          ) : (
            <>
              {/* Kanban board view */}
              {activeTab === 'kanban' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📋 Enterprise Sprint Board</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    실시간 개발 및 기획 단계의 업무 카드를 확인하고 보강 일정 메모를 기록합니다.
                  </p>

                  {/* Normal: Add Task Form */}
                  <div className="card-container" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-slate)', borderStyle: 'dashed' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-indigo)' }}>🆕 신규 업무 카드 발행</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="업무 타이틀 기입..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="담당 주임"
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                      />
                      <select className="form-input" value={newTaskTag} onChange={(e) => setNewTaskTag(e.target.value)}>
                        <option value="UI개선">UI개선</option>
                        <option value="백엔드개발">백엔드개발</option>
                        <option value="기획서조율">기획서조율</option>
                      </select>
                    </div>
                    <button className="btn-primary" onClick={handleAddTask}>업무 발행</button>
                  </div>

                  {/* Kanban Columns */}
                  <div className="kanban-board">
                    {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                      const list = kanbanTasks.filter(t => t.status === status);
                      return (
                        <div key={status} className="kanban-column">
                          <div className="column-header">
                            <span>{status}</span>
                            <span className="badge-indigo">{list.length}</span>
                          </div>
                          {list.map(task => (
                            <div key={task.id} className="task-card">
                              <span className="badge-rose" style={{ width: 'max-content', fontSize: '0.68rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-indigo)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                                {task.tag}
                              </span>
                              <h4 className="task-title">{task.title}</h4>
                              <div className="task-meta">
                                <span style={{ color: 'var(--text-gray)' }}>담당: {task.assignee}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  {/* SEC-173 Task delivery notes */}
                  <div className="card-container" style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-indigo)' }}>✍️ 이번 스프린트 보강 메모 사항</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="기획 보강 내용 서술..."
                        value={taskNoteInput}
                        onChange={(e) => setTaskNoteInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleTaskNoteSubmit}>메모 기입</button>
                    </div>
                    <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-slate)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-gray)' }}>
                      <strong>현재 등록된 메모:</strong> {taskNotes.notes}
                    </div>
                  </div>
                </div>
              )}

              {/* Team and tags view (Bug01 & Bug02) */}
              {activeTab === 'team' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>👥 부서원 초대 및 업무 태그 관리</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    스프린트 보드에 사용되는 고유 필터링 태그를 생성하거나 신규 협업 PM팀원을 초대합니다.
                  </p>

                  {/* SEC-171 Tags Management */}
                  <div className="card-container" style={{ marginBottom: '1.8rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-indigo)' }}>🏷️ 새 업무 분류 태그 생성</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="태그 명칭 입력 (예: 성능개선)..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleTagSubmit}>태그 등록</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                      {tagsList.map(tg => (
                        <span key={tg.id} className="badge-indigo">#{tg.name}</span>
                      ))}
                    </div>
                  </div>

                  {/* SEC-172 Team Invitations */}
                  <div className="card-container" style={{ backgroundColor: 'var(--bg-slate)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📧 신규 프로젝트 PM 부서 협업 초대</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="초대할 부서 팀원 이메일 기입..."
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleInvitationSubmit}>초대장 발송</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.8rem' }}>
                      {invitationsList.map(inv => (
                        <div key={inv.id} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fff' }}>
                          📧 {inv.email} (직책: {inv.role})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Billing and Refunds (Bug04, Bug08 & Bug09) */}
              {activeTab === 'billing' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💸 예산 청구 및 부서 정산</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    부서별 사용 청구 비용에 대한 환불 신청 및 정기 정산서 파일 제출 현황판입니다.
                  </p>

                  {/* SEC-174 Refunds list */}
                  <div className="card-container" style={{ marginBottom: '1.8rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-indigo)' }}>💸 정산 환불 요청서 제출</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="정산 취소 및 환불 사유 기입..."
                        value={refundInput}
                        onChange={(e) => setRefundInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleRefundSubmit}>신청</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.8rem' }}>
                      {refundsList.map(rf => (
                        <div key={rf.id} style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-slate)' }}>
                          ⚠️ {rf.reason}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEC-179 CSV Import */}
                  <div className="card-container" style={{ marginBottom: '1.8rem', backgroundColor: 'var(--bg-slate)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📄 부서별 정기 정산 리스트 명세서 파일 등록</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="정산 명세서 파일 이름 기입..."
                        value={filenameInput}
                        onChange={(e) => setFilenameInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleCsvSubmit}>명세 제출</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.8rem' }}>
                      {importHistoryList.map(h => (
                        <div key={h.id} style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid var(--border-color)' }}>
                          📄 {h.filename} | <strong>접수일자:</strong> {h.date}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEC-178 Admin Report Filters */}
                  <div className="card-container">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📊 관리자 정산 보고서 필터링 옵션 지정</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="보고서 타이틀 필터 키워드 지정..."
                        value={reportFilterInput}
                        onChange={(e) => setReportFilterInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleReportFilterSubmit}>필터 지정</button>
                    </div>
                    <div style={{ padding: '0.6rem', border: '1px dashed var(--primary-indigo)', borderRadius: '8px', fontSize: '0.82rem', marginTop: '0.8rem' }}>
                      <strong>현재 활성화된 보고서 필터 조건:</strong> {reportFilter.filterName}
                    </div>
                  </div>
                </div>
              )}

              {/* History Search console (Bug10) */}
              {activeTab === 'history' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🔍 전사 프로젝트 업무 이력 및 기록 상세 검색</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    데이터베이스 내 보관된 지난 분기 프로젝트 업무 상세 쿼리 및 실행 기록을 안전하게 대조합니다.
                  </p>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="조회할 이력 조건 키워드 입력 (예: IN_PROGRESS)..."
                        value={queryKeywordInput}
                        onChange={(e) => setQueryKeywordInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleQuerySubmit}>기록 검색</button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>최근 검색 조건 기록</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {queryHistoryList.map(q => (
                      <div key={q.id} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-slate)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {q.query}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Activity Sidebar (Calendar, Suggestions, Notices) */}
        <aside className="right-sidebar">
          {/* Quick Notice alerts (Bug06) */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-indigo)' }}>🔔 알림 센터 공지 배너 추가</h4>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="공지 추가..."
                style={{ padding: '0.4rem', fontSize: '0.78rem' }}
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleNoticeSubmit}>등록</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.8rem' }}>
              {notificationsList.map(n => (
                <div key={n.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                  <strong>{n.title}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Search Suggestion (Bug05) */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-indigo)' }}>🔍 검색어 자동완성 키워드 추천</h4>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="추천 키워드 입력..."
                style={{ padding: '0.4rem', fontSize: '0.78rem' }}
                value={suggestionKeyword}
                onChange={(e) => setSuggestionKeyword(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleSuggestionSubmit}>제안 등록</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.8rem' }}>
              {suggestionsList.map(s => (
                <span key={s.id} className="badge-secondary">{s.keyword}</span>
              ))}
            </div>
          </div>

          {/* Calendar Events (Bug07) */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-indigo)' }}>📅 기획 회의 일정 스케줄러</h4>
            <div className="form-group" style={{ marginBottom: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="회의 타이틀..."
                style={{ padding: '0.4rem', fontSize: '0.78rem', marginBottom: '0.3rem' }}
                value={calTitleInput}
                onChange={(e) => setCalTitleInput(e.target.value)}
              />
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.4rem', fontSize: '0.78rem' }}
                value={calDateInput}
                onChange={(e) => setCalDateInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.78rem', width: '100%', marginTop: '0.3rem' }} onClick={handleCalendarSubmit}>일정 추가</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
              {calendarEventsList.map(ev => (
                <div key={ev.id} style={{ padding: '0.4rem', backgroundColor: 'var(--primary-light)', borderRadius: '6px' }}>
                  📅 {ev.date} : {ev.title}
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Pop-up System Alert Modal (Triggers on SQL Injection) */}
      {securityModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">🚨 시스템 데이터 무결성 검증 경고</span>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
                입력 데이터 분석 오류 감지: SQL 인젝션 가능성 식별
              </p>
              <div style={{ backgroundColor: 'var(--bg-slate)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <div><strong>오류 식별 부호 (ID):</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>{securityModal.bugId}</span></div>
                <div><strong>관련 인덱스 번호 (CSV):</strong> {securityModal.csvId}</div>
                <div><strong>호출 엔드포인트:</strong> <span style={{ fontFamily: 'monospace' }}>{securityModal.endpoint}</span></div>
                <div><strong>취약 인수 매개변수:</strong> <span style={{ fontFamily: 'monospace' }}>{securityModal.parameter}</span></div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', lineHeight: '1.5' }}>
                {securityModal.description}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}>
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast alert notice */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">{toastMessage}</div>
        </div>
      )}

    </div>
  );
}
