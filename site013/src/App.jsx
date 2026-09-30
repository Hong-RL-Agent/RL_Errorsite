import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Security preferences (Safe Mode Filter)
  const [isSafeFilterEnabled, setIsSafeFilterEnabled] = useState(true);

  // Debug check modal state (No ladybug buttons on-screen; triggers organically on vulnerable reload)
  const [debugModal, setDebugModal] = useState({
    isOpen: false,
    bugId: '',
    csvId: '',
    endpoint: '',
    parameter: '',
    description: ''
  });

  const triggerDebugCheck = (bugId, csvId, endpoint, parameter, description) => {
    setDebugModal({
      isOpen: true,
      bugId,
      csvId,
      endpoint,
      parameter,
      description
    });
  };

  // Mock Database states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistoryList, setSearchHistoryList] = useState([]);
  const [profile, setProfile] = useState({ name: '', nickname: '', bio: '' });
  const [inquiriesList, setInquiriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [reservationsList, setReservationsList] = useState([]);
  const [cartList, setCartList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [filtersList, setFiltersList] = useState([]);

  // Form Inputs
  const [bioInput, setBioInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productImg, setProductImg] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileName, setFileName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [resTime, setResTime] = useState('');
  const [resLoc, setResLoc] = useState('');
  const [resNote, setResNote] = useState('');
  const [cartNotesInput, setCartNotesInput] = useState({});
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');
  const [filterCat, setFilterCat] = useState('가전/디지털');

  // Trigger toast alert helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Load Database State from Express API
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Profile (Vulnerable / Safe API check)
      const profPath = isSafeFilterEnabled ? '/api/safe/profile' : '/api/profile';
      const profRes = await fetch(profPath);
      const profData = await profRes.json();
      setProfile(profData);
      setBioInput(profData.bio || '');
      setNicknameInput(profData.nickname || '');

      // 2. Products (Vulnerable / Safe API check)
      const prodPath = isSafeFilterEnabled ? '/api/safe/products' : '/api/products';
      const prodRes = await fetch(prodPath);
      const prodData = await prodRes.json();
      setProductsList(prodData);

      // 3. Recent search history
      const histRes = await fetch('/api/search/history');
      const histData = await histRes.json();
      setSearchHistoryList(histData);

      // 4. Inquiries
      const inqRes = await fetch('/api/inquiries');
      const inqData = await inqRes.json();
      setInquiriesList(inqData);

      // 5. Comments
      const commPath = isSafeFilterEnabled ? '/api/safe/comments' : '/api/comments';
      const commRes = await fetch(commPath);
      const commData = await commRes.json();
      setCommentsList(commData);

      // 6. Reservations
      const resRes = await fetch('/api/reservations');
      const resData = await resRes.json();
      setReservationsList(resData);

      // 7. Cart
      const cartPath = isSafeFilterEnabled ? '/api/safe/cart' : '/api/cart';
      const cartRes = await fetch(cartPath);
      const cartData = await cartRes.json();
      setCartList(cartData);

      // 8. Payments
      const payRes = await fetch('/api/payment/history');
      const payData = await payRes.json();
      setPaymentsList(payData);

      // 9. Filters
      const filtRes = await fetch('/api/filter');
      const filtData = await filtRes.json();
      setFiltersList(filtData);
    } catch (err) {
      console.error("Failed to load initial mock data: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [isSafeFilterEnabled]);

  // 1. Search Query Save & History (SEC-121)
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!query) {
      showToast('검색어를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('/api/search/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: query })
      });
      const data = await res.json();
      
      // Reload history
      const histRes = await fetch('/api/search/history');
      const histData = await histRes.json();
      setSearchHistoryList(histData);

      // Trigger vulnerable check modal if filter is off
      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug01',
          'SEC-121',
          '/api/search/save',
          'keyword',
          '최근 검색어를 이스케이프(HTML Escape) 없이 저장하고 최근 검색어 제안 목록 렌더링 영역 내 innerHTML에 반영하여 취약점을 유발합니다.'
        );
      }
      setSearchQuery('');
      showToast('검색어가 반영되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Profile Intro Save (SEC-122)
  const handleProfileSave = async () => {
    const bio = bioInput.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    const nick = nicknameInput.trim() || profile.nickname;
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, nickname: nick, bio: bio })
      });
      const data = await res.json();

      // Reload
      const profPath = isSafeFilterEnabled ? '/api/safe/profile' : '/api/profile';
      const profRes = await fetch(profPath);
      const profData = await profRes.json();
      setProfile(profData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug02',
          'SEC-122',
          '/api/profile',
          'bio',
          '사용자 프로필의 자기소개(bio) 데이터 저장 및 로드 렌더링 시, 스크립트 특수 기호 처리를 결여하여 Stored XSS를 발생시킵니다.'
        );
      }
      showToast('프로필 정보가 저장되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Customer Inquiry Submit (SEC-123)
  const handleInquirySubmit = async () => {
    const title = inquiryTitle.trim() || (isSafeFilterEnabled ? '' : '문의 제목');
    const content = inquiryContent.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!title || !content) {
      showToast('문의 제목과 내용을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();

      // Reload
      const inqRes = await fetch('/api/inquiries');
      const inqData = await inqRes.json();
      setInquiriesList(inqData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug03',
          'SEC-123',
          '/api/inquiries',
          'content',
          '고객 일대일 문의 양식 작성 시, 본문 내용에 특수 기호 이스케이프 인코딩 처리를 거치지 않아 문의글 목록 재조회 페이지에서 취약점이 발생합니다.'
        );
      }
      setInquiryTitle('');
      setInquiryContent('');
      showToast('문의가 정상 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Product Registration (SEC-124)
  const handleProductSubmit = async () => {
    const title = productTitle.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    const price = productPrice.trim() || (isSafeFilterEnabled ? '' : '15000');
    if (!title || !price) {
      showToast('상품명과 가격을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: Number(price),
          description: productDesc || '상품 상세 정보',
          image: productImg || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80'
        })
      });
      const data = await res.json();

      // Reload products
      const prodPath = isSafeFilterEnabled ? '/api/safe/products' : '/api/products';
      const prodRes = await fetch(prodPath);
      const prodData = await prodRes.json();
      setProductsList(prodData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug04',
          'SEC-124',
          '/api/products',
          'title',
          '판매자 상품 등록 시, 상품 제목에 대한 데이터 정제 처리를 건너뛰고 상세 화면에 바인딩하여 Stored XSS 취약성을 띱니다.'
        );
      }
      setProductTitle('');
      setProductPrice('');
      setProductDesc('');
      setProductImg('');
      setActiveTab('home');
      showToast('상품이 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. File Upload Details (SEC-125)
  const handleFileUpload = async () => {
    const desc = fileDesc.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!desc) {
      showToast('설명 내용을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileName || 'uploaded_photo.jpg', description: desc })
      });
      const data = await res.json();

      // Reload files
      const filesRes = await fetch(`/api/files/${data.data.id}`);
      const filesData = await filesRes.json();
      setFilesList(prev => [...prev, filesData]);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug05',
          'SEC-125',
          '/api/files',
          'description',
          '첨부 파일에 명세 설명(description) 기입 시, 안전 필터링이 가동되지 않아 파일 정보 재검사 목록에서 스크립트 실행으로 이어집니다.'
        );
      }
      setFileDesc('');
      setFileName('');
      showToast('첨부 파일 설명 정보가 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Submit Comment (SEC-126)
  const handleCommentSubmit = async (productId) => {
    const text = commentText.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!text) {
      showToast('댓글 내용을 입력해주세요.');
      return;
    }
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, text, nickname: profile.nickname })
      });

      // Reload comments
      const commPath = isSafeFilterEnabled ? '/api/safe/comments' : '/api/comments';
      const commRes = await fetch(commPath);
      const commData = await commRes.json();
      setCommentsList(commData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug06',
          'SEC-126',
          '/api/comments',
          'text',
          '상품 하단의 댓글 작성 시, 원시 문자열 검증 필터 부재로 타 구매자가 댓글 목록을 리로드할 때 XSS를 트리거합니다.'
        );
      }
      setCommentText('');
      showToast('댓글이 추가되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Make Reservation Memory Note (SEC-127)
  const handleReservationSubmit = async (productId) => {
    const time = resTime.trim() || (isSafeFilterEnabled ? '' : '오늘 저녁 7시');
    const note = resNote.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!time || !note) {
      showToast('약속 시간과 예약 메모를 입력해주세요.');
      return;
    }
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, time, location: resLoc || '근처 지하철역 앞', note })
      });

      // Reload
      const resRes = await fetch('/api/reservations');
      const resData = await resRes.json();
      setReservationsList(resData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug07',
          'SEC-127',
          '/api/reservations',
          'note',
          '거래 예약 잡기 스케줄 메모에 이스케이프 처리가 빠진 채로 저장되어 약속 현황 대시보드 출력 시 취약점이 생깁니다.'
        );
      }
      setResTime('');
      setResLoc('');
      setResNote('');
      showToast('예약 약속 일정이 확정되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Add Cart Wish Note (SEC-128)
  const handleAddToCartWithNotes = async (productId) => {
    const notes = (cartNotesInput[productId] || '').trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!notes) {
      showToast('메모를 기입한 뒤 등록을 진행해 주세요.');
      return;
    }
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, notes })
      });

      // Reload
      const cartPath = isSafeFilterEnabled ? '/api/safe/cart' : '/api/cart';
      const cartRes = await fetch(cartPath);
      const cartData = await cartRes.json();
      setCartList(cartData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug08',
          'SEC-128',
          '/api/cart',
          'notes',
          '관심 찜 목록 추가 과정에서 작성한 요약 메모의 바인딩을 이스케이프 없이 통과시켜 재조회 탭 로드 시 취약점을 발생시킵니다.'
        );
      }
      showToast('관심 찜 상품으로 등록되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Payment Submission Receipt Form (SEC-129)
  const handlePaymentSubmit = async (productName) => {
    const amt = payAmount.trim() || (isSafeFilterEnabled ? '' : '35000');
    const notes = payNotes.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!amt || !notes) {
      showToast('결제할 송금 금액과 요청 사항을 입력해주세요.');
      return;
    }
    try {
      await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amt), productName, notes })
      });

      // Reload
      const payRes = await fetch('/api/payment/history');
      const payData = await payRes.json();
      setPaymentsList(payData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug09',
          'SEC-129',
          '/api/payment',
          'notes',
          '결제 송금 메모 혹은 영수증 요청사항 입력 시 HTML 처리가 제외되어 결제 영수증 내역 확인서 출력 시 취약성이 드러납니다.'
        );
      }
      setPayAmount('');
      setPayNotes('');
      showToast('결제 요청서가 송출되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Save Search Filter Tag (SEC-130)
  const handleFilterSubmit = async () => {
    const name = filterName.trim() || (isSafeFilterEnabled ? '' : '<script>alert(1)</script>');
    if (!name) {
      showToast('필터 이름을 지정해 주세요.');
      return;
    }
    try {
      await fetch('/api/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, minPrice: Number(filterMin) || 0, maxPrice: Number(filterMax) || 100000, category: filterCat })
      });

      // Reload
      const filtRes = await fetch('/api/filter');
      const filtData = await filtRes.json();
      setFiltersList(filtData);

      if (!isSafeFilterEnabled) {
        triggerDebugCheck(
          'site013-bug10',
          'SEC-130',
          '/api/filter',
          'name',
          '검색 필터 그룹 세팅 저장 과정에서 필터명 라벨에 대한 치환이 생략되어 저장 필터 관리 패널 로딩 시 취약성을 띱니다.'
        );
      }
      setFilterName('');
      setFilterMin('');
      setFilterMax('');
      showToast('검색 필터 배치가 저장되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="layout-root">
      
      {/* Top Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedProductId(null); }}>
            MarketHub<span className="logo-dot"></span>
          </a>
          
          {/* SEC-121 Search History Form */}
          <div className="search-bar-container">
            <form onSubmit={handleSearchSubmit} style={{ width: '100%', display: 'flex' }}>
              <input
                type="text"
                className="search-input"
                placeholder="동네 인기 매물 및 중고 용품 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>

        <div className="user-profile-controls">
          <div className="user-avatar-info" onClick={() => { setActiveTab('my-page'); setSelectedProductId(null); }} style={{ cursor: 'pointer' }}>
            <div className="avatar">CU</div>
            <span className="nickname-display">{profile.nickname || '이웃'}</span>
          </div>
        </div>
      </header>

      {/* Main Layout Wrap */}
      <div className="app-container">
        
        {/* Left Side Menu List */}
        <aside className="left-sidebar">
          <div className="sidebar-card">
            <ul className="sidebar-menu">
              <li className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('home'); setSelectedProductId(null); }}>🏠 동네 상품 (Home)</button>
              </li>
              <li className={`menu-item ${activeTab === 'nearby' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('nearby'); setSelectedProductId(null); }}>📍 내 주변 매물 (Nearby)</button>
              </li>
              <li className={`menu-item ${activeTab === 'favorites' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('favorites'); setSelectedProductId(null); }}>🧡 관심 찜 목록 (Wishlist)</button>
              </li>
              <li className={`menu-item ${activeTab === 'register' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('register'); setSelectedProductId(null); }}>✍️ 상품 판매하기 (Sell)</button>
              </li>
              <li className={`menu-item ${activeTab === 'payment-receipts' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('payment-receipts'); setSelectedProductId(null); }}>🧾 영수증 내역서 (Receipts)</button>
              </li>
              <li className={`menu-item ${activeTab === 'customer-center' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('customer-center'); setSelectedProductId(null); }}>💬 고객 지원 센터 (Help)</button>
              </li>
              <li className={`menu-item ${activeTab === 'my-page' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('my-page'); setSelectedProductId(null); }}>⚙️ 마이 페이지 (My Page)</button>
              </li>
            </ul>
          </div>

          {/* SEC-121 Search History display list */}
          <div className="sidebar-card">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--primary-green)' }}>최근 검색어 제안</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
              {searchHistoryList.slice(0, 5).map((h, i) => (
                <span key={i} className="search-tag" dangerouslySetInnerHTML={{ __html: h.keyword }} />
              ))}
            </div>
          </div>
        </aside>

        {/* Center Tab View Panels */}
        <main className="center-content">
          {isLoading ? (
            <div className="empty-placeholder" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'center', margin: 'auto' }}>
              <p>플랫폼 상태 데이터 동기화 중...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Home List View */}
              {activeTab === 'home' && !selectedProductId && (
                <div>
                  <div className="hero-banner" style={{ marginBottom: '1.5rem' }}>
                    <div className="hero-content">
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-carrot)', letterSpacing: '0.05em' }}>GREEN MARKET</span>
                      <h2 className="hero-title">이웃과의 소중한 거래</h2>
                      <p className="hero-subtitle">가까운 이웃과 함께하는 따뜻하고 안전한 중고 물품 나눔 장터입니다.</p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=200&q=80" alt="Market" className="hero-img" />
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1rem' }}>인기 추천 중고 매물</h3>
                  <div className="product-grid">
                    {productsList.map((p) => (
                      <div key={p.id} className="product-card" onClick={() => setSelectedProductId(p.id)}>
                        <img src={p.image} alt={p.title} className="product-img" />
                        <div className="product-info">
                          {/* SEC-124 Stored XSS Rendering title */}
                          <h4 className="product-title" dangerouslySetInnerHTML={{ __html: p.title }} />
                          <span className="product-price">₩{p.price.toLocaleString()}</span>
                          <div className="product-meta">
                            <span className="badge-location">{p.location}</span>
                            <span>찜 {p.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Nearby items Map mock */}
              {activeTab === 'nearby' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem' }}>📍 내 주변 이웃 거래 매물</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
                    접속하신 IP 위치 기준 반경 1.5km 이내의 우리 동네 회원들의 상품 목록입니다.
                  </p>
                  
                  {/* Safe filters test panel (SEC-130) */}
                  <div className="sidebar-card" style={{ backgroundColor: 'var(--cream-bg)', marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800 }}>⚙️ 동네 맞춤 필터 설정 저장</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="예: 우리집 근처 모니터"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                      <select className="form-input" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                        <option value="가전/디지털">가전/디지털</option>
                        <option value="도서/티켓">도서/티켓</option>
                        <option value="생활/인테리어">생활/인테리어</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="최소 가격"
                        value={filterMin}
                        onChange={(e) => setFilterMin(e.target.value)}
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="최대 가격"
                        value={filterMax}
                        onChange={(e) => setFilterMax(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleFilterSubmit}>검색 필터 저장</button>
                  </div>

                  {filtersList.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>저장된 관심 필터 요약</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {filtersList.map((f, idx) => (
                          <div key={idx} style={{ padding: '0.6rem', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.75rem', backgroundColor: 'var(--primary-white)' }}>
                            필터 구분명: <strong dangerouslySetInnerHTML={{ __html: f.name }} /> | 조건: {f.category} (₩{f.minPrice.toLocaleString()} ~ ₩{f.maxPrice.toLocaleString()})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="product-grid">
                    {productsList.slice(1).map((p) => (
                      <div key={p.id} className="product-card" onClick={() => setSelectedProductId(p.id)}>
                        <img src={p.image} alt={p.title} className="product-img" />
                        <div className="product-info">
                          <h4 className="product-title" dangerouslySetInnerHTML={{ __html: p.title }} />
                          <span className="product-price">₩{p.price.toLocaleString()}</span>
                          <div className="product-meta">
                            <span className="badge-location">{p.location}</span>
                            <span>찜 {p.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Wishlist Wish notes (SEC-128) */}
              {activeTab === 'favorites' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.8rem' }}>🧡 관심 상품 찜 목록</h3>
                  
                  {cartList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>
                      <p>찜하신 관심 매물이 존재하지 않습니다. 인기 상품에서 하트를 눌러보세요!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {cartList.map((c, i) => {
                        const item = productsList.find(p => p.id === c.productId);
                        if (!item) return null;
                        return (
                          <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '12px', backgroundColor: 'var(--cream-card)' }}>
                            <img src={item.image} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: item.title }} />
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-carrot)' }}>₩{item.price.toLocaleString()}</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.4rem' }}>
                                나의 찜 체크 메모: <span dangerouslySetInnerHTML={{ __html: c.notes }} />
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Sell registration */}
              {activeTab === 'register' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1rem' }}>✍️ 중고 거래 물품 등록하기</h3>
                  
                  <div className="form-group">
                    <label className="form-label">상품명 (SEC-124)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="상품명을 정확히 입력해주세요..."
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">거래 희망 가격 (원)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="₩ 판매 가격 입력..."
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">거래 상품 이미지 URL</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://..."
                      value={productImg}
                      onChange={(e) => setProductImg(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">설명 및 물건 상태 기술</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="구입 시기, 하자 유무 등 이웃에게 유용한 설명을 가감 없이 작성해주세요..."
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                    />
                  </div>

                  {/* SEC-125 File Description Attachment Form */}
                  <div className="sidebar-card" style={{ backgroundColor: 'var(--cream-bg)', borderStyle: 'dashed', marginBottom: '1.2rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>📎 하자 설명 상세 이미지 파일 첨부</h4>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="첨부 파일 파일명 (예: scratch_area.png)"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="파일 세부 정보 설명 코멘트"
                        value={fileDesc}
                        onChange={(e) => setFileDesc(e.target.value)}
                      />
                      <button className="btn-outline" onClick={handleFileUpload}>사진 설명 저장</button>
                    </div>
                    {filesList.length > 0 && (
                      <div style={{ marginTop: '0.8rem', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 700 }}>적용 완료 설명 파일:</span>
                        {filesList.map((f, i) => (
                          <div key={i} style={{ color: 'var(--text-gray)', marginTop: '0.2rem' }}>
                            파일명: {f.filename} ➔ <span dangerouslySetInnerHTML={{ __html: f.description }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={handleProductSubmit}>
                    작성 완료
                  </button>
                </div>
              )}

              {/* Tab 5: Receipt lists for payments */}
              {activeTab === 'payment-receipts' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.8rem' }}>🧾 거래 완료 및 모의 송금 영수증 내역</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {paymentsList.map((p, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '12px', backgroundColor: 'var(--cream-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>결제 완료 일자: {p.date}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-green)' }}>송금 확인됨</span>
                        </div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>상품명: {p.productName}</h4>
                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-carrot)', margin: '0.2rem 0' }}>₩{p.amount.toLocaleString()}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', borderTop: '1px solid var(--border-light)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                          판매자 전달 영수 요청 사항: <span dangerouslySetInnerHTML={{ __html: p.notes }} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Help inquiries center (SEC-123) */}
              {activeTab === 'customer-center' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1rem' }}>💬 MarketHub 고객 소통 및 문의 센터</h3>
                  
                  <div className="sidebar-card" style={{ backgroundColor: 'var(--cream-bg)', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>새 일대일 상담 문의 접수</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="문의 제목을 기입해주세요..."
                        value={inquiryTitle}
                        onChange={(e) => setInquiryTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-input form-textarea"
                        placeholder="신고 내역 조율 및 불만 사항을 기입하여 보내주세요..."
                        value={inquiryContent}
                        onChange={(e) => setInquiryContent(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleInquirySubmit}>문의글 남기기</button>
                  </div>

                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>접수된 문의 내역 목록</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {inquiriesList.map((inq, idx) => (
                      <div key={idx} style={{ padding: '0.8rem', border: '1px solid var(--border-light)', borderRadius: '10px', backgroundColor: 'var(--primary-white)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{inq.title}</span>
                          <span style={{ fontSize: '0.65rem', backgroundColor: '#FFF5E4', color: '#FF9F29', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{inq.status}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-charcoal)' }}>
                          내용: <span dangerouslySetInnerHTML={{ __html: inq.content }} />
                        </p>
                        {inq.answer && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--primary-green)', marginTop: '0.4rem', background: 'var(--light-green)', padding: '0.4rem', borderRadius: '4px' }}>
                            ↳ 답변: {inq.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: My Page Settings & Safe filter (SEC-122) */}
              {activeTab === 'my-page' && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.2rem' }}>⚙️ 나의 마켓 계정 정보 및 가드 설정</h3>
                  
                  <div className="sidebar-card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cream-bg)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.8rem' }}>📝 프로필 편집 카드</h4>
                    <div className="form-group">
                      <label className="form-label">프로필 활동 닉네임</label>
                      <input
                        type="text"
                        className="form-input"
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">자기 소개글 (SEC-122)</label>
                      <textarea
                        className="form-input form-textarea"
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleProfileSave}>저장 완료</button>
                  </div>

                  <div className="sidebar-card" style={{ border: '2px solid var(--primary-green)', backgroundColor: 'var(--light-green)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--dark-green)', marginBottom: '0.4rem' }}>🛡️ 안심 이웃 결제 보안 가드 필터</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '0.8rem' }}>
                      플랫폼 내 적재되는 텍스트 정보의 이스케이프(HTML Escape) 안전 필터 검증 모드를 활성화합니다.
                    </p>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-charcoal)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        checked={isSafeFilterEnabled}
                        onChange={(e) => {
                          setIsSafeFilterEnabled(e.target.checked);
                          showToast(`안심 필터링이 ${e.target.checked ? '활성화' : '비활성화'}되었습니다.`);
                        }}
                      />
                      안심 거래 보안 이스케이프 적용 (Safe Input Guard ON)
                    </label>
                  </div>
                </div>
              )}

              {/* Product Detail view panel (Comments SEC-126 & Reservations SEC-127 / Cart SEC-128 / Payments SEC-129) */}
              {selectedProductId && (() => {
                const prod = productsList.find(p => p.id === selectedProductId);
                if (!prod) return <p>상품 정보가 부재합니다.</p>;
                return (
                  <div className="product-detail-view">
                    <button className="btn-outline" style={{ width: 'max-content', marginBottom: '0.8rem' }} onClick={() => setSelectedProductId(null)}>
                      ← 상품 리스트로 가기
                    </button>
                    
                    <img src={prod.image} alt={prod.title} className="detail-img" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span className="badge-location" style={{ width: 'max-content' }}>{prod.location}</span>
                      <h2 className="detail-title" dangerouslySetInnerHTML={{ __html: prod.title }} />
                      <span className="detail-price">₩{prod.price.toLocaleString()}</span>
                    </div>

                    <div className="detail-meta-row">
                      <span>판매자: <strong>{prod.seller}</strong></span>
                      <span>•</span>
                      <span>관심 찜 수: {prod.likes}</span>
                    </div>

                    <p className="detail-description">{prod.description}</p>

                    {/* Action 1: Add Cart with Notes (SEC-128) */}
                    <div className="sidebar-card" style={{ backgroundColor: 'var(--cream-bg)', marginTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>🧡 관심 상품 찜 메모 남기고 보관하기</h4>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="예: 쿨거래 네고 예정인 상품..."
                          value={cartNotesInput[prod.id] || ''}
                          onChange={(e) => setCartNotesInput(prev => ({ ...prev, [prod.id]: e.target.value }))}
                        />
                        <button className="btn-primary" onClick={() => handleAddToCartWithNotes(prod.id)}>찜하기</button>
                      </div>
                    </div>

                    {/* Action 2: 거래 예약 약속 (SEC-127) */}
                    <div className="sidebar-card" style={{ backgroundColor: 'var(--cream-bg)' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>🗓️ 거래 예약 약속 정보 기입</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="약속 날짜 및 시간 (예: 토요일 4시)"
                          value={resTime}
                          onChange={(e) => setResTime(e.target.value)}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="약속 구체적 위치 (예: 역삼역 4출 앞)"
                          value={resLoc}
                          onChange={(e) => setResLoc(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="구매자 전달용 약속 안내 메모사항"
                          value={resNote}
                          onChange={(e) => setResNote(e.target.value)}
                        />
                        <button className="btn-primary" onClick={() => handleReservationSubmit(prod.id)}>거래 예약하기</button>
                      </div>
                      {reservationsList.filter(r => r.productId === prod.id).length > 0 && (
                        <div style={{ marginTop: '0.8rem', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 700 }}>확정된 약속 정보:</span>
                          {reservationsList.filter(r => r.productId === prod.id).map((res, i) => (
                            <div key={i} style={{ color: 'var(--text-gray)', marginTop: '0.2rem' }}>
                              시간: {res.time} | 위치: {res.location} | 메모: <span dangerouslySetInnerHTML={{ __html: res.note }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action 3: 거래 모의 송금 결제 (SEC-129) */}
                    <div className="sidebar-card" style={{ backgroundColor: 'var(--cream-bg)' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>💳 송금 결제 및 영수증 영수 명세 요청</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="결제할 송금 금액"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="결제 영수증 기재용 요청 메시지"
                          value={payNotes}
                          onChange={(e) => setPayNotes(e.target.value)}
                        />
                      </div>
                      <button className="btn-accent" style={{ width: '100%' }} onClick={() => handlePaymentSubmit(prod.title)}>
                        송금하고 영수증 받기
                      </button>
                    </div>

                    {/* Action 4: 상품 댓글 목록 (SEC-126) */}
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>댓글 질문 ({commentsList.filter(c => c.productId === prod.id).length})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.8rem' }}>
                        {commentsList.filter(c => c.productId === prod.id).map((c, i) => (
                          <div key={i} style={{ padding: '0.6rem', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-gray)', marginBottom: '0.2rem' }}>
                              <strong>{c.nickname}</strong>
                              <span>{c.date}</span>
                            </div>
                            <p style={{ color: 'var(--text-charcoal)' }} dangerouslySetInnerHTML={{ __html: c.text }} />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="댓글 질문 등록..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button className="btn-primary" onClick={() => handleCommentSubmit(prod.id)}>등록</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>

        {/* Right Side Info Panel */}
        <aside className="right-sidebar">
          {/* SEC-122 User Bio profile card */}
          <div className="sidebar-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-green)' }}>나의 이웃 정보</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>CU</div>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{profile.nickname || '이웃'}</strong>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-gray)' }}>신뢰 매너 온도: 36.5℃</p>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-charcoal)', borderTop: '1px solid var(--border-light)', paddingTop: '0.6rem' }} dangerouslySetInnerHTML={{ __html: profile.bio || '프로필 소개가 없습니다.' }} />
          </div>

          <div className="sidebar-card">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--primary-green)' }}>동네 인기 검색어</h4>
            <ol style={{ fontSize: '0.75rem', paddingLeft: '1.2rem', lineHeight: '1.6', color: 'var(--text-charcoal)' }}>
              <li>아이패드</li>
              <li>자전거</li>
              <li>캠핑의자</li>
              <li>에어팟</li>
              <li>무료나눔</li>
            </ol>
          </div>

          <div className="sidebar-card" style={{ backgroundColor: 'var(--light-green)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--dark-green)', marginBottom: '0.3rem' }}>🌱 클린 마켓 수칙</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', lineHeight: '1.4' }}>
              동네 이웃 간 상호 존중과 신뢰 거래 수칙을 지켜 훈훈한 중고 거래 문화를 만들어 가요!
            </p>
          </div>
        </aside>

      </div>

      {/* Pop-up Alert Modal (Triggered organically upon Stored XSS reload) */}
      {debugModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">🚨 안전성 진단 테스트 알림</span>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 700, color: 'var(--accent-carrot)', marginBottom: '0.4rem' }}>
                취약점이 감지되었습니다: Stored XSS
              </p>
              <div style={{ backgroundColor: 'var(--cream-bg)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.8rem' }}>
                <div><strong>버그 ID:</strong> {debugModal.bugId}</div>
                <div><strong>보안 식별자 (CSV):</strong> {debugModal.csvId}</div>
                <div><strong>발생 엔드포인트:</strong> {debugModal.endpoint}</div>
                <div><strong>취약 파라미터:</strong> {debugModal.parameter}</div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-charcoal)', lineHeight: '1.4' }}>
                {debugModal.description}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setDebugModal(prev => ({ ...prev, isOpen: false }))}>
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
