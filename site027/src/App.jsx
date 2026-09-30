import React, { useState, useEffect } from 'react';

const BUG_MAP = {
  search: { bugId: 'site027-bug01', secId: 'SEC-271', name: '보안 헤더 누락 (검색창)' },
  profile: { bugId: 'site027-bug02', secId: 'SEC-272', name: '보안 헤더 누락 (프로필 소개)' },
  support: { bugId: 'site027-bug03', secId: 'SEC-273', name: '보안 헤더 누락 (문의 폼)' },
  products: { bugId: 'site027-bug04', secId: 'SEC-274', name: '보안 헤더 누락 (상품명 필드)' },
  files: { bugId: 'site027-bug05', secId: 'SEC-275', name: '보안 헤더 누락 (파일 설명)' },
  reviews: { bugId: 'site027-bug06', secId: 'SEC-276', name: '보안 헤더 누락 (댓글 입력)' },
  reservation: { bugId: 'site027-bug07', secId: 'SEC-277', name: '보안 헤더 누락 (예약 메모)' },
  cart: { bugId: 'site027-bug08', secId: 'SEC-278', name: '보안 헤더 누락 (장바구니)' },
  payment: { bugId: 'site027-bug09', secId: 'SEC-279', name: '보안 헤더 누락 (결제 폼)' },
  filter: { bugId: 'site027-bug10', secId: 'SEC-280', name: '보안 헤더 누락 (필터 파라미터)' }
};

export default function App() {
  // Navigation & Page state
  const [activeNav, setActiveNav] = useState('home'); // 'home', 'orders', 'support', 'profile'
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('전체');

  // Data states
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Drawers / Modals
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [wishlist, setWishlist] = useState(['p1', 'p3']);

  // Search Hero inputs
  const [searchDestination, setSearchDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-09-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-05');
  const [guestCount, setGuestCount] = useState('성인 2명');
  const [recentSearches, setRecentSearches] = useState(['제주도', '도쿄 타워', '발리 우붓', '파리 세느강']);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '김여행',
    email: 'traveler@tripscape.com',
    phone: '010-1234-5678',
    passportName: 'KIM TRAVELER',
    bio: '세계 모든 도시의 감성 숙소와 프라이빗 투어를 탐험하는 자유 여행가입니다.'
  });
  const [fileForm, setFileForm] = useState({ fileName: '', fileDesc: '' });
  const [supportForm, setSupportForm] = useState({ inquiryType: '예약/결제 문의', contact: '', message: '' });
  const [reservationForm, setReservationForm] = useState({ buyerName: '김여행', buyerPhone: '010-1234-5678', memo: '고층 객실 부탁드립니다.' });
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
  const [paymentMethod, setPaymentMethod] = useState('신용/체크카드');

  // UI Toast State
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const showToast = (title, message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Response Header Inspector & Bug ID Toast Pop-up Helper
  const checkResponseSecurityHeaders = (res, bugKey) => {
    const meta = BUG_MAP[bugKey];
    if (!meta) return;

    const REQUIRED = ['content-security-policy', 'strict-transport-security', 'x-content-type-options'];
    const missing = [];
    REQUIRED.forEach(h => {
      if (!res.headers.get(h)) {
        missing.push(h);
      }
    });

    if (missing.length > 0) {
      showToast(
        `🚨 [${meta.bugId} / ${meta.secId}] ${meta.name}`,
        `백엔드 보안 헤더 누락 감지! (${missing.join(', ')}) 헤더가 미포함되었습니다.`,
        true
      );
    }
  };

  // Initial Load
  useEffect(() => {
    loadAllProducts();
    loadCart();
    loadOrders();
  }, []);

  // Fetch all products (SEC-274 when called without filter)
  const loadAllProducts = () => {
    setLoading(true);
    fetch('/api/products')
      .then(res => {
        checkResponseSecurityHeaders(res, 'products');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .finally(() => setLoading(false));
  };

  // Fetch filtered products (SEC-280 when filter query param is present)
  const handleCategoryFilter = (cat) => {
    setActiveCategoryFilter(cat);
    if (cat === '전체') {
      loadAllProducts();
    } else {
      setLoading(true);
      fetch(`/api/products?filter=${encodeURIComponent(cat)}`)
        .then(res => {
          checkResponseSecurityHeaders(res, 'filter');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) setProducts(data);
        })
        .finally(() => setLoading(false));
    }
  };

  // Search submission (SEC-271)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(`/api/search?destination=${encodeURIComponent(searchDestination)}`)
      .then(res => {
        checkResponseSecurityHeaders(res, 'search');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        if (searchDestination.trim() && !recentSearches.includes(searchDestination)) {
          setRecentSearches(prev => [searchDestination.trim(), ...prev.slice(0, 3)]);
        }
      })
      .finally(() => setLoading(false));
  };

  // Load Cart
  const loadCart = () => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCart(data); })
      .catch(() => {});
  };

  // Add to Cart (SEC-278)
  const handleAddToCart = (product) => {
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        guests: guestCount,
        dates: `${checkInDate} ~ ${checkOutDate}`
      })
    })
      .then(res => {
        checkResponseSecurityHeaders(res, 'cart');
        return res.json();
      })
      .then(data => {
        if (data.cart) setCart(data.cart);
      });
  };

  // Load Orders
  const loadOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(() => {});
  };

  // Submit Booking Reservation (SEC-277)
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    fetch('/api/orders/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        buyerName: reservationForm.buyerName,
        buyerPhone: reservationForm.buyerPhone,
        memo: reservationForm.memo,
        dates: `${checkInDate} ~ ${checkOutDate}`,
        guests: guestCount
      })
    })
      .then(res => {
        checkResponseSecurityHeaders(res, 'reservation');
        return res.json();
      })
      .then(data => {
        setSelectedProduct(null);
        loadOrders();
      });
  };

  // Submit Payment (SEC-279)
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethod,
        amount: totalAmount,
        items: cart
      })
    })
      .then(res => {
        checkResponseSecurityHeaders(res, 'payment');
        return res.json();
      })
      .then(data => {
        setShowPaymentModal(false);
        setShowCartDrawer(false);
        setCart([]);
        loadOrders();
      });
  };

  // Submit Review (SEC-276)
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
    })
      .then(res => {
        checkResponseSecurityHeaders(res, 'reviews');
        return res.json();
      })
      .then(data => {
        setReviewForm({ rating: '5', comment: '' });
      });
  };

  // Update Profile (SEC-272)
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm)
    })
      .then(res => {
        checkResponseSecurityHeaders(res, 'profile');
        return res.json();
      });
  };

  // File Description Registration (SEC-275)
  const handleFileSubmit = (e) => {
    e.preventDefault();
    fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileForm)
    })
      .then(res => {
        checkResponseSecurityHeaders(res, 'files');
        return res.json();
      })
      .then(data => {
        setFileForm({ fileName: '', fileDesc: '' });
      });
  };

  // Submit Support Inquiry (SEC-273)
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supportForm)
    })
      .then(res => {
        checkResponseSecurityHeaders(res, 'support');
        return res.json();
      })
      .then(data => {
        setSupportForm({ inquiryType: '예약/결제 문의', contact: '', message: '' });
      });
  };

  // Toggle Wishlist
  const toggleWish = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(w => w !== id));
      showToast('관심 여행지 해제', '찜 목록에서 삭제되었습니다.');
    } else {
      setWishlist(prev => [...prev, id]);
      showToast('관심 여행지 추가', '찜한 여행지 목록에 추가되었습니다.');
    }
  };

  return (
    <div className="ts-app-container">
      {/* Toast Notification Container */}
      <div className="ts-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={t.isError ? 'ts-toast error' : 'ts-toast'}>
            <strong>{t.title}</strong>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Header Navigation */}
      <header className="ts-header">
        <a href="#" className="ts-logo" onClick={() => setActiveNav('home')}>
          🛫 Trip<span>Scape</span>
        </a>

        <nav className="ts-nav">
          <span className={`ts-nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => setActiveNav('home')}>
            여행지 탐색
          </span>
          <span className={`ts-nav-item ${activeNav === 'orders' ? 'active' : ''}`} onClick={() => setActiveNav('orders')}>
            나의 예약 내역
          </span>
          <span className={`ts-nav-item ${activeNav === 'support' ? 'active' : ''}`} onClick={() => setActiveNav('support')}>
            1:1 고객지원
          </span>
          <span className={`ts-nav-item ${activeNav === 'profile' ? 'active' : ''}`} onClick={() => setActiveNav('profile')}>
            마이 프로필
          </span>
        </nav>

        <div className="ts-header-actions">
          <button className="ts-btn ts-btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => setShowCartDrawer(true)}>
            🛒 장바구니 ({cart.length})
          </button>
        </div>
      </header>

      {/* HOME PAGE: Travel Search Hero & Product Grid */}
      {activeNav === 'home' && (
        <>
          <section className="ts-hero">
            <h1>떠나고 싶은 완벽한 여행지, TripScape</h1>
            <p>전 세계 감성 펜션, 5성급 럭셔리 호텔, 프라이빗 풀빌라 및 도슨트 투어까지 한번에 예약하세요.</p>

            {/* Travel Search Hero Component */}
            <form onSubmit={handleSearchSubmit} className="ts-search-hero-box">
              <div className="ts-search-field">
                <label>목적지 / 숙소명</label>
                <input
                  type="text"
                  placeholder="예: 제주도, 도쿄, 풀빌라..."
                  value={searchDestination}
                  onChange={e => setSearchDestination(e.target.value)}
                />
              </div>

              <div className="ts-search-field">
                <label>체크인 ~ 체크아웃</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} />
                  <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} />
                </div>
              </div>

              <div className="ts-search-field">
                <label>여행 인원</label>
                <select value={guestCount} onChange={e => setGuestCount(e.target.value)}>
                  <option value="성인 1명">성인 1명</option>
                  <option value="성인 2명">성인 2명 (커플/친구)</option>
                  <option value="성인 2명 + 아동 1명">성인 2명 + 아동 1명 (패밀리)</option>
                  <option value="성인 4명 이상">성인 4명 이상 (단체)</option>
                </select>
              </div>

              <button type="submit" className="ts-btn" style={{ height: '48px', width: '100%' }}>
                🔍 여행 검색
              </button>
            </form>

            {/* Recent Searches Chips */}
            <div className="ts-chips-container">
              <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>최근 검색:</span>
              {recentSearches.map((chip, idx) => (
                <span
                  key={idx}
                  className="ts-chip"
                  onClick={() => {
                    setSearchDestination(chip);
                    fetch(`/api/search?destination=${encodeURIComponent(chip)}`)
                      .then(r => {
                        checkResponseSecurityHeaders(r, 'search');
                        return r.json();
                      })
                      .then(data => setProducts(data));
                  }}
                >
                  📍 {chip}
                </span>
              ))}
            </div>
          </section>

          <main className="ts-main">
            {/* Recommended Destinations Slider / Grid */}
            <section>
              <h2 className="ts-section-title">✨ 이달의 인기 추천 여행지</h2>
              <p className="ts-section-subtitle">TripScape 여행자들이 가장 많이 선택한 감성 휴양지 매거진</p>

              <div className="ts-destinations-grid" style={{ marginTop: '1.2rem' }}>
                {[
                  { name: '제주도', desc: '에메랄드빛 바다와 감성 독채 펜션', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop&q=60' },
                  { name: '도쿄', desc: '롯폰기 야경과 전통 료칸 감성', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=60' },
                  { name: '발리', desc: '우붓 정글 인피니티 풀빌라', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=60' },
                  { name: '파리', desc: '세느강 프라이빗 와인 요트 크루즈', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=60' },
                  { name: '강릉', desc: '경포대 럭셔리 글램핑 오션뷰', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&auto=format&fit=crop&q=60' }
                ].map((d, i) => (
                  <div
                    key={i}
                    className="ts-dest-card"
                    style={{ backgroundImage: `url(${d.img})` }}
                    onClick={() => {
                      setSearchDestination(d.name);
                      fetch(`/api/search?destination=${encodeURIComponent(d.name)}`)
                        .then(r => {
                          checkResponseSecurityHeaders(r, 'search');
                          return r.json();
                        })
                        .then(data => setProducts(data));
                    }}
                  >
                    <div className="ts-dest-card-overlay">
                      <h4>{d.name}</h4>
                      <p>{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Accommodations & Tour Cards Grid */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 className="ts-section-title">🏨 특가 예약 숙소 & 투어</h2>
                  <p className="ts-section-subtitle">무료 취소 보장 및 최저가 보상제 혜택 상품</p>
                </div>

                {/* Category Filter Tabs (SEC-280) */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
                  {['전체', '5성급 호텔', '감성 펜션', '풀빌라', '액티비티 투어'].map(cat => (
                    <button
                      key={cat}
                      className={`ts-btn ${activeCategoryFilter === cat ? '' : 'ts-btn-outline'}`}
                      style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => handleCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                  여행 상품 정보를 불러오는 중입니다...
                </div>
              ) : products.length === 0 ? (
                <div className="ts-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>검색 결과와 일치하는 여행 상품이 존재하지 않습니다.</p>
                  <button className="ts-btn ts-btn-outline" style={{ margin: '1rem auto 0' }} onClick={loadAllProducts}>
                    전체 상품 목록으로 돌아가기
                  </button>
                </div>
              ) : (
                <div className="ts-products-grid">
                  {products.map(p => (
                    <div key={p.id} className="ts-card">
                      <div className="ts-card-img-wrap" style={{ backgroundImage: `url(${p.image})` }}>
                        <span className="ts-card-badge">{p.category}</span>
                        <button className="ts-card-wish-btn" onClick={() => toggleWish(p.id)}>
                          {wishlist.includes(p.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <div className="ts-card-body">
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-sky-blue)', fontWeight: 700 }}>📍 {p.location}</span>
                        <h3>{p.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.desc}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', marginTop: '0.3rem' }}>
                          ⭐ <strong>{p.rating}</strong> ({p.reviewsCount}개 리뷰)
                        </p>

                        <div className="ts-card-footer">
                          <div className="ts-price">
                            {p.price.toLocaleString()}원 <span>/ 1박</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="ts-btn ts-btn-outline" style={{ padding: '0.4rem 0.7rem', fontSize: '0.85rem' }} onClick={() => handleAddToCart(p)}>
                              🛒 장바구니
                            </button>
                            <button className="ts-btn" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setSelectedProduct(p)}>
                              예약하기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {/* MY RESERVATION ORDERS VIEW */}
      {activeNav === 'orders' && (
        <main className="ts-main">
          <div className="ts-panel">
            <h2 className="ts-section-title">🧾 나의 여행 예약 및 확정 내역</h2>
            <p className="ts-section-subtitle">고객님이 결제 및 신청하신 숙소 및 투어 예약 목록입니다.</p>

            {orders.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', padding: '2rem 0' }}>예약된 여행 상품 내역이 없습니다.</p>
            ) : (
              <table className="ts-table">
                <thead>
                  <tr>
                    <th>예약 번호</th>
                    <th>여행 상품명</th>
                    <th>결제 금액</th>
                    <th>예약자</th>
                    <th>일정 / 메모</th>
                    <th>예약 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.orderId}>
                      <td><code>{o.orderId}</code></td>
                      <td><strong>{o.title}</strong></td>
                      <td>{o.price.toLocaleString()}원</td>
                      <td>{o.buyerName} ({o.buyerPhone})</td>
                      <td>{o.dates || '2026-09-01 ~ 09-05'}<br/><small style={{ color: 'var(--color-text-muted)' }}>{o.memo}</small></td>
                      <td><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      )}

      {/* 1:1 SUPPORT INQUIRY VIEW (SEC-273) */}
      {activeNav === 'support' && (
        <main className="ts-main">
          <div className="ts-dashboard-grid">
            <div className="ts-panel">
              <h2 className="ts-section-title">🎧 1:1 여행 수기 문의 센터</h2>
              <p className="ts-section-subtitle">예약 변경, 환불, 픽업 요청 및 해외 투어 궁금증을 남겨주세요.</p>

              <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="ts-form-group">
                  <label>문의 유형 선택</label>
                  <select
                    className="ts-input"
                    value={supportForm.inquiryType}
                    onChange={e => setSupportForm({ ...supportForm, inquiryType: e.target.value })}
                  >
                    <option value="예약/결제 문의">예약 및 결제 수단 문의</option>
                    <option value="숙소 픽업/체크인 문의">숙소 픽업 및 조기 체크인 요청</option>
                    <option value="투어 일정 변경">투어 일정 변경 및 인원 추가</option>
                    <option value="취소 및 환불 접수">취소 규정 및 환불 접수</option>
                  </select>
                </div>

                <div className="ts-form-group">
                  <label>연락처 / 이메일</label>
                  <input
                    type="text"
                    className="ts-input"
                    placeholder="010-1234-5678 또는 traveler@tripscape.com"
                    value={supportForm.contact}
                    onChange={e => setSupportForm({ ...supportForm, contact: e.target.value })}
                    required
                  />
                </div>

                <div className="ts-form-group">
                  <label>문의 내용</label>
                  <textarea
                    className="ts-input"
                    rows={5}
                    placeholder="자세한 문의 사항을 작성해 주세요."
                    value={supportForm.message}
                    onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="ts-btn" style={{ alignSelf: 'flex-start' }}>
                  문의 제출하기
                </button>
              </form>
            </div>

            <div className="ts-panel" style={{ height: 'fit-content' }}>
              <h3>📌 1:1 상담 안내</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                운영 시간: 평일 09:00 ~ 18:00 (주말 및 공휴일 긴급 카카오톡 처리)
              </p>
              <div style={{ borderTop: '1px solid var(--color-gray-border)', paddingTop: '0.8rem', fontSize: '0.85rem' }}>
                <p>✔ 평균 답변 시간 15분 이내</p>
                <p>✔ 해외 현지 투어 응급 연락망 연동</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* MY PROFILE VIEW (SEC-272 & SEC-275) */}
      {activeNav === 'profile' && (
        <main className="ts-main">
          <div className="ts-dashboard-grid">
            <div className="ts-panel">
              <h2 className="ts-section-title">👤 여행자 회원 프로필 설정</h2>
              <p className="ts-section-subtitle">해외 숙소 및 항공권 발권을 위한 영문명과 회원 정보를 관리합니다.</p>

              {/* Profile Form (SEC-272) */}
              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="ts-form-group">
                  <label>성명</label>
                  <input
                    type="text"
                    className="ts-input"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>여권 영문 성명 (Passport Name)</label>
                  <input
                    type="text"
                    className="ts-input"
                    value={profileForm.passportName}
                    onChange={e => setProfileForm({ ...profileForm, passportName: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>연락처</label>
                  <input
                    type="text"
                    className="ts-input"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>여행자 소개 (Bio)</label>
                  <textarea
                    className="ts-input"
                    rows={3}
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  />
                </div>
                <button type="submit" className="ts-btn" style={{ alignSelf: 'flex-start' }}>
                  프로필 저장
                </button>
              </form>

              {/* File Registration Form (SEC-275) */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <h3>📄 여행 증빙 서류 파일 설명 등록</h3>
                <form onSubmit={handleFileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.8rem' }}>
                  <div className="ts-form-group">
                    <label>파일명 / 서류 유형</label>
                    <input
                      type="text"
                      className="ts-input"
                      placeholder="예: 여권사본_김여행.pdf"
                      value={fileForm.fileName}
                      onChange={e => setFileForm({ ...fileForm, fileName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>파일 상세 설명</label>
                    <input
                      type="text"
                      className="ts-input"
                      placeholder="예: 2026 발리 여행자 확인용 영문 서류"
                      value={fileForm.fileDesc}
                      onChange={e => setFileForm({ ...fileForm, fileDesc: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="ts-btn ts-btn-dark" style={{ alignSelf: 'flex-start' }}>
                    파일 정보 제출
                  </button>
                </form>
              </div>
            </div>

            <div className="ts-panel" style={{ height: 'fit-content' }}>
              <h3>❤️ 찜한 여행지 ({wishlist.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                {wishlist.map(id => {
                  const item = products.find(p => p.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                      <img src={item.image} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{item.title}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-sky-blue)' }}>{item.price.toLocaleString()}원</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* PRODUCT DETAIL & BOOKING DRAWER (SEC-276, SEC-277) */}
      {selectedProduct && (
        <div className="ts-drawer-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="ts-drawer" onClick={e => e.stopPropagation()}>
            <div className="ts-drawer-header">
              <h3>{selectedProduct.title}</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => setSelectedProduct(null)}>×</button>
            </div>

            <div className="ts-drawer-body">
              <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '100%', height: '220px', borderRadius: '12px', objectFit: 'cover' }} />

              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-sky-blue)', fontWeight: 700 }}>📍 {selectedProduct.location} · {selectedProduct.category}</p>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--color-deep-navy)', marginTop: '0.3rem' }}>{selectedProduct.price.toLocaleString()}원 / 1박</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.6rem', lineHeight: '1.6' }}>{selectedProduct.desc}</p>
              </div>

              <div>
                <h4>✨ 포함 편의시설 & 혜택</h4>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {selectedProduct.amenities.map((a, idx) => (
                    <span key={idx} style={{ backgroundColor: 'var(--color-soft-gray)', border: '1px solid var(--color-gray-border)', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Booking Reservation Form (SEC-277) */}
              <div style={{ borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.2rem' }}>
                <h4>📅 숙소 및 투어 바로 예약 신청</h4>
                <form onSubmit={handleReservationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.8rem' }}>
                  <div className="ts-form-group">
                    <label>예약자 성명</label>
                    <input
                      type="text"
                      className="ts-input"
                      value={reservationForm.buyerName}
                      onChange={e => setReservationForm({ ...reservationForm, buyerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>예약자 연락처</label>
                    <input
                      type="text"
                      className="ts-input"
                      value={reservationForm.buyerPhone}
                      onChange={e => setReservationForm({ ...reservationForm, buyerPhone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="ts-form-group">
                    <label>숙소 요청 메모</label>
                    <input
                      type="text"
                      className="ts-input"
                      placeholder="예: 얼리 체크인, 고층 배정 요청"
                      value={reservationForm.memo}
                      onChange={e => setReservationForm({ ...reservationForm, memo: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="ts-btn">예약 확정 제출</button>
                </form>
              </div>

              {/* Review Form (SEC-276) */}
              <div style={{ borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.2rem' }}>
                <h4>💬 여행 후기 리뷰 작성</h4>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>평점:</label>
                    <select className="ts-input" value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                      <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                      <option value="4">⭐⭐⭐⭐ (4점)</option>
                      <option value="3">⭐⭐⭐ (3점)</option>
                    </select>
                  </div>
                  <textarea
                    className="ts-input"
                    rows={3}
                    placeholder="숙소 및 투어에 대한 생생한 후기를 공유해주세요."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                  />
                  <button type="submit" className="ts-btn ts-btn-outline" style={{ alignSelf: 'flex-start' }}>리뷰 전송</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER (SEC-278 & SEC-279) */}
      {showCartDrawer && (
        <div className="ts-drawer-overlay" onClick={() => setShowCartDrawer(false)}>
          <div className="ts-drawer" onClick={e => e.stopPropagation()}>
            <div className="ts-drawer-header">
              <h3>🛒 장바구니 목록 ({cart.length})</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => setShowCartDrawer(false)}>×</button>
            </div>

            <div className="ts-drawer-body">
              {cart.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 'auto' }}>장바구니가 비어 있습니다.</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', border: '1px solid var(--color-gray-border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{item.title}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.dates} ({item.guests})</p>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--color-sky-blue)' }}>{item.price.toLocaleString()}원</span>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="ts-drawer-footer" style={{ flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>총 결제 예정 금액</span>
                  <span style={{ color: 'var(--color-sky-blue)' }}>{cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원</span>
                </div>
                <button className="ts-btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setShowPaymentModal(true)}>
                  💳 주문 결제하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (SEC-279) */}
      {showPaymentModal && (
        <div className="ts-drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="ts-panel" style={{ width: '100%', maxWidth: '440px' }}>
            <h3>💳 여행 결제 승인 요청</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              결제 금액: <strong>{cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원</strong>
            </p>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.8rem' }}>
              <div className="ts-form-group">
                <label>결제 수단 선택</label>
                <select className="ts-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="신용/체크카드">신용/체크카드 (앱카드)</option>
                  <option value="카카오페이 / 네이버페이">카카오페이 / 네이버페이</option>
                  <option value="무통장 가상계좌">무통장 가상계좌 입금</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="ts-btn" style={{ flex: 1 }}>결제 승인</button>
                <button type="button" className="ts-btn ts-btn-outline" onClick={() => setShowPaymentModal(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="ts-footer">
        <p>© 2026 TripScape Travel Inc. All rights reserved.</p>
        <p style={{ marginTop: '0.4rem', opacity: 0.8 }}>
          대한민국 1등 감성 여행 플랫폼 TripScape | 고객센터 1588-9926 (365일 24시간 연중무휴)
        </p>
      </footer>
    </div>
  );
}
