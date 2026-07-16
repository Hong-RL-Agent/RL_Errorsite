<template>
  <div class="mealdash-app">
    <!-- Navbar Header -->
    <header class="app-navbar">
      <div class="navbar-logo">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span class="logo-title">MealDash</span>
        <span class="logo-subtitle">초고속 딜리버리 허브</span>
      </div>
      <div class="navbar-actions">
        <button class="nav-btn" @click="activeView = 'restaurants'">🍔 맛집 탐색</button>
        <button class="nav-btn" @click="activeView = 'orders'">📋 내 주문내역 ({{ orders.length }})</button>
        <button class="mobile-cart-toggle" @click="showCartMobile = !showCartMobile">
          🛒 장바구니 ({{ cart.length }})
        </button>
      </div>
    </header>

    <!-- Address bar section (Error 5 testing) -->
    <section class="address-search-bar">
      <div class="address-input-wrapper">
        <span class="loc-pin">📍</span>
        <input 
          type="text" 
          v-model="addressQuery" 
          placeholder="배달받으실 주소지를 동명으로 입력하세요 (예: 테스트동)"
          @keyup.enter="searchAddress"
        />
        <button class="search-addr-btn" @click="searchAddress" :disabled="isSearchingAddress">
          {{ isSearchingAddress ? '검색 중...' : '검색' }}
        </button>
      </div>
      
      <!-- Address Results dropdown -->
      <div v-if="searchResults.length > 0" class="address-dropdown-results">
        <div 
          v-for="addr in searchResults" 
          :key="addr.code" 
          class="addr-item"
          @click="selectAddress(addr.name)"
        >
          <span>{{ addr.name }}</span>
          <span class="zipcode">[{{ addr.code }}]</span>
        </div>
      </div>

      <div v-if="selectedAddress" class="active-address-badge">
        배달 주소 설정됨: <strong>{{ selectedAddress }}</strong>
      </div>
    </section>

    <!-- Main Content Workspace -->
    <div class="dashboard-grid">
      <!-- Left sidebar categories -->
      <aside class="panel-section column-categories">
        <div class="panel-header">
          <h2>🏷️ 음식 카테고리</h2>
        </div>
        <div class="category-menu-list">
          <button 
            v-for="cat in ['전체', '버거', '피자', '중식', '일식', '치킨']" 
            :key="cat"
            :class="{ active: selectedCategory === cat }"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </aside>

      <!-- Center column (Main view) -->
      <main class="panel-section column-main">
        <!-- Restaurants list -->
        <div v-if="activeView === 'restaurants'">
          <div v-if="!selectedRestaurant">
            <div class="panel-header">
              <h2>🛵 우리 동네 맛집 목록 ({{ filteredRestaurants.length }}곳)</h2>
            </div>
            <div class="restaurants-grid">
              <div 
                v-for="rest in filteredRestaurants" 
                :key="rest.id" 
                class="restaurant-card"
                @click="selectedRestaurant = rest"
              >
                <div class="card-image-placeholder">
                  <span>{{ rest.category }} 전문</span>
                </div>
                <div class="card-body">
                  <h3>{{ rest.name }}</h3>
                  <p class="rating-line">⭐ {{ rest.rating }} | 배달 {{ rest.deliveryTime }}</p>
                  <p class="fee-line">배달팁 ₩{{ rest.deliveryFee.toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Restaurant Menu list Details -->
          <div v-else class="restaurant-detail-pane">
            <button class="back-list-btn" @click="selectedRestaurant = null">
              ← 맛집 목록으로 돌아가기
            </button>
            <div class="detail-header">
              <h2>{{ selectedRestaurant.name }} Menu</h2>
              <span class="detail-rating">⭐ {{ selectedRestaurant.rating }}</span>
            </div>

            <div class="menu-items-grid">
              <div v-for="menu in selectedRestaurant.menus" :key="menu.id" class="menu-item-card">
                <div class="menu-img-container">
                  <!-- Case sensitive image (Error 4) -->
                  <img :src="`/images/${menu.image}`" :alt="menu.name" class="menu-image" />
                </div>
                <div class="menu-body">
                  <h4>{{ menu.name }}</h4>
                  <p class="menu-price">₩{{ menu.price.toLocaleString() }}</p>
                  <button 
                    class="add-cart-btn" 
                    @click="addToCartItem(menu, selectedRestaurant)"
                  >
                    🛒 장바구니 담기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders History -->
        <div v-else-if="activeView === 'orders'">
          <div class="panel-header">
            <h2>📋 주문 내역서 및 배달 진행 상태</h2>
          </div>

          <div v-if="orders.length === 0" class="empty-placeholder">
            아직 체결된 주문 내역이 없습니다.
          </div>
          <div v-else class="orders-list">
            <div v-for="ord in orders" :key="ord.id" class="order-record-card">
              <div class="order-card-header">
                <div>
                  <span class="order-id">주문번호: {{ ord.id }}</span>
                  <span class="order-date">{{ formatDate(ord.createdAt) }}</span>
                </div>
                <button 
                  v-if="ord.status === '주문 완료'" 
                  class="cancel-order-btn"
                  @click="cancelOrder(ord.id)"
                >
                  주문 취소하기
                </button>
              </div>

              <div class="order-items-summary">
                <div v-for="item in ord.items" :key="item.id" class="summary-row">
                  <span>[{{ item.restaurantName }}] {{ item.name }} x {{ item.quantity }}</span>
                  <span>₩{{ (item.price * item.quantity).toLocaleString() }}</span>
                </div>
              </div>

              <!-- Order status timeline -->
              <div class="order-timeline-track">
                <div class="timeline-step" :class="{ active: ord.status === '주문 완료' }">
                  <div class="step-dot"></div>
                  <span>주문 접수</span>
                </div>
                <div class="timeline-step" :class="{ active: ord.status === '배달 준비' }">
                  <div class="step-dot"></div>
                  <span>요리/조리 중</span>
                </div>
                <div class="timeline-step" :class="{ active: ord.status === '배달 중' }">
                  <div class="step-dot"></div>
                  <span>배달 시작</span>
                </div>
                <div class="timeline-step" :class="{ active: ord.status === '배달 완료' || ord.status === '주문 취소됨' }">
                  <div class="step-dot" :class="{ canceled: ord.status === '주문 취소됨' }"></div>
                  <span>{{ ord.status === '주문 취소됨' ? '주문 취소됨' : '배달 완료' }}</span>
                </div>
              </div>

              <div class="order-footer">
                <span>실제 총 결제액: <strong>₩{{ ord.totalPrice.toLocaleString() }}</strong></span>
                <span v-if="ord.couponId" class="used-coupon-lbl">쿠폰 적용 완료 ({{ ord.couponId }})</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Right column: Cart panel -->
      <aside 
        class="panel-section column-cart"
        :class="{ 'mobile-open': showCartMobile }"
      >
        <div class="panel-header cart-header-row">
          <h2>🛒 주문 장바구니</h2>
          <button class="cart-close-mobile" @click="showCartMobile = false">&times;</button>
        </div>

        <div class="cart-inner-container">
          <div v-if="cart.length === 0" class="empty-cart-placeholder">
            장바구니가 비어 있습니다. 음식점에서 메뉴를 골라 담아보세요.
          </div>
          <div v-else class="cart-items-list">
            <div v-for="(item, index) in cart" :key="index" class="cart-item-row">
              <div class="cart-item-info">
                <span class="restaurant-origin">[{{ item.restaurantName }}]</span>
                <span class="menu-name">{{ item.name }}</span>
                <span class="menu-price">₩{{ item.price.toLocaleString() }}</span>
              </div>
              <div class="quantity-controller">
                <button @click="changeQty(index, -1)">-</button>
                <span class="qty-num">{{ item.quantity }}</span>
                <button @click="changeQty(index, 1)">+</button>
              </div>
            </div>
            
            <!-- Coupon Selection -->
            <div class="coupon-selection-box">
              <label>🏷️ 할인 쿠폰 사용</label>
              <select v-model="selectedCouponId" @change="applyCoupon">
                <option value="">적용할 쿠폰 선택 안함</option>
                <option 
                  v-for="cp in coupons" 
                  :key="cp.id" 
                  :value="cp.id"
                  :disabled="cp.used"
                >
                  {{ cp.name }} - {{ cp.discount.toLocaleString() }}원 {{ cp.used ? '(사용완료)' : '' }}
                </option>
              </select>
            </div>

            <!-- Price receipt block -->
            <div class="cart-receipt-board">
              <div class="receipt-row">
                <span>메뉴 합계금액</span>
                <span>₩{{ subtotal.toLocaleString() }}</span>
              </div>
              <div v-if="couponDiscount > 0" class="receipt-row text-success">
                <span>쿠폰 할인금액</span>
                <span>-₩{{ couponDiscount.toLocaleString() }}</span>
              </div>
              <div class="receipt-row">
                <span>배달팁</span>
                <span>₩{{ cartDeliveryFee.toLocaleString() }}</span>
              </div>
              <div class="receipt-row total">
                <span>최종 결제 예정액</span>
                <span>₩{{ cartTotal.toLocaleString() }}</span>
              </div>
            </div>

            <button 
              class="checkout-submit-btn" 
              @click="submitOrder"
              :disabled="isSubmittingOrder"
            >
              {{ isSubmittingOrder ? '주문 처리 중...' : '배달 주문 완료하기' }}
            </button>
            <p class="help-text text-center">여러 음식점의 메뉴가 섞인 장바구니 주문 시 백엔드 오류(HTTP 500)가 납니다.</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Toast message logs -->
    <div class="toast-container">
      <div 
        v-for="t in toasts" 
        :key="t.id" 
        class="toast-card" 
        :class="t.type"
      >
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
    // Refs
    const restaurants = ref([]);
    const coupons = ref([]);
    const orders = ref([]);
    const cart = ref([]);

    // Views
    const activeView = ref('restaurants'); // restaurants, orders
    const selectedRestaurant = ref(null);
    const selectedCategory = ref('전체');

    // Forms
    const addressQuery = ref('');
    const searchResults = ref([]);
    const selectedAddress = ref('');
    const selectedCouponId = ref('');
    const couponDiscount = ref(0);

    // UI flags
    const isSearchingAddress = ref(false);
    const isSubmittingOrder = ref(false);
    const showCartMobile = ref(false);
    const toasts = ref([]);

    onMounted(() => {
      loadRestaurants();
      loadCoupons();
      loadOrders();
    });

    const loadRestaurants = async () => {
      try {
        const res = await fetch('/api/restaurants');
        restaurants.value = await res.json();
      } catch (err) {
        showToast('맛집 데이터 수신 실패', 'danger');
      }
    };

    const loadCoupons = async () => {
      try {
        const res = await fetch('/api/coupons');
        coupons.value = await res.json();
      } catch (err) {
        showToast('쿠폰함 로드 실패', 'danger');
      }
    };

    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        orders.value = await res.json();
      } catch (err) {
        showToast('주문 내역 로드 실패', 'danger');
      }
    };

    const selectCategory = (cat) => {
      selectedCategory.value = cat;
      selectedRestaurant.value = null;
      activeView.value = 'restaurants';
    };

    const filteredRestaurants = computed(() => {
      if (selectedCategory.value === '전체') {
        return restaurants.value;
      }
      return restaurants.value.filter(r => r.category === selectedCategory.value);
    });

    // Cart calculations
    const subtotal = computed(() => {
      return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const cartDeliveryFee = computed(() => {
      if (cart.value.length === 0) return 0;
      // Get the highest delivery fee from the restaurants in cart
      const fees = cart.value.map(item => {
        const rest = restaurants.value.find(r => r.id === item.restaurantId);
        return rest ? rest.deliveryFee : 0;
      });
      return Math.max(...fees);
    });

    const cartTotal = computed(() => {
      const val = subtotal.value - couponDiscount.value + cartDeliveryFee.value;
      return val < 0 ? 0 : val;
    });

    // Apply coupon handler
    const applyCoupon = () => {
      if (!selectedCouponId.value) {
        couponDiscount.value = 0;
        return;
      }
      const cp = coupons.value.find(c => c.id === selectedCouponId.value);
      if (cp) {
        // Flat discount
        couponDiscount.value = cp.discount;
      }
    };

    // Add to cart with Error 1
    const addToCartItem = (menuItem, restaurant) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 장바구니에 새 메뉴를 넣을 때, 기존에 장바구니에 다른 매장의 음식이 들어 있는지 
      // 체크하여 경고 및 비우기를 처리해야 하지만, 이 단계를 무시하고 무조건 배열에 추가하여
      // 하나의 장바구니에 여러 음식점 메뉴가 섞여서 들어갈 수 있게 허용합니다.
      const exist = cart.value.find(item => item.id === menuItem.id);
      if (exist) {
        exist.quantity += 1;
      } else {
        cart.value.push({
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        });
      }
      showToast(`'${menuItem.name}'을 장바구니에 넣었습니다.`, 'success');
    };

    const changeQty = (index, delta) => {
      const item = cart.value[index];
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart.value.splice(index, 1);
      }
    };

    // Address Search with timeout (Error 5)
    const searchAddress = async () => {
      if (!addressQuery.value.trim()) return;

      isSearchingAddress.value = true;
      searchResults.value = [];

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend / Network
      // DESCRIPTION: 주소 검색 요청 송신 시 3초 타임아웃 제한이 적용된 AbortController를 생성합니다.
      // 사용자가 '테스트동'을 검색하면 서버 측 지연 7초와 충돌하여, 정확히 3초 시점에 요청 중단이 트리거되며 
      // 타임아웃 에러 토스트를 송출합니다.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 3000);

      try {
        const res = await fetch(`/api/address/search?query=${encodeURIComponent(addressQuery.value)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        searchResults.value = data;
        if (data.length === 0) {
          showToast('일치하는 주소가 없습니다.', 'warning');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          showToast('주소 검색 요청이 3초 시간 초과로 강제 중단되었습니다. (네트워크 타임아웃)', 'danger');
        } else {
          showToast(`검색 에러: ${err.message}`, 'danger');
        }
      } finally {
        isSearchingAddress.value = false;
      }
    };

    const selectAddress = (addrName) => {
      selectedAddress.value = addrName;
      searchResults.value = [];
      addressQuery.value = '';
      showToast(`배달 주소가 '${addrName}'(으)로 설정되었습니다.`, 'success');
    };

    // Submit Order (Error 2 test)
    const submitOrder = async () => {
      if (!selectedAddress.value) {
        showToast('먼저 상단 주소창에서 배달 주소지를 설정해 주세요.', 'warning');
        return;
      }

      isSubmittingOrder.value = true;

      const payload = {
        items: cart.value,
        couponId: selectedCouponId.value || null,
        totalPrice: cartTotal.value,
        address: selectedAddress.value
      };

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '주문 생성 거부');
        }

        showToast('음식 주문이 정상 접수되었습니다!', 'success');
        cart.value = [];
        selectedCouponId.value = '';
        couponDiscount.value = 0;
        showCartMobile.value = false;
        
        loadOrders();
        loadCoupons(); // Refresh coupon usage
        activeView.value = 'orders';
      } catch (err) {
        showToast(`주문 실패: ${err.message}`, 'danger');
      } finally {
        isSubmittingOrder.value = false;
      }
    };

    // Cancel order (Error 3 test)
    const cancelOrder = async (orderId) => {
      if (!confirm('정말 이 주문 배달을 취소하시겠습니까?')) return;

      try {
        const res = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST'
        });
        const data = await res.json();

        if (res.ok) {
          showToast('주문 배달이 성공적으로 취소되었습니다.', 'success');
          loadOrders();
          loadCoupons(); // 쿠폰 상태를 다시 불러오나, 복구 로직 누락(Error 3)으로 사용불가로 남아 있음
        } else {
          showToast(data.error, 'danger');
        }
      } catch (err) {
        showToast('통신 장애가 일어났습니다.', 'danger');
      }
    };

    // Toast helpers
    const showToast = (message, type = 'info') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
      }, 4500);
    };

    const removeToast = (id) => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    };

    const formatDate = (isoString) => {
      const d = new Date(isoString);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    return {
      restaurants,
      coupons,
      orders,
      cart,
      activeView,
      selectedRestaurant,
      selectedCategory,
      addressQuery,
      searchResults,
      selectedAddress,
      selectedCouponId,
      couponDiscount,
      isSearchingAddress,
      isSubmittingOrder,
      showCartMobile,
      toasts,
      filteredRestaurants,
      subtotal,
      cartDeliveryFee,
      cartTotal,
      selectCategory,
      applyCoupon,
      addToCartItem,
      changeQty,
      searchAddress,
      selectAddress,
      submitOrder,
      cancelOrder,
      removeToast,
      formatDate
    };
  }
};
</script>
