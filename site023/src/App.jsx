import React, { useState, useEffect } from 'react';

export default function App() {
  // Session State
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return 'sess_showpass_' + Math.random().toString(36).substring(2, 15);
  });
  const [sessionInfo, setSessionInfo] = useState(null);

  // Authentication State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Data Lists
  const [movies, setMovies] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [seats, setSeats] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  // Selected detail cards
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedPerf, setSelectedPerf] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState('');

  // Feature Form inputs
  const [tagInput, setTagInput] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [memoInput, setMemoInput] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [notifInput, setNotifInput] = useState('');
  const [calendarInput, setCalendarInput] = useState({ title: '', date: '' });
  const [csvInput, setCsvInput] = useState('');
  const [apiQueryInput, setApiQueryInput] = useState('');
  const [supportInput, setSupportInput] = useState({ title: '', message: '' });
  const [reviewInput, setReviewInput] = useState({ target: '인셉션: 드림스케이프', rating: '5', comment: '' });

  // UI States
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'performances', 'support', 'mypage'
  const [myPageSubTab, setMyPageSubTab] = useState('bookings'); // 'bookings', 'tags', 'invitations', 'memos', 'refunds', 'notifications', 'calendar', 'reports', 'csv', 'query'
  const [toasts, setToasts] = useState([]);

  // Custom fetch wrapper
  const customFetch = (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-Session-ID': currentSessionId
    };
    return fetch(url, { ...options, headers })
      .then(res => {
        const sessionHeader = res.headers.get('X-Session-ID');
        if (sessionHeader && sessionHeader !== currentSessionId) {
          setCurrentSessionId(sessionHeader);
        }
        return res;
      });
  };

  // Toast Helper
  const showToast = (title, message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000);
  };

  // Load States
  useEffect(() => {
    loadSession();
    loadMovies();
    loadPerformances();
    loadCalendar();
    loadBookings();
    loadReviews();
    loadSeats();
  }, [currentSessionId]);

  const loadSession = () => {
    customFetch('/api/session')
      .then(res => res.json())
      .then(data => {
        setSessionInfo(data);
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {});
  };

  const loadMovies = () => {
    customFetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data));
  };

  const loadPerformances = () => {
    customFetch('/api/performances')
      .then(res => res.json())
      .then(data => setPerformances(data));
  };

  const loadCalendar = () => {
    customFetch('/api/calendar')
      .then(res => res.json())
      .then(data => setCalendar(data));
  };

  const loadBookings = () => {
    customFetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data));
  };

  const loadReviews = () => {
    customFetch('/api/reviews')
      .then(res => res.json())
      .then(data => setReviews(data));
  };

  const loadSeats = () => {
    customFetch('/api/seats')
      .then(res => res.json())
      .then(data => setSeats(data));
  };

  // Enforce Login Guard
  const checkLogin = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      showToast('로그인 필요', '원활한 예매 및 일정 관리를 위해 회원 로그인을 진행해주십시오.', false);
      return false;
    }
    return true;
  };

  // Search Suggestions (SEC-235)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    customFetch(`/api/search/suggestions?q=${encodeURIComponent(val)}`)
      .then(res => res.json())
      .then(data => {
        setSuggestions(data);
        showToast('검색 제안 매핑 (식별코드: SEC-235)', '사용자 입력 조건의 영화/공연 검색 힌트 정보가 반환되었습니다.', true);
        loadSession();
      });
  };

  // Tags Submit (SEC-231)
  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ tag: tagInput })
    })
      .then(res => res.json())
      .then(() => {
        showToast('태그 입력 완료 (식별코드: SEC-231)', '등록하신 개인 커스텀 태그가 세션 정보에 반영되었습니다.', true);
        setTagInput('');
        loadSession();
      });
  };

  // Invitations Submit (SEC-232)
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ message: inviteInput })
    })
      .then(res => res.json())
      .then(() => {
        showToast('초대장 발송 마킹 (식별코드: SEC-232)', '지인 초대 메시지 전송 명세서 매핑이 완수되었습니다.', true);
        setInviteInput('');
        loadSession();
      });
  };

  // Booking Memo (SEC-233)
  const handleMemoSubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch('/api/booking/memo', {
      method: 'POST',
      body: JSON.stringify({ memo: memoInput })
    })
      .then(res => res.json())
      .then(() => {
        showToast('배송 메모 설정 (식별코드: SEC-233)', '예약 티켓 현장 수령 배송 추가 메모가 저장되었습니다.', true);
        setMemoInput('');
        loadSession();
      });
  };

  // Refunds Submit (SEC-234)
  const handleRefundSubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch('/api/refunds', {
      method: 'POST',
      body: JSON.stringify({ reason: refundReason })
    })
      .then(res => res.json())
      .then(() => {
        showToast('환불 청구 접수 (식별코드: SEC-234)', '티켓 환불 사유 분석 신청서 접수가 완료되었습니다.', true);
        setRefundReason('');
        loadSession();
      });
  };

  // Notifications Submit (SEC-236)
  const handleNotifSubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ title: notifInput })
    })
      .then(res => res.json())
      .then(() => {
        showToast('알림 규정 매핑 (식별코드: SEC-236)', '새로운 커스텀 이벤트 알림 등록이 완료되었습니다.', true);
        setNotifInput('');
        loadSession();
      });
  };

  // Calendar Submit (SEC-237)
  const handleCalendarSubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(calendarInput)
    })
      .then(res => res.json())
      .then(() => {
        showToast('캘린더 일정 추가 (식별코드: SEC-237)', '일정 관리 스케줄표에 신규 날짜가 예약되었습니다.', true);
        setCalendarInput({ title: '', date: '' });
        loadCalendar();
        loadSession();
      });
  };

  // Reports Filter (SEC-238)
  const handleTriggerReport = () => {
    if (!checkLogin()) return;
    customFetch('/api/reports')
      .then(res => res.json())
      .then(() => {
        showToast('리포트 분석 갱신 (식별코드: SEC-238)', '예매 매출 총액 및 세부 통계 리포트가 렌더링되었습니다.', true);
        loadSession();
      });
  };

  // CSV Upload (SEC-239)
  const handleCsvSubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch('/api/reports/csv', {
      method: 'POST',
      body: JSON.stringify({ csvText: csvInput })
    })
      .then(res => res.json())
      .then(() => {
        showToast('CSV 데이터 해석 (식별코드: SEC-239)', '업로드한 예매 이력 로컬 CSV 데이터 분석이 처리되었습니다.', true);
        setCsvInput('');
        loadSession();
      });
  };

  // API Query Console (SEC-240)
  const handleApiQuerySubmit = (e) => {
    e.preventDefault();
    if (!checkLogin()) return;
    customFetch(`/api/query?q=${encodeURIComponent(apiQueryInput)}`)
      .then(res => res.json())
      .then(() => {
        showToast('쿼리 수행 성공 (식별코드: SEC-240)', 'DB 원격 데이터 조회를 위한 쿼리가 완수되었습니다.', true);
        setApiQueryInput('');
        loadSession();
      });
  };

  // Submit Support
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/support', {
      method: 'POST',
      body: JSON.stringify(supportInput)
    })
      .then(res => res.json())
      .then(() => {
        showToast('문의 등록 완료', '1:1 고객 문의 내역이 관리자 상담 센터에 저장되었습니다.');
        setSupportInput({ title: '', message: '' });
      });
  };

  // Submit Review
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewInput)
    })
      .then(res => res.json())
      .then(() => {
        showToast('후기 피드백 등록', '작성하신 후기 관람 평점이 게시판에 기재되었습니다.');
        setReviewInput({ target: '인셉션: 드림스케이프', rating: '5', comment: '' });
        loadReviews();
      });
  };

  // Auth Handling (Login / Register)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    customFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email: authForm.email, password: authForm.password, name: authForm.name })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '인증 실패');
        return data;
      })
      .then(data => {
        setUser(data.user);
        setShowAuthModal(false);
        setAuthForm({ name: '', email: '', password: '' });

        const rotated = data.sessionId !== currentSessionId;
        if (!rotated) {
          // Identify which bug was triggered to display the correct SEC identifier
          let secId = 'SEC-231';
          if (sessionInfo?.details.actionTags) secId = 'SEC-231';
          else if (sessionInfo?.details.actionInvitations) secId = 'SEC-232';
          else if (sessionInfo?.details.actionBookingMemo) secId = 'SEC-233';
          else if (sessionInfo?.details.actionRefunds) secId = 'SEC-234';
          else if (sessionInfo?.details.actionSuggestions) secId = 'SEC-235';
          else if (sessionInfo?.details.actionNotifications) secId = 'SEC-236';
          else if (sessionInfo?.details.actionCalendar) secId = 'SEC-237';
          else if (sessionInfo?.details.actionReports) secId = 'SEC-238';
          else if (sessionInfo?.details.actionCsv) secId = 'SEC-239';
          else if (sessionInfo?.details.actionQuery) secId = 'SEC-240';

          showToast(
            `인증 상태 설정 완료 (식별코드: ${secId})`, 
            '로그인 세션이 매핑되었으나, 새로운 보안 토큰 회전 과정이 누락되었습니다.', 
            true
          );
        } else {
          showToast('인증 완료', `${data.user.name} 회원님으로 로그인되었습니다.`);
        }
        setCurrentSessionId(data.sessionId);
      })
      .catch(err => showToast('로그인 실패', err.message, false));
  };

  // Perform Book Ticket action
  const handleBookTicket = (title, type, price) => {
    if (!checkLogin()) return;
    if (!selectedSeat) {
      showToast('좌석 미선택', '예매하실 좌석을 먼저 지정해주십시오.', false);
      return;
    }
    customFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ type, title, price, date: '2026-10-15' })
    })
      .then(res => res.json())
      .then(() => {
        loadBookings();
        setSelectedMovie(null);
        setSelectedPerf(null);
        setSelectedSeat('');
        showToast('티켓 예약 접수', '임시 예매 예약 번호가 발송되었습니다. 마이페이지에서 확인하십시오.');
      });
  };

  // Pay Ticket action
  const handlePayTicket = (bookingId) => {
    if (!checkLogin()) return;
    customFetch('/api/payment', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    })
      .then(res => res.json())
      .then(() => {
        loadBookings();
        showToast('티켓 결제 승인', '주문 금액이 완납 처리되어 좌석 번호 배정이 완료되었습니다.');
      });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentSessionId('sess_showpass_' + Math.random().toString(36).substring(2, 15));
    showToast('로그아웃', '보안 로그아웃이 완료되었습니다.');
  };

  return (
    <div className="app-container">
      {/* Toast Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={t.isError ? 'toast error' : 'toast'}>
            <strong style={{ display: 'block' }}>{t.title}</strong>
            <span style={{ fontSize: '0.85rem' }}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <a href="#" className="logo" onClick={() => { setActiveTab('home'); setSelectedMovie(null); setSelectedPerf(null); }}>
          🎭 Show<span>Pass</span>
        </a>

        <nav className="header-nav">
          <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedMovie(null); setSelectedPerf(null); }}>영화 정보</a>
          <a href="#" className={`nav-link ${activeTab === 'performances' ? 'active' : ''}`} onClick={() => { setActiveTab('performances'); setSelectedMovie(null); setSelectedPerf(null); }}>공연 & 콘서트</a>
          <a href="#" className={`nav-link ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setActiveTab('support'); setSelectedMovie(null); setSelectedPerf(null); }}>1:1 고객센터</a>
          {user && (
            <a href="#" className={`nav-link ${activeTab === 'mypage' ? 'active' : ''}`} onClick={() => { setActiveTab('mypage'); setMyPageSubTab('bookings'); }}>마이페이지</a>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>👤 {user.name} 회원님</span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <button className="btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>로그인 / 가입</button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'home' && !selectedMovie && !selectedPerf && (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <h1>당신을 매료할 단 하나의 스테이지</h1>
            <p>ShowPass와 함께 엄선된 고화질 인기 영화 정보 조회 및 예술의 전당 명품 공연을 간편하게 사전 예약해 보십시오.</p>
            
            <div className="search-container">
              <div className="search-box">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="예: 인셉션, 라라랜드 또는 콘서트 명칭 입력..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button className="btn" style={{ borderRadius: '0 12px 12px 0', height: '48px' }}>검색</button>
              </div>

              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((s, idx) => (
                    <div 
                      key={idx} 
                      className="suggestion-item"
                      onClick={() => { setSearchQuery(s); setSuggestions([]); }}
                    >
                      🔍 {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <main className="main-content">
            {/* Movie Section */}
            <section>
              <h2 className="section-title">현재 박스오피스 추천 영화</h2>
              <div className="cards-grid">
                {movies.map(m => (
                  <div key={m.id} className="card">
                    <div className="card-image" style={{ backgroundImage: `url(${m.image})` }} />
                    <div className="card-body">
                      <h3>{m.title}</h3>
                      <p>{m.desc}</p>
                      <div className="card-footer">
                        <span style={{ fontWeight: 600, color: 'var(--color-coral)' }}>⭐ {m.rating}</span>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--color-purple-medium)', borderColor: 'var(--color-purple-medium)' }} onClick={() => setSelectedMovie(m)}>상세 & 예매</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* Performance Section */}
      {activeTab === 'performances' && !selectedMovie && !selectedPerf && (
        <main className="main-content">
          <section>
            <h2 className="section-title">인기 라이브 공연 / 콘서트</h2>
            <div className="cards-grid">
              {performances.map(p => (
                <div key={p.id} className="card">
                  <div className="card-image" style={{ backgroundImage: `url(${p.image})` }} />
                  <div className="card-body">
                    <h3>{p.title}</h3>
                    <p>📍 {p.location} | 📅 {p.date}</p>
                    <div className="card-footer">
                      <span className="card-price" style={{ fontWeight: 700, color: 'var(--color-coral)' }}>{p.price.toLocaleString()}원</span>
                      <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setSelectedPerf(p)}>상세 & 예매</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* Movie Details Page */}
      {selectedMovie && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h2>🎬 {selectedMovie.title}</h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <img src={selectedMovie.image} alt={selectedMovie.title} style={{ width: '200px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p><strong>장르:</strong> {selectedMovie.genre} | <strong>러닝타임:</strong> {selectedMovie.duration}분</p>
                  <p><strong>출연진:</strong> {selectedMovie.casts}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{selectedMovie.desc}</p>
                </div>
              </div>

              {/* Seat reservation */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <h3>💺 상영 좌석 선택</h3>
                <div className="seat-map-grid">
                  {seats.map(s => (
                    <button 
                      key={s.id} 
                      className={`seat-btn ${s.reserved ? 'reserved' : ''} ${selectedSeat === s.id ? 'selected' : ''}`}
                      disabled={s.reserved}
                      onClick={() => setSelectedSeat(s.id)}
                    >
                      {s.id} {s.reserved ? '(예약됨)' : ''}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>선택 좌석: {selectedSeat || '미지정'}</span>
                  <button className="btn" style={{ display: 'block', marginTop: '1rem' }} onClick={() => handleBookTicket(selectedMovie.title, 'Movie', 14000)}>영화 예매 신청</button>
                </div>
              </div>
            </div>

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>영화 설명 피드백</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>본 정보는 공식 배급사 연동 데이터입니다.</p>
              <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--color-text-dark)' }} onClick={() => setSelectedMovie(null)}>뒤로 가기</button>
            </div>
          </div>
        </main>
      )}

      {/* Performance Details Page */}
      {selectedPerf && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h2>🎺 {selectedPerf.title}</h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <img src={selectedPerf.image} alt={selectedPerf.title} style={{ width: '200px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p><strong>공연일:</strong> {selectedPerf.date} | <strong>위치:</strong> {selectedPerf.location}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{selectedPerf.desc}</p>
                </div>
              </div>

              {/* Seat reservation */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <h3>💺 라이브 홀 지정 좌석</h3>
                <div className="seat-map-grid">
                  {seats.map(s => (
                    <button 
                      key={s.id} 
                      className={`seat-btn ${s.reserved ? 'reserved' : ''} ${selectedSeat === s.id ? 'selected' : ''}`}
                      disabled={s.reserved}
                      onClick={() => setSelectedSeat(s.id)}
                    >
                      {s.id} {s.reserved ? '(점유)' : ''}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>지정 좌석: {selectedSeat || '미지정'}</span>
                  <button className="btn" style={{ display: 'block', marginTop: '1rem' }} onClick={() => handleBookTicket(selectedPerf.title, 'Performance', selectedPerf.price)}>공연 티켓 예매 신청</button>
                </div>
              </div>
            </div>

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>공연 예매 안내</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>공연 예매는 1인 최대 4매까지 가능하며, 취소 수수료 조항을 확인하십시오.</p>
              <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--color-text-dark)' }} onClick={() => setSelectedPerf(null)}>뒤로 가기</button>
            </div>
          </div>
        </main>
      )}

      {/* Support Page */}
      {activeTab === 'support' && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h3>📧 1:1 고객지원 예매 관련 특별 상담실</h3>
              <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>상담 제목</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 예매 변경 규정 문의" 
                    value={supportInput.title}
                    onChange={(e) => setSupportInput({ ...supportInput, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>세부 문의 내역</label>
                  <textarea 
                    className="form-input" 
                    rows={4} 
                    placeholder="문의하실 상세 사유를 입력하십시오." 
                    value={supportInput.message}
                    onChange={(e) => setSupportInput({ ...supportInput, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>상담 발송</button>
              </form>
            </div>

            <div className="panel-card">
              <h3>💬 한줄평 관람 평점 등록</h3>
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>관람작 대상</label>
                  <select 
                    className="form-input" 
                    value={reviewInput.target}
                    onChange={(e) => setReviewInput({ ...reviewInput, target: e.target.value })}
                  >
                    <option value="인셉션: 드림스케이프">인셉션: 드림스케이프</option>
                    <option value="라라랜드: 별들의 노래">라라랜드: 별들의 노래</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>별점</label>
                  <select 
                    className="form-input" 
                    value={reviewInput.rating}
                    onChange={(e) => setReviewInput({ ...reviewInput, rating: e.target.value })}
                  >
                    <option value="5">★★★★★</option>
                    <option value="4">★★★★☆</option>
                    <option value="3">★★★☆☆</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>관람 코멘트</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="작품에 대한 한줄평을 남겨주십시오." 
                    value={reviewInput.comment}
                    onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn">리뷰 기재</button>
              </form>

              <div style={{ marginTop: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                <h4>최근 실시간 관람평</h4>
                {reviews.map((r, idx) => (
                  <div key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-gray-border)', fontSize: '0.85rem' }}>
                    <strong>{r.user}</strong> ({'★'.repeat(r.rating)}) - <span>{r.target}</span><br />
                    <span>{r.comment}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* My Page */}
      {activeTab === 'mypage' && (
        <main className="main-content">
          <div className="dashboard-layout">
            
            {/* Sidebar navigation */}
            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>마이페이지 스페이스</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className={`btn ${myPageSubTab === 'bookings' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'bookings' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('bookings')}>🎟️ 예매 내역 및 결제</button>
                <button className={`btn ${myPageSubTab === 'tags' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'tags' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('tags')}>🏷️ 태그 관리</button>
                <button className={`btn ${myPageSubTab === 'invitations' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'invitations' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('invitations')}>✉️ 모바일 초대 메시지</button>
                <button className={`btn ${myPageSubTab === 'memos' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'memos' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('memos')}>📝 수령 배송 메모</button>
                <button className={`btn ${myPageSubTab === 'refunds' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'refunds' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('refunds')}>💸 예매 환불 청구</button>
                <button className={`btn ${myPageSubTab === 'notifications' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'notifications' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('notifications')}>🔔 알림 알람 규칙</button>
                <button className={`btn ${myPageSubTab === 'calendar' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'calendar' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('calendar')}>📅 관람 캘린더 일정</button>
                <button className={`btn ${myPageSubTab === 'reports' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'reports' ? '#fff' : '#000' }} onClick={() => { setMyPageSubTab('reports'); handleTriggerReport(); }}>📊 지출 통계 리포트</button>
                <button className={`btn ${myPageSubTab === 'csv' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'csv' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('csv')}>📁 백업 CSV 업로드</button>
                <button className={`btn ${myPageSubTab === 'query' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'query' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('query')}>💻 API Query 콘솔</button>
              </div>
            </div>

            {/* Dashboard panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* Bookings */}
              {myPageSubTab === 'bookings' && (
                <div className="panel-card">
                  <h3>🎟️ 나의 최근 티켓 예매 조회</h3>
                  {bookings.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>최근 30일 이내에 예매하신 영화나 공연 티켓 정보가 없습니다.</p>
                  ) : (
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>예매 코드</th>
                          <th>구분</th>
                          <th>작품 및 공연명</th>
                          <th>금액</th>
                          <th>상태</th>
                          <th>결제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.id}>
                            <td><code>{b.id}</code></td>
                            <td>{b.type}</td>
                            <td>{b.title}</td>
                            <td>{b.price.toLocaleString()}원</td>
                            <td style={{ color: b.status === '결제 완료' ? 'green' : 'orange', fontWeight: 600 }}>{b.status}</td>
                            <td>
                              {b.status === '결제 대기' && (
                                <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handlePayTicket(b.id)}>결제</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tags (SEC-231) */}
              {myPageSubTab === 'tags' && (
                <div className="panel-card">
                  <h3>🏷️ 커스텀 선호 태그 등록</h3>
                  <form onSubmit={handleTagSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: SF영화선호, 클래식매니아" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">태그 기입</button>
                  </form>
                </div>
              )}

              {/* Invitations (SEC-232) */}
              {myPageSubTab === 'invitations' && (
                <div className="panel-card">
                  <h3>✉️ 지인 모바일 동반 관람 초대장 발송</h3>
                  <form onSubmit={handleInviteSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: 이번 주말 쇼팽 리사이틀 대극장 관람 초대합니다." 
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">초대 마킹</button>
                  </form>
                </div>
              )}

              {/* Memos (SEC-233) */}
              {myPageSubTab === 'memos' && (
                <div className="panel-card">
                  <h3>📝 티켓 수령처 및 현장 수령 추가 메모</h3>
                  <form onSubmit={handleMemoSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: A열 휠체어석 접근 보조 요원 대기 신청" 
                        value={memoInput}
                        onChange={(e) => setMemoInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">메모 저장</button>
                  </form>
                </div>
              )}

              {/* Refunds (SEC-234) */}
              {myPageSubTab === 'refunds' && (
                <div className="panel-card">
                  <h3>💸 티켓 예매 환불 청구 사유서</h3>
                  <form onSubmit={handleRefundSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="상세 환불 사유를 적어주십시오." 
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">신청서 발송</button>
                  </form>
                </div>
              )}

              {/* Notifications (SEC-236) */}
              {myPageSubTab === 'notifications' && (
                <div className="panel-card">
                  <h3>🔔 신규 알림 규칙 등록</h3>
                  <form onSubmit={handleNotifSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: 예매 확정 즉시 카카오톡 문자 전송" 
                        value={notifInput}
                        onChange={(e) => setNotifInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">알림 마킹</button>
                  </form>
                </div>
              )}

              {/* Calendar (SEC-237) */}
              {myPageSubTab === 'calendar' && (
                <div className="panel-card">
                  <h3>📅 개인 관람 일정 캘린더 스케줄링</h3>
                  <form onSubmit={handleCalendarSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>일정 제목</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: 라라랜드 예매 관람" 
                        value={calendarInput.title}
                        onChange={(e) => setCalendarInput({ ...calendarInput, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ width: '150px' }}>
                      <label>날짜</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={calendarInput.date}
                        onChange={(e) => setCalendarInput({ ...calendarInput, date: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">스케줄러 등록</button>
                  </form>

                  <div style={{ marginTop: '1rem' }}>
                    {calendar.map((c, idx) => (
                      <div key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-gray-border)' }}>
                        📅 <strong>{c.date}</strong> - {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports (SEC-238) */}
              {myPageSubTab === 'reports' && (
                <div className="panel-card">
                  <h3>📊 예매 지출 명세 분석 리포트</h3>
                  <p>총 누적 예매 수: <strong>{bookings.length}건</strong></p>
                  <p>총 지출 누계: <strong>{bookings.reduce((sum, b) => sum + b.price, 0).toLocaleString()}원</strong></p>
                </div>
              )}

              {/* CSV Upload (SEC-239) */}
              {myPageSubTab === 'csv' && (
                <div className="panel-card">
                  <h3>📁 예매 백업 CSV 데이터 해석 업로드</h3>
                  <form onSubmit={handleCsvSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div className="form-group">
                      <textarea 
                        className="form-input" 
                        rows={4} 
                        placeholder="예: date,title,price&#10;2026-10-15,인셉션,14000" 
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>CSV 데이터 주입</button>
                  </form>
                </div>
              )}

              {/* API Query Console (SEC-240) */}
              {myPageSubTab === 'query' && (
                <div className="panel-card">
                  <h3>💻 원격 REST API Query 콘솔</h3>
                  <form onSubmit={handleApiQuerySubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: SELECT * FROM bookings WHERE status = '결제완료'" 
                        value={apiQueryInput}
                        onChange={(e) => setApiQueryInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">쿼리 발송</button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </main>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'ShowPass 계정 로그인' : '신규 회원 가입'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleAuthSubmit}>
              <div className="modal-body">
                {authMode === 'register' && (
                  <div className="form-group">
                    <label>성명</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>이메일 아이디 (로그인 테스트용: user@example.com)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>비밀번호 (비밀번호: password123)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>

                {authMode === 'login' ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    처음 이용하시나요? <span style={{ color: 'var(--color-coral)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('register')}>회원 가입하기</span>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    이미 가입하셨나요? <span style={{ color: 'var(--color-coral)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('login')}>로그인하기</span>
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn">{authMode === 'login' ? '로그인' : '가입 완료'}</button>
                <button type="button" className="btn btn-secondary" style={{ color: '#000' }} onClick={() => setShowAuthModal(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-purple-dark)', color: '#a1a1aa', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', marginTop: 'auto' }}>
        <p>© 2026 ShowPass Entertainment Inc. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>본 플랫폼은 강화학습 PPO 에이전트의 세션 로테이션 관리 취약성(Session Fixation) 분석 검증을 위한 모의 예매 사이트입니다.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>접속 세션키: {currentSessionId}</p>
      </footer>
    </div>
  );
}
