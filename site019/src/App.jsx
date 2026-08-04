import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState('programs');
  const [selectedProgId, setSelectedProgId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // System disclosure warning popup
  const [securityModal, setSecurityModal] = useState({
    isOpen: false,
    bugId: '',
    csvId: '',
    errorName: '',
    errorMessage: '',
    stackTrace: '',
    sqlMessage: '',
    internalPath: ''
  });

  const triggerSecurityAlert = (bugId, csvId, errorName, errorMessage, stackTrace, sqlMessage, internalPath) => {
    setSecurityModal({
      isOpen: true,
      bugId,
      csvId,
      errorName,
      errorMessage,
      stackTrace,
      sqlMessage,
      internalPath
    });
  };

  // Mock Database lists
  const [programsList, setProgramsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [noticesList, setNoticesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [reservationsList, setReservationsList] = useState([]);
  const [userAddress, setUserAddress] = useState('');

  // Form Inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [filterInput, setFilterInput] = useState('');
  const [sortInput, setSortInput] = useState('');
  const [pageInput, setPageInput] = useState('1');
  const [filenameInput, setFilenameInput] = useState('');
  const [fileDescInput, setFileDescInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [noticeKeywordInput, setNoticeKeywordInput] = useState('');
  const [reviewInput, setReviewInput] = useState('');
  const [resDateInput, setResDateInput] = useState('2026-08-15');
  const [resTimeInput, setResTimeInput] = useState('14:00');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Initial Fetches
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const progRes = await fetch('/api/programs?filter=&sort=&page=');
      setProgramsList(await progRes.json());

      const cpRes = await fetch('/api/coupons');
      setCouponsList(await cpRes.json());

      const fileRes = await fetch('/api/files');
      setUploadedFiles(await fileRes.json());

      const chatRes = await fetch('/api/chat');
      setChatMessages(await chatRes.json());

      const ntRes = await fetch('/api/notices?keyword=');
      setNoticesList(await ntRes.json());

      const revRes = await fetch('/api/reviews');
      setReviewsList(await revRes.json());

      const resRes = await fetch('/api/reservations');
      setReservationsList(await resRes.json());

      const adrRes = await fetch('/api/profile/address');
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

  // Handle Response checks for system disclosure
  const checkResponse = async (res, bugId, csvId) => {
    if (!res.ok) {
      const data = await res.json();
      if (data.status === 'error' && data.error) {
        triggerSecurityAlert(
          bugId,
          csvId,
          data.error.name,
          data.error.message,
          data.error.stack,
          data.error.sqlMessage,
          data.error.internalPath
        );
        return true;
      }
    }
    return false;
  };

  // 1. Program Filter system disclosure (site019-bug01 & Bug06 & Bug07)
  const handleProgramsQuery = async () => {
    try {
      const res = await fetch(`/api/programs?filter=${encodeURIComponent(filterInput)}&sort=${encodeURIComponent(sortInput)}&page=${encodeURIComponent(pageInput)}`);
      
      const hit01 = await checkResponse(res, 'site019-bug01', 'SEC-190');
      if (hit01) return;
      const hit06 = await checkResponse(res, 'site019-bug06', 'SEC-195');
      if (hit06) return;
      const hit07 = await checkResponse(res, 'site019-bug07', 'SEC-196');
      if (hit07) return;

      if (res.ok) {
        setProgramsList(await res.json());
        showToast('PT 프로그램 조회가 갱신되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Login Module (site019-bug02)
  const handleLoginSubmit = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const hit = await checkResponse(res, 'site019-bug02', 'SEC-191');
      if (hit) return;

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        showToast('로그인이 완료되었습니다.');
      } else {
        showToast('인증 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Register Module (site019-bug03)
  const handleRegisterSubmit = async () => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, name: regName })
      });

      const hit = await checkResponse(res, 'site019-bug03', 'SEC-192');
      if (hit) return;

      if (res.ok) {
        showToast('회원가입이 접수되었습니다.');
        setRegUsername('');
        setRegName('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Address modification (site019-bug04)
  const handleAddressSubmit = async () => {
    try {
      const res = await fetch('/api/profile/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressInput })
      });

      const hit = await checkResponse(res, 'site019-bug04', 'SEC-193');
      if (hit) return;

      if (res.ok) {
        const data = await res.json();
        setUserAddress(data.data.address);
        showToast('기본 주소지가 등록되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Coupon registration (site019-bug05)
  const handleCouponSubmit = async () => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput })
      });

      const hit = await checkResponse(res, 'site019-bug05', 'SEC-194');
      if (hit) return;

      if (res.ok) {
        const cpReload = await fetch('/api/coupons');
        setCouponsList(await cpReload.json());
        setCouponInput('');
        showToast('할인 쿠폰이 적용되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. File upload (site019-bug08)
  const handleFileUpload = async () => {
    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: filenameInput, description: fileDescInput })
      });

      const hit = await checkResponse(res, 'site019-bug08', 'SEC-197');
      if (hit) return;

      if (res.ok) {
        const fileReload = await fetch('/api/files');
        setUploadedFiles(await fileReload.json());
        setFilenameInput('');
        setFileDescInput('');
        showToast('운동 식단 파일이 등록되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Trainer Chat (site019-bug09)
  const handleChatSubmit = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chatInput })
      });

      const hit = await checkResponse(res, 'site019-bug09', 'SEC-198');
      if (hit) return;

      if (res.ok) {
        const chatReload = await fetch('/api/chat');
        setChatMessages(await chatReload.json());
        setChatInput('');
        showToast('메시지가 전송되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Notices lookups (site019-bug10)
  const handleNoticesQuery = async () => {
    try {
      const res = await fetch(`/api/notices?keyword=${encodeURIComponent(noticeKeywordInput)}`);

      const hit = await checkResponse(res, 'site019-bug10', 'SEC-199');
      if (hit) return;

      if (res.ok) {
        setNoticesList(await res.json());
        showToast('공지사항 필터 조회가 정상 완료되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Review creation (site019-bug11)
  const handleReviewSubmit = async () => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewInput })
      });

      const hit = await checkResponse(res, 'site019-bug11', 'SEC-200');
      if (hit) return;

      if (res.ok) {
        const revReload = await fetch('/api/reviews');
        setReviewsList(await revReload.json());
        setReviewInput('');
        showToast('리뷰가 정상 게시되었습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Normal Feature: Add Reservation
  const handleReservationSubmit = async (programTitle) => {
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgId || 'prog-1',
          date: resDateInput,
          time: resTimeInput,
          title: `${programTitle} 상담 예약`
        })
      });
      const reload = await fetch('/api/reservations');
      setReservationsList(await reload.json());
      showToast('상담 세션 일정이 캘린더에 연동되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-root">
      
      {/* Header Banner */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('programs'); setSelectedProgId(null); }}>
            <span className="logo-icon">⚡</span> NeonFit
          </a>
          
          <nav className="header-nav">
            <a href="#" className={`nav-link ${activeTab === 'programs' ? 'active' : ''}`} onClick={() => { setActiveTab('programs'); setSelectedProgId(null); }}>Programs</a>
            <a href="#" className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => { setActiveTab('chat'); setSelectedProgId(null); }}>1:1 Trainer Chat</a>
            <a href="#" className={`nav-link ${activeTab === 'files' ? 'active' : ''}`} onClick={() => { setActiveTab('files'); setSelectedProgId(null); }}>Diet Logs</a>
            <a href="#" className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => { setActiveTab('reviews'); setSelectedProgId(null); }}>Reviews</a>
          </nav>
        </div>

        <div className="header-right">
          {isLoggedIn ? (
            <div className="user-badge">
              <span>🔋</span>
              <span>{currentUser?.name || '김태희'} MVP 회원</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>GUEST</span>
          )}
        </div>
      </header>

      {/* Main Grid container */}
      <div className="app-container">
        
        {/* Left menu sidebar */}
        <aside className="left-sidebar">
          {/* User Sign in and registration */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-neon)' }}>💪 마이 피트니스 계정</h4>
            {!isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="회원 아이디 ('error' 입력 시 디버그 에러)"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="패스워드"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={handleLoginSubmit}>로그인</button>
                
                <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
                
                <input
                  type="text"
                  className="form-input"
                  placeholder="신규 가입자 이름"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="희망 아이디 ('error' 시 에러)"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
                <button className="btn-outline" style={{ padding: '0.5rem', fontSize: '0.75rem' }} onClick={handleRegisterSubmit}>회원 가입</button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', marginBottom: '0.6rem' }}>락커 배송 수령 주소지를 관리하세요.</p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="배송 수령 주소지 기입..."
                  style={{ marginBottom: '0.4rem' }}
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
                <button className="btn-primary" style={{ padding: '0.5rem', width: '100%', fontSize: '0.8rem' }} onClick={handleAddressSubmit}>주소지 변경 저장</button>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-gray)', marginTop: '0.6rem' }}>
                  현재 주소: {userAddress || '서울 반포동'}
                </div>
              </div>
            )}
          </div>

          <div className="card-container">
            <ul className="menu-list">
              <li className={`menu-item ${activeTab === 'programs' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('programs'); setSelectedProgId(null); }}>🏋️ PT 트레이닝 베뉴</button>
              </li>
              <li className={`menu-item ${activeTab === 'chat' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('chat'); setSelectedProgId(null); }}>💬 1:1 담당 코치 상담</button>
              </li>
              <li className={`menu-item ${activeTab === 'files' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('files'); setSelectedProgId(null); }}>📄 식단 및 칼로리 보관함</button>
              </li>
              <li className={`menu-item ${activeTab === 'reviews' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('reviews'); setSelectedProgId(null); }}>⭐ 회원 생생 이용 리뷰</button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Center Panel */}
        <main className="center-content">
          {isLoading ? (
            <div style={{ margin: 'auto', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-gray)' }}>
              <p>피트니스 정보망을 로드하는 중입니다...</p>
            </div>
          ) : (
            <>
              {/* Programs list view */}
              {activeTab === 'programs' && !selectedProgId && (
                <div>
                  <div className="hero-banner" style={{ marginBottom: '2rem' }}>
                    <div className="hero-info">
                      <h2 className="hero-title">바디프로필 단기 속성 클래스 런칭!</h2>
                      <p className="hero-desc">제이슨 수석 트레이너와 함께 체지방 8% 감량 목표를 수립하세요. 쿠폰을 적용하시면 15% 즉시 추가 할인이 가능합니다.</p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80" alt="Tabata" className="hero-img" />
                  </div>

                  {/* Filter and sorting programs (SEC-190, SEC-195, SEC-196) */}
                  <div className="card-container" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-light)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--primary-neon)' }}>🔍 PT 프로그램 맞춤 정렬 및 필터</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="카테고리 필터 (Diet, Strength, Body)"
                        value={filterInput}
                        onChange={(e) => setFilterInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="정렬 기준 (rating)"
                        value={sortInput}
                        onChange={(e) => setSortInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="페이지 번호 (1)"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleProgramsQuery}>정렬 필터 갱신</button>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderLeft: '4px solid var(--primary-neon)', paddingLeft: '0.6rem' }}>PT 프로그램 라인업</h3>
                  <div className="programs-grid">
                    {programsList.map((p) => (
                      <div key={p.id} className="program-card" onClick={() => setSelectedProgId(p.id)}>
                        <img src={p.image} alt={p.title} className="program-img" />
                        <div className="program-info">
                          <h4 className="program-name">{p.title}</h4>
                          <span className="program-price">{p.price}</span>
                          <div className="program-meta">
                            <span className="badge-neon">만족도 {p.rating}</span>
                            <span>{p.trainer}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet logs files view (Bug08) */}
              {activeTab === 'files' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📄 식단 계획서 및 칼로리 정산 이력 보관함</h3>
                  
                  <div className="card-container" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-neon)' }}>🆕 식단 파일 정보 기입</h4>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="파일 명칭 기입..."
                        value={filenameInput}
                        onChange={(e) => setFilenameInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="파일 상세 설명 기입..."
                        value={fileDescInput}
                        onChange={(e) => setFileDescInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleFileUpload}>식단 파일 등록</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>보관 파일 목록</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {uploadedFiles.map((con) => (
                      <div key={con.id} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-light)' }}>
                        <strong>{con.name}</strong> | {con.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat View (Bug09) */}
              {activeTab === 'chat' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💬 1:1 담당 코치 실시간 상담</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    수립된 감량 계획에 관해 수석 트레이너에게 실시간 기재 사항 대화를 보내세요.
                  </p>

                  <div className="chat-window" style={{ marginBottom: '1rem' }}>
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`chat-bubble ${msg.sender === 'trainer' ? 'trainer' : 'customer'}`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="상담을 원하시는 상세 내역 기입..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleChatSubmit}>상담 발송</button>
                  </div>
                </div>
              )}

              {/* Reviews view (Bug11) */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>⭐ 회원 생생 이용 리뷰</h3>
                  
                  <div className="card-container" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-neon)' }}>📝 리뷰 코멘트 작성</h4>
                    <div className="form-group">
                      <textarea
                        className="form-input form-textarea"
                        placeholder="이용하신 강좌, 트레이너에 대한 상세 소감을 남겨주세요..."
                        value={reviewInput}
                        onChange={(e) => setReviewInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleReviewSubmit}>리뷰 등록</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>작성된 생생 후기 피드</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {reviewsList.map((rev) => (
                      <div key={rev.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '15px', backgroundColor: 'var(--bg-light)' }}>
                        <strong>{rev.writer}</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.3rem' }}>{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detail view */}
              {selectedProgId && (() => {
                const item = programsList.find(p => p.id === selectedProgId);
                if (!item) return <p>프로그램을 조회할 수 없습니다.</p>;
                return (
                  <div className="detail-view">
                    <button className="btn-outline" style={{ width: 'max-content', marginBottom: '0.5rem' }} onClick={() => setSelectedProgId(null)}>
                      ← 프로그램 전체 목록으로 가기
                    </button>

                    <img src={item.image} alt={item.title} className="detail-img" />
                    <div>
                      <span className="badge-neon" style={{ display: 'inline-block', marginBottom: '0.4rem' }}>{item.category}</span>
                      <h2 className="detail-title">{item.title}</h2>
                      <span className="program-price" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.3rem' }}>{item.price}</span>
                    </div>

                    <div className="detail-meta">
                      <span>베뉴 종합 평점: ⭐ {item.rating} / 5.0</span>
                      <span>•</span>
                      <span>담당 코치: {item.trainer}</span>
                    </div>

                    <p className="detail-desc">
                      NeonFit 수석 코치가 보증하는 맞춤형 트레이닝 세션입니다. 운동 역학에 근거한 기초 체력 빌드업 및 식단 피드백으로 정체기 돌파를 완벽하게 보장하며, 최첨단 지상 필라테스 기구와 전용 락커 혜택을 함께 누리실 수 있습니다.
                    </p>

                    {/* Booking Scheduler form */}
                    <div className="card-container" style={{ backgroundColor: 'var(--bg-light)', borderStyle: 'dotted' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-neon)' }}>📅 실시간 1회차 상담 방문 예약 예약하기</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <input
                          type="date"
                          className="form-input"
                          value={resDateInput}
                          onChange={(e) => setResDateInput(e.target.value)}
                        />
                        <input
                          type="time"
                          className="form-input"
                          value={resTimeInput}
                          onChange={(e) => setResTimeInput(e.target.value)}
                        />
                      </div>
                      <button className="btn-primary" onClick={() => handleReservationSubmit(item.title)}>방문 상담 예약 등록</button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>

        {/* Right Info Sidebar */}
        <aside className="right-sidebar">
          {/* Coupons registration (Bug05) */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-neon)' }}>🎟️ 예식 프로모션 할인 쿠폰 등록</h4>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="쿠폰 코드 기입..."
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleCouponSubmit}>등록</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem', marginTop: '0.8rem' }}>
              {couponsList.map((cp) => (
                <div key={cp.id} style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-light)' }}>
                  코드: <strong>{cp.code}</strong> (할인율: {cp.discount})
                </div>
              ))}
            </div>
          </div>

          {/* Notices searching (Bug10) */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-neon)' }}>📢 긴급 공지 검색</h4>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="공지 사항 키워드 입력..."
                value={noticeKeywordInput}
                onChange={(e) => setNoticeKeywordInput(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleNoticesQuery}>검색</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.72rem' }}>
              {noticesList.map((n) => (
                <div key={n.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                  <strong>{n.title}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Quick interactive reservation scheduler */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-neon)' }}>📅 마이 PT 예약 일정</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem' }}>
              {reservationsList.map((r) => (
                <div key={r.id} style={{ padding: '0.4rem', backgroundColor: 'var(--primary-glow)', borderRadius: '6px' }}>
                  📅 {r.date} {r.time} : {r.title}
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Pop-up System Alert Modal (Triggers on System disclosure error) */}
      {securityModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">🚨 System Exception Information Disclosure Alert</span>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
                Fatal Error Exception Trace Log:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-black)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <strong>Vulnerability ID:</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>{securityModal.bugId}</span> | <strong>CSV:</strong> {securityModal.csvId}
                </div>
                <div><strong>Exception Name:</strong> {securityModal.errorName}</div>
                <div><strong>Error Message:</strong> {securityModal.errorMessage}</div>
                <div><strong>Node Stack Trace:</strong>
                  <pre style={{ margin: '0.3rem 0', padding: '0.5rem', backgroundColor: 'var(--bg-black)', borderRadius: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#ff6b6b', fontSize: '0.72rem' }}>
                    {securityModal.stackTrace}
                  </pre>
                </div>
                <div><strong>SQL Engine message:</strong> <code style={{ color: '#ff6b6b' }}>{securityModal.sqlMessage}</code></div>
                <div><strong>Internal Path:</strong> <code style={{ color: 'var(--primary-neon)' }}>{securityModal.internalPath}</code></div>
              </div>
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
