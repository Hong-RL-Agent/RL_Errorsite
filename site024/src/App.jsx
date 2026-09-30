import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication Mock Token
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('site024_token') || '';
  });
  const [user, setUser] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Auth Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Data Lists
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('서울 서초구');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Selected Detail Card
  const [selectedProd, setSelectedProd] = useState(null);

  // Form Inputs
  const [introInput, setIntroInput] = useState('');
  const [supportInput, setSupportInput] = useState({ title: '', message: '' });
  const [fileInput, setFileInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [reservationInput, setReservationInput] = useState('');
  
  // UI Tabs & alerts
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'mypage', 'support'
  const [myPageSubTab, setMyPageSubTab] = useState('wishlist'); // 'wishlist', 'cart', 'orders', 'profile', 'files', 'comments', 'reservations'
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
    loadLocations();
    loadNotifications();
    loadProducts();
    if (authToken) {
      loadCart();
      loadWishlist();
      loadOrders();
    }
  }, [authToken]);

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

  const loadLocations = () => {
    customFetch('/api/locations')
      .then(res => res.json())
      .then(data => setLocations(data));
  };

  const loadNotifications = () => {
    customFetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data));
  };

  const loadProducts = (cat = '') => {
    const url = cat ? `/api/products?filter=${cat}` : '/api/products';
    customFetch(url)
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            if (cat) {
              showToast('인증 제어 위배 (식별코드: SEC-250)', '로그아웃된 폐기된 토큰으로 카테고리 필터링 조회 조작이 통과되었습니다.', true);
            } else {
              showToast('인증 제어 위배 (식별코드: SEC-244)', '로그아웃된 폐기된 토큰으로 전체 상품 목록 데이터가 노출되었습니다.', true);
            }
          } else if (cat) {
            showToast('카테고리 필터 조회', `${cat} 분류 상품 조회가 완수되었습니다.`);
          }
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {});
  };

  const loadCart = () => {
    customFetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCart(data);
      });
  };

  const loadWishlist = () => {
    customFetch('/api/wishlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWishlist(data);
      });
  };

  const loadOrders = () => {
    customFetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      });
  };

  // Enforce Login Guard
  const checkLogin = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      showToast('인증 필요', '거래 예약 및 문의 작성을 위해 회원 로그인을 진행해주십시오.', false);
      return false;
    }
    return true;
  };

  // Search Suggestions
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    customFetch(`/api/suggestions?q=${encodeURIComponent(val)}`)
      .then(res => res.json())
      .then(data => setSuggestions(data));
  };

  // Execute Search query (SEC-241)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    customFetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-241)', '로그아웃된 폐기된 토큰으로 상품 검색이 통과되었습니다.', true);
          } else {
            showToast('검색 수행', `"${searchQuery}" 상품 검색이 접수되었습니다.`);
          }
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      });
  };

  // Submit profile (SEC-242)
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ intro: introInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-242)', '로그아웃된 폐기된 토큰으로 프로필 편집 조작이 통과되었습니다.', true);
          } else {
            showToast('프로필 저장', '소개 정보가 정상 수정되었습니다.');
          }
        }
        setIntroInput('');
        loadSession();
      });
  };

  // Submit Support Form (SEC-243)
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/support', {
      method: 'POST',
      body: JSON.stringify(supportInput)
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-243)', '로그아웃된 폐기된 토큰으로 1:1 상담 문의 작성이 통과되었습니다.', true);
          } else {
            showToast('문의 등록 완료', '1:1 거래 분쟁/일정 조율 문의글이 저장되었습니다.');
          }
        }
        setSupportInput({ title: '', message: '' });
      });
  };

  // Upload metadata details (SEC-245)
  const handleFileSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/files', {
      method: 'POST',
      body: JSON.stringify({ filename: fileInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-245)', '로그아웃된 폐기된 토큰으로 상품 실물 여부 검증 파일 전송이 완료되었습니다.', true);
          } else {
            showToast('검증 문서 등록', '첨부하신 상품 이미지 명세서가 바인딩되었습니다.');
          }
        }
        setFileInput('');
      });
  };

  // Submit comment (SEC-246)
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!selectedProd) return;
    customFetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ productId: selectedProd.id, text: commentInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-246)', '로그아웃된 폐기된 토큰으로 상품 평점 및 댓글 등록이 통과되었습니다.', true);
          } else {
            showToast('댓글 작성', '상품 흥정 및 조율 댓글이 업데이트되었습니다.');
          }
        }
        setCommentInput('');
      });
  };

  // Request reservation memo (SEC-247)
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    if (!selectedProd) return;
    customFetch('/api/trades/reservation', {
      method: 'POST',
      body: JSON.stringify({ productId: selectedProd.id, memo: reservationInput })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-247)', '로그아웃된 폐기된 토큰으로 거래 희망 일시 장소 설정이 저장되었습니다.', true);
          } else {
            showToast('거래 예약 접수', '희망 예약 조율 내역이 송신되었습니다.');
          }
        }
        setReservationInput('');
      });
  };

  // Add item to cart (SEC-248)
  const handleAddToCart = (productId) => {
    customFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-248)', '로그아웃된 폐기된 토큰으로 장바구니 품목 담기가 통과되었습니다.', true);
          } else {
            showToast('장바구니 담기', '중고 물품 예약 보관함에 보관되었습니다.');
          }
        }
        loadCart();
      });
  };

  // Pay checkout (SEC-249)
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    customFetch('/api/payment', {
      method: 'POST',
      body: JSON.stringify({ price: totalPrice })
    })
      .then(res => {
        if (res.status === 200) {
          if (!user && authToken) {
            showToast('인증 제어 위배 (식별코드: SEC-249)', '로그아웃된 폐기된 토큰으로 결제 모듈 승인이 통과되었습니다.', true);
          } else {
            showToast('결제 완료', '수수료 결제 및 예약 예치금 승인이 완수되었습니다.');
          }
        }
        loadCart();
        loadOrders();
      });
  };

  // Wishlist item
  const handleAddWish = (productId) => {
    if (!checkLogin()) return;
    customFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
      .then(res => res.json())
      .then(() => {
        loadWishlist();
        showToast('찜 목록 추가', '관심 상품으로 찜 보관함에 추가되었습니다.');
      });
  };

  // Auth Handling (Login / Register)
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
        localStorage.setItem('site024_token', data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast('로그인 완료', `${data.user.name} 회원님 환영합니다.`);
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
        showToast('로그아웃 완료', '정상적으로 로그아웃되었습니다. 보안을 위해 기존 인증 토큰 사용이 금지되어야 합니다.');
        
        // Immediately verify all 10 token reuse vulnerabilities
        if (tokenToTest) {
          const headers = {
            'Content-Type': 'application/json',
            'X-Auth-Token': tokenToTest
          };

          // SEC-241: GET /api/search
          fetch('/api/search?q=갤럭시', { headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-241)', '로그아웃된 폐기된 토큰으로 상품 검색이 통과되었습니다.', true);
          });

          // SEC-242: POST /api/profile
          fetch('/api/profile', { method: 'POST', body: JSON.stringify({ intro: 'test' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-242)', '로그아웃된 폐기된 토큰으로 프로필 편집 조작이 통과되었습니다.', true);
          });

          // SEC-243: POST /api/support
          fetch('/api/support', { method: 'POST', body: JSON.stringify({ title: 'test', message: 'test' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-243)', '로그아웃된 폐기된 토큰으로 1:1 상담 문의 작성이 통과되었습니다.', true);
          });

          // SEC-244: GET /api/products
          fetch('/api/products', { headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-244)', '로그아웃된 폐기된 토큰으로 전체 상품 목록 데이터가 노출되었습니다.', true);
          });

          // SEC-245: POST /api/files
          fetch('/api/files', { method: 'POST', body: JSON.stringify({ filename: 'test.png' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-245)', '로그아웃된 폐기된 토큰으로 상품 실물 여부 검증 파일 전송이 완료되었습니다.', true);
          });

          // SEC-246: POST /api/comments
          fetch('/api/comments', { method: 'POST', body: JSON.stringify({ productId: 'p1', text: 'test' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-246)', '로그아웃된 폐기된 토큰으로 상품 평점 및 댓글 등록이 통과되었습니다.', true);
          });

          // SEC-247: POST /api/trades/reservation
          fetch('/api/trades/reservation', { method: 'POST', body: JSON.stringify({ productId: 'p1', memo: 'test' }), headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-247)', '로그아웃된 폐기된 토큰으로 거래 희망 일시 장소 설정이 저장되었습니다.', true);
          });

          // SEC-248: GET /api/cart
          fetch('/api/cart', { headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-248)', '로그아웃된 폐기된 토큰으로 장바구니 품목 담기가 통과되었습니다.', true);
          });

          // SEC-249: POST /api/payment
          fetch('/api/payment', { method: 'POST', body: JSON.stringify({ price: 1000 }), headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-249)', '로그아웃된 폐기된 토큰으로 결제 모듈 승인이 통과되었습니다.', true);
          });

          // SEC-250: GET /api/products?filter=디지털기기
          fetch('/api/products?filter=디지털기기', { headers }).then(r => {
            if (r.status === 200) showToast('인증 제어 위배 (식별코드: SEC-250)', '로그아웃된 폐기된 토큰으로 카테고리 필터링 조회 조작이 통과되었습니다.', true);
          });
        }
      });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    loadProducts(cat);
  };

  return (
    <div className="app-container">
      {/* Toast alerts */}
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
          🍊 Orange<span>Market</span>
        </a>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>📍</span>
          <select 
            className="form-input" 
            style={{ padding: '0.3rem', width: '120px' }}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        <nav className="header-nav">
          <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedProd(null); }}>중고거래 홈</a>
          <a href="#" className={`nav-link ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setActiveTab('support'); setSelectedProd(null); }}>자주 묻는 질문</a>
          {authToken && (
            <a href="#" className={`nav-link ${activeTab === 'mypage' ? 'active' : ''}`} onClick={() => { setActiveTab('mypage'); setMyPageSubTab('wishlist'); }}>나의 오렌지</a>
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

      {/* Main Hero Banner for Search */}
      {activeTab === 'home' && !selectedProd && (
        <>
          <section className="hero-section">
            <h1>내 근처의 따뜻한 중고장터</h1>
            <p>우리 동네 이웃들과 오렌지 마켓에서 바로 거래를 시작해보세요.</p>
            
            <form onSubmit={handleSearchSubmit} className="search-container">
              <div className="search-box">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="디지털기기, 가구, 의류 등 품목명 검색..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="btn" style={{ borderRadius: '0 12px 12px 0', height: '48px' }}>검색</button>
              </div>

              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="suggestion-item" onClick={() => { setSearchQuery(s); setSuggestions([]); }}>
                      🔍 {s}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </section>

          <main className="main-content">
            {/* Category selection */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {['전체', '디지털기기', '가구/인테리어'].map(cat => (
                <button 
                  key={cat} 
                  className="btn btn-secondary" 
                  style={{ whiteSpace: 'nowrap', backgroundColor: selectedCategory === (cat === '전체' ? '' : cat) ? 'var(--color-orange-warm)' : '', color: selectedCategory === (cat === '전체' ? '' : cat) ? '#fff' : '' }}
                  onClick={() => handleCategorySelect(cat === '전체' ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products grid */}
            <section>
              <h2 className="section-title">최근 등록된 중고 목록</h2>
              <div className="cards-grid">
                {products.map(p => (
                  <div key={p.id} className="card">
                    <div className="card-image" style={{ backgroundImage: 'url(' + p.image + ')' }} />
                    <div className="card-body">
                      <h3>{p.title}</h3>
                      <p>📍 {p.location} | 카테고리: {p.category}</p>
                      <div className="card-footer">
                        <span className="card-price" style={{ fontWeight: 700, color: 'var(--color-orange-warm)' }}>{p.price.toLocaleString()}원</span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleAddWish(p.id)}>찜</button>
                          <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setSelectedProd(p)}>상세 보기</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* Product Detail Page */}
      {selectedProd && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h2>🍊 {selectedProd.title}</h2>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <img src={selectedProd.image} alt={selectedProd.title} style={{ width: '240px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p><strong>판매 카테고리:</strong> {selectedProd.category} | <strong>지역:</strong> {selectedProd.location}</p>
                  <p><strong>판매자 프로필:</strong> {selectedProd.seller}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{selectedProd.desc}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn" onClick={() => handleAddToCart(selectedProd.id)}>장바구니 담기</button>
                    <button className="btn btn-secondary" onClick={() => setSelectedProd(null)}>뒤로 가기</button>
                  </div>
                </div>
              </div>

              {/* Comments (SEC-246) */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <h3>💬 판매자와 조율 댓글 남기기</h3>
                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="조율 및 물품 상태에 대한 질문을 남겨보세요." 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  <button type="submit" className="btn">댓글 등록</button>
                </form>
              </div>

              {/* Reservation scheduling (SEC-247) */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <h3>📅 거래 만남 예약 조율 신청</h3>
                <form onSubmit={handleReservationSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 금요일 오후 7시 서초역 3번출구 희망합니다." 
                    value={reservationInput}
                    onChange={(e) => setReservationInput(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  <button type="submit" className="btn">예약 신청</button>
                </form>
              </div>
            </div>

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>🍊 직거래 유의사항</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>가급적 낮에 유동인구가 많은 공공장소에서 만남을 조율하시고 안전거래 기능을 활용하십시오.</p>
            </div>
          </div>
        </main>
      )}

      {/* Support Page */}
      {activeTab === 'support' && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card">
              <h3>📧 분쟁 조정 및 이웃 거래 불편 고객센터</h3>
              <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>상담 제목</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 비매너 온도가 낮은 회원 신고" 
                    value={supportInput.title}
                    onChange={(e) => setSupportInput({ ...supportInput, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>문의 세부 본문</label>
                  <textarea 
                    className="form-input" 
                    rows={4} 
                    placeholder="상세 내용을 적어주십시오." 
                    value={supportInput.message}
                    onChange={(e) => setSupportInput({ ...supportInput, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>문의 발송</button>
              </form>
            </div>

            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>자주 묻는 FAQ</h3>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div><strong>Q. 비회원도 결제할 수 있나요?</strong><br />A. 안전결제 기능은 회원가입 후에만 보증이 적용됩니다.</div>
                <div><strong>Q. 배송은 따로 지원하나요?</strong><br />A. 오렌지마켓은 직접 만나는 대면 거래를 최우선 가치로 삼고 있습니다.</div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* My Page */}
      {activeTab === 'mypage' && (
        <main className="main-content">
          <div className="dashboard-layout">
            <div className="panel-card" style={{ height: 'fit-content' }}>
              <h3>마이 오렌지 공간</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className={`btn ${myPageSubTab === 'wishlist' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'wishlist' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('wishlist')}>⭐ 관심 상품 찜 목록</button>
                <button className={`btn ${myPageSubTab === 'cart' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'cart' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('cart')}>🛒 예약 희망 보관함</button>
                <button className={`btn ${myPageSubTab === 'orders' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'orders' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('orders')}>📦 안전결제 구매 이력</button>
                <button className={`btn ${myPageSubTab === 'profile' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'profile' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('profile')}>👤 판매 프로필 설정</button>
                <button className={`btn ${myPageSubTab === 'files' ? '' : 'btn-secondary'}`} style={{ width: '100%', textAlign: 'left', color: myPageSubTab === 'files' ? '#fff' : '#000' }} onClick={() => setMyPageSubTab('files')}>📁 물품 검증 명세 파일</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* Wishlist */}
              {myPageSubTab === 'wishlist' && (
                <div className="panel-card">
                  <h3>⭐ 나의 찜한 이웃 상품 목록</h3>
                  {wishlist.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>찜 목록이 비어 있습니다. 마음에 드는 상품의 하트를 찜해보십시오.</p>
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

              {/* Cart & Checkout (SEC-248, SEC-249) */}
              {myPageSubTab === 'cart' && (
                <div className="panel-card">
                  <h3>🛒 안전 예치 장바구니 보관함</h3>
                  {cart.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>보관함에 담긴 상품이 없습니다.</p>
                  ) : (
                    <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {cart.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-gray-border)' }}>
                          <span>{item.title}</span>
                          <strong>{item.price.toLocaleString()}원</strong>
                        </div>
                      ))}
                      <div style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                        <span style={{ marginRight: '1rem' }}>합계: <strong>{cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원</strong></span>
                        <button type="submit" className="btn">안전 예치금 예약 결제</button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Orders */}
              {myPageSubTab === 'orders' && (
                <div className="panel-card">
                  <h3>📦 구매 확정 및 안전 예치 현황</h3>
                  {orders.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>안전결제 이용 내역이 없습니다.</p>
                  ) : (
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>결제 번호</th>
                          <th>예치금</th>
                          <th>일시</th>
                          <th>진행 상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id}>
                            <td><code>{o.id}</code></td>
                            <td>{o.price.toLocaleString()}원</td>
                            <td>{o.date}</td>
                            <td style={{ color: 'var(--color-orange-warm)', fontWeight: 600 }}>{o.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Profile Intro (SEC-242) */}
              {myPageSubTab === 'profile' && (
                <div className="panel-card">
                  <h3>👤 이웃 판매프로필 소개 설정</h3>
                  <form onSubmit={handleProfileSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: 직거래는 신촌 인근 선호합니다." 
                        value={introInput}
                        onChange={(e) => setIntroInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">프로필 등록</button>
                  </form>
                </div>
              )}

              {/* Files Upload (SEC-245) */}
              {myPageSubTab === 'files' && (
                <div className="panel-card">
                  <h3>📁 상품 검증 정밀 품질 진단 파일 등록</h3>
                  <form onSubmit={handleFileSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: galaxy_screen_s23.png" 
                        value={fileInput}
                        onChange={(e) => setFileInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn">명세 등록</button>
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
              <h3>{authMode === 'login' ? 'OrangeMarket 회원 로그인' : '간편 이웃 회원가입'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleAuthSubmit}>
              <div className="modal-body">
                {authMode === 'register' && (
                  <div className="form-group">
                    <label>성명 / 닉네임</label>
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
                    처음 방문하셨나요? <span style={{ color: 'var(--color-orange-warm)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('register')}>이웃 등록하기</span>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    이미 가입하셨나요? <span style={{ color: 'var(--color-orange-warm)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('login')}>로그인하기</span>
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn">{authMode === 'login' ? '로그인' : '가입 완료'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-charcoal)', color: '#a1a1aa', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', marginTop: 'auto' }}>
        <p>© 2026 OrangeMarket Services Inc. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>본 사이트는 강화학습 PPO 에이전트의 로그아웃 토큰 재사용 취약성(Logout Token Reuse) 탐지 검증을 위한 모의 플랫폼입니다.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>활성 보안인증키: {authToken || '익명 접근 상태'}</p>
      </footer>
    </div>
  );
}
