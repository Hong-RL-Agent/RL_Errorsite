import React, { useState, useEffect } from 'react';

export default function App() {
  // DB states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Cart state
  const [cart, setCart] = useState([
    { productId: "pet-01", name: "유기농 프리미엄 강아지 사료 3kg", qty: 1, option: "기본", price: 29000 }
  ]);

  // Active product details
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailTab, setDetailTab] = useState('nutrition'); // nutrition | reviews

  // Filter states
  const [selectedPet, setSelectedPet] = useState('All'); // All | Dog | Cat
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscription setup states
  const [subscribingProductId, setSubscribingProductId] = useState(null);
  const [subDate, setSubDate] = useState('2026-08-01');
  const [cycleDisplay, setCycleDisplay] = useState('2주'); // Error 1 target
  const [cycleData, setCycleData] = useState('2주');

  // Review inputs
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState('');
  
  // Review editing state (Error 4 Target)
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  // Toast alerts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadReviews();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      showToast('상품 정보를 조회할 수 없습니다.', 'danger');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showToast('주문 내역 조회 실패', 'danger');
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      showToast('리뷰 목록 조회 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchPet = selectedPet === 'All' || p.pet === selectedPet;
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPet && matchCat && matchSearch;
  });

  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeProductReviews = reviews.filter(r => r.productId === selectedProductId);

  // Cart operations
  const addToCart = (product, option = '기본') => {
    const exists = cart.find(item => item.productId === product.id && item.option === option);
    if (exists) {
      setCart(cart.map(item => 
        (item.productId === product.id && item.option === option)
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name, 
        qty: 1, 
        option, 
        price: product.price 
      }]);
    }
    showToast(`${product.name}이(가) 장바구니에 담겼습니다.`, 'success');
  };

  const updateCartQty = (productId, option, amount) => {
    const updated = cart.map(item => {
      if (item.productId === productId && item.option === option) {
        const nextQty = item.qty + amount;
        return nextQty > 0 ? { ...item, qty: nextQty } : item;
      }
      return item;
    });
    setCart(updated);
  };

  const removeFromCart = (productId, option) => {
    setCart(cart.filter(item => !(item.productId === productId && item.option === option)));
    showToast('장바구니 상품이 삭제되었습니다.', 'info');
  };

  // Checkout order submission (Error 3 targets pet-08 + 자동 급식기 option)
  const handleCheckout = async () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total,
          subscription: null
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '주문 생성 실패');
      }

      showToast('주문서가 정상 접수되었습니다.', 'success');
      setCart([]);
      loadOrders();
    } catch (err) {
      showToast(`[주문 에러] ${err.message}`, 'danger');
    }
  };

  // Error 1: Regular delivery subscription cycle mismatch
  const handleCycleChange = (e) => {
    const val = e.target.value;
    setCycleDisplay(val); // UI shows correct selected cycle!

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 정기 배송 주기를 4주로 변경하더라도 
    // 백엔드로 전송할 실제 데이터 변수(cycleData)는 2주("2주")에 고정된 채 
    // 업데이트되지 않는 결함을 만듭니다. 이로 인해 화면 표기와 실제 처리 주기가 맞지 않는 오류를 유발합니다.
    // 원래 대입되어야 하는 변수 동기화 코드 제거:
    // setCycleData(val);
  };

  // Subscribe regular delivery
  const submitSubscription = async () => {
    const product = products.find(p => p.id === subscribingProductId);
    if (!product) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: product.id, name: product.name, qty: 1, option: '기본', price: product.price }],
          total: product.price,
          subscription: {
            date: subDate,
            cycle: cycleData // Sends the un-updated '2주' data!
          }
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '정기배송 등록 실패');
      }

      showToast(`[정기배송 등록 완료] 주기: ${cycleDisplay} (서버기록: ${cycleData})`, 'success');
      setSubscribingProductId(null);
      loadOrders();
    } catch (err) {
      showToast(`[구독 등록 에러] ${err.message}`, 'danger');
    }
  };

  // Write new review
  const submitNewReview = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          rating: newRating,
          content: newContent
        })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('리뷰가 등록되었습니다.', 'success');
        setNewContent('');
        setNewRating(5);
        loadReviews();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast(`리뷰 등록 실패: ${err.message}`, 'danger');
    }
  };

  // Update existing review (Error 4 Target)
  const submitEditReview = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/reviews/${editingReviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: editRating,
          content: editContent
        })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('리뷰가 수정되었습니다. (중복 발생 여부 검증 요망)', 'success');
        setEditingReviewId(null);
        setEditContent('');
        loadReviews();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast(`리뷰 수정 실패: ${err.message}`, 'danger');
    }
  };

  // Error 2: Cart button disabled state bypass
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 장바구니의 아이템이 0개인 공백 상태에서도 주문서 접수(주문하기) 버튼이 
  // 비활성화(disabled)되지 않고 여전히 활성(clickable) 상태로 노출되게 유도합니다.
  // 원래 조건문: const isOrderDisabled = cart.length === 0;
  const isOrderDisabled = false; // Always enabled!

  return (
    <div className="petcart-app">
      {/* Top Header */}
      <header className="app-navbar">
        <div className="logo-group">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
            <path d="M12 14a2 2 0 00-2 2h4a2 2 0 00-2-2z" />
          </svg>
          <span className="logo-title">PetCart</span>
          <span className="logo-subtitle">반려동물 라이프스타일 샵</span>
        </div>

        <div className="pet-toggle-container">
          <button 
            type="button" 
            onClick={() => setSelectedPet('All')}
            className={`pet-toggle-btn ${selectedPet === 'All' ? 'active' : ''}`}
          >
            모두 보기
          </button>
          <button 
            type="button" 
            onClick={() => setSelectedPet('Dog')}
            className={`pet-toggle-btn dog ${selectedPet === 'Dog' ? 'active' : ''}`}
          >
            🐶 강아지관
          </button>
          <button 
            type="button" 
            onClick={() => setSelectedPet('Cat')}
            className={`pet-toggle-btn cat ${selectedPet === 'Cat' ? 'active' : ''}`}
          >
            🐱 고양이관
          </button>
        </div>

        <div className="search-box-wrapper">
          <input 
            type="text" 
            placeholder="사료, 간식, 캣타워 등 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search"
          />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="workspace-grid">
        
        {/* Left Sidebar Category & Lists */}
        <section className="panel-section products-catalog-panel">
          <div className="panel-header-row">
            <h2>🛒 상품 카탈로그 ({filteredProducts.length}개)</h2>
            
            <div className="cat-tabs-row">
              {['All', '사료', '간식', '장난감', '리빙', '건강'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cat-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'All' ? '전체' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(prod => (
              <div 
                key={prod.id} 
                className={`product-card ${selectedProductId === prod.id ? 'active' : ''}`}
                onClick={() => setSelectedProductId(prod.id)}
              >
                <div className="img-box">
                  {/* Error 5: pet-10 image case mismatch causes broken image */}
                  <img src={prod.image} alt={prod.name} className="product-thumb" />
                </div>

                <div className="body">
                  <span className="pet-tag">[{prod.pet === 'Dog' ? '🐶 강아지' : '🐱 고양이'}]</span>
                  <h3>{prod.name}</h3>
                  <strong className="price">{prod.price.toLocaleString()}원</strong>
                </div>

                <div className="actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    type="button" 
                    onClick={() => addToCart(prod, '기본')}
                    className="cart-add-btn"
                  >
                    담기
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSubscribingProductId(prod.id)}
                    className="sub-setup-btn"
                  >
                    정기배송
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="empty-placeholder">
                조건에 맞는 반려동물 용품이 품절되었거나 존재하지 않습니다.
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Mini Cart & Subscribes & Details */}
        <aside className="right-drawer-column">
          
          {/* Active Product Details */}
          {activeProduct ? (
            <section className="panel-section product-detail-panel">
              <div className="panel-header">
                <h2>🔎 상품 상세 정보 & 영양 정보</h2>
              </div>

              <div className="detail-header-info">
                <h3>{activeProduct.name}</h3>
                <p className="price-lbl">판매가: <strong>{activeProduct.price.toLocaleString()}원</strong></p>
              </div>

              {/* Nutrition fact tabs */}
              <div className="detail-tabs-row">
                <button 
                  type="button" 
                  onClick={() => setDetailTab('nutrition')} 
                  className={`tab-link ${detailTab === 'nutrition' ? 'active' : ''}`}
                >
                  🌾 성분/원재료 표기
                </button>
                <button 
                  type="button" 
                  onClick={() => setDetailTab('reviews')} 
                  className={`tab-link ${detailTab === 'reviews' ? 'active' : ''}`}
                >
                  💬 고객 한줄 평 ({activeProductReviews.length}건)
                </button>
              </div>

              <div className="tab-content-box">
                {detailTab === 'nutrition' ? (
                  <div className="nutrition-facts">
                    <h5>영양 성분 분석 결과</h5>
                    <p>{activeProduct.nutrition}</p>
                    
                    {activeProduct.options.length > 1 && (
                      <div className="options-selector">
                        <label>구매 옵션 선택:</label>
                        <select 
                          className="opt-select"
                          onChange={(e) => {
                            if (e.target.value) {
                              addToCart(activeProduct, e.target.value);
                            }
                          }}
                        >
                          <option value="">-- 옵션을 선택하세요 --</option>
                          {activeProduct.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="reviews-board">
                    {/* Render reviews */}
                    <div className="reviews-scroller">
                      {activeProductReviews.map(rev => (
                        <div key={rev.id} className="review-card">
                          <div className="h">
                            <span className="stars">{'★'.repeat(rev.rating)}</span>
                            <span className="date">{rev.date}</span>
                          </div>
                          <p>{rev.content}</p>
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingReviewId(rev.id);
                              setEditRating(rev.rating);
                              setEditContent(rev.content);
                            }}
                            className="edit-review-trigger"
                          >
                            수정
                          </button>
                        </div>
                      ))}

                      {activeProductReviews.length === 0 && (
                        <div className="empty-placeholder">등록된 첫 한줄 평을 작성해 주세요.</div>
                      )}
                    </div>

                    {/* Edit review form */}
                    {editingReviewId ? (
                      <form onSubmit={submitEditReview} className="review-input-form edit">
                        <h5>리뷰 수정하기</h5>
                        <div className="row">
                          <label>평점:</label>
                          <select value={editRating} onChange={(e) => setEditRating(Number(e.target.value))}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}
                          </select>
                        </div>
                        <textarea 
                          value={editContent} 
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="수정할 리뷰 내용을 입력하세요"
                          required
                        />
                        <div className="btn-row">
                          <button type="submit" className="submit-rev-btn">수정 완료</button>
                          <button type="button" onClick={() => setEditingReviewId(null)} className="cancel-rev-btn">취소</button>
                        </div>
                      </form>
                    ) : (
                      /* Add review form */
                      <form onSubmit={submitNewReview} className="review-input-form">
                        <h5>한줄 평 남기기</h5>
                        <div className="row">
                          <label>평점 선택:</label>
                          <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}
                          </select>
                        </div>
                        <textarea 
                          value={newContent} 
                          onChange={(e) => setNewContent(e.target.value)}
                          placeholder="배송 상태나 기호성에 대한 솔직한 후기를 남겨주세요."
                          required
                        />
                        <button type="submit" className="submit-rev-btn">작성 등록</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="panel-section product-detail-panel empty">
              <div className="empty-placeholder">
                좌측 상품 카드의 상세 및 원재료 성분을 조회하려면 상품을 눌러주십시오.
              </div>
            </section>
          )}

          {/* Subscription setup calendar modal/card */}
          {subscribingProductId && (
            <section className="panel-section subscription-modal-panel">
              <div className="panel-header">
                <h2>📅 정기배송 (구독 서비스) 주간 달력 설정</h2>
              </div>
              <div className="sub-form">
                <p>상품: <strong>{products.find(p => p.id === subscribingProductId)?.name}</strong></p>
                
                <div className="row">
                  <label>첫 배송 시작일:</label>
                  <input type="date" value={subDate} onChange={(e) => setSubDate(e.target.value)} className="sub-input" />
                </div>

                <div className="row">
                  <label>정기 결제 배송 주기 선택:</label>
                  {/* Error 1: cycleDisplay state changes, but cycleData does not update from '2주' */}
                  <select 
                    value={cycleDisplay} 
                    onChange={handleCycleChange} 
                    className="sub-select"
                  >
                    <option value="2주">2주 주기 (기본 사료형)</option>
                    <option value="4주">4주 주기 (한달 집중 케어형)</option>
                  </select>
                </div>

                <div className="info-badge">
                  <span>선택된 요일 주기: <strong>{cycleDisplay}</strong> (데이터 매핑값: {cycleData})</span>
                </div>

                <div className="btn-row">
                  <button type="button" onClick={submitSubscription} className="sub-confirm-btn">구독 시작</button>
                  <button type="button" onClick={() => setSubscribingProductId(null)} className="sub-cancel-btn">종료</button>
                </div>
              </div>
            </section>
          )}

          {/* Mini Cart Drawer */}
          <section className="panel-section mini-cart-panel">
            <div className="panel-header">
              <h2>👜 실시간 미니 장바구니 ({cart.length}개)</h2>
            </div>

            <div className="cart-list">
              {cart.map(item => (
                <div key={`${item.productId}-${item.option}`} className="cart-item">
                  <div className="info">
                    <h4>{item.name}</h4>
                    <p className="sub">옵션: {item.option} | {item.price.toLocaleString()}원</p>
                  </div>
                  <div className="control-bar">
                    <div className="qty-row">
                      <button type="button" onClick={() => updateCartQty(item.productId, item.option, -1)} className="qty-btn">-</button>
                      <span className="qty-val">{item.qty}개</span>
                      <button type="button" onClick={() => updateCartQty(item.productId, item.option, 1)} className="qty-btn">+</button>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.productId, item.option)}
                      className="remove-item-btn"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="empty-placeholder">장바구니가 비어 있습니다.</div>
              )}

              <div className="cart-footer">
                <div className="total-row">
                  <span>총 주문 금액:</span>
                  <strong className="total-val">
                    {cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}원
                  </strong>
                </div>

                <button 
                  type="button" 
                  onClick={handleCheckout}
                  disabled={isOrderDisabled}
                  className="cart-checkout-btn"
                >
                  주문 결제하기 (Error 2 적용)
                </button>
              </div>
            </div>
          </section>

          {/* Order history cabinet */}
          <section className="panel-section order-history-panel">
            <div className="panel-header">
              <h2>📜 지난 주문 및 정기 구독 내역</h2>
            </div>
            <div className="order-history-list">
              {orders.map(ord => (
                <div key={ord.id} className="history-card">
                  <div className="h">
                    <span className="id">주문번호: {ord.id.slice(-6)}</span>
                    <span className="date">{ord.date}</span>
                  </div>
                  <div className="body">
                    <ul>
                      {ord.items.map(it => (
                        <li key={`${it.productId}-${it.option}`}>
                          {it.name} x {it.qty} ({it.option})
                        </li>
                      ))}
                    </ul>
                    {ord.subscription && (
                      <div className="sub-badge">
                        🔁 정기배송 구독중 (주기: {ord.subscription.cycle})
                      </div>
                    )}
                    <div className="total">결제액: {ord.total.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </aside>

      </div>

      {/* Toast Alert Cabinets */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button 
              className="toast-close" 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
