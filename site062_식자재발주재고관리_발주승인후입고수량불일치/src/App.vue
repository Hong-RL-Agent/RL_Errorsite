<template>
  <div class="kitchenstock-app">
    
    <!-- App Header -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span class="logo-title">KitchenStock</span>
        <span class="logo-subtitle">Restaurant Inventory & Smart Supply Coordination</span>
      </div>

      <!-- Dashboard Stats -->
      <div class="header-dashboard">
        <div class="stat-card">
          <span>💰 이번 달 누적 자재 발주 비용:</span>
          <strong class="stat-value">{{ formatPrice(stats.monthlyTotalCost) }}</strong>
        </div>
        <small class="warn-desc">* 입고 취소 시에도 월 누적 비용 및 공급사 실적은 누수 보존됨 (Error 3)</small>
      </div>

      <div class="header-controls">
        <div class="role-selector">
          <span>직원 권한:</span>
          <select v-model="currentRole">
            <option value="STAFF">일반 직원 (STAFF)</option>
            <option value="MANAGER">부서 관리자 (MANAGER)</option>
          </select>
        </div>
        <button class="sandbox-reset-btn" @click="resetSandbox">
          🔄 DB 초기화
        </button>
      </div>
    </header>

    <!-- App Body Grid -->
    <div class="kitchenstock-grid">
      
      <!-- Left Column: Category and Store Filters -->
      <aside class="panel-section filter-sidebar">
        <div class="sidebar-title-row">
          <h3>🏪 매장 지점 & 분류 필터</h3>
          <button class="race-btn-sm" @click="triggerSearchRace">
            ⚡ 검색 경합 (Error 4)
          </button>
        </div>
        <p class="warn-desc">* 대파(3초 지연) ➔ 마늘(0.2초) 검색어 변경 시 최신 목록을 덮어씀 (Error 4)</p>

        <!-- Store Switcher (Error 5 Target) -->
        <div class="filter-group">
          <label>매장 선택:</label>
          <select :value="activeStore" @change="handleStoreSwitch($event.target.value)">
            <option value="직영 A점">직영 A점</option>
            <option value="가맹 B점">가맹 B점</option>
          </select>
        </div>

        <div class="filter-group">
          <label>카테고리:</label>
          <select v-model="selectedCategory">
            <option value="ALL">전체 카테고리</option>
            <option value="채소류">채소류</option>
            <option value="육류">육류</option>
            <option value="유제품">유제품</option>
            <option value="공산품">공산품</option>
            <option value="조미료">조미료</option>
          </select>
        </div>

        <div class="search-box">
          <input 
            type="text" 
            placeholder="식자재 품목 검색..."
            v-model="searchQuery"
          />
        </div>

        <!-- Supplier performance summary -->
        <div class="supplier-widget">
          <h4>🤝 공급업체 누적 발주 실적 (SLA)</h4>
          <div class="supplier-list">
            <div 
              v-for="sup in suppliers" 
              :key="sup.id" 
              class="supplier-item"
            >
              <span>{{ sup.name }} ({{ sup.category }})</span>
              <strong>{{ formatPrice(stats.supplierVolume[sup.name] || 0) }}</strong>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Column: Stock Inventory Table -->
      <main class="panel-section stock-center">
        <div class="center-header">
          <h2>📦 실시간 식자재 재고 관리 대장</h2>
          <div class="sorting-controls">
            <label>
              <input type="checkbox" v-model="sortByExpiry" />
              ⚠️ 유통기한 임박순 정렬 (Error 2)
            </label>
          </div>
        </div>
        <p class="warn-desc">* 유통기한 정렬 상태에서 폐기 시 목록 렌더링 인덱스가 꼬여 타 품목이 감축됨 (Error 2)</p>

        <!-- Stock Table -->
        <div class="table-wrapper">
          <table class="stock-table">
            <thead>
              <tr>
                <th>코드</th>
                <th>품목명</th>
                <th>카테고리</th>
                <th>현재 재고</th>
                <th>유통기한</th>
                <th>단가</th>
                <th>공급처</th>
                <th>조작</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, idx) in sortedInventory" 
                :key="item.id"
                :class="{ 'selected': selectedItem?.id === item.id }"
                @click="selectedItem = item"
              >
                <td>{{ item.id }}</td>
                <td class="bold-text">{{ item.name }}</td>
                <td>{{ item.category }}</td>
                <td :class="{ 'warning-text': item.qty <= 30 }">
                  {{ item.qty }}{{ item.unit }}
                </td>
                <td class="expiry-td">{{ item.exp }}</td>
                <td>{{ formatPrice(item.price) }}</td>
                <td>{{ item.supplier }}</td>
                <td>
                  <button class="action-btn-sm" @click.stop="triggerWastePopup(idx)">
                    🗑️ 폐기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Receivings tracking list -->
        <div class="receivings-widget">
          <h3>📥 입고 처리 완료 내역</h3>
          <div class="receivings-stack">
            <div 
              v-for="rec in receivings" 
              :key="rec.id" 
              class="rec-card"
            >
              <div class="rec-meta">
                <strong>{{ rec.itemName }} ({{ rec.qty }}개)</strong>
                <span :class="['rec-status', rec.status.toLowerCase()]">{{ rec.status }}</span>
              </div>
              <div class="rec-cost-row">
                <span>비용: {{ formatPrice(rec.cost) }} | 일자: {{ rec.date }}</span>
                <button 
                  v-if="rec.status === 'RECEIVED'"
                  class="cancel-btn-sm"
                  @click="cancelReceiving(rec.id)"
                >
                  입고 취소 (Error 3)
                </button>
              </div>
            </div>
            <div v-if="receivings.length === 0" class="empty-lbl-dark">
              최근 처리된 입고 내역이 없습니다.
            </div>
          </div>
        </div>
      </main>

      <!-- Right Column: Order and Alert widgets -->
      <aside class="panel-section operations-sidebar">
        <!-- Store details status (Error 5 Target) -->
        <div class="store-stats-card">
          <h3>📌 {{ activeStore }} 요약 카드</h3>
          <p class="warn-desc">* 지점 변경 시에도 부족 알림 수치 및 대기 총액은 이전 지점 A 캐시로 잔존 노출 (Error 5)</p>
          <div class="store-kpis">
            <div class="kpi-item">
              <span>⚠️ 부족 재고 품목:</span>
              <strong>{{ cachedLowStockAlerts.length }}개 품목</strong>
            </div>
            <div class="kpi-item">
              <span>📊 발주 진행 총액:</span>
              <strong>{{ formatPrice(cachedOrderTotal) }}</strong>
            </div>
          </div>
          <button class="sync-btn" @click="syncStoreCache">
            지점 캐시 강제 동기화
          </button>
        </div>

        <!-- Selected Item Detail / Expiration edit -->
        <div class="detail-widget">
          <h4>🔍 선택 품목 상세 및 유통기한 갱신</h4>
          <div v-if="selectedItem" class="item-detail-panel">
            <div class="field-item">
              <span class="lbl">식자재명:</span>
              <strong>{{ selectedItem.name }}</strong>
            </div>
            <div class="field-item">
              <span class="lbl">유통기한 변경:</span>
              <div class="input-row">
                <input type="date" v-model="expiryInput" />
                <button class="save-btn" @click="updateExpiry">변경</button>
              </div>
            </div>
          </div>
          <div v-else class="empty-lbl-dark">
            목록에서 식자재 품목을 선택해 주세요.
          </div>
        </div>

        <!-- Pending Purchase Orders Approval -->
        <div class="orders-widget">
          <h4>📝 미승인 발주서 목록 (승인 운영)</h4>
          <div class="orders-stack">
            <div 
              v-for="ord in pendingOrders" 
              :key="ord.id" 
              class="order-card"
            >
              <div class="ord-header">
                <strong>{{ ord.itemName }}</strong>
                <span>{{ ord.supplierName }}</span>
              </div>
              <div class="ord-body">
                <span>신청 수량: <strong>{{ ord.quantity }}개</strong></span>
                <span class="ord-date">일자: {{ ord.date }}</span>
              </div>
              <div class="ord-actions">
                <input 
                  type="number" 
                  v-model="orderQtyInputs[ord.id]"
                  placeholder="수량 변경..."
                  class="qty-change-input"
                />
                
                <button 
                  class="race-btn"
                  @click="triggerQuantityApprovalRace(ord, orderQtyInputs[ord.id] || ord.quantity)"
                >
                  ⚡ 수량 변경 + 승인 (Error 1)
                </button>

                <button 
                  class="role-approve-btn"
                  @click="handleApproveWithRole(ord)"
                >
                  🔒 승인 요청 (권한 검증) (Error 6)
                </button>
              </div>
            </div>
            <div v-if="pendingOrders.length === 0" class="empty-lbl-dark">
              대기 중인 발주 요청서가 없습니다.
            </div>
          </div>
        </div>

        <!-- Add Purchase Order Form -->
        <div class="order-form-widget">
          <h4>➕ 신규 자재 발주 생성</h4>
          <form @submit.prevent="createOrder" class="order-form">
            <select v-model="orderItemId">
              <option value="">발주 품목 선택...</option>
              <option 
                v-for="item in inventory" 
                :key="item.id" 
                :value="item.id"
              >
                {{ item.name }} (단가: {{ formatPrice(item.price) }})
              </option>
            </select>
            <input 
              type="number" 
              placeholder="수량..." 
              v-model="orderQty"
            />
            <button type="submit">발주 생성 완료</button>
          </form>
        </div>
      </aside>

    </div>

    <!-- Waste Action Modal Popover -->
    <div v-if="showWasteModal" class="modal-overlay">
      <div class="modal-card">
        <h3>🚨 폐기 등록 조작</h3>
        <p class="warn-desc">선택된 목록 행 인덱스: {{ wasteTargetIndex }}</p>
        <div class="modal-body">
          <label>폐기량 입력:</label>
          <input type="number" v-model="wasteQtyInput" placeholder="수량..." />
        </div>
        <div class="modal-actions">
          <button class="confirm-btn" @click="confirmWaste">폐기 완료</button>
          <button class="close-btn" @click="showWasteModal = false">닫기</button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="t in toasts" 
        :key="t.id" 
        :class="['toast-card', t.type]"
      >
        <span class="toast-icon">
          {{ t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️' }}
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button class="toast-close" @click="removeToast(t.id)">
          &times;
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const inventory = ref([]);
    const orders = ref([]);
    const receivings = ref([]);
    const suppliers = ref([]);
    const stats = ref({ monthlyTotalCost: 0, supplierVolume: {} });

    // Selections
    const activeStore = ref('직영 A점');
    const selectedCategory = ref('ALL');
    const searchQuery = ref('');
    const selectedItem = ref(null);
    const currentRole = ref('STAFF');

    const sortByExpiry = ref(false);

    // Stale Session Cache (Error 5 Target)
    const cachedLowStockAlerts = ref(['대관령 감자 (재고 임박)', '한우 등심 (재고 임박)']);
    const cachedOrderTotal = ref(620000);

    const toasts = ref([]);

    // Forms/Inputs
    const expiryInput = ref('');
    const orderItemId = ref('');
    const orderQty = ref('');
    const orderQtyInputs = ref({});
    const wasteTargetIndex = ref(null);
    const wasteQtyInput = ref('');
    const showWasteModal = ref(false);

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadInventory();
      await loadOrders();
      await loadReceivings();
      await loadSuppliers();
      await loadStats();
    };

    const loadInventory = async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      inventory.value = data;
      if (data.length > 0 && !selectedItem.value) {
        selectedItem.value = data[0];
        expiryInput.value = data[0].exp;
      }
    };

    const loadOrders = async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      orders.value = data;
    };

    const loadReceivings = async () => {
      const res = await fetch('/api/receivings');
      const data = await res.json();
      receivings.value = data;
    };

    const loadSuppliers = async () => {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      suppliers.value = data;
    };

    const loadStats = async () => {
      const res = await fetch('/api/stats');
      const data = await res.json();
      stats.value = data;
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

    const formatPrice = (val) => {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    };

    // Store Switcher (Error 5 Target)
    const handleStoreSwitch = (storeName) => {
      activeStore.value = storeName;
      showToast(`[${storeName}] 지점 재고 테이블을 활성화합니다.`, 'info');
      
      // Update inventory but do NOT sync/clear cached alerts and orders total
      loadInventory();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 매장 지점(A/B)을 전환할 때 재고 목록은 정상적으로 B로 갱신되지만, 
      // 부족 재고 알림 및 발주 대기 총액 캐시 변수(`cachedLowStockAlerts`, `cachedOrderTotal`)를 
      // 비우지 않아 화면 우측 요약 카트에 이전 지점 A의 실적 데이터가 노출되는 결함입니다.
      // Bypasses syncStoreCache()!
    };

    const syncStoreCache = () => {
      if (activeStore.value === '직영 A점') {
        cachedLowStockAlerts.value = ['대관령 감자 (재고 임박)', '한우 등심 (재고 임박)'];
        cachedOrderTotal.value = 620000;
      } else {
        cachedLowStockAlerts.value = ['백설 설탕 10kg (재고 임박)'];
        cachedOrderTotal.value = 180000;
      }
      showToast('지점 캐시 정보가 최신 상태로 강제 동기화되었습니다.', 'success');
    };

    // Sorted list computed
    const sortedInventory = computed(() => {
      let list = [...inventory.value];
      
      if (selectedCategory.value !== 'ALL') {
        list = list.filter(i => i.category === selectedCategory.value);
      }
      if (searchQuery.value) {
        list = list.filter(i => i.name.includes(searchQuery.value));
      }

      if (sortByExpiry.value) {
        return list.sort((a, b) => new Date(a.exp) - new Date(b.exp));
      }
      return list;
    });

    const pendingOrders = computed(() => {
      return orders.value.filter(o => o.status === 'PENDING' || o.status === 'APPROVED');
    });

    // Expiry update
    const updateExpiry = async () => {
      if (!selectedItem.value) return;
      const res = await fetch(`/api/inventory/${selectedItem.value.id}/expiry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exp: expiryInput.value })
      });
      if (res.ok) {
        showToast(`[${selectedItem.value.name}] 유통기한 변경 완료`, 'success');
        await loadInventory();
      }
    };

    // Waste popups (Error 2 Trigger)
    const triggerWastePopup = (idx) => {
      wasteTargetIndex.value = idx;
      wasteQtyInput.value = '';
      showWasteModal.value = true;
    };

    const confirmWaste = async () => {
      if (wasteTargetIndex.value === null || !wasteQtyInput.value) return;

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 재고 목록을 유통기한순으로 정렬한 뒤, 화면 렌더링 루프의 
      // 인덱스(`index`)를 그대로 받아 원본 배열(`inventory`)에 직접 대입하여 재고를 차감합니다. 
      // 이로 인해 엉뚱한 품목의 재고가 감소하는 인덱스 매핑 결함이 발생합니다.
      const res = await fetch('/api/inventory/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: wasteTargetIndex.value, // Passes the sorted view index directly!
          wasteQty: wasteQtyInput.value
        })
      });

      if (res.ok) {
        showToast('식자재 폐기 처리가 완료되었습니다.', 'success');
        showWasteModal.value = false;
        await loadInventory();
      }
    };

    // Create purchase order
    const createOrder = async () => {
      if (!orderItemId.value || !orderQty.value) return;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: orderItemId.value, quantity: orderQty.value })
      });
      if (res.ok) {
        showToast('발주서 생성 성공', 'success');
        orderItemId.value = '';
        orderQty.value = '';
        await loadOrders();
      }
    };

    // Order Quantity Edit + Approve Race (Error 1 Trigger)
    const triggerQuantityApprovalRace = (ord, targetQty) => {
      showToast(`발주 번호 ${ord.id}의 수량을 ${targetQty}로 수정 후 즉시 승인합니다.`, 'info');

      // 1. PATCH qty (4s delay)
      fetch(`/api/orders/${ord.id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: targetQty })
      });

      // 2. POST approve (1s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/orders/${ord.id}/approve`, { method: 'POST' });
        if (res.ok) {
          showToast('발주 승인 성공 (1초 지연 완료)', 'success');
          
          // Trigger automatic receiving for convenience
          await fetch('/api/receivings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: ord.id })
          });
          showToast('해당 발주 건 자동 입고 처리 완료', 'success');
          
          await loadAll();
        }
      }, 100);

      // Optimistic update
      orders.value = orders.value.map(o => o.id === ord.id ? { ...o, quantity: targetQty, status: 'APPROVED' } : o);

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('발주 수량 지연 수정 반영 완료 (입고 승인 예정량은 이전 수량 기준)', 'warning');
        await loadAll();
      }, 4500);
    };

    // Approve order with permission role checks (Error 6 Trigger)
    const handleApproveWithRole = async (ord) => {
      showToast(`[${currentRole.value}] 등급으로 발주서 승인을 요청합니다.`, 'info');
      const res = await fetch(`/api/orders/${ord.id}/approve-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentRole.value })
      });

      if (!res.ok) {
        showToast('HTTP 403: 부서 관리자 승인 권한이 필요하여 요청이 거부되었습니다.', 'danger');
      } else {
        showToast('발주 승인이 정상 수신 완료되었습니다.', 'success');
      }
      
      // Auto receiving
      await fetch('/api/receivings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: ord.id })
      });

      await loadAll();
    };

    // Cancel Receiving (Error 3 Trigger)
    const cancelReceiving = async (recId) => {
      const res = await fetch(`/api/receivings/${recId}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('입고 승인 건을 성공적으로 취소 환원했습니다.', 'success');
        await loadAll();
      }
    };

    // Search query race (Error 4 Trigger)
    const triggerSearchRace = () => {
      showToast('식자재 고속 검색 비동기 경합을 시작합니다. (대파 ➔ 마늘)', 'info');

      // 1. Fetch 대파 (3s delay)
      fetch('/api/inventory/search?q=대파')
        .then(res => res.json())
        .then(data => {
          inventory.value = data;
          showToast('검색 결과 수신: 대파 (3초 지연 오버라이트)', 'warning');
        });

      // 2. Fetch 마늘 (0.2s delay)
      setTimeout(() => {
        fetch('/api/inventory/search?q=마늘')
          .then(res => res.json())
          .then(data => {
            inventory.value = data;
            showToast('검색 결과 수신: 마늘 (0.2초)', 'info');
          });
      }, 150);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('KitchenStock 시스템 데이터베이스가 리셋되었습니다.', 'success');
      selectedItem.value = null;
      await loadAll();
    };

    return {
      inventory,
      orders,
      receivings,
      suppliers,
      stats,
      activeStore,
      selectedCategory,
      searchQuery,
      selectedItem,
      currentRole,
      sortByExpiry,
      cachedLowStockAlerts,
      cachedOrderTotal,
      toasts,
      expiryInput,
      orderItemId,
      orderQty,
      orderQtyInputs,
      wasteTargetIndex,
      wasteQtyInput,
      showWasteModal,
      formatPrice,
      handleStoreSwitch,
      syncStoreCache,
      sortedInventory,
      pendingOrders,
      updateExpiry,
      triggerWastePopup,
      confirmWaste,
      createOrder,
      triggerQuantityApprovalRace,
      handleApproveWithRole,
      cancelReceiving,
      triggerSearchRace,
      resetSandbox,
      removeToast
    };
  }
};
</script>
