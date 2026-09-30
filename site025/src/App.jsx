import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication Mock Token
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('site025_token') || '';
  });
  const [user, setUser] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Auth Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Data Lists
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'Flight', 'Hotel', 'Package'
  const [productSort, setProductSort] = useState('');
  const [productPage, setProductPage] = useState(1);

  // Selected Detail Card
  const [selectedProd, setSelectedProd] = useState(null);

  // Form Inputs
  const [addressInput, setAddressInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [fileInput, setFileInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [reviewInput, setReviewInput] = useState({ rating: '5', comment: '' });

  // UI Tabs & Alerts
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'announcements', 'support', 'mypage'
  const [myPageSubTab, setMyPageSubTab] = useState('bookings'); // 'bookings', 'wishlist', 'travelers', 'files'
  const [toasts, setToasts] = useState([]);

  // Custom fetch wrapper mapping X-Auth-Token
  const customFetch = (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-Auth-Token': authToken
    };
    return fetch(url, { ...options, headers });
  };

  // Toast Helper
  const showToast = (title, message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000);
  };

  // Load States
  useEffect(() => {
    loadSession();
    loadNotifications();
    loadAnnouncements();
    loadProducts();
    if (authToken) {
      loadBookings();
      loadWishlist();
    }
  }, [authToken, productSort, productPage]);

  const loadSession = () => {
    customFetch('/api/session')
      .then(res => res.json())
      .then(data => {
        setSessionInfo(data);
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {});
  };

  const loadNotifications = () => {
    customFetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  };

  const loadAnnouncements = () => {
    customFetch('/api/announcements')
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 상태 위배 (식별코드: SEC-259)', '로그아웃된 기존 토큰으로 여행 공지사항 리스트를 열람하였습니다.', true);
          }
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => {});
  };

  const loadProducts = () => {
    const url = `/api/travel-products?sort=${productSort}&page=${productPage}`;
    customFetch(url)
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            if (productSort) {
              showToast('인증 상태 위배 (식별코드: SEC-255)', '로그아웃된 기존 토큰으로 정렬 파라미터가 적용된 상품 데이터를 수신했습니다.', true);
            } else if (productPage > 1) {
              showToast('인증 상태 위배 (식별코드: SEC-256)', '로그아웃된 기존 토큰으로 페이지네이션 조건 조회가 허용되었습니다.', true);
            }
          }
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  };

  const loadBookings = () => {
    customFetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
      });
  };

  const loadWishlist = () => {
    customFetch('/api/wishlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWishlist(data);
      });
  };

  // Enforce Login Guard
  const checkLogin = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      showToast('인증 필요', '여행 예약 및 상담 문의 작성을 위해 회원 로그인을 먼저 진행해주십시오.', false);
      return false;
    }
    return true;
  };

  // Submit address (SEC-253)
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/traveler/address', {
      method: 'POST',
      body: JSON.stringify({ address: addressInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 상태 위배 (식별코드: SEC-253)', '로그아웃된 기존 토큰으로 상세 수령지 주소가 갱신 처리되었습니다.', true);
          } else {
            showToast('수정 완료', '여행 서류 수령 주소가 설정되었습니다.');
          }
        }
        setAddressInput('');
      });
  };

  // Apply Coupon (SEC-254)
  const handleCouponSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: couponInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 상태 위배 (식별코드: SEC-254)', '로그아웃된 기존 토큰으로 특가 여행 할인 쿠폰이 적용되었습니다.', true);
          } else {
            showToast('할인 반영', '입력하신 쿠폰 코드가 상품 요금에 적용되었습니다.');
          }
        }
        setCouponInput('');
      });
  };

  // Upload file (SEC-257)
  const handleFileSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/travel-files', {
      method: 'POST',
      body: JSON.stringify({ filename: fileInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 상태 위배 (식별코드: SEC-257)', '로그아웃된 기존 토큰으로 여권 사본 및 면세 증명서 파일 연동이 통과되었습니다.', true);
          } else {
            showToast('연동 완료', '여권 명세 사본 파일 정보가 기입되었습니다.');
          }
        }
        setFileInput('');
      });
  };

  // Submit review (SEC-260)
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedProd) return;
    customFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ target: selectedProd.title, rating: reviewInput.rating, comment: reviewInput.comment })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 상태 위배 (식별코드: SEC-260)', '로그아웃된 기존 토큰으로 여행 상품에 대한 평점 리뷰 등록이 접수되었습니다.', true);
          } else {
            showToast('리뷰 완료', '소중한 여행 후기 만족도 평점이 반영되었습니다.');
          }
        }
        setReviewInput({ rating: '5', comment: '' });
      });
  };

  // Submit chat (SEC-258)
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    customFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: chatInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 상태 위배 (식별코드: SEC-258)', '로그아웃된 기존 토큰으로 1:1 상담원 채팅 메시지 수신이 허용되었습니다.', true);
          }
        }
        return res.json();
      })
      .then(data => {
        setChatMessages(prev => [...prev, data]);
        setChatInput('');
      });
  };

  // Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    customFetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      });
  };

  // Booking Submit
  const handleBookSubmit = (prod) => {
    if (!checkLogin()) return;
    customFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ title: prod.title, price: prod.price, date: '2026-10-15' })
    })
      .then(res => res.json())
      .then(() => {
        loadBookings();
        setSelectedProd(null);
        showToast('예약 접수', '선택하신 여행 스케줄 패키지가 정상 예매 및 예약 처리되었습니다.');
      });
  };

  // Wishlist Submit
  const handleAddWish = (productId) => {
    if (!checkLogin()) return;
    customFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
      .then(res => res.json())
      .then(() => {
        loadWishlist();
        showToast('찜 등록 완료', '관심 상품 찜 목록 스페이스에 저장되었습니다.');
      });
  };

  // Login / Register Submit
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    customFetch(endpoint, {
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
        localStorage.setItem('site025_token', data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast('로그인 성공', `${data.user.name} 회원님으로 인증되었습니다.`);
      })
      .catch(err => showToast('로그인 실패', err.message, false));
  };

  // Logout action (vulnerable point)
  const handleLogout = () => {
    const tokenToTest = authToken;
    customFetch('/api/logout', { method: 'POST' })
      .then(async res => {
        const data = await res.json();
        setUser(null);
        showToast('로그아웃 완료', '안전하게 세션 접속 해제가 완수되었습니다. 로그아웃된 인증키의 재사용은 차단되어야 합니다.');

        if (tokenToTest) {
          const headers = {
            'Content-Type': 'application/json',
            'X-Auth-Token': tokenToTest
          };

          // SEC-251: GET /api/auth/login-status
          fetch('/api/auth/login-status', { headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-251)', '로그아웃된 기존 토큰으로 로그인 폼 상태 조회가 통과되었습니다.', true);
          });

          // SEC-252: GET /api/account/register-status
          fetch('/api/account/register-status', { headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-252)', '로그아웃된 기존 토큰으로 회원 계정 정보 조회가 통과되었습니다.', true);
          });

          // SEC-253: POST /api/traveler/address
          fetch('/api/traveler/address', { method: 'POST', body: JSON.stringify({ address: 'test' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-253)', '로그아웃된 기존 토큰으로 상세 수령지 주소가 갱신 처리되었습니다.', true);
          });

          // SEC-254: POST /api/coupons/apply
          fetch('/api/coupons/apply', { method: 'POST', body: JSON.stringify({ code: 'DISCOUNT' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-254)', '로그아웃된 기존 토큰으로 특가 여행 할인 쿠폰이 적용되었습니다.', true);
          });

          // SEC-255: GET /api/travel-products?sort=priceAsc
          fetch('/api/travel-products?sort=priceAsc', { headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-255)', '로그아웃된 기존 토큰으로 정렬 파라미터가 적용된 상품 데이터를 수신했습니다.', true);
          });

          // SEC-256: GET /api/travel-products?page=2
          fetch('/api/travel-products?page=2', { headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-256)', '로그아웃된 기존 토큰으로 페이지네이션 조건 조회가 허용되었습니다.', true);
          });

          // SEC-257: POST /api/travel-files
          fetch('/api/travel-files', { method: 'POST', body: JSON.stringify({ filename: 'test.pdf' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-257)', '로그아웃된 기존 토큰으로 여권 사본 및 면세 증명서 파일 연동이 통과되었습니다.', true);
          });

          // SEC-258: POST /api/chat
          fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: 'test' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-258)', '로그아웃된 기존 토큰으로 1:1 상담원 채팅 메시지 수신이 허용되었습니다.', true);
          });

          // SEC-259: GET /api/announcements
          fetch('/api/announcements', { headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-259)', '로그아웃된 기존 토큰으로 여행 공지사항 리스트를 열람하였습니다.', true);
          });

          // SEC-260: POST /api/reviews
          fetch('/api/reviews', { method: 'POST', body: JSON.stringify({ target: 'test', rating: '5', comment: 'test' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 상태 위배 (식별코드: SEC-260)', '로그아웃된 기존 토큰으로 여행 상품에 대한 평점 리뷰 등록이 접수되었습니다.', true);
          });
        }
      });
  };

  return (
    <div className="app-container">
      {/* Toast alert popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={t.isError ? 'toast error' : 'toast'}>
            <strong style={{ display: 'block' }}>{t.title}</strong>
            <span style={{ fontSize: '0.85rem' }}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <a href="#" className="logo" onClick={() => { setActiveTab('home'); setSelectedProd(null); }}>
          🌊 Go<span>Travel</span>
        </a>

        <nav className="header-nav">
          <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedProd(null); }}>여행 상품</a>
          <a href="#" className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => { setActiveTab('announcements'); setSelectedProd(null); }}>공지사항</a>
          <a href="#" className={`nav-link ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setActiveTab('support'); setSelectedProd(null); }}>1:1 여행 상담</a>
          {authToken && (
            <a href="#" className={`nav-link ${activeTab === 'mypage' ? 'active' : ''}`} onClick={() => { setActiveTab('mypage'); setMyPageSubTab('bookings'); }}>나의 여행첩</a>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>👤 {user.name} 님</span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <button className="btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>로그인 / 가입</button>
          )}
        </div>
      </header>

      {/* Hero Search Banner */}
      {activeTab === 'home' && !selectedProd && (
        <>
          <section className="hero-section">
            <h1>푸른 파도 너머의 새로운 여행지</h1>
            <p>GoTravel과 함께 나에게 딱 맞는 글로벌 특가 항공권 및 리조트 패키지 상품을 스케줄링 해보십시오.</p>
            
            <form onSubmit={handleSearchSubmit} className="search-container">
              <div className="search-box">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="예: 제주도, 도쿄, 크루즈 등 가고 싶은 지역을 입력하십시오..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn" style={{ borderRadius: '0 12px 12px 0', height: '48px' }}>검색</button>
              </div>
            </form>
          </section>

          <main className="main-content">
            {/* Tab Category Menu */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '0.8rem' }}>
              {['all', '항공권', '호텔', '패키지'].map(tab => (
                <button 
                  key={tab} 
                  className="btn" 
                  style={{ backgroundColor: selectedTab === tab ? 'var(--color-navy)' : '#e2e8f0', color: selectedTab === tab ? '#fff' : '#0f172a' }}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab === 'all' ? '전체 보기' : tab}
                </button>
              ))}
            </div>

            {/* Sorting select */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>총 {products.length}개의 맞춤 명세서 발견</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>정렬</label>
                <select 
                  className="form-input" 
                  value={productSort} 
                  onChange={(e) => setProductSort(e.target.value)}
                  style={{ padding: '0.3rem', width: '120px' }}
                >
                  <option value="">기본 순</option>
                  <option value="priceAsc">가격 낮은 순</option>
                  <option value="ratingDesc">평점 높은 순</option>
                </select>
              </div>
            </div>

            {/* Product List */}
            <section>
              <h2 className="section-title">인기 추천 해외 / 국내 패키지</h2>
              <div className="cards-grid">
                {products.filter(p => selectedTab === 'all' || p.category === selectedTab).map(p => (
                  <div key={p.id} className="card">
                    <div className="card-image" style={{ backgroundImage: 'url(' + p.image + ')' }} />
                    <div className="card-body">
                      <h3>{p.title}</h3>
                      <p>{p.desc}</p>
                      <div className="card-footer">
                        <span className="card-price" style={{ color: 'var(--color-navy)', fontWeight: 700 }}>{p.price.toLocaleString()}원</span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-navy)', borderColor: 'var(--color-navy)' }} onClick={() => handleAddWish(p.id)}>찜</button>
                          <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setSelectedProd(p)}>상세 예약</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pagination buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {[1, 2].map(pg => (
                <button 
                  key={pg} 
                  className="btn" 
                  style={{ backgroundColor: productPage === pg ? 'var(--color-navy)' : '#e2e8f0', color: productPage === pg ? '#fff' : '#0f172a' }}
                  onClick={() => setProductPage(pg)}
                >
                  {pg}
                </button>
              ))}
            </div>
          </main>
        </>
      )}

      {/* Travel Product Details */}
      {selectedProd && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h2>✈️ {selectedProd.title}</h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <img src={selectedProd.image} alt={selectedProd.title} style={{ width: '250px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p><strong>카테고리:</strong> {selectedProd.category} | <strong>평점:</strong> ⭐ {selectedProd.rating}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{selectedProd.desc}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)' }}>가격: {selectedProd.price.toLocaleString()}원</p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn" onClick={() => handleBookSubmit(selectedProd)}>지금 즉시 예약하기</button>
                    <button className="btn btn-secondary" style={{ color: 'var(--color-navy)', borderColor: 'var(--color-navy)' }} onClick={() => setSelectedProd(null)}>뒤로 가기</button>
                  </div>
                </div>
              </div>

              {/* Review input (SEC-260) */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <h3>💬 본 상품 여행 후기 작성</h3>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                  <div className="form-group" style={{ width: '150px' }}>
                    <label>평점</label>
                    <select 
                      className="form-input" 
                      value={reviewInput.rating}
                      onChange={(e) => setReviewInput({ ...reviewInput, rating: e.target.value })}
                    >
                      <option value="5">★★★★★</option>
                      <option value="4">★★★★☆</option>
                      <option value="3">★★★☆☆</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>후기 작성</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="만족도나 가이드 피드백을 한줄로 남겨주십시오." 
                      value={reviewInput.comment}
                      onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>리뷰 등록</button>
                </form>
              </div>
            </div>

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>🏖️ 패키지 필수 유의 명세서</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>취소 수수료 규정과 현지 일정 조율 조항은 공지사항 탭에서 별도로 확인 바랍니다.</p>
            </div>
          </div>
        </main>
      )}

      {/* Announcements (SEC-259) */}
      {activeTab === 'announcements' && (
        <main className="main-content">
          <div className="panel-card">
            <h2>📢 GoTravel 항공 및 현지 공지사항 피드</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {announcements.map(ann => (
                <div key={ann.id} style={{ padding: '1rem', backgroundColor: 'var(--color-gray-light)', borderRadius: '12px', border: '1px solid var(--color-gray-border)' }}>
                  <strong>{ann.title}</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Support Chat Page (SEC-258) */}
      {activeTab === 'support' && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h3>💬 1:1 라이브 가이드 연동 여행 채팅 상담소</h3>
              
              <div style={{ height: '300px', overflowY: 'auto', border: '1px solid var(--color-gray-border)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: 'var(--color-gray-light)' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ margin: 'auto', color: 'var(--color-text-muted)' }}>대화 기록이 없습니다. 항공권 조율 문의를 입력해보십시오.</div>
                ) : (
                  chatMessages.map((m, idx) => (
                    <div key={idx} style={{ alignSelf: 'flex-end', backgroundColor: 'var(--color-navy)', color: '#ffffff', padding: '0.6rem 1rem', borderRadius: '12px', maxWidth: '80%' }}>
                      {m.message}
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem', textAlign: 'right' }}>{m.timestamp}</div>
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

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>자주 묻는 질문 FAQ</h3>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div><strong>Q. 여권 번호 수정은 어디서 하나요?</strong><br />A. 마이페이지 나의 여행첩 서류 등록 필드에서 수정 가능합니다.</div>
                <div><strong>Q. 취소 시 결제 취소 환불금 입금은 며칠 걸리나요?</strong><br />A. 항공사 취소 규정에 따르며 평균 영업일 기준 3~5일이 소요됩니다.</div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* My Page (Traveler profile details) */}
      {activeTab === 'mypage' && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>나의 여행 수첩</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className={`btn ${myPageSubTab === 'bookings' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'bookings' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('bookings')}>📝 항공 및 호텔 예약 내역</button>
                <button className={`btn ${myPageSubTab === 'wishlist' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'wishlist' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('wishlist')}>⭐ 찜한 여행 상품 보관함</button>
                <button className={`btn ${myPageSubTab === 'travelers' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'travelers' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('travelers')}>👤 여행자 수령 주소 및 정보</button>
                <button className={`btn ${myPageSubTab === 'files' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'files' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('files')}>📁 서류 파일 연동</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              {/* Bookings */}
              {myPageSubTab === 'bookings' && (
                <div className="panel-card">
                  <h3>📝 최근 예매 완료 내역서</h3>
                  {bookings.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>최근 예약 완료된 패키지나 항공편 내역이 존재하지 않습니다.</p>
                  ) : (
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>예약 번호</th>
                          <th>여정 상품명</th>
                          <th>결제 금액</th>
                          <th>확정 일자</th>
                          <th>예약 상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.id}>
                            <td><code>{b.id}</code></td>
                            <td>{b.title}</td>
                            <td>{b.price.toLocaleString()}원</td>
                            <td>{b.date}</td>
                            <td style={{ color: 'green', fontWeight: 600 }}>{b.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Wishlist */}
              {myPageSubTab === 'wishlist' && (
                <div className="panel-card">
                  <h3>⭐ 찜 보관함</h3>
                  {wishlist.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>보관함이 비어 있습니다. 하트 단추를 클릭해 관심 상품을 추가해두십시오.</p>
                  ) : (
                    wishlist.map((item, idx) => (
                      <div key={idx} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.title}</span>
                        <strong>{item.price.toLocaleString()}원</strong>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Address (SEC-253) & Coupon (SEC-254) */}
              {myPageSubTab === 'travelers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="panel-card">
                    <h3>👤 여행 티켓 실물 도서 수령 주소지 입력</h3>
                    <form onSubmit={handleAddressSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="수령 주소를 상세히 기재하십시오." 
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">주소지 등록</button>
                    </form>
                  </div>

                  <div className="panel-card">
                    <h3>🎟️ 특별 여행 쿠폰 코드 번호 적용</h3>
                    <form onSubmit={handleCouponSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="예: SUMMER20" 
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn">쿠폰 등록</button>
                    </form>
                  </div>
                </div>
              )}

              {/* File uploading (SEC-257) */}
              {myPageSubTab === 'files' && (
                <div className="panel-card">
                  <h3>📁 여권 사본 및 면세 검증 증빙서 파일 연동</h3>
                  <form onSubmit={handleFileSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: passport_copy.pdf" 
                        value={fileInput}
                        onChange={(e) => setFileInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">파일 기입</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'GoTravel 계정 로그인' : '신규 회원 가입'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleAuthSubmit}>
              <div className="modal-body">
                {authMode === 'register' && (
                  <div className="form-group">
                    <label>성명</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>이메일 주소 (테스트용: user@example.com)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>비밀번호 (테스트용: password123)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>

                {authMode === 'login' ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    처음 가입하시나요? <span style={{ color: 'var(--color-sky-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('register')}>회원 등록하기</span>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    이미 가입하셨나요? <span style={{ color: 'var(--color-sky-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('login')}>로그인하기</span>
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn">{authMode === 'login' ? '로그인' : '가입 완료'}</button>
                <button type="button" className="btn btn-secondary" style={{ color: 'var(--color-text-dark)' }} onClick={() => setShowAuthModal(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-navy)', color: '#a1a1aa', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', marginTop: 'auto' }}>
        <p>© 2026 GoTravel Booking Services Inc. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>본 플랫폼은 강화학습 PPO 에이전트의 로그아웃 토큰 재사용 취약성(Logout Token Reuse) 탐지 검증을 위한 모의 예약 플랫폼입니다.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>활성 보안인증키: {authToken || '익명 접근 상태'}</p>
      </footer>
    </div>
  );
}
