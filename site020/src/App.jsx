import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication Mock
  const [user, setUser] = useState({ username: 'admin', name: '김지현 센터장', role: 'administrator' });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', name: '', role: 'planner' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Data States
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [invitations, setInvitations] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: '', eventTitle: '' });
  
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [resNoteInput, setResNoteInput] = useState('');
  
  const [refunds, setRefunds] = useState([]);
  const [refundForm, setRefundForm] = useState({ reservationId: '', amount: '', reason: '' });
  
  const [notifications, setNotifications] = useState([]);
  const [notiForm, setNotiForm] = useState({ channel: 'Email', message: '' });
  
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calForm, setCalForm] = useState({ title: '', date: '', location: '' });
  
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState({ year: '2026', category: '' });
  
  const [csvImports, setCsvImports] = useState([]);
  const [csvFilename, setCsvFilename] = useState('');
  const [csvText, setCsvText] = useState('');
  
  const [queriesHistory, setQueriesHistory] = useState([]);
  const [queryInput, setQueryInput] = useState('');

  // UI States
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'reservations', 'reports', 'csv', 'query'
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load Data initially
  useEffect(() => {
    fetchEvents();
    fetchTags();
    fetchInvitations();
    fetchReservations();
    fetchRefunds();
    fetchNotifications();
    fetchCalendarEvents();
    fetchReports();
    fetchCsvImports();
    fetchQueriesHistory();
  }, []);

  // Fetch functions
  const fetchEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => showToast('행사 목록 로드 실패', err.message, true));
  };

  const fetchTags = () => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => setTags(data))
      .catch(err => showToast('태그 로드 실패', err.message, true));
  };

  const fetchInvitations = () => {
    fetch('/api/invitations')
      .then(res => res.json())
      .then(data => setInvitations(data))
      .catch(err => showToast('초대 현황 로드 실패', err.message, true));
  };

  const fetchReservations = () => {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => setReservations(data))
      .catch(err => showToast('예약 현황 로드 실패', err.message, true));
  };

  const fetchRefunds = () => {
    fetch('/api/refunds')
      .then(res => res.json())
      .then(data => setRefunds(data))
      .catch(err => showToast('환불 이력 로드 실패', err.message, true));
  };

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => showToast('알림 목록 로드 실패', err.message, true));
  };

  const fetchCalendarEvents = () => {
    fetch('/api/calendar')
      .then(res => res.json())
      .then(data => setCalendarEvents(data))
      .catch(err => showToast('달력 일정 로드 실패', err.message, true));
  };

  const fetchReports = () => {
    fetch('/api/reports/filter')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => showToast('리포트 로드 실패', err.message, true));
  };

  const fetchCsvImports = () => {
    fetch('/api/import/history')
      .then(res => res.json())
      .then(data => setCsvImports(data))
      .catch(err => showToast('업로드 이력 로드 실패', err.message, true));
  };

  const fetchQueriesHistory = () => {
    fetch('/api/query/history')
      .then(res => res.json())
      .then(data => setQueriesHistory(data))
      .catch(err => showToast('쿼리 이력 로드 실패', err.message, true));
  };

  // Toast Helper
  const showToast = (title, message, isError = false, details = null) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, isError, details }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 12000); // 12 seconds for visibility
  };

  // Autocomplete Suggestions
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        .then(async res => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || '검색 제안 로드 실패');
          }
          return res.json();
        })
        .then(data => setSuggestions(data))
        .catch(err => {
          // Trigger system-info-disclosure details from response if available
          fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
            .then(res => res.json())
            .then(errData => {
              showToast('검색 자동완성 엔진 오류', errData.error || err.message, true, errData.stack);
            });
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Auth Handling
  const handleAuth = (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    const payload = authMode === 'login' ? loginForm : registerForm;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('인증 처리 실패');
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          setUser(data.user);
          setShowAuthModal(false);
          showToast('인증 완료', `${data.user.name}님 환영합니다.`);
        }
      })
      .catch(err => showToast('인증 오류', err.message, true));
  };

  // Tag Add (site020-bug01)
  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagInput })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('태그 추가 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setNewTagInput('');
          fetchTags();
          showToast('태그 성공', '새로운 분류 태그가 등록되었습니다.');
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Invite (site020-bug02)
  const handleSendInvite = (e) => {
    e.preventDefault();
    fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('초대장 발송 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setInviteForm({ email: '', eventTitle: '' });
          fetchInvitations();
          showToast('초대 완료', '초대 이메일이 발송 큐에 등록되었습니다.');
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Update Reservation Note (site020-bug03)
  const handleUpdateNote = (e) => {
    e.preventDefault();
    if (!selectedReservation) return;

    fetch('/api/reservations/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedReservation.id, note: resNoteInput })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('메모 저장 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setSelectedReservation(null);
          setResNoteInput('');
          fetchReservations();
          showToast('메모 수정 완료', '참가자 특별 메모가 업데이트되었습니다.');
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Refund (site020-bug04)
  const handleRefund = (e) => {
    e.preventDefault();
    fetch('/api/refunds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refundForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('환불 트랜잭션 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setRefundForm({ reservationId: '', amount: '', reason: '' });
          fetchRefunds();
          showToast('환불 처리 완료', '환불 트랜잭션이 성공적으로 처리되었습니다.');
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Send Notification (site020-bug06)
  const handleSendNotification = (e) => {
    e.preventDefault();
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notiForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('알림 디스패치 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setNotiForm({ channel: 'Email', message: '' });
          fetchNotifications();
          showToast('알림 전송', '채널 전송 요청이 성공적으로 접수되었습니다.');
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Calendar Event Add (site020-bug07)
  const handleAddCalendar = (e) => {
    e.preventDefault();
    fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('달력 등록 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setCalForm({ title: '', date: '', location: '' });
          fetchCalendarEvents();
          showToast('일정 등록 완료', '달력 일정이 새롭게 추가되었습니다.');
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Report Filter (site020-bug08)
  const handleReportFilter = (e) => {
    e.preventDefault();
    fetch('/api/reports/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportFilter)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('리포트 필터 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setReports(data);
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // CSV Import (site020-bug09)
  const handleCsvImport = (e) => {
    e.preventDefault();
    fetch('/api/import/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: csvFilename, csvData: csvText })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('CSV 파싱 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setCsvFilename('');
          setCsvText('');
          fetchCsvImports();
          showToast('업로드 성공', `${data.import.count}명의 명단이 안전하게 임포트되었습니다.`);
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Run API Query Console (site020-bug10)
  const handleRunQuery = (e) => {
    e.preventDefault();
    fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryText: queryInput })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          showToast('쿼리 실행기 시스템 오류', data.error, true, data.stack || JSON.stringify(data, null, 2));
        } else {
          setQueryInput('');
          fetchQueriesHistory();
          showToast('쿼리 성공', 'API 쿼리가 성공적으로 연동 테스트를 통과했습니다.');
        }
      })
      .catch(err => showToast('네트워크 오류', err.message, true));
  };

  // Filtering Events locally based on tab + search
  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app-container">
      {/* Toast Notification Area */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.isError ? 'toast-error' : ''}`}>
            <div className="toast-header">
              <span>{t.isError ? '⚠️ 시스템 정보 유출 탐지 모드' : 'ℹ️ 알림'}</span>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
            </div>
            <div className="toast-body">{t.title}: {t.message}</div>
            {t.details && (
              <pre className="toast-details">
                {t.details}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Main Header */}
      <header className="app-header">
        <a href="#" className="logo">
          NEXUS<span>EVENTS</span>
        </a>
        <div className="header-actions">
          {user ? (
            <div className="user-badge">
              <span>👤 {user.name} ({user.role})</span>
              <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setUser(null)}>로그아웃</button>
            </div>
          ) : (
            <button className="btn btn-accent" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>로그인</button>
          )}
        </div>
      </header>

      <main className="main-content">
        {/* Hero Banner Section */}
        <section className="hero-banner">
          <h1>글로벌 프리미엄 콘퍼런스 & 행사 관리 대시보드</h1>
          <p>Nexus Events는 엔터프라이즈 레벨의 스마트한 행사 및 컨퍼런스 기획을 지원합니다. 이벤트 등록부터 달력 연동, 참석자 배치 메모, CSV 일괄 임포트까지 고도화된 스케줄 제어를 한눈에 관리하십시오.</p>
          
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="행사 제목 혹은 설명 검색... (오류 발생 예시: * 또는 %)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((s, idx) => (
                  <div key={idx} className="suggestion-item" onClick={() => { setSearchQuery(s); setSuggestions([]); }}>
                    🔍 {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <span className="label">운영중인 총 행사</span>
            <span className="value">{events.length}개</span>
            <span className="trend">↑ 금월 2개 신규 예정</span>
          </div>
          <div className="stat-card">
            <span className="label">등록된 예약자</span>
            <span className="value">{reservations.length}명</span>
            <span className="trend">↑ 실시간 접수 중</span>
          </div>
          <div className="stat-card">
            <span className="label">환불 누적 건수</span>
            <span className="value">{refunds.length}건</span>
            <span className="trend" style={{ color: 'var(--color-danger)' }}>정상 처리 완료</span>
          </div>
          <div className="stat-card">
            <span className="label">CSV 업로드 회차</span>
            <span className="value">{csvImports.length}회</span>
            <span className="trend">총 참가명단 통합</span>
          </div>
        </section>

        {/* Primary View Navigation */}
        <nav className="tabs-nav">
          <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>행사 카탈로그</button>
          <button className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>참가 예약 & 메모</button>
          <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>운영 리포트</button>
          <button className={`tab-btn ${activeTab === 'csv' ? 'active' : ''}`} onClick={() => setActiveTab('csv')}>CSV 명단 관리</button>
          <button className={`tab-btn ${activeTab === 'query' ? 'active' : ''}`} onClick={() => setActiveTab('query')}>API 연동 콘솔</button>
        </nav>

        {/* Main Dashboard Layout */}
        <div className="dashboard-grid">
          
          {/* LEFT SIDE PANEL - Tab Content */}
          <div className="left-panel">
            
            {activeTab === 'events' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="category-tabs">
                  {['All', 'Tech', 'Networking', 'Business'].map(cat => (
                    <button 
                      key={cat} 
                      className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="events-list">
                  {filteredEvents.map(evt => (
                    <div key={evt.id} className="event-card">
                      <div className="event-image" style={{ backgroundImage: `url(${evt.image})` }}>
                        <span className="event-category-badge">{evt.category}</span>
                      </div>
                      <div className="event-info">
                        <h3>{evt.title}</h3>
                        <div className="event-meta">
                          <span>📅 {evt.date}</span>
                          <span>👤 {evt.attendees}/{evt.maxAttendees}명</span>
                        </div>
                        <p className="event-desc">{evt.desc}</p>
                        <div className="card-footer">
                          <span className="event-price">{evt.price}</span>
                          <button className="btn" onClick={() => {
                            fetch('/api/reservations', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ eventTitle: evt.title, attendeeName: user ? user.name : '비회원' })
                            })
                            .then(res => res.json())
                            .then(() => {
                              fetchReservations();
                              showToast('예약 성공', `${evt.title} 참가 신청이 완료되었습니다.`);
                            });
                          }}>신청하기</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="sidebar-panel" style={{ width: '100%', background: 'none', border: 'none', padding: 0 }}>
                <div className="panel-header">
                  <h3>참가 신청 현황 & 상세 메모 수정</h3>
                </div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>예약ID</th>
                        <th>행사명</th>
                        <th>참가자명</th>
                        <th>특별 요청 사항 (메모)</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map(resv => (
                        <tr key={resv.id}>
                          <td>{resv.id}</td>
                          <td>{resv.eventTitle}</td>
                          <td>{resv.attendeeName}</td>
                          <td>{resv.note || <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>(없음)</span>}</td>
                          <td>
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => {
                              setSelectedReservation(resv);
                              setResNoteInput(resv.note);
                            }}>메모 수정</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedReservation && (
                  <form onSubmit={handleUpdateNote} style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ marginBottom: '1rem' }}>✏️ {selectedReservation.attendeeName}님의 메모 수정 (형식 오류 예시: %Note% 또는 FAIL)</h4>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={resNoteInput}
                        onChange={(e) => setResNoteInput(e.target.value)}
                        placeholder="특이 사항을 기재하십시오."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn">저장</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setSelectedReservation(null)}>취소</button>
                    </div>
                  </form>
                )}

                {/* Refund Form widget inside Reservations */}
                <div style={{ marginTop: '2.5rem' }}>
                  <div className="panel-header">
                    <h3>행사 참가 취소 및 환불 요청서</h3>
                  </div>
                  <form onSubmit={handleRefund} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.5fr', gap: '1rem', alignItems: 'end', marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>환불 대상 예약ID (오류 예시: % 또는 FAIL)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: res1"
                        value={refundForm.reservationId}
                        onChange={(e) => setRefundForm({...refundForm, reservationId: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>금액 (오류 예시: abc 또는 -1000)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="금액 단위(원)"
                        value={refundForm.amount}
                        onChange={(e) => setRefundForm({...refundForm, amount: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>취소 사유</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="사유 작성"
                        value={refundForm.reason}
                        onChange={(e) => setRefundForm({...refundForm, reason: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ height: '42px' }}>취소 요청</button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <div className="panel-header">
                  <h3>연간 운영 예산 및 참가 실적 통계</h3>
                </div>
                <form onSubmit={handleReportFilter} style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>기준 연도 (오류 예시: % 또는 abc)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={reportFilter.year}
                      onChange={(e) => setReportFilter({...reportFilter, year: e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>카테고리</label>
                    <select 
                      className="form-input"
                      value={reportFilter.category}
                      onChange={(e) => setReportFilter({...reportFilter, category: e.target.value})}
                    >
                      <option value="">전체 카테고리</option>
                      <option value="Tech">Tech</option>
                      <option value="Networking">Networking</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <button type="submit" className="btn" style={{ alignSelf: 'flex-end', height: '42px' }}>필터 검색</button>
                </form>

                <div className="table-container" style={{ marginTop: '1.5rem' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>집계 ID</th>
                        <th>연도</th>
                        <th>카테고리</th>
                        <th>총 누적 매출</th>
                        <th>유치 참석자 수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(rep => (
                        <tr key={rep.id}>
                          <td>{rep.id}</td>
                          <td>{rep.year}년</td>
                          <td>{rep.category}</td>
                          <td>{rep.revenue?.toLocaleString()}원</td>
                          <td>{rep.attendees}명</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'csv' && (
              <div>
                <div className="panel-header">
                  <h3>CSV 대량 참가자 정보 명단 업로드</h3>
                </div>
                <form onSubmit={handleCsvImport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>파일명</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="예: users_list.csv" 
                      value={csvFilename}
                      onChange={(e) => setCsvFilename(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>CSV 로우 데이터 입력 (오류 예시: %, FAIL 또는 error 문자열)</label>
                    <textarea 
                      className="form-input" 
                      rows="6" 
                      placeholder="name,email,phone&#10;홍길동,kildong@korea.com,010-1234-5678&#10;임꺽정,lim@korea.com,010-9999-8888"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      style={{ resize: 'vertical', fontFamily: 'monospace' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-accent">명단 파싱 및 등록</button>
                </form>

                <div style={{ marginTop: '2.5rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>📋 업로드 완료 이력</h4>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>배치 ID</th>
                          <th>파일명</th>
                          <th>파싱 인원</th>
                          <th>상태</th>
                          <th>날짜</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvImports.map(h => (
                          <tr key={h.id}>
                            <td>{h.id}</td>
                            <td>{h.filename}</td>
                            <td>{h.count}명</td>
                            <td style={{ color: 'var(--color-success)' }}>{h.status}</td>
                            <td>{new Date(h.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'query' && (
              <div>
                <div className="panel-header">
                  <h3>시스템 연동용 API Query 실행 패널</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  외부 시스템 연동 규격을 모의 테스트하기 위한 API 쿼리 콘솔창입니다. DB 드라이버 스키마 구문을 입력해 동작을 확인하십시오.
                </p>
                <form onSubmit={handleRunQuery} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label>실행할 쿼리 질의문 (오류 예시: %, FAIL 또는 세미콜론이 깨진 비정상 쿼리)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="SELECT * FROM events WHERE year = 2026" 
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <button type="submit" className="btn">연동 쿼리 컴파일</button>
                </form>

                <div style={{ marginTop: '2.5rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>💾 최근 모의 쿼리 실행 내역</h4>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>트랜잭션 ID</th>
                          <th>실행 질의문</th>
                          <th>상태</th>
                          <th>시각</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queriesHistory.map(qh => (
                          <tr key={qh.id}>
                            <td>{qh.id}</td>
                            <td><code>{qh.queryText}</code></td>
                            <td style={{ color: qh.status === 'Success' ? 'var(--color-success)' : 'var(--color-danger)' }}>{qh.status}</td>
                            <td>{new Date(qh.timestamp).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDE PANEL - Calendar, Tags, Invitations, Notifications */}
          <div className="right-panel">
            
            {/* Calendar widget */}
            <div className="sidebar-panel">
              <div className="panel-header">
                <h3>행사 일정 달력 (Calendar)</h3>
              </div>
              <div className="calendar-widget">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                  <div key={d} className="calendar-day-header">{d}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `2026-08-${String(dayNum).padStart(2, '0')}`;
                  const hasEvt = calendarEvents.some(ce => ce.date === dateStr);
                  return (
                    <div 
                      key={dayNum} 
                      className={`calendar-day ${hasEvt ? 'has-event' : ''}`}
                      title={hasEvt ? calendarEvents.find(ce => ce.date === dateStr).title : ''}
                    >
                      <span>{dayNum}</span>
                      {hasEvt && <div className="calendar-dot" />}
                    </div>
                  );
                })}
              </div>

              {/* Add Calendar Event Form */}
              <form onSubmit={handleAddCalendar} style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📅 신규 일정 등록</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="일정 명칭"
                    value={calForm.title}
                    onChange={(e) => setCalForm({...calForm, title: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="날짜 (오류 예시: %, invalid 또는 빈값)"
                    value={calForm.date}
                    onChange={(e) => setCalForm({...calForm, date: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="장소"
                    value={calForm.location}
                    onChange={(e) => setCalForm({...calForm, location: e.target.value})}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem' }}>스케줄 등록</button>
                </div>
              </form>
            </div>

            {/* Tag Management widget */}
            <div className="sidebar-panel">
              <div className="panel-header">
                <h3>태그 관리 포털 (Tags)</h3>
              </div>
              <div className="tag-container">
                {tags.map(t => (
                  <span key={t.id} className="tag-badge">
                    #{t.name}
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="tag-input-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="태그 입력... (오류 예시: %태그% 또는 FAIL_TEST)" 
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn" style={{ padding: '0 1rem' }}>+</button>
              </form>
            </div>

            {/* Invitation sending widget */}
            <div className="sidebar-panel">
              <div className="panel-header">
                <h3>VIP 파트너 초대 메시지</h3>
              </div>
              <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="초대 메일 주소 (오류 예시: %, @포함안됨, fail)" 
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="행사 선택" 
                    value={inviteForm.eventTitle}
                    onChange={(e) => setInviteForm({...inviteForm, eventTitle: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-accent">초대장 전송</button>
              </form>

              <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>초대 이력</h4>
                {invitations.map(inv => (
                  <div key={inv.id} style={{ fontSize: '0.8rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    ✉️ {inv.email} - {inv.eventTitle} ({inv.status})
                  </div>
                ))}
              </div>
            </div>

            {/* Realtime Alert channel dispatcher */}
            <div className="sidebar-panel">
              <div className="panel-header">
                <h3>실시간 알림 센터 (Notifications)</h3>
              </div>
              <div className="notice-list">
                {notifications.map(n => (
                  <div key={n.id} className="notice-item">
                    <div>[{n.channel}] {n.message}</div>
                    <div className="notice-time">{new Date(n.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendNotification} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="발송 채널 (오류 예시: %, FAIL 등)" 
                    value={notiForm.channel}
                    onChange={(e) => setNotiForm({...notiForm, channel: e.target.value})}
                    style={{ width: '50%' }}
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="알림 텍스트" 
                    value={notiForm.message}
                    onChange={(e) => setNotiForm({...notiForm, message: e.target.value})}
                    style={{ flex: 1 }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '0.4rem' }}>알림 방송</button>
              </form>
            </div>

          </div>

        </div>
      </main>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'Nexus 계정 로그인' : '신규 가입'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleAuth}>
              <div className="modal-body">
                <div className="form-group">
                  <label>사용자 아이디 (로그인용: admin 또는 planner)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={authMode === 'login' ? loginForm.username : registerForm.username}
                    onChange={(e) => {
                      if (authMode === 'login') {
                        setLoginForm({ ...loginForm, username: e.target.value });
                      } else {
                        setRegisterForm({ ...registerForm, username: e.target.value });
                      }
                    }}
                  />
                </div>
                {authMode === 'register' && (
                  <>
                    <div className="form-group">
                      <label>이름</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>역할</label>
                      <select 
                        className="form-input"
                        value={registerForm.role}
                        onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      >
                        <option value="planner">행사 플래너 (Planner)</option>
                        <option value="administrator">시스템 운영진 (Administrator)</option>
                      </select>
                    </div>
                  </>
                )}
                {authMode === 'login' ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    아직 계정이 없으신가요? <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => setAuthMode('register')}>회원가입하기</span>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    이미 계정이 있으신가요? <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => setAuthMode('login')}>로그인하기</span>
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn">{authMode === 'login' ? '로그인' : '가입 완료'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={{ backgroundColor: 'var(--color-bg-card)', padding: '2rem', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 'auto' }}>
        <p>© 2026 Nexus Events Management Platform. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>본 플랫폼은 보안 취약점 동적 분석 및 에이전트 강화학습 검증용 시뮬레이터입니다.</p>
      </footer>
    </div>
  );
}
