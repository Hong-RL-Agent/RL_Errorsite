import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Star,
  Search,
  User,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Trash2,
  X,
  ArrowRight,
  ShieldCheck,
  Tag,
  Plus,
  Award,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Dog,
  Cat,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [points, setPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);

  // Filter states
  const [selectedServiceType, setSelectedServiceType] = useState('전체');
  const [selectedProductCategory, setSelectedProductCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  const fetchData = async () => {
    try {
      const [uRes, petRes, provRes, srvRes, bkRes, prodRes, cartRes, ordRes, coupRes, ptRes, revRes, postRes] = await Promise.all([
        fetch('/api/auth/me').then(r => r.json()),
        fetch('/api/pets').then(r => r.json()),
        fetch('/api/providers').then(r => r.json()),
        fetch('/api/services').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/cart').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/coupons').then(r => r.json()),
        fetch('/api/points/balance').then(r => r.json()),
        fetch('/api/reviews').then(r => r.json()),
        fetch('/api/community/posts').then(r => r.json())
      ]);

      if (uRes.success) setUser(uRes.data);
      if (petRes.success) setPets(petRes.data);
      if (provRes.success) setProviders(provRes.data);
      if (srvRes.success) setServices(srvRes.data);
      if (bkRes.success) setBookings(bkRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (cartRes.success) setCart(cartRes.data);
      if (ordRes.success) setOrders(ordRes.data);
      if (coupRes.success) setCoupons(coupRes.data);
      if (ptRes.success) setPoints(ptRes.data.points);
      if (revRes.success) setReviews(revRes.data);
      if (postRes.success) setPosts(postRes.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (title, message, type = 'info', bugId = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [{ id, title, message, type, bugId }, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5500);
  };

  // Switch User
  const handleSwitchUser = async (userId) => {
    const res = await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data);
      fetchData();
      showToast('계정 전환 완료', `${data.data.name} (${data.data.role}) 계정으로 전환되었습니다.`, 'success');
    }
  };

  // ==========================================================
  // 5 Intentional Business Logic Bugs Triggers
  // ==========================================================

  // 1. SEC-351: Double Booking
  const triggerBug1_DoubleBooking = async () => {
    // prov-001 already has bk-1001 on 2026-04-05 at 14:00~15:00
    const payload = {
      providerId: 'prov-001',
      serviceId: 'srv-001',
      petId: pets[0]?.id || 'pet-001',
      date: '2026-04-05',
      startTime: '14:00',
      endTime: '15:00',
      price: 25000
    };

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE034-BUG-001 / SEC-351]',
        `박보검 매니저의 동일 일자(2026-04-05 14:00) 중복 예약(${data.data.id})이 시간대 충돌 검증 없이 추가 승인되었습니다.`,
        'warning',
        'site034-bug01'
      );
    }
  };

  // 2. SEC-352: Duplicate Refund Credit on cancelled booking
  const triggerBug2_DuplicateRefund = async (bookingId = 'bk-1003') => {
    const res = await fetch(`/api/bookings/${bookingId}/refund`, {
      method: 'POST'
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE034-BUG-002 / SEC-352]',
        `취소된 예약(${bookingId})에 대해 환불 포인트가 중복 지급되어 +35,000P가 계정에 추가 적립되었습니다.`,
        'warning',
        'site034-bug02'
      );
    }
  };

  // 3. SEC-353: Coupon Usage Limit Bypass
  const triggerBug3_CouponReuseBypass = async (couponId = 'coup-001') => {
    const res = await fetch(`/api/coupons/${couponId}/apply`, {
      method: 'POST'
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE034-BUG-003 / SEC-353]',
        `1회 한정 웰컴 쿠폰(${couponId})이 사용 횟수 제한을 초과하여 반복 적용되었습니다. (누적 적용: ${data.data.usedCount}회)`,
        'warning',
        'site034-bug03'
      );
    }
  };

  // 4. SEC-354: Client-Controlled Order Total Amount
  const triggerBug4_ClientManipulatedPriceOrder = async () => {
    const payload = {
      items: [
        { productId: 'prod-001', quantity: 1 }, // 38,000
        { productId: 'prod-002', quantity: 1 }  // 9,500 => Total 47,500
      ],
      couponId: 'coup-001',
      totalAmount: 1000 // Client forced 1,000 won
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE034-BUG-004 / SEC-354]',
        `실제 상품 합계(47,500원)와 다른 클라이언트 변조 결제금액(1,000원)으로 주문(${data.data.id})이 최종 결제 완료되었습니다.`,
        'warning',
        'site034-bug04'
      );
    }
  };

  // 5. SEC-355: Pet Resource Ownership Missing
  const triggerBug5_MutateOtherUserPet = async () => {
    // pet-003 belongs to usr-002 (강동원), but logged in as usr-001 (이지은)
    const targetPetId = 'pet-003';
    const res = await fetch(`/api/pets/${targetPetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: '소유권 검증 없이 타 사용자에 의해 건강 특이사항이 갱신되었습니다.'
      })
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE034-BUG-005 / SEC-355]',
        `타 사용자(usr-002) 소유의 반려동물(${targetPetId}, 뭉치) 정보가 소유권 검증 없이 임의 수정되었습니다.`,
        'warning',
        'site034-bug05'
      );
    }
  };

  const handleAddToCart = async (prod) => {
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: prod.id, quantity: 1 })
    });
    const data = await res.json();
    if (data.success) {
      fetchData();
      showToast('장바구니 담기 완료', `[${prod.name}] 상품을 장바구니에 담았습니다.`, 'success');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.2rem', color: t.bugId ? 'var(--color-primary-dark)' : 'inherit' }}>
                {t.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {t.message}
              </div>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="header-nav">
        <div className="nav-left">
          <div className="brand-logo" onClick={() => setActiveTab('home')}>
            <span>🐾</span>
            <span>PawMate</span>
            <span className="brand-badge">Pet Care & Mall</span>
          </div>

          <div className="region-selector">
            <MapPin size={15} color="var(--color-primary-dark)" />
            <select defaultValue="서울/강남·서초">
              <option value="서울/강남·서초">서울 강남·서초 권역</option>
              <option value="서울/송파·잠실">서울 송파·잠실 권역</option>
              <option value="경기/분당·판교">경기 분당·판교 권역</option>
            </select>
          </div>
        </div>

        <div className="nav-center">
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="산책 돌봄, 펫미용, 프리미엄 사료·간식을 검색해보세요..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="nav-right">
          {/* User Switcher Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>계정 전환:</span>
            <select
              value={user?.id || 'usr-001'}
              onChange={e => handleSwitchUser(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="usr-001">이지은 (보호자 / 15,000P)</option>
              <option value="usr-002">강동원 (보호자 / 3,200P)</option>
              <option value="usr-003">박보검 (전문 펫시터)</option>
              <option value="usr-004">한소희 (수석 그루머)</option>
            </select>
          </div>

          <button className="icon-btn" onClick={() => setActiveTab('cart')} title="장바구니">
            <ShoppingBag size={20} />
            {cart.length > 0 && <span className="badge-count">{cart.length}</span>}
          </button>

          <button className="user-profile-btn" onClick={() => setActiveTab('mypage')}>
            <div className="avatar-circle">
              {user?.name ? user.name[0] : 'P'}
            </div>
            <div className="user-meta-info">
              <span className="user-meta-name">{user?.name || '로그인'}</span>
              <span className="user-meta-points">{points?.toLocaleString()} P</span>
            </div>
          </button>
        </div>
      </header>

      {/* Sub Navigation Bar */}
      <nav className="subnav-bar">
        {[
          { id: 'home', label: '홈' },
          { id: 'services', label: '돌봄 서비스' },
          { id: 'bookings', label: '예약 관리' },
          { id: 'pets', label: '반려동물 관리' },
          { id: 'market', label: '용품 마켓' },
          { id: 'orders', label: '주문 내역' },
          { id: 'coupons', label: '쿠폰 및 포인트' },
          { id: 'community', label: '커뮤니티' },
          { id: 'mypage', label: '마이페이지' }
        ].map(item => (
          <div
            key={item.id}
            className={`subnav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Main Content Body */}
      <main className="main-wrapper">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-tag">
                <Sparkles size={14} /> 1:1 맞춤형 검증된 전문 펫시터 케어
              </div>
              <h1 className="hero-title">
                소중한 우리 아이를 위한<br />
                가장 따뜻하고 안심되는 돌봄
              </h1>
              <p className="hero-desc">
                전문 자격을 갖춘 펫시터의 맞춤 산책, 홈 방문 돌봄, 프리미엄 탄산 스파 가위컷부터 영양 가득한 수제 용품까지 PawMate에서 한 번에 만나보세요.
              </p>
              <div className="hero-actions">
                <button className="btn-accent" onClick={() => setActiveTab('services')}>
                  돌봄 서비스 예약하기 <ArrowRight size={16} />
                </button>
                <button
                  className="btn-outline"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setActiveTab('market')}
                >
                  반려용품 마켓 둘러보기
                </button>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>예정된 예약 일정</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {bookings.filter(b => b.status === 'confirmed').length}건 확정됨
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                  <Dog size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>등록된 반려동물</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {pets.length}마리 케어 중
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>보유 케어 포인트</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                    {points?.toLocaleString()} P
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Services */}
            <div className="section-header">
              <div>
                <h2 className="section-title">✨ 인기 추천 돌봄 서비스</h2>
                <p className="section-subtitle">후기 평점 4.9 이상의 검증된 전문 매니저님들의 대표 케어 프로그램입니다.</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setActiveTab('services')}>
                서비스 전체보기 <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid-4" style={{ marginBottom: '3rem' }}>
              {services.map(srv => (
                <div key={srv.id} className="service-card">
                  <div className="service-img-wrapper">
                    <img src={srv.image} alt={srv.title} className="service-img" />
                    <span className="service-badge">
                      {srv.type === 'walk' ? '안심 산책' : srv.type === 'grooming' ? '미용 스파' : srv.type === 'visit-care' ? '홈 방문' : '호텔링'}
                    </span>
                  </div>
                  <div className="service-body">
                    <div className="service-provider-name">{srv.region}</div>
                    <h3 className="service-title">{srv.title}</h3>
                    <p className="service-desc">{srv.description}</p>
                    <div className="service-footer">
                      <div className="service-price">{srv.price.toLocaleString()}원</div>
                      <button className="btn-primary btn-sm" onClick={() => setActiveTab('bookings')}>
                        예약하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Providers */}
            <div className="section-header">
              <div>
                <h2 className="section-title">🏅 이달의 우수 돌봄 파트너</h2>
                <p className="section-subtitle">반려동물 케어 전문 자격증을 보유하고 세심한 일지를 제공하는 매니저님들입니다.</p>
              </div>
            </div>

            <div className="grid-2">
              {providers.map(prov => (
                <div key={prov.id} className="pet-card">
                  <img src={prov.image} alt={prov.name} className="pet-avatar" style={{ borderRadius: 'var(--radius-md)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{prov.name}</h3>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Star size={14} fill="currentColor" /> {prov.rating} ({prov.reviewCount})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-primary-dark)', fontWeight: 600, marginBottom: '0.3rem' }}>
                      {prov.region} | 가능 요일: {prov.availableDays}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{prov.introduction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SERVICES & DOUBLE BOOKING (SEC-351) */}
        {activeTab === 'services' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🐕 반려동물 돌봄 서비스</h2>
                <p className="section-subtitle">원하는 날짜와 시간대에 맞춘 1:1 전담 케어 서비스를 예약해보세요.</p>
              </div>
            </div>

            <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
              {services.map(srv => (
                <div key={srv.id} className="service-card">
                  <div className="service-img-wrapper">
                    <img src={srv.image} alt={srv.title} className="service-img" />
                    <span className="service-badge">{srv.region}</span>
                  </div>
                  <div className="service-body">
                    <h3 className="service-title">{srv.title}</h3>
                    <p className="service-desc">{srv.description}</p>
                    <div className="service-footer">
                      <div className="service-price">{srv.price.toLocaleString()}원</div>
                      {/* BUG 1 Button: Double booking trigger */}
                      <button
                        className="btn-accent btn-sm"
                        title="동일 시간대 즉시 예약하기"
                        onClick={triggerBug1_DoubleBooking}
                      >
                        동일 시간대 즉시 예약하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS & REFUND BUG (SEC-352) */}
        {activeTab === 'bookings' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">📅 나의 돌봄 예약 일정</h2>
                <p className="section-subtitle">확정된 예약과 지난 돌봄 이력을 확인하고 관리할 수 있습니다.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {bookings.map(bk => (
                <div
                  key={bk.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      예약번호: <strong>{bk.id}</strong> | 예약일자: <strong>{bk.date} ({bk.startTime} ~ {bk.endTime})</strong>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        background: bk.status === 'confirmed' ? 'var(--color-primary-light)' : bk.status === 'completed' ? '#dcfce7' : '#fee2e2',
                        color: bk.status === 'confirmed' ? 'var(--color-primary-dark)' : bk.status === 'completed' ? '#166534' : '#b91c1c'
                      }}
                    >
                      {bk.status === 'confirmed' ? '예약 확정' : bk.status === 'completed' ? '돌봄 완료' : bk.status === 'refunded' ? '환불 완료' : '예약 취소'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        {bk.service?.title || '맞춤 돌봄 케어 서비스'}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        담당 매니저: <strong>{bk.provider?.name || '박보검 매니저'}</strong> | 대상 반려동물: <strong>{bk.pet?.name || '초코'}</strong>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-text-main)' }}>
                        결제 금액: {bk.price.toLocaleString()}원
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* BUG 2 Action: Duplicate Refund on Cancelled Booking */}
                      {(bk.status === 'cancelled' || bk.status === 'refunded') && (
                        <button
                          className="btn-accent btn-sm"
                          title="취소 예약 포인트 환불 접수"
                          onClick={() => triggerBug2_DuplicateRefund(bk.id)}
                        >
                          취소 예약 포인트 환불 접수
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PETS & OWNERSHIP BUG (SEC-355) */}
        {activeTab === 'pets' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🐶 반려동물 프로필 관리</h2>
                <p className="section-subtitle">우리아이의 품종, 연령, 건강상태 및 돌봄 요청 특이사항입니다.</p>
              </div>
              <button
                className="btn-primary btn-sm"
                onClick={async () => {
                  const name = prompt('반려동물 이름을 입력하세요:', '뽀삐');
                  if (name) {
                    await fetch('/api/pets', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, species: '강아지', breed: '말티즈', age: 2, weight: 3.2 })
                    });
                    fetchData();
                    showToast('반려동물 등록 완료', `[${name}]이(가) 등록되었습니다.`, 'success');
                  }
                }}
              >
                <Plus size={16} /> 신규 반려동물 등록
              </button>
            </div>

            <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
              {pets.map(pet => (
                <div key={pet.id} className="pet-card">
                  <img src={pet.image} alt={pet.name} className="pet-avatar" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{pet.name}</h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                        {pet.breed}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                      {pet.species} | {pet.age}살 | {pet.weight}kg | {pet.gender}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                      {pet.notes}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                      접종 상태: {pet.vaccinationStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BUG 5 Action Banner: Mutate Other User's Pet */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>📋 타 보호자 제휴 반려동물(뭉치, pet-003) 건강 차트 동기화</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  다른 보호자(강동원 고객님, usr-002)의 반려동물 건강 프로필 메모를 안전하게 갱신합니다.
                </p>
              </div>
              <button className="btn-outline btn-sm" onClick={triggerBug5_MutateOtherUserPet}>
                반려동물 건강 프로필 갱신
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: MARKET & ORDERS & PRICE BUG (SEC-354) */}
        {activeTab === 'market' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🛍️ 프리미엄 반려동물 용품 마켓</h2>
                <p className="section-subtitle">수의사와 훈련사가 엄선한 고품질 사료, 영양 간식 및 안심 용품입니다.</p>
              </div>
            </div>

            <div className="tab-list">
              {['전체', '사료', '간식', '장난감', '하우스', '위생용품'].map(cat => (
                <button
                  key={cat}
                  className={`tab-btn ${selectedProductCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedProductCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
              {products
                .filter(p => selectedProductCategory === '전체' || p.category === selectedProductCategory)
                .map(prod => (
                  <div key={prod.id} className="service-card">
                    <div className="service-img-wrapper">
                      <img src={prod.image} alt={prod.name} className="service-img" />
                      <span className="service-badge">{prod.category}</span>
                    </div>
                    <div className="service-body">
                      <h3 className="service-title">{prod.name}</h3>
                      <p className="service-desc">{prod.description}</p>
                      <div className="service-footer">
                        <div className="service-price">{prod.price.toLocaleString()}원</div>
                        <button className="btn-primary btn-sm" onClick={() => handleAddToCart(prod)}>
                          담기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 6: CART & CLIENT-CONTROLLED PRICE (SEC-354) */}
        {activeTab === 'cart' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🛒 장바구니 및 주문 결제</h2>
                <p className="section-subtitle">선택하신 용품을 확인하고 할인 혜택을 적용해보세요.</p>
              </div>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <ShoppingBag size={48} color="var(--color-text-light)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>장바구니가 비어 있습니다.</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>아이를 위한 프리미엄 용품을 담아보세요.</p>
                <button className="btn-primary" onClick={() => setActiveTab('market')}>용품 마켓 가기</button>
              </div>
            ) : (
              <div className="grid-3">
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map(item => (
                    <div
                      key={item.id}
                      style={{
                        background: '#fff',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{item.product?.name}</h4>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            {item.product?.price?.toLocaleString()}원 / 수량: {item.quantity}개
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await fetch(`/api/cart/items/${item.id}`, { method: 'DELETE' });
                          fetchData();
                        }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary Panel */}
                <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.5rem' }}>
                    주문 결제 금액
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span>상품 합계</span>
                    <span>{cart.reduce((s, i) => s + ((i.product?.price || 0) * i.quantity), 0).toLocaleString()}원</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                    <span>배송비</span>
                    <span style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>무료</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* BUG 4 Action Button: Client-controlled price 1,000 KRW */}
                    <button
                      className="btn-accent"
                      style={{ width: '100%' }}
                      onClick={triggerBug4_ClientManipulatedPriceOrder}
                    >
                      회원 특별 우대 결제 (1,000원 결제)
                    </button>

                    <button
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={async () => {
                        const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity }));
                        const res = await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items })
                        });
                        const data = await res.json();
                        if (data.success) {
                          await fetch('/api/cart', { method: 'DELETE' });
                          fetchData();
                          showToast('주문 완료', '주문이 성공적으로 완료되었습니다.', 'success');
                          setActiveTab('orders');
                        }
                      }}
                    >
                      일반 결제하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: COUPONS & LIMIT BUG (SEC-353) */}
        {activeTab === 'coupons' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🎟️ 보유 쿠폰 및 리워드 포인트</h2>
                <p className="section-subtitle">돌봄 예약과 용품 구매에 바로 사용 가능한 혜택입니다.</p>
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
              {coupons.map(coup => (
                <div
                  key={coup.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                      {coup.code}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      누적 사용: <strong>{coup.usedCount}회</strong>
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem' }}>{coup.name}</h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
                    {coup.type === 'fixed' ? `${coup.discountValue.toLocaleString()}원 할인` : `${coup.discountValue}% 할인`}
                  </div>

                  {/* BUG 3 Action Button: Coupon reuse limit bypass */}
                  <button
                    className="btn-outline btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => triggerBug3_CouponReuseBypass(coup.id)}
                  >
                    VIP 웰컴 할인 쿠폰 적용 (반복 적용)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">📦 용품 주문 내역</h2>
                <p className="section-subtitle">구매하신 프리미엄 펫 용품 배송 현황입니다.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {orders.map(ord => (
                <div
                  key={ord.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>주문번호: <strong>{ord.id}</strong> | {new Date(ord.createdAt).toLocaleDateString()}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary-dark)', background: 'var(--color-primary-light)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                      결제완료
                    </span>
                  </div>

                  {ord.items.map((it, idx) => (
                    <div key={idx} style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                      {it.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>({it.quantity}개)</span>
                    </div>
                  ))}
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '0.5rem' }}>
                    최종 결제 금액: <span style={{ color: 'var(--color-accent)' }}>{ord.totalAmount?.toLocaleString()}원</span> (상품 정가: {ord.subtotal?.toLocaleString()}원)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: COMMUNITY */}
        {activeTab === 'community' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">💬 댕냥이 커뮤니티 & 돌봄 일지</h2>
                <p className="section-subtitle">보호자님들의 사랑스러운 일상과 케어 매니저님들의 꿀팁을 확인해보세요.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {posts.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary-dark)', background: 'var(--color-primary-light)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                      {p.category}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.authorName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{p.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: MY PAGE */}
        {activeTab === 'mypage' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">👤 마이페이지</h2>
                <p className="section-subtitle">내 계정 정보 및 반려동물 돌봄 내역 관리</p>
              </div>
            </div>

            <div className="grid-3">
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  {user?.name ? user.name[0] : 'P'}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{user?.email}</div>
                <div style={{ display: 'inline-block', background: 'var(--color-surface)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  역할: {user?.role} | 지역: {user?.region}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>서비스 이용 요약</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('bookings')}>
                    <span>나의 돌봄 예약 일정 ({bookings.length}건)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('pets')}>
                    <span>등록된 반려동물 ({pets.length}마리)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('orders')}>
                    <span>용품 주문 내역 ({orders.length}건)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('coupons')}>
                    <span>보유 포인트 ({points?.toLocaleString()}P)</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
