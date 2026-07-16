<script setup>
import { ref, onMounted, computed } from 'vue';

// Session / Active User
const currentUser = ref('User A');

// DB states
const products = ref([]);
const ordersList = ref([]);
const reviewsList = ref([]);
const searchResults = ref([]);

// Active navigation screens: 'shop' | 'checkout' | 'orders' | 'reviews'
const activeScreen = ref('shop');

// Search & Catalog Filter states
const searchQuery = ref('');
const selectedCategory = ref('All');
const priceRange = ref(2000000);
const sortBy = ref('name');

// Cart states (Frontend client states)
const cartItems = ref([
  { productId: 'prod-01', name: '게이밍 노트북 16인치', price: 1500000, quantity: 1 } // User A's initial item
]);
const cartCount = ref(1);
const selectedCoupon = ref('COUPON-WELCOME');
const discountAmount = ref(5000);
const shippingAddress = ref('서울 강남구 테헤란로 427');
const shippingMethod = ref('Standard'); // 'Standard' | 'Express'

// Review Form inputs
const newReviewText = ref('');
const newReviewRating = ref(5);
const newReviewProdId = ref('prod-01');

// Detail modal view
const selectedProductId = ref(null);

// UI alerts
const toasts = ref([]);

onMounted(() => {
  loadProducts();
  loadOrders();
  loadReviews();
});

const loadProducts = async () => {
  try {
    const res = await fetch('/api/products');
    products.value = await res.json();
    searchResults.value = products.value;
  } catch (err) {
    showToast('상품 로드 실패', 'danger');
  }
};

const loadOrders = async () => {
  try {
    const res = await fetch('/api/orders');
    ordersList.value = await res.json();
  } catch (err) {
    showToast('주문 내역 로드 실패', 'danger');
  }
};

const loadReviews = async () => {
  try {
    const res = await fetch('/api/reviews');
    reviewsList.value = await res.json();
  } catch (err) {
    showToast('리뷰 로드 실패', 'danger');
  }
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

// Switch active user session (Error 4 Logic)
const handleSwitchUser = (user) => {
  currentUser.value = user;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Cache
  // DESCRIPTION: 계정을 전환했음에도 장바구니 품목들(cartItems), 장바구니 뱃지 숫자(cartCount), 
  // 선택된 쿠폰 할인액(discountAmount)은 초기화하지 않고 그대로 남겨둡니다.
  // 이 결과 B가 주문을 생성하면 B의 품목뿐만 아니라 A가 담아둔 '게이밍 노트북 16인치'가 합산되어 넘어가게 만듭니다.
  
  showToast(`${user} 계정으로 위임 로그인되었습니다.`, 'success');
};

// Filtered products computed list
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const categoryMatch = selectedCategory.value === 'All' || p.category === selectedCategory.value;
    const priceMatch = p.price <= priceRange.value;
    return categoryMatch && priceMatch;
  });
});

// Checkout Totals computed locally (Frontend view)
const checkoutSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const shippingFee = computed(() => {
  return shippingMethod.value === 'Express' ? 5000 : 2500;
});

const totalAmount = computed(() => {
  return Math.max(0, checkoutSubtotal.value + shippingFee.value - discountAmount.value);
});

// Search race condition demo (Error 2 Logic)
const triggerSearchRaceDemo = () => {
  searchQuery.value = '게이밍 노트북 16인치';
  searchResults.value = [];

  // Query 1: '노트북' (Takes 3.0 seconds on server)
  fetch(`/api/products/search?q=노트북`)
    .value = fetch(`/api/products/search?q=노트북`)
      .then(res => res.json())
      .then(data => {
        searchResults.value = data.results;
        showToast(`'노트북' 검색 수신 완료 (3초 지연)`, 'warning');
      });

  // Query 2: '게이밍 노트북' (Takes 1.5 seconds)
  setTimeout(() => {
    fetch(`/api/products/search?q=게이밍 노트북`)
      .then(res => res.json())
      .then(data => {
        searchResults.value = data.results;
        showToast(`'게이밍 노트북' 검색 수신 완료 (1.5초 지연)`, 'info');
      });
  }, 100);

  // Query 3: '게이밍 노트북 16인치' (Takes 0.3 seconds)
  setTimeout(() => {
    fetch(`/api/products/search?q=게이밍 노트북 16인치`)
      .then(res => res.json())
      .then(data => {
        searchResults.value = data.results;
        showToast(`'게이밍 노트북 16인치' 검색 수신 완료 (0.3초 지연)`, 'info');
      });
  }, 200);
};

// Add product to Cart
const addToCart = (product) => {
  const existing = cartItems.value.find(item => item.productId === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cartItems.value.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
  cartCount.value = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);

  // Sync initial add to server cart
  fetch('/api/cart/quantity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: product.id, quantity: 1 })
  });

  showToast(`장바구니에 [${product.name}] 상품이 추가되었습니다.`, 'success');
};

// Update Checkout Parameters concurrently (Error 1 Logic)
const handleCheckoutParamsChange = (productId, newQuantity) => {
  // Update local view immediately
  const item = cartItems.value.find(i => i.productId === productId);
  if (item) {
    item.quantity = newQuantity;
  }
  cartCount.value = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);

  // 1. Dispatch Quantity change (5s delay on backend)
  fetch('/api/cart/quantity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: newQuantity })
  });

  // 2. Apply Coupon (0.1s delay on backend)
  selectedCoupon.value = 'COUPON-WELCOME';
  discountAmount.value = 10000;
  fetch('/api/cart/coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponId: 'COUPON-WELCOME' })
  });

  // 3. Change shipping to Express (2s delay on backend)
  shippingMethod.value = 'Express';
  fetch('/api/cart/shipping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shippingMethod: 'Express' })
  });

  showToast('결제 요건이 설정되었습니다. (비동기 지연 실행)', 'info');
};

// Submit Order (Error 1 Checkout Submission & Error 4 Contamination)
const handlePlaceOrder = async () => {
  if (cartItems.value.length === 0) {
    showToast('장바구니에 결제할 물품이 없습니다.', 'warning');
    return;
  }

  try {
    // Send local cartItems array which might contain User A's contaminated items
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.value,
        shippingMethod: shippingMethod.value,
        couponApplied: selectedCoupon.value,
        discount: discountAmount.value,
        totalAmount: totalAmount.value
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showToast('주문서 최종 결제가 정상 완료되었습니다.', 'success');
    
    // Clear frontend cart states
    cartItems.value = [];
    cartCount.value = 0;
    selectedCoupon.value = '';
    discountAmount.value = 0;
    
    loadOrders();
    activeScreen.value = 'orders';
  } catch (err) {
    showToast('주문 실패', 'danger');
  }
};

// Cancel & Return Order concurrently (Error 3 Logic)
const handleCancelAndReturnDemo = async (orderId) => {
  try {
    // Fire cancel order request (sets order.status = 'CANCELED')
    await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });

    // Fire return request immediately (sets order.hasReturnRequested = true)
    await fetch(`/api/orders/${orderId}/return`, { method: 'POST' });

    showToast('주문 취소와 반품 처리가 연속해서 전송 완료되었습니다.', 'warning');
    loadOrders();
  } catch (err) {
    showToast('상태 전송 실패', 'danger');
  }
};

// Create / Submit Review
const handlePostReview = async (e) => {
  e.preventDefault();
  if (!newReviewText.value.trim()) return;

  const tempId = `rev-${Date.now()}`;
  const newReview = {
    id: tempId,
    productId: newReviewProdId.value,
    author: currentUser.value,
    text: newReviewText.value,
    rating: newReviewRating.value
  };

  try {
    const res = await fetch(`/api/reviews/${tempId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    });

    if (res.ok) {
      showToast('리뷰가 등록되었습니다. (3초 지연 DB 동기화)', 'success');
      newReviewText.value = '';
      setTimeout(() => {
        loadReviews();
      }, 3500);
    }
  } catch (err) {
    showToast('리뷰 저장 실패', 'danger');
  }
};

// Edit then immediately Delete Review (Error 5 Logic)
const handleEditThenDeleteDemo = (reviewId) => {
  // 1. Send edit request (PUT, takes 3 seconds delay to write to database)
  fetch(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: "수정된 리뷰글 내용입니다. (수정 직후 삭제 경합 발생)",
      rating: 3,
      productId: "prod-01",
      author: currentUser.value
    })
  });

  // 2. Immediately send delete request (DELETE, takes 0.1 seconds)
  setTimeout(async () => {
    const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('리뷰가 정상 삭제 응답을 받았습니다. (0.1초 완료)', 'success');
      
      // Update local state immediately to look like it was deleted
      reviewsList.value = reviewsList.value.filter(r => r.id !== reviewId);
    }
  }, 100);

  // Inform that PUT completes after 3 seconds, inserting the review back in!
  setTimeout(() => {
    showToast('리뷰 수정 지연 작업 완료 (디비 부활 확인)', 'warning');
    loadReviews();
  }, 3500);
};

// Reset Sandbox
const handleResetSandbox = async () => {
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      showToast('쇼핑몰 데이터가 초기화되었습니다.', 'warning');
      loadOrders();
      loadReviews();
      cartItems.value = [];
      cartCount.value = 0;
      selectedCoupon.value = '';
      discountAmount.value = 0;
      activeScreen.value = 'shop';
    }
  } catch (err) {
    showToast('초기화 API 실패', 'danger');
  }
};

const activeProduct = computed(() => {
  return products.value.find(p => p.id === selectedProductId.value) || null;
});
</script>

<template>
  <div class="cartsphere-app">
    
    <!-- Top Header bar -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
        <span class="logo-title">CartSphere</span>
        <span class="logo-subtitle">종합 쇼핑 정보 포털</span>
      </div>

      <nav class="app-nav">
        <button :class="{ active: activeScreen === 'shop' }" @click="activeScreen = 'shop'">
          🛍️ 상품 쇼핑
        </button>
        <button :class="{ active: activeScreen === 'checkout' }" @click="activeScreen = 'checkout'">
          💳 주문 결제서
        </button>
        <button :class="{ active: activeScreen === 'orders' }" @click="activeScreen = 'orders'">
          📦 내 주문 목록
        </button>
        <button :class="{ active: activeScreen === 'reviews' }" @click="activeScreen = 'reviews'">
          ⭐ 상품 리뷰 관리
        </button>
      </nav>

      <div class="header-actions">
        <!-- User Swapping -->
        <div class="user-info-badge">
          <span>👤 로그인: <strong>{{ currentUser }}</strong></span>
          <button @click="handleSwitchUser(currentUser === 'User A' ? 'User B' : 'User A')" class="switch-user-btn">
            전환 (Error 4)
          </button>
        </div>
        <button @click="handleResetSandbox" class="reset-sandbox-btn">⚠️ 초기화</button>
      </div>
    </header>

    <!-- TAB 1: PRODUCT SHOP CATALOG -->
    <div v-if="activeScreen === 'shop'" class="catalog-workspace">
      
      <!-- Top Search & Quick Demos -->
      <div class="search-race-helper-bar">
        <div class="search-input-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="상품명 또는 카테고리를 검색하세요..." 
            class="search-bar" 
          />
          <button @click="triggerSearchRaceDemo" class="race-demo-btn">
            ⚡ 빠른 연속 타이핑 시뮬레이터 (Error 2)
          </button>
        </div>
      </div>

      <!-- Main Layout: 3 Columns -->
      <div class="shop-grid">
        
        <!-- Left Filter Panel -->
        <aside class="panel-section filter-panel">
          <div class="panel-header">
            <h3>🔍 카테고리 필터</h3>
          </div>
          
          <div class="filter-group">
            <label>상품 대분류</label>
            <select v-model="selectedCategory">
              <option value="All">전체 상품군</option>
              <option value="가전/디지털">가전/디지털</option>
              <option value="패션/의류">패션/의류</option>
              <option value="식품/리빙">식품/리빙</option>
            </select>
          </div>

          <div class="filter-group">
            <label>최대 가격 상한선 ({{ priceRange.toLocaleString() }}원)</label>
            <input type="range" v-model="priceRange" min="10000" max="2000000" step="20000" />
          </div>

          <div class="sidebar-tips">
            * 카테고리와 슬라이더 가격 정보에 맞춰 상품들이 동적으로 갱신됩니다.
          </div>
        </aside>

        <!-- Center Product Catalog Cards -->
        <main class="panel-section products-catalog-panel">
          <div class="panel-header">
            <h2>🛍️ CartSphere 추천 실시간 베스트 상품</h2>
          </div>

          <div class="products-grid">
            <div v-for="p in filteredProducts" :key="p.id" class="product-card">
              <img :src="p.image" :alt="p.name" class="p-thumb" />
              <div class="p-info">
                <span class="p-cat">{{ p.category }}</span>
                <h3>{{ p.name }}</h3>
                <p class="p-desc">{{ p.desc }}</p>
                <div class="p-footer">
                  <span class="p-price">{{ p.price.toLocaleString() }}원</span>
                  <div class="p-actions">
                    <button @click="selectedProductId = p.id" class="action-btn detail">상세</button>
                    <button @click="addToCart(p)" class="action-btn cart-add">담기</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredProducts.length === 0" class="empty-state">
              선택한 카테고리/가격 조건에 맞는 쇼핑몰 상품이 없습니다.
            </div>
          </div>
        </main>

        <!-- Right Quick Cart Panel -->
        <aside class="panel-section quick-cart-panel">
          <div class="panel-header">
            <h3>🛒 장바구니 간편 요약</h3>
            <span class="cart-count-badge">{{ cartCount }}개 상품</span>
          </div>

          <div class="cart-items-scroll">
            <div v-for="item in cartItems" :key="item.productId" class="quick-cart-item">
              <div class="item-header">
                <strong>{{ item.name }}</strong>
                <span class="qty">수량: {{ item.quantity }}개</span>
              </div>
              <p class="price">{{ (item.price * item.quantity).toLocaleString() }}원</p>
            </div>

            <div v-if="cartItems.length === 0" class="empty-cart-msg">
              장바구니가 비어 있습니다. 추천 카탈로그에서 상품을 골라보세요.
            </div>
          </div>

          <div v-if="cartItems.length > 0" class="cart-summary-bottom">
            <div class="total-row">
              <span>상품 합계</span>
              <strong>{{ checkoutSubtotal.toLocaleString() }}원</strong>
            </div>
            <button @click="activeScreen = 'checkout'" class="go-checkout-btn">
              💳 주문 결제하러 가기
            </button>
          </div>
        </aside>

      </div>
    </div>

    <!-- TAB 2: CHECKOUT SCREEN -->
    <div v-if="activeScreen === 'checkout'" class="checkout-workspace">
      <div class="panel-section checkout-panel">
        <div class="panel-header">
          <h2>💳 상품 주문 및 결제서 작성</h2>
        </div>

        <div class="checkout-split-grid">
          
          <!-- Left Details: Shipping & Coupon -->
          <div class="checkout-details-column">
            
            <!-- Step 1: Shipping Address -->
            <div class="checkout-step-block">
              <h3>📍 1단계: 배송 정보 및 배송지 입력</h3>
              <div class="form-group">
                <label>기본 배송지 주소</label>
                <input type="text" v-model="shippingAddress" class="form-input" />
              </div>
              
              <div class="shipping-method-selection">
                <label>배송 요금 방식 변경</label>
                <div class="methods-row">
                  <button 
                    @click="handleCheckoutParamsChange(cartItems[0]?.productId, cartItems[0]?.quantity)" 
                    class="method-btn"
                  >
                    일반 택배 (2,500원) / 수량 3개 동시 연쇄 설정 (Error 1)
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2: Coupons -->
            <div class="checkout-step-block">
              <h3>🎟️ 2단계: 쿠폰 및 혜택 적용</h3>
              <p>쿠폰 정보: <strong>{{ selectedCoupon || '선택된 쿠폰 없음' }}</strong></p>
              <p class="discount-p" v-if="discountAmount > 0">할인 금액: -{{ discountAmount.toLocaleString() }}원</p>
            </div>

            <!-- Step 3: Cart Items List -->
            <div class="checkout-step-block">
              <h3>📦 3단계: 주문서 담긴 최종 품목 목록</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th>단가</th>
                    <th>수량</th>
                    <th>합계</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in cartItems" :key="item.productId">
                    <td>{{ item.name }}</td>
                    <td>{{ item.price.toLocaleString() }}원</td>
                    <td>{{ item.quantity }}개</td>
                    <td>{{ (item.price * item.quantity).toLocaleString() }}원</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- Right Sidebar: Payment Summary -->
          <div class="checkout-summary-column">
            <div class="summary-card">
              <h3>💰 결제 최종 금액 요약</h3>
              
              <div class="price-line">
                <span>총 상품 금액</span>
                <span>{{ checkoutSubtotal.toLocaleString() }}원</span>
              </div>
              <div class="price-line">
                <span>배송비 ({{ shippingMethod }})</span>
                <span>{{ shippingFee.toLocaleString() }}원</span>
              </div>
              <div class="price-line discount">
                <span>쿠폰 할인 혜택</span>
                <span>-{{ discountAmount.toLocaleString() }}원</span>
              </div>

              <div class="price-line grand-total">
                <span>최종 결제 예정 금액</span>
                <span class="total">{{ totalAmount.toLocaleString() }}원</span>
              </div>

              <p class="error-msg-hint">* 배송방식/수량 변경 시 서버 비동기 지연 전송 발생(Error 1)</p>

              <button @click="handlePlaceOrder" class="place-order-btn">
                💳 주문 및 최종 결제 승인
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- TAB 3: ORDER HISTORY SCREEN -->
    <div v-if="activeScreen === 'orders'" class="orders-workspace">
      <div class="panel-section orders-panel">
        <div class="panel-header">
          <h2>📦 회원님의 구매 및 주문 목록 내역</h2>
        </div>

        <div class="orders-stack">
          <div v-for="ord in ordersList" :key="ord.id" class="order-card">
            <div class="order-card-header">
              <span class="order-id">주문번호: <strong>{{ ord.id }}</strong></span>
              <span class="order-date">결제 시각: {{ ord.createdAt }}</span>
            </div>

            <!-- Order status badges (Error 3 Rendering) -->
            <div class="order-status-row">
              <span v-if="ord.status === 'PAID'" class="status-badge paid">결제 완료</span>
              <span v-if="ord.status === 'CANCELED'" class="status-badge canceled">주문 취소 완료</span>
              <span v-if="ord.hasReturnRequested" class="status-badge returned">반품 신청 완료</span>
              <span class="info-tag-text">(동시 마킹 관측: Error 3)</span>
            </div>

            <div class="order-card-body">
              <ul class="order-items-list">
                <li v-for="oi in ord.items" :key="oi.productId">
                  📦 {{ oi.name }} - 단가: {{ oi.price.toLocaleString() }}원 | 수량: <strong>{{ oi.quantity }}개</strong>
                </li>
              </ul>
              
              <div class="order-totals-summary">
                <p>배송 형태: {{ ord.shippingMethod }} (배송비: {{ ord.shippingFee.toLocaleString() }}원)</p>
                <p v-if="ord.couponApplied">사용 쿠폰: {{ ord.couponApplied }} (-{{ ord.discount.toLocaleString() }}원)</p>
                <p class="total-txt">최종 결제액: <strong>{{ ord.totalAmount.toLocaleString() }}원</strong></p>
              </div>
            </div>

            <div class="order-card-footer">
              <button 
                v-if="ord.status !== 'CANCELED'" 
                @click="handleCancelAndReturnDemo(ord.id)" 
                class="footer-btn cancel-return"
              >
                🚨 취소 후 바로 반품 신청 시뮬레이션 (Error 3)
              </button>
            </div>
          </div>

          <div v-if="ordersList.length === 0" class="empty-state">
            체결 및 확정된 주문서 내역이 없습니다.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: REVIEWS MANAGEMENT SCREEN -->
    <div v-if="activeScreen === 'reviews'" class="reviews-workspace">
      
      <!-- Review Write form -->
      <div class="panel-section review-composer-panel">
        <div class="panel-header">
          <h3>⭐ 상품 구매 이용 후기 작성</h3>
        </div>

        <form @submit="handlePostReview" class="review-compose-form">
          <div class="form-row">
            <div class="input-group">
              <label>대상 상품 선택</label>
              <select v-model="newReviewProdId">
                <option v-for="p in products" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
            
            <div class="input-group">
              <label>평점</label>
              <select v-model="newReviewRating">
                <option :value="5">⭐⭐⭐⭐⭐ (5점)</option>
                <option :value="4">⭐⭐⭐⭐ (4점)</option>
                <option :value="3">⭐⭐⭐ (3점)</option>
                <option :value="2">⭐⭐ (2점)</option>
                <option :value="1">⭐ (1점)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>상품 사용 후기</label>
            <textarea 
              v-model="newReviewText" 
              placeholder="다른 구매자들을 위해 솔직한 피드백을 남겨주세요." 
              rows="3" 
              class="form-textarea"
              required
            ></textarea>
          </div>

          <button type="submit" class="submit-review-btn">
            ✍️ 소중한 이용후기 등록
          </button>
        </form>
      </div>

      <!-- Reviews Feed list -->
      <div class="panel-section reviews-list-panel">
        <div class="panel-header">
          <h2>⭐ 고객님들이 남겨주신 실시간 한줄평</h2>
        </div>

        <div class="reviews-stack">
          <div v-for="rev in reviewsList" :key="rev.id" class="review-bubble-card">
            <div class="rev-header">
              <span class="author">👤 작성자: {{ rev.author }}</span>
              <span class="rating">평점: {{ '★'.repeat(rev.rating) }}{{ '☆'.repeat(5 - rev.rating) }}</span>
            </div>
            <p class="rev-text">{{ rev.text }}</p>
            
            <div class="rev-actions">
              <button @click="handleEditThenDeleteDemo(rev.id)" class="rev-btn edit-del-race">
                ⚡ 수정하자마자 삭제하기 시뮬레이션 (Error 5)
              </button>
            </div>
          </div>

          <div v-if="reviewsList.length === 0" class="empty-state">
            등록된 상품 이용 후기가 존재하지 않습니다.
          </div>
        </div>
      </div>

    </div>

    <!-- PRODUCT DETAIL MODAL -->
    <div v-if="selectedProductId && activeProduct" class="modal-overlay" @click="selectedProductId = null">
      <div class="modal-card" @click.stopPropagation>
        <div class="modal-header">
          <h2>🏰 {{ activeProduct.name }} 상세 정보</h2>
          <button @click="selectedProductId = null" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <img :src="activeProduct.image" :alt="activeProduct.name" class="modal-img" />
          <span class="modal-cat">{{ activeProduct.category }}</span>
          <p class="modal-desc">{{ activeProduct.desc }}</p>
          <p class="modal-price">판매가: <strong>{{ activeProduct.price.toLocaleString() }}원</strong></p>
        </div>

        <div class="modal-footer">
          <button @click="addToCart(activeProduct)" class="modal-cart-add-btn">
            🛒 장바구니에 담기
          </button>
          <button @click="selectedProductId = null" class="modal-close-btn">
            닫기
          </button>
        </div>
      </div>
    </div>

    <!-- UI Toast Alerts -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-card" :class="t.type">
        <span class="toast-icon">
          {{ t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️' }}
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button class="toast-close" @click="toasts = toasts.filter(x => x.id !== t.id)">
          &times;
        </button>
      </div>
    </div>

  </div>
</template>

<style>
/* CSS is imported globally from index.css */
</style>
