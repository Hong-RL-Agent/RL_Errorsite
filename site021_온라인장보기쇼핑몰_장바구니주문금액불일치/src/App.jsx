import React, { useState, useEffect } from 'react';

export default function App() {
  // DB states
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);

  // Filter/Sort states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [priceSort, setPriceSort] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Order states
  const [cart, setCart] = useState([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState('general-early');
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('서울시 서대문구 신촌로 102');

  // Detail Modal states
  const [activeProductId, setActiveProductId] = useState(null);
  const [detailTab, setDetailTab] = useState('desc'); // 'desc' | 'nutrition'

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCoupons();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      showToast('상품 카탈로그 목록 로드 실패', 'danger');
    }
  };

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      showToast('쿠pons 목록 로드 실패', 'danger');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showToast('최근 주문 내역 로드 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Helper pricing
  const getProductPrice = (p) => {
    if (p.isDiscount) {
      return p.basePrice * (1 - p.discountRate / 100);
    }
    return p.basePrice;
  };

  // Error 1: Fast quantity adjustment mismatch
  const handleQtyChange = (itemId, change) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === itemId) {
        const nextDisplay = Math.max(1, item.displayQty + change);
        let nextCalc = item.calcQty;

        // Count clicks sequence to intercept double clicks
        const nextClicks = item.clicks + 1;

        // INTENTIONAL_ERROR
        // CATEGORY: Frontend
        // DESCRIPTION: 사용자가 수량을 빠르게 두 번 더한 뒤(+) 한 번 마이너스(-)를 누른 시점
        // ( clicks가 3회 이상이고 change가 -1일 때 ), 화면에 표시할 수량(displayQty)은 
        // 1 차감시키지만 결제 금액에 연동할 내부 수량(calcQty)은 차감하지 않고 기존 누적값 그대로 둔 채 불균형을 발생시킵니다.
        if (change === -1 && nextClicks >= 3) {
          nextCalc = item.calcQty; 
        } else {
          nextCalc = nextDisplay;
        }

        return {
          ...item,
          displayQty: nextDisplay,
          calcQty: nextCalc,
          clicks: nextClicks
        };
      }
      return item;
    }));
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      handleQtyChange(product.id, 1);
    } else {
      setCart(prev => [
        ...prev,
        {
          ...product,
          displayQty: 1,
          calcQty: 1,
          clicks: 0
        }
      ]);
    }
    showToast(`${product.name}이 장바구니에 담겼습니다.`, 'success');
  };

  const deleteCartItem = (itemId) => {
    setCart(prev => prev.filter(x => x.id !== itemId));
  };

  // Error 2: Category filter + Discount filter duplication
  const getFilteredProducts = () => {
    let list = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Filter by discount
    if (showDiscountOnly) {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 카테고리와 할인을 순차적으로 변경할 시, 단순 필터링이 아니라 
      // 할인 상품 목록을 기존 리스트 끝에 중복 병합(concat)하여 동일한 상품 카드들이 
      // 그리드상에 2개 이상 겹치도록 중복 버그를 유발합니다.
      const discountList = list.filter(p => p.isDiscount);
      list = [...list, ...discountList];
    }

    // Filter by search query
    if (searchQuery.trim()) {
      list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Price sort
    if (priceSort === 'asc') {
      list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (priceSort === 'desc') {
      list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return list;
  };

  // Cart total calculations
  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + getProductPrice(item) * item.calcQty, 0);
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    let discountVal = 0;
    if (selectedCouponCode) {
      const cop = coupons.find(c => c.code === selectedCouponCode);
      if (cop) discountVal = cop.value;
    }
    return Math.max(0, subtotal - discountVal);
  };

  // Submit Order
  const submitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('장바구니가 비어 있습니다.', 'warning');
      return;
    }

    const payload = {
      items: cart,
      deliveryTime: selectedDeliveryTime,
      couponCode: selectedCouponCode || null,
      totalCost: getCartTotal()
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '주문 등록 에러');
      }

      showToast('새벽배송 주문서가 접수되었습니다.', 'success');
      setCart([]);
      setSelectedCouponCode('');
      loadOrders();
      loadCoupons();
    } catch (err) {
      showToast(`[주문 에러] ${err.message}`, 'danger');
    }
  };

  // Cancel order (triggers coupon cancel bug)
  const handleCancelOrder = async (orderId) => {
    if (!confirm('해당 식료품 주문을 취소하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('주문 예약이 취소되었습니다. (쿠폰 사용 상태 복구 안 됨)', 'success');
        loadOrders();
        loadCoupons();
      }
    } catch (err) {
      showToast('주문 취소 처리 실패', 'danger');
    }
  };

  // Error 5: Trigger 404 for check-v2
  const recheckDelivery = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 배송 가능 여부를 재차 조회할 때, 서버 백엔드 라우터에 
    // 구현되어 있지 않은 API인 '/api/delivery/check-v2'를 호출하여 브라우저 네트워크 404 장애를 발생시킵니다.
    try {
      const res = await fetch('/api/delivery/check-v2');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      showToast(`실시간 배송 가능: ${JSON.stringify(data)}`, 'success');
    } catch (err) {
      showToast(`배송 검증 요청 실패 (404): ${err.message}`, 'danger');
    }
  };

  const activeProduct = products.find(p => p.id === activeProductId);

  return (
    <div className="freshbasket-app">
      {/* Top Banner Search & Address info */}
      <header className="app-navbar">
        <div className="nav-top-row">
          <div className="navbar-logo">
            <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="logo-title">FreshBasket</span>
            <span className="logo-subtitle">새벽을 여는 유기농 직송</span>
          </div>

          <div className="address-locator-box">
            <span className="addr-tag">🚚 배송지</span>
            <span className="addr-text">{deliveryAddress}</span>
            <button className="recheck-addr-btn" onClick={recheckDelivery}>🔄 배송 가능 여부 다시 확인</button>
          </div>
        </div>

        <div className="nav-search-row">
          <div className="search-bar-wrapper">
            <input 
              type="text" 
              placeholder="친환경 당근, 유기농 우유, 동물복지 삼겹살 등 입력..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="workspace-grid">
        
        {/* Left column: food categories */}
        <aside className="panel-section left-categories-sidebar">
          <div className="panel-header">
            <h2>🥬 신선 카테고리</h2>
          </div>
          <div className="category-menu-list">
            {['All', '채소', '과일', '정육/계란', '우유/유제품', '베이커리'].map(cat => (
              <button 
                key={cat}
                className={`category-menu-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? '전체 신선식품' : cat}
              </button>
            ))}
          </div>

          <div className="filter-sort-controls">
            <label className="checkbox-lbl">
              <input 
                type="checkbox" 
                checked={showDiscountOnly}
                onChange={(e) => setShowDiscountOnly(e.target.checked)}
              />
              <span>🔥 마트 특별 행사 할인만 보기</span>
            </label>

            <div className="sort-box">
              <label>가격 정렬:</label>
              <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)} className="sort-select">
                <option value="default">정렬 기준 선택</option>
                <option value="asc">낮은 가격순</option>
                <option value="desc">높은 가격순</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Center column: products grid and delivery time slots */}
        <main className="center-grocery-workspace">
          
          <section className="panel-section products-catalog-section">
            <div className="panel-header">
              <h2>🍎 Fresh 마트 매대</h2>
              <p className="subtitle">오늘 아침 밭에서 수확한 신선 식품 목록입니다.</p>
            </div>

            <div className="products-card-grid">
              {getFilteredProducts().map(prod => (
                <div key={prod.id} className="grocery-product-card">
                  {prod.isDiscount && (
                    <span className="sale-badge">SALE {prod.discountRate}%</span>
                  )}
                  <div className="product-image-box" onClick={() => { setActiveProductId(prod.id); setDetailTab('desc'); }}>
                    <img src={prod.image} alt={prod.name} className="product-img" />
                  </div>
                  <div className="product-info-box">
                    <span className="category-tag">[{prod.category}]</span>
                    <h3 className="name" onClick={() => { setActiveProductId(prod.id); setDetailTab('desc'); }}>{prod.name}</h3>
                    <div className="pricing">
                      {prod.isDiscount ? (
                        <>
                          <span className="strike">{prod.basePrice.toLocaleString()}원</span>
                          <strong className="active-price">{getProductPrice(prod).toLocaleString()}원</strong>
                        </>
                      ) : (
                        <strong className="active-price">{prod.basePrice.toLocaleString()}원</strong>
                      )}
                    </div>
                    <button className="add-cart-btn" onClick={() => addToCart(prod)}>🛒 담기</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Slot Cards */}
          <section className="panel-section delivery-time-slots-section">
            <div className="panel-header">
              <h2>⏰ 새벽 안심 배송 지정 시간</h2>
              <p className="subtitle">배송 시간대에 따라 보존 포장이 다르게 적용됩니다.</p>
            </div>

            <div className="slots-grid-row">
              <div 
                className={`delivery-slot-card ${selectedDeliveryTime === 'general-early' ? 'active' : ''}`}
                onClick={() => setSelectedDeliveryTime('general-early')}
              >
                <div className="time">03:00 - 07:00</div>
                <div className="title">🌅 일반 새벽배송</div>
                <div className="desc">아이팩 포장 상자 발송</div>
              </div>

              <div 
                className={`delivery-slot-card cold-zone ${selectedDeliveryTime === 'cold-slot' ? 'active' : ''}`}
                onClick={() => setSelectedDeliveryTime('cold-slot')}
              >
                <div className="time">05:00 - 08:00</div>
                <div className="title">❄️ 냉장 안심 배송</div>
                <div className="desc">특수 냉매 고속 콜드체인 포장</div>
              </div>

              <div 
                className={`delivery-slot-card ${selectedDeliveryTime === 'general-day' ? 'active' : ''}`}
                onClick={() => setSelectedDeliveryTime('general-day')}
              >
                <div className="time">10:00 - 16:00</div>
                <div className="title">☀️ 일반 주간배송</div>
                <div className="desc">기본 종이 박스 택배 순차 배송</div>
              </div>
            </div>
          </section>

        </main>

        {/* Right column: Quick Cart & Checkout order summaries */}
        <aside className="right-cart-column">
          
          {/* Quick Cart Cabinet */}
          <section className="panel-section quick-cart-panel">
            <div className="panel-header">
              <h2>🛒 장바구니 요약 ({cart.length})</h2>
            </div>

            <div className="cart-items-scroller">
              {cart.map(item => (
                <div key={item.id} className="cart-item-row">
                  <div className="item-head">
                    <span className="title">📦 {item.name}</span>
                    <button className="del-btn" onClick={() => deleteCartItem(item.id)}>&times;</button>
                  </div>
                  <div className="item-details">
                    <div className="qty-mesh">
                      <button className="qty-btn" onClick={() => handleQtyChange(item.id, -1)}>-</button>
                      <span className="qty-val">{item.displayQty}개</span>
                      <button className="qty-btn" onClick={() => handleQtyChange(item.id, 1)}>+</button>
                    </div>
                    <span className="price">{(getProductPrice(item) * item.calcQty).toLocaleString()}원</span>
                  </div>
                  {item.calcQty !== item.displayQty && (
                    <div className="qty-mismatch-badge">
                      ⚠️ 요금 수량 불일치 (총액 연합량: {item.calcQty}개)
                    </div>
                  )}
                </div>
              ))}
              {cart.length === 0 && (
                <div className="empty-placeholder">장바구니가 비어 있습니다.</div>
              )}
            </div>
          </section>

          {/* Checkout billing & coupon panel */}
          <section className="panel-section order-form-card">
            <div className="panel-header">
              <h2>🧾 주문 청구서</h2>
            </div>

            <form onSubmit={submitOrder} className="checkout-form">
              <div className="billing-rows-list">
                <div className="bill-row">
                  <span>선택 배송 방식:</span>
                  <strong>{selectedDeliveryTime === 'cold-slot' ? '❄️ 냉장 안심 배송' : '🌅 일반 배송'}</strong>
                </div>

                {/* Coupon select box */}
                <div className="bill-row coupon-choose">
                  <span>적용 가능 쿠폰:</span>
                  <select 
                    value={selectedCouponCode} 
                    onChange={(e) => setSelectedCouponCode(e.target.value)}
                    className="coupon-select"
                  >
                    <option value="">적용 안 함</option>
                    {coupons.map(c => (
                      <option key={c.code} value={c.code} disabled={c.used}>
                        {c.desc} {c.used ? '(사용완료)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pricing-details">
                  <div className="p-row">
                    <span>식료품 소계:</span>
                    <span>{getCartSubtotal().toLocaleString()}원</span>
                  </div>
                  <div className="p-row">
                    <span>쿠폰 적용 할인액:</span>
                    <span className="discount">- {
                      (coupons.find(c => c.code === selectedCouponCode)?.value || 0).toLocaleString()
                    }원</span>
                  </div>
                  <div className="p-row total">
                    <span>최종 주문 금액:</span>
                    <span className="total-val">{getCartTotal().toLocaleString()}원</span>
                  </div>
                </div>

                <button type="submit" className="submit-order-btn">🚚 새벽배송 예약 주문 전송</button>
              </div>
            </form>
          </section>

          {/* Orders History List */}
          <section className="panel-section my-orders-history-panel">
            <div className="panel-header">
              <h2>📑 최근 주문서 접수 이력</h2>
            </div>
            <div className="orders-history-list">
              {orders.map(o => (
                <div key={o.id} className="history-order-card">
                  <div className="card-head">
                    <span className="id">No. {o.id.slice(-6)}</span>
                    <span className={`status-tag ${o.status}`}>{o.status === 'ready' ? '접수완료' : '주문취소'}</span>
                    {o.status === 'ready' && (
                      <button className="cancel-order-btn" onClick={() => handleCancelOrder(o.id)}>취소</button>
                    )}
                  </div>
                  <div className="card-info">
                    <p>🕒 배송: {o.deliveryTime === 'cold-slot' ? '냉장 배송' : '새벽 배송'}</p>
                    <p>💳 최종가: {o.totalCost.toLocaleString()}원</p>
                    {o.couponCode && (
                      <p className="coupon">사용한 쿠폰: 🎫 {o.couponCode}</p>
                    )}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="empty-placeholder">최근 접수된 새벽 주문 목록이 없습니다.</div>
              )}
            </div>
          </section>

        </aside>

      </div>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="product-detail-modal-overlay" onClick={() => setActiveProductId(null)}>
          <div className="product-detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setActiveProductId(null)}>&times;</button>
            
            <div className="modal-main-layout">
              <div className="modal-image-box">
                <img src={activeProduct.image} alt={activeProduct.name} className="large-img" />
              </div>
              <div className="modal-info-box">
                <span className="cat">[{activeProduct.category}]</span>
                <h2>{activeProduct.name}</h2>
                <div className="price-tag">
                  <span>체험 가격:</span>
                  <strong>{getProductPrice(activeProduct).toLocaleString()}원</strong>
                </div>

                {/* Tabs selector */}
                <div className="tabs-bar">
                  <button 
                    className={`tab-btn ${detailTab === 'desc' ? 'active' : ''}`}
                    onClick={() => setDetailTab('desc')}
                  >
                    농가 직송 상품 상세
                  </button>
                  <button 
                    className={`tab-btn ${detailTab === 'nutrition' ? 'active' : ''}`}
                    onClick={() => setDetailTab('nutrition')}
                  >
                    성분 및 영양 정보
                  </button>
                </div>

                <div className="tab-contents-box">
                  {detailTab === 'desc' ? (
                    <p className="desc-text">{activeProduct.nutrition}</p>
                  ) : (
                    <table className="nutrition-table">
                      <tbody>
                        <tr>
                          <td>주요 성분</td>
                          <td>100% 친환경 천연 식자재</td>
                        </tr>
                        <tr>
                          <td>보관 방법</td>
                          <td>0~10도 냉장 보관</td>
                        </tr>
                        <tr>
                          <td>소비 기한</td>
                          <td>수령 후 3일 이내 섭취 권장</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>

                <button className="modal-cart-add-btn" onClick={() => { addToCart(activeProduct); setActiveProductId(null); }}>
                  장바구니 담기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
