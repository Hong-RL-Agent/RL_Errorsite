import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Search,
  User,
  Heart,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Sparkles,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [volunteerHours, setVolunteerHours] = useState(0);
  const [volunteerRecords, setVolunteerRecords] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  const fetchData = async () => {
    try {
      const [uRes, evtRes, regRes, vhRes, favRes, postRes, revRes] = await Promise.all([
        fetch('/api/auth/me').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/registrations').then(r => r.json()),
        fetch('/api/volunteer-hours').then(r => r.json()),
        fetch('/api/favorites/events').then(r => r.json()),
        fetch('/api/community/posts').then(r => r.json()),
        fetch('/api/reviews').then(r => r.json())
      ]);

      if (uRes.success) setUser(uRes.data);
      if (evtRes.success) setEvents(evtRes.data);
      if (regRes.success) setRegistrations(regRes.data);
      if (vhRes.success) {
        setVolunteerHours(vhRes.totalHours);
        setVolunteerRecords(vhRes.data);
      }
      if (favRes.success) setFavorites(favRes.data);
      if (postRes.success) setPosts(postRes.data);
      if (revRes.success) setReviews(revRes.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (title, message, type = 'info', bugId = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [{ id, title, message, type, bugId }, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5500);
  };

  const handleSwitchUser = async (userId) => {
    const res = await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data);
      fetchData();
      showToast('계정 전환 완료', `${data.data.name} (${data.data.role}) 계정으로 전환되었습니다.`, 'success');
    }
  };

  // ==========================================================
  // 5 Intentional Business Logic Bugs Triggers
  // ==========================================================

  // 1. SEC-361: Capacity Limit Bypass (Concurrent Over-registration)
  const triggerBug1_CapacityBypass = async () => {
    showToast('참가 신청 전송', '정원 1명 한정 [한강 망원 플로깅] 행사에 동시 참가 신청을 전송합니다.', 'info');

    // Send 2 concurrent apply requests to evt-001 (capacity: 1)
    const [r1, r2] = await Promise.all([
      fetch('/api/events/evt-001/apply', { method: 'POST' }).then(r => r.json()),
      fetch('/api/events/evt-001/apply', { method: 'POST' }).then(r => r.json())
    ]);

    fetchData();

    if (r1.success && r2.success) {
      showToast(
        '[Bug ID: SITE035-BUG-001 / SEC-361]',
        `정원(1명)이 제한된 한강 플로깅 행사에 2건의 신청(${r1.data.registration.id}, ${r2.data.registration.id})이 모두 승인되어 정원 초과가 발생하였습니다.`,
        'warning',
        'site035-bug01'
      );
    }
  };

  // 2. SEC-362: Duplicate Waitlist Promotion
  const triggerBug2_DuplicateWaitlistPromotion = async () => {
    // Repeatedly promote wt-5001 on evt-003
    const [r1, r2] = await Promise.all([
      fetch('/api/events/evt-003/promote-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId: 'wt-5001' })
      }).then(r => r.json()),
      fetch('/api/events/evt-003/promote-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId: 'wt-5001' })
      }).then(r => r.json())
    ]);

    fetchData();

    if (r1.success && r2.success) {
      showToast(
        '[Bug ID: SITE035-BUG-002 / SEC-362]',
        `동일 대기자(wt-5001)에 대해 중복 승급 처리가 실행되어 2건의 확정 참가자 레코드(${r1.data.registration.id}, ${r2.data.registration.id})가 중복 생성되었습니다.`,
        'warning',
        'site035-bug02'
      );
    }
  };

  // 3. SEC-363: Closed Registration Deadline Bypass
  const triggerBug3_ClosedDeadlineApply = async () => {
    // evt-004 deadline was 2026-03-10 (Past date)
    const res = await fetch('/api/events/evt-004/apply', {
      method: 'POST'
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE035-BUG-003 / SEC-363]',
        `신청 마감일(2026-03-10)이 지난 마감된 행사에 대해 참가 신청(${data.data.registration.id})이 마감일 검증 없이 정상 승인되었습니다.`,
        'warning',
        'site035-bug03'
      );
    }
  };

  // 4. SEC-364: Duplicate Volunteer Hours Credit
  const triggerBug4_DuplicateHoursCredit = async (regId = 'reg-1002') => {
    const payload = {
      registrationId: regId,
      userId: user?.id || 'usr-001'
    };

    // Send attendance check-in twice
    const [r1, r2] = await Promise.all([
      fetch('/api/events/evt-002/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json()),
      fetch('/api/events/evt-002/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json())
    ]);

    fetchData();

    if (r1.success && r2.success) {
      showToast(
        '[Bug ID: SITE035-BUG-004 / SEC-364]',
        `동일 행사에 대해 출석 체크가 2회 중복 승인되어 봉사시간 +8시간(4시간 x 2)이 이중 적립되었습니다.`,
        'warning',
        'site035-bug04'
      );
    }
  };

  // 5. SEC-365: Cancelled Registration Attendance Inconsistency
  const triggerBug5_CancelledAttendance = async () => {
    // reg-1003 is already 'cancelled'
    const payload = {
      registrationId: 'reg-1003',
      userId: user?.id || 'usr-001'
    };

    const res = await fetch('/api/events/evt-003/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE035-BUG-005 / SEC-365]',
        `취소(cancelled)된 참가 신청 건(reg-1003)에 대해 출석(attended) 처리 및 봉사시간(+3시간)이 정상 지급되었습니다.`,
        'warning',
        'site035-bug05'
      );
    }
  };

  const filteredEvents = events.filter(e => {
    const catMatch = selectedCategory === '전체' || e.category === selectedCategory;
    const searchMatch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="app-container">
      {/* Toast Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.2rem', color: t.bugId ? 'var(--color-primary)' : 'inherit' }}>
                {t.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {t.message}
              </div>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="header-nav">
        <div className="nav-left">
          <div className="brand-logo" onClick={() => setActiveTab('home')}>
            <span>🤝</span>
            <span>LinkDay</span>
            <span className="brand-badge">Local Events & Volunteer</span>
          </div>

          <div className="region-selector">
            <MapPin size={15} color="var(--color-primary)" />
            <select defaultValue="서울/마포·서대문">
              <option value="서울/마포·서대문">서울 마포·서대문 권역</option>
              <option value="서울/성동·광진">서울 성동·광진 권역</option>
              <option value="경기/고양·일산">경기 고양·일산 권역</option>
            </select>
          </div>
        </div>

        <div className="nav-center">
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="지역 축제, 플로깅, 유기동물 봉사활동을 검색해보세요..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="nav-right">
          {/* User Switcher Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>사용자 전환:</span>
            <select
              value={user?.id || 'usr-001'}
              onChange={e => handleSwitchUser(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="usr-001">한소희 (참여자 / 24시간)</option>
              <option value="usr-002">이준호 (참여자 / 12시간)</option>
              <option value="usr-003">푸른마포 환경연대 (행사 운영자)</option>
              <option value="usr-004">달빛 동물보호협회 (운영자)</option>
            </select>
          </div>

          <button className="user-profile-btn" onClick={() => setActiveTab('mypage')}>
            <div className="avatar-circle">
              {user?.name ? user.name[0] : 'L'}
            </div>
            <div className="user-meta-info">
              <span className="user-meta-name">{user?.name || '로그인'}</span>
              <span className="user-meta-points">누적 {volunteerHours}시간</span>
            </div>
          </button>
        </div>
      </header>

      {/* Sub Navigation Bar */}
      <nav className="subnav-bar">
        {[
          { id: 'home', label: '홈' },
          { id: 'events', label: '행사 & 봉사 찾기' },
          { id: 'registrations', label: '참가 신청 내역' },
          { id: 'attendance', label: '출석 및 봉사시간' },
          { id: 'organizer', label: '행사 운영 관리' },
          { id: 'community', label: '지역 커뮤니티' },
          { id: 'mypage', label: '마이페이지' }
        ].map(item => (
          <div
            key={item.id}
            className={`subnav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Main Content Body */}
      <main className="main-wrapper">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-tag">
                <Sparkles size={14} /> 따뜻한 지역 사회를 만드는 공익 매칭
              </div>
              <h1 className="hero-title">
                우리 동네를 더 빛나게 하는<br />
                함께하는 나눔과 소통의 장
              </h1>
              <p className="hero-desc">
                한강 플로깅부터 청소년 멘토링, 유기동물 보호 및 지역 문화 축제까지 LinkDay에서 신뢰할 수 있는 공익 활동에 참여하고 공식 봉사시간을 인증받으세요.
              </p>
              <div className="hero-actions">
                <button className="btn-accent" onClick={() => setActiveTab('events')}>
                  봉사활동 찾아보기 <ArrowRight size={16} />
                </button>
                <button
                  className="btn-outline"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setActiveTab('registrations')}
                >
                  나의 참가 신청 확인
                </button>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>확정된 참가 행사</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {registrations.filter(r => r.status === 'confirmed').length}건 참여 예정
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green)' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>누적 공인 봉사시간</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-green)' }}>
                    {volunteerHours} 시간 인정
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                  <Heart size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>관심 등록 행사</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {favorites.length}개 보관 중
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Events */}
            <div className="section-header">
              <div>
                <h2 className="section-title">🌿 이번 주 추천 봉사 & 지역 행사</h2>
                <p className="section-subtitle">지역 사회의 긍정적인 변화를 만드는 인기 공익 프로그램입니다.</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setActiveTab('events')}>
                전체보기 <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid-4" style={{ marginBottom: '3rem' }}>
              {events.slice(0, 4).map(evt => (
                <div key={evt.id} className="event-card">
                  <div className="event-img-wrapper">
                    <img src={evt.image} alt={evt.title} className="event-img" />
                    <span className="event-category-tag">{evt.category}</span>
                    <span
                      className="event-status-tag"
                      style={{
                        background: evt.status === 'open' ? 'var(--color-green)' : '#9e9e9e',
                        color: '#fff'
                      }}
                    >
                      {evt.status === 'open' ? `모집중 (${evt.currentParticipants}/${evt.capacity})` : '마감'}
                    </span>
                  </div>
                  <div className="event-body">
                    <div className="event-region">{evt.region} | {evt.date}</div>
                    <h3 className="event-title">{evt.title}</h3>
                    <p className="event-desc">{evt.description}</p>
                    <div className="event-footer">
                      <div className="event-hours">봉사시간 {evt.volunteerHours}시간</div>
                      <button className="btn-primary btn-sm" onClick={() => setActiveTab('events')}>
                        신청하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS & CAPACITY / DEADLINE BUGS (SEC-361 & SEC-363) */}
        {activeTab === 'events' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">📍 지역 행사 및 봉사활동 찾기</h2>
                <p className="section-subtitle">관심 있는 분야의 공익 활동을 찾고 간편하게 참가 신청해보세요.</p>
              </div>
            </div>

            <div className="tab-list">
              {['전체', '환경', '동물 보호', '교육', '지역 축제', '청년 활동'].map(cat => (
                <button
                  key={cat}
                  className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
              {filteredEvents.map(evt => (
                <div key={evt.id} className="event-card">
                  <div className="event-img-wrapper">
                    <img src={evt.image} alt={evt.title} className="event-img" />
                    <span className="event-category-tag">{evt.category}</span>
                    <span
                      className="event-status-tag"
                      style={{
                        background: evt.status === 'open' ? 'var(--color-green)' : '#9e9e9e',
                        color: '#fff'
                      }}
                    >
                      {evt.status === 'open' ? `모집중 (${evt.currentParticipants}/${evt.capacity})` : '신청 마감'}
                    </span>
                  </div>
                  <div className="event-body">
                    <div className="event-region">{evt.region} | {evt.location}</div>
                    <h3 className="event-title">{evt.title}</h3>
                    <p className="event-desc">{evt.description}</p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                      신청 마감일: <strong>{evt.registrationDeadline}</strong>
                    </div>
                    <div className="event-footer">
                      <div className="event-hours">{evt.volunteerHours}시간 인정</div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {/* BUG 1 Button: Capacity limit bypass on low capacity event */}
                        {evt.id === 'evt-001' && (
                          <button
                            className="btn-accent btn-sm"
                            title="정원 한정 참가 즉시 신청"
                            onClick={triggerBug1_CapacityBypass}
                          >
                            정원 한정 참가 즉시 신청
                          </button>
                        )}

                        {/* BUG 3 Button: Closed event deadline bypass */}
                        {evt.id === 'evt-004' && (
                          <button
                            className="btn-accent btn-sm"
                            title="추가 특별 참가 신청 접수"
                            onClick={triggerBug3_ClosedDeadlineApply}
                          >
                            추가 특별 참가 신청 접수
                          </button>
                        )}

                        {evt.id !== 'evt-001' && evt.id !== 'evt-004' && (
                          <button
                            className="btn-primary btn-sm"
                            onClick={async () => {
                              await fetch(`/api/events/${evt.id}/apply`, { method: 'POST' });
                              fetchData();
                              showToast('참가 신청 완료', `[${evt.title}] 행사에 참가 신청되었습니다.`, 'success');
                            }}
                          >
                            참가 신청
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">📝 나의 참가 신청 내역</h2>
                <p className="section-subtitle">신청한 행사 목록과 전자 출석 코드를 확인하세요.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {registrations.map(reg => (
                <div
                  key={reg.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      신청번호: <strong>{reg.id}</strong> | 전자 출석 코드: <strong style={{ color: 'var(--color-primary)' }}>{reg.participantCode}</strong>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        background: reg.status === 'confirmed' ? 'var(--color-green-light)' : reg.status === 'attended' ? '#dcfce7' : '#fee2e2',
                        color: reg.status === 'confirmed' ? 'var(--color-green)' : reg.status === 'attended' ? '#166534' : '#b91c1c'
                      }}
                    >
                      {reg.status === 'confirmed' ? '참가 확정' : reg.status === 'attended' ? '출석 완료' : '참가 취소'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                        {reg.event?.title || '지역 봉사활동 프로그램'}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        일정: <strong>{reg.event?.date} ({reg.event?.startTime} ~ {reg.event?.endTime})</strong> | 장소: <strong>{reg.event?.location}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {reg.status === 'confirmed' && (
                        <button
                          className="btn-outline btn-sm"
                          style={{ color: 'var(--color-danger)', borderColor: '#fca5a5' }}
                          onClick={async () => {
                            await fetch(`/api/registrations/${reg.id}/cancel`, { method: 'POST' });
                            fetchData();
                            showToast('참가 취소 완료', '행사 참가가 취소되었습니다.', 'info');
                          }}
                        >
                          참가 취소
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE & VOLUNTEER HOURS BUGS (SEC-364 & SEC-365) */}
        {activeTab === 'attendance' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">⏱️ 출석 체크 및 봉사시간 인증</h2>
                <p className="section-subtitle">행사 현장 출석 확인 및 누적 공인 봉사시간 기록입니다.</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1d3557 0%, #2a9d8f 100%)', borderRadius: 'var(--radius-md)', padding: '2rem', color: '#fff', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.3rem' }}>총 누적 인정 봉사시간</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>{volunteerHours} <span style={{ fontSize: '1.4rem' }}>시간</span></div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {/* BUG 4 Button: Duplicate hours credit */}
                <button
                  className="btn-accent"
                  title="참가자 출석 체크 및 시간 승인"
                  onClick={() => triggerBug4_DuplicateHoursCredit('reg-1002')}
                >
                  참가자 출석 체크 및 시간 승인
                </button>
              </div>
            </div>

            {/* BUG 5 Action Banner: Cancelled Registration Attendance Inconsistency */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>🏷️ 취소된 참가자(reg-1003) 현장 예외 출석 인정</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  사전 취소된 참가 신청(성동 청소년 코딩 멘토링)에 대해 현장 출석 및 봉사시간(+3시간)을 인증 처리합니다.
                </p>
              </div>
              <button className="btn-outline btn-sm" onClick={triggerBug5_CancelledAttendance}>
                현장 출석 확인 처리
              </button>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>봉사시간 인정 내역</h3>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {volunteerRecords.map(vh => (
                <div
                  key={vh.id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--color-border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{vh.reason}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{new Date(vh.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-green)' }}>
                    +{vh.hours} 시간
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ORGANIZER & WAITLIST BUG (SEC-362) */}
        {activeTab === 'organizer' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">👥 행사 운영 및 대기자 관리</h2>
                <p className="section-subtitle">행사 운영자 권한으로 대기자 명단을 관리하고 참가자로 승급 처리합니다.</p>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>[성동 청소년 디지털 배움터 멘토링] 대기자 명단</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>정원 8명 마감에 따른 실시간 대기 접수자 현황입니다.</div>
                </div>

                {/* BUG 2 Action Button: Duplicate waitlist promotion */}
                <button
                  className="btn-accent btn-sm"
                  onClick={triggerBug2_DuplicateWaitlistPromotion}
                >
                  대기자 자동 순차 승급
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>1순위 대기자 (한소희, wt-5001)</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>접수일시: 2026-03-20 11:00</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>승급 대기중</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>2순위 대기자 (정해인, wt-5002)</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>접수일시: 2026-03-21 15:30</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>승급 대기중</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMMUNITY */}
        {activeTab === 'community' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">💬 지역 커뮤니티 & 활동 후기</h2>
                <p className="section-subtitle">지역 주민들의 생생한 공익 참여 스토리와 소통 공간입니다.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {posts.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-bg)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                      {p.category}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.authorName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{p.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MY PAGE */}
        {activeTab === 'mypage' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">👤 마이페이지</h2>
                <p className="section-subtitle">내 공익 참여 프로필 및 활동 이력 관리</p>
              </div>
            </div>

            <div className="grid-3">
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  {user?.name ? user.name[0] : 'L'}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{user?.email}</div>
                <div style={{ display: 'inline-block', background: 'var(--color-surface)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  역할: {user?.role} | 지역: {user?.region}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>활동 바로가기</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('registrations')}>
                    <span>참가 신청 내역 ({registrations.length}건)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('attendance')}>
                    <span>누적 봉사시간 확인 ({volunteerHours}시간)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('organizer')}>
                    <span>행사 운영 및 대기자 관리</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
