import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPropId, setSelectedPropId] = useState(null);
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
  const [propertiesList, setPropertiesList] = useState([]);
  const [profile, setProfile] = useState({ intro: '', name: '', membership: '', contact: '' });
  const [inquiriesList, setInquiriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [reservationsList, setReservationsList] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [searchFiltersList, setSearchFiltersList] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);

  // Form Inputs
  const [searchKeyword, setSearchKeyword] = useState('');
  const [profileIntroInput, setProfileIntroInput] = useState('');
  const [inquiryInput, setInquiryInput] = useState('');
  const [propTitleInput, setPropTitleInput] = useState('');
  const [propPriceInput, setPropPriceInput] = useState('');
  const [propRegionInput, setPropRegionInput] = useState('');
  const [propCategoryInput, setPropCategoryInput] = useState('Apartment');
  const [fileDescInput, setFileDescInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [reservationMemoInput, setReservationMemoInput] = useState('');
  const [favoriteNoteInput, setFavoriteNoteInput] = useState('');
  const [paymentDescInput, setPaymentDescInput] = useState('');
  const [filterNameInput, setFilterNameInput] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Database state
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const propRes = await fetch('/api/properties/search?keyword=');
      setPropertiesList(await propRes.json());

      const profRes = await fetch('/api/profile?searchIntro=');
      setProfile(await profRes.json());

      const inqRes = await fetch('/api/inquiries?keyword=');
      setInquiriesList(await inqRes.json());

      const fileRes = await fetch('/api/files?keyword=');
      setFilesList(await fileRes.json());

      const cmtRes = await fetch('/api/comments?keyword=');
      setCommentsList(await cmtRes.json());

      const resRes = await fetch('/api/reservations?keyword=');
      setReservationsList(await resRes.json());

      const favRes = await fetch('/api/favorites?keyword=');
      setFavoritesList(await favRes.json());

      const payRes = await fetch('/api/payments?keyword=');
      setPaymentsList(await payRes.json());

      const fltRes = await fetch('/api/search/filter?name=');
      setSearchFiltersList(await fltRes.json());

      const mapRes = await fetch('/api/map');
      setMapPoints(await mapRes.json());
    } catch (err) {
      console.error("Error connecting to Mock Database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Search Query Stored XSS / SQL Injection (site016-bug01)
  const handleSearchSubmit = async () => {
    try {
      const res = await fetch(`/api/properties/search?keyword=${encodeURIComponent(searchKeyword)}`);
      setPropertiesList(await res.json());

      triggerSecurityAlert(
        'site016-bug01',
        'SEC-151',
        '/api/properties/search',
        'keyword',
        '검색어 필터 매개변수가 이스케이프 및 매개변수화 바인딩 없이 백엔드에서 동적 구문으로 병합되어 SQL Injection 조건 분기를 유발합니다.'
      );
      showToast('검색 결과가 업데이트되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Profile Intro modification (site016-bug02)
  const handleProfileSubmit = async () => {
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intro: profileIntroInput })
      });

      const reload = await fetch(`/api/profile?searchIntro=${encodeURIComponent(profileIntroInput)}`);
      setProfile(await reload.json());

      triggerSecurityAlert(
        'site016-bug02',
        'SEC-152',
        '/api/profile',
        'intro',
        '프로필 정보 수정 시 소개글 입력 텍스트가 바인딩 처리가 누락되어 프로필 조회 시 데이터베이스 조회를 변조시킵니다.'
      );
      setProfileIntroInput('');
      showToast('중개사 소개글이 변경되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Customer Inquiry submission (site016-bug03)
  const handleInquirySubmit = async () => {
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inquiryInput })
      });

      const reload = await fetch(`/api/inquiries?keyword=${encodeURIComponent(inquiryInput)}`);
      setInquiriesList(await reload.json());

      triggerSecurityAlert(
        'site016-bug03',
        'SEC-153',
        '/api/inquiries',
        'content',
        '1:1 문의 폼 내용 입력값의 SQL Escape가 적용되지 않아 원시 쿼리 구문 조작에 따른 타인의 문의 내역 노출을 야기합니다.'
      );
      setInquiryInput('');
      showToast('상담 문의가 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Property Registration (site016-bug04)
  const handlePropertySubmit = async () => {
    try {
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: propTitleInput,
          category: propCategoryInput,
          price: propPriceInput,
          region: propRegionInput
        })
      });

      const reload = await fetch(`/api/properties?title=${encodeURIComponent(propTitleInput)}`);
      setPropertiesList(await reload.json());

      triggerSecurityAlert(
        'site016-bug04',
        'SEC-154',
        '/api/properties',
        'title',
        '신규 등록 매물명 입력 필드가 정제되지 않고 저장되어 매물 검색 결과의 데이터가 비정상적으로 출력됩니다.'
      );
      setPropTitleInput('');
      setPropPriceInput('');
      setPropRegionInput('');
      showToast('신규 매물이 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. File Description (site016-bug05)
  const handleFileSubmit = async () => {
    try {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: fileDescInput })
      });

      const reload = await fetch(`/api/files?keyword=${encodeURIComponent(fileDescInput)}`);
      setFilesList(await reload.json());

      triggerSecurityAlert(
        'site016-bug05',
        'SEC-155',
        '/api/files',
        'description',
        '서류 파일 설명 기입 텍스트가 바인딩 처리가 누락되어 파일 검색 조회의 결과 수를 변조합니다.'
      );
      setFileDescInput('');
      showToast('증빙 파일이 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Comments input (site016-bug06)
  const handleCommentSubmit = async () => {
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentInput })
      });

      const reload = await fetch(`/api/comments?keyword=${encodeURIComponent(commentInput)}`);
      setCommentsList(await reload.json());

      triggerSecurityAlert(
        'site016-bug06',
        'SEC-156',
        '/api/comments',
        'text',
        '댓글 한줄평 텍스트 입력값의 필터링 부재로 인해 댓글 목록 조회 시 SQL 인젝션 조건 분기가 실행됩니다.'
      );
      setCommentInput('');
      showToast('한줄평 댓글이 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Reservation Memo (site016-bug07)
  const handleReservationSubmit = async () => {
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: reservationMemoInput })
      });

      const reload = await fetch(`/api/reservations?keyword=${encodeURIComponent(reservationMemoInput)}`);
      setReservationsList(await reload.json());

      triggerSecurityAlert(
        'site016-bug07',
        'SEC-157',
        '/api/reservations',
        'memo',
        '방문 일정 예약 메모 필드에 특수문자 제거 처리가 생략되어 다른 사용자의 예약 정보가 노출됩니다.'
      );
      setReservationMemoInput('');
      showToast('방문 상담 예약이 완료되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Favorites List (site016-bug08)
  const handleFavoriteSubmit = async () => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: favoriteNoteInput })
      });

      const reload = await fetch(`/api/favorites?keyword=${encodeURIComponent(favoriteNoteInput)}`);
      setFavoritesList(await reload.json());

      triggerSecurityAlert(
        'site016-bug08',
        'SEC-158',
        '/api/favorites',
        'note',
        '관심 매물 관리 메모란의 입력값이 그대로 병합되어 관심 매물 조회 결과 리스트의 조건 분기를 초래합니다.'
      );
      setFavoriteNoteInput('');
      showToast('관심 매물 메모 정보가 저장되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Down payment contract (site016-bug09)
  const handlePaymentSubmit = async () => {
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: paymentDescInput })
      });

      const reload = await fetch(`/api/payments?keyword=${encodeURIComponent(paymentDescInput)}`);
      setPaymentsList(await reload.json());

      triggerSecurityAlert(
        'site016-bug09',
        'SEC-159',
        '/api/payments',
        'description',
        '계약금 납부 상세 기재 사항 입력 시 매개변수화 바인딩이 적용되지 않아 결제 내역 조회 결과가 변조됩니다.'
      );
      setPaymentDescInput('');
      showToast('계약금 납부 신청이 접수되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Search Filter registration (site016-bug10)
  const handleFilterSubmit = async () => {
    try {
      await fetch('/api/search/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: filterNameInput })
      });

      const reload = await fetch(`/api/search/filter?name=${encodeURIComponent(filterNameInput)}`);
      setSearchFiltersList(await reload.json());

      triggerSecurityAlert(
        'site016-bug10',
        'SEC-160',
        '/api/search/filter',
        'name',
        '상세 검색 필터명 조건 등록 시 이스케이프 처리가 생략되어 필터 리스트 결과가 변조됩니다.'
      );
      setFilterNameInput('');
      showToast('검색 필터 조건이 추가되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-root">
      
      {/* Top Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedPropId(null); }}>
            <span className="logo-icon">🏡</span> HomeSpace
          </a>
          
          <nav className="header-nav">
            <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedPropId(null); }}>HomeSpace</a>
            <a href="#" className={`nav-link ${activeTab === 'buy' ? 'active' : ''}`} onClick={() => { setActiveTab('buy'); setSelectedPropId(null); }}>Buy</a>
            <a href="#" className={`nav-link ${activeTab === 'rent' ? 'active' : ''}`} onClick={() => { setActiveTab('rent'); setSelectedPropId(null); }}>Rent</a>
            <a href="#" className={`nav-link ${activeTab === 'map' ? 'active' : ''}`} onClick={() => { setActiveTab('map'); setSelectedPropId(null); }}>Map</a>
            <a href="#" className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => { setActiveTab('favorites'); setSelectedPropId(null); }}>Favorites</a>
            <a href="#" className={`nav-link ${activeTab === 'my-page' ? 'active' : ''}`} onClick={() => { setActiveTab('my-page'); setSelectedPropId(null); }}>My Page</a>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-badge">
            <span>👤</span>
            <span>최예리 (골드 파트너 중개사)</span>
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
                <button onClick={() => { setActiveTab('home'); setSelectedPropId(null); }}>🏠 홈 대시보드</button>
              </li>
              <li className={`menu-item ${activeTab === 'buy' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('buy'); setSelectedPropId(null); }}>🏢 아파트 / 빌라 매매</button>
              </li>
              <li className={`menu-item ${activeTab === 'rent' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('rent'); setSelectedPropId(null); }}>🔑 오피스텔 / 상가 월세</button>
              </li>
              <li className={`menu-item ${activeTab === 'map' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('map'); setSelectedPropId(null); }}>🗺️ 인터랙티브 지도 검색</button>
              </li>
              <li className={`menu-item ${activeTab === 'favorites' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('favorites'); setSelectedPropId(null); }}>⭐ 관심 매물 관리</button>
              </li>
              <li className={`menu-item ${activeTab === 'reservation' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('reservation'); setSelectedPropId(null); }}>📅 방문 상담 예약</button>
              </li>
              <li className={`menu-item ${activeTab === 'customer-center' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('customer-center'); setSelectedPropId(null); }}>💬 고객센터 및 1:1 상담</button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Center Main panel views */}
        <main className="center-content">
          {isLoading ? (
            <div style={{ margin: 'auto', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <p>실시간 매물 및 계약 정보를 로드하고 있습니다...</p>
            </div>
          ) : (
            <>
              {/* Home View */}
              {activeTab === 'home' && !selectedPropId && (
                <div>
                  <div className="hero-banner" style={{ marginBottom: '2rem' }}>
                    <div className="hero-info">
                      <h2 className="hero-title">에메랄드 포레스트 빌라 전세 오픈!</h2>
                      <p className="hero-desc">마포구 최고의 숲세권 신축 빌라 특별 혜택. 최예리 골드 중개사를 통해 안전한 가계약금 예치 및 우대 전세 대출 한도를 즉시 확인해보세요.</p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80" alt="Villa" className="hero-img" />
                  </div>

                  {/* Property Search (Bug01) */}
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="지역명, 매물명 또는 관심 키워드 검색..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleSearchSubmit}>매물 검색</button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderLeft: '4px solid var(--primary-emerald)', paddingLeft: '0.6rem' }}>추천 매물 라인업</h3>
                  <div className="properties-grid">
                    {propertiesList.map((p) => (
                      <div key={p.id} className="property-card" onClick={() => setSelectedPropId(p.id)}>
                        <img src={p.image} alt={p.title} className="property-img" />
                        <div className="property-info">
                          <h4 className="property-name">{p.title}</h4>
                          <span className="property-price">{p.price}</span>
                          <div className="property-meta">
                            <span className="badge-emerald">{p.category}</span>
                            <span>{p.region}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buy & Register Property View (Bug04) */}
              {activeTab === 'buy' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏢 아파트 / 빌라 매물 관리</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    파트너 공인중개사님이 보유한 신규 매물을 데이터베이스에 등록하거나 조회합니다.
                  </p>

                  <div className="card-container" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-light)', borderStyle: 'dashed' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-emerald)' }}>🆕 신규 매물 정보 기입</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="매물 명칭 (예: 에메랄드 메트로 스위트)"
                        value={propTitleInput}
                        onChange={(e) => setPropTitleInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="가격 조건 (예: 매매 5억)"
                        value={propPriceInput}
                        onChange={(e) => setPropPriceInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="소재 지역 (예: 서울 마포구)"
                        value={propRegionInput}
                        onChange={(e) => setPropRegionInput(e.target.value)}
                      />
                      <select 
                        className="form-input" 
                        value={propCategoryInput} 
                        onChange={(e) => setPropCategoryInput(e.target.value)}
                      >
                        <option value="Apartment">Apartment (아파트)</option>
                        <option value="Villa">Villa (빌라)</option>
                        <option value="Office">Office (오피스텔)</option>
                      </select>
                    </div>
                    <button className="btn-primary" onClick={handlePropertySubmit}>매물 정보 등록</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>현재 등록된 추천 매물 리스트</h4>
                  <div className="properties-grid">
                    {propertiesList.map((p) => (
                      <div key={p.id} className="property-card" onClick={() => setSelectedPropId(p.id)}>
                        <img src={p.image} alt={p.title} className="property-img" />
                        <div className="property-info">
                          <h4 className="property-name">{p.title}</h4>
                          <span className="property-price">{p.price}</span>
                          <div className="property-meta">
                            <span className="badge-emerald">{p.category}</span>
                            <span>{p.region}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rent & Contract Files View (Bug05 & Bug10) */}
              {activeTab === 'rent' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🔑 임대 정보 및 증빙 계약 서류 관리</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    상가/오피스텔 임대차 계약금 정산 파일 등록 및 상세 검색 필터를 구성합니다.
                  </p>

                  {/* SEC-155 File register form */}
                  <div className="card-container" style={{ marginBottom: '1.8rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-emerald)' }}>📄 단체 정산용 증빙 파일 상세 설명 등록</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="정산 파일 관련 설명 정보 입력..."
                        value={fileDescInput}
                        onChange={(e) => setFileDescInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleFileSubmit}>증빙 등록</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.8rem' }}>
                      {filesList.map((f) => (
                        <div key={f.id} style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-light)' }}>
                          <strong>파일명:</strong> {f.name} | <strong>설명:</strong> {f.description}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEC-160 Search filter registration */}
                  <div className="card-container" style={{ backgroundColor: 'var(--primary-light)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📂 임대 매물 상세 맞춤 검색 필터 설정</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="필터 명칭 기입 (예: 서울 역세권 월세 필터)..."
                        value={filterNameInput}
                        onChange={(e) => setFilterNameInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleFilterSubmit}>조건 저장</button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '0.8rem' }}>
                      최근 보관된 상세 필터 조건:
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                        {searchFiltersList.map(flt => (
                          <span key={flt.id} className="badge-emerald">{flt.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map view */}
              {activeTab === 'map' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🗺️ 인터랙티브 지도 검색</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                    주요 계약 거점 지점 및 주변 매물 수량을 시뮬레이션 지도를 통해 조회합니다.
                  </p>

                  <div className="map-sim-box" style={{ marginBottom: '1.5rem' }}>
                    {mapPoints.map((pin, i) => (
                      <div 
                        key={i} 
                        className="map-pin" 
                        style={{ top: `${35 + i * 20}%`, left: `${25 + i * 25}%` }}
                      >
                        📍 {pin.name} ({pin.count}개)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites & Payment View (Bug08 & Bug09) */}
              {activeTab === 'favorites' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>⭐ 관심 매물 및 계약금 관리</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    고객님이 보관한 관심 매물의 상세 메모를 관리하거나 계약금 납부 정보를 확인합니다.
                  </p>

                  {/* SEC-158 Favorites list */}
                  <div className="card-container" style={{ marginBottom: '1.8rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-emerald)' }}>🔖 관심 매물 메모 정보 저장</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="관심 매물 관리 메모 입력..."
                        value={favoriteNoteInput}
                        onChange={(e) => setFavoriteNoteInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handleFavoriteSubmit}>메모 보관</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.8rem' }}>
                      {favoritesList.map((fav) => (
                        <div key={fav.id} style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-light)' }}>
                          ⭐ {fav.note}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEC-159 Payment Receipt list */}
                  <div className="card-container" style={{ backgroundColor: 'var(--bg-light)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-dark)' }}>💸 매물 가계약금 예치 및 기재 사항 신청</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="가계약 건에 관한 상세 설명 입력..."
                        value={paymentDescInput}
                        onChange={(e) => setPaymentDescInput(e.target.value)}
                      />
                      <button className="btn-primary" onClick={handlePaymentSubmit}>신청 접수</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.8rem' }}>
                      {paymentsList.map((pay) => (
                        <div key={pay.id} style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-white)' }}>
                          <strong>금액:</strong> ₩{pay.amount} | <strong>상세내역:</strong> {pay.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Visit Schedule Reservation View (Bug07) */}
              {activeTab === 'reservation' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📅 방문 상담 예약 스케줄러</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    실제 매물 확인 및 방문 상담을 원하시는 날짜와 메모를 등록하세요.
                  </p>

                  <div className="card-container" style={{ marginBottom: '1.8rem', backgroundColor: 'var(--primary-light)', borderStyle: 'dashed' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>📅 신규 방문 예약 일정 추가</h4>
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
                        placeholder="방문 목적 또는 시간 정보 기입..."
                        value={reservationMemoInput}
                        onChange={(e) => setReservationMemoInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleReservationSubmit}>예약 접수</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>나의 확정 예약 내역</h4>
                  <div className="reservation-calendar">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const dayNum = i + 14;
                      const dateStr = `2026-08-${dayNum}`;
                      const matched = reservationsList.filter(r => r.date === dateStr || dateStr === '2026-08-20');
                      return (
                        <div key={i} className={`calendar-day ${matched.length > 0 ? 'has-res' : ''}`}>
                          <strong>{dayNum}일</strong>
                          {matched.map((r, idx) => (
                            <span key={idx} style={{ fontSize: '0.62rem', color: 'var(--primary-emerald)' }}>{r.memo ? r.memo.slice(0, 10) : '방문상담'}</span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customer Center & Inquiries View (Bug03) */}
              {activeTab === 'customer-center' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💬 고객센터 및 1:1 상담 문의</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    비공개로 접수되는 1:1 대면 상담 전 요청사항 또는 문의 건을 기재하여 주십시오.
                  </p>

                  <div className="card-container" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-emerald)' }}>💬 1:1 상담 접수 폼</h4>
                    <div className="form-group">
                      <label className="form-label">문의 요청 사항 본문</label>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="대출 정보, 입주 시기 변경 등 상담사에게 문의할 내용을 적어주세요..."
                        value={inquiryInput}
                        onChange={(e) => setInquiryInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleInquirySubmit}>상담 신청하기</button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.8rem' }}>접수 완료된 1:1 문의 히스토리</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {inquiriesList.map((inq) => (
                      <div key={inq.id} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-light)' }}>
                        <strong>{inq.title}</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>{inq.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Page & Broker profile view (Bug02) */}
              {activeTab === 'my-page' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem' }}>⚙️ 마이 페이지 및 중개업소 프로필</h3>
                  
                  <div className="card-container" style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.8rem' }}>📝 중개업소 정보 수정</h4>
                    <div className="form-group">
                      <label className="form-label">중개사 성명</label>
                      <input type="text" className="form-input" value={profile.name} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">멤버십 등급</label>
                      <input type="text" className="form-input" value={profile.membership} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">한줄 소개글 수정</label>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="대외적으로 고객에게 노출될 중개사 소개 글을 적으세요..."
                        value={profileIntroInput}
                        onChange={(e) => setProfileIntroInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleProfileSubmit}>소개글 변경</button>
                  </div>

                  <div className="card-container" style={{ backgroundColor: 'var(--primary-light)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--primary-emerald)' }}>현재 정보</h4>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{profile.intro}</p>
                  </div>
                </div>
              )}

              {/* Property Detail View (Bug06) */}
              {selectedPropId && (() => {
                const item = propertiesList.find(p => p.id === selectedPropId);
                if (!item) return <p>매물 정보를 찾을 수 없습니다.</p>;
                return (
                  <div className="detail-view">
                    <button className="btn-outline" style={{ width: 'max-content', marginBottom: '0.5rem' }} onClick={() => setSelectedPropId(null)}>
                      ← 매물 전체 목록으로 가기
                    </button>

                    <img src={item.image} alt={item.title} className="detail-img" />
                    <div>
                      <span className="badge-emerald" style={{ display: 'inline-block', marginBottom: '0.4rem' }}>{item.category}</span>
                      <h2 className="detail-title">{item.title}</h2>
                      <span className="property-price" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.3rem' }}>{item.price}</span>
                    </div>

                    <div className="detail-meta">
                      <span>매물 평점: ⭐ {item.rating} / 5.0</span>
                      <span>•</span>
                      <span>주소: {item.region}</span>
                    </div>

                    <p className="detail-desc">
                      HomeSpace 파트너 중개사가 보증하는 특선 우수 매물입니다. 주변 공원 조성 및 역세권 도보 5분 거리의 탁월한 인프라를 지니고 있으며, 채광이 뛰어난 정남향 구조와 에너지 절감형 신축 시스템 설비로 생활 만족도가 매우 높은 강력 추천 단지입니다.
                    </p>

                    {/* SEC-156 Comments form */}
                    <div className="card-container" style={{ backgroundColor: 'var(--bg-light)', borderStyle: 'dotted' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--primary-emerald)' }}>💬 매물 입주 대기자 한줄평 및 댓글 피드</h5>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="매물에 대한 솔직한 한줄평을 등록해보세요..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                        />
                        <button className="btn-primary" onClick={handleCommentSubmit}>한줄평 등록</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.8rem' }}>
                        {commentsList.map((cmt) => (
                          <div key={cmt.id} style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)' }}>
                            <strong>{cmt.author}:</strong> {cmt.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>

        {/* Right Info Sidebar (Announcements, consultation list) */}
        <aside className="right-sidebar">
          {/* VIP Deposit Box */}
          <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', background: 'linear-gradient(135deg, var(--text-dark) 0%, #111827 100%)', color: '#fff', border: 'none' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-emerald)' }}>계약 예치금 한도</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>50,000,000 P</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>우수 기업 회원</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
              신규 등록을 위한 가계약 예산 최적 비율: 10%
            </p>
          </div>

          {/* Quick Notice lists */}
          <div className="card-container">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--primary-emerald)' }}>🔔 긴급 주최 공지사항</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <strong style={{ display: 'block', color: 'var(--text-dark)' }}>2026 임대차 정산 서류 일괄 접수 안내</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>2026.08.01</span>
              </div>
              <div style={{ paddingBottom: '0.4rem' }}>
                <strong style={{ display: 'block', color: 'var(--text-dark)' }}>방문 예약 캘린더 점검 일정 수칙 고지</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>2026.08.02</span>
              </div>
            </div>
          </div>

          <div className="card-container" style={{ background: 'rgba(16, 185, 129, 0.03)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-emerald)', marginBottom: '0.4rem' }}>💡 허위 매물 필터링 수칙</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', lineHeight: '1.5' }}>
              HomeSpace는 100% 실매물 거래를 원칙으로 합니다. 가계약금 납부 및 방문 전 상세 설명 기입 시 기재 사항 조건을 꼼꼼히 확인하고 거래를 진행해 주시기 바랍니다.
            </p>
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
              <div style={{ backgroundColor: 'var(--bg-light)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
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
