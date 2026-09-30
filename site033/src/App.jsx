import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sprout,
  Heart,
  Truck,
  RotateCcw,
  Star,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Search,
  User,
  Users,
  MessageSquare,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [points, setPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // UI states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Load initial data
  const fetchData = async () => {
    try {
      const [uRes, fRes, pRes, cRes, sRes, oRes, aRes, ptRes, postRes, revRes] = await Promise.all([
        fetch('/api/auth/me').then(r => r.json()),
        fetch('/api/farmers').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/cart').then(r => r.json()),
        fetch('/api/subscriptions').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/addresses').then(r => r.json()),
        fetch('/api/points/balance').then(r => r.json()),
        fetch('/api/community/posts').then(r => r.json()),
        fetch('/api/reviews').then(r => r.json())
      ]);

      if (uRes.success) setUser(uRes.data);
      if (fRes.success) setFarmers(fRes.data);
      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) setCart(cRes.data);
      if (sRes.success) setSubscriptions(sRes.data);
      if (oRes.success) setOrders(oRes.data);
      if (aRes.success) setAddresses(aRes.data);
      if (ptRes.success) setPoints(ptRes.data.points);
      if (postRes.success) setPosts(postRes.data);
      if (revRes.success) setReviews(revRes.data);
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
      showToast('사용자 전환 완료', `${data.data.name} (${data.data.role}) 계정으로 전환되었습니다.`, 'success');
    }
  };

  // 1. SEC-331: Concurrent race condition inventory deduction
  const triggerBug1_ConcurrentOrder = async (prod) => {
    showToast(
      '즉시 주문 요청 전송',
      `잔여 재고가 1개인 [${prod.name}] 상품에 대해 2건 동시 주문 결제를 전송합니다.`,
      'info'
    );

    // Send 2 concurrent order requests for 1 quantity each
    const orderPayload = {
      items: [{ productId: prod.id, quantity: 1 }],
      usedPoints: 0,
      addressId: addresses[0]?.id || 'addr-001'
    };

    const [res1, res2] = await Promise.all([
      fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) }).then(r => r.json()),
      fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) }).then(r => r.json())
    ]);

    fetchData();

    if (res1.success && res2.success) {
      showToast(
        '[Bug ID: SITE033-BUG-001 / SEC-331]',
        `초기 재고 1개 상품에 대해 2건의 주문(${res1.data.id}, ${res2.data.id})이 모두 성공하여 재고가 음수로 초과 차감되었습니다.`,
        'warning',
        'site033-bug01'
      );
    }
  };

  // 2. SEC-332: Cart quantity bypass & order
  const triggerBug2_CartQtyBypass = async (cartItem) => {
    const res = await fetch(`/api/cart/items/${cartItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 99 })
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE033-BUG-002 / SEC-332]',
        `장바구니 수량을 99개로 증량하였습니다. 실제 재고(1개) 상한을 초과하여 장바구니에 반영되었습니다.`,
        'warning',
        'site033-bug02'
      );
    }
  };

  // 3. SEC-333: Resume cancelled subscription
  const triggerBug3_ResumeCancelledSub = async (sub) => {
    const res = await fetch(`/api/subscriptions/${sub.id}/resume`, {
      method: 'POST'
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE033-BUG-003 / SEC-333]',
        `해지(cancelled) 상태였던 구독(${sub.id})이 상태 검증 없이 정상 active 상태로 즉시 강제 재개되었습니다.`,
        'warning',
        'site033-bug03'
      );
    }
  };

  // 4. SEC-334: Create shipment for cancelled subscription
  const triggerBug4_ShipmentForCancelled = async (sub) => {
    const res = await fetch(`/api/subscriptions/${sub.id}/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledDate: '2026-04-15' })
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE033-BUG-004 / SEC-334]',
        `해지된 구독(${sub.id})에 대해 새로운 회차 배송(${data.data.id})이 정상 발송 접수되었습니다.`,
        'warning',
        'site033-bug04'
      );
    }
  };

  // 5. SEC-335: Point balance overdraft on order
  const triggerBug5_PointOverdraftOrder = async () => {
    const payload = {
      items: [{ productId: products[0]?.id || 'prod-001', quantity: 1 }],
      usedPoints: 50000, // User balance is only ~4500
      addressId: addresses[0]?.id || 'addr-001'
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
        '[Bug ID: SITE033-BUG-005 / SEC-335]',
        `보유 포인트(${points}P)를 초과한 50,000P 결제 차감이 승인되어 포인트 잔액이 마이너스로 갱신되었습니다.`,
        'warning',
        'site033-bug05'
      );
    }
  };

  // 6. SEC-336: Duplicate point redemption
  const triggerBug6_DuplicatePointRedeem = async () => {
    const reqPayload = {
      amount: 1000,
      reason: '로컬푸드 친환경 장바구니 할인 쿠폰 교환',
      redemptionId: 'coupon-req-duplicate-992'
    };

    // Send twice with identical redemptionId
    const [res1, res2] = await Promise.all([
      fetch('/api/points/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqPayload) }).then(r => r.json()),
      fetch('/api/points/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqPayload) }).then(r => r.json())
    ]);

    fetchData();

    if (res1.success && res2.success) {
      showToast(
        '[Bug ID: SITE033-BUG-006 / SEC-336]',
        `동일한 redemptionId로 포인트 차감 요청이 2회 중복 승인되어 총 2,000P가 이중 차감되었습니다.`,
        'warning',
        'site033-bug06'
      );
    }
  };

  // 7. SEC-337: Mutate other user's delivery address
  const triggerBug7_MutateOtherUserAddress = async () => {
    // addr-003 belongs to usr-002 (박민우), but current user is usr-001 (김지현)
    const targetAddrId = 'addr-003';
    const res = await fetch(`/api/addresses/${targetAddrId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: '김지현(수정대행)',
        detailAddress: '소유권 검증 없이 임의 수정된 배송지'
      })
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE033-BUG-007 / SEC-337]',
        `타 사용자(usr-002)의 배송지(${targetAddrId})가 소유권 검증 없이 성공적으로 수정되었습니다.`,
        'warning',
        'site033-bug07'
      );
    }
  };

  // 8. SEC-338: Multiple default address bug
  const triggerBug8_MultipleDefaultAddress = async () => {
    // Set addr-002 as default without clearing addr-001
    const res = await fetch('/api/addresses/addr-002/set-default', {
      method: 'POST'
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE033-BUG-008 / SEC-338]',
        `회사 배송지(addr-002)를 기본 배송지로 지정 완료! 기존 기본 배송지(addr-001)와 함께 2개의 주소가 기본 배송지로 동시 유지됩니다.`,
        'warning',
        'site033-bug08'
      );
    }
  };

  // 9. SEC-339: Review unpurchased product
  const triggerBug9_ReviewUnpurchased = async (prodId = 'prod-009') => {
    const res = await fetch(`/api/products/${prodId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        content: '구매하지 않았지만 로컬 푸드 매니아로서 산지 직송 맛을 보증합니다!'
      })
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE033-BUG-009 / SEC-339]',
        `미구매 상품(${prodId})에 대한 5점 리뷰가 성공적으로 등록되고 리워드 포인트가 적립되었습니다.`,
        'warning',
        'site033-bug09'
      );
    }
  };

  // 10. SEC-340: Duplicate review on same order
  const triggerBug10_DuplicateReview = async () => {
    const res = await fetch('/api/products/prod-001/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'ord-1001',
        rating: 5,
        content: '동일 주문 건에 대해 작성한 두 번째 추가 리뷰입니다!'
      })
    });
    const data = await res.json();
    fetchData();

    if (data.success) {
      showToast(
        '[Bug ID: SITE033-BUG-010 / SEC-340]',
        `이미 리뷰를 작성했던 동일 주문(ord-1001)에 대해 중복 리뷰(${data.data.id})가 제한 없이 추가 등록되었습니다.`,
        'warning',
        'site033-bug10'
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
      showToast('장바구니 담기 완료', `[${prod.name}]을 장바구니에 담았습니다.`, 'success');
    }
  };

  const filteredProducts = products.filter(p => {
    const catMatch = selectedCategory === '전체' || p.category === selectedCategory;
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.2rem', color: t.bugId ? 'var(--color-primary)' : 'inherit' }}>
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

      {/* Top Header */}
      <header className="header-nav">
        <div className="nav-left">
          <div className="brand-logo" onClick={() => setActiveTab('home')}>
            <span style={{ fontSize: '1.6rem' }}>🥬</span>
            <span>TableLoop</span>
            <span className="brand-badge">Local Food & Sub</span>
          </div>

          <div className="region-selector">
            <MapPin size={15} color="var(--color-primary)" />
            <select defaultValue="양평/경기">
              <option value="양평/경기">경기 양평 권역</option>
              <option value="논산/충남">충남 논산 권역</option>
              <option value="평창/강원">강원 평창 권역</option>
              <option value="서귀포/제주">제주 서귀포 권역</option>
            </select>
          </div>
        </div>

        <div className="nav-center">
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="제철 유기농 채소, 과일, 농가명을 검색해보세요..."
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
              <option value="usr-001">김지현 (고객 / 4,500P)</option>
              <option value="usr-002">박민우 (고객 / 1,200P)</option>
              <option value="usr-003">이도훈 (햇살농원 대표)</option>
              <option value="usr-005">최준혁 (모더레이터)</option>
            </select>
          </div>

          <button className="icon-btn" onClick={() => setActiveTab('cart')} title="장바구니">
            <ShoppingBag size={20} />
            {cart.length > 0 && <span className="badge-count">{cart.length}</span>}
          </button>

          <button className="user-profile-btn" onClick={() => setActiveTab('mypage')}>
            <div className="avatar-circle">
              {user?.name ? user.name[0] : 'U'}
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
          { id: 'home', label: '홈', icon: Sprout },
          { id: 'farmers', label: '지역 농가', icon: Users },
          { id: 'market', label: '식재료 마켓', icon: ShoppingBag },
          { id: 'subscriptions', label: '정기 구독', icon: RotateCcw },
          { id: 'orders', label: '주문 내역', icon: CheckCircle2 },
          { id: 'addresses', label: '배송지 관리', icon: Truck },
          { id: 'community', label: '커뮤니티 & 레시피', icon: BookOpen },
          { id: 'points', label: '포인트 & 리워드', icon: Award },
          { id: 'mypage', label: '마이페이지', icon: User }
        ].map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`subnav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Main Content Body */}
      <main className="main-wrapper">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-tag">
                <Sparkles size={14} /> 당일 수확 산지직송 정기배송
              </div>
              <h1 className="hero-title">
                우리 식탁으로 찾아오는<br />
                건강한 로컬 유기농 라이프
              </h1>
              <p className="hero-desc">
                매주 새벽 논산, 나주, 평창 농가에서 갓 수확한 싱싱한 제철 채소와 수제 식재료를 식탁에 올려보세요. 정기구독 시 10% 추가 할인 혜택을 드립니다.
              </p>
              <div className="hero-actions">
                <button className="btn-accent" onClick={() => setActiveTab('subscriptions')}>
                  정기 구독 박스 신청하기 <ArrowRight size={16} />
                </button>
                <button className="btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }} onClick={() => setActiveTab('market')}>
                  제철 식재료 둘러보기
                </button>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <RotateCcw size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>진행 중인 정기 구독</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {subscriptions.filter(s => s.status === 'active').length}개 구독 중
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>보유 친환경 포인트</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                    {points?.toLocaleString()} P
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
                  <Truck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>기본 배송지</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    {addresses.find(a => a.isDefault)?.address || '배송지 등록 필요'}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Seasonal Products */}
            <div className="section-header">
              <div>
                <h2 className="section-title">🌱 이번 주 인기 제철 식재료</h2>
                <p className="section-subtitle">지역 농가에서 당일 수확하여 포장하는 베스트 상품들입니다.</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setActiveTab('market')}>
                전체보기 <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid-4" style={{ marginBottom: '3rem' }}>
              {products.slice(0, 4).map(prod => (
                <div key={prod.id} className="product-card">
                  <div className="product-img-wrapper">
                    <img src={prod.image} alt={prod.name} className="product-img" />
                    <span className="product-tag">{prod.category}</span>
                    {prod.stock <= 3 && (
                      <span className="stock-tag">
                        {prod.stock === 0 ? '품절' : `마감 임박 (${prod.stock}개)`}
                      </span>
                    )}
                  </div>
                  <div className="product-body">
                    <div className="product-farm">{prod.region}</div>
                    <h3 className="product-title">{prod.name}</h3>
                    <p className="product-desc">{prod.description}</p>
                    <div className="product-rating">
                      <Star size={14} fill="currentColor" /> {prod.rating} ({prod.reviewCount})
                    </div>
                    <div className="product-footer">
                      <div>
                        <div className="product-price">{prod.price.toLocaleString()}원</div>
                        <div className="product-unit">기준: {prod.unit}</div>
                      </div>
                      <button className="btn-primary btn-sm" onClick={() => handleAddToCart(prod)}>
                        담기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Partner Farmers */}
            <div className="section-header">
              <div>
                <h2 className="section-title">👨‍🌾 믿을 수 있는 지역 농가 파트너</h2>
                <p className="section-subtitle">화학 비료와 제초제 없이 친환경 농법으로 흙을 일구는 농부님들을 소개합니다.</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setActiveTab('farmers')}>
                농가 전체보기 <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid-2">
              {farmers.slice(0, 4).map(farm => (
                <div key={farm.id} className="farm-card">
                  <img src={farm.image} alt={farm.name} className="farm-avatar" />
                  <div className="farm-info">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 className="farm-name">{farm.name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Star size={14} fill="currentColor" /> {farm.rating}
                      </span>
                    </div>
                    <div className="farm-region">{farm.region}</div>
                    <div className="farm-specialty">주요 생산: {farm.specialty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FARMERS */}
        {activeTab === 'farmers' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🌾 전국 로컬 농가 파트너</h2>
                <p className="section-subtitle">투명한 생산 과정과 정직한 땀방울로 길러낸 전국 우수 농원입니다.</p>
              </div>
            </div>

            <div className="grid-2">
              {farmers.map(farm => (
                <div key={farm.id} className="farm-card" style={{ padding: '1.5rem' }}>
                  <img src={farm.image} alt={farm.name} className="farm-avatar" style={{ width: 90, height: 90 }} />
                  <div className="farm-info">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <h3 className="farm-name" style={{ fontSize: '1.15rem' }}>{farm.name}</h3>
                      <button
                        onClick={async () => {
                          const url = `/api/farmers/${farm.id}/favorite`;
                          const method = farm.isFavorite ? 'DELETE' : 'POST';
                          await fetch(url, { method });
                          fetchData();
                          showToast(farm.isFavorite ? '관심 농가 해제' : '관심 농가 등록', `[${farm.name}]이(가) 관심 농가에 반영되었습니다.`, 'success');
                        }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: farm.isFavorite ? 'var(--color-danger)' : 'var(--color-text-light)' }}
                      >
                        <Heart size={20} fill={farm.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="farm-region" style={{ marginBottom: '0.4rem' }}>{farm.region}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      {farm.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        특산물: {farm.specialty}
                      </span>
                      <button className="btn-outline btn-sm" onClick={() => { setSelectedCategory('전체'); setActiveTab('market'); }}>
                        재배 상품 보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MARKET */}
        {activeTab === 'market' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🛒 친환경 식재료 마켓</h2>
                <p className="section-subtitle">산지에서 직접 배송되는 가장 신선한 식재료를 만나보세요.</p>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="tab-list">
              {['전체', '채소', '과일', '유제품', '제철 식재료', '수제 식품', '가공 식품'].map(cat => (
                <button
                  key={cat}
                  className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid-4">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="product-card">
                  <div className="product-img-wrapper">
                    <img src={prod.image} alt={prod.name} className="product-img" />
                    <span className="product-tag">{prod.category}</span>
                    {prod.stock <= 3 && (
                      <span className="stock-tag">
                        {prod.stock === 0 ? '품절' : `마감 임박 (${prod.stock}개)`}
                      </span>
                    )}
                  </div>
                  <div className="product-body">
                    <div className="product-farm">{prod.region}</div>
                    <h3 className="product-title">{prod.name}</h3>
                    <p className="product-desc">{prod.description}</p>
                    <div className="product-rating">
                      <Star size={14} fill="currentColor" /> {prod.rating} ({prod.reviewCount})
                    </div>
                    <div className="product-footer">
                      <div>
                        <div className="product-price">{prod.price.toLocaleString()}원</div>
                        <div className="product-unit">기준: {prod.unit}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {/* BUG 1 Action Button: Concurrent Order on low stock */}
                        {prod.stock === 1 && (
                          <button
                            className="btn-accent btn-sm"
                            title="재고 1개 한정 즉시 주문 (동시 결제)"
                            onClick={() => triggerBug1_ConcurrentOrder(prod)}
                          >
                            즉시 주문
                          </button>
                        )}
                        <button className="btn-primary btn-sm" onClick={() => handleAddToCart(prod)}>
                          담기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Review Unpurchased Bug Trigger Banner (SEC-339) */}
            <div style={{ marginTop: '2.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)' }}>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>📝 로컬 식재료 체험단 상품 리뷰 작성</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  아직 구매하지 않은 추천 식재료(해남 3년 숙성 된장)에 대한 체험 리뷰를 작성하고 500P를 적립받으세요.
                </p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => triggerBug9_ReviewUnpurchased('prod-009')}>
                식재료 리뷰 등록
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🔄 정기 구독 관리</h2>
                <p className="section-subtitle">원하는 주기로 매주 신선한 유기농 식재료를 식탁으로 받아보세요.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {subscriptions.map(sub => {
                const prod = products.find(p => p.id === sub.productId);
                return (
                  <div
                    key={sub.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <img
                        src={prod?.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'}
                        alt={prod?.name}
                        style={{ width: 70, height: 70, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{prod?.name || '정기구독 상품'}</h3>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              background: sub.status === 'active' ? 'var(--color-sage-light)' : sub.status === 'paused' ? '#fef3c7' : '#fee2e2',
                              color: sub.status === 'active' ? 'var(--color-primary)' : sub.status === 'paused' ? '#b45309' : '#b91c1c'
                            }}
                          >
                            {sub.status === 'active' ? '구독 중 (Active)' : sub.status === 'paused' ? '일시 정지 (Paused)' : '구독 해지 (Cancelled)'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1.25rem' }}>
                          <span>구독 주기: <strong>{sub.cycle === 'weekly' ? '매주 1회' : sub.cycle === 'biweekly' ? '격주 1회' : '월 1회'}</strong></span>
                          <span>다음 결제 예정: <strong>{sub.nextBillingDate}</strong></span>
                          <span>다음 배송 예정: <strong>{sub.nextShipmentDate}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* Normal Pause / Cancel Actions */}
                      {sub.status === 'active' && (
                        <>
                          <button
                            className="btn-outline btn-sm"
                            onClick={async () => {
                              await fetch(`/api/subscriptions/${sub.id}/pause`, { method: 'POST' });
                              fetchData();
                              showToast('구독 일시정지', '구독이 정상적으로 일시정지되었습니다.', 'info');
                            }}
                          >
                            일시정지
                          </button>
                          <button
                            className="btn-outline btn-sm"
                            style={{ color: 'var(--color-danger)', borderColor: '#fca5a5' }}
                            onClick={async () => {
                              await fetch(`/api/subscriptions/${sub.id}/cancel`, { method: 'POST' });
                              fetchData();
                              showToast('구독 해지 완료', '정기 구독이 해지되었습니다.', 'info');
                            }}
                          >
                            구독 해지
                          </button>
                        </>
                      )}

                      {/* BUG 3: Resume on cancelled subscription */}
                      {sub.status === 'cancelled' && (
                        <button
                          className="btn-primary btn-sm"
                          title="해지된 구독 즉시 재개"
                          onClick={() => triggerBug3_ResumeCancelledSub(sub)}
                        >
                          구독 즉시 재개
                        </button>
                      )}

                      {/* BUG 4: Shipment generation on cancelled subscription */}
                      {sub.status === 'cancelled' && (
                        <button
                          className="btn-accent btn-sm"
                          title="해지된 구독 건 다음 회차 배송 생성"
                          onClick={() => triggerBug4_ShipmentForCancelled(sub)}
                        >
                          다음 회차 배송 생성
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CART */}
        {activeTab === 'cart' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🛍️ 장바구니</h2>
                <p className="section-subtitle">선택하신 로컬 식재료 목록입니다.</p>
              </div>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <ShoppingBag size={48} color="var(--color-text-light)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>장바구니가 비어 있습니다.</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>신선한 제철 식재료를 장바구니에 담아보세요.</p>
                <button className="btn-primary" onClick={() => setActiveTab('market')}>식재료 마켓 가기</button>
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                            실제 남은 재고: {item.product?.stock}개
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* BUG 2 Action: Bypass cart quantity beyond stock */}
                        <button
                          className="btn-outline btn-sm"
                          title="대량 구매 수량 적용 (99개)"
                          onClick={() => triggerBug2_CartQtyBypass(item)}
                        >
                          수량 99개 적용
                        </button>
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
                    </div>
                  ))}
                </div>

                {/* Cart Summary & Point Overdraft Checkout (SEC-335) */}
                <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.5rem' }}>
                    결제 금액 요약
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span>총 상품금액</span>
                    <span>{cart.reduce((sum, i) => sum + ((i.product?.price || 0) * i.quantity), 0).toLocaleString()}원</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span>배송비</span>
                    <span style={{ color: 'var(--color-primary)' }}>무료배송</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                    <span>보유 포인트</span>
                    <span>{points?.toLocaleString()} P</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* BUG 5 Button: Overdraft 50,000P */}
                    <button
                      className="btn-accent"
                      style={{ width: '100%' }}
                      onClick={triggerBug5_PointOverdraftOrder}
                    >
                      보유 포인트 전액 적용 결제 (50,000P)
                    </button>

                    <button
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={async () => {
                        const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity }));
                        const res = await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items, usedPoints: 0, addressId: addresses[0]?.id })
                        });
                        const data = await res.json();
                        if (data.success) {
                          await fetch('/api/cart', { method: 'DELETE' });
                          fetchData();
                          showToast('주문 완료', '주문이 성공적으로 접수되었습니다.', 'success');
                          setActiveTab('orders');
                        }
                      }}
                    >
                      일반 주문 결제하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">📦 주문 및 배송 내역</h2>
                <p className="section-subtitle">고객님의 친환경 식재료 주문 현황입니다.</p>
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
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>주문번호: <strong>{ord.id}</strong> | {new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-sage-light)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                      {ord.status === 'delivered' ? '배송완료' : ord.status === 'shipped' ? '배송중' : '결제완료'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {ord.items.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                          {it.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>({it.quantity}개)</span>
                        </div>
                      ))}
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                        결제금액: <strong>{ord.finalAmount.toLocaleString()}원</strong> (사용 포인트: {ord.usedPoints?.toLocaleString() || 0}P)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* BUG 10 Button: Duplicate review on same order */}
                      <button
                        className="btn-outline btn-sm"
                        title="동일 주문 건 추가 중복 리뷰 작성"
                        onClick={triggerBug10_DuplicateReview}
                      >
                        구매 리뷰 작성
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ADDRESSES (SEC-337 & SEC-338) */}
        {activeTab === 'addresses' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">📍 배송지 관리</h2>
                <p className="section-subtitle">산지 직송 상품을 안전하게 수령할 배송 주소록입니다.</p>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  style={{
                    background: '#fff',
                    border: addr.isDefault ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontWeight: 800, fontSize: '1.05rem' }}>{addr.recipient}</h4>
                      {addr.isDefault && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--color-sage-light)', color: 'var(--color-primary)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
                          기본 배송지
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{addr.id}</span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{addr.phone}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 600, marginBottom: '0.2rem' }}>{addr.address}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>{addr.detailAddress} ({addr.postalCode})</div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem' }}>
                    {/* BUG 8 Button: Multiple Default Address */}
                    {!addr.isDefault && (
                      <button
                        className="btn-outline btn-sm"
                        onClick={triggerBug8_MultipleDefaultAddress}
                      >
                        기본 배송지로 지정
                      </button>
                    )}
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => showToast('배송지 수정', '배송지 정보 수정 모달이 열립니다.', 'info')}
                    >
                      수정
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BUG 7 Action Banner: Mutate Other User's Address */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>🚚 원격 제휴 배송지 정보 동기화</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  타 사용자(박민우 고객님, addr-003)의 배송지 정보를 안전하게 수정 및 갱신합니다.
                </p>
              </div>
              <button className="btn-accent btn-sm" onClick={triggerBug7_MutateOtherUserAddress}>
                배송지 정보 수정
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: COMMUNITY */}
        {activeTab === 'community' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🌿 파머스 & 레시피 커뮤니티</h2>
                <p className="section-subtitle">지역 농가의 생생한 수확 이야기와 제철 식재료 레시피를 나눠보세요.</p>
              </div>
              <button
                className="btn-primary btn-sm"
                onClick={async () => {
                  const title = prompt('게시글 제목을 입력하세요:', '봄나물 비빔밥 레시피');
                  if (title) {
                    await fetch('/api/community/posts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title, content: '신선한 쌈채소와 참기름으로 완성한 든든한 한 끼입니다.' })
                    });
                    fetchData();
                    showToast('게시글 등록 완료', '커뮤니티에 글이 게시되었습니다.', 'success');
                  }
                }}
              >
                <Plus size={16} /> 새 이야기 쓰기
              </button>
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-sage-light)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                      {p.category}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.authorName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>{p.content}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem' }}>
                    <button
                      onClick={async () => {
                        await fetch(`/api/community/posts/${p.id}/like`, { method: 'POST' });
                        fetchData();
                      }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      <Heart size={16} fill="currentColor" /> {p.likes}
                    </button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MessageSquare size={16} /> {p.commentsCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: POINTS & REWARDS (SEC-336) */}
        {activeTab === 'points' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">🎁 친환경 포인트 & 리워드</h2>
                <p className="section-subtitle">구독 유지와 리뷰 작성으로 적립된 로컬 리워드 포인트입니다.</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', borderRadius: 'var(--radius-md)', padding: '2rem', color: '#fff', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.3rem' }}>현재 보유 포인트</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>{points?.toLocaleString()} <span style={{ fontSize: '1.4rem' }}>P</span></div>
              </div>

              {/* BUG 6 Button: Duplicate Point Redemption */}
              <button className="btn-accent" onClick={triggerBug6_DuplicatePointRedeem}>
                포인트 적립/사용 요청
              </button>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>포인트 변동 내역</h3>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {pointHistory.map(pt => (
                <div
                  key={pt.id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--color-border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{pt.reason}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{new Date(pt.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: pt.amount > 0 ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                      {pt.amount > 0 ? `+${pt.amount.toLocaleString()}` : pt.amount.toLocaleString()} P
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>잔액: {pt.balanceAfter?.toLocaleString()} P</div>
                  </div>
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
                <p className="section-subtitle">내 계정 정보 및 로컬 푸드 활동 관리</p>
              </div>
            </div>

            <div className="grid-3">
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{user?.email}</div>
                <div style={{ display: 'inline-block', background: 'var(--color-surface)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  역할: {user?.role} | 지역: {user?.region}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>빠른 바로가기</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('subscriptions')}>
                    <span>내 정기 구독 현황 ({subscriptions.length}건)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('orders')}>
                    <span>주문 및 배송 내역 ({orders.length}건)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('addresses')}>
                    <span>등록된 배송지 목록 ({addresses.length}건)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setActiveTab('points')}>
                    <span>포인트 내역 확인 ({points?.toLocaleString()}P)</span>
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
