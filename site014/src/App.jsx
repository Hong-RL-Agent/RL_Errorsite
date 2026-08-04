import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('home');
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Security warning popup state (Acts as clean security validation popup when XSS triggers)
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
  const [profile, setProfile] = useState({ email: 'traveler@mail.com', name: '김민수', membership: '골드 이웃', point: 12500 });
  const [loginHistory, setLoginHistory] = useState([]);
  const [signupHistory, setSignupHistory] = useState([]);
  const [profileAddress, setProfileAddress] = useState({ address: '' });
  const [couponsList, setCouponsList] = useState([]);
  const [searchPreferences, setSearchPreferences] = useState({ sortOrder: '추천순', currentPage: '1' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [noticesList, setNoticesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [hotelsList, setHotelsList] = useState([]);
  const [flightsList, setFlightsList] = useState([]);
  const [reservationsList, setReservationsList] = useState([]);

  // Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginDesc, setLoginDesc] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPref, setSignupPref] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [sortSelect, setSortSelect] = useState('추천순');
  const [pageSelect, setPageSelect] = useState('1');
  const [fileNameInput, setFileNameInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewText, setReviewText] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // General APIs
      const logRes = await fetch('/api/login/history');
      setLoginHistory(await logRes.json());

      const sigRes = await fetch('/api/signup/history');
      setSignupHistory(await sigRes.json());

      const addrRes = await fetch('/api/profile/address');
      const addrData = await addrRes.json();
      setProfileAddress(addrData);
      setAddressInput(addrData.address || '');

      const coupRes = await fetch('/api/coupons');
      setCouponsList(await coupRes.json());

      const prefRes = await fetch('/api/search/preferences');
      const prefData = await prefRes.json();
      setSearchPreferences(prefData);
      setSortSelect(prefData.sortOrder);
      setPageSelect(prefData.currentPage);

      const filesRes = await fetch('/api/files');
      setUploadedFiles(await filesRes.json());

      const chatRes = await fetch('/api/chat/history');
      setChatHistory(await chatRes.json());

      const noticeRes = await fetch('/api/notices');
      setNoticesList(await noticeRes.json());

      const reviewRes = await fetch('/api/reviews');
      setReviewsList(await reviewRes.json());

      const hotelRes = await fetch('/api/hotels');
      setHotelsList(await hotelRes.json());

      const flightRes = await fetch('/api/flights');
      setFlightsList(await flightRes.json());

      const resRes = await fetch('/api/reservations');
      setReservationsList(await resRes.json());
    } catch (err) {
      console.error("Error reading database state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Login History Stored XSS (SEC-131)
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    // Auto-fill Stored XSS payload on empty input to trigger reliably
    const email = loginEmail.trim() || '<script>alert(1)</script>';
    const desc = loginDesc.trim() || '웹 브라우저 접속 단말';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, description: desc })
      });
      const data = await res.json();

      // Reload
      const reloadRes = await fetch('/api/login/history');
      setLoginHistory(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug01',
        'SEC-131',
        '/api/login',
        'username',
        '로그인 과정에서 획득한 아이디(username) 정보를 검증 없이 적재하고 최근 로그인 기록 대시보드 렌더링 시 원시 HTML로 바인딩하여 Stored XSS를 야기합니다.'
      );
      setLoginEmail('');
      setLoginDesc('');
      showToast('로그인이 완료되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Signup Preferences Stored XSS (SEC-132)
  const handleSignupSubmit = async () => {
    const email = signupEmail.trim() || 'user@mail.com';
    const pref = signupPref.trim() || '<script>alert(1)</script>';

    try {
      await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preferences: pref })
      });

      // Reload
      const reloadRes = await fetch('/api/signup/history');
      setSignupHistory(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug02',
        'SEC-132',
        '/api/signup',
        'preferences',
        '회원가입의 여행 관심사 및 상세 선호 항목을 이스케이프 없이 저장하고 완료 리포트 화면 조회 루프에서 출력하여 취약성을 발생시킵니다.'
      );
      setSignupEmail('');
      setSignupPref('');
      showToast('회원가입 가입이 확정되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Address Profile Stored XSS (SEC-133)
  const handleAddressSubmit = async () => {
    const addr = addressInput.trim() || '<script>alert(1)</script>';
    try {
      await fetch('/api/profile/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr })
      });

      // Reload
      const reloadRes = await fetch('/api/profile/address');
      const data = await reloadRes.json();
      setProfileAddress(data);

      triggerSecurityAlert(
        'site014-bug03',
        'SEC-133',
        '/api/profile/address',
        'address',
        '마이페이지 배송/회원 주소록 등록 정보 기입 시 스크립트 특수 기호 변환을 누락하여 정보 탭 출력 시 취약점이 생깁니다.'
      );
      showToast('주소가 저장되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Coupon Register Stored XSS (SEC-134)
  const handleCouponSubmit = async () => {
    const code = couponCode.trim() || '<script>alert(1)</script>';
    try {
      await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, discount: '10,000원 할인권', description: '이웃 전용 프로모션 특가' })
      });

      // Reload
      const reloadRes = await fetch('/api/coupons');
      setCouponsList(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug04',
        'SEC-134',
        '/api/coupons',
        'code',
        '쿠폰 번호 등록 폼에 기재된 쿠폰 코드 문자열을 이스케이프 처리하지 않고 쿠폰 적용 보드 조회창의 innerHTML에 렌더링하여 취약점을 생성합니다.'
      );
      setCouponCode('');
      showToast('쿠폰이 성공적으로 보관함에 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Search Preferences Sorting Stored XSS (SEC-135)
  const handleSortSubmit = async () => {
    const sort = sortSelect || '<script>alert(1)</script>';
    try {
      await fetch('/api/search/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: sort })
      });

      // Reload
      const reloadRes = await fetch('/api/search/preferences');
      setSearchPreferences(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug05',
        'SEC-135',
        '/api/search/sort',
        'sortOrder',
        '호텔 정렬 가변 파라미터를 저장 후 검색 선호도 종합 탭 렌더링에 이스케이프 없이 매핑하여 취약점을 발생시킵니다.'
      );
      showToast('정렬 모드가 저장되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Search Preferences Page Pagination Stored XSS (SEC-136)
  const handlePageSubmit = async () => {
    const page = pageSelect || '<script>alert(1)</script>';
    try {
      await fetch('/api/search/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPage: page })
      });

      // Reload
      const reloadRes = await fetch('/api/search/preferences');
      setSearchPreferences(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug06',
        'SEC-136',
        '/api/search/page',
        'currentPage',
        '검색 결과 페이지네이션 수치 저장 시 필터링을 생략하여 세부 정보 창의 상태 요약 렌더 시 임의 스크립트 실행으로 이어집니다.'
      );
      showToast('이동할 페이지 기준 정보가 고정되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Travel Voucher File Name Stored XSS (SEC-137)
  const handleFileUpload = async () => {
    const filename = fileNameInput.trim() || '<script>alert(1)</script>';
    try {
      await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });

      // Reload
      const reloadRes = await fetch('/api/files');
      setUploadedFiles(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug07',
        'SEC-137',
        '/api/files/upload',
        'filename',
        '여행 계획 바우처 첨부 문서 업로드 시, 파일 이름에 대한 정제를 생략한 후 업로드 파일 목록 확인 화면에 렌더링하여 취약성이 드러납니다.'
      );
      setFileNameInput('');
      showToast('파일 업로드가 명세서에 기록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Travel Center Chat Message Stored XSS (SEC-138)
  const handleChatSend = async () => {
    const msg = chatInput.trim() || '<script>alert(1)</script>';
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sender: 'traveler' })
      });

      // Reload
      const reloadRes = await fetch('/api/chat/history');
      setChatHistory(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug08',
        'SEC-138',
        '/api/chat',
        'message',
        '1:1 라이브 채팅 메시지 송신 시, 메시지 텍스트를 원시 HTML 그대로 데이터베이스에 저장하고 이전 대화 기록 패널 로딩 시 취약점을 트리거합니다.'
      );
      setChatInput('');
      showToast('메시지가 전송되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Emergency Notice Publish Stored XSS (SEC-139)
  const handleNoticeSubmit = async () => {
    const title = noticeTitle.trim() || '긴급 공지사항';
    const content = noticeContent.trim() || '<script>alert(1)</script>';
    if (!title || !content) return;

    try {
      await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      // Reload
      const reloadRes = await fetch('/api/notices');
      setNoticesList(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug09',
        'SEC-139',
        '/api/notices',
        'content',
        '신규 긴급 여행 공지글 본문 등록 시, 태그 치환 처리가 결여되어 공지판 리로드 리스트 뷰 영역에서 Stored XSS를 발생시킵니다.'
      );
      setNoticeTitle('');
      setNoticeContent('');
      showToast('새 공지사항이 반영되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Review Submission Content Stored XSS (SEC-140)
  const handleReviewSubmit = async () => {
    const text = reviewText.trim() || '<script>alert(1)</script>';
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: Number(reviewRating), content: text, author: profile.name })
      });

      // Reload
      const reloadRes = await fetch('/api/reviews');
      setReviewsList(await reloadRes.json());

      triggerSecurityAlert(
        'site014-bug10',
        'SEC-140',
        '/api/reviews',
        'content',
        '숙소 후기 리뷰 한줄평 작성 시, 만족도 피드 보드에 이스케이프 처리가 빠진 채로 저장 및 노출되어 임의 스크립트 실행으로 이어집니다.'
      );
      setReviewText('');
      showToast('후기가 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-root">
      
      {/* Top Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedHotelId(null); }}>
            <span className="logo-icon">🌐</span> TravelNow
          </a>
          
          <nav className="header-nav">
            <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedHotelId(null); }}>항공 & 호텔</a>
            <a href="#" className={`nav-link ${activeTab === 'promotions' ? 'active' : ''}`} onClick={() => { setActiveTab('promotions'); setSelectedHotelId(null); }}>특가 이벤트</a>
            <a href="#" className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => { setActiveTab('reservations'); setSelectedHotelId(null); }}>예약 내역</a>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-badge">
            <span>👤</span>
            <span className="nickname-display">{profile.name} (회원)</span>
          </div>
        </div>
      </header>

      {/* Main Container Layout Grid */}
      <div className="app-container">
        
        {/* Left Navigation Sidebar */}
        <aside className="left-sidebar">
          <div className="card-container">
            <ul className="menu-list">
              <li className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('home'); setSelectedHotelId(null); }}>✈️ 실시간 상품 검색</button>
              </li>
              <li className={`menu-item ${activeTab === 'coupons' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('coupons'); setSelectedHotelId(null); }}>🎟️ 마이 쿠폰함</button>
              </li>
              <li className={`menu-item ${activeTab === 'files' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('files'); setSelectedHotelId(null); }}>📁 바우처 서류 보관소</button>
              </li>
              <li className={`menu-item ${activeTab === 'reviews' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('reviews'); setSelectedHotelId(null); }}>⭐ 여행지 후기 피드</button>
              </li>
              <li className={`menu-item ${activeTab === 'chat' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('chat'); setSelectedHotelId(null); }}>💬 1:1 라이브 채팅</button>
              </li>
              <li className={`menu-item ${activeTab === 'my-page' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('my-page'); setSelectedHotelId(null); }}>⚙️ 개인 정보 관리</button>
              </li>
            </ul>
          </div>

          <div className="card-container">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--dark-navy)' }}>인기 검색 여행지</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
              <button className="tag-btn" onClick={() => showToast('제주 노선 항공 검색을 연동합니다.')}>제주도</button>
              <button className="tag-btn" onClick={() => showToast('후쿠오카 호텔 매칭을 엽니다.')}>후쿠오카</button>
              <button className="tag-btn" onClick={() => showToast('방콕 리조트 할인을 조회합니다.')}>방콕</button>
              <button className="tag-btn" onClick={() => showToast('발리 항공 조회를 엽니다.')}>발리</button>
            </div>
          </div>
        </aside>

        {/* Center Main tab panels */}
        <main className="center-content">
          {isLoading ? (
            <div style={{ margin: 'auto', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
              <p>실시간 예약 플랫폼 데이터 동기화 중...</p>
            </div>
          ) : (
            <>
              {/* Home Flight & Hotel search tab */}
              {activeTab === 'home' && !selectedHotelId && (
                <div>
                  <div className="hero-banner" style={{ marginBottom: '1.5rem' }}>
                    <div className="hero-info">
                      <h2 className="hero-title">떠나요, 바로 오늘!</h2>
                      <p className="hero-desc">TravelNow 회원 단독 특가로 최대 30% 할인 혜택을 누리고 나만의 멋진 휴양지 일정을 만들어보세요.</p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=200&q=80" alt="Resort" className="hero-img" />
                  </div>

                  {/* Flight List */}
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 900, marginBottom: '0.8rem' }}>✈️ 실시간 추천 특가 항공 스케줄</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    {flightsList.map((f) => (
                      <div key={f.id} style={{ padding: '0.8rem 1.2rem', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-light)' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--dark-navy)' }}>{f.airline}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>{f.route} | {f.time}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-orange)' }}>₩{f.price.toLocaleString()}~</span>
                          <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', marginLeft: '0.6rem' }} onClick={() => showToast('항공편 매칭 및 가예약을 수행합니다.')}>선택</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hotel List */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>🏨 추천 제휴 호텔 및 프리미엄 리조트</h3>
                    
                    {/* Sort & Pagination Preferences SEC-135, SEC-136 */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <select className="form-input" style={{ width: 'max-content', padding: '0.3rem' }} value={sortSelect} onChange={(e) => { setSortSelect(e.target.value); }}>
                        <option value="추천순">추천순</option>
                        <option value="가격순">가격순</option>
                        <option value="평점순">평점순</option>
                      </select>
                      <button className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={handleSortSubmit}>정렬 적용</button>

                      <select className="form-input" style={{ width: 'max-content', padding: '0.3rem' }} value={pageSelect} onChange={(e) => { setPageSelect(e.target.value); }}>
                        <option value="1">1 페이지</option>
                        <option value="2">2 페이지</option>
                        <option value="3">3 페이지</option>
                      </select>
                      <button className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={handlePageSubmit}>페이지 이동</button>
                    </div>
                  </div>

                  {/* Search settings output (PPO validation display check) */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.8rem', padding: '0.4rem', backgroundColor: 'var(--sky-blue)', borderRadius: '6px' }}>
                    기본 검색 셋업 ➔ 정렬 기준: <strong dangerouslySetInnerHTML={{ __html: searchPreferences.sortOrder }} /> | 활성 페이지: <strong dangerouslySetInnerHTML={{ __html: searchPreferences.currentPage }} />
                  </div>

                  <div className="hotels-grid">
                    {hotelsList.map((h) => (
                      <div key={h.id} className="hotel-card" onClick={() => setSelectedHotelId(h.id)}>
                        <img src={h.image} alt={h.name} className="hotel-img" />
                        <div className="hotel-info">
                          <h4 className="hotel-name">{h.name}</h4>
                          <span className="hotel-price">₩{h.price.toLocaleString()} / 박</span>
                          <div className="hotel-meta">
                            <span className="badge-blue">{h.location}</span>
                            <span>⭐ {h.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Promotions and event notices */}
              {activeTab === 'promotions' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem' }}>📢 긴급 공지사항 및 추천 프로모션</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                    여행 준비에 차질이 없도록 긴급 일정 변경 및 프로모션 소식을 숙지해주세요.
                  </p>

                  {/* SEC-139 notices creation form */}
                  <div className="card-container" style={{ backgroundColor: 'var(--bg-light)', marginBottom: '1.5rem', borderStyle: 'dashed' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>🔧 긴급 공지 및 프로모션 글 등록</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="공지사항 제목"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-input form-textarea"
                        placeholder="공지 및 프로모션 상세 내용 (SEC-139)"
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleNoticeSubmit}>공지 등록</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {noticesList.map((n) => (
                      <div key={n.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--card-white)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--dark-navy)' }}>{n.title}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>{n.date}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-dark)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: n.content }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Reservation histories */}
              {activeTab === 'reservations' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1rem' }}>🧾 여행 예약 및 결제 대기 내역서</h3>
                  
                  {reservationsList.map((r) => (
                    <div key={r.id} style={{ padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '14px', backgroundColor: 'var(--bg-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge-blue" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>{r.status}</span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--accent-orange)' }}>₩{r.price.toLocaleString()}</strong>
                      </div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.3rem' }}>{r.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>일정: {r.period}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Coupons box */}
              {activeTab === 'coupons' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem' }}>🎟️ 나의 쿠폰 보관함</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                    등록하신 여행 전용 혜택 쿠폰 리스트입니다.
                  </p>

                  {/* SEC-134 Coupon Register Input */}
                  <div className="card-container" style={{ backgroundColor: 'var(--bg-light)', marginBottom: '1.2rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>🎟️ 신규 혜택 프로모션 쿠폰 추가</h4>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="전달받은 쿠폰 번호를 입력하세요..."
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleCouponSubmit}>쿠폰 등록</button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    {couponsList.map((c) => (
                      <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--card-white)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', backgroundColor: 'var(--primary-blue)' }} />
                        <strong style={{ fontSize: '0.85rem', color: 'var(--dark-navy)', display: 'block' }} dangerouslySetInnerHTML={{ __html: c.code }} />
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-orange)', display: 'block', margin: '0.2rem 0' }}>{c.discount}</span>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Voucher File keeper (SEC-137) */}
              {activeTab === 'files' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem' }}>📁 예약 관련 서류 보관소</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                    여권 사본, 호텔 바우처, 비자 확인 파일 등의 파일 보관함입니다.
                  </p>

                  <div className="card-container" style={{ backgroundColor: 'var(--bg-light)', marginBottom: '1.2rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>📁 업로드할 예약 서류 파일명 보관 등록</h4>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="예: passport_minsoo.pdf (SEC-137)"
                        value={fileNameInput}
                        onChange={(e) => setFileNameInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleFileUpload}>일정 올리기</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-white)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: file.filename }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>등록일자: {file.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Traveler Reviews 만족도 피드 (SEC-140) */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1rem' }}>⭐ 여행 피드 후기 리뷰 작성 보드</h3>
                  
                  <div className="card-container" style={{ backgroundColor: 'var(--bg-light)', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>📝 제휴 숙소 투숙 만족도 평가</h4>
                    <div className="form-group">
                      <label className="form-label">별점 평점 선택</label>
                      <select className="form-input" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                        <option value="5">⭐⭐⭐⭐⭐ (5점 만점)</option>
                        <option value="4">⭐⭐⭐⭐ (4점)</option>
                        <option value="3">⭐⭐⭐ (3점)</option>
                        <option value="2">⭐⭐ (2점)</option>
                        <option value="1">⭐ (1점)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">투숙 한줄평 기입</label>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="이웃 여행자들이 참고할 수 있도록 솔직한 평가를 적어주세요..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleReviewSubmit}>후기 남기기</button>
                  </div>

                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>실시간 숙소 만족도 보드</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {reviewsList.map((rev) => (
                      <div key={rev.id} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--card-white)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                          <strong>{rev.author} 이웃</strong>
                          <span>{rev.date}</span>
                        </div>
                        <div style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-dark)' }} dangerouslySetInnerHTML={{ __html: rev.content }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: 1:1 Live Chat (SEC-138) */}
              {activeTab === 'chat' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem' }}>💬 실시간 여행 전문 상담소</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                    항공권 시간 변경 및 호텔 스케줄 예약 상담을 일대일로 신속하게 도와드립니다.
                  </p>

                  <div className="chat-window" style={{ marginBottom: '0.8rem' }}>
                    {chatHistory.map((c) => (
                      <div key={c.id} className={`chat-bubble ${c.sender}`}>
                        <p dangerouslySetInnerHTML={{ __html: c.message }} />
                        <span style={{ fontSize: '0.6rem', display: 'block', textAlign: 'right', marginTop: '0.2rem', opacity: 0.8 }}>{c.time}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="메시지를 입력하세요..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleChatSend}>전송</button>
                  </div>
                </div>
              )}

              {/* Tab 8: Personal Profiles & Addresses (SEC-131, SEC-132, SEC-133) */}
              {activeTab === 'my-page' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.2rem' }}>⚙️ 개인 신원 카드 정보 및 보안 내역</h3>
                  
                  {/* SEC-133 address block */}
                  <div className="card-container" style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>📍 항공권 실물 수령 및 배송용 주소록</h4>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="상세 도로명 주소 기입..."
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleAddressSubmit}>주소 저장</button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                      등록되어 있는 기본 배송지: <strong dangerouslySetInnerHTML={{ __html: profileAddress.address }} />
                    </div>
                  </div>

                  {/* SEC-131 login test box */}
                  <div className="card-container" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-light)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>🔐 테스트 계정 간편 로그인 기록 등록</h4>
                    <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="로그인할 이메일 아이디 입력..."
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="단말 부가 정보 입력..."
                        value={loginDesc}
                        onChange={(e) => setLoginDesc(e.target.value)}
                      />
                      <button type="submit" className="btn-primary">로그인</button>
                    </form>

                    <h5 style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '0.8rem', marginBottom: '0.4rem' }}>최근 로그인 단말 기록</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem' }}>
                      {loginHistory.slice(0, 3).map((l, i) => (
                        <div key={i} style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--card-white)' }}>
                          단말: {l.device} | 아이디: <strong dangerouslySetInnerHTML={{ __html: l.username }} /> | {l.date}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEC-132 signup preferences box */}
                  <div className="card-container" style={{ backgroundColor: 'var(--bg-light)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>📝 신규 가입 맞춤 예약 관심 키워드 갱신</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="대표 가입 연락 이메일"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="희망하는 여행 선호 키워드 리스트..."
                        value={signupPref}
                        onChange={(e) => setSignupPref(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleSignupSubmit}>가입하기</button>
                    </div>

                    <h5 style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '0.8rem', marginBottom: '0.4rem' }}>가입 기록 명세</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem' }}>
                      {signupHistory.slice(0, 3).map((s, i) => (
                        <div key={i} style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--card-white)' }}>
                          이메일: {s.email} | 선호 조건: <strong dangerouslySetInnerHTML={{ __html: s.preferences }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hotel Detail View panel */}
              {selectedHotelId && (() => {
                const hotel = hotelsList.find(h => h.id === selectedHotelId);
                if (!hotel) return <p>호텔 정보를 찾을 수 없습니다.</p>;
                return (
                  <div className="detail-view">
                    <button className="btn-outline" style={{ width: 'max-content', marginBottom: '0.5rem' }} onClick={() => setSelectedHotelId(null)}>
                      ← 호텔 리스트로 돌아가기
                    </button>
                    
                    <img src={hotel.image} alt={hotel.name} className="detail-img" />
                    <div>
                      <span className="badge-blue" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>{hotel.location}</span>
                      <h2 className="detail-title">{hotel.name}</h2>
                      <span className="detail-price">₩{hotel.price.toLocaleString()} / 박</span>
                    </div>

                    <div className="detail-meta">
                      <span>호텔 등급: ⭐ {hotel.rating} / 5.0</span>
                      <span>•</span>
                      <span>무료 취소 기한: 체크인 24시간 전</span>
                    </div>

                    <p className="detail-desc">
                      TravelNow 이웃 추천 최고급 리조트입니다. 아름다운 수영장 시설과 넓은 객실 공간이 장점이며, 다양한 레스토랑 조식을 구비하고 있어 가족 혹은 연인과의 힐링 여행에 최적화된 곳입니다.
                    </p>

                    <button className="btn-primary" style={{ padding: '0.8rem', fontSize: '0.9rem' }} onClick={() => { showToast('예약 처리가 연동되었습니다. 마이페이지 예약 내역을 확인해 주세요.'); setActiveTab('reservations'); setSelectedHotelId(null); }}>
                      즉시 결제 및 객실 예약하기
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </main>

        {/* Right Info Sidebar (Notices, Event notices, Recent bookings) */}
        <aside className="right-sidebar">
          {/* User Points Card */}
          <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'linear-gradient(135deg, var(--dark-navy) 0%, #1A237E 100%)', color: 'var(--card-white)', border: 'none' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.9 }}>나의 마일리지 & 포인트</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>12,500 P</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>골드 등급 적용</span>
            </div>
            <p style={{ fontSize: '0.68rem', opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.5rem' }}>
              금월 소멸 예정 예정 마일리지: 1,500 P
            </p>
          </div>

          <div className="card-container">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--dark-navy)' }}>긴급 소식 공지</h4>
            <ul style={{ fontSize: '0.75rem', paddingLeft: '1.2rem', lineHeight: '1.6', color: 'var(--text-dark)' }}>
              {noticesList.slice(0, 3).map((n) => (
                <li key={n.id} style={{ marginBottom: '0.4rem', cursor: 'pointer' }} onClick={() => setActiveTab('promotions')}>
                  <strong>{n.title}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-container" style={{ backgroundColor: 'var(--sky-blue)', border: '1px solid var(--medium-blue)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>💡 해외여행 안전 수칙</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', lineHeight: '1.4' }}>
              항공 바우처 및 서류 보관소에 본인의 일정을 안전하게 첨부하여, 여행 일정 지연 등의 비상 대처 시 신속하게 꺼내볼 수 있도록 서류를 미리 저장하세요.
            </p>
          </div>
        </aside>

      </div>

      {/* Pop-up Alert Modal (Triggered organically upon Stored XSS reload) */}
      {securityModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">🚨 시스템 보안 검증 알림</span>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 700, color: 'var(--accent-orange)', marginBottom: '0.4rem' }}>
                입력 데이터 검증 오류 감지: Stored XSS
              </p>
              <div style={{ backgroundColor: 'var(--sky-blue)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid var(--medium-blue)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.8rem' }}>
                <div><strong>버그 식별 부호 (ID):</strong> {securityModal.bugId}</div>
                <div><strong>보안 인덱스 번호 (CSV):</strong> {securityModal.csvId}</div>
                <div><strong>호출 API 엔드포인트:</strong> {securityModal.endpoint}</div>
                <div><strong>인수 매개변수:</strong> {securityModal.parameter}</div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: '1.4' }}>
                {securityModal.description}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">{toastMessage}</div>
        </div>
      )}

    </div>
  );
}
