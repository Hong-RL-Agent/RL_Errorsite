import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication State
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('site026_token') || 'token_class_demo_session_9925';
  });
  const [user, setUser] = useState({ email: 'user@example.com', name: '김코딩강사' });

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Data States
  const [classes, setClasses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // ALL, POPULAR, NEW, RECOMMENDED
  const [wishlist, setWishlist] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Selected Detail Card
  const [selectedClass, setSelectedClass] = useState(null);

  // Form Inputs
  const [tagInput, setTagInput] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [memoInput, setMemoInput] = useState('');
  const [refundInput, setRefundInput] = useState('');
  const [notifTitleInput, setNotifTitleInput] = useState('');
  const [calendarInput, setCalendarInput] = useState({ title: '', date: '' });
  const [reportFilter, setReportFilter] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [csvInput, setCsvInput] = useState('');
  const [apiQueryInput, setApiQueryInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [reviewInput, setReviewInput] = useState({ rating: '5', comment: '' });

  // Navigation & Toasts
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'mypage', 'support'
  const [myPageSubTab, setMyPageSubTab] = useState('enrollments'); // 'enrollments', 'wishlist', 'schedule', 'report', 'csv', 'query', 'profile'
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper fetch wrapper
  const apiFetch = (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken ? { 'X-Auth-Token': authToken } : {}),
      ...options.headers
    };
    return fetch(url, { ...options, headers });
  };

  // Toast Alert Helper
  const showToast = (title, message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Load Session & Initial Data
  useEffect(() => {
    loadSession();
    loadClasses();
    if (authToken) {
      loadUserData();
    }
  }, [authToken]);

  const loadSession = () => {
    apiFetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {});
  };

  const loadClasses = () => {
    setLoading(true);
    apiFetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClasses(data);
      })
      .finally(() => setLoading(false));
  };

  const loadUserData = () => {
    apiFetch('/api/enrollments')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEnrollments(data); })
      .catch(() => {});

    apiFetch('/api/wishlist')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setWishlist(data); })
      .catch(() => {});

    apiFetch('/api/calendar')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCalendarItems(data); })
      .catch(() => {});

    apiFetch('/api/chat')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setChatMessages(data); })
      .catch(() => {});
  };

  const loadClassReviews = (classId) => {
    apiFetch(`/api/reviews?classId=${classId}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setReviews(data); })
      .catch(() => {});
  };

  // Login Check
  const checkLogin = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      showToast('인증 필요', '서비스를 이용하시려면 먼저 로그인해주십시오.', false);
      return false;
    }
    return true;
  };

  // Search Suggestions (SEC-265)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    apiFetch(`/api/search/suggestions?q=${encodeURIComponent(val)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSuggestions(data);
      })
      .catch(() => {});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    apiFetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClasses(data);
      });
  };

  // SEC-261: Tag Submission
  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    apiFetch('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ tag: tagInput.trim() })
    })
      .then(res => res.json())
      .then(() => {
        showToast('관심 태그 저장', `'${tagInput}' 태그가 프로필 선호 목록에 설정되었습니다.`);
        setTagInput('');
      })
      .catch(() => showToast('오류', '태그 저장 중 오류가 발생했습니다.', true));
  };

  // SEC-262: Invitation Message
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    apiFetch('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ message: inviteInput.trim() })
    })
      .then(res => res.json())
      .then(() => {
        showToast('초대장 발송', '동반 수강 체험 초대장이 전송되었습니다.');
        setInviteInput('');
      })
      .catch(() => showToast('오류', '초대장 전송 실패', true));
  };

  // SEC-263: Shipping Memo
  const handleShippingMemoSubmit = (e) => {
    e.preventDefault();
    if (!memoInput.trim()) return;
    apiFetch('/api/shipping/memo', {
      method: 'POST',
      body: JSON.stringify({ memo: memoInput.trim() })
    })
      .then(res => res.json())
      .then(() => {
        showToast('배송 메모 저장', '준비물 키트 배송 요청사항이 반영되었습니다.');
        setMemoInput('');
      })
      .catch(() => showToast('오류', '메모 저장 실패', true));
  };

  // SEC-264: Refund Reason
  const handleRefundSubmit = (e) => {
    e.preventDefault();
    if (!refundInput.trim()) return;
    apiFetch('/api/refunds/reason', {
      method: 'POST',
      body: JSON.stringify({ reason: refundInput.trim() })
    })
      .then(res => res.json())
      .then(() => {
        showToast('환불 접수 완료', '수강 철회 청구서가 담당 부서로 접수되었습니다.');
        setRefundInput('');
      })
      .catch(() => showToast('오류', '환불 접수 실패', true));
  };

  // SEC-266: Notification Title
  const handleNotifTitleSubmit = (e) => {
    e.preventDefault();
    if (!notifTitleInput.trim()) return;
    apiFetch('/api/notifications/title', {
      method: 'POST',
      body: JSON.stringify({ title: notifTitleInput.trim() })
    })
      .then(res => res.json())
      .then(() => {
        showToast('알림 규칙 갱신', '수강 알림 메시지 머리글 설정이 저장되었습니다.');
        setNotifTitleInput('');
      })
      .catch(() => showToast('오류', '설정 반영 실패', true));
  };

  // SEC-267: Calendar Schedule Title
  const handleCalendarSubmit = (e) => {
    e.preventDefault();
    if (!calendarInput.title.trim()) return;
    apiFetch('/api/calendar/title', {
      method: 'POST',
      body: JSON.stringify({ title: calendarInput.title, date: calendarInput.date || '2026-08-30' })
    })
      .then(res => res.json())
      .then(item => {
        setCalendarItems(prev => [...prev, item]);
        showToast('일정 등록', '나의 수강 캘린더에 학습 일정이 반영되었습니다.');
        setCalendarInput({ title: '', date: '' });
      })
      .catch(() => showToast('오류', '일정 등록 실패', true));
  };

  // SEC-268: Learning Report Filter
  const fetchLearningReport = (val) => {
    setReportFilter(val);
    apiFetch(`/api/learning/report?filter=${val}`)
      .then(res => res.json())
      .then(data => setReportData(data))
      .catch(() => {});
  };

  // SEC-269: CSV Progress Upload
  const handleCsvSubmit = (e) => {
    e.preventDefault();
    if (!csvInput.trim()) return;
    apiFetch('/api/learning/csv', {
      method: 'POST',
      body: JSON.stringify({ csvText: csvInput })
    })
      .then(res => res.json())
      .then(data => {
        showToast('진도 백업 완료', `총 ${data.count}행의 학습 진도 기록이 로드되었습니다.`);
        setCsvInput('');
      })
      .catch(() => showToast('오류', 'CSV 업로드 실패', true));
  };

  // SEC-270: REST API Query
  const handleApiQuerySubmit = (e) => {
    e.preventDefault();
    apiFetch(`/api/classes/query?q=${encodeURIComponent(apiQueryInput)}`)
      .then(res => res.json())
      .then(data => {
        showToast('REST 쿼리 성공', `결과 레코드 ${Array.isArray(data) ? data.length : 1}건이 조회되었습니다.`);
        setApiQueryInput('');
      })
      .catch(() => showToast('오류', '쿼리 실행 실패', true));
  };

  // Enroll Action
  const handleEnrollClass = (prod) => {
    if (!checkLogin()) return;
    apiFetch('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({ classId: prod.id })
    })
      .then(res => res.json())
      .then(item => {
        setEnrollments(prev => [...prev, item]);
        setSelectedClass(null);
        showToast('수강 신청 완료', `${prod.title} 수강 신청이 완료되었습니다.`);
      });
  };

  // Wishlist Action
  const handleAddWish = (classId) => {
    if (!checkLogin()) return;
    apiFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ classId })
    })
      .then(res => res.json())
      .then(list => {
        if (Array.isArray(list)) setWishlist(list);
        showToast('찜 보관함', '수강 관심 목록에 등록되었습니다.');
      });
  };

  // Chat Action
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const textToSend = chatInput.trim();
    setChatInput('');
    apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ text: textToSend })
    })
      .then(res => res.json())
      .then(() => {
        apiFetch('/api/chat')
          .then(r => r.json())
          .then(msgs => setChatMessages(msgs));
      });
  };

  // Review Action
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        classId: selectedClass.id,
        rating: reviewInput.rating,
        comment: reviewInput.comment
      })
    })
      .then(res => res.json())
      .then(() => {
        showToast('수강 후기 저장', '작성하신 클래스 후기가 등록되었습니다.');
        setReviewInput({ rating: '5', comment: '' });
        loadClassReviews(selectedClass.id);
      });
  };

  // Login / Register Submit
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email: authForm.email, password: authForm.password, name: authForm.name })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '인증 실패');
        return data;
      })
      .then(data => {
        setAuthToken(data.token);
        localStorage.setItem('site026_token', data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast('로그인 성공', `${data.user.name} 회원님, 반갑습니다!`);
      })
      .catch(err => showToast('로그인 실패', err.message, true));
  };

  // Logout Action
  const handleLogout = () => {
    apiFetch('/api/logout', { method: 'POST' })
      .finally(() => {
        setUser(null);
        setAuthToken('');
        localStorage.removeItem('site026_token');
        showToast('로그아웃', '정상적으로 로그아웃되었습니다.');
      });
  };

  // Category Filtered Classes
  const filteredClasses = classes.filter(c => {
    const matchCat = activeCategory === '전체' || c.category === activeCategory;
    const matchTag = activeTabFilter === 'ALL' || c.tag === activeTabFilter;
    return matchCat && matchTag;
  });

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={t.isError ? 'toast error' : 'toast'}>
            <strong>{t.title}</strong>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main App Header */}
      <header className="app-header">
        <a href="#" className="logo" onClick={() => { setActiveTab('home'); setSelectedClass(null); }}>
          🎓 Class<span>Pass</span>
        </a>

        <nav className="header-nav">
          <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedClass(null); }}>클래스 탐색</a>
          <a href="#" className={`nav-link ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setActiveTab('support'); setSelectedClass(null); }}>1:1 수강 멘토링</a>
          {user && (
            <a href="#" className={`nav-link ${activeTab === 'mypage' ? 'active' : ''}`} onClick={() => { setActiveTab('mypage'); setMyPageSubTab('enrollments'); }}>나의 강의실</a>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-warm-white)' }}>
                👤 {user.name} 님
              </span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button className="btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
              로그인 / 회원가입
            </button>
          )}
        </div>
      </header>

      {/* HOME PAGE: Hero & Class Explorer */}
      {activeTab === 'home' && !selectedClass && (
        <>
          <section className="hero-section">
            <h1>매일 더 넓어지는 배움의 즐거움</h1>
            <p>취미 미술, 홈 바리스타, 전문 코딩 기초 및 수공예 클래스까지 크리에이터와 함께하는 온라인 취미 배움터</p>

            <form onSubmit={handleSearchSubmit} className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="배우고 싶은 취미, 클래스 제목, 강사 이름을 입력해보세요..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="btn" style={{ borderRadius: '0 12px 12px 0', height: '48px', minWidth: '90px' }}>
                  검색
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className="suggestion-item"
                      onClick={() => {
                        setSearchQuery(s);
                        setSuggestions([]);
                        apiFetch(`/api/search?q=${encodeURIComponent(s)}`)
                          .then(r => r.json())
                          .then(data => setClasses(data));
                      }}
                    >
                      🔍 {s}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </section>

          <main className="main-content">
            {/* Category Navigation Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-gray-border)' }}>
              {['전체', '프로그래밍', '라이프스타일', '미술/드로잉', '공예/취미', '요리/베이킹'].map(cat => (
                <button
                  key={cat}
                  className={`btn ${activeCategory === cat ? '' : 'btn-secondary'}`}
                  style={{
                    whiteSpace: 'nowrap',
                    color: activeCategory === cat ? 'var(--color-deep-purple)' : 'var(--color-text-dark)',
                    backgroundColor: activeCategory === cat ? 'var(--color-lavender-light)' : '#ffffff',
                    borderColor: 'var(--color-gray-border)',
                    fontWeight: activeCategory === cat ? 700 : 500
                  }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Tabs & Class Card Grid */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {activeCategory === '전체' ? '인기 추천 취미 클래스' : `${activeCategory} 클래스`}
                </h2>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { label: '전체', value: 'ALL' },
                    { label: '🔥 인기 클래스', value: 'POPULAR' },
                    { label: '✨ 신규 클래스', value: 'NEW' },
                    { label: '👍 추천 클래스', value: 'RECOMMENDED' }
                  ].map(tab => (
                    <button
                      key={tab.value}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        color: activeTabFilter === tab.value ? 'var(--color-deep-purple)' : 'var(--color-text-muted)',
                        borderColor: activeTabFilter === tab.value ? 'var(--color-lavender)' : 'var(--color-gray-border)',
                        backgroundColor: activeTabFilter === tab.value ? 'var(--color-lavender-light)' : 'transparent',
                        fontWeight: activeTabFilter === tab.value ? 700 : 400
                      }}
                      onClick={() => setActiveTabFilter(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem' }}>클래스 정보를 불러오는 중입니다...</p>
              ) : filteredClasses.length === 0 ? (
                <div className="panel-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>해당 조건에 일치하는 클래스가 존재하지 않습니다.</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {filteredClasses.map(c => (
                    <div key={c.id} className="card">
                      <div className="card-image" style={{ backgroundImage: `url(${c.image})` }}>
                        {c.tag && (
                          <span style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            backgroundColor: c.tag === 'POPULAR' ? 'var(--color-deep-purple)' : c.tag === 'NEW' ? '#10b981' : 'var(--color-lavender)',
                            color: '#ffffff',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {c.tag}
                          </span>
                        )}
                      </div>
                      <div className="card-body">
                        <h3>{c.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {c.desc}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', marginTop: '0.3rem' }}>
                          🎓 {c.instructor} · ⭐ {c.rating} · ⏱️ {c.duration}
                        </p>

                        <div className="card-footer">
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-deep-purple)' }}>
                            {c.price.toLocaleString()}원
                          </span>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.6rem', color: 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                              onClick={() => handleAddWish(c.id)}
                            >
                              ⭐ 찜
                            </button>
                            <button
                              className="btn"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => {
                                setSelectedClass(c);
                                loadClassReviews(c.id);
                              }}
                            >
                              상세 보기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {/* CLASS DETAIL VIEW */}
      {selectedClass && (
        <main className="main-content">
          <button
            className="btn btn-secondary"
            style={{ width: 'fit-content', color: 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
            onClick={() => setSelectedClass(null)}
          >
            ← 목록으로 돌아가기
          </button>

          <div className="dashboard-layout">
            <div className="panel-card">
              <h2 style={{ color: 'var(--color-deep-purple)' }}>{selectedClass.title}</h2>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <img
                  src={selectedClass.image}
                  alt={selectedClass.title}
                  style={{ width: '100%', maxWidth: '360px', height: '240px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p><strong>강사:</strong> {selectedClass.instructor} | <strong>카테고리:</strong> {selectedClass.category}</p>
                  <p><strong>난이도:</strong> {selectedClass.level} | <strong>총 강의시간:</strong> {selectedClass.duration}</p>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{selectedClass.desc}</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-deep-purple)', marginTop: '0.5rem' }}>
                    수강료: {selectedClass.price.toLocaleString()}원
                  </p>

                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                    <button className="btn" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }} onClick={() => handleEnrollClass(selectedClass)}>
                      지금 바로 수강 신청하기
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ color: 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                      onClick={() => handleAddWish(selectedClass.id)}
                    >
                      ⭐ 찜 목록에 추가
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <h3>💬 수강생 리얼 후기 ({reviews.length})</h3>

                {user && (
                  <form onSubmit={handleReviewSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>평점 선택:</label>
                      <select
                        className="form-input"
                        style={{ width: '120px' }}
                        value={reviewInput.rating}
                        onChange={e => setReviewInput({ ...reviewInput, rating: e.target.value })}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5.0)</option>
                        <option value="4">⭐⭐⭐⭐ (4.0)</option>
                        <option value="3">⭐⭐⭐ (3.0)</option>
                      </select>
                    </div>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="강의에 대한 솔직한 후기를 남겨주세요."
                      value={reviewInput.comment}
                      onChange={e => setReviewInput({ ...reviewInput, comment: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>후기 작성</button>
                  </form>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {reviews.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>아직 등록된 후기가 없습니다. 첫 후기를 작성해보세요!</p>
                  ) : (
                    reviews.map((r, idx) => (
                      <div key={idx} style={{ padding: '0.8rem', backgroundColor: 'var(--color-soft-gray)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <strong>👤 {r.author}</strong>
                          <span style={{ color: '#f59e0b' }}>{'⭐'.repeat(r.rating)}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>👨‍🏫 크리에이터 프로필</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                정식 아카데미 자격을 보유한 대표 전문 강사입니다. 초보자도 쉽게 따라올 수 있는 실습 중심 커리큘럼을 제공합니다.
              </p>
              <div style={{ borderTop: '1px solid var(--color-gray-border)', paddingTop: '0.8rem', fontSize: '0.85rem' }}>
                <p>✔ 수강 만족도 98%</p>
                <p>✔ 실시간 Q&A 멘토링 제공</p>
                <p>✔ 수강 완료 시 디렉트 이수증 발급</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 1:1 SUPPORT MENTORING CHAT PAGE */}
      {activeTab === 'support' && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h3>💬 1:1 실시간 수강 멘토링 상담실</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                강의 관련 궁금한 점이나 키트 배송 문의를 남겨주시면 멘토가 답변해드립니다.
              </p>

              <div style={{
                height: '350px',
                border: '1px solid var(--color-gray-border)',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: 'var(--color-soft-gray)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                overflowY: 'auto'
              }}>
                {chatMessages.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 'auto' }}>
                    대화 내역이 없습니다. 메시지를 입력해보세요!
                  </p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender === 'user' ? 'var(--color-deep-purple)' : '#ffffff',
                        color: msg.sender === 'user' ? '#ffffff' : 'var(--color-text-dark)',
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        maxWidth: '75%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      <p style={{ fontSize: '0.9rem' }}>{msg.text}</p>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', textAlign: 'right', marginTop: '0.2rem' }}>
                        {msg.time}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="멘토에게 문의할 메시지를 입력하세요..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                />
                <button type="submit" className="btn">전송</button>
              </form>
            </div>

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>❓ 자주 묻는 질문 (FAQ)</h3>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <strong>Q. 준비물 키트는 언제 배송되나요?</strong>
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    마이페이지 [프로필 세팅]에서 배송 메모 입력 후 1~2일 이내 출고됩니다.
                  </p>
                </div>
                <div>
                  <strong>Q. 수강 기간은 얼마인가요?</strong>
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    수강 신청일로부터 무제한 반복 수강이 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* MY PAGE / MY CLASSROOM */}
      {activeTab === 'mypage' && (
        <main className="main-content">
          <div className="dashboard-layout">
            {/* Sidebar Sub-tab Navigation */}
            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>나의 강의실</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className={`btn ${myPageSubTab === 'enrollments' ? '' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'enrollments' ? '#fff' : 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                  onClick={() => setMyPageSubTab('enrollments')}
                >
                  📝 수강중인 클래스 목록
                </button>
                <button
                  className={`btn ${myPageSubTab === 'wishlist' ? '' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'wishlist' ? '#fff' : 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                  onClick={() => setMyPageSubTab('wishlist')}
                >
                  ⭐ 관심 찜 목록
                </button>
                <button
                  className={`btn ${myPageSubTab === 'schedule' ? '' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'schedule' ? '#fff' : 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                  onClick={() => setMyPageSubTab('schedule')}
                >
                  📅 학습 일정 캘린더
                </button>
                <button
                  className={`btn ${myPageSubTab === 'report' ? '' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'report' ? '#fff' : 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                  onClick={() => {
                    setMyPageSubTab('report');
                    fetchLearningReport('weekly');
                  }}
                >
                  📊 학습 리포트 성취도
                </button>
                <button
                  className={`btn ${myPageSubTab === 'csv' ? '' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'csv' ? '#fff' : 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                  onClick={() => setMyPageSubTab('csv')}
                >
                  📁 수강 진도 백업 CSV
                </button>
                <button
                  className={`btn ${myPageSubTab === 'query' ? '' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'query' ? '#fff' : 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                  onClick={() => setMyPageSubTab('query')}
                >
                  💻 REST API 쿼리 콘솔
                </button>
                <button
                  className={`btn ${myPageSubTab === 'profile' ? '' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'profile' ? '#fff' : 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }}
                  onClick={() => setMyPageSubTab('profile')}
                >
                  ⚙️ 프로필 및 수강 설정
                </button>
              </div>
            </div>

            {/* Sub-tab Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

              {/* Sub-tab: Enrollments & Refund Form (SEC-264) */}
              {myPageSubTab === 'enrollments' && (
                <div className="panel-card">
                  <h3>📝 수강중인 클래스</h3>
                  {enrollments.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>현재 수강 신청한 클래스가 없습니다.</p>
                  ) : (
                    <>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>신청 번호</th>
                            <th>클래스명</th>
                            <th>수강료</th>
                            <th>신청일</th>
                            <th>상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map(e => (
                            <tr key={e.id}>
                              <td><code>{e.id}</code></td>
                              <td><strong>{e.title}</strong></td>
                              <td>{e.price.toLocaleString()}원</td>
                              <td>{e.date}</td>
                              <td style={{ color: 'var(--color-deep-purple)', fontWeight: 600 }}>{e.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                        <h4>💸 수강 철회 및 환불 사유 신청 (SEC-264)</h4>
                        <form onSubmit={handleRefundSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', alignItems: 'flex-end' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="환불을 청구하고자 하는 사유를 입력하십시오."
                              value={refundInput}
                              onChange={e => setRefundInput(e.target.value)}
                              required
                            />
                          </div>
                          <button type="submit" className="btn">환불 청구</button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Sub-tab: Wishlist */}
              {myPageSubTab === 'wishlist' && (
                <div className="panel-card">
                  <h3>⭐ 나의 찜 보관함</h3>
                  {wishlist.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>관심 찜 목록이 비어 있습니다.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {wishlist.map((item, idx) => (
                        <div key={idx} style={{ padding: '1rem', border: '1px solid var(--color-gray-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{item.title}</strong>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>🎓 {item.instructor} | {item.category}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-deep-purple)' }}>{item.price.toLocaleString()}원</span>
                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleEnrollClass(item)}>
                              수강 신청
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab: Schedule Calendar (SEC-267) */}
              {myPageSubTab === 'schedule' && (
                <div className="panel-card">
                  <h3>📅 학습 일정 캘린더 플래너</h3>
                  <form onSubmit={handleCalendarSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>일정 제목</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="예: React 4강 과제 제출일"
                        value={calendarInput.title}
                        onChange={e => setCalendarInput({ ...calendarInput, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ width: '160px' }}>
                      <label>날짜</label>
                      <input
                        type="date"
                        className="form-input"
                        value={calendarInput.date}
                        onChange={e => setCalendarInput({ ...calendarInput, date: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">일정 추가</button>
                  </form>

                  <div style={{ marginTop: '1.5rem' }}>
                    <h4>등록된 특강 및 학습 일정</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {calendarItems.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)' }}>등록된 일정이 없습니다.</p>
                      ) : (
                        calendarItems.map((item, idx) => (
                          <div key={idx} style={{ padding: '0.8rem', backgroundColor: 'var(--color-soft-gray)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>📌 <strong>{item.title}</strong></span>
                            <span style={{ color: 'var(--color-deep-purple)', fontWeight: 600 }}>📅 {item.date}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab: Learning Report (SEC-268) */}
              {myPageSubTab === 'report' && (
                <div className="panel-card">
                  <h3>📊 성취율 분석 학습 리포트</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: reportFilter === 'weekly' ? 'var(--color-deep-purple)' : 'var(--color-soft-gray)',
                        color: reportFilter === 'weekly' ? '#ffffff' : 'var(--color-text-dark)'
                      }}
                      onClick={() => fetchLearningReport('weekly')}
                    >
                      주간 리포트
                    </button>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: reportFilter === 'monthly' ? 'var(--color-deep-purple)' : 'var(--color-soft-gray)',
                        color: reportFilter === 'monthly' ? '#ffffff' : 'var(--color-text-dark)'
                      }}
                      onClick={() => fetchLearningReport('monthly')}
                    >
                      월간 리포트
                    </button>
                  </div>

                  {reportData && (
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--color-soft-gray)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>신청 강좌 수</p>
                        <h3 style={{ color: 'var(--color-deep-purple)', marginTop: '0.3rem' }}>{reportData.totalEnrolled}개</h3>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--color-soft-gray)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>완강한 강좌 레슨</p>
                        <h3 style={{ color: 'var(--color-deep-purple)', marginTop: '0.3rem' }}>{reportData.completedLessons}강</h3>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--color-soft-gray)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>총 학습 시간</p>
                        <h3 style={{ color: 'var(--color-deep-purple)', marginTop: '0.3rem' }}>{reportData.totalHoursSpent}시간</h3>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--color-soft-gray)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>평균 달성률</p>
                        <h3 style={{ color: 'var(--color-deep-purple)', marginTop: '0.3rem' }}>{reportData.achievementRate}</h3>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab: CSV Progress Upload (SEC-269) */}
              {myPageSubTab === 'csv' && (
                <div className="panel-card">
                  <h3>📁 진도 기록 CSV 업로드 및 백업</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    오프라인에서 보관 중인 학습 진도 기록 CSV 텍스트를 입력하여 서버와 동기화하세요.
                  </p>
                  <form onSubmit={handleCsvSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.8rem' }}>
                    <div className="form-group">
                      <textarea
                        className="form-input"
                        rows={5}
                        placeholder="예시:&#10;classId,progress,completedDate&#10;c1,100%,2026-08-10&#10;c2,50%,2026-08-12"
                        value={csvInput}
                        onChange={e => setCsvInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>CSV 로딩 및 동기화</button>
                  </form>
                </div>
              )}

              {/* Sub-tab: REST API Query (SEC-270) */}
              {myPageSubTab === 'query' && (
                <div className="panel-card">
                  <h3>💻 수강 명세 REST API 쿼리 콘솔</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    내 수강 데이터를 원격 쿼리하여 JSON 형식으로 가져올 수 있습니다.
                  </p>
                  <form onSubmit={handleApiQuerySubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.8rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="예: status='수강중'"
                        value={apiQueryInput}
                        onChange={e => setApiQueryInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn">쿼리 발송</button>
                  </form>
                </div>
              )}

              {/* Sub-tab: Profile & Preferences Settings (SEC-261, SEC-262, SEC-263, SEC-266) */}
              {myPageSubTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* SEC-261: Tags */}
                  <div className="panel-card">
                    <h3>🏷️ 선호 카테고리 태그 설정</h3>
                    <form onSubmit={handleTagSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="예: React, 드로잉, 에스프레소"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">태그 등록</button>
                    </form>
                  </div>

                  {/* SEC-262: Invitations */}
                  <div className="panel-card">
                    <h3>✉️ 지인 동반 수강 초대장 작성</h3>
                    <form onSubmit={handleInviteSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="예: 같이 홈 바리스타 클래스 수강해요!"
                          value={inviteInput}
                          onChange={e => setInviteInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">초대장 전송</button>
                    </form>
                  </div>

                  {/* SEC-263: Shipping Memo */}
                  <div className="panel-card">
                    <h3>📦 준비물 실물 키트 배송 메모</h3>
                    <form onSubmit={handleShippingMemoSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="예: 문 앞 보관 요청드립니다."
                          value={memoInput}
                          onChange={e => setMemoInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">메모 저장</button>
                    </form>
                  </div>

                  {/* SEC-266: Notification Title */}
                  <div className="panel-card">
                    <h3>🔔 카카오 수강 알림 제목 설정</h3>
                    <form onSubmit={handleNotifTitleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="예: [ClassPass] 오늘 진행되는 라이브 강좌 알림"
                          value={notifTitleInput}
                          onChange={e => setNotifTitleInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">제목 설정</button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      )}

      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'ClassPass 로그인' : '신규 회원가입'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>×</button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              <div className="modal-body">
                {authMode === 'register' && (
                  <div className="form-group">
                    <label>성명 / 닉네임</label>
                    <input
                      type="text"
                      className="form-input"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>이메일 (기본 테스트: user@example.com)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>비밀번호 (기본 테스트: password123)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>

                {authMode === 'login' ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    아직 계정이 없으신가요?{' '}
                    <span style={{ color: 'var(--color-deep-purple)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('register')}>
                      회원가입하기
                    </span>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    이미 계정이 있으신가요?{' '}
                    <span style={{ color: 'var(--color-deep-purple)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('login')}>
                      로그인하기
                    </span>
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn">{authMode === 'login' ? '로그인' : '가입완료'}</button>
                <button type="button" className="btn btn-secondary" style={{ color: 'var(--color-text-dark)', borderColor: 'var(--color-gray-border)' }} onClick={() => setShowAuthModal(false)}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'var(--color-deep-purple)', color: 'var(--color-lavender-light)', padding: '2.5rem 2rem', textAlign: 'center', fontSize: '0.85rem', marginTop: 'auto' }}>
        <p>© 2026 ClassPass Online Learning Platform. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
          대한민국 1등 취미·라이프스타일 배움터 ClassPass | 고객센터 1588-0000
        </p>
      </footer>
    </div>
  );
}
