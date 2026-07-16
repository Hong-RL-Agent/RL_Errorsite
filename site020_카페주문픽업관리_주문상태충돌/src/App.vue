<template>
  <div class="cupqueue-app">
    <!-- Navbar Header -->
    <header class="app-navbar">
      <div class="navbar-logo">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8h1a4 4 0 018 0v1a4 4 0 01-4 4h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <path d="M6 1v3M10 1v3M14 1v3" />
        </svg>
        <span class="logo-title">CupQueue</span>
        <span class="logo-subtitle">익스프레스 카페 픽업 대기 서비스</span>
      </div>
      <div class="navbar-search">
        <input 
          type="text" 
          placeholder="음료 메뉴 검색..." 
          v-model="searchQuery"
          class="nav-search-bar"
        />
      </div>
    </header>

    <!-- Workspace Layout Grid -->
    <div class="workspace-grid">
      
      <!-- Left sidebar: Drink Category selectors -->
      <aside class="panel-section left-categories-panel">
        <div class="panel-header">
          <h2>🏷️ 카테고리</h2>
        </div>
        <div class="category-menu-list">
          <button 
            v-for="cat in ['All', '커피', '라떼', '에이드', '티']" 
            :key="cat"
            class="category-menu-item"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ cat === 'All' ? '전체 메뉴' : cat }}
          </button>
        </div>
      </aside>

      <!-- Center: Drink Menu slip cards catalog -->
      <main class="center-menu-workspace">
        <section class="panel-section menu-slip-catalog">
          <div class="panel-header">
            <h2>☕ 오늘의 바리스타 카페 주문표</h2>
            <p class="subtitle">체크하고 장바구니에 담아 픽업 시간을 예약하세요.</p>
          </div>

          <div class="menu-slips-grid">
            <div 
              v-for="drink in filteredDrinks" 
              :key="drink.id"
              class="cafe-order-slip"
            >
              <div class="slip-stamp">APPROVED</div>
              <div class="slip-header">
                <span class="drink-cat">[{ drink.category }]</span>
                <span class="drink-id">No. {{ drink.id }}</span>
              </div>
              <div class="slip-body">
                <h3>{{ drink.name }}</h3>
                <p class="desc">{{ drink.description }}</p>
                <div class="slip-pricing">
                  <span>기본 제공가:</span>
                  <strong class="price">{{ drink.basePrice.toLocaleString() }}원</strong>
                </div>
              </div>
              
              <!-- Quick option choose and Add button -->
              <div class="slip-footer">
                <button class="add-to-cart-btn" @click="addToCart(drink)">🛒 장바구니 추가</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Pickup Time selection panel -->
        <section class="panel-section pickup-slots-section">
          <div class="panel-header">
            <h2>🕒 희망 픽업 시간대 배정</h2>
            <p class="subtitle">픽업 슬롯별 예약 가능한 한도가 한정되어 있습니다.</p>
          </div>

          <div class="pickup-slots-horizontal-row">
            <button 
              v-for="(slotData, slotTime) in slots" 
              :key="slotTime"
              type="button"
              class="pickup-slot-btn"
              :class="{ 
                active: selectedPickupTime === slotTime, 
                full: slotData.occupancy >= slotData.maxLimit 
              }"
              @click="selectPickupTime(slotTime)"
              :disabled="slotData.occupancy >= slotData.maxLimit"
            >
              <span class="time">{{ slotTime }}</span>
              <span class="occupancy">({{ slotData.occupancy }}/{{ slotData.maxLimit }}명)</span>
            </button>
          </div>
        </section>
      </main>

      <!-- Right sidebar: Order Receipt & Order History -->
      <aside class="right-receipt-column">
        
        <!-- Order Receipt card -->
        <section class="panel-section order-receipt-panel">
          <div class="panel-header">
            <h2>🧾 주문 요약 영수증</h2>
          </div>

          <div class="receipt-contents">
            <div class="receipt-items-list">
              <div 
                v-for="item in cart" 
                :key="item.id" 
                class="receipt-item-row"
              >
                <div class="item-main-info">
                  <span class="name">☕ {{ item.name }}</span>
                  <button class="del-item-btn" @click="deleteCartItem(item.id)">&times;</button>
                </div>
                
                <div class="item-options-settings">
                  <!-- Size Selector (Small / Large - Error 1 target) -->
                  <div class="opt-col size-pick">
                    <span class="lbl">크기:</span>
                    <select 
                      :value="item.size" 
                      @change="e => changeCartItemSize(item, e.target.value)"
                      class="opt-select"
                    >
                      <option value="Small">Small (기본)</option>
                      <option value="Large">Large (+1,000원)</option>
                    </select>
                  </div>

                  <!-- Option: Extra Shot (Error 3 Dolce Latte shot target) -->
                  <div class="opt-col shot-pick">
                    <label class="check-lbl">
                      <input 
                        type="checkbox" 
                        v-model="item.options.extraShot" 
                        @change="recalculateCartTotal" 
                      />
                      <span>에스프레소 샷추가 (+500원)</span>
                    </label>
                  </div>

                  <!-- Quantity controller -->
                  <div class="opt-col qty-pick">
                    <span class="lbl">수량:</span>
                    <div class="qty-mesh">
                      <button type="button" class="qty-btn" @click="updateQty(item, -1)">-</button>
                      <span class="qty-val">{{ item.quantity }}</span>
                      <button type="button" class="qty-btn" @click="updateQty(item, 1)">+</button>
                    </div>
                  </div>
                </div>

                <div class="item-subtotal">
                  <span>품목 소계:</span>
                  <strong>{{ ((item.price + (item.options.extraShot ? 500 : 0)) * item.quantity).toLocaleString() }}원</strong>
                </div>
              </div>

              <div v-if="cart.length === 0" class="empty-placeholder">장바구니가 비어 있습니다. 음료주문표에서 담아주세요.</div>
            </div>

            <!-- Receipt total calculation info -->
            <div class="receipt-billing-block">
              <div class="billing-row">
                <span>희망 픽업 시각:</span>
                <strong class="time-highlight">{{ selectedPickupTime || '미선택' }}</strong>
              </div>
              <div class="billing-row total">
                <span>총 청구 금액:</span>
                <span class="total-val">{{ cartTotalCost.toLocaleString() }}원</span>
              </div>
            </div>

            <button 
              type="button" 
              class="place-order-btn" 
              :disabled="isCheckoutBtnDisabled" 
              @click="submitOrder"
            >
              ☕ 픽업 주문 전송하기
            </button>
          </div>
        </section>

        <!-- Order history list -->
        <section class="panel-section my-orders-history">
          <div class="panel-header">
            <h2>📑 최근 주문 내역 ({{ orders.length }})</h2>
          </div>

          <div class="orders-vertical-list">
            <div 
              v-for="order in orders" 
              :key="order.id" 
              class="history-order-card"
            >
              <div class="order-head">
                <span class="id">ID: {{ order.id.slice(-6) }}</span>
                <span class="badge" :class="order.status">{{ order.status === 'ready' ? '예약승인' : '주문취소' }}</span>
                <button 
                  v-if="order.status === 'ready'"
                  class="cancel-btn" 
                  @click="cancelOrder(order.id)"
                >
                  취소
                </button>
              </div>
              <div class="order-info">
                <p class="pickup-lbl">🕒 픽업 시간: <strong>{{ order.pickupTime }}</strong></p>
                <div class="items-summary">
                  <div v-for="item in order.items" :key="item.id" class="sum-item">
                    - {{ item.name }} ({{ item.size }}) x {{ item.quantity }}
                  </div>
                </div>
                <p class="total">결제 요금: <strong>{{ order.totalCost.toLocaleString() }}원</strong></p>
              </div>
            </div>
            <div v-if="orders.length === 0" class="empty-placeholder">주문한 이력이 존재하지 않습니다.</div>
          </div>
        </section>

      </aside>

    </div>

    <!-- Toast alert popups -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-card" :class="t.type">
        <span class="toast-icon">
          {{ t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️' }}
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button class="toast-close" @click="toasts = toasts.filter(x => x.id !== t.id)">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// DB states
const drinks = ref([]);
const slots = ref({});
const orders = ref([]);

// Interactive UI signals
const selectedCategory = ref('All');
const searchQuery = ref('');
const cart = ref([]);
const selectedPickupTime = ref('08:30 - 09:00');
const toasts = ref([]);

// Checkout disabled state control (Error 4 Target)
const isCheckoutBtnDisabled = ref(true);

// Total Cost computed
const cartTotalCost = ref(0);

onMounted(() => {
  loadDrinks();
  loadSlots();
  loadOrders();
});

const loadDrinks = async () => {
  try {
    const res = await fetch('/api/drinks');
    const data = await res.json();
    drinks.value = data;
  } catch (err) {
    showToast('메뉴 음료 목록 조회 실패', 'danger');
  }
};

const loadSlots = async () => {
  try {
    const res = await fetch('/api/slots');
    const data = await res.json();
    slots.value = data;
  } catch (err) {
    showToast('픽업 시간대 조회 실패', 'danger');
  }
};

const loadOrders = async () => {
  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    orders.value = data;
  } catch (err) {
    showToast('주문 내역 조회 실패', 'danger');
  }
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

const selectPickupTime = (time) => {
  selectedPickupTime.value = time;
};

// Filtered drinks list
const filteredDrinks = computed(() => {
  return drinks.value.filter(d => {
    const matchCat = selectedCategory.value === 'All' || d.category === selectedCategory.value;
    const matchSearch = d.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        d.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCat && matchSearch;
  });
});

const addToCart = (drink) => {
  const existing = cart.value.find(item => item.id === drink.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.value.push({
      id: drink.id,
      name: drink.name,
      size: 'Small',
      sizeBefore: 'Small',
      quantity: 1,
      basePrice: drink.basePrice,
      price: drink.basePrice,
      options: { extraShot: false }
    });
  }

  isCheckoutBtnDisabled.value = false; // Enable order
  recalculateCartTotal();
  showToast(`${drink.name} 음료를 영수증 장바구니에 담았습니다.`, 'success');
};

// Error 1: Size conversion from Large to Small keeps Large price in cart total
const changeCartItemSize = (item, newSize) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 장바구니 품목의 사이즈를 Large에서 Small로 하향 조절할 때, 
  // 화면 속성(size)과 이전 값 추적(sizeBefore) 상태는 업데이트하지만, 
  // 실제 금액 계산에 적용되는 단가 변수(item.price)를 기본가격(item.basePrice)으로 복원시키지 않고 
  // 기존 Large 가격(basePrice + 1000) 상태로 그대로 유지합니다.
  if (newSize === 'Small' && item.sizeBefore === 'Large') {
    // 단가 인하 계산식을 무시합니다:
    // item.price = item.basePrice;
  } else {
    item.price = newSize === 'Large' ? item.basePrice + 1000 : item.basePrice;
  }

  item.size = newSize;
  item.sizeBefore = newSize; // Save size change history
  recalculateCartTotal();
};

const updateQty = (item, diff) => {
  item.quantity = Math.max(1, item.quantity + diff);
  recalculateCartTotal();
};

// Error 4: Deleting last item leaves checkout button active
const deleteCartItem = (itemId) => {
  cart.value = cart.value.filter(item => item.id !== itemId);
  recalculateCartTotal();

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 장바구니에서 마지막 상품을 제거하여 카트 리스트가 완전히 비게 되더라도, 
  // 주문하기 결제 승인 단추의 비활성화 참거짓 상태값(isCheckoutBtnDisabled)을 true로 리셋하지 않고 
  // 그대로 false로 남겨두어, 빈 목록으로 오작주문이 전달될 수 있도록 허점을 제공합니다.
  if (cart.value.length === 0) {
    // 원래 적용해야 하는 비활성화 로직:
    // isCheckoutBtnDisabled.value = true;
  }
};

const recalculateCartTotal = () => {
  cartTotalCost.value = cart.value.reduce((sum, item) => {
    const shotPrice = item.options.extraShot ? 500 : 0;
    return sum + (item.price + shotPrice) * item.quantity;
  }, 0);
};

// Place Order
const submitOrder = async () => {
  if (!selectedPickupTime.value) {
    showToast('픽업 시간을 먼저 선택해 주십시오.', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.value,
        pickupTime: selectedPickupTime.value,
        totalCost: cartTotalCost.value
      })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '주문 생성 에러');
    }

    showToast('카페 테이크아웃 픽업 예약이 완료되었습니다.', 'success');
    cart.value = [];
    cartTotalCost.value = 0;
    isCheckoutBtnDisabled.value = true;
    await loadSlots();
    await loadOrders();
  } catch (err) {
    showToast(`[주문 에러] ${err.message}`, 'danger');
  }
};

// Cancel Order (Error 2 test)
const cancelOrder = async (orderId) => {
  if (!confirm('예약된 카페 주문 픽업을 취소하시겠습니까?')) return;

  try {
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('주문 예약 픽업이 취소되었습니다. (슬롯 점유 인원은 미반환)', 'success');
      await loadSlots();
      await loadOrders();
    }
  } catch (err) {
    showToast('주문 예약 취소 실패', 'danger');
  }
};
</script>
