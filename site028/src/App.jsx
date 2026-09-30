import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState('flights'); // 'flights' | 'accommodations' | 'destinations' | 'itineraries'
  
  // Data States
  const [flights, setFlights] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Filter / Sort / Pagination States
  const [flightSort, setFlightSort] = useState('');
  const [flightPage, setFlightPage] = useState(1);
  const [flightTotalPages, setFlightTotalPages] = useState(2);
  const [stayLocationFilter, setStayLocationFilter] = useState('');

  // Search Hero Inputs
  const [searchFrom, setSearchFrom] = useState('서울/인천 (ICN)');
  const [searchTo, setSearchTo] = useState('베트남 다낭 (DAD)');
  const [searchDate, setSearchDate] = useState('2026-10-12 ~ 2026-10-17');
  const [searchGuests, setSearchGuests] = useState('성인 2명, 객실 1개');

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  // Selected Item for Booking Checkout
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [paymentMethod, setPaymentMethod] = useState('신용/체크카드');

  // Itinerary Planner Form States
  const [itinTitle, setItinTitle] = useState('');
  const [itinDest, setItinDest] = useState('베트남 다낭');
  const [itinPlaceInput, setItinPlaceInput] = useState('');
  const [itinPlaces, setItinPlaces] = useState(['미케비치 일출 산책', '바나힐 골든브릿지 투어', '호이안 등불 야시장']);
  const [itinNotes, setItinNotes] = useState('전 일정 픽업 차량 포함, 맛집 사전 예약 필수');

  // User Profile
  const [user, setUser] = useState({
    name: '이지우',
    email: 'traveler@auravoyage.io',
    membershipTier: 'Voyage Diamond',
    mileage: 18450,
    phone: '010-8921-4472',
    address: '서울특별시 서초구 반포대로 201',
    detailAddress: '102동 1504호',
    postcode: '06542'
  });

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Address Inputs
  const [editPostcode, setEditPostcode] = useState(user.postcode);
  const [editAddress, setEditAddress] = useState(user.address);
  const [editDetailAddress, setEditDetailAddress] = useState(user.detailAddress);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Initial Load
  useEffect(() => {
    fetchDestinations();
    fetchFlights();
    fetchAccommodations();
    fetchWishlist();
    fetchBookings();
    fetchItineraries();
    fetchRecentSearches();
    fetchProfile();
  }, []);

  // API Call: Fetch Profile
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setEditPostcode(data.postcode || '');
        setEditAddress(data.address || '');
        setEditDetailAddress(data.detailAddress || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Destinations
  const fetchDestinations = async () => {
    try {
      const res = await fetch('/api/destinations');
      if (res.ok) {
        const data = await res.json();
        setDestinations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Flights (Sort / Pagination triggers SEC-285, SEC-286)
  const fetchFlights = async (sortValue = '', pageValue = null) => {
    try {
      let url = '/api/flights';
      if (sortValue) {
        url = `/api/flights?sort=${encodeURIComponent(sortValue)}`;
      } else if (pageValue !== null) {
        url = `/api/flights?page=${pageValue}&limit=3`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFlights(data.flights || []);
        if (data.totalPages) {
          setFlightTotalPages(data.totalPages);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Accommodations (Location filter triggers SEC-287)
  const fetchAccommodations = async (locationVal = '') => {
    try {
      let url = '/api/accommodations';
      if (locationVal !== '') {
        url = `/api/accommodations?location=${encodeURIComponent(locationVal)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAccommodations(data.accommodations || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Wishlist
  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Bookings List
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Single Booking Detail (Triggers SEC-288)
  const fetchSingleBookingDetail = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBookingDetail(data.booking);
      } else {
        showToast('예약 상세 정보를 불러오지 못했습니다.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Itineraries List
  const fetchItineraries = async () => {
    try {
      const res = await fetch('/api/itineraries');
      if (res.ok) {
        const data = await res.json();
        setItineraries(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Call: Recent Searches
  const fetchRecentSearches = async () => {
    try {
      const res = await fetch('/api/recent-searches');
      if (res.ok) {
        const data = await res.json();
        setRecentSearches(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Search Submission
  const handleHeroSearch = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/recent-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchTo,
          type: activeTab,
          date: searchDate,
          guests: 2
        })
      });
      fetchRecentSearches();

      if (activeTab === 'accommodations') {
        setStayLocationFilter(searchTo);
        fetchAccommodations(searchTo);
      }
      showToast(`'${searchTo}' 맞춤 여행 일정을 실시간으로 검색했습니다.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Flight Sort Change (Triggers SEC-285)
  const handleSortChange = (e) => {
    const val = e.target.value;
    setFlightSort(val);
    setFlightPage(1);
    fetchFlights(val);
  };

  // Handle Flight Page Change (Triggers SEC-286)
  const handlePageChange = (pageNum) => {
    setFlightPage(pageNum);
    setFlightSort('');
    fetchFlights('', pageNum);
  };

  // Handle Stay Location Filter Change (Triggers SEC-287)
  const handleLocationFilterChange = (loc) => {
    setStayLocationFilter(loc);
    fetchAccommodations(loc);
  };

  // Handle Wishlist Toggle (Triggers SEC-289)
  const handleToggleWishlist = async (item) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          type: item.type || (item.airline ? 'flight' : 'accommodation'),
          title: item.title || item.name,
          price: item.price || item.pricePerNight,
          image: item.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist);
        showToast(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Coupon Application (Triggers SEC-284)
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMsg({ type: 'error', text: '쿠폰 코드를 입력해주세요.' });
      return;
    }
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponMsg({ type: 'success', text: data.message });
        showToast(data.message);
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: data.message || '쿠폰 적용에 실패했습니다.' });
      }
    } catch (err) {
      setCouponMsg({ type: 'error', text: '쿠폰 처리 중 오류가 발생했습니다.' });
    }
  };

  // Start Booking Flow
  const openBookingModal = (item, type = 'accommodation') => {
    setCheckoutItem({
      ...item,
      checkoutType: type,
      basePrice: item.price || item.pricePerNight || 350000
    });
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMsg({ type: '', text: '' });
    setIsCheckoutModalOpen(true);
  };

  // Complete Booking & Payment
  const handleCompleteBooking = async () => {
    if (!checkoutItem) return;

    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalPrice = Math.max(0, checkoutItem.basePrice - discount);

    try {
      // 1. Create Booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: checkoutItem.checkoutType,
          title: checkoutItem.title || checkoutItem.name || (checkoutItem.airline + ' ' + checkoutItem.airlineCode),
          dates: searchDate,
          passengers: searchGuests,
          totalPrice: checkoutItem.basePrice,
          discountApplied: discount,
          couponCode: appliedCoupon ? appliedCoupon.code : null
        })
      });

      const bookingData = await bookingRes.json();

      if (bookingRes.ok) {
        // 2. Submit Payment
        const paymentRes = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingData.booking.bookingId,
            paymentMethod: paymentMethod,
            amount: finalPrice
          })
        });

        if (paymentRes.ok) {
          fetchBookings();
          setIsCheckoutModalOpen(false);
          showToast(`예약 및 결제가 완료되었습니다! (예약번호: ${bookingData.booking.bookingId})`);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('예약 진행 중 오류가 발생했습니다.');
    }
  };

  // Handle Login (Triggers SEC-281)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, name: data.user.name, email: data.user.email }));
        setIsAuthModalOpen(false);
        showToast(data.message);
      } else {
        showToast(data.error || '로그인 실패');
      }
    } catch (err) {
      showToast('로그인 요청 중 오류가 발생했습니다.');
    }
  };

  // Handle Register (Triggers SEC-282)
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, name: data.user.name, email: data.user.email, membershipTier: 'Voyage Silver' }));
        setIsAuthModalOpen(false);
        showToast(data.message);
      } else {
        showToast(data.error || '회원가입 실패');
      }
    } catch (err) {
      showToast('회원가입 요청 중 오류가 발생했습니다.');
    }
  };

  // Handle Address Update (Triggers SEC-283)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: editPostcode,
          address: editAddress,
          detailAddress: editDetailAddress
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.profile);
        setIsProfileModalOpen(false);
        showToast(data.message);
      }
    } catch (err) {
      showToast('주소 저장 중 오류가 발생했습니다.');
    }
  };

  // Handle Save Itinerary (Triggers SEC-290)
  const handleSaveItinerary = async (e) => {
    e.preventDefault();
    if (!itinTitle.trim()) {
      showToast('여행 일정 제목을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: itinTitle,
          destination: itinDest,
          places: itinPlaces,
          notes: itinNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setItineraries(data.itineraries);
        setItinTitle('');
        showToast(data.message);
      }
    } catch (err) {
      showToast('여행 일정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleAddPlace = () => {
    if (itinPlaceInput.trim()) {
      setItinPlaces([...itinPlaces, itinPlaceInput.trim()]);
      setItinPlaceInput('');
    }
  };

  const isWishlisted = (id) => wishlist.some(w => w.id === id);

  return (
    <div className="aura-app">
      {/* ====================================================
          TOP NAVIGATION BAR
          ==================================================== */}
      <header className="aura-header">
        <div className="aura-container">
          <nav className="aura-navbar">
            <div className="aura-logo" role="button" onClick={() => setActiveTab('flights')}>
              <div className="aura-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                </svg>
              </div>
              <span>AuraVoyage</span>
            </div>

            <div className="aura-nav-links">
              <button 
                className={`aura-nav-btn ${activeTab === 'flights' ? 'active' : ''}`}
                onClick={() => setActiveTab('flights')}
              >
                ✈️ 항공권
              </button>
              <button 
                className={`aura-nav-btn ${activeTab === 'accommodations' ? 'active' : ''}`}
                onClick={() => setActiveTab('accommodations')}
              >
                🏨 숙소 & 호텔
              </button>
              <button 
                className={`aura-nav-btn ${activeTab === 'destinations' ? 'active' : ''}`}
                onClick={() => setActiveTab('destinations')}
              >
                🌴 추천 여행지
              </button>
              <button 
                className={`aura-nav-btn ${activeTab === 'itineraries' ? 'active' : ''}`}
                onClick={() => setActiveTab('itineraries')}
              >
                🗺️ 여행 플래너
              </button>
              <button 
                className="aura-nav-btn"
                onClick={() => setIsWishlistDrawerOpen(true)}
              >
                ❤️ 찜한 목록
                {wishlist.length > 0 && <span className="aura-nav-badge">{wishlist.length}</span>}
              </button>
              <button 
                className="aura-nav-btn"
                onClick={() => setIsBookingsDrawerOpen(true)}
              >
                📋 내 예약
                {bookings.length > 0 && <span className="aura-nav-badge">{bookings.length}</span>}
              </button>
            </div>

            <div className="aura-user-controls">
              {user.name ? (
                <div className="aura-user-avatar" onClick={() => setIsProfileModalOpen(true)}>
                  <div className="aura-avatar-circle">{user.name.slice(0, 1)}</div>
                  <span className="aura-avatar-name">{user.name}님</span>
                  <span className="aura-tier-tag">{user.membershipTier}</span>
                </div>
              ) : (
                <button 
                  className="aura-btn-primary"
                  onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                >
                  로그인 / 회원가입
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ====================================================
          HERO SEARCH SECTION
          ==================================================== */}
      <section className="aura-hero-wrapper">
        <div className="aura-hero-bg-orb"></div>
        <div className="aura-hero-bg-orb2"></div>

        <div className="aura-container">
          <div className="aura-hero-content">
            <div className="aura-hero-badge">
              <span>✨ 2026 프리미엄 시즌 트래블 페스타 진행 중</span>
            </div>
            <h1 className="aura-hero-title">
              세상에서 가장 특별한 여정,<br />
              <span>AuraVoyage와 함께 떠나보세요</span>
            </h1>
            <p className="aura-hero-subtitle">
              전 세계 엄선된 럭셔리 숙소부터 최저가 직항 항공권까지, 스마트한 올인원 여행 플래닝
            </p>
          </div>

          {/* Search Float Box */}
          <div className="aura-search-box">
            <div className="aura-search-tabs">
              <button 
                className={`aura-tab-item ${activeTab === 'flights' ? 'active' : ''}`}
                onClick={() => setActiveTab('flights')}
              >
                ✈️ 왕복 & 편도 항공권
              </button>
              <button 
                className={`aura-tab-item ${activeTab === 'accommodations' ? 'active' : ''}`}
                onClick={() => setActiveTab('accommodations')}
              >
                🏨 호텔 & 풀빌라 숙소
              </button>
              <button 
                className={`aura-tab-item ${activeTab === 'destinations' ? 'active' : ''}`}
                onClick={() => setActiveTab('destinations')}
              >
                🌴 테마별 추천 여행지
              </button>
              <button 
                className={`aura-tab-item ${activeTab === 'itineraries' ? 'active' : ''}`}
                onClick={() => setActiveTab('itineraries')}
              >
                🗺️ 나만의 여행 일정 플래너
              </button>
            </div>

            <form className="aura-search-grid" onSubmit={handleHeroSearch}>
              <div className="aura-search-field">
                <span className="aura-field-label">출발지</span>
                <input 
                  type="text" 
                  className="aura-field-input" 
                  value={searchFrom} 
                  onChange={(e) => setSearchFrom(e.target.value)}
                  placeholder="출발 도시/공항"
                />
              </div>

              <div className="aura-search-field">
                <span className="aura-field-label">도착지 / 여행지</span>
                <input 
                  type="text" 
                  className="aura-field-input" 
                  value={searchTo} 
                  onChange={(e) => setSearchTo(e.target.value)}
                  placeholder="도착 도시/호텔명"
                />
              </div>

              <div className="aura-search-field">
                <span className="aura-field-label">일정 / 날짜</span>
                <input 
                  type="text" 
                  className="aura-field-input" 
                  value={searchDate} 
                  onChange={(e) => setSearchDate(e.target.value)}
                  placeholder="YYYY-MM-DD ~ YYYY-MM-DD"
                />
              </div>

              <div className="aura-search-field">
                <span className="aura-field-label">탑승 / 투숙 인원</span>
                <input 
                  type="text" 
                  className="aura-field-input" 
                  value={searchGuests} 
                  onChange={(e) => setSearchGuests(e.target.value)}
                  placeholder="성인 2명"
                />
              </div>

              <button type="submit" className="aura-search-action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                <span>검색</span>
              </button>
            </form>

            {/* Recent Searches */}
            <div className="aura-recent-bar">
              <span style={{ fontWeight: '700' }}>최근 검색:</span>
              {recentSearches.map((rec, idx) => (
                <button 
                  key={idx} 
                  className="aura-recent-tag"
                  onClick={() => {
                    setSearchTo(rec.query);
                    if (rec.type === 'accommodation') {
                      setActiveTab('accommodations');
                      handleLocationFilterChange(rec.query);
                    }
                    showToast(`'${rec.query}' 검색 조건을 불러왔습니다.`);
                  }}
                >
                  📍 {rec.query} ({rec.date})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          MAIN CONTENT AREA
          ==================================================== */}
      <main className="aura-container">
        
        {/* TAB 1: FLIGHTS */}
        {activeTab === 'flights' && (
          <section className="aura-section">
            <div className="aura-section-header">
              <div className="aura-section-title-wrap">
                <h2>실시간 특가 항공권</h2>
                <p>서울/인천 출발 인기 노선 실시간 최저가 운임</p>
              </div>
              <div className="aura-filter-pills">
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--navy-600)' }}>정렬:</span>
                <select 
                  className="aura-sort-select"
                  value={flightSort}
                  onChange={handleSortChange}
                >
                  <option value="">추천순 (기본)</option>
                  <option value="price_asc">가격 낮은순 (최저가)</option>
                  <option value="price_desc">가격 높은순</option>
                  <option value="duration">비행시간 최단순</option>
                </select>
              </div>
            </div>

            <div className="aura-flights-list">
              {flights.map((fl) => (
                <div key={fl.id} className="aura-flight-card">
                  <div className="aura-flight-airline">
                    <div className="aura-airline-logo">✈️</div>
                    <div>
                      <div className="aura-airline-name">{fl.airline}</div>
                      <div className="aura-airline-sub">{fl.airlineCode} · {fl.classType}</div>
                    </div>
                  </div>

                  <div className="aura-flight-timeline">
                    <div className="aura-time-node">
                      <div className="aura-time-val">{fl.deptTime}</div>
                      <div className="aura-airport-code">{fl.from}</div>
                    </div>

                    <div className="aura-flight-path">
                      <div className="aura-duration-text">{fl.duration}</div>
                      <div className="aura-path-line">
                        <span className="aura-path-plane">✈</span>
                      </div>
                      <div className="aura-flight-type-badge">{fl.isDirect ? '직항편' : '경유 1회'}</div>
                    </div>

                    <div className="aura-time-node">
                      <div className="aura-time-val">{fl.arrvTime}</div>
                      <div className="aura-airport-code">{fl.to}</div>
                    </div>
                  </div>

                  <div className="aura-flight-pricing">
                    <div className="aura-seat-left">잔여 {fl.seatsLeft}석 마감임박</div>
                    <div className="aura-price-tag">
                      {fl.price.toLocaleString()}원
                    </div>
                    <div className="aura-price-unit">{fl.baggage}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button 
                        className={`aura-wish-btn ${isWishlisted(fl.id) ? 'active' : ''}`}
                        style={{ position: 'static', width: '38px', height: '38px' }}
                        onClick={() => handleToggleWishlist({ id: fl.id, type: 'flight', title: `${fl.airline} ${fl.airlineCode}`, price: fl.price })}
                      >
                        {isWishlisted(fl.id) ? '❤️' : '🤍'}
                      </button>
                      <button 
                        className="aura-btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                        onClick={() => openBookingModal(fl, 'flight')}
                      >
                        예약하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Flights */}
            <div className="aura-pagination">
              {[...Array(flightTotalPages)].map((_, i) => (
                <button 
                  key={i}
                  className={`aura-page-btn ${flightPage === i + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: ACCOMMODATIONS */}
        {activeTab === 'accommodations' && (
          <section className="aura-section">
            <div className="aura-section-header">
              <div className="aura-section-title-wrap">
                <h2>럭셔리 호텔 & 프리미엄 풀빌라</h2>
                <p>평점 4.8 이상 검증된 전 세계 최고급 휴양 숙소</p>
              </div>
            </div>

            {/* Filter Pills (Triggers location filter SEC-287) */}
            <div className="aura-filter-bar">
              <div className="aura-filter-pills">
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--navy-600)' }}>지역 필터:</span>
                {['전체', '다낭', '교토', '스위스', '하와이', '발리'].map((loc) => (
                  <button 
                    key={loc}
                    className={`aura-pill-btn ${stayLocationFilter === loc || (loc === '전체' && !stayLocationFilter) ? 'active' : ''}`}
                    onClick={() => handleLocationFilterChange(loc === '전체' ? '' : loc)}
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--navy-500)', fontWeight: '600' }}>
                총 {accommodations.length}개 숙소 검색됨
              </span>
            </div>

            <div className="aura-stays-grid">
              {accommodations.map((stay) => (
                <div key={stay.id} className="aura-stay-card">
                  <div className="aura-stay-img-wrap">
                    <img src={stay.image} alt={stay.name} className="aura-stay-img" />
                    <div className="aura-stay-badge">{stay.tag}</div>
                    <button 
                      className={`aura-wish-btn ${isWishlisted(stay.id) ? 'active' : ''}`}
                      onClick={() => handleToggleWishlist(stay)}
                    >
                      {isWishlisted(stay.id) ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <div className="aura-stay-content">
                    <div className="aura-stay-type-rating">
                      <span className="aura-stay-type">{stay.type}</span>
                      <div className="aura-rating-badge">
                        ★ {stay.rating} ({stay.reviews})
                      </div>
                    </div>

                    <h3 className="aura-stay-name">{stay.name}</h3>
                    <div className="aura-stay-location">📍 {stay.country} · {stay.location}</div>

                    <div className="aura-perks-list">
                      {stay.perks.map((perk, i) => (
                        <span key={i} className="aura-perk-chip">{perk}</span>
                      ))}
                    </div>

                    <div className="aura-stay-bottom">
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--navy-400)' }}>1박 기준 (세금 포함)</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--sky-blue-700)' }}>
                          {stay.pricePerNight.toLocaleString()}원
                        </div>
                      </div>
                      <button 
                        className="aura-btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                        onClick={() => openBookingModal(stay, 'accommodation')}
                      >
                        객실 예약
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: DESTINATIONS */}
        {activeTab === 'destinations' && (
          <section className="aura-section">
            <div className="aura-section-header">
              <div className="aura-section-title-wrap">
                <h2>이달의 추천 큐레이션 여행지</h2>
                <p>여행자들이 가장 사랑하는 글로벌 명소 및 최적의 시즌 여행지</p>
              </div>
            </div>

            <div className="aura-dest-grid">
              {destinations.map((dest) => (
                <div 
                  key={dest.id} 
                  className="aura-dest-card"
                  onClick={() => {
                    setSearchTo(dest.name);
                    setActiveTab('accommodations');
                    handleLocationFilterChange(dest.name.split(' ')[0]);
                    showToast(`'${dest.name}' 숙소 검색 화면으로 이동합니다.`);
                  }}
                >
                  <img src={dest.image} alt={dest.name} className="aura-dest-bg-img" />
                  <div className="aura-dest-overlay">
                    <div className="aura-dest-top-badges">
                      <span className="aura-dest-badge">{dest.badge}</span>
                      <button 
                        className={`aura-wish-btn ${isWishlisted(dest.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist({ id: dest.id, type: 'destination', title: dest.name, price: 500000, image: dest.image });
                        }}
                      >
                        {isWishlisted(dest.id) ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div className="aura-dest-info-bottom">
                      <span style={{ fontSize: '0.8rem', color: 'var(--sand-200)', fontWeight: '700' }}>{dest.country}</span>
                      <h3>{dest.name}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>{dest.desc}</p>
                      <div className="aura-dest-meta-chips">
                        <span>🌡️ 평균 {dest.avgTemp}</span>
                        <span>⏱️ 비행 {dest.flightTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: ITINERARY PLANNER (Triggers SEC-290) */}
        {activeTab === 'itineraries' && (
          <section className="aura-section">
            <div className="aura-section-header">
              <div className="aura-section-title-wrap">
                <h2>나만의 맞춤 여행 일정 플래너</h2>
                <p>가고 싶은 명소와 방문 코스를 기록하고 실시간 여행 일정을 저장하세요</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Itinerary Creation Form */}
              <div style={{ background: 'var(--white)', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '18px', color: 'var(--navy-900)' }}>
                  새로운 여행 일정 등록
                </h3>

                <form onSubmit={handleSaveItinerary}>
                  <div className="aura-form-group">
                    <label className="aura-form-label">여행 코스 제목</label>
                    <input 
                      type="text" 
                      className="aura-form-input" 
                      placeholder="예: 4박 5일 다낭 & 호이안 힐링 여정"
                      value={itinTitle}
                      onChange={(e) => setItinTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="aura-form-group">
                    <label className="aura-form-label">목적지 / 여행 도시</label>
                    <input 
                      type="text" 
                      className="aura-form-input" 
                      value={itinDest}
                      onChange={(e) => setItinDest(e.target.value)}
                      required
                    />
                  </div>

                  <div className="aura-form-group">
                    <label className="aura-form-label">방문 장소 추가</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="aura-form-input" 
                        placeholder="장소명 입력 (예: 바나힐 골든브릿지)"
                        value={itinPlaceInput}
                        onChange={(e) => setItinPlaceInput(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="aura-btn-secondary" 
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={handleAddPlace}
                      >
                        추가
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {itinPlaces.map((pl, idx) => (
                        <span key={idx} className="aura-perk-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px' }}>
                          📍 {pl}
                          <button type="button" onClick={() => setItinPlaces(itinPlaces.filter((_, i) => i !== idx))} style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="aura-form-group">
                    <label className="aura-form-label">여행 메모 / 준비물</label>
                    <textarea 
                      className="aura-form-input" 
                      rows="3"
                      value={itinNotes}
                      onChange={(e) => setItinNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="aura-btn-primary" 
                    style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
                  >
                    여행 일정 저장하기
                  </button>
                </form>
              </div>

              {/* Saved Itineraries List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                  저장된 여행 일정 목록 ({itineraries.length})
                </h3>

                {itineraries.map((it) => (
                  <div key={it.id} className="aura-item-card" style={{ background: 'var(--white)' }}>
                    <div className="aura-item-header">
                      <div>
                        <span className="aura-stay-badge" style={{ position: 'static', background: 'var(--sky-blue-600)' }}>
                          {it.destination}
                        </span>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '8px', color: 'var(--navy-900)' }}>
                          {it.title}
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--navy-400)' }}>{it.createdAt}</span>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy-700)', marginBottom: '4px' }}>방문 코스:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {it.places.map((p, idx) => (
                          <span key={idx} className="aura-perk-chip">
                            {idx + 1}. {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {it.notes && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--navy-500)', marginTop: '8px', background: 'var(--gray-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                        📝 {it.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ====================================================
          CHECKOUT & BOOKING MODAL
          ==================================================== */}
      {isCheckoutModalOpen && checkoutItem && (
        <div className="aura-modal-backdrop" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="aura-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="aura-modal-header">
              <h3>여행 예약 및 결제 확인</h3>
              <button className="aura-modal-close-btn" onClick={() => setIsCheckoutModalOpen(false)}>✕</button>
            </div>

            <div className="aura-modal-body">
              <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--gray-200)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '6px' }}>
                  {checkoutItem.title || checkoutItem.name || (checkoutItem.airline + ' ' + checkoutItem.airlineCode)}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--navy-600)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>📅 일정: {searchDate}</span>
                  <span>👥 탑승/투숙: {searchGuests}</span>
                  <span>📍 예약자명: {user.name} ({user.phone})</span>
                </div>
              </div>

              {/* Coupon Field */}
              <div className="aura-form-group">
                <label className="aura-form-label">프로모션 쿠폰 적용</label>
                <div className="aura-coupon-input-wrap">
                  <input 
                    type="text" 
                    className="aura-form-input" 
                    placeholder="쿠폰 코드 (예: AURA2026, FLYSKY10, STAYLUX)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="button" className="aura-coupon-btn" onClick={handleApplyCoupon}>
                    쿠폰 적용
                  </button>
                </div>
                {couponMsg.text && (
                  <div className={couponMsg.type === 'success' ? 'aura-coupon-applied-msg' : 'aura-coupon-err-msg'}>
                    {couponMsg.text}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="aura-form-group">
                <label className="aura-form-label">결제 수단 선택</label>
                <select 
                  className="aura-form-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="신용/체크카드">신용 / 체크카드 (무이자 할부 가능)</option>
                  <option value="네이버페이">네이버페이 포인트/간편결제</option>
                  <option value="카카오페이">카카오페이 머니</option>
                  <option value="실시간 계좌이체">실시간 무통장 계좌이체</option>
                </select>
              </div>

              {/* Pricing breakdown */}
              <div style={{ borderTop: '1px dashed var(--gray-300)', paddingTop: '14px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span>상품 정가 금액</span>
                  <span>{checkoutItem.basePrice.toLocaleString()}원</span>
                </div>
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '6px' }}>
                    <span>쿠폰 할인 [{appliedCoupon.name}]</span>
                    <span>-{appliedCoupon.discount.toLocaleString()}원</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--gray-200)' }}>
                  <span>최종 결제 금액</span>
                  <span style={{ color: 'var(--sky-blue-700)' }}>
                    {Math.max(0, checkoutItem.basePrice - (appliedCoupon ? appliedCoupon.discount : 0)).toLocaleString()}원
                  </span>
                </div>
              </div>

              <button 
                className="aura-btn-primary" 
                style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
                onClick={handleCompleteBooking}
              >
                예약 확정 및 결제 승인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          BOOKING DETAIL MODAL (Triggers SEC-288)
          ==================================================== */}
      {selectedBookingDetail && (
        <div className="aura-modal-backdrop" onClick={() => setSelectedBookingDetail(null)}>
          <div className="aura-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="aura-modal-header">
              <h3>예약 상세 전자 바우처</h3>
              <button className="aura-modal-close-btn" onClick={() => setSelectedBookingDetail(null)}>✕</button>
            </div>

            <div className="aura-modal-body">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span className="aura-tier-tag" style={{ fontSize: '0.85rem' }}>{selectedBookingDetail.bookingId}</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '6px' }}>{selectedBookingDetail.title}</h3>
                <span style={{ color: 'var(--success)', fontWeight: '800', fontSize: '0.95rem' }}>● {selectedBookingDetail.status}</span>
              </div>

              <div style={{ background: 'var(--gray-50)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div><strong>📅 예약 일정:</strong> {selectedBookingDetail.dates}</div>
                <div><strong>👥 탑승/투숙:</strong> {selectedBookingDetail.passengers}</div>
                <div><strong>💳 최종 결제 금액:</strong> {selectedBookingDetail.finalPaid?.toLocaleString()}원</div>
                <div><strong>ℹ️ 상세 안내:</strong> {selectedBookingDetail.details}</div>
              </div>

              <button 
                className="aura-btn-secondary" 
                style={{ width: '100%', marginTop: '20px', padding: '12px' }}
                onClick={() => setSelectedBookingDetail(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          USER PROFILE & ADDRESS MODAL (Triggers SEC-283)
          ==================================================== */}
      {isProfileModalOpen && (
        <div className="aura-modal-backdrop" onClick={() => setIsProfileModalOpen(false)}>
          <div className="aura-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="aura-modal-header">
              <h3>여행자 프로필 & 배송지 주소 관리</h3>
              <button className="aura-modal-close-btn" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            </div>

            <div className="aura-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '14px', background: 'var(--sky-blue-50)', borderRadius: 'var(--radius-md)' }}>
                <div className="aura-avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {user.name.slice(0, 1)}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--navy-900)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--navy-500)' }}>{user.email} · {user.membershipTier}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--sky-blue-700)', fontWeight: '700', marginTop: '2px' }}>
                    보유 마일리지: {user.mileage?.toLocaleString()} P
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveAddress}>
                <div className="aura-form-group">
                  <label className="aura-form-label">우편번호</label>
                  <input 
                    type="text" 
                    className="aura-form-input" 
                    value={editPostcode}
                    onChange={(e) => setEditPostcode(e.target.value)}
                    placeholder="예: 06542"
                    required
                  />
                </div>

                <div className="aura-form-group">
                  <label className="aura-form-label">기본 도로명 주소 (항공권/바우처 수령지)</label>
                  <input 
                    type="text" 
                    className="aura-form-input" 
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="서울특별시 서초구 반포대로 201"
                    required
                  />
                </div>

                <div className="aura-form-group">
                  <label className="aura-form-label">상세 주소</label>
                  <input 
                    type="text" 
                    className="aura-form-input" 
                    value={editDetailAddress}
                    onChange={(e) => setEditDetailAddress(e.target.value)}
                    placeholder="동/호수 또는 상세 위치"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="aura-btn-primary"
                  style={{ width: '100%', marginTop: '10px', padding: '12px', justifyContent: 'center' }}
                >
                  주소 정보 저장하기
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          AUTH MODAL (LOGIN / REGISTER)
          ==================================================== */}
      {isAuthModalOpen && (
        <div className="aura-modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="aura-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="aura-modal-header">
              <h3>{authMode === 'login' ? 'AuraVoyage 로그인' : 'AuraVoyage 신규 회원가입'}</h3>
              <button className="aura-modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>✕</button>
            </div>

            <div className="aura-modal-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button 
                  className={`aura-btn-secondary ${authMode === 'login' ? 'active' : ''}`}
                  style={{ flex: 1, backgroundColor: authMode === 'login' ? 'var(--navy-800)' : '', color: authMode === 'login' ? '#fff' : '' }}
                  onClick={() => setAuthMode('login')}
                >
                  로그인
                </button>
                <button 
                  className={`aura-btn-secondary ${authMode === 'register' ? 'active' : ''}`}
                  style={{ flex: 1, backgroundColor: authMode === 'register' ? 'var(--navy-800)' : '', color: authMode === 'register' ? '#fff' : '' }}
                  onClick={() => setAuthMode('register')}
                >
                  회원가입
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLogin}>
                  <div className="aura-form-group">
                    <label className="aura-form-label">이메일 계정</label>
                    <input 
                      type="email" 
                      className="aura-form-input" 
                      placeholder="traveler@auravoyage.io"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="aura-form-group">
                    <label className="aura-form-label">비밀번호</label>
                    <input 
                      type="password" 
                      className="aura-form-input" 
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="aura-btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                    로그인 하기
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="aura-form-group">
                    <label className="aura-form-label">이름</label>
                    <input 
                      type="text" 
                      className="aura-form-input" 
                      placeholder="홍길동"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="aura-form-group">
                    <label className="aura-form-label">이메일 계정</label>
                    <input 
                      type="email" 
                      className="aura-form-input" 
                      placeholder="traveler@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="aura-form-group">
                    <label className="aura-form-label">연락처</label>
                    <input 
                      type="text" 
                      className="aura-form-input" 
                      placeholder="010-1234-5678"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>
                  <div className="aura-form-group">
                    <label className="aura-form-label">비밀번호</label>
                    <input 
                      type="password" 
                      className="aura-form-input" 
                      placeholder="8자 이상 안전한 비밀번호"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="aura-btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                    신규 가입 완료
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MY BOOKINGS SIDE DRAWER
          ==================================================== */}
      {isBookingsDrawerOpen && (
        <div className="aura-drawer-backdrop" onClick={() => setIsBookingsDrawerOpen(false)}>
          <div className="aura-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="aura-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>내 여행 예약 현황 ({bookings.length})</h3>
              <button className="aura-modal-close-btn" onClick={() => setIsBookingsDrawerOpen(false)}>✕</button>
            </div>

            <div className="aura-drawer-body">
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--navy-400)' }}>
                  아직 예약된 여행 내역이 없습니다.
                </div>
              ) : (
                bookings.map((b, idx) => (
                  <div key={idx} className="aura-item-card">
                    <div className="aura-item-header">
                      <div>
                        <span style={{ fontSize: '0.75rem', background: 'var(--sky-blue-100)', color: 'var(--sky-blue-700)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          {b.bookingId}
                        </span>
                        <h4 className="aura-item-title" style={{ marginTop: '4px' }}>{b.title}</h4>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: '800' }}>
                        {b.status}
                      </span>
                    </div>

                    <div className="aura-item-meta">
                      <div>📅 일정: {b.dates}</div>
                      <div>👥 인원: {b.passengers}</div>
                    </div>

                    <div className="aura-item-price-row">
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--navy-400)', display: 'block' }}>결제 금액</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--sky-blue-700)' }}>
                          {(b.finalPaid || b.totalPrice).toLocaleString()}원
                        </span>
                      </div>
                      <button 
                        className="aura-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        onClick={() => fetchSingleBookingDetail(b.bookingId)}
                      >
                        바우처 조회
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          WISHLIST SIDE DRAWER
          ==================================================== */}
      {isWishlistDrawerOpen && (
        <div className="aura-drawer-backdrop" onClick={() => setIsWishlistDrawerOpen(false)}>
          <div className="aura-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="aura-drawer-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>찜한 여행 상품 ({wishlist.length})</h3>
              <button className="aura-modal-close-btn" onClick={() => setIsWishlistDrawerOpen(false)}>✕</button>
            </div>

            <div className="aura-drawer-body">
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--navy-400)' }}>
                  관심 목록에 담긴 여행 상품이 없습니다.
                </div>
              ) : (
                wishlist.map((w, idx) => (
                  <div key={idx} className="aura-item-card">
                    <div className="aura-item-header">
                      <h4 className="aura-item-title">{w.title}</h4>
                      <button 
                        className="aura-modal-close-btn"
                        onClick={() => handleToggleWishlist(w)}
                        title="찜 해제"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="aura-item-price-row">
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--sky-blue-700)' }}>
                        {w.price?.toLocaleString()}원~
                      </span>
                      <button 
                        className="aura-btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => {
                          setIsWishlistDrawerOpen(false);
                          openBookingModal(w, w.type || 'accommodation');
                        }}
                      >
                        예약하기
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TOAST NOTIFICATION
          ==================================================== */}
      {toast && (
        <div className="aura-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toast}</span>
        </div>
      )}

      {/* ====================================================
          FOOTER
          ==================================================== */}
      <footer className="aura-footer">
        <div className="aura-container">
          <div className="aura-footer-grid">
            <div className="aura-footer-brand">
              <h4>AuraVoyage</h4>
              <p>
                전 세계 100만 개 이상의 럭셔리 호텔, 항공권 및 프라이빗 여행 큐레이션을 제공하는 차세대 글로벌 트래블 플랫폼입니다.
              </p>
            </div>

            <div className="aura-footer-col">
              <h5>여행 상품</h5>
              <ul>
                <li><a href="#flights" onClick={() => setActiveTab('flights')}>국제선 항공권</a></li>
                <li><a href="#stays" onClick={() => setActiveTab('accommodations')}>호텔 & 리조트</a></li>
                <li><a href="#destinations" onClick={() => setActiveTab('destinations')}>패키지 투어</a></li>
                <li><a href="#itineraries" onClick={() => setActiveTab('itineraries')}>여행 플래너</a></li>
              </ul>
            </div>

            <div className="aura-footer-col">
              <h5>고객 지원</h5>
              <ul>
                <li><a href="#faq">자주 묻는 질문</a></li>
                <li><a href="#support">1:1 여행 상담</a></li>
                <li><a href="#terms">이용약관</a></li>
                <li><a href="#privacy">개인정보 처리방침</a></li>
              </ul>
            </div>

            <div className="aura-footer-col">
              <h5>뉴스레터 구독</h5>
              <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                매주 업데이트되는 전 세계 프라이빗 여행 특가 정보를 가장 먼저 받아보세요.
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="email" 
                  placeholder="이메일 주소 입력" 
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '0.85rem', flex: 1 }}
                />
                <button className="aura-btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => showToast('뉴스레터 구독 신청이 완료되었습니다.')}>
                  신청
                </button>
              </div>
            </div>
          </div>

          <div className="aura-footer-bottom">
            <div>© 2026 AuraVoyage Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>한국어 (KR)</span>
              <span>KRW (₩)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
