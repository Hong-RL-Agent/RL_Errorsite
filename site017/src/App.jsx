import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState('venues');
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Security warning popup
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

  // Mock Database lists
  const [venuesList, setVenuesList] = useState([]);
  const [dressesList, setDressesList] = useState([]);
  const [studiosList, setStudiosList] = useState([]);
  const [makeupList, setMakeupList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [contractsList, setContractsList] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [noticesList, setNoticesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [reservationsList, setReservationsList] = useState([]);
  const [userAddress, setUserAddress] = useState('');

  // Form Inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [sortInput, setSortInput] = useState('');
  const [pageInput, setPageInput] = useState('1');
  const [contractFilenameInput, setContractFilenameInput] = useState('');
  const [contractDescInput, setContractDescInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [noticeKeywordInput, setNoticeKeywordInput] = useState('');
  const [reviewInput, setReviewInput] = useState('');
  const [reservationTitleInput, setReservationTitleInput] = useState('');
  const [reservationDateInput, setReservationDateInput] = useState('2026-08-15');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Initial Fetches
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const venRes = await fetch('/api/venues?sort=&page=');
      setVenuesList(await venRes.json());

      const drRes = await fetch('/api/dresses');
      setDressesList(await drRes.json());

      const stRes = await fetch('/api/studios');
      setStudiosList(await stRes.json());

      const mkRes = await fetch('/api/makeup');
      setMakeupList(await mkRes.json());

      const ntRes = await fetch('/api/notices?keyword=');
      setNoticesList(await ntRes.json());

      const revRes = await fetch('/api/reviews?keyword=');
      setReviewsList(await revRes.json());

      const resRes = await fetch('/api/reservations');
      setReservationsList(await resRes.json());

      const cpRes = await fetch('/api/coupons?keyword=');
      setCouponsList(await cpRes.json());

      const conRes = await fetch('/api/contracts?keyword=');
      setContractsList(await conRes.json());

      const chatRes = await fetch('/api/chat?keyword=');
      setChatMessages(await chatRes.json());

      const adrRes = await fetch('/api/profile/address?keyword=');
      const adrData = await adrRes.json();
      if (adrData && adrData.length > 0) {
        setUserAddress(adrData[0].address);
        setAddressInput(adrData[0].address);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 1. Login submission (site017-bug01)
  const handleLoginSubmit = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        showToast('정상 로그인 완료되었습니다.');
      } else {
        showToast('로그인 실패: 정보를 확인하세요.');
      }
      triggerSecurityAlert(
        'site017-bug01',
        'SEC-161',
        '/api/login',
        'username',
        '로그인 폼 입력값의 SQL Escape 검증 누락으로 주입한 인증 조건에 따라 조회 분기 처리가 변형되어 인증이 우회되는 결함을 야기합니다.'
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Register Form (site017-bug02)
  const handleRegisterSubmit = async () => {
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, password: regPassword, name: regName })
      });
      showToast('가입 신청 완료되었습니다.');
      triggerSecurityAlert(
        'site017-bug02',
        'SEC-162',
        '/api/register',
        'username',
        '회원 가입 폼의 사용자 아이디 필드에 조건문을 기입하여 데이터 조회 및 유효성 판단 분기를 조작할 수 있습니다.'
      );
      setRegUsername('');
      setRegPassword('');
      setRegName('');
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Address Update (site017-bug03)
  const handleAddressSubmit = async () => {
    try {
      await fetch('/api/profile/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressInput })
      });

      const reload = await fetch(`/api/profile/address?keyword=${encodeURIComponent(addressInput)}`);
      const adrData = await reload.json();
      if (adrData && adrData.length > 0) {
        setUserAddress(adrData[0].address);
      }

      triggerSecurityAlert(
        'site017-bug03',
        'SEC-163',
        '/api/profile/address',
        'address',
        '개인 프로필 주소지 입력란 매개변수가 바인딩 처리 없이 조회 조건절에 결합되어 다른 사용자의 주소지 정보 조회를 변조시킵니다.'
      );
      showToast('주소 정보가 반영되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Coupon Register (site017-bug04)
  const handleCouponSubmit = async () => {
    try {
      await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput })
      });

      const reload = await fetch(`/api/coupons?keyword=${encodeURIComponent(couponInput)}`);
      setCouponsList(await reload.json());

      triggerSecurityAlert(
        'site017-bug04',
        'SEC-164',
        '/api/coupons',
        'code',
        '쿠폰 번호 입력 필드 정보 기입 시 Escape 처리가 배제되어 데이터 조회 조건의 변동을 감지할 수 있습니다.'
      );
      setCouponInput('');
      showToast('쿠폰 등록 절차가 접수되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Sort venues (site017-bug05 & Bug06)
  const handleVenuesQuery = async () => {
    try {
      const res = await fetch(`/api/venues?sort=${encodeURIComponent(sortInput)}&page=${encodeURIComponent(pageInput)}`);
      setVenuesList(await res.json());

      if (sortInput) {
        triggerSecurityAlert(
          'site017-bug05',
          'SEC-165',
          '/api/venues?sort=',
          'sort',
          '웨딩홀 정렬 매개변수에 조건식을 전달하여 백엔드 조회 쿼리 내부의 매칭 규칙을 교란시킵니다.'
        );
      } else if (pageInput) {
        triggerSecurityAlert(
          'site017-bug06',
          'SEC-166',
          '/api/venues?page=',
          'page',
          '페이지네이션 인수 값이 바인딩 없이 처리되어 SQL Injection 조건 분기가 적용됩니다.'
        );
      }
      showToast('조회 필터가 갱신되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Contract Upload (site017-bug07)
  const handleContractSubmit = async () => {
    try {
      await fetch('/api/contracts/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: contractFilenameInput, description: contractDescInput })
      });

      const reload = await fetch(`/api/contracts?keyword=${encodeURIComponent(contractFilenameInput)}`);
      setContractsList(await reload.json());

      triggerSecurityAlert(
        'site017-bug07',
        'SEC-167',
        '/api/contracts/upload',
        'filename',
        '업로드 계약서 파일 설명 기입 텍스트 매개변수의 안전 가공 부재로 다른 사용자의 예약 정보 및 계약 기록이 유출됩니다.'
      );
      setContractFilenameInput('');
      setContractDescInput('');
      showToast('계약 증빙 파일 설명이 저장되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Planner Chat (site017-bug08)
  const handleChatSubmit = async () => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chatInput })
      });

      const reload = await fetch(`/api/chat?keyword=${encodeURIComponent(chatInput)}`);
      setChatMessages(await reload.json());

      triggerSecurityAlert(
        'site017-bug08',
        'SEC-168',
        '/api/chat',
        'text',
        '플래너 실시간 채팅 메시지 데이터 기입 본문에 조건 분기를 주입하여 비공개 상담 히스토리가 전부 반환되는 취약점이 발생합니다.'
      );
      setChatInput('');
      showToast('상담 전송이 완료되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Notices view (site017-bug09)
  const handleNoticeQuery = async () => {
    try {
      const res = await fetch(`/api/notices?keyword=${encodeURIComponent(noticeKeywordInput)}`);
      setNoticesList(await res.json());

      triggerSecurityAlert(
        'site017-bug09',
        'SEC-169',
        '/api/notices',
        'keyword',
        '공지사항 키워드 조회 인수 조작에 의해 숨겨진 공지 데이터 조회 기준을 교란할 수 있습니다.'
      );
      showToast('공지사항이 업데이트되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Review Submit (site017-bug10)
  const handleReviewSubmit = async () => {
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewInput })
      });

      const reload = await fetch(`/api/reviews?keyword=${encodeURIComponent(reviewInput)}`);
      setReviewsList(await reload.json());

      triggerSecurityAlert(
        'site017-bug10',
        'SEC-170',
        '/api/reviews',
        'text',
        '리뷰 별점 코멘트 입력 시 조건문을 주입하여 전체 매칭 리뷰 목록 조회가 왜곡됩니다.'
      );
      setReviewInput('');
      showToast('리뷰 작성 완료되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // Normal Feature: Add Reservation
  const handleReservationSubmit = async () => {
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: reservationTitleInput, date: reservationDateInput })
      });
      const reload = await fetch('/api/reservations');
      setReservationsList(await reload.json());
      setReservationTitleInput('');
      showToast('신규 상담 일정이 정상 기입되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-root">
      
      {/* Header Banner */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('venues'); setSelectedVenueId(null); }}>
            <span className="logo-icon">✨</span> Amore Wedding
          </a>
          
          <nav className="header-nav">
            <a href="#" className={`nav-link ${activeTab === 'venues' ? 'active' : ''}`} onClick={() => { setActiveTab('venues'); setSelectedVenueId(null); }}>Venues</a>
            <a href="#" className={`nav-link ${activeTab === 'dresses' ? 'active' : ''}`} onClick={() => { setActiveTab('dresses'); setSelectedVenueId(null); }}>Dresses</a>
            <a href="#" className={`nav-link ${activeTab === 'studios' ? 'active' : ''}`} onClick={() => { setActiveTab('studios'); setSelectedVenueId(null); }}>Studios</a>
            <a href="#" className={`nav-link ${activeTab === 'makeup' ? 'active' : ''}`} onClick={() => { setActiveTab('makeup'); setSelectedVenueId(null); }}>Makeup</a>
            <a href="#" className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => { setActiveTab('reviews'); setSelectedVenueId(null); }}>Reviews</a>
          </nav>
        </div>

        <div className="header-right">
          {isLoggedIn ? (
            <div className="user-badge">
              <span>👰‍♀️</span>
              <span>{currentUser?.name || '김태희'} 신부님</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>비로그인 상태</span>
          )}
        </div>
      </header>

      {/* Main Grid container */}
      <div className="app-container">
        
        {/* Left menu sidebar */}
        <aside className="left-sidebar">
          {/* User Sign in and registration */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-rosegold)' }}>💍 마이 웨딩 보드 제어</h4>
            {!isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예비 신부 아이디"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="비밀번호"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={handleLoginSubmit}>로그인</button>
                
                <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
                
                <input
                  type="text"
                  className="form-input"
                  placeholder="가입자명"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="희망 아이디"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="신규 패스워드"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <button className="btn-outline" style={{ padding: '0.5rem', fontSize: '0.75rem' }} onClick={handleRegisterSubmit}>회원 가입</button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', marginBottom: '0.6rem' }}>환영합니다! 예식 기본 주소를 관리해 주세요.</p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="신부 수령 주소지 입력..."
                  style={{ marginBottom: '0.4rem' }}
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
                <button className="btn-primary" style={{ padding: '0.5rem', width: '100%', fontSize: '0.8rem' }} onClick={handleAddressSubmit}>주소 변경 저장</button>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-gray)', marginTop: '0.6rem' }}>
                  현재 보관 주소: {userAddress || '서울 반포동'}
                </div>
              </div>
            )}
          </div>

          <div className="card-container">
            <ul className="menu-list">
              <li className={`menu-item ${activeTab === 'venues' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('venues'); setSelectedVenueId(null); }}>💒 프리미엄 웨딩홀 베뉴</button>
              </li>
              <li className={`menu-item ${activeTab === 'dresses' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('dresses'); setSelectedVenueId(null); }}>👗 실크 드레스 콜렉션</button>
              </li>
              <li className={`menu-item ${activeTab === 'studios' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('studios'); setSelectedVenueId(null); }}>📷 스튜디오 촬영 패키지</button>
              </li>
              <li className={`menu-item ${activeTab === 'makeup' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('makeup'); setSelectedVenueId(null); }}>💄 메이크업 & 헤어 코디</button>
              </li>
              <li className={`menu-item ${activeTab === 'planner-chat' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('planner-chat'); setSelectedVenueId(null); }}>💬 1:1 전담 플래너 상담</button>
              </li>
              <li className={`menu-item ${activeTab === 'contracts' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('contracts'); setSelectedVenueId(null); }}>📄 예식 계약 서류 보관</button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Center Panel */}
        <main className="center-content">
          {isLoading ? (
            <div style={{ margin: 'auto', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <p>웨딩 데이터를 매칭 조율하는 중입니다...</p>
            </div>
          ) : (
            <>
              {/* Venues search view */}
              {activeTab === 'venues' && !selectedVenueId && (
                <div>
                  <div className="hero-banner" style={{ marginBottom: '2rem' }}>
                    <div className="hero-info">
                      <h2 className="hero-title">나를 빛나게 하는 단 하나의 베뉴</h2>
                      <p className="hero-desc">아모르 그랜드 볼룸과 함께 일생 최고의 럭셔리 웨딩을 기획하세요. 시즌 예약 특전으로 드레스 대여 혜택 마일리지를 적립해 드립니다.</p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=200&q=80" alt="Wedding hall" className="hero-img" />
                  </div>

                  {/* Filter and sorting venues */}
                  <div className="card-container" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-beige)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>🔍 웨딩홀 맞춤 정렬 및 페이지 필터</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="정렬 기준 (예: rating)"
                        value={sortInput}
                        onChange={(e) => setSortInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="조회 페이지 (예: 1)"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleVenuesQuery}>정렬 필터 갱신</button>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderLeft: '4px solid var(--primary-rosegold)', paddingLeft: '0.6rem' }}>웨딩홀 매칭 리스트</h3>
                  <div className="venues-grid">
                    {venuesList.map((v) => (
                      <div key={v.id} className="venue-card" onClick={() => setSelectedVenueId(v.id)}>
                        <img src={v.image} alt={v.title} className="venue-img" />
                        <div className="venue-info">
                          <h4 className="venue-name">{v.title}</h4>
                          <span className="venue-price">{v.price}</span>
                          <div className="venue-meta">
                            <span className="badge-rose">추천 만족도 {v.rating}</span>
                            <span>{v.info.slice(0, 15)}...</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dresses view */}
              {activeTab === 'dresses' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>👗 실크 드레스 컬렉션</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    신부님을 가장 돋보이게 설계한 수입 실크 에이라인 명가 명품 라인업입니다.
                  </p>

                  <div className="venues-grid">
                    {dressesList.map((dr) => (
                      <div key={dr.id} className="venue-card">
                        <img src={dr.image} alt={dr.title} className="venue-img" />
                        <div className="venue-info">
                          <h4 className="venue-name">{dr.title}</h4>
                          <strong className="venue-price">{dr.price}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{dr.brand}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Studios view */}
              {activeTab === 'studios' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📷 웨딩 스튜디오 연출 스냅</h3>
                  
                  {studiosList.map((st) => (
                    <div key={st.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '20px', backgroundColor: 'var(--bg-ivory)', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-rosegold)' }}>{st.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.3rem' }}>{st.type} | {st.price}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Makeup view */}
              {activeTab === 'makeup' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💄 헤어 & 메이크업 글로우 디자이너</h3>
                  
                  {makeupList.map((mk) => (
                    <div key={mk.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '20px', backgroundColor: 'var(--bg-ivory)', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{mk.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.3rem' }}>{mk.type} | {mk.price}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews view (Bug10) */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💬 예식 실제 고객 이용 리뷰</h3>
                  
                  <div className="card-container" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-rosegold)' }}>📝 실제 이용 소감 작성</h4>
                    <div className="form-group">
                      <textarea
                        className="form-input form-textarea"
                        placeholder="이용하신 웨딩홀, 드레스, 스튜디오에 대한 후기를 기입해 주세요..."
                        value={reviewInput}
                        onChange={(e) => setReviewInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleReviewSubmit}>리뷰 등록</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>작성된 생생 후기 피드</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {reviewsList.map((rev) => (
                      <div key={rev.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '15px', backgroundColor: 'var(--bg-ivory)' }}>
                        <strong>{rev.writer} 님</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.3rem' }}>{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat View (Bug08) */}
              {activeTab === 'planner-chat' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💬 1:1 동반 플래너 메신저</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    원하시는 베뉴 스타일링과 시간대에 맞춰 상담 플래너와 실시간 상담이 조율됩니다.
                  </p>

                  <div className="chat-window" style={{ marginBottom: '1rem' }}>
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`chat-bubble ${msg.sender === 'planner' ? 'planner' : 'customer'}`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="상담을 원하시는 상세 내역 입력..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleChatSubmit}>전송</button>
                  </div>
                </div>
              )}

              {/* Contracts upload (Bug07) */}
              {activeTab === 'contracts' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📄 예식 계약 관련 정산 증빙 서류 관리</h3>
                  
                  <div className="card-container" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-rosegold)' }}>🆕 계약 보관용 설명 기입</h4>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="계약서 파일 이름 기입..."
                        value={contractFilenameInput}
                        onChange={(e) => setContractFilenameInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="계약서 상세 요약 설명 기입..."
                        value={contractDescInput}
                        onChange={(e) => setContractDescInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleContractSubmit}>계약 파일 등록</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>보관 계약 리스트</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {contractsList.map((con) => (
                      <div key={con.id} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-ivory)' }}>
                        <strong>{con.filename}</strong> | {con.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detail Venue view */}
              {selectedVenueId && (() => {
                const item = venuesList.find(v => v.id === selectedVenueId);
                if (!item) return <p>웨딩홀을 조회할 수 없습니다.</p>;
                return (
                  <div className="detail-view">
                    <button className="btn-outline" style={{ width: 'max-content', marginBottom: '0.5rem' }} onClick={() => setSelectedVenueId(null)}>
                      ← 웨딩홀 전체 베뉴로 돌아가기
                    </button>

                    <img src={item.image} alt={item.title} className="detail-img" />
                    <div>
                      <span className="badge-rose" style={{ display: 'inline-block', marginBottom: '0.4rem' }}>프리미엄 베뉴</span>
                      <h2 className="detail-title">{item.title}</h2>
                      <span className="venue-price" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.3rem' }}>{item.price}</span>
                    </div>

                    <div className="detail-meta">
                      <span>베뉴 종합 평점: ⭐ {item.rating} / 5.0</span>
                      <span>•</span>
                      <span>규모 정보: {item.info}</span>
                    </div>

                    <p className="detail-desc">
                      아모르 제휴 공식 웨딩홀 명가 베뉴입니다. 고풍스러운 버진로드 플라워 데코와 최고급 특급 뷔페 연회장이 장점이며, 하객분들을 모시기에 완벽한 주차 편의 인프라와 세련된 예식 연출 장비를 완벽히 지니고 있는 명품 베뉴입니다.
                    </p>

                    <button className="btn-primary" style={{ padding: '1rem', fontSize: '1rem' }} onClick={() => { showToast('선택하신 날짜로 베뉴 가계약 검토가 임시 등록되었습니다.'); setSelectedVenueId(null); }}>
                      아모르 그랜드 홀 잔여타임 실시간 투어 예약하기
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </main>

        {/* Right Info Sidebar */}
        <aside className="right-sidebar">
          {/* Discount Coupons registration (Bug04) */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-rosegold)' }}>🎟️ 예식 프로모션 할인 쿠폰 등록</h4>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="할인 쿠폰 키코드 기입..."
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleCouponSubmit}>등록</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem', marginTop: '0.8rem' }}>
              {couponsList.map((cp) => (
                <div key={cp.id} style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-ivory)' }}>
                  코드: <strong>{cp.code}</strong> (할인율: {cp.discount})
                </div>
              ))}
            </div>
          </div>

          {/* Quick interactive reservation scheduler */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-rosegold)' }}>📅 홀 투어 및 예식 잔여 스케줄</h4>
            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="일정 명칭 입력..."
                style={{ padding: '0.4rem', fontSize: '0.78rem', marginBottom: '0.3rem' }}
                value={reservationTitleInput}
                onChange={(e) => setReservationTitleInput(e.target.value)}
              />
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.4rem', fontSize: '0.78rem' }}
                value={reservationDateInput}
                onChange={(e) => setReservationDateInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.78rem', width: '100%', marginTop: '0.3rem' }} onClick={handleReservationSubmit}>스케줄 등록</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem' }}>
              {reservationsList.map((r) => (
                <div key={r.id} style={{ padding: '0.4rem', backgroundColor: 'var(--primary-light)', borderRadius: '6px' }}>
                  📅 {r.date} : {r.title}
                </div>
              ))}
            </div>
          </div>

          {/* Notice inquiry keyword (Bug09) */}
          <div className="card-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-rosegold)' }}>📢 긴급 공지 검색</h4>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="공지 사항 키워드 입력..."
                value={noticeKeywordInput}
                onChange={(e) => setNoticeKeywordInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleNoticeQuery}>검색</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.72rem' }}>
              {noticesList.map((n) => (
                <div key={n.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                  <strong>{n.title}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Pop-up System Alert Modal (Triggers on SQL Injection) */}
      {securityModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1300 }}>
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">🚨 시스템 데이터 무결성 검증 경고</span>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 700, color: '#d32f2f', marginBottom: '0.5rem' }}>
                입력 데이터 분석 오류 감지: SQL 인젝션 가능성 식별
              </p>
              <div style={{ backgroundColor: 'var(--bg-ivory)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <div><strong>오류 식별 부호 (ID):</strong> <span style={{ color: '#d32f2f', fontWeight: 800 }}>{securityModal.bugId}</span></div>
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
