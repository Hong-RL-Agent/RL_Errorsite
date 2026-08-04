import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Security validation warning popup state
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
  const [profile, setProfile] = useState({ email: 'customer@mail.com', name: '최예리', membership: '프리미엄 관객', point: 8500 });
  const [tagsList, setTagsList] = useState([]);
  const [invitationsList, setInvitationsList] = useState([]);
  const [ticketDeliveryNotes, setTicketDeliveryNotes] = useState({ notes: '' });
  const [refundsList, setRefundsList] = useState([]);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [calendarEventsList, setCalendarEventsList] = useState([]);
  const [reportFilterObj, setReportFilterObj] = useState({ filterName: '' });
  const [importHistoryList, setImportHistoryList] = useState([]);
  const [queryHistoryList, setQueryHistoryList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);

  // Form Inputs
  const [tagInput, setTagInput] = useState('');
  const [inviteReceiver, setInviteReceiver] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [deliveryInput, setDeliveryInput] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [suggestionInput, setSuggestionInput] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyContent, setNotifyContent] = useState('');
  const [calendarDate, setCalendarDate] = useState('2026-08-15');
  const [calendarTitle, setCalendarTitle] = useState('');
  const [filterInput, setFilterInput] = useState('');
  const [csvFilename, setCsvFilename] = useState('');
  const [queryInput, setQueryInput] = useState('');

  // General Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Database state
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const tagRes = await fetch('/api/tags');
      setTagsList(await tagRes.json());

      const invRes = await fetch('/api/invitations');
      setInvitationsList(await invRes.json());

      const delRes = await fetch('/api/tickets/delivery');
      const delData = await delRes.json();
      setTicketDeliveryNotes(delData);
      setDeliveryInput(delData.notes || '');

      const refRes = await fetch('/api/refunds');
      setRefundsList(await refRes.json());

      const sugRes = await fetch('/api/search/suggestions');
      setSuggestionsList(await sugRes.json());

      const notRes = await fetch('/api/notifications');
      setNotificationsList(await notRes.json());

      const calRes = await fetch('/api/calendar');
      setCalendarEventsList(await calRes.json());

      const repRes = await fetch('/api/reports/filter');
      const repData = await repRes.json();
      setReportFilterObj(repData);
      setFilterInput(repData.filterName || '');

      const impRes = await fetch('/api/events/import-history');
      setImportHistoryList(await impRes.json());

      const qyRes = await fetch('/api/query/history');
      setQueryHistoryList(await qyRes.json());

      const evRes = await fetch('/api/events');
      setEventsList(await evRes.json());

      const tktRes = await fetch('/api/tickets');
      setTicketsList(await tktRes.json());
    } catch (err) {
      console.error("Error connecting to Mock Database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Tag Input Stored XSS (site015-bug01)
  const handleTagSubmit = async () => {
    const val = tagInput.trim() || '뮤지컬축제';
    try {
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: val })
      });

      const reload = await fetch('/api/tags');
      setTagsList(await reload.json());

      triggerSecurityAlert(
        'site015-bug01',
        'SEC-141',
        '/api/tags',
        'name',
        '공연을 분류하는 태그 입력값을 HTML Escape 필터링 없이 그대로 적재한 후, 태그 리스트 영역에 innerHTML을 통해 그대로 노출시킴으로써 Stored XSS를 야기합니다.'
      );

      setTagInput('');
      showToast('신규 장르 태그가 생성되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Invitation Message Stored XSS (site015-bug02)
  const handleInviteSubmit = async () => {
    const recv = inviteReceiver.trim() || '동반관객';
    const msg = inviteMsg.trim() || '함께 보러 가요!';
    try {
      await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver: recv, message: msg })
      });

      const reload = await fetch('/api/invitations');
      setInvitationsList(await reload.json());

      triggerSecurityAlert(
        'site015-bug02',
        'SEC-142',
        '/api/invitations',
        'message',
        '초대장 동반 메시지 본문을 치환 변환 처리 없이 저장하고 최근 발송 완료 요약 화면에 그대로 출력하여 취약성을 트리거합니다.'
      );

      setInviteReceiver('');
      setInviteMsg('');
      showToast('초대장이 정상 전송되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Delivery Notes Stored XSS (site015-bug03)
  const handleDeliverySubmit = async () => {
    const val = deliveryInput.trim() || '부재 시 문 앞에 놓아주세요.';
    try {
      await fetch('/api/tickets/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: val })
      });

      const reload = await fetch('/api/tickets/delivery');
      const data = await reload.json();
      setTicketDeliveryNotes(data);

      triggerSecurityAlert(
        'site015-bug03',
        'SEC-143',
        '/api/tickets/delivery',
        'notes',
        '종이 티켓 현장/택배 배송 메모 요청사항 입력란의 텍스트에 HTML 치환을 생략하여 배송 상세 내역 렌더 시 위험 요인을 노출합니다.'
      );

      showToast('배송 요구사항 메모가 반영되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Refund Reason Stored XSS (site015-bug04)
  const handleRefundSubmit = async () => {
    const val = refundReason.trim() || '개인 사정으로 취소합니다.';
    try {
      await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: '뮤지컬 지킬앤하이드 예매 취소 건', reason: val })
      });

      const reload = await fetch('/api/refunds');
      setRefundsList(await reload.json());

      triggerSecurityAlert(
        'site015-bug04',
        'SEC-144',
        '/api/refunds',
        'reason',
        '예매 취소 환불 신청서의 세부 취소 사유 문장을 검증 없이 DB에 기입하고 최근 접수 완료 명세 화면에 그대로 출력하여 취약성을 발생시킵니다.'
      );

      setRefundReason('');
      showToast('환불 신청서가 정상적으로 접수되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Search Suggestions Stored XSS (site015-bug05)
  const handleSuggestionSubmit = async () => {
    const val = suggestionInput.trim() || '추천 공연';
    try {
      await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: val })
      });

      const reload = await fetch('/api/search/suggestions');
      setSuggestionsList(await reload.json());

      triggerSecurityAlert(
        'site015-bug05',
        'SEC-145',
        '/api/search/suggestions',
        'keyword',
        '검색 자동완성 제안어로 추가된 키워드가 자동완성 팝업 패널 렌더링 시 innerHTML을 통해 그대로 구문 해석되어 취약점이 실행됩니다.'
      );

      setSuggestionInput('');
      showToast('추천 검색어 데이터가 추가되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Notification Title Stored XSS (site015-bug06)
  const handleNotifySubmit = async () => {
    const title = notifyTitle.trim() || '신규 공연 알림';
    const content = notifyContent.trim() || '공연 개막 시간이 임박했음을 안내합니다.';
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      const reload = await fetch('/api/notifications');
      setNotificationsList(await reload.json());

      triggerSecurityAlert(
        'site015-bug06',
        'SEC-146',
        '/api/notifications',
        'title',
        '신규 긴급 공지 알림 제목에 유효성 및 치환 변환 처리를 가하지 않고 알림 리스트 팝업 렌더링 시 innerHTML로 해석하여 취약점을 드러냅니다.'
      );

      setNotifyTitle('');
      setNotifyContent('');
      showToast('전체 회원 긴급 알림이 발송되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Calendar Title Stored XSS (site015-bug07)
  const handleCalendarSubmit = async () => {
    const val = calendarTitle.trim() || '예매 예정 공연';
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: calendarDate, title: val })
      });

      const reload = await fetch('/api/calendar');
      setCalendarEventsList(await reload.json());

      triggerSecurityAlert(
        'site015-bug07',
        'SEC-147',
        '/api/calendar',
        'title',
        '개인 일정 관리를 위해 캘린더에 추가한 일정 타이틀 텍스트를 이스케이프하지 않아 캘린더 그리드 출력 시 원시 코드로 실행됩니다.'
      );

      setCalendarTitle('');
      showToast('캘린더에 일정이 정상 추가되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Report Filter Category Stored XSS (site015-bug08)
  const handleFilterSubmit = async () => {
    const val = filterInput.trim() || '필터 세팅';
    try {
      await fetch('/api/reports/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterName: val })
      });

      const reload = await fetch('/api/reports/filter');
      const data = await reload.json();
      setReportFilterObj(data);

      triggerSecurityAlert(
        'site015-bug08',
        'SEC-148',
        '/api/reports/filter',
        'filterName',
        '기획보고서 필터 조건 기재 시 특수 문자 제거 처리를 생략하여 필터 명칭 노출 대시보드 렌더링 시 공격 요인을 허용합니다.'
      );

      showToast('관심 카테고리 폴더명이 설정되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 9. CSV Import Filename Stored XSS (site015-bug09)
  const handleCsvSubmit = async () => {
    const val = csvFilename.trim() || '단체예매명단.csv';
    try {
      await fetch('/api/events/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: val })
      });

      const reload = await fetch('/api/events/import-history');
      setImportHistoryList(await reload.json());

      triggerSecurityAlert(
        'site015-bug09',
        'SEC-149',
        '/api/events/csv',
        'filename',
        '기획자 대량 티켓/관객 명단 CSV 업로드 기록 시, 기재 파일 이름에 대한 정제를 처리하지 않고 목록 대시보드 출력 시 임의 코드를 가동합니다.'
      );

      setCsvFilename('');
      showToast('신청자 명단 파일이 정상 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 10. API Query Parameter Stored XSS (site015-bug10)
  const handleQuerySubmit = async () => {
    const val = queryInput.trim() || 'VIP석';
    try {
      await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: val })
      });

      const reload = await fetch('/api/query/history');
      setQueryHistoryList(await reload.json());

      triggerSecurityAlert(
        'site015-bug10',
        'SEC-150',
        '/api/query',
        'query',
        '공연 연동 테스트용 API 쿼리 파라미터 식을 안전 치환 없이 보관하고 실행 요청 이력 카드에 원시 렌더링하여 취약점을 야기합니다.'
      );

      setQueryInput('');
      showToast('조회 조건이 성공적으로 검색되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-root">
      
      {/* Top Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedEventId(null); }}>
            <span className="logo-icon">🔮</span> EventHub
          </a>
          
          <nav className="header-nav">
            <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedEventId(null); }}>공연 & 이벤트</a>
            <a href="#" className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => { setActiveTab('calendar'); setSelectedEventId(null); }}>일정 캘린더</a>
            <a href="#" className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => { setActiveTab('tickets'); setSelectedEventId(null); }}>내 예매 티켓</a>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-badge">
            <span>🎟️</span>
            <span>{profile.name} ({profile.membership})</span>
          </div>
        </div>
      </header>

      {/* Grid Layout Container */}
      <div className="app-container">
        
        {/* Left Navigation Menu Sidebar */}
        <aside className="left-sidebar">
          <div className="card-container">
            <ul className="menu-list">
              <li className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('home'); setSelectedEventId(null); }}>🏠 티켓팅 홈</button>
              </li>
              <li className={`menu-item ${activeTab === 'invite' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('invite'); setSelectedEventId(null); }}>💌 동반 친구 초대</button>
              </li>
              <li className={`menu-item ${activeTab === 'refund' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('refund'); setSelectedEventId(null); }}>💸 환불 신청 포털</button>
              </li>
              <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('dashboard'); setSelectedEventId(null); }}>🎫 단체 예매 및 주최 지원판</button>
              </li>
              <li className={`menu-item ${activeTab === 'my-page' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('my-page'); setSelectedEventId(null); }}>⚙️ 예매 계정 설정</button>
              </li>
            </ul>
          </div>

          {/* SEC-141 tag rendering block */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-purple)', marginBottom: '0.6rem' }}>인기 공연 해시태그</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginBottom: '0.8rem' }}>
              {tagsList.map((tag) => (
                <span 
                  key={tag.id} 
                  className="tag-btn" 
                  dangerouslySetInnerHTML={{ __html: tag.name }} 
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="태그명 추가..."
                style={{ padding: '0.4rem' }}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleTagSubmit}>등록</button>
            </div>
          </div>
        </aside>

        {/* Center Main panel views */}
        <main className="center-content">
          {isLoading ? (
            <div style={{ margin: 'auto', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <p>실시간 공연 데이터 및 예매 테이블 동기화 중...</p>
            </div>
          ) : (
            <>
              {/* Home main performance search list */}
              {activeTab === 'home' && !selectedEventId && (
                <div>
                  <div className="hero-banner" style={{ marginBottom: '2rem' }}>
                    <div className="hero-info">
                      <h2 className="hero-title">올 여름 최고의 뮤지컬!</h2>
                      <p className="hero-desc">인터파크 공식 파트너사 EventHub 특전 할인 적용. 지킬앤하이드 프리미엄 티켓 일반 오픈을 확인하고 지금 즉시 좋은 자리를 예매해보세요.</p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=200&q=80" alt="Musical" className="hero-img" />
                  </div>

                  {/* Autocomplete Search input SEC-145 */}
                  <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="공연명, 출연 아티스트 혹은 기획사 검색..."
                        value={searchKeyword}
                        onFocus={() => setIsAutocompleteOpen(true)}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                      <button className="btn-primary" onClick={() => { setIsAutocompleteOpen(false); showToast('통합 공연 데이터베이스를 연동 검색합니다.'); }}>검색</button>
                    </div>

                    {isAutocompleteOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#18152a', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', marginTop: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-purple)' }}>실시간 공연 검색어 추천 제안</span>
                          <button className="btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }} onClick={() => setIsAutocompleteOpen(false)}>닫기</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.8rem' }}>
                          {suggestionsList.map((sug) => (
                            <span 
                              key={sug.id} 
                              className="tag-btn" 
                              style={{ margin: 0 }} 
                              onClick={() => { setSearchKeyword(sug.keyword); setIsAutocompleteOpen(false); }} 
                              dangerouslySetInnerHTML={{ __html: sug.keyword }} 
                            />
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="신규 검색어 제안 입력..."
                            style={{ padding: '0.4rem' }}
                            value={suggestionInput}
                            onChange={(e) => setSuggestionInput(e.target.value)}
                          />
                          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleSuggestionSubmit}>제안어 추가</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>🎟️ 대형 인기 공연 티켓팅 라인업</h3>
                  <div className="events-grid">
                    {eventsList.map((ev) => (
                      <div key={ev.id} className="event-card" onClick={() => setSelectedEventId(ev.id)}>
                        <img src={ev.image} alt={ev.title} className="event-img" />
                        <div className="event-info">
                          <h4 className="event-name">{ev.title}</h4>
                          <span className="event-price">₩{ev.price.toLocaleString()}</span>
                          <div className="event-meta">
                            <span className="badge-purple">{ev.category}</span>
                            <span>⭐ {ev.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Personal Calendar planner SEC-147 */}
              {activeTab === 'calendar' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🗓️ 예매 공연 일정 캘린더</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    나의 관람 확정일 및 예매 티켓팅 일정을 캘린더 스케줄표에서 한눈에 확인하세요.
                  </p>

                  <div className="card-container" style={{ backgroundColor: 'rgba(255,255,255,0.01)', marginBottom: '1.5rem', borderStyle: 'dashed' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📅 나만의 신규 관람 일정 추가</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      <input
                        type="date"
                        className="form-input"
                        value={calendarDate}
                        onChange={(e) => setCalendarDate(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="공연 일정 내용 타이틀 기입..."
                        value={calendarTitle}
                        onChange={(e) => setCalendarTitle(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleCalendarSubmit}>스케줄 등록</button>
                  </div>

                  {/* Mock Interactive calendar */}
                  <div className="card-container" style={{ marginBottom: '1.5rem' }}>
                    <div className="calendar-grid">
                      <div className="calendar-day-header">일</div>
                      <div className="calendar-day-header">월</div>
                      <div className="calendar-day-header">화</div>
                      <div className="calendar-day-header">수</div>
                      <div className="calendar-day-header">목</div>
                      <div className="calendar-day-header">금</div>
                      <div className="calendar-day-header">토</div>

                      {/* Mock calendar cells for August 2026 */}
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-cell" style={{ opacity: 0.25 }}>
                          <span>{28 + i}</span>
                        </div>
                      ))}
                      {Array.from({ length: 14 }).map((_, i) => {
                        const dayNum = i + 11;
                        const dateStr = `2026-08-${dayNum}`;
                        const matchedEvents = calendarEventsList.filter(c => c.date === dateStr);
                        return (
                          <div key={dayNum} className={`calendar-cell ${matchedEvents.length > 0 ? 'has-event' : ''}`}>
                            <span style={{ fontWeight: 800 }}>{dayNum}</span>
                            {matchedEvents.map((ev, idx) => (
                              <div 
                                key={idx} 
                                className="calendar-event-title" 
                                dangerouslySetInnerHTML={{ __html: ev.title }} 
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: My Tickets and Delivery Memo SEC-143 */}
              {activeTab === 'tickets' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>🎟️ 마이 예매 티켓 보관소</h3>
                  
                  {ticketsList.map((t) => (
                    <div key={t.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.01)', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span className="badge-purple">{t.status}</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--accent-pink)' }}>₩{t.price.toLocaleString()}</strong>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>{t.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>일시: {t.date}</p>
                      
                      {/* SEC-143 Ticket Delivery note form */}
                      <div className="card-container" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderStyle: 'dotted' }}>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-purple)', marginBottom: '0.6rem' }}>📍 종이 티켓 수령을 위한 배송지 메모 관리</h5>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="문 앞 배송 등 요청사항 기입..."
                            value={deliveryInput}
                            onChange={(e) => setDeliveryInput(e.target.value)}
                          />
                          <button className="btn-primary" onClick={handleDeliverySubmit}>메모 저장</button>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                          현재 지정 요청 메모:{' '}
                          <span 
                            dangerouslySetInnerHTML={{ __html: ticketDeliveryNotes.notes }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Friends Invitation sending SEC-142 */}
              {activeTab === 'invite' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💌 동반 친구 초대 포털</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    예매 티켓을 친구에게 모바일 초대장 카드 형태로 전송할 수 있습니다.
                  </p>

                  <div className="card-container" style={{ marginBottom: '2rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>💌 친구 지정 초대장 발송 폼</h4>
                    <div className="form-group">
                      <label className="form-label">동반 수신 친구 이름</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="이름 혹은 연락처"
                        value={inviteReceiver}
                        onChange={(e) => setInviteReceiver(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">초대장 전달 메시지</label>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="공연 관람 전 같이 나눌 메시지를 적어보세요..."
                        value={inviteMsg}
                        onChange={(e) => setInviteMsg(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleInviteSubmit}>초대장 전송</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>최근 초대장 전송 내역</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {invitationsList.map((inv) => (
                      <div key={inv.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#c084fc' }}>수신자: {inv.receiver} 님</strong>
                        <p 
                          style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem' }} 
                          dangerouslySetInnerHTML={{ __html: inv.message }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Cancel and Refund SEC-144 */}
              {activeTab === 'refund' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💸 예매 취소 및 환불 신청서</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    부득이한 사정으로 인해 관람 불가 시, 환불 신청서를 전달하시면 규정에 따라 환불을 승인해 드립니다.
                  </p>

                  <div className="card-container" style={{ marginBottom: '2rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>💸 환불 신청 사유 접수</h4>
                    <div className="form-group">
                      <label className="form-label">예매 취소 사유 코멘트</label>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="환불 규정을 확인하였으며, 취소 사유를 기재해 주세요..."
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleRefundSubmit}>환불 접수</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>나의 접수된 환불 심사 기록</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {refundsList.map((rf) => (
                      <div key={rf.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{rf.eventName}</strong>
                          <span className="badge-purple" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24', borderColor: 'rgba(217, 119, 6, 0.3)' }}>환불심사중</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          사유:{' '}
                          <span dangerouslySetInnerHTML={{ __html: rf.reason }} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Organizer dashboard supporting natural actions */}
              {activeTab === 'dashboard' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>🎫 단체 예매 및 기획 관리 대시보드</h3>
                  
                  {/* SEC-148 Folder Name configuration */}
                  <div className="card-container" style={{ marginBottom: '1.8rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-purple)', marginBottom: '0.8rem' }}>📂 관심 공연 카테고리 폴더명 관리</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="예: 서울권 장르 통계 필터..."
                        value={filterInput}
                        onChange={(e) => setFilterInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleFilterSubmit}>조건 저장</button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      보관 중인 폴더명:{' '}
                      <strong 
                        dangerouslySetInnerHTML={{ __html: reportFilterObj.filterName }} 
                      />
                    </div>
                  </div>

                  {/* SEC-149 Group booking file registration */}
                  <div className="card-container" style={{ marginBottom: '1.8rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📄 단체 예매 신청자 명단 파일 등록</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="업로드할 명단 파일명 기입 (csv/xlsx)..."
                        value={csvFilename}
                        onChange={(e) => setCsvFilename(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleCsvSubmit}>명단 등록</button>
                    </div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>최근 로드된 명단 파일 리스트</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                      {importHistoryList.map((imp) => (
                        <div key={imp.id} style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          파일명:{' '}
                          <strong 
                            dangerouslySetInnerHTML={{ __html: imp.filename }} 
                          />{' '}
                          | 등록일자: {imp.date}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEC-146 Notification management */}
                  <div className="card-container" style={{ marginBottom: '1.8rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📢 긴급 알림 메시지 발송 포털</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="알림 팝업 메시지 제목 기입..."
                        value={notifyTitle}
                        onChange={(e) => setNotifyTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-input form-textarea"
                        placeholder="알림 발송 상세 소식 본문"
                        value={notifyContent}
                        onChange={(e) => setNotifyContent(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleNotifySubmit}>알림 발송</button>
                  </div>

                  {/* SEC-150 Integrated search filters */}
                  <div className="card-container" style={{ border: '1px solid rgba(139,92,246,0.3)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-purple)', marginBottom: '0.6rem' }}>🔍 예매 티켓 및 주문 정보 상세 통합 검색</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                      주문 번호, 공연 코드 혹은 특정 관객 키워드를 기입하여 개별 예매 건을 검색합니다.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="검색할 주문 조건 또는 키워드 입력..."
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleQuerySubmit}>주문 조건 검색</button>
                    </div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>최근 검색한 주문 조건 기록</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                      {queryHistoryList.slice(0, 3).map((qy) => (
                        <div key={qy.id} style={{ padding: '0.6rem', backgroundColor: '#110c22', color: '#c084fc', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          조건:{' '}
                          <span 
                            dangerouslySetInnerHTML={{ __html: qy.query }} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: Basic account detail information info settings */}
              {activeTab === 'my-page' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>⚙️ 나의 예매 계정 및 개인 환경설정</h3>
                  
                  <div className="card-container" style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem' }}>📝 프로필 계정 상세 정보</h4>
                    <div className="form-group">
                      <label className="form-label">계정 닉네임</label>
                      <input type="text" className="form-input" value={profile.name} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">기본 이메일 연락처</label>
                      <input type="text" className="form-input" value={profile.email} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">예매 회원 멤버십 등급</label>
                      <input type="text" className="form-input" value={profile.membership} readOnly />
                    </div>
                    <button className="btn-primary" onClick={() => showToast('회원 프로필 정보 수정을 반영합니다.')}>변경 정보 저장</button>
                  </div>
                </div>
              )}

              {/* Performance detail view panel */}
              {selectedEventId && (() => {
                const item = eventsList.find(e => e.id === selectedEventId);
                if (!item) return <p>공연 정보를 조회할 수 없습니다.</p>;
                return (
                  <div className="detail-view">
                    <button className="btn-outline" style={{ width: 'max-content', marginBottom: '0.5rem' }} onClick={() => setSelectedEventId(null)}>
                      ← 공연 목록으로 돌아가기
                    </button>

                    <img src={item.image} alt={item.title} className="detail-img" />
                    <div>
                      <span className="badge-purple" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{item.category}</span>
                      <h2 className="detail-title">{item.title}</h2>
                      <span className="event-price" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.4rem' }}>₩{item.price.toLocaleString()}</span>
                    </div>

                    <div className="detail-meta">
                      <span>공연 만족도 평점: ⭐ {item.rating} / 5.0</span>
                      <span>•</span>
                      <span>1인 최대 예매 한도: 4매</span>
                    </div>

                    <p className="detail-desc">
                      EventHub 추천 대형 대표 공연입니다. 오감을 자극하는 환상적인 무대 조명과 압도적인 가창력을 지닌 오리지널 캐스팅팀의 하모니를 자랑하며, 관객 만족도 조사에서 압도적인 평점 1위를 기록하고 있는 올 여름 최대의 기대작입니다.
                    </p>

                    <button className="btn-primary" style={{ padding: '1rem', fontSize: '1rem' }} onClick={() => { showToast('티켓 좌석 선점 및 임시 예매 절차가 정상 등록되었습니다. 내 예매 티켓을 확인하세요.'); setActiveTab('tickets'); setSelectedEventId(null); }}>
                      공연 일자 지정 예매하기
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </main>

        {/* Right Info Sidebar (Notices list, notification alarms, quick invite) */}
        <aside className="right-sidebar">
          {/* Points Mileage Board */}
          <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #09070f 100%)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc' }}>나의 티켓 예매 예치금</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>8,500 P</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-pink)' }}>VIP 등급 혜택</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
              다음 등급 상승을 위한 누적 예매 금액: 15만원
            </p>
          </div>

          {/* Quick notifications board SEC-146 */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-purple)' }}>🔔 실시간 알림 목록</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {notificationsList.slice(0, 3).map((n) => (
                <div key={n.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                  <strong 
                    style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }} 
                    dangerouslySetInnerHTML={{ __html: n.title }} 
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-container" style={{ background: 'rgba(139,92,246,0.03)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-purple)', marginBottom: '0.4rem' }}>💡 관람 안전 수칙 공지</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              쾌적하고 평화로운 공연 관람을 위해 티켓 양도 메모 등록 및 동반 관객 초대장 발송 혜택을 이용해주시고, 개인 관람 스케줄은 캘린더 등록 서비스를 활용해 주시기 바랍니다.
            </p>
          </div>
        </aside>

      </div>

      {/* Pop-up System Alert Modal (Triggers on Stored XSS reload) */}
      {securityModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1300 }}>
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">🚨 시스템 보안 검증 알림</span>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>
                입력 데이터 검증 오류 감지: Stored XSS 가능성 식별됨
              </p>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <div><strong>버그 식별 부호 (ID):</strong> <span style={{ color: '#fca5a5', fontWeight: 800 }}>{securityModal.bugId}</span></div>
                <div><strong>보안 인덱스 번호 (CSV):</strong> {securityModal.csvId}</div>
                <div><strong>호출 API 엔드포인트:</strong> <span style={{ fontFamily: 'monospace' }}>{securityModal.endpoint}</span></div>
                <div><strong>인수 매개변수:</strong> <span style={{ fontFamily: 'monospace' }}>{securityModal.parameter}</span></div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
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
