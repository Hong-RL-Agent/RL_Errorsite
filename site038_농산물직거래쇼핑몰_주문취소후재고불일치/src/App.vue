<template>
  <div class="farmlink-app">
    
    {/* Season Banner Header */}
    <div class="seasonal-banner">
      <div class="banner-overlay">
        <span class="tag">☀️ 2026 여름 시즌 특별 산지 직송전</span>
        <h2>가장 뜨거운 태양 아래서, 농부들의 땀방울로 길러낸 햇농산물</h2>
        <p>평창 흙감자부터 논산 방울토마토까지, 복잡한 유통 경로 없이 집 앞으로 바로 만나는 자연의 싱그러움.</p>
      </div>
    </div>

    {/* Header Navigation */}
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span class="logo-title">FarmLink</span>
        <span class="logo-subtitle">산지직송 생산자 직거래 쇼핑몰</span>
      </div>

      <nav class="app-nav">
        <button type="button" @click="currentTab = 'shop'" :class="{ active: currentTab === 'shop' || currentTab === 'detail' }">🛒 농산물 상점</button>
        <button type="button" @click="currentTab = 'timeline'" :class="{ active: currentTab === 'timeline' }">👨‍🌾 생산자 스토리</button>
        <button type="button" @click="currentTab = 'calendar'" :class="{ active: currentTab === 'calendar' }">📅 정기배송 캘린더</button>
        <button type="button" @click="currentTab = 'orders'" :class="{ active: currentTab === 'orders' }">📦 나의 주문내역</button>
      </nav>

      <div class="header-actions">
        <button type="button" @click="handleResetSandbox" class="reset-sandbox-btn">⚠️ 샌드박스 초기화</button>
      </div>
    </header>

    {/* Mobile drawer toggle */}
    <div class="mobile-filter-bar">
      <button type="button" @click="mobileFilterOpen = !mobileFilterOpen" class="filter-toggle-btn">
        📂 지역/품목 필터 {{ mobileFilterOpen ? '닫기' : '열기' }}
      </button>
    </div>

    {/* Main Workspace Layout */}
    <div class="workspace-grid">
      
      {/* Left Column: Region & Item Filters */}
      <aside class="panel-section filters-sidebar" :class="{ 'mobile-show': mobileFilterOpen }">
        <div class="panel-header">
          <h3>📂 농산물 필터</h3>
        </div>

        <div class="filter-group">
          <h4>📍 산지 지역별</h4>
          <div class="checkbox-stack">
            <label v-for="region in ['All', '강원도', '충청도', '전라도', '경상도', '경기도']" :key="region" class="radio-lbl">
              <input type="radio" name="region" :value="region" v-model="selectedRegion" />
              <span>{{ region }}</span>
            </label>
          </div>
        </div>

        <div class="filter-group">
          <h4>🥬 품목 카테고리별</h4>
          <div class="checkbox-stack">
            <label v-for="cat in ['All', '구황작물', '과일/채소', '쌀/곡물', '장류/양념', '버섯/약초']" :key="cat" class="radio-lbl">
              <input type="radio" name="category" :value="cat" v-model="selectedCategory" />
              <span>{{ cat }}</span>
            </label>
          </div>
        </div>
      </aside>

      {/* Center Column: Stage Views */}
      <main class="center-stage-area">
        
        {/* TAB 1: PRODUCT LIST SHOP */}
        <div v-if="currentTab === 'shop'" class="panel-section shop-catalog-panel">
          <div class="panel-header-row">
            <h2>🥬 신선한 산지 수확 농산물 ({{ filteredProducts.length }}종)</h2>
            <input 
              type="text" 
              placeholder="상품명, 농가명 검색..."
              v-model="searchQuery"
              class="search-input"
            />
          </div>

          <div class="products-catalog-grid">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id" 
              class="product-card"
              @click="openProductDetail(product.id)"
            >
              <div class="img-box">
                <img :src="`/images/${product.image}`" :alt="product.name" class="p-img" />
              </div>
              <div class="info">
                <span class="region-badge">{{ product.region }}</span>
                <h4>{{ product.name }}</h4>
                <p class="farmer-tag">생산자: {{ getProducerName(product.producerId) }}</p>
                <div class="price-row">
                  <span class="price">{{ product.price.toLocaleString() }}원</span>
                  <span class="stock" :class="{ warning: product.stock < 10 }">재고: {{ product.stock }}개</span>
                </div>
              </div>
              <div class="card-actions" @click.stopPropagation>
                <button type="button" @click="handleAddToCart(product)" class="add-cart-btn" :disabled="product.stock <= 0">
                  {{ product.stock <= 0 ? '품절' : '🛒 장바구니 담기' }}
                </button>
              </div>
            </div>

            <div v-if="filteredProducts.length === 0" class="empty-placeholder">
              검색 조건에 맞는 농산물이 존재하지 않습니다.
            </div>
          </div>
        </div>

        {/* TAB 2: PRODUCT DETAIL */}
        <div v-if="currentTab === 'detail'" class="panel-section product-detail-panel">
          <div class="panel-header-row">
            <button type="button" @click="currentTab = 'shop'" class="back-btn">◀ 상점으로 돌아가기</button>
            <h2>농산물 상세 정보</h2>
          </div>

          <div class="detail-split-layout">
            <div class="img-area">
              <img :src="`/images/${activeProduct.image}`" :alt="activeProduct.name" class="p-large-img" />
            </div>
            
            <div class="desc-area">
              <span class="tag-cat">{{ activeProduct.category }}</span>
              <h2>{{ activeProduct.name }}</h2>
              <p class="price-line">{{ activeProduct.price ? activeProduct.price.toLocaleString() : 0 }}원</p>
              
              <div class="meta-card">
                <p>📍 원산지: {{ activeProduct.region }}</p>
                <p>📦 남은 수량: {{ activeProduct.stock }}개</p>
                <p>👨‍🌾 생산자: <strong>{{ getProducerName(activeProduct.producerId) }} 농부</strong></p>
              </div>

              <div class="quantity-input-box">
                <label>구매 예정 수량: </label>
                <input type="number" v-model.number="detailQuantity" min="1" :max="activeProduct.stock" class="qty-num-input" />
              </div>

              <div class="action-buttons-row">
                <button type="button" @click="handleAddToCart(activeProduct, detailQuantity)" class="cart-submit-btn" :disabled="activeProduct.stock <= 0">
                  장바구니 담기
                </button>
                <button type="button" @click="buyDirectFromDetail(activeProduct)" class="buy-direct-btn" :disabled="activeProduct.stock <= 0">
                  즉시 주문하기
                </button>
              </div>
            </div>
          </div>

          {/* Product Reviews list & Form */}
          <div class="reviews-section-block">
            <h3>💬 소비자 생생 구매 후기 ({{ productReviews.length }}건)</h3>
            
            <form @submit.prevent="handleSubmitReview" class="review-add-form">
              <div class="form-row-grid">
                <input type="text" placeholder="작성자 성함..." v-model="newReviewRater" class="form-input" required />
                <select v-model.number="newReviewRating" class="form-select">
                  <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                  <option value="4">⭐⭐⭐⭐ (4점)</option>
                  <option value="3">⭐⭐⭐ (3점)</option>
                  <option value="2">⭐⭐ (2점)</option>
                  <option value="1">⭐ (1점)</option>
                </select>
              </div>
              <textarea placeholder="드셔보신 만족도 후기를 남겨주세요..." v-model="newReviewComment" rows="2" class="form-textarea" required></textarea>
              <button type="submit" class="submit-review-btn">후기 등록</button>
            </form>

            <div class="reviews-stack-list">
              <div v-for="rev in productReviews" :key="rev.id" class="review-item">
                <div class="header">
                  <span class="rater">{{ rev.rater }} 님</span>
                  <span class="stars">{{ '★'.repeat(rev.rating) }}</span>
                </div>
                <p class="comment">"{{ rev.comment }}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 3: PRODUCER BIOGRAPHY STORY TIMELINE */}
        <div v-if="currentTab === 'timeline'" class="panel-section timeline-panel">
          <div class="panel-header">
            <h2>👨‍🌾 FarmLink를 가꾸는 농부님들 소개 (스토리 타임라인)</h2>
          </div>

          <div class="story-timeline-stack">
            <div 
              v-for="(farmer, idx) in producers" 
              :key="farmer.id" 
              class="timeline-item"
              :class="{ left: idx % 2 === 0, right: idx % 2 !== 0 }"
            >
              <div class="timeline-badge-marker">{{ idx + 1 }}</div>
              
              <div class="timeline-content-card">
                <div class="top-row">
                  <div class="farmer-avatar-box">
                    {/* Error 5: PRODUCER-04 will return 404 image due to case-sensitive mismatch in image path */}
                    <img :src="`/images/${farmer.image}`" :alt="farmer.name" class="avatar-img" />
                  </div>
                  <div class="name-meta">
                    <h4>{{ farmer.name }}</h4>
                    <span>산지: {{ farmer.region }}</span>
                  </div>
                </div>
                <p class="bio-text">"{{ farmer.bio }}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 4: SUBSCRIPTION CALENDAR */}
        <div v-if="currentTab === 'calendar'" class="panel-section subscription-calendar-panel">
          <div class="panel-header">
            <h2>📅 스마트 정기배송 캘린더 배송일 지정</h2>
          </div>

          <div class="sub-form-card-grid">
            <div class="setup-form-column">
              <h3>정기배송 계약 설정</h3>
              
              <div class="form-group">
                <label>받아보실 정기배송 농산물</label>
                <select v-model="subProductId" class="form-select">
                  <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>정기배송 배송 주기 설정 (Error 1 Target)</label>
                <!-- Select binds to displayInterval. It updates, but actualInterval remains unchanged -->
                <select :value="displayInterval" @change="onIntervalChange" class="form-select">
                  <option value="every-week">매주 배송 (1주일 마다)</option>
                  <option value="every-2-weeks">격주 배송 (2주일 마다)</option>
                  <option value="every-month">매월 배송 (4주일 마다)</option>
                </select>
                <p class="helper-txt">* 주기 변경 후 하단 신청을 완료하면 주기 변환 오류(Error 1)가 유발됩니다.</p>
              </div>

              <div class="form-group">
                <label>첫 배송 희망일자</label>
                <input type="date" v-model="subStartDate" class="form-input" />
              </div>

              <button type="button" @click="handlePlaceSubscription" class="submit-sub-btn">
                📅 정기배송 신규 신청
              </button>
            </div>

            <div class="calendar-ui-visualizer">
              <h4>🗓️ 배송 주기 달력 미리보기</h4>
              <div class="calendar-grid">
                <span class="day-lbl">일</span>
                <span class="day-lbl">월</span>
                <span class="day-lbl">화</span>
                <span class="day-lbl">수</span>
                <span class="day-lbl">목</span>
                <span class="day-lbl">금</span>
                <span class="day-lbl">토</span>
                
                <!-- Mock calendar squares -->
                <div v-for="day in 28" :key="day" class="calendar-cell" :class="{ highlighted: isDeliveryDay(day) }">
                  <span class="d-num">{{ day }}</span>
                  <span v-if="isDeliveryDay(day)" class="del-ic">🥕</span>
                </div>
              </div>
              <p class="cal-legend">
                * 화면 표시 주기: <strong class="color-highlight">{{ displayInterval === 'every-week' ? '매주' : displayInterval === 'every-2-weeks' ? '격주' : '매월' }}</strong> 배송 기준 일정입니다.
              </p>
            </div>
          </div>
        </div>

        {/* TAB 5: MY ORDERS */}
        <div v-if="currentTab === 'orders'" class="panel-section my-orders-panel">
          <div class="panel-header">
            <h2>📦 나의 구매 및 정기배송 신청 내역</h2>
          </div>

          <div class="orders-stack">
            <div v-for="order in orders" :key="order.id" class="order-invoice-card">
              <div class="header">
                <span class="ord-id">주문번호: {{ order.id }}</span>
                <span class="status" :class="order.status">{{ order.status }}</span>
              </div>
              
              <div class="body">
                <div class="delivery-details">
                  <p>수령인: {{ order.name }}</p>
                  <p>연락처: {{ order.phone }}</p>
                  <p>주소지: {{ order.address }}</p>
                  <p>배송방식: <strong>{{ order.deliveryType }}</strong></p>
                  <p v-if="order.deliveryType === '정기배송'">저장된 배송 주기: <strong class="warning">{{ order.interval }}</strong></p>
                </div>

                <div class="items-list">
                  <h5>주문 농산물 내역</h5>
                  <ul>
                    <li v-for="item in order.items" :key="item.productId">
                      {{ item.name }} x {{ item.quantity }}개 ({{ (item.price * item.quantity).toLocaleString() }}원)
                    </li>
                  </ul>
                </div>
              </div>

              <div class="footer">
                <button 
                  type="button" 
                  v-if="order.status !== '취소됨'" 
                  @click="handleCancelOrder(order.id)" 
                  class="cancel-order-btn"
                >
                  주문 취소하기 (Error 3)
                </button>
              </div>
            </div>

            <div v-if="orders.length === 0" class="empty-placeholder">
              아직 주문하신 내역이 존재하지 않습니다.
            </div>
          </div>
        </div>

      </main>

      {/* Right Column: Mini Shopping Cart widget */}
      <aside class="panel-section shopping-cart-sidebar">
        <div class="panel-header-row-vertical">
          <h3>🛒 나의 장바구니</h3>
          <button type="button" @click="handleSortCart" class="mini-sort-btn" v-if="cart.length > 1">
            ⇅ 가격 오름차 정렬 (Error 4)
          </button>
        </div>

        <div class="cart-items-stack">
          <div v-for="item in cart" :key="item.id" class="cart-item-card">
            <div class="details">
              <h4>{{ getProductName(item.productId) }}</h4>
              <span>단가: {{ item.price.toLocaleString() }}원</span>
            </div>
            
            <div class="qty-control-row">
              <button type="button" @click="changeCartQty(item, -1)" class="adjust-btn">-</button>
              <span class="qty-num">{{ item.quantity }}</span>
              <button type="button" @click="changeCartQty(item, 1)" class="adjust-btn">+</button>
              
              <button type="button" @click="removeFromCart(item.id)" class="del-item-btn">&times;</button>
            </div>
          </div>

          <div v-if="cart.length === 0" class="empty-placeholder">장바구니가 비었습니다.</div>
        </div>

        <div class="cart-invoice-summary" v-if="cart.length > 0">
          <div class="price-row">
            <span>합계 금액:</span>
            <span class="total-p">{{ totalCartPrice.toLocaleString() }}원</span>
          </div>

          <div class="checkout-form-fields">
            <h4>배송 정보 기입</h4>
            <input type="text" placeholder="받는 사람..." v-model="buyerName" class="cart-input" required />
            <input type="text" placeholder="연락처..." v-model="buyerPhone" class="cart-input" required />
            <input type="text" placeholder="배송지 주소..." v-model="buyerAddress" class="cart-input" required />
          </div>

          <button type="button" @click="handlePlaceOrder" class="checkout-submit-btn">
            💰 신용카드 일반 결제 및 주문
          </button>
        </div>
      </aside>

    </div>

    {/* Toast Container warnings */}
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-card" :class="t.type">
        <span class="toast-icon">
          {{ t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️' }}
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button class="toast-close" @click="removeToast(t.id)">&times;</button>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    // DB States
    const products = ref([]);
    const producers = ref([]);
    const orders = ref([]);
    const reviews = ref([]);

    // Cart States
    const cart = ref([]);

    // Filters
    const searchQuery = ref('');
    const selectedRegion = ref('All');
    const selectedCategory = ref('All');
    const mobileFilterOpen = ref(false);

    // Active Navigation
    const currentTab = ref('shop');
    const activeProductId = ref('product-01');

    // Details page inputs
    const detailQuantity = ref(1);
    const newReviewRater = ref('');
    const newReviewRating = ref(5);
    const newReviewComment = ref('');

    // Cart checkout fields
    const buyerName = ref('홍길동');
    const buyerPhone = ref('010-1234-5678');
    const buyerAddress = ref('서울시 강남구 논현동 123번지');

    // Subscription inputs (Error 1 Targets)
    const subProductId = ref('product-01');
    const subStartDate = ref('2026-08-01');
    const displayInterval = ref('every-week');
    const actualInterval = ref('every-week');

    // Toasts
    const toasts = ref([]);

    onMounted(() => {
      loadProducts();
      loadProducers();
      loadOrders();
      loadReviews();
    });

    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        products.value = data;
      } catch (err) {
        showToast('농산물 정보 로드 실패', 'danger');
      }
    };

    const loadProducers = async () => {
      try {
        const res = await fetch('/api/producers');
        const data = await res.json();
        producers.value = data;
      } catch (err) {
        showToast('생산자 스토리 로드 실패', 'danger');
      }
    };

    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        orders.value = data;
      } catch (err) {
        showToast('구매 내역 갱신 실패', 'danger');
      }
    };

    const loadReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        reviews.value = data;
      } catch (err) {
        showToast('리뷰 목록 갱신 실패', 'danger');
      }
    };

    const showToast = (message, type = 'info') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    };

    const removeToast = (id) => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    };

    // Helper functions
    const getProducerName = (producerId) => {
      const p = producers.value.find(x => x.id === producerId);
      return p ? p.name : '친환경 농가';
    };

    const getProductName = (productId) => {
      const p = products.value.find(x => x.id === productId);
      return p ? p.name : '신선 농산물';
    };

    // Filter computation
    const filteredProducts = computed(() => {
      return products.value.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                              getProducerName(p.producerId).toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesRegion = selectedRegion.value === 'All' || p.region === selectedRegion.value;
        const matchesCategory = selectedCategory.value === 'All' || p.category === selectedCategory.value;
        return matchesSearch && matchesRegion && matchesCategory;
      });
    });

    // Cart operations
    const handleAddToCart = (product, qty = 1) => {
      if (product.stock < qty) {
        showToast('주문 수량이 재고 수량보다 많습니다.', 'warning');
        return;
      }

      const existing = cart.value.find(item => item.productId === product.id);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.value.push({
          id: `cart-${Date.now()}`,
          productId: product.id,
          quantity: qty,
          price: product.price
        });
      }
      showToast(`${product.name}이 장바구니에 담겼습니다.`, 'success');
    };

    const changeCartQty = (item, direction) => {
      const targetP = products.value.find(p => p.id === item.productId) || { stock: 999 };
      const nextQty = item.quantity + direction;
      
      if (nextQty < 1) return;
      if (nextQty > targetP.stock) {
        showToast('산지 재고 한계를 초과하여 주문할 수 없습니다.', 'warning');
        return;
      }
      item.quantity = nextQty;
    };

    const removeFromCart = (cartId) => {
      cart.value = cart.value.filter(item => item.id !== cartId);
    };

    const totalCartPrice = computed(() => {
      return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    // Sort Cart Items (Error 4 logic)
    const handleSortCart = () => {
      if (cart.value.length <= 1) return;
      
      const originalQuantities = cart.value.map(item => item.quantity);
      
      // Sort cart items by price
      const sorted = [...cart.value].sort((a, b) => a.price - b.price);

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 장바구니 정렬을 진행할 때, 가격순으로 품목 배치는 정상 변경하지만 
      // 개별 상품들의 구매 희망 수량(quantity)은 정렬되기 전의 인덱스 기준 원본 배열(originalQuantities)의 수량으로 
      // 덮어씌웁니다. 이로 인해 정렬 후 수량 값들이 엉뚱한 타 상품으로 바뀌게 됩니다.
      cart.value = sorted.map((item, idx) => ({
        ...item,
        quantity: originalQuantities[idx]
      }));

      showToast('장바구니가 오름차순 정렬되었습니다. (단, 품목별 수량이 밀렸을 수 있습니다)', 'warning');
    };

    // Change delivery interval dropdown (Error 1 Logic)
    const onIntervalChange = (e) => {
      const newVal = e.target.value;
      displayInterval.value = newVal;

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 사용자가 정기배송 주기를 변경할 때, 캘린더 화면 표기용 변수(displayInterval)는 
      // 즉각 새 주기로 반영하지만 실제 주문 생성에 전송할 변수(actualInterval)는 이전 값으로 잠가둡니다. 
      // 이로 인해 캘린더는 새 주기를 그리지만, 정기배송 신청 후 내역을 확인해 보면 이전 주기로 수집되어 있습니다.
      // 원래 반영되어야 할 라인 누락:
      // actualInterval.value = newVal;
    };

    // Check calendar delivery highlight mock
    const isDeliveryDay = (day) => {
      if (displayInterval.value === 'every-week') {
        return day % 7 === 1; // Highlight every 7 days
      } else if (displayInterval.value === 'every-2-weeks') {
        return day === 1 || day === 15; // Highlight every 14 days
      } else {
        return day === 1; // Highlight only monthly start
      }
    };

    // Checkout orders (Error 2 Trigger)
    const handlePlaceOrder = async () => {
      if (!buyerName.value || !buyerPhone.value || !buyerAddress.value) {
        showToast('배송 수령인 정보를 빠짐없이 기입해 주세요.', 'warning');
        return;
      }

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: buyerName.value,
            phone: buyerPhone.value,
            address: buyerAddress.value,
            items: cart.value,
            deliveryType: '일반배송',
            interval: 'N/A'
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '주문 생성에 실패했습니다.');
        }

        showToast(`주문번호 [${data.id}] 결제가 승인되고 주문 접수되었습니다!`, 'success');
        cart.value = [];
        loadProducts();
        loadOrders();
      } catch (err) {
        showToast(`[결제 거절] ${err.message}`, 'danger');
      }
    };

    // Subscription Checkout (Error 1 Transmitter)
    const handlePlaceSubscription = async () => {
      const p = products.value.find(x => x.id === subProductId.value);
      if (!p) return;

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: buyerName.value,
            phone: buyerPhone.value,
            address: buyerAddress.value,
            items: [{ productId: subProductId.value, quantity: 1, price: p.price }],
            deliveryType: '정기배송',
            interval: actualInterval.value // Stale interval value submitted (Error 1)
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showToast('정기배송 구독 신청이 성사되었습니다. 매월 캘린더 주기에 맞춰 직송됩니다.', 'success');
        loadProducts();
        loadOrders();
        currentTab.value = 'orders';
      } catch (err) {
        showToast(`[구독 신청 실패] ${err.message}`, 'danger');
      }
    };

    // Cancel order (Error 3 Trigger)
    const handleCancelOrder = async (orderId) => {
      try {
        const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
        if (res.ok) {
          showToast('해당 주문이 성공적으로 취소되었습니다. (재고 미복원 유의)', 'warning');
          loadOrders();
          loadProducts();
        }
      } catch (err) {
        showToast('주문 취소 통신 장애', 'danger');
      }
    };

    // Detail tab router
    const openProductDetail = (productId) => {
      activeProductId.value = productId;
      detailQuantity.value = 1;
      currentTab.value = 'detail';
    };

    const buyDirectFromDetail = (product) => {
      cart.value = [{
        id: `cart-${Date.now()}`,
        productId: product.id,
        quantity: detailQuantity.value,
        price: product.price
      }];
      showToast('주문서가 바로 생성되었습니다. 배송 정보 입력 후 결제하세요.', 'info');
    };

    const activeProduct = computed(() => {
      return products.value.find(p => p.id === activeProductId.value) || {};
    });

    const productReviews = computed(() => {
      return reviews.value.filter(r => r.productId === activeProductId.value);
    });

    // Review Submit
    const handleSubmitReview = async () => {
      if (!newReviewComment.value.trim()) return;

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: activeProductId.value,
            rater: newReviewRater.value,
            rating: newReviewRating.value,
            comment: newReviewComment.value
          })
        });

        if (res.ok) {
          showToast('소중한 농산물 시식 후기가 등록되었습니다.', 'success');
          newReviewRater.value = '';
          newReviewComment.value = '';
          loadReviews();
        }
      } catch (err) {
        showToast('후기 작성 에러', 'danger');
      }
    };

    const handleResetSandbox = async () => {
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          showToast('플랫폼 농산물 직거래 샌드박스가 초기화되었습니다.', 'warning');
          cart.value = [];
          loadProducts();
          loadOrders();
          loadReviews();
          currentTab.value = 'shop';
        }
      } catch (err) {
        showToast('초기화 API 에러', 'danger');
      }
    };

    return {
      products,
      producers,
      orders,
      reviews,
      cart,
      searchQuery,
      selectedRegion,
      selectedCategory,
      mobileFilterOpen: ref(false),
      currentTab,
      activeProductId,
      detailQuantity,
      newReviewRater,
      newReviewRating,
      newReviewComment,
      buyerName,
      buyerPhone,
      buyerAddress,
      subProductId,
      subStartDate,
      displayInterval,
      actualInterval,
      toasts,

      removeToast,
      getProducerName,
      getProductName,
      filteredProducts,
      handleAddToCart,
      changeCartQty,
      removeFromCart,
      totalCartPrice,
      handleSortCart,
      onIntervalChange,
      isDeliveryDay,
      handlePlaceOrder,
      handlePlaceSubscription,
      handleCancelOrder,
      openProductDetail,
      buyDirectFromDetail,
      activeProduct,
      productReviews,
      handleSubmitReview,
      handleResetSandbox
    };
  }
}
</script>
