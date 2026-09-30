import React, { useState, useEffect } from 'react';

export default function App() {
  // Session State
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return 'sess_travel_' + Math.random().toString(36).substring(2, 15);
  });
  const [sessionInfo, setSessionInfo] = useState(null);

  // Auth User
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Form inputs
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });
  
  // Data States
  const [destinations, setDestinations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [notices, setNotices] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [chats, setChats] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [itineraries, setItineraries] = useState([]);

  // Search filter inputs
  const [searchTarget, setSearchTarget] = useState('');
  const [flightSearch, setFlightSearch] = useState({ from: 'Gimpo (GMP)', to: 'Jeju (CJU)', date: '2026-09-10' });
  
  // Detail features state
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [fileInput, setFileInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [newReview, setNewReview] = useState({ target: '제주 신라 호텔', rating: '5', comment: '' });
  const [newItinerary, setNewItinerary] = useState({ day: 'Day 1', content: '' });

  // UI Tabs & alerts
  const [activeTab, setActiveTab] = useState('home');
  const [myPageSubTab, setMyPageSubTab] = useState('reservations');
  const [toasts, setToasts] = useState([]);
  const [hotelSort, setHotelSort] = useState('');
  const [hotelPage, setHotelPage] = useState(1);

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

  // Toast Alert helper
  const showToast = (title, message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000);
  };

  // Load state on mount/session update
  useEffect(() => {
    loadSession();
    loadDestinations();
    loadFlights();
    loadHotels();
    loadTours();
    loadNotices();
    loadCoupons();
    loadReviews();
    loadSupport();
    loadReservations();
    loadWishlist();
    loadItineraries();
  }, [currentSessionId]);

  const loadSession = () => {
    customFetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSessionInfo(data);
        if (data.user) {
          setUser(data.user);
          setAddressInput(data.user.address || '');
        } else {
          setUser(null);
        }
      })
      .catch(() => {});
  };

  const loadDestinations = () => {
    customFetch('/api/destinations')
      .then(res => res.json())
      .then(data => setDestinations(data))
      .catch(() => {});
  };

  const loadFlights = () => {
    customFetch('/api/flights')
      .then(res => res.json())
      .then(data => setFlights(data))
      .catch(() => {});
  };

  const loadHotels = () => {
    const url = `/api/hotels?sort=${hotelSort}&page=${hotelPage}`;
    customFetch(url)
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadHotels();
  }, [hotelSort, hotelPage]);

  const loadTours = () => {
    customFetch('/api/tours')
      .then(res => res.json())
      .then(data => setTours(data))
      .catch(() => {});
  };

  const loadNotices = () => {
    customFetch('/api/notices')
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(() => {});
  };

  const loadCoupons = () => {
    customFetch('/api/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data))
      .catch(() => {});
  };

  const loadReviews = () => {
    customFetch('/api/reviews')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(() => {});
  };

  const loadSupport = () => {
    customFetch('/api/support')
      .then(res => res.json())
      .then(data => setChats(data))
      .catch(() => {});
  };

  const loadReservations = () => {
    customFetch('/api/reservations')
      .then(res => res.json())
      .then(data => setReservations(data))
      .catch(() => {});
  };

  const loadWishlist = () => {
    customFetch('/api/wishlist')
      .then(res => res.json())
      .then(data => setWishlist(data))
      .catch(() => {});
  };

  const loadItineraries = () => {
    customFetch('/api/itineraries')
      .then(res => res.json())
      .then(data => setItineraries(data))
      .catch(() => {});
  };

  // Check login helper before any restricted actions
  const requireLogin = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      showToast('로그인 필요', '예약 및 정보 등록 서비스는 회원 로그인 후 이용하실 수 있습니다.', false);
      return false;
    }
    return true;
  };

  // Submit Login (Vulnerable targets: SEC-221, SEC-223 ~ SEC-230)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '로그인 실패');
        return data;
      })
      .then(data => {
        setUser(data.user);
        setShowAuthModal(false);
        setLoginForm({ email: '', password: '' });

        // Trigger check for SEC fixation warnings
        const rotated = data.sessionId !== currentSessionId;
        if (!rotated) {
          // Find which action was triggered to show the correct SEC ID in the red toast
          let secId = 'SEC-221';
          if (sessionInfo?.details.actionAddressTriggered) secId = 'SEC-223';
          else if (sessionInfo?.details.actionCouponTriggered) secId = 'SEC-224';
          else if (sessionInfo?.details.actionSortTriggered) secId = 'SEC-225';
          else if (sessionInfo?.details.actionPageTriggered) secId = 'SEC-226';
          else if (sessionInfo?.details.actionFileTriggered) secId = 'SEC-227';
          else if (sessionInfo?.details.actionChatTriggered) secId = 'SEC-228';
          else if (sessionInfo?.details.actionNoticeTriggered) secId = 'SEC-229';
          else if (sessionInfo?.details.actionReviewTriggered) secId = 'SEC-230';

          showToast(
            `인증 접수 성공 (식별코드: ${secId})`, 
            `회원 로그인이 정상 처리되었으나 세션 상태 갱신이 생략되었습니다.`, 
            true
          );
        } else {
          showToast('로그인 완료', `${data.user.name} 회원님으로 인증되었습니다.`);
        }
        setCurrentSessionId(data.sessionId);
      })
      .catch(err => showToast('로그인 실패', err.message, false));
  };

  // Submit Register (Vulnerable target: SEC-222)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '회원가입 실패');
        return data;
      })
      .then(data => {
        setUser(data.user);
        setShowAuthModal(false);
        setRegisterForm({ name: '', email: '', password: '', phone: '' });

        // Auto login session fixation check
        const rotated = data.sessionId !== currentSessionId;
        if (!rotated) {
          showToast(
            '회원 등록 승인 (식별코드: SEC-222)', 
            '회원가입이 완료되었으나 할당받은 기존 세션 아이디가 재사용되었습니다.', 
            true
          );
        } else {
          showToast('회원가입 완료', `${data.user.name}님 환영합니다.`);
        }
        setCurrentSessionId(data.sessionId);
      })
      .catch(err => showToast('가입 실패', err.message, false));
  };

  // Save profile address (SEC-223)
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!requireLogin()) return;
    customFetch('/api/auth/profile/address', {
      method: 'POST',
      body: JSON.stringify({ address: addressInput })
    })
      .then(res => res.json())
      .then(data => {
        showToast('주소 정보 저장 (식별코드: SEC-223)', '상세 수령지 주소가 데이터베이스에 갱신되었습니다.', true);
        loadSession();
      });
  };

  // Apply Coupon (SEC-224)
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    customFetch('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: couponCode })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '쿠폰 적용 실패');
        return data;
      })
      .then(data => {
        showToast('쿠폰 할인 등록 (식별코드: SEC-224)', `할인 쿠폰(${data.coupon.code}) 명세가 활성화되었습니다.`, true);
        setCouponCode('');
        loadSession();
      })
      .catch(err => showToast('쿠폰 적용 실패', err.message));
  };

  // Upload travel file (SEC-227)
  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!requireLogin()) return;
    customFetch('/api/auth/profile/files', {
      method: 'POST',
      body: JSON.stringify({ filename: fileInput })
    })
      .then(res => res.json())
      .then(data => {
        showToast('명세 파일 기입 (식별코드: SEC-227)', `항공 예매 증명 사본(${data.file.filename}) 정보가 기입되었습니다.`, true);
        setFileInput('');
        loadSession();
      });
  };

  // Send support chat msg (SEC-228)
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    customFetch('/api/support/chat', {
      method: 'POST',
      body: JSON.stringify({ message: chatInput })
    })
      .then(res => res.json())
      .then(() => {
        showToast('채팅 문의 수신 (식별코드: SEC-228)', '1:1 여행 코디네이터 상담 문의가 연동되었습니다.', true);
        setChatInput('');
        loadSupport();
        loadSession();
      });
  };

  // Read Notice (SEC-229)
  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    customFetch('/api/notices')
      .then(res => res.json())
      .then(() => {
        showToast('공지 사항 로드 (식별코드: SEC-229)', `"${notice.title}" 상세 내용이 표시되었습니다.`, true);
        loadSession();
      });
  };

  // Submit Review (SEC-230)
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!requireLogin()) return;
    customFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(newReview)
    })
      .then(res => res.json())
      .then(() => {
        showToast('후기 작성 완료 (식별코드: SEC-230)', '작성하신 만족도 및 이용 후기 평점이 반영되었습니다.', true);
        setNewReview({ target: '제주 신라 호텔', rating: '5', comment: '' });
        loadReviews();
        loadSession();
      });
  };

  // Sort hotels (SEC-225)
  const handleSortChange = (sortVal) => {
    setHotelSort(sortVal);
    showToast('정렬 파라미터 적용 (식별코드: SEC-225)', '숙소 검색 정렬 명세 조건이 지정되었습니다.', true);
  };

  // Paginate hotels (SEC-226)
  const handlePageChange = (pageVal) => {
    setHotelPage(pageVal);
    showToast('결제 결과 조회 (식별코드: SEC-226)', `${pageVal}페이지 숙소 검색 결과 페이지가 동기화되었습니다.`, true);
  };

  // Wishlist item triggers
  const handleAddWish = (itemId, name, type) => {
    if (!requireLogin()) return;
    customFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ itemId, name, type })
    })
      .then(res => res.json())
      .then(() => {
        loadWishlist();
        showToast('찜 목록 추가', '찜한 여행 상품이 보관함에 등록되었습니다.');
      });
  };

  const handleRemoveWish = (id) => {
    if (!requireLogin()) return;
    customFetch(`/api/wishlist/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        loadWishlist();
        showToast('찜 해제 완료', '찜 보관함에서 삭제되었습니다.');
      });
  };

  // Add reservation trigger
  const handleBook = (name, type, price) => {
    if (!requireLogin()) return;
    customFetch('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ type, name, price, date: '2026-09-15' })
    })
      .then(res => res.json())
      .then(data => {
        loadReservations();
        showToast('예약 접수 완료', `주문 번호 ${data.id}로 정상 등록되었습니다.`);
      });
  };

  // Add itinerary trigger
  const handleItinerarySubmit = (e) => {
    e.preventDefault();
    if (!requireLogin()) return;
    customFetch('/api/itineraries', {
      method: 'POST',
      body: JSON.stringify(newItinerary)
    })
      .then(res => res.json())
      .then(() => {
        setNewItinerary({ day: 'Day 1', content: '' });
        loadItineraries();
        showToast('일정 반영', '나만의 여행 일정이 업데이트되었습니다.');
      });
  };

  // Logout
  const handleLogout = () => {
    customFetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        setUser(null);
        setCurrentSessionId('sess_travel_' + Math.random().toString(36).substring(2, 15));
        showToast('로그아웃', '인증이 해제되었으며 세션이 갱신되었습니다.');
      });
  };

  return (
    <div className="app-container">
      {/* Toast Alert Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={t.isError ? 'toast error' : 'toast'}>
            <strong style={{ display: 'block' }}>{t.title}</strong>
            <span style={{ fontSize: '0.85rem' }}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Header */}
      <header className="app-header">
        <a href="#" className="logo" onClick={() => setActiveTab('home')}>
          ✈️ Travel<span>Now</span>
        </a>

        <nav className="header-nav">
          <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>여행지</a>
          <a href="#" className={`nav-link ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>숙소 검색</a>
          <a href="#" className={`nav-link ${activeTab === 'flights' ? 'active' : ''}`} onClick={() => setActiveTab('flights')}>항공권 검색</a>
          <a href="#" className={`nav-link ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>고객지원</a>
          {user && (
            <a href="#" className={`nav-link ${activeTab === 'mypage' ? 'active' : ''}`} onClick={() => { setActiveTab('mypage'); setMyPageSubTab('reservations'); }}>마이페이지</a>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>👤 {user.name} 님</span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <button className="btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>로그인 / 가입</button>
          )}
        </div>
      </header>

      {/* Dynamic Main Body Content */}
      {activeTab === 'home' && (
        <>
          {/* Hero Banner Section */}
          <section className="hero-section">
            <h1>어디로 떠나시나요?</h1>
            <p>TravelNow가 제안하는 가을 맞이 낭만 여행 숙소 및 특가 패키지를 직접 예약해보세요.</p>
            
            <div className="search-card">
              <div className="search-field">
                <label>출발지</label>
                <input 
                  type="text" 
                  className="search-input" 
                  value={flightSearch.from} 
                  onChange={(e) => setFlightSearch({ ...flightSearch, from: e.target.value })} 
                />
              </div>
              <div className="search-field">
                <label>목적지</label>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="도시명 기입"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                />
              </div>
              <div className="search-field">
                <label>체크인 / 체크아웃</label>
                <input type="date" className="search-input" defaultValue="2026-09-10" />
              </div>
              <div className="search-field">
                <label>인원수</label>
                <input type="number" className="search-input" defaultValue="2" min="1" />
              </div>
              <button className="btn btn-accent" style={{ alignSelf: 'flex-end', height: '42px' }} onClick={() => {
                showToast('검색 수행', `"${searchTarget || '전체'}" 목적지 리스트를 검색하였습니다.`);
              }}>검색</button>
            </div>
          </section>

          <main className="main-content">
            {/* Destinations Section */}
            <section>
              <h2 className="section-title">인기 여행지 컬렉션</h2>
              <div className="cards-grid">
                {destinations.filter(d => searchTarget ? d.name.includes(searchTarget) : true).map(dest => (
                  <div key={dest.id} className="card">
                    <div className="card-image" style={{ backgroundImage: `url(${dest.image})` }} />
                    <div className="card-info">
                      <h3>{dest.name}</h3>
                      <p>{dest.desc}</p>
                      <div className="card-footer">
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleBook(dest.name, '패키지', 390000)}>즉시 예약</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tours and Activities */}
            <section>
              <h2 className="section-title">추천 액티비티 & 인기 여행 상품</h2>
              <div className="cards-grid">
                {tours.map(tr => (
                  <div key={tr.id} className="card" style={{ padding: '1.2rem' }}>
                    <h3>⭐ {tr.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>장소: {tr.destination} | 평점: {tr.rating}</p>
                    <div className="card-footer" style={{ border: 'none', padding: 0, marginTop: '1rem' }}>
                      <span className="card-price">{tr.price.toLocaleString()}원</span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.3rem' }} onClick={() => handleAddWish(tr.id, tr.name, 'Activity')}>찜</button>
                        <button className="btn" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleBook(tr.name, 'Activity', tr.price)}>예약</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Coupons and Notices Layout */}
            <div className="dashboard-layout">
              {/* Notice center */}
              <div className="panel-card" data-bug-id="SEC-229">
                <h3>📢 주요 연동 공지사항</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notices.map(nt => (
                    <div 
                      key={nt.id} 
                      onClick={() => handleNoticeClick(nt)}
                      style={{ padding: '0.8rem', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <strong>{nt.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{nt.date}</div>
                    </div>
                  ))}
                </div>

                {selectedNotice && (
                  <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <h4>📄 {selectedNotice.title}</h4>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#334155' }}>{selectedNotice.content}</p>
                    <button className="btn btn-secondary" style={{ marginTop: '0.8rem', padding: '0.2rem 0.6rem' }} onClick={() => setSelectedNotice(null)}>닫기</button>
                  </div>
                )}
              </div>

              {/* Sidebar Coupon apply form */}
              <div className="panel-card" data-bug-id="SEC-224">
                <h3>🎟️ 여행 할인 쿠폰 등록</h3>
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="할인 쿠폰코드 기입 (예: TRAVEL20)" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%' }}>적용하기</button>
                </form>

                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>보유중인 추천 코드</h4>
                  {coupons.map(cp => (
                    <div key={cp.code} style={{ fontSize: '0.8rem', borderBottom: '1px solid var(--color-border)', padding: '0.3rem 0' }}>
                      <code>{cp.code}</code> : {cp.desc}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        </>
      )}

      {activeTab === 'hotels' && (
        <main className="main-content">
          <div className="panel-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>🏨 추천 목적지 숙박 검색 결과</h2>
            
            {/* Sorting parameters (SEC-225) */}
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }} data-bug-id="SEC-225">
              <label style={{ whiteSpace: 'nowrap' }}>정렬 선택</label>
              <select 
                className="form-input" 
                value={hotelSort} 
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="">기본 정렬</option>
                <option value="priceAsc">가격 낮은 순</option>
                <option value="ratingDesc">평점 높은 순</option>
              </select>
            </div>
          </div>

          <div className="cards-grid" style={{ marginTop: '1.5rem' }}>
            {hotels.map(ht => (
              <div key={ht.id} className="card">
                <div className="card-image" style={{ backgroundImage: `url(${ht.image})` }} />
                <div className="card-info">
                  <h3>{ht.name}</h3>
                  <p style={{ fontSize: '0.85rem' }}>📍 {ht.location} | ⭐ {ht.rating}</p>
                  <div className="card-footer">
                    <span className="card-price">{ht.price.toLocaleString()}원 / 박</span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleAddWish(ht.id, ht.name, 'Hotel')}>찜</button>
                      <button className="btn" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleBook(ht.name, 'Hotel', ht.price)}>예약</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination (SEC-226) */}
          <div className="panel-card" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: '0.5rem' }} data-bug-id="SEC-226">
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handlePageChange(1)}>1</button>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handlePageChange(2)}>2</button>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handlePageChange(3)}>3</button>
          </div>
        </main>
      )}

      {activeTab === 'flights' && (
        <main className="main-content">
          <div className="panel-card">
            <h2>✈️ 출발지-목적지 항공 정보 조회</h2>
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.5fr', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
              <div className="form-group">
                <label>출발지</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={flightSearch.from} 
                  onChange={(e) => setFlightSearch({ ...flightSearch, from: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>도착지</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={flightSearch.to} 
                  onChange={(e) => setFlightSearch({ ...flightSearch, to: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>날짜</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={flightSearch.date} 
                  onChange={(e) => setFlightSearch({ ...flightSearch, date: e.target.value })} 
                />
              </div>
              <button type="button" className="btn" onClick={() => showToast('항공 정보 필터링', '지정 조건으로 조회 결과가 반영되었습니다.')}>검색</button>
            </form>
          </div>

          <div className="table-container panel-card" style={{ marginTop: '2rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>항공편</th>
                  <th>항공사</th>
                  <th>여정</th>
                  <th>출발일</th>
                  <th>편도 요금</th>
                  <th>예약</th>
                </tr>
              </thead>
              <tbody>
                {flights.filter(f => f.from.toLowerCase().includes(flightSearch.from.toLowerCase()) || f.to.toLowerCase().includes(flightSearch.to.toLowerCase())).map(fl => (
                  <tr key={fl.id}>
                    <td><code>{fl.id}</code></td>
                    <td>{fl.airline}</td>
                    <td>{fl.from} → {fl.to}</td>
                    <td>{fl.date}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{fl.price.toLocaleString()}원</td>
                    <td>
                      <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleBook(`${fl.airline} GMP-CJU`, 'Flight', fl.price)}>선택</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {activeTab === 'support' && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card" data-bug-id="SEC-228">
              <h3>💬 1:1 여행 코디네이터 전문 채팅 상담실</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>배송지 조율 및 숙박 스케줄 조율 등 원하는 메타정보 수정을 즉시 상담원과 나눌 수 있습니다.</p>
              
              <div style={{ height: '300px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: '#f8fafc' }}>
                {chats.length === 0 ? (
                  <div style={{ margin: 'auto', color: '#94a3b8', fontSize: '0.9rem' }}>대화가 없습니다. 문의사항을 작성해보세요.</div>
                ) : (
                  chats.map((c, idx) => (
                    <div key={idx} style={{ alignSelf: c.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: c.sender === 'user' ? '#0064d2' : '#e2e8f0', color: c.sender === 'user' ? '#ffffff' : '#0f172a', padding: '0.6rem 1rem', borderRadius: '12px', maxWidth: '80%', fontSize: '0.9rem' }}>
                      {c.message}
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem', textAlign: 'right' }}>{c.timestamp}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="메시지를 입력하십시오..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn">전송</button>
              </form>
            </div>

            <div className="panel-card">
              <h3>❓ 자주 묻는 질문</h3>
              <div style={{ fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div><strong>Q. 비회원 예약 내역은 어떻게 보나요?</strong><br />A. 로그인 후 주문조회를 이용하거나 비회원 예약 마킹 코드를 상담원에 전해 등록할 수 있습니다.</div>
                <div><strong>Q. 여권 정보 파일은 어떻게 등록하나요?</strong><br />A. 마이페이지 회원 정보 내 여권 파일명 입력을 활용해 바인딩 처리가 가능합니다.</div>
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === 'mypage' && (
        <main className="main-content">
          <div className="dashboard-layout">
            
            {/* Sidebar Menu */}
            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>마이페이지 메뉴</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className={`btn ${myPageSubTab === 'reservations' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left' }} onClick={() => setMyPageSubTab('reservations')}>📝 예약 정보 관리</button>
                <button className={`btn ${myPageSubTab === 'itinerary' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left' }} onClick={() => setMyPageSubTab('itinerary')}>📅 나의 일자별 여정</button>
                <button className={`btn ${myPageSubTab === 'wishlist' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left' }} onClick={() => setMyPageSubTab('wishlist')}>⭐ 찜 보관함</button>
                <button className={`btn ${myPageSubTab === 'reviews' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left' }} onClick={() => setMyPageSubTab('reviews')}>💬 나의 이용 리뷰 후기</button>
                <button className={`btn ${myPageSubTab === 'profile' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left' }} onClick={() => setMyPageSubTab('profile')}>👤 회원 부가 설정</button>
              </div>
            </div>

            {/* Sub Tab Panel Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {myPageSubTab === 'reservations' && (
                <div className="panel-card">
                  <h3>📝 나의 여행 예약 및 구매 내역</h3>
                  {reservations.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>최근 30일 이내에 예약하신 상품 및 항공 내역이 없습니다.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>예약 ID</th>
                            <th>구분</th>
                            <th>예약 상품</th>
                            <th>요금</th>
                            <th>등록일</th>
                            <th>상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map(r => (
                            <tr key={r.id}>
                              <td><code>{r.id}</code></td>
                              <td>{r.type}</td>
                              <td>{r.name}</td>
                              <td style={{ fontWeight: 600 }}>{r.price.toLocaleString()}원</td>
                              <td>{r.createdAt}</td>
                              <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{r.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {myPageSubTab === 'itinerary' && (
                <div className="panel-card">
                  <h3>📅 나의 일자별 스케줄 일정 작성</h3>
                  <form onSubmit={handleItinerarySubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ width: '120px' }}>
                      <label>일자</label>
                      <select 
                        className="form-input" 
                        value={newItinerary.day} 
                        onChange={(e) => setNewItinerary({ ...newItinerary, day: e.target.value })}
                      >
                        <option value="Day 1">Day 1</option>
                        <option value="Day 2">Day 2</option>
                        <option value="Day 3">Day 3</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>계획 세부 내용 기입</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: 공항 인근 렌터카 인수 및 호텔 체크인" 
                        value={newItinerary.content}
                        onChange={(e) => setNewItinerary({ ...newItinerary, content: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">일정 추가</button>
                  </form>

                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {itineraries.map(it => (
                      <div key={it.id} style={{ display: 'flex', gap: '1rem', padding: '0.6rem', borderBottom: '1px solid var(--color-border)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{it.day}</span>
                        <span>{it.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {myPageSubTab === 'wishlist' && (
                <div className="panel-card">
                  <h3>⭐ 찜 보관함 목록</h3>
                  {wishlist.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>보관함이 비어 있습니다. 마켓에서 하트 찜을 추가해두십시오.</div>
                  ) : (
                    wishlist.map(w => (
                      <div key={w.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div>[{w.type}] {w.name}</div>
                        <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleRemoveWish(w.id)}>해제</button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {myPageSubTab === 'reviews' && (
                <div className="panel-card" data-bug-id="SEC-230">
                  <h3>💬 숙소 및 여행 패키지 이용 후기 작성</h3>
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>리뷰 대상 상품</label>
                        <select 
                          className="form-input" 
                          value={newReview.target}
                          onChange={(e) => setNewReview({ ...newReview, target: e.target.value })}
                        >
                          <option value="제주 신라 호텔">제주 신라 호텔</option>
                          <option value="도쿄 힐튼 럭셔리 스테이">도쿄 힐튼 럭셔리 스테이</option>
                          <option value="파리 풀만 에펠 리조트">파리 풀만 에펠 리조트</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ width: '120px' }}>
                        <label>별점</label>
                        <select 
                          className="form-input" 
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                        >
                          <option value="5">★★★★★</option>
                          <option value="4">★★★★☆</option>
                          <option value="3">★★★☆☆</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>후기 한줄평</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="이용 경험을 공유해주세요." 
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ alignSelf: 'flex-start' }}>리뷰 후기 기재 완료</button>
                  </form>

                  <div style={{ marginTop: '1.5rem' }}>
                    <h4>최근 등록된 소중한 리뷰 피드</h4>
                    {reviews.map((r, idx) => (
                      <div key={idx} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--color-border)' }}>
                        <strong>{r.name}</strong> ({'★'.repeat(r.rating)})<br />
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>대체 상품: {r.target}</span><br />
                        <span style={{ fontSize: '0.9rem' }}>{r.comment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {myPageSubTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Address input (SEC-223) */}
                  <div className="panel-card" data-bug-id="SEC-223">
                    <h3>👤 수령 주소지 및 자택 주소 설정</h3>
                    <form onSubmit={handleSaveAddress} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>상세 자택 주소 입력</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="수정할 자택 주소를 입력하십시오." 
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">주소 설정</button>
                    </form>
                  </div>

                  {/* Passport upload simulator (SEC-227) */}
                  <div className="panel-card" data-bug-id="SEC-227">
                    <h3>📁 여권 사본 및 예방 접수 명세서 파일 연동</h3>
                    <form onSubmit={handleFileUpload} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>여권 파일명 기입</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="예: my_passport_copy.png" 
                          value={fileInput}
                          onChange={(e) => setFileInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">파일 기입</button>
                    </form>
                  </div>

                </div>
              )}

            </div>
          </div>
        </main>
      )}

      {/* Auth Modal Popup (Vulnerable targets: SEC-221, SEC-222) */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'TravelNow 계정 인증' : '신규 회원 등록'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} data-bug-id="SEC-221">
                <div className="modal-body">
                  <div className="form-group">
                    <label>이메일 계정 (로그인 테스트용: user@example.com)</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>비밀번호 (비밀번호: password123)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    신규 회원이신가요? <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setAuthMode('register')}>회원 등록하기</span>
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn">인증 시작</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>취소</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} data-bug-id="SEC-222">
                <div className="modal-body">
                  <div className="form-group">
                    <label>이름</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>이메일 계정</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>비밀번호</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>전화번호</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="010-XXXX-XXXX"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    이미 가입하셨나요? <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setAuthMode('login')}>로그인하기</span>
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn">등록 완료</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>취소</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-border)', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
        <p>© 2026 TravelNow Booking Inc. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>본 서비스는 강화학습 PPO 에이전트의 세션 라이프사이클 취약성(Session Fixation) 분석 학습용 연동 명세서 플랫폼입니다.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>접속 세션키: {currentSessionId}</p>
      </footer>
    </div>
  );
}
