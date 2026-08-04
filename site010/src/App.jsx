import React, { useState, useEffect } from 'react';

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);

export default function App() {
  // Navigation & Role States
  const [activeTab, setActiveTab] = useState('home');
  const [userRole, setUserRole] = useState('customer'); // customer, owner, admin
  const [isDevMode, setIsDevMode] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // App Data States
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState({ nickname: '미식가 고객', bio: '안녕하세요!' });
  const [favoritesCount, setFavoritesCount] = useState(3);
  
  // Loaded status indicators
  const [isLoading, setIsLoading] = useState(false);

  // Form Input States & Vulnerable API Response Buffers
  // 1. Search (site010-bug01 / SEC-091)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOutput, setSearchOutput] = useState('');
  
  // 2. Profile Bio (site010-bug02 / SEC-092)
  const [bioInput, setBioInput] = useState('');
  const [bioOutput, setBioOutput] = useState('');

  // 3. Contact content (site010-bug03 / SEC-093)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactContent, setContactContent] = useState('');
  const [contactOutput, setContactOutput] = useState('');

  // 4. New Restaurant Name (site010-bug04 / SEC-094)
  const [newRestName, setNewRestName] = useState('');
  const [newRestOutput, setNewRestOutput] = useState(null);

  // 5. Photo Description (site010-bug05 / SEC-095)
  const [photoDescInput, setPhotoDescInput] = useState('');
  const [photoDescOutput, setPhotoDescOutput] = useState('');
  const [photoList, setPhotoList] = useState([
    { image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80', description: '치즈 폭탄 시카고 피자!' },
    { image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80', description: '숯향이 입안 가득 흑돼지 구이' }
  ]);

  // 6. Review Comment (site010-bug06 / SEC-096)
  const [commentInput, setCommentInput] = useState('');
  const [activeReviewIdForComment, setActiveReviewIdForComment] = useState(1);
  const [commentOutput, setCommentOutput] = useState('');

  // 7. Reservation Memo (site010-bug07 / SEC-097)
  const [resMemoInput, setResMemoInput] = useState('');
  const [resGuestsInput, setResGuestsInput] = useState(2);
  const [resDateInput, setResDateInput] = useState('2026-08-10');
  const [resTimeInput, setResTimeInput] = useState('18:30');
  const [resOutput, setResOutput] = useState(null);

  // 8. Cart message (site010-bug08 / SEC-098)
  const [cartMsgInput, setCartMsgInput] = useState('');
  const [cartOutput, setCartOutput] = useState(null);

  // 9. Payment Memo (site010-bug09 / SEC-099)
  const [payMemoInput, setPayMemoInput] = useState('');
  const [payOutput, setPayOutput] = useState(null);

  // 10. Filter Category (site010-bug10 / SEC-100)
  const [filterOutput, setFilterOutput] = useState('');

  // Debug Modals
  const [debugModal, setDebugModal] = useState(null); // { bugId, csvId, type, endpoint, parameter, description }
  const [appAlert, setAppAlert] = useState(null); // Normal site alerts

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const restRes = await fetch('/api/restaurants');
      const restData = await restRes.json();
      setRestaurants(restData);

      const reviewRes = await fetch('/api/comments');
      const reviewData = await reviewRes.json();
      setReviews(reviewData);

      const profileRes = await fetch('/api/profile');
      const profileData = await profileRes.json();
      setProfile(profileData);
      setBioInput(profileData.bio);

      const resRes = await fetch('/api/reservations');
      const resData = await resRes.json();
      setReservations(resData);

      const cartRes = await fetch('/api/cart');
      const cartData = await cartRes.json();
      setCartItems(cartData);
    } catch (e) {
      console.error("Error fetching data", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to trigger debug popup alerts in Dev Mode
  const triggerDebugCheck = (bugId, csvId, endpoint, parameter, description) => {
    if (isDevMode) {
      setDebugModal({
        bugId,
        csvId,
        type: 'Reflected XSS',
        endpoint,
        parameter,
        description
      });
    }
  };

  // ----------------------------------------------------
  // API Request Triggers (Governed by isSafeMode toggle)
  // ----------------------------------------------------

  // 1. Search
  const handleSearch = async () => {
    const apiPath = isSafeMode ? `/api/safe/search?q=${encodeURIComponent(searchQuery)}` : `/api/search?q=${encodeURIComponent(searchQuery)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      
      setSearchOutput(data.query);
      if (data.results) {
        setRestaurants(data.results);
      }
      
      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug01',
          'SEC-091',
          '/api/search',
          'q',
          '검색창 입력값이 HTML Escape 없이 그대로 화면 검색 쿼리 결과에 노출됩니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Profile Bio
  const handleProfilePreview = async () => {
    const apiPath = isSafeMode ? '/api/safe/profile' : '/api/profile/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioInput })
      });
      const data = await res.json();
      
      setBioOutput(data.bio);
      setProfile(prev => ({ ...prev, bio: data.bio }));
      
      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug02',
          'SEC-092',
          '/api/profile/preview',
          'bio',
          '프로필 자기소개 미리보기 생성 시 입력값을 HTML Escape 하지 않아 스크립트 실행이 가능합니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Contact Inquiry Preview
  const handleContactPreview = async () => {
    if (!contactContent) return;
    const apiPath = isSafeMode ? '/api/safe/contact' : '/api/contact/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, content: contactContent })
      });
      const data = await res.json();
      setContactOutput(data.content);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug03',
          'SEC-093',
          '/api/contact/preview',
          'content',
          '고객센터 문의 내용 미리보기 화면 출력 시 사용자의 질문 본문 입력값을 이스케이프하지 않습니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Owner Restaurant Name Preview
  const handleRestaurantNamePreview = async () => {
    if (!newRestName) return;
    const apiPath = isSafeMode ? `/api/safe/restaurants/preview?name=${encodeURIComponent(newRestName)}` : `/api/restaurants/preview?name=${encodeURIComponent(newRestName)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setNewRestOutput(data);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug04',
          'SEC-094',
          '/api/restaurants/preview',
          'name',
          '신규 레스토랑 이름 미리보기 카드 출력 시 HTML Escape 처리가 생략되어 XSS 취약점이 발생합니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Photo Caption Preview
  const handlePhotoPreview = async () => {
    if (!photoDescInput) return;
    const apiPath = isSafeMode ? '/api/safe/photos/preview' : '/api/photos/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: photoDescInput })
      });
      const data = await res.json();
      setPhotoDescOutput(data.description);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug05',
          'SEC-095',
          '/api/photos/preview',
          'description',
          '리뷰 사진설명 미리보기 추가 시 이스케이프 없이 화면 DOM Sink에 텍스트를 주입합니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoSubmit = () => {
    if (!photoDescOutput) return;
    setPhotoList(prev => [
      ...prev,
      {
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
        description: photoDescOutput
      }
    ]);
    setPhotoDescInput('');
    setPhotoDescOutput('');
    setAppAlert('리뷰 사진이 성공적으로 업로드되었습니다!');
  };

  // 6. Review Comment Preview
  const handleCommentPreview = async () => {
    if (!commentInput) return;
    const apiPath = isSafeMode ? '/api/safe/comments' : '/api/comments/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentInput })
      });
      const data = await res.json();
      setCommentOutput(data.text);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug06',
          'SEC-096',
          '/api/comments/preview',
          'text',
          '리뷰의 답글/댓글 미리보기 렌더링 시 필터링이 누락된 데이터를 사용합니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = (reviewId) => {
    if (!commentOutput) return;
    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          comments: [
            ...rev.comments,
            { id: Date.now(), userName: '고객 지원단', text: commentOutput }
          ]
        };
      }
      return rev;
    }));
    setCommentInput('');
    setCommentOutput('');
    setAppAlert('댓글 작성이 완료되었습니다.');
  };

  // 7. Reservation Memo Preview
  const handleReservationPreview = async () => {
    const apiPath = isSafeMode ? '/api/safe/reservations/preview' : '/api/reservations/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: resMemoInput })
      });
      const data = await res.json();
      
      setResOutput(data);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug07',
          'SEC-097',
          '/api/reservations/preview',
          'memo',
          '예약 작성 페이지에서 입력한 요구사항 메모 미리보기 요약에 HTML Escape 처리를 생략합니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReservationConfirm = () => {
    if (!resOutput) return;
    const newBooking = {
      id: Date.now(),
      restaurantId: selectedRestaurant ? selectedRestaurant.id : 1,
      restaurantName: selectedRestaurant ? selectedRestaurant.name : '오렌지 가든',
      userName: 'customer',
      date: resDateInput,
      time: resTimeInput,
      guests: resGuestsInput,
      memo: resOutput.memo,
      status: '확정'
    };
    setReservations(prev => [newBooking, ...prev]);
    setResMemoInput('');
    setResOutput(null);
    setAppAlert('예약이 성공적으로 확정되었습니다!');
    setActiveTab('reservations');
  };

  // 8. Cart message preview
  const handleCartPreview = async () => {
    const apiPath = isSafeMode ? '/api/safe/cart/preview' : '/api/cart/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cartMsgInput })
      });
      const data = await res.json();
      setCartOutput(data);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug08',
          'SEC-098',
          '/api/cart/preview',
          'message',
          '장바구니 추가 주문 요구사항 미리보기 요약 처리 시 HTML Escape 처리를 수행하지 않습니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCartSubmit = () => {
    if (!cartOutput) return;
    const newItem = {
      id: Date.now(),
      restaurantId: selectedRestaurant ? selectedRestaurant.id : 1,
      name: selectedRestaurant ? `${selectedRestaurant.name} 특선 코스` : '스페셜 디너 코스',
      price: 45000,
      quantity: 1,
      message: cartOutput.message
    };
    setCartItems(prev => [...prev, newItem]);
    setCartMsgInput('');
    setCartOutput(null);
    setAppAlert('장바구니에 상품을 추가하였습니다.');
  };

  // 9. Payment Memo Preview
  const handlePaymentPreview = async () => {
    const apiPath = isSafeMode ? '/api/safe/payment' : '/api/payment/preview';
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: payMemoInput })
      });
      const data = await res.json();
      setPayOutput(data);

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug09',
          'SEC-099',
          '/api/payment/preview',
          'memo',
          '결제 수단 양식의 수령 요청사항/메모 필드를 HTML Escape 처리 없이 결제 영수증 미리보기에 바인딩합니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePaymentSubmit = () => {
    if (!payOutput) return;
    setCartItems([]);
    setPayMemoInput('');
    setPayOutput(null);
    setAppAlert('결제가 정상적으로 완료되었습니다! 모의 결제 완료.');
    setActiveTab('orders');
  };

  // 10. Filter category
  const handleFilterClick = async (category) => {
    setActiveTab('restaurants');
    const apiPath = isSafeMode ? `/api/safe/filter?keyword=${encodeURIComponent(category)}` : `/api/filter?keyword=${encodeURIComponent(category)}`;
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setFilterOutput(data.keyword);
      if (data.results) {
        setRestaurants(data.results);
      }

      if (!isSafeMode) {
        triggerDebugCheck(
          'site010-bug10',
          'SEC-100',
          '/api/filter',
          'keyword',
          '맛집 리스트 필터링 시 파라미터 값이 결과 칩 상단 화면에 필터링되지 않고 삽입됩니다.'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="layout-root">
      {/* App Main Top Header */}
      <header className="main-header">
        <div className="header-left">
          <a href="#" className="logo-container" onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedRestaurant(null); }}>
            FoodSpot<span className="logo-dot"></span>
          </a>
          <div className="search-bar-container">
            <span className="search-icon"><SearchIcon /></span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="맛집 이름 또는 음식 종류 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
        </div>

        <div className="header-right">
          <div className="nav-icons-group">
            <button className={`dev-mode-btn ${isDevMode ? 'active' : ''}`} onClick={() => setIsDevMode(!isDevMode)}>
              {isDevMode ? '🔧 개발자 설정 닫기' : '🔧 개발자 설정'}
            </button>
            <button className="icon-btn" onClick={() => setActiveTab('reservations')}>
              <BellIcon />
              {reservations.length > 0 && <span className="badge">{reservations.length}</span>}
            </button>
            <button className="icon-btn" onClick={() => { setActiveTab('orders'); setSelectedRestaurant(null); }}>
              <CartIcon />
              {cartItems.length > 0 && <span className="badge">{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}</span>}
            </button>
          </div>

          <div className="user-profile-controls">
            <select 
              className="role-switcher" 
              value={userRole} 
              onChange={(e) => {
                setUserRole(e.target.value);
                setAppAlert(`역할이 ${e.target.value === 'admin' ? '관리자' : e.target.value === 'owner' ? '점주' : '고객'}으로 전환되었습니다.`);
              }}
            >
              <option value="customer">고객 (Customer)</option>
              <option value="owner">점주 (Owner)</option>
              <option value="admin">관리자 (Admin)</option>
            </select>
            <div className="user-avatar-info">
              <div className="avatar">
                {userRole === 'admin' ? 'A' : userRole === 'owner' ? 'O' : 'C'}
              </div>
              <span className="nickname-display">
                {userRole === 'admin' ? '시스템 관리자' : userRole === 'owner' ? '사장님 홍길동' : profile.nickname}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Expanded Developer Panel Control Bar */}
      {isDevMode && (
        <div style={{
          backgroundColor: '#F3EDE2',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.6rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          fontSize: '0.85rem',
          color: 'var(--primary-brown)',
          fontWeight: '600'
        }}>
          <span>🔧 개발자 모드 제어반</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isSafeMode} 
              onChange={(e) => {
                setIsSafeMode(e.target.checked);
                setAppAlert(`백엔드 보안 필터가 ${e.target.checked ? '활성화' : '비활성화'}되었습니다.`);
              }} 
            />
            보안 필터 활성화 (Safe Mode - HTML Escaping)
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginLeft: 'auto' }}>
            * 활성화 상태에서는 <code>/api/safe/...</code> API가 호출되어 취약점 경고 팝업이 뜨지 않습니다.
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="app-container">
        
        {/* Left Navigation Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-card">
            <ul className="sidebar-menu">
              <li className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('home'); setSelectedRestaurant(null); }}>🏠 홈 화면</button>
              </li>
              <li className={`menu-item ${activeTab === 'restaurants' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('restaurants'); setSelectedRestaurant(null); }}>🍔 맛집 탐색</button>
              </li>
              <li className={`menu-item ${activeTab === 'reviews' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('reviews'); setSelectedRestaurant(null); }}>⭐ 인기 리뷰</button>
              </li>
              <li className={`menu-item ${activeTab === 'reservations' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('reservations'); setSelectedRestaurant(null); }}>📅 예약 관리</button>
              </li>
              <li className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('orders'); setSelectedRestaurant(null); }}>🛒 장바구니/주문</button>
              </li>
              <li className={`menu-item ${activeTab === 'coupons' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('coupons'); setSelectedRestaurant(null); }}>🎟️ 할인 쿠폰</button>
              </li>
              <li className={`menu-item ${activeTab === 'my-reviews' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('my-reviews'); setSelectedRestaurant(null); }}>📸 포토 갤러리</button>
              </li>
              <li className={`menu-item ${activeTab === 'customer-center' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('customer-center'); setSelectedRestaurant(null); }}>💬 고객 센터</button>
              </li>
            </ul>
          </div>

          {/* Quick Stats Sidebar Widgets */}
          <div className="sidebar-card" style={{ marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', color: 'var(--primary-brown)' }}>나의 액티비티</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>내 예약</span>
                <span style={{ fontWeight: '700' }}>{reservations.length} 건</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-gray)' }}>장바구니</span>
                <span style={{ fontWeight: '700' }}>{cartItems.length} 개</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Main Dashboard Column */}
        <main className="center-content">
          
          {isLoading ? (
            <div className="loading-spinner-container">
              <div className="spinner"></div>
            </div>
          ) : selectedRestaurant ? (
            /* ==========================================
               Restaurant Detail View
               ========================================== */
            <div className="detail-container">
              <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="detail-header-img" />
              <div className="detail-body">
                <button className="back-btn" onClick={() => setSelectedRestaurant(null)}>
                  ← 리스트로 돌아가기
                </button>
                <div className="detail-title-row">
                  <div className="detail-main-title">
                    <h1>{selectedRestaurant.name}</h1>
                    <div className="detail-sub">
                      <span style={{ color: 'var(--primary-orange)', fontWeight: '700' }}>{selectedRestaurant.category}</span>
                      <span>•</span>
                      <span className="rating-box"><StarIcon /><span className="star-color" style={{ color: 'var(--star-color)', marginLeft: '3px' }}>{selectedRestaurant.rating}</span> ({selectedRestaurant.reviewsCount}개 리뷰)</span>
                    </div>
                  </div>
                  <span className={`status-badge ${selectedRestaurant.status === '예약 가능' ? 'available' : selectedRestaurant.status === '마감 임박' ? 'warning' : 'closed'}`}>
                    {selectedRestaurant.status}
                  </span>
                </div>

                <div className="detail-grid">
                  <div className="detail-info-pane">
                    <div className="info-card-block">
                      <h3>매장 소개</h3>
                      <p>{selectedRestaurant.description}</p>
                    </div>

                    <div className="info-card-block">
                      <h3>상세 정보</h3>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                        <MapPinIcon /> <strong>위치:</strong> {selectedRestaurant.location}
                      </p>
                      <p style={{ marginTop: '0.4rem' }}>
                        💵 <strong>평균 가격대:</strong> {selectedRestaurant.priceRange}
                      </p>
                    </div>

                    {/* Booking Form in Details */}
                    <div className="form-box" style={{ marginTop: '1rem' }}>
                      <h3 style={{ border: 'none', padding: 0 }}>📅 테이블 실시간 예약</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>날짜 선택</label>
                          <input type="date" className="form-input" value={resDateInput} onChange={(e) => setResDateInput(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>시간 선택</label>
                          <select className="form-input" value={resTimeInput} onChange={(e) => setResTimeInput(e.target.value)}>
                            <option value="12:00">12:00 (점심)</option>
                            <option value="13:30">13:30 (점심)</option>
                            <option value="18:00">18:00 (저녁)</option>
                            <option value="18:30">18:30 (저녁)</option>
                            <option value="20:00">20:00 (저녁)</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>인원 수</label>
                        <input type="number" min="1" max="10" className="form-input" value={resGuestsInput} onChange={(e) => setResGuestsInput(Number(e.target.value))} />
                      </div>
                      
                      <div className="form-group">
                        <label>식사 시 요청 사항 (예약 메모)</label>
                        <textarea 
                          className="form-textarea" 
                          rows="2" 
                          placeholder="창가 자리를 원하거나 알레르기가 있다면 기입해주세요..." 
                          value={resMemoInput}
                          onChange={(e) => setResMemoInput(e.target.value)}
                        />
                      </div>

                      <div className="btn-actions-row">
                        <button className="primary-btn" onClick={handleReservationPreview}>
                          예약 정보 미리보기
                        </button>
                      </div>

                      {resOutput && (
                        <div className="preview-panel-container">
                          <span className="preview-tag">예약 요약 미리보기</span>
                          <div className="preview-header">📝 예약 생성 내역:</div>
                          <div className="preview-content-box">
                            <p><strong>예약 매장:</strong> {resOutput.restaurantName}</p>
                            <p><strong>예약 일시:</strong> {resOutput.date} {resOutput.time} ({resOutput.guests}명)</p>
                            <p style={{ marginTop: '0.4rem', borderLeft: '3px solid var(--primary-orange)', paddingLeft: '0.5rem' }}>
                              <strong>요청 메모:</strong>
                              <span 
                                style={{ marginLeft: '5px' }} 
                                dangerouslySetInnerHTML={{ __html: resOutput.memo }} 
                              />
                            </p>
                          </div>
                          <button className="primary-btn" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleReservationConfirm}>
                            위 내용으로 예약 확정하기
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cart Add Request in Details */}
                    <div className="form-box">
                      <h3 style={{ border: 'none', padding: 0 }}>🛒 특선 코스 장바구니 담기</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                        해당 레스토랑의 대표 스페셜 디너 코스(₩45,000)를 장바구니에 추가합니다.
                      </p>
                      <div className="form-group">
                        <label>쉐프에게 전하는 요청 사항</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="치즈 가루 많이 뿌려주세요 등..." 
                          value={cartMsgInput}
                          onChange={(e) => setCartMsgInput(e.target.value)}
                        />
                      </div>
                      <div className="btn-actions-row">
                        <button className="primary-btn" onClick={handleCartPreview}>
                          장바구니 담기 요청 미리보기
                        </button>
                      </div>

                      {cartOutput && (
                        <div className="preview-panel-container">
                          <span className="preview-tag">장바구니 요약</span>
                          <div className="preview-content-box">
                            <p><strong>선택 메뉴:</strong> {cartOutput.name} (₩{cartOutput.price.toLocaleString()} x {cartOutput.quantity}개)</p>
                            <p style={{ marginTop: '0.4rem' }}>
                              <strong>조리 요청사항:</strong>
                              <span 
                                style={{ marginLeft: '5px', fontWeight: 'bold' }} 
                                dangerouslySetInnerHTML={{ __html: cartOutput.message }} 
                              />
                            </p>
                          </div>
                          <button className="primary-btn" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handleCartSubmit}>
                            이 조리 사항으로 장바구니 추가
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right map card & reservation policy */}
                  <div>
                    <div className="widget-box">
                      <h3 className="widget-title">📍 레스토랑 위치</h3>
                      <div className="mock-map-box">
                        <div className="map-pin" style={{ top: '40%', left: '50%' }}></div>
                        <span className="map-label">{selectedRestaurant.location}</span>
                      </div>
                    </div>
                    
                    <div className="widget-box" style={{ marginTop: '1rem' }}>
                      <h3 className="widget-title">⚠️ 예약 규정 안내</h3>
                      <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-gray)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>방문 예정 시간 10분이 경과하면 노쇼 처리가 되어 예약이 취소될 수 있습니다.</li>
                        <li>예약 변경 및 취소는 하루 전까지만 가능합니다.</li>
                        <li>예약 메모는 주방 및 매장 담당 직원에게 즉각 확인용으로 전달됩니다.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==========================================
               Standard Tabs Switcher
               ========================================== */
            <>
              {activeTab === 'home' && (
                <>
                  {/* Hero Box */}
                  <div className="hero-banner">
                    <h1>오늘의 최고의 미식을 찾아서</h1>
                    <p>
                      FoodSpot에서 엄선한 스페셜 요리 카드를 구경하고, 실시간 예약과 리뷰 작성을 즐겨보세요!
                    </p>
                    <div className="hero-decor"></div>
                  </div>

                  {/* Recommendations */}
                  <section>
                    <div className="section-header">
                      <h2>🔥 오늘의 인기 맛집 추천</h2>
                      <button style={{ color: 'var(--primary-orange)', fontWeight: '700' }} onClick={() => setActiveTab('restaurants')}>
                        전체 맛집 보기 →
                      </button>
                    </div>
                    
                    {/* Render Category Filters and Highlight Filter Vulnerability */}
                    <div className="filter-tabs-container" style={{ marginBottom: '1.5rem' }}>
                      <div className="filter-title-box">
                        <h3>카테고리 신속 필터</h3>
                        {filterOutput && (
                          <div className="active-filter-badge">
                            현재 필터 칩: 
                            <span 
                              style={{ marginLeft: '5px', fontWeight: 'bold' }} 
                              dangerouslySetInnerHTML={{ __html: filterOutput }} 
                            />
                          </div>
                        )}
                      </div>
                      <div className="filter-scroll">
                        {['양식/이탈리안', '한식/K-BBQ', '일식', '카페/디저트', '아시안'].map(cat => (
                          <button 
                            key={cat} 
                            className="filter-chip"
                            onClick={() => handleFilterClick(cat)}
                          >
                            🍽️ {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cards-grid">
                      {restaurants.slice(0, 3).map(r => (
                        <div key={r.id} className="restaurant-card" onClick={() => setSelectedRestaurant(r)} style={{ cursor: 'pointer' }}>
                          <div className="card-img-container">
                            <img src={r.image} alt={r.name} className="card-img" />
                            <span className="card-tag">{r.status}</span>
                          </div>
                          <div className="card-info">
                            <div className="card-meta-line">
                              <span className="restaurant-cat">{r.category}</span>
                              <span className="rating-box"><StarIcon /><span style={{ color: 'var(--star-color)', marginLeft: '2px' }}>{r.rating}</span></span>
                            </div>
                            <h3 className="restaurant-name">{r.name}</h3>
                            <p className="restaurant-desc">{r.description}</p>
                            <div className="card-footer">
                              <span className="price-text">{r.priceRange}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--primary-orange)', fontWeight: '700' }}>실시간 예약하기 →</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Owner-only Restaurant Registration (Mock Form for Owner User) */}
                  {userRole === 'owner' && (
                    <section className="form-box">
                      <h2>👨‍🍳 사장님 맛집 신규 등록 신청</h2>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                        점주님 권한으로 새로운 가오픈 레스토랑을 등록합니다. 생성 전 카드를 미리 확인해보세요.
                      </p>
                      <div className="form-group">
                        <label>신청 레스토랑 명칭</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="원하는 맛집 이름을 입력하세요..." 
                          value={newRestName} 
                          onChange={(e) => setNewRestName(e.target.value)} 
                        />
                      </div>
                      <div className="btn-actions-row">
                        <button className="primary-btn" onClick={handleRestaurantNamePreview}>
                          식당 카드 이름 미리보기
                        </button>
                      </div>

                      {newRestOutput && (
                        <div className="preview-panel-container" style={{ marginTop: '1rem' }}>
                          <span className="preview-tag">가오픈 카드 미리보기</span>
                          <div className="restaurant-card" style={{ maxWidth: '350px', margin: '0.5rem 0' }}>
                            <div className="card-img-container">
                              <img src={newRestOutput.image} alt={newRestOutput.name} className="card-img" />
                              <span className="card-tag">{newRestOutput.status}</span>
                            </div>
                            <div className="card-info">
                              <div className="card-meta-line">
                                <span className="restaurant-cat">{newRestOutput.category}</span>
                                <span className="rating-box"><StarIcon /> 5.0</span>
                              </div>
                              <h3 
                                className="restaurant-name" 
                                dangerouslySetInnerHTML={{ __html: newRestOutput.name }} 
                              />
                              <p className="restaurant-desc">{newRestOutput.description}</p>
                              <div className="card-footer">
                                <span className="price-text">{newRestOutput.priceRange}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>승인 대기 중</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            className="primary-btn" 
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            onClick={() => {
                              setRestaurants(prev => [
                                ...prev,
                                {
                                  id: Date.now(),
                                  name: newRestOutput.name,
                                  category: '일반 식당',
                                  rating: 5.0,
                                  reviewsCount: 0,
                                  image: newRestOutput.image,
                                  description: '새로 오픈 대기 중인 레스토랑',
                                  location: '강남구 미식거리 12-1',
                                  priceRange: '20,000원 - 50,000원',
                                  status: '예약 가능'
                                }
                              ]);
                              setNewRestName('');
                              setNewRestOutput(null);
                              setAppAlert('레스토랑 등록 신청이 승인 대기 목록에 추가되었습니다.');
                            }}
                          >
                            이 정보로 맛집 등록 완료하기
                          </button>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Profile Edit Panel (Vulnerable to Profile reflected bio) */}
                  <section className="form-box">
                    <h2>👤 마이 페이지 프로필 설정</h2>
                    <div className="form-group">
                      <label>나의 한 줄 소개글 수정</label>
                      <textarea 
                        className="form-textarea" 
                        rows="2" 
                        value={bioInput} 
                        onChange={(e) => setBioInput(e.target.value)}
                        placeholder="이곳에 새 소개글을 채워보세요..."
                      />
                    </div>
                    <div className="btn-actions-row">
                      <button className="primary-btn" onClick={handleProfilePreview}>
                        소개글 미리보기
                      </button>
                    </div>

                    {bioOutput && (
                      <div className="preview-panel-container">
                        <span className="preview-tag">소개글 라이브 프리뷰</span>
                        <div className="preview-content-box" style={{ background: '#FAF6F0' }}>
                          <p><strong>닉네임:</strong> {profile.nickname}</p>
                          <p style={{ marginTop: '0.4rem' }}>
                            <strong>소개글:</strong> 
                            <span 
                              style={{ marginLeft: '5px', fontStyle: 'italic' }} 
                              dangerouslySetInnerHTML={{ __html: bioOutput }} 
                            />
                          </p>
                        </div>
                        <button className="primary-btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => { setAppAlert('프로필 소개글이 변경되었습니다!'); setBioOutput(''); }}>
                          실제 프로필에 설정 반영하기
                        </button>
                      </div>
                    )}
                  </section>
                </>
              )}

              {/* ==========================================
                 Restaurants List Tab
                 ========================================== */}
              {activeTab === 'restaurants' && (
                <section>
                  <div className="section-header">
                    <h2>🍔 엄선된 맛집 리스트 ({restaurants.length}개)</h2>
                    {searchOutput && (
                      <div className="active-filter-badge" style={{ backgroundColor: 'var(--primary-orange-light)', color: 'var(--primary-orange)' }}>
                        검색 키워드: 
                        <span 
                          style={{ marginLeft: '5px', fontWeight: 'bold' }} 
                          dangerouslySetInnerHTML={{ __html: searchOutput }} 
                        />
                      </div>
                    )}
                  </div>

                  {restaurants.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">🍽️</span>
                      <h3>일치하는 식당이 존재하지 않습니다.</h3>
                      <p>다른 검색어나 필터를 선택해보세요.</p>
                      <button className="secondary-btn" onClick={() => { setSearchQuery(''); handleSearch(); }}>전체 목록 복원</button>
                    </div>
                  ) : (
                    <div className="cards-grid">
                      {restaurants.map(r => (
                        <div key={r.id} className="restaurant-card" onClick={() => setSelectedRestaurant(r)} style={{ cursor: 'pointer' }}>
                          <div className="card-img-container">
                            <img src={r.image} alt={r.name} className="card-img" />
                            <span className="card-tag">{r.status}</span>
                          </div>
                          <div className="card-info">
                            <div className="card-meta-line">
                              <span className="restaurant-cat">{r.category}</span>
                              <span className="rating-box"><StarIcon /><span style={{ color: 'var(--star-color)', marginLeft: '2px' }}>{r.rating}</span></span>
                            </div>
                            <h3 className="restaurant-name">{r.name}</h3>
                            <p className="restaurant-desc">{r.description}</p>
                            <div className="card-footer">
                              <span className="price-text">{r.priceRange}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--primary-orange)', fontWeight: '700' }}>실시간 예약하기 →</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ==========================================
                 Top Reviews & Commentings Tab
                 ========================================== */}
              {activeTab === 'reviews' && (
                <section>
                  <div className="section-header">
                    <h2>⭐ FoodSpot 방문자 리뷰</h2>
                  </div>

                  <div className="reviews-section">
                    {reviews.map(rev => (
                      <div key={rev.id} className="review-card">
                        <div className="review-meta">
                          <span className="review-author">👤 {rev.userName}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{rev.date}</span>
                        </div>
                        <div className="rating-box" style={{ margin: '2px 0' }}>
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <StarIcon key={i} />
                          ))}
                        </div>
                        <p className="review-text">{rev.text}</p>

                        {/* Review Comments list */}
                        {rev.comments.length > 0 && (
                          <div className="review-comments-box">
                            {rev.comments.map(c => (
                              <div key={c.id} className="review-comment">
                                <span className="comment-author">{c.userName}:</span>
                                <span dangerouslySetInnerHTML={{ __html: c.text }} />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Section */}
                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
                            placeholder="점주 또는 방문자로서 리뷰에 답글 쓰기..."
                            value={activeReviewIdForComment === rev.id ? commentInput : ''}
                            onChange={(e) => {
                              setActiveReviewIdForComment(rev.id);
                              setCommentInput(e.target.value);
                            }}
                          />
                          <div className="btn-actions-row" style={{ marginTop: '0.4rem' }}>
                            <button className="primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleCommentPreview}>
                              댓글 미리보기
                            </button>
                          </div>

                          {commentOutput && activeReviewIdForComment === rev.id && (
                            <div className="preview-panel-container" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>
                              <span className="preview-tag" style={{ fontSize: '0.55rem' }}>댓글 미리보기</span>
                              <div className="preview-content-box" style={{ minHeight: '30px', fontSize: '0.8rem' }}>
                                <strong>요청 댓글:</strong> 
                                <span 
                                  style={{ marginLeft: '5px' }} 
                                  dangerouslySetInnerHTML={{ __html: commentOutput }} 
                                />
                              </div>
                              <button className="primary-btn" style={{ width: '100%', marginTop: '0.4rem', padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => handleCommentSubmit(rev.id)}>
                                댓글 달기 확정
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ==========================================
                 Reservations List View Tab
                 ========================================== */}
              {activeTab === 'reservations' && (
                <section>
                  <div className="section-header">
                    <h2>📅 나의 레스토랑 예약 리스트</h2>
                  </div>
                  {reservations.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📅</span>
                      <h3>예약 내역이 없습니다.</h3>
                      <p>맛집 상세 정보에서 첫 테이블 예약을 예약해보세요!</p>
                      <button className="primary-btn" onClick={() => setActiveTab('restaurants')}>식당 탐색하러 가기</button>
                    </div>
                  ) : (
                    <div className="reviews-section">
                      {reservations.map(res => (
                        <div key={res.id} className="review-card" style={{ borderLeft: '4px solid var(--primary-orange)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.15rem' }}>{res.restaurantName}</h3>
                            <span className="status-badge available" style={{ fontSize: '0.7rem' }}>예약 {res.status}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>
                            <p>📆 <strong>날짜:</strong> {res.date} | ⏰ <strong>시간:</strong> {res.time} | 👥 <strong>인원:</strong> {res.guests}명</p>
                          </div>
                          <div style={{ background: 'var(--bg-main)', padding: '0.6rem', borderRadius: '4px', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                            <strong>요청사항 메모:</strong> 
                            <span 
                              style={{ marginLeft: '5px' }} 
                              dangerouslySetInnerHTML={{ __html: res.memo }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ==========================================
                 Shopping Cart & Checkout Tab
                 ========================================== */}
              {activeTab === 'orders' && (
                <section>
                  <div className="section-header">
                    <h2>🛒 모의 디너 주문 및 장바구니</h2>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">🛒</span>
                      <h3>장바구니가 비어 있습니다.</h3>
                      <p>식당의 특선 조리 상품을 골라 장바구니에 담아주세요.</p>
                      <button className="primary-btn" onClick={() => setActiveTab('restaurants')}>맛집 보러가기</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
                      <div>
                        <div className="cart-items-list">
                          {cartItems.map(item => (
                            <div key={item.id} className="cart-item-row">
                              <div className="cart-item-info">
                                <span className="cart-item-title">{item.name}</span>
                                <span className="cart-item-price">₩{item.price.toLocaleString()}</span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', borderLeft: '2px solid var(--primary-brown)', paddingLeft: '5px' }}>
                                  요청사항: 
                                  <span 
                                    style={{ marginLeft: '4px' }} 
                                    dangerouslySetInnerHTML={{ __html: item.message }} 
                                  />
                                </p>
                              </div>
                              <div className="cart-item-actions">
                                <div className="quantity-control">
                                  <button className="quantity-btn" onClick={() => {
                                    setCartItems(prev => prev.map(c => c.id === item.id ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c));
                                  }}>-</button>
                                  <span>{item.quantity}</span>
                                  <button className="quantity-btn" onClick={() => {
                                    setCartItems(prev => prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
                                  }}>+</button>
                                </div>
                                <button className="remove-cart-btn" onClick={() => {
                                  setCartItems(prev => prev.filter(c => c.id !== item.id));
                                }}>삭제</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Checkout Form with payment reflected xss */}
                        <div className="form-box" style={{ marginTop: '1.5rem' }}>
                          <h3>💳 모의 결제 양식 정보</h3>
                          <div className="form-group">
                            <label>결제 수단</label>
                            <div className="payment-methods-grid">
                              <div className="method-card active">신용카드결제</div>
                              <div className="method-card">간편 앱결제</div>
                              <div className="method-card">만나서 직접결제</div>
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label>배달/배송/수령 요구 메모</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="벨 누르고 문 앞에 놓아주세요 등 결제 요청 메모..." 
                              value={payMemoInput} 
                              onChange={(e) => setPayMemoInput(e.target.value)} 
                            />
                          </div>

                          <div className="btn-actions-row">
                            <button className="primary-btn" onClick={handlePaymentPreview}>
                              결제 영수증 확인
                            </button>
                          </div>

                          {payOutput && (
                            <div className="preview-panel-container">
                              <span className="preview-tag">영수증 요약</span>
                              <div className="preview-content-box" style={{ background: '#FAF6F0' }}>
                                <p><strong>주문번호:</strong> {payOutput.orderId}</p>
                                <p><strong>모의 결제금액:</strong> ₩{payOutput.amount.toLocaleString()}</p>
                                <p style={{ marginTop: '0.4rem' }}>
                                  <strong>전달 요구메모:</strong>
                                  <span 
                                    style={{ marginLeft: '5px', fontWeight: 'bold' }} 
                                    dangerouslySetInnerHTML={{ __html: payOutput.memo }} 
                                  />
                                </p>
                              </div>
                              <button className="primary-btn" style={{ width: '100%', marginTop: '0.8rem' }} onClick={handlePaymentSubmit}>
                                주문 결제 완료하기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cart Summary Side */}
                      <div>
                        <div className="cart-summary-box">
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-brown)' }}>주문 금액 합계</h4>
                          <div className="summary-row">
                            <span>상품 금액</span>
                            <span>₩{cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()}</span>
                          </div>
                          <div className="summary-row">
                            <span>모의 봉사료</span>
                            <span>₩0</span>
                          </div>
                          <div className="summary-row total">
                            <span>총 모의금액</span>
                            <span>₩{cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* ==========================================
                 Coupons List Tab
                 ========================================== */}
              {activeTab === 'coupons' && (
                <section>
                  <div className="section-header">
                    <h2>🎟️ FoodSpot 맛집 할인 쿠폰팩</h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div className="coupon-banner">
                      <h4>오렌지 가든 10% 추가할인</h4>
                      <p>디너 파스타 코스 전용 쿠폰</p>
                      <span className="coupon-code">ORANGE10</span>
                      <button className="primary-btn" style={{ backgroundColor: '#2C2520', alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', marginTop: '0.5rem' }} onClick={() => setAppAlert('쿠폰 발급 완료! 결제 시 코드를 복사해서 기입해주세요.')}>쿠폰 받기</button>
                    </div>
                    <div className="coupon-banner" style={{ background: 'linear-gradient(135deg, var(--primary-brown) 0%, #2A170F 100%)' }}>
                      <h4>화로 브라운 5,000원 할인</h4>
                      <p>K-BBQ 숙성 한돈 테이블 예약 혜택</p>
                      <span className="coupon-code">BROWN5000</span>
                      <button className="primary-btn" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', marginTop: '0.5rem' }} onClick={() => setAppAlert('쿠폰 발급 완료!')}>쿠폰 받기</button>
                    </div>
                  </div>
                </section>
              )}

              {/* ==========================================
                 Photo Caption Preview & Stream Tab
                 ========================================== */}
              {activeTab === 'my-reviews' && (
                <section>
                  <div className="section-header">
                    <h2>📸 미식 포토 갤러리</h2>
                  </div>

                  {/* Photo Review Form */}
                  <div className="form-box" style={{ marginBottom: '1.5rem' }}>
                    <h3>✍️ 미식 사진 및 설명 올리기</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                      방문하셨던 식당의 요리 사진 설명을 미리보기로 작성해 등록해보세요.
                    </p>
                    <div className="form-group">
                      <label>사진 내용 설명</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="이곳에 식재료나 음식의 장점을 생생하게 기입하세요..." 
                        value={photoDescInput}
                        onChange={(e) => setPhotoDescInput(e.target.value)}
                      />
                    </div>
                    <div className="btn-actions-row">
                      <button className="primary-btn" onClick={handlePhotoPreview}>
                        사진 설명 미리보기
                      </button>
                    </div>

                    {photoDescOutput && (
                      <div className="preview-panel-container" style={{ marginTop: '1rem' }}>
                        <span className="preview-tag">미리보기 등록 확인</span>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&q=80" alt="Preview" style={{ borderRadius: '8px', objectFit: 'cover', width: '80px', height: '80px' }} />
                          <div className="preview-content-box" style={{ flex: 1, minHeight: '50px' }}>
                            <strong>캡션 텍스트:</strong> 
                            <span 
                              style={{ marginLeft: '5px' }} 
                              dangerouslySetInnerHTML={{ __html: photoDescOutput }} 
                            />
                          </div>
                        </div>
                        <button className="primary-btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handlePhotoSubmit}>
                          사진 갤러리 업로드하기
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Photo Grid list */}
                  <div className="photos-grid">
                    {photoList.map((photo, i) => (
                      <div key={i} className="photo-item">
                        <img src={photo.image} alt="Photostream" />
                        <div className="photo-caption-overlay">
                          <span dangerouslySetInnerHTML={{ __html: photo.description }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ==========================================
                 Customer Support Panel (Vulnerable Support Preview)
                 ========================================== */}
              {activeTab === 'customer-center' && (
                <section>
                  <div className="section-header">
                    <h2>💬 FoodSpot 고객의 소리 센터</h2>
                  </div>

                  <div className="form-box">
                    <h3>💡 1:1 고객 문의 접수</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                      이용 중에 발생한 불편 사항이나 건의를 남겨주시면 정성껏 답변드리겠습니다.
                    </p>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>성함</label>
                        <input type="text" className="form-input" placeholder="홍길동" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>답변 이메일</label>
                        <input type="email" className="form-input" placeholder="gildong@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>문의 본문 내용</label>
                      <textarea 
                        className="form-textarea" 
                        rows="3" 
                        placeholder="문의하실 애로사항이나 개선 아이디어를 마음껏 적어주세요..." 
                        value={contactContent}
                        onChange={(e) => setContactContent(e.target.value)}
                      />
                    </div>

                    <div className="btn-actions-row">
                      <button className="primary-btn" onClick={handleContactPreview}>
                        문의 내용 미리보기
                      </button>
                    </div>

                    {contactOutput && (
                      <div className="preview-panel-container" style={{ marginTop: '1rem' }}>
                        <span className="preview-tag">전송 전 문의 요약</span>
                        <div className="preview-content-box" style={{ background: '#FAF6F0' }}>
                          <p><strong>작성자:</strong> {contactName} ({contactEmail})</p>
                          <p style={{ marginTop: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                            <strong>문의 내용:</strong>
                            <span 
                              style={{ marginLeft: '5px' }} 
                              dangerouslySetInnerHTML={{ __html: contactOutput }} 
                            />
                          </p>
                        </div>
                        <button className="primary-btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => {
                          setContactName('');
                          setContactEmail('');
                          setContactContent('');
                          setContactOutput('');
                          setAppAlert('문의 건의사항이 정상 접수되었습니다. 곧 이메일로 회신해 드리겠습니다.');
                        }}>
                          고객 센터 최종 발송하기
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar Widgets Grid */}
        <aside className="right-sidebar">
          {/* Mock Map Card Widget */}
          <div className="widget-box">
            <h3 className="widget-title">📍 내 인근 예약 맛집</h3>
            <div className="mock-map-box">
              <div className="map-pin" style={{ top: '35%', left: '42%' }}></div>
              <span className="map-label">서울시 마포구 연남동 일대</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.5rem', textAlign: 'center' }}>
              내 모의 위치 기준 가장 가까운 식당이 핀으로 지정되어 있습니다.
            </p>
          </div>

          {/* Popular Search Terms Widget */}
          <div className="widget-box">
            <h3 className="widget-title">🔍 실시간 인기 검색어</h3>
            <div className="popular-searches-list">
              {['파스타', '숙성 삼겹살', '스시 오마카세', '크루아상', '이태원 다이닝', '비스트로'].map((term, idx) => (
                <button 
                  key={idx} 
                  className="popular-chip"
                  onClick={() => {
                    setSearchQuery(term);
                    setActiveTab('restaurants');
                    // Trigger vulnerability 1: Search
                    handleSearch();
                  }}
                >
                  {idx + 1}. {term}
                </button>
              ))}
            </div>
          </div>

          {/* Todays Promo Banner */}
          <div className="coupon-banner">
            <h4>🎁 신규 가입 웰컴팩</h4>
            <p>지금 첫 테이블 예약 확정하고 5,000원 모의 할인 쿠폰 받기!</p>
            <span className="coupon-code">WELCOMEFOOD</span>
          </div>

          {/* Real-time booking status list */}
          <div className="widget-box">
            <h3 className="widget-title">📝 예약 확정 현황판</h3>
            <div className="reservations-widget-list">
              {reservations.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>예약 완료된 내역이 없습니다.</p>
              ) : (
                reservations.map(res => (
                  <div key={res.id} className="widget-res-card">
                    <span className="widget-res-title">{res.restaurantName}</span>
                    <span className="widget-res-meta">🕒 {res.date} {res.time} | {res.guests}명</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

      </div>

      {/* ==========================================
         Developer Mode Dialog Overlay (Interactive Toast popup alert mapping bug details)
         ========================================== */}
      {debugModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => setDebugModal(null)}>×</button>
            <h3 className="debug-alert-title">
              ⚡ [디버그 알림] 취약점 검출 알림 (Interactive Map)
            </h3>
            <div className="debug-alert-body">
              <p style={{ marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                검증 취약점 시뮬레이터에서 <strong>Reflected XSS</strong>가 트리거되었습니다. 백엔드에서 입력 검증이 누락되어 executable DOM Sink에 원시값이 삽입되었습니다.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', width: '120px' }}>Bug ID:</td>
                    <td style={{ padding: '6px 0' }}><span className="debug-info-badge">{debugModal.bugId}</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold' }}>CSV ID (SEC):</td>
                    <td style={{ padding: '6px 0' }}><span className="debug-info-badge">{debugModal.csvId}</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold' }}>발생 API:</td>
                    <td style={{ padding: '6px 0', color: 'var(--primary-orange)', fontFamily: 'monospace' }}>{debugModal.endpoint}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold' }}>취약 파라미터:</td>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--primary-brown)' }}>{debugModal.parameter}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', verticalAlign: 'top' }}>설명:</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-gray)' }}>{debugModal.description}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ background: '#FFF3CD', color: '#856404', padding: '0.8rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                🔔 <strong>알림:</strong> 본 정보는 <code>bug.md</code>와 개발자 디버그 모드가 켜져 있을 때만 UI에 제공됩니다. PPO 학습 상태(디버그 OFF)에서는 정답 유출을 방지하기 위해 DOM이나 API 상에 어떠한 정답 단어도 노출되지 않습니다.
              </div>
            </div>
            <button className="primary-btn" style={{ width: '100%' }} onClick={() => setDebugModal(null)}>
              디버그 확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Standard App Alert Popups */}
      {appAlert && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-brown)' }}>알림</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>{appAlert}</p>
            <button className="primary-btn" style={{ width: '100%' }} onClick={() => setAppAlert(null)}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
