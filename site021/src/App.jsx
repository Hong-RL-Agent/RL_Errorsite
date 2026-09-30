import React, { useState, useEffect } from 'react';

export default function App() {
  // Session State
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  });
  const [sessionInfo, setSessionInfo] = useState(null);

  // Authentication Mock
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ username: '', name: '' });

  // Data States
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feature Forms
  const [profileIntro, setProfileIntro] = useState('');
  const [supportForm, setSupportForm] = useState({ title: '', message: '' });
  const [reviewForm, setReviewForm] = useState({ productId: 'p1', rating: '5', comment: '' });
  const [fileForm, setFileForm] = useState({ filename: 'recipe.png', description: '' });
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentForm, setPaymentForm] = useState({ receiverName: '', receiverPhone: '', receiverAddress: '' });

  // UI States
  const [activeSubTab, setActiveSubTab] = useState('store'); // 'store', 'profile', 'support', 'orders'
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Custom fetch wrapper to pass and capture Session ID
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

  // Load Initial Data & Session details
  useEffect(() => {
    loadProducts();
    loadSession();
    loadCart();
    loadOrders();
  }, [currentSessionId]);

  const loadSession = () => {
    customFetch('/api/session')
      .then(res => res.json())
      .then(data => {
        setSessionInfo(data);
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {});
  };

  const loadProducts = (cat = 'All') => {
    const url = cat === 'All' ? '/api/products' : `/api/products?filter=${cat}`;
    customFetch(url)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => showToast('상품 목록 로드 실패', err.message, false));
  };

  const loadCart = () => {
    customFetch('/api/cart')
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(() => {});
  };

  const loadOrders = () => {
    customFetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => {});
  };

  // Toast Alert helper
  const showToast = (title, message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000);
  };

  // Trigger search
  const handleSearch = (e) => {
    e.preventDefault();
    customFetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        showToast('검색 성공 (식별코드: SEC-211)', `"${searchQuery}" 상품 결과 ${data.length}건이 로드되었습니다.`, true);
      });
  };

  // Submit Profile (site021-bug02)
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ introduction: profileIntro })
    })
      .then(res => res.json())
      .then(data => {
        showToast('프로필 반영 완료 (식별코드: SEC-212)', '임시 프로필 정보가 동기화되었습니다.', true);
        loadSession();
      });
  };

  // Submit Support Ticket (site021-bug03)
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/support', {
      method: 'POST',
      body: JSON.stringify(supportForm)
    })
      .then(res => res.json())
      .then(data => {
        setSupportForm({ title: '', message: '' });
        showToast('고객 문의 완료 (식별코드: SEC-213)', '상담 대기 접수가 완료되었습니다.', true);
        loadSession();
      });
  };

  // Add Cart Item (site021-bug08)
  const handleAddToCart = (productId) => {
    customFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    })
      .then(res => res.json())
      .then(data => {
        loadCart();
        showToast('장바구니 담기 완료 (식별코드: SEC-218)', '장바구니에 상품이 정상 보관되었습니다.', true);
        loadSession();
      });
  };

  // Submit Review Comment (site021-bug06)
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewForm)
    })
      .then(res => res.json())
      .then(data => {
        setReviewForm({ productId: 'p1', rating: '5', comment: '' });
        showToast('후기 등록 성공 (식별코드: SEC-216)', '작성하신 상품 리뷰 코멘트가 저장되었습니다.', true);
        loadSession();
      });
  };

  // Upload Recipe File (site021-bug05)
  const handleFileUpload = (e) => {
    e.preventDefault();
    customFetch('/api/files', {
      method: 'POST',
      body: JSON.stringify(fileForm)
    })
      .then(res => res.json())
      .then(data => {
        setFileForm({ filename: 'recipe.png', description: '' });
        showToast('레시피 연동 완료 (식별코드: SEC-215)', '레시피 조리법 및 메타 정보가 매핑되었습니다.', true);
        loadSession();
      });
  };

  // Save Delivery Reservation Note (site021-bug07)
  const handleSaveDeliveryNote = (e) => {
    e.preventDefault();
    customFetch('/api/orders/reservation', {
      method: 'POST',
      body: JSON.stringify({ note: deliveryNote })
    })
      .then(res => res.json())
      .then(data => {
        showToast('예약 메모 마킹 (식별코드: SEC-217)', '지정 배송시간 요청이 정상 수렴되었습니다.', true);
        loadSession();
      });
  };

  // Submit Payment checkout (site021-bug09)
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    customFetch('/api/payment', {
      method: 'POST',
      body: JSON.stringify(paymentForm)
    })
      .then(res => res.json())
      .then(data => {
        setPaymentForm({ receiverName: '', receiverPhone: '', receiverAddress: '' });
        loadCart();
        loadOrders();
        showToast('결제 접수 성공 (식별코드: SEC-219)', '주문 결제 명세서 매핑이 완수되었습니다.', true);
        loadSession();
      });
  };

  // Auth Handling (Login / Register)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    
    customFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username: authForm.username, name: authForm.name })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || '인증 오류');
        }
        return data;
      })
      .then(data => {
        if (data.status === 'success') {
          setUser(data.user);
          setShowAuthModal(false);
          setAuthForm({ username: '', name: '' });
          
          showToast('인증 완료', `${data.user.name} 회원님으로 로그인되었습니다.`, false);
          // Refresh session
          setCurrentSessionId(data.sessionId);
        }
      })
      .catch(err => {
        showToast('오류', err.message, false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      showToast('상품 로드 완료 (식별코드: SEC-214)', '마켓 추천 상품 정보가 연동되었습니다.', true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Category switch
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    loadProducts(cat);
    if (cat === 'All') {
      showToast('상품 로드 완료 (식별코드: SEC-214)', '마켓 추천 상품 정보가 연동되었습니다.', true);
    } else {
      showToast('필터 적용 성공 (식별코드: SEC-220)', `${cat} 상품 정보가 정렬되었습니다.`, true);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Alerts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={t.isError ? 'toast error' : 'toast'}>
            <strong style={{ display: 'block' }}>
              {t.title}
            </strong>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Header */}
      <header className="app-header">
        <a href="#" className="logo" onClick={() => setActiveSubTab('store')}>
          🍏 Fresh<span>Cart</span>
        </a>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowCartDrawer(true)}>
            🛒 장바구니 ({cart.length})
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                👤 {user.name} 회원님
              </span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => {
                setUser(null);
                setCurrentSessionId('sess_' + Math.random().toString(36).substring(2, 15));
                showToast('로그아웃', '임시 세션이 재생성되었습니다.', false);
              }}>로그아웃</button>
            </div>
          ) : (
            <button className="btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>로그인 / 가입</button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hero Banner Section */}
        <section className="hero-banner">
          <div className="hero-text">
            <h1>산지 직송, 자연 그대로의 건강한 신선 식품 배송</h1>
            <p>FreshCart는 당일 수확한 유기농 청과류 및 무농약 야채, 목장 직송 유제품을 가장 빠르게 식탁까지 전해드립니다. 비회원으로 상품을 둘러보고 장바구니에 담은 후 회원 로그인 시 세션 변화를 대시보드에서 체크하세요.</p>
            
            <form onSubmit={handleSearch} className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="유기농 브로콜리, 상추, 유정란 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-accent">검색</button>
            </form>
          </div>
        </section>

        {/* Tab Selection */}
        <nav className="tabs-nav">
          <button className={`tab-btn ${activeSubTab === 'store' ? 'active' : ''}`} onClick={() => setActiveSubTab('store')}>신선 푸드 매켓</button>
          <button className={`tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveSubTab('profile')}>회원정보 프로필</button>
          <button className={`tab-btn ${activeSubTab === 'support' ? 'active' : ''}`} onClick={() => setActiveSubTab('support')}>1:1 상담 문의</button>
          <button className={`tab-btn ${activeSubTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveSubTab('orders')}>주문 & 배송 관리</button>
        </nav>

        {/* Dynamic Sub Tab Content */}
        {activeSubTab === 'store' && (
          <div className="special-section">
            <div className="section-header">
              <h2>오늘의 유기농 신선 마켓 추천</h2>
            </div>
            
            <div className="category-list">
              {['All', 'Fruits', 'Vegetables', 'Dairy'].map(cat => (
                <button 
                  key={cat} 
                  className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat === 'All' ? '전체 보기' : cat}
                </button>
              ))}
            </div>

            <div className="products-grid">
              {products.map(prod => (
                <div key={prod.id} className="product-card">
                  <div className="product-image" style={{ backgroundImage: `url(${prod.image})` }} />
                  <div className="product-info">
                    <h3>{prod.name}</h3>
                    <p>{prod.desc}</p>
                    <div className="product-footer">
                      <span className="product-price">{prod.price.toLocaleString()}원</span>
                      <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAddToCart(prod.id)}>담기 +</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Review and Recipe Upload Panels (Secondary items) */}
            <div className="secondary-grid" style={{ marginTop: '2rem' }}>
              <div className="card-panel">
                <h3>💬 실시간 상품 이용 평점 & 후기 등록</h3>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>상품 선택</label>
                      <select 
                        className="form-input" 
                        value={reviewForm.productId}
                        onChange={(e) => setReviewForm({ ...reviewForm, productId: e.target.value })}
                      >
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ width: '100px' }}>
                      <label>평점</label>
                      <select 
                        className="form-input" 
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      >
                        <option value="5">★★★★★</option>
                        <option value="4">★★★★☆</option>
                        <option value="3">★★★☆☆</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>리뷰 코멘트</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="신선도와 배송 속도에 대한 솔직한 후기를 남겨주세요." 
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-accent" style={{ alignSelf: 'flex-start' }}>리뷰 등록하기</button>
                </form>
              </div>

              <div className="card-panel">
                <h3>📁 나만의 시크릿 신선 레시피 명세 파일 업로드</h3>
                <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div className="form-group">
                    <label>레시피 파일명</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={fileForm.filename}
                      onChange={(e) => setFileForm({ ...fileForm, filename: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>레시피 조리법 및 설명</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="예: 샤인머스캣 샐러드 소스 배합 비율" 
                      value={fileForm.description}
                      onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary">레시피 첨부하기</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'profile' && (
          <div className="card-panel" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h3>👤 임시 회원정보 프로필 소개</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              비로그인 상태로 임시 프로필 명세서를 수정한 뒤 로그인하면 세션 고정 취약점 모의 분석이 활성화됩니다.
            </p>
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>자기소개 기입</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="예: 친환경 채소만 선호하는 웰빙 소비자입니다." 
                  value={profileIntro}
                  onChange={(e) => setProfileIntro(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn">소개 등록</button>
            </form>
          </div>
        )}

        {activeSubTab === 'support' && (
          <div className="card-panel" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h3>📧 1:1 친환경 직배송 및 품질 상담 문의</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              배송 속도 및 청과물 상태에 대해 남겨주시면 상담원이 신속히 대응하겠습니다.
            </p>
            <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>문의 제목</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 샤인머스캣 당도 보상 규정이 어떻게 되나요?" 
                  value={supportForm.title}
                  onChange={(e) => setSupportForm({ ...supportForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>세부 사유 문의</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="자세한 내역을 기입해주십시오." 
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn">상담 요청 발송</button>
            </form>
          </div>
        )}

        {activeSubTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Delivery Reservation Scheduler (site021-bug07) */}
            <div className="card-panel">
              <h3>📅 신선 배송 예약 시간 일정 마킹</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                원하시는 수령 예정일과 예약 수령 메모를 아래에 작성해주세요.
              </p>
              <form onSubmit={handleSaveDeliveryNote} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>배송 수령 시간대 기입 및 메모</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 2026-08-15 오전 7시 전 문 앞 보랭상자 안 배치 요청" 
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn">일정 메모 마킹</button>
              </form>
            </div>

            {/* Orders list */}
            <div className="card-panel">
              <h3>📦 나의 신선 식품 배송 현황 조회</h3>
              {orders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  최근 30일 이내의 주문 및 결제 내역이 존재하지 않습니다.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>주문번호</th>
                        <th>배송지 정보</th>
                        <th>상태</th>
                        <th>주문 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(ord => (
                        <tr key={ord.id}>
                          <td>{ord.id}</td>
                          <td>
                            <strong>{ord.receiver.receiverName}</strong> ({ord.receiver.receiverPhone})<br />
                            {ord.receiver.receiverAddress}
                          </td>
                          <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{ord.status}</td>
                          <td>{new Date(ord.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer Panel Overlay */}
      {showCartDrawer && (
        <div className="cart-drawer-overlay" onClick={() => setShowCartDrawer(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>🛒 신선 장바구니 리스트</h3>
              <button onClick={() => setShowCartDrawer(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: '#94a3b8' }}>
                  장바구니가 비어 있습니다.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    <div>
                      <strong style={{ color: 'var(--color-text-dark)' }}>{item.product.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>수량: {item.quantity}개</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {(item.product.price * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                {/* Payment form */}
                <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>🚚 주문 배송 수령 정보 기입</h4>
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="수령인 성명"
                      value={paymentForm.receiverName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, receiverName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="연락처"
                      value={paymentForm.receiverPhone}
                      onChange={(e) => setPaymentForm({ ...paymentForm, receiverPhone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="배송 목적지 주소"
                      value={paymentForm.receiverAddress}
                      onChange={(e) => setPaymentForm({ ...paymentForm, receiverAddress: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>
                    신선 배송 결제 승인
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login/Signup Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'FreshCart 회원 로그인' : '간편 회원가입'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleAuthSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>사용자 아이디 (로그인 테스트용: buyer 또는 organic)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    required
                  />
                </div>
                {authMode === 'register' && (
                  <div className="form-group">
                    <label>이름</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      required
                    />
                  </div>
                )}
                {authMode === 'login' ? (
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    아직 계정이 없으신가요? <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('register')}>회원가입</span>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    이미 계정이 있으신가요? <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('login')}>로그인</span>
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn">{authMode === 'login' ? '로그인' : '가입하기'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-gray-light)', padding: '2rem', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
        <p>© 2026 FreshCart Organic Grocery Delivery. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>본 사이트는 강화학습 PPO 에이전트의 세션 관리 취약점(Session Fixation) 분석 검증을 위한 모의 쇼핑몰 플랫폼입니다.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>접속 세션키: {currentSessionId}</p>
      </footer>
    </div>
  );
}
