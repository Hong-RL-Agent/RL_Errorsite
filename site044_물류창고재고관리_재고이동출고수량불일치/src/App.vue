<script setup>
import { ref, onMounted, computed } from 'vue';

// Database states
const items = ref([]);
const purchaseOrders = ref([]);
const expectedIncomingStocks = ref({});
const activityLogs = ref([]);

// Active navigation screens: 'dashboard' | 'orders' | 'logs'
const activeSection = ref('dashboard');

// Filter & Sort states
const searchQuery = ref('');
const activeWarehouse = ref('All'); // 'All' | 'A' | 'B' | 'C'
const sortBy = ref('name'); // 'name' | 'stock'
const exportFilterName = ref('가전/디지털');

// Selected item detail ID (Error 2/5 Target)
const selectedItemId = ref('prod-01');

// Adjust / Registration forms
const inputWh = ref('A');
const inputQty = ref(10);
const outputWh = ref('B');
const outputQty = ref(10);

const adjustWh = ref('A');
const adjustQty = ref(15);

const newPoItem = ref('prod-04');
const newPoQty = ref(30);

// UI alerts
const toasts = ref([]);

onMounted(() => {
  loadItems();
  loadOrders();
  loadExpectedStocks();
  loadLogs();
});

const loadItems = async () => {
  try {
    const res = await fetch('/api/items');
    items.value = await res.json();
  } catch (err) {
    showToast('품목 정보를 불러오지 못했습니다.', 'danger');
  }
};

const loadOrders = async () => {
  try {
    const res = await fetch('/api/orders');
    purchaseOrders.value = await res.json();
  } catch (err) {
    showToast('발주 내역 로드 실패', 'danger');
  }
};

const loadExpectedStocks = async () => {
  try {
    const res = await fetch('/api/inventory/expected');
    expectedIncomingStocks.value = await res.json();
  } catch (err) {
    showToast('예상 입고 캐시 로드 실패', 'danger');
  }
};

const loadLogs = async () => {
  try {
    const res = await fetch('/api/logs');
    activityLogs.value = await res.json();
  } catch (err) {
    showToast('로그 로드 실패', 'danger');
  }
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

// Filtered and Sorted list for Stock Table
const filteredAndSortedItems = computed(() => {
  let list = [...items.value];

  // Search filter
  if (searchQuery.value) {
    list = list.filter(i => 
      i.name.includes(searchQuery.value) || 
      i.category.includes(searchQuery.value)
    );
  }

  // Warehouse filter (Only show items that have stock in selected warehouse)
  if (activeWarehouse.value !== 'All') {
    list = list.filter(i => i.warehouseStocks[activeWarehouse.value] > 0);
  }

  // Sorting
  if (sortBy.value === 'stock') {
    list.sort((a, b) => {
      const sumA = Object.values(a.warehouseStocks).reduce((s, v) => s + v, 0);
      const sumB = Object.values(b.warehouseStocks).reduce((s, v) => s + v, 0);
      return sumB - sumA;
    });
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
});

// Buggy selection function (Error 2 Mismatch index mapping)
const selectItemByBuggyIndex = (filteredIndex) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 재고 표에서 필터를 바꾸거나 수량순 정렬을 했을 때, 
  // 선택 품목 상세창 바인딩을 고유 ID가 아닌 필터 정렬 이전 원본 `items` 배열의 동일 인덱스 위치 품목으로
  // 강제 매핑시켜 전혀 엉뚱한 품목의 상세 정보가 나타나는 오류를 발생시킵니다.
  const targetItem = items.value[filteredIndex];
  if (targetItem) {
    selectedItemId.value = targetItem.id;
  }
};

// Selected Item detail computed (Error 5 crash targets)
const selectedItem = computed(() => {
  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 덮어씌워진 리스트 때문에 기존에 선택했던 ID가 새 결과에 존재하지 않을 수 있습니다.
  // 마스터 품목 리스트에서 찾지 않고, 굳이 유효 필터링 결과 리스트(`filteredAndSortedItems`)에서만 
  // 찾게 강제함으로써 undefined 레퍼런스 상태를 유발하고 렌더링 시 TypeError 붕괴를 관측하게 합니다.
  return filteredAndSortedItems.value.find(i => i.id === selectedItemId.value);
});

// Search race condition demo (Error 5 Logic)
const triggerSearchRaceDemo = () => {
  searchQuery.value = '노트북';

  // Request 1: '노트북' (3.0s delay on server)
  fetch(`/api/items/search?q=노트북`)
    .then(res => res.json())
    .then(data => {
      items.value = data;
      showToast(`'노트북' 검색 수신 완료 (3초 지연)`, 'warning');
    });

  // Request 2: '마우스' (0.4s delay)
  setTimeout(() => {
    searchQuery.value = '마우스';
    fetch(`/api/items/search?q=마우스`)
      .then(res => res.json())
      .then(data => {
        items.value = data;
        showToast(`'마우스' 검색 수신 완료 (0.4초)`, 'info');
      });
  }, 100);
};

// Transfer and output race simulation (Error 1 Logic)
const triggerTransferOutputRace = () => {
  // Transfer 10 items of 'prod-05' (A: 10, B: 0) from A to B
  const payload = {
    itemId: 'prod-05',
    fromWh: 'A',
    toWh: 'B',
    qty: 10
  };

  showToast('A창고에서 B창고로 노트북 10개 이동을 개시합니다.', 'info');
  
  // 1. Send Transfer (A stock drops to 0 instantly, B delayed 4s)
  fetch('/api/inventory/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // 2. Immediately output from B of qty 10 (delayed by 1s)
  setTimeout(() => {
    fetch('/api/inventory/output', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: 'prod-05',
        warehouse: 'B',
        qty: 10
      })
    }).then(() => {
      showToast('B창고 노트북 10개 출고 요청 정상 승인 완료', 'success');
    });
  }, 1500);

  // Reload database after 4.5s
  setTimeout(() => {
    showToast('창고 이동 및 출고 병합 처리 완료 (이중 소거 확인)', 'warning');
    loadItems();
  }, 4500);
};

// Stock adjustment submit (Error 3 adjustment silent failure 409)
const handleAdjustStock = async () => {
  if (!selectedItemId.value) return;

  try {
    const res = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: selectedItemId.value,
        warehouse: adjustWh.value,
        qty: adjustQty.value
      })
    });

    const data = await res.json();

    // INTENTIONAL_ERROR
    // CATEGORY: Backend + Frontend
    // DESCRIPTION: 서버에서 409 Conflict 오류 상태코드를 받았음에도 불구하고,
    // 프론트 단에서 응답 코드를 무시하고 성공 토스트를 띄우며 화면(로컬) 상의 재고 값을 강제 패치시킵니다.
    // 페이지를 새로고침하면 서버 디비의 원래 수량으로 돌아오게 됩니다.
    if (res.status === 409) {
      showToast(`재고 조정 성공 완료 (서버 에러 무시: ${data.error})`, 'success');

      // Force update local frontend cache to pretend it worked
      const item = items.value.find(i => i.id === selectedItemId.value);
      if (item) {
        item.warehouseStocks[adjustWh.value] = adjustQty.value;
      }
    } else {
      showToast('재고 조정이 완료되었습니다.', 'success');
      loadItems();
    }
  } catch (err) {
    showToast('통신 오류', 'danger');
  }
};

// Stock input request
const handleInputStock = async () => {
  if (!selectedItemId.value) return;
  try {
    const res = await fetch('/api/inventory/input', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: selectedItemId.value,
        warehouse: inputWh.value,
        qty: inputQty.value
      })
    });
    if (res.ok) {
      showToast('입고 등록이 완료되었습니다.', 'success');
      loadItems();
      loadLogs();
    }
  } catch (err) {
    showToast('입고 처리 실패', 'danger');
  }
};

// Stock output request
const handleOutputStock = async () => {
  if (!selectedItemId.value) return;
  try {
    const res = await fetch('/api/inventory/output', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: selectedItemId.value,
        warehouse: outputWh.value,
        qty: outputQty.value
      })
    });
    if (res.ok) {
      showToast('출고 처리가 승인 대기열에 진입했습니다 (1초 지연)', 'info');
      setTimeout(() => {
        loadItems();
        loadLogs();
      }, 1500);
    }
  } catch (err) {
    showToast('출고 처리 실패', 'danger');
  }
};

// Purchase Order Creation
const handleCreatePo = async () => {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: newPoItem.value,
        qty: newPoQty.value
      })
    });
    if (res.ok) {
      showToast('신규 발주가 등록되었습니다.', 'success');
      loadOrders();
      loadExpectedStocks();
    }
  } catch (err) {
    showToast('발주 실패', 'danger');
  }
};

// Purchase Order Deletion (Error 4 PO deletion expected stock orphan)
const handleDeletePo = async (poId) => {
  try {
    const res = await fetch(`/api/orders/${poId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('발주가 정상적으로 취소 및 목록에서 제거되었습니다.', 'success');
      loadOrders();
      loadExpectedStocks();
    }
  } catch (err) {
    showToast('발주 삭제 실패', 'danger');
  }
};

// Low Stock Alerts Computed (Error 4 target)
const lowStockAlerts = computed(() => {
  return items.value.filter(i => {
    const totalStock = Object.values(i.warehouseStocks).reduce((s, v) => s + v, 0);
    const expected = expectedIncomingStocks.value[i.id] || 0;
    
    // If totalStock + expected stock is less than required, trigger warning
    return (totalStock + expected) < i.minRequired;
  });
});

// CSV Export trigger (Error 6 export filter divergence)
const handleCsvExport = () => {
  window.location.href = `/api/inventory/export?currentFilter=${activeWarehouse.value}&exportFilterName=${exportFilterName.value}`;
  showToast(`[${exportFilterName.value}] 필터 기준으로 CSV 내보내기가 접수되었습니다.`, 'info');
};

const handleResetSandbox = async () => {
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      showToast('창고 재고 데이터가 초기 상태로 복구되었습니다.', 'warning');
      loadItems();
      loadOrders();
      loadExpectedStocks();
      loadLogs();
      searchQuery.value = '';
      activeWarehouse.value = 'All';
      sortBy.value = 'name';
      selectedItemId.value = 'prod-01';
    }
  } catch (err) {
    showToast('초기화 API 에러', 'danger');
  }
};

// Total stock of selected item
const selectedTotalStock = computed(() => {
  if (!selectedItem.value) return 0;
  return Object.values(selectedItem.value.warehouseStocks).reduce((sum, v) => sum + v, 0);
});
</script>

<template>
  <div class="stockpilot-app">
    
    <!-- Top Header bar -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 7l-8-4-8 4v10l8 4 8-4V7zM12 22V12M12 12L4 8M12 12l8-4"/>
        </svg>
        <span class="logo-title">StockPilot</span>
        <span class="logo-subtitle">스마트 ERP 재고 발주 플랫폼</span>
      </div>

      <nav class="app-nav">
        <button :class="{ active: activeSection === 'dashboard' }" @click="activeSection = 'dashboard'">
          📦 실시간 재고 보드
        </button>
        <button :class="{ active: activeSection === 'orders' }" @click="activeSection = 'orders'">
          📝 신규 발주 책상
        </button>
        <button :class="{ active: activeSection === 'logs' }" @click="activeSection = 'logs'">
          🕒 활동 이력 로그
        </button>
      </nav>

      <button @click="handleResetSandbox" class="reset-sandbox-btn">⚠️ ERP 리셋</button>
    </header>

    <!-- SECTION 1: MAIN STOCK DASHBOARD -->
    <div v-if="activeSection === 'dashboard'" class="dashboard-workspace">
      
      <!-- Top Actions: Search helper, Drag transfer demo, CSV export -->
      <div class="actions-helper-bar">
        <div class="search-field">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="품목명 또는 카테고리를 검색하세요..." 
            class="search-bar" 
          />
          <button @click="triggerSearchRaceDemo" class="search-race-btn">
            ⚡ 연속 타이핑 시뮬레이터 (Error 5)
          </button>
        </div>

        <div class="simulation-actions">
          <button @click="triggerTransferOutputRace" class="simulation-btn transfer-race">
            ⚡ A->B 이동 즉시 출고 (Error 1)
          </button>
          
          <div class="export-box">
            <input type="text" v-model="exportFilterName" placeholder="파일명 변경" class="export-input" />
            <button @click="handleCsvExport" class="simulation-btn export-csv">
              📥 CSV 다운로드 (Error 6)
            </button>
          </div>
        </div>
      </div>

      <!-- Main Layout: 3 Columns -->
      <div class="workspace-grid">
        
        <!-- Left Column: Filters and Low Stock warnings -->
        <aside class="panel-section filters-alerts-sidebar">
          
          <div class="widget-block">
            <h3>🔍 창고 창 위치 필터</h3>
            <select v-model="activeWarehouse" class="widget-select">
              <option value="All">전체 창고고 (A+B+C)</option>
              <option value="A">A동 중앙 적재고</option>
              <option value="B">B동 예비 출고고</option>
              <option value="C">C동 벌크 하적고</option>
            </select>
          </div>

          <div class="widget-block">
            <h3>📐 품목 정렬 기준</h3>
            <select v-model="sortBy" class="widget-select">
              <option value="name">품목 사전식 이름순</option>
              <option value="stock">보유 재고 수량순</option>
            </select>
          </div>

          <!-- Low stock alert widget (Error 4 Target) -->
          <div class="widget-block alert-widget">
            <h3>⚠️ 부족 재고 경고 알림</h3>
            <div class="alerts-scroll">
              <div v-for="alert in lowStockAlerts" :key="alert.id" class="alert-card-item">
                <strong>{{ alert.name }}</strong>
                <span class="required">필요 수량: {{ alert.minRequired }}개</span>
                <span class="current">현 보유량: {{ Object.values(alert.warehouseStocks).reduce((s, v) => s + v, 0) }}개</span>
                <span class="expected" v-if="expectedIncomingStocks[alert.id]">
                  🚚 입고 대기: {{ expectedIncomingStocks[alert.id] }}개 예정
                </span>
              </div>

              <div v-if="lowStockAlerts.length === 0" class="empty-msg">
                정상 가동 중 (발생한 부족 재고 없음)
              </div>
            </div>
          </div>
        </aside>

        <!-- Center Column: Products Stock Table -->
        <main class="panel-section center-catalog-table">
          <div class="panel-header">
            <h2>📦 품목별 적재 재고 현황판</h2>
          </div>

          <table class="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>품목 분류</th>
                <th>품목명</th>
                <th class="wh-col">A창고</th>
                <th class="wh-col">B창고</th>
                <th class="wh-col">C창고</th>
                <th class="wh-col">총재고</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in filteredAndSortedItems" 
                :key="item.id"
                @click="selectItemByBuggyIndex(index)"
                :class="{ selected: selectedItemId === item.id }"
              >
                <td><code>{{ item.id }}</code></td>
                <td><span class="category-badge">{{ item.category }}</span></td>
                <td class="name-td"><strong>{{ item.name }}</strong></td>
                <td class="num-td">{{ item.warehouseStocks.A }}</td>
                <td class="num-td">{{ item.warehouseStocks.B }}</td>
                <td class="num-td">{{ item.warehouseStocks.C }}</td>
                <td class="num-td total-td">
                  {{ Object.values(item.warehouseStocks).reduce((s, v) => s + v, 0) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Card list view for mobile -->
          <div class="inventory-cards-mobile">
            <div 
              v-for="(item, index) in filteredAndSortedItems" 
              :key="'mob-' + item.id"
              class="mobile-stock-card"
              @click="selectItemByBuggyIndex(index)"
              :class="{ selected: selectedItemId === item.id }"
            >
              <div class="card-header">
                <strong>{{ item.name }}</strong>
                <span class="category-badge">{{ item.category }}</span>
              </div>
              <div class="card-stocks">
                <span>A: {{ item.warehouseStocks.A }}</span>
                <span>B: {{ item.warehouseStocks.B }}</span>
                <span>C: {{ item.warehouseStocks.C }}</span>
              </div>
            </div>
          </div>
        </main>

        <!-- Right Column: Detail Panel and Adjustment controls -->
        <aside class="panel-section right-details-sidebar">
          
          <!-- Selected item detail (Error 5 Target) -->
          <div v-if="selectedItemId" class="details-wrapper">
            
            <!-- Target Crash Visualizer for Error 5 -->
            <div v-if="!selectedItem" class="crash-card">
              <h4>🚨 렌더링 엔진 시스템 충돌</h4>
              <p class="crash-err">TypeError: Cannot read properties of undefined (reading 'name')</p>
              <p class="crash-tip">
                선택된 ID <code>{{ selectedItemId }}</code>가 현재 검색어 결과 목록에 없어 
                상세 패널 렌더링 중 속성을 읽을 수 없습니다.
              </p>
            </div>

            <!-- Normal Details View -->
            <div v-else class="normal-details-card">
              <h3>📦 {{ selectedItem.name }}</h3>
              <p class="desc-info">분류: {{ selectedItem.category }}</p>
              
              <div class="wh-stock-grid">
                <div class="wh-box">
                  <strong>A창고</strong>
                  <span>{{ selectedItem.warehouseStocks.A }}개</span>
                </div>
                <div class="wh-box">
                  <strong>B창고</strong>
                  <span>{{ selectedItem.warehouseStocks.B }}개</span>
                </div>
                <div class="wh-box">
                  <strong>C창고</strong>
                  <span>{{ selectedItem.warehouseStocks.C }}개</span>
                </div>
              </div>

              <div class="total-bar">
                <span>총 보유량</span>
                <strong>{{ selectedTotalStock }}개</strong>
              </div>

              <!-- Input / Output Forms -->
              <div class="action-form-section">
                <h4>📥 창고 입고 등록</h4>
                <div class="form-row">
                  <select v-model="inputWh">
                    <option value="A">A창고</option>
                    <option value="B">B창고</option>
                    <option value="C">C창고</option>
                  </select>
                  <input type="number" v-model="inputQty" min="1" class="qty-input" />
                  <button @click="handleInputStock" class="form-btn input-btn">입고</button>
                </div>
              </div>

              <div class="action-form-section">
                <h4>📤 창고 출고 요청</h4>
                <div class="form-row">
                  <select v-model="outputWh">
                    <option value="A">A창고</option>
                    <option value="B">B창고</option>
                    <option value="C">C창고</option>
                  </select>
                  <input type="number" v-model="outputQty" min="1" class="qty-input" />
                  <button @click="handleOutputStock" class="form-btn output-btn">출고</button>
                </div>
              </div>

              <!-- Stock Adjustment Form (Error 3) -->
              <div class="action-form-section adjustment-box">
                <h4>⚙️ 재고 전산 수량 조정</h4>
                <div class="form-row">
                  <select v-model="adjustWh">
                    <option value="A">A창고</option>
                    <option value="B">B창고</option>
                    <option value="C">C창고</option>
                  </select>
                  <input type="number" v-model="adjustQty" class="qty-input" />
                  <button @click="handleAdjustStock" class="form-btn adjust-btn">조정 (Error 3)</button>
                </div>
                <span class="warning-txt">* 조정 API는 무조건 409 Conflict 오류를 유도합니다.</span>
              </div>

            </div>

          </div>

          <div v-else class="empty-msg">
            재고 표에서 상세를 보실 품목을 클릭하세요.
          </div>
        </aside>

      </div>
    </div>

    <!-- SECTION 2: PURCHASE ORDERS -->
    <div v-if="activeSection === 'orders'" class="orders-workspace">
      
      <div class="panel-section po-panel">
        <div class="panel-header">
          <h2>📝 원자재 및 상품 신규 발주 의뢰서</h2>
        </div>

        <div class="po-grid-layout">
          
          <!-- PO Composer Form -->
          <div class="po-form-card">
            <h3>🛍️ 발주 의뢰서 작성</h3>
            
            <div class="po-form-group">
              <label>대상 품목 지정</label>
              <select v-model="newPoItem">
                <option v-for="item in items" :key="item.id" :value="item.id">
                  {{ item.name }} (보유: {{ Object.values(item.warehouseStocks).reduce((s,v)=>s+v,0) }}개)
                </option>
              </select>
            </div>

            <div class="po-form-group">
              <label>발주 신청 수량</label>
              <input type="number" v-model="newPoQty" min="1" />
            </div>

            <button @click="handleCreatePo" class="po-submit-btn">
              ✍️ 발주 요청서 전송
            </button>
          </div>

          <!-- PO Active List -->
          <div class="po-list-card">
            <h3>📦 진행 중인 발주 내역</h3>
            
            <table class="po-table">
              <thead>
                <tr>
                  <th>발주번호</th>
                  <th>품목 ID</th>
                  <th>신청 수량</th>
                  <th>진행 상태</th>
                  <th>신청일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="po in purchaseOrders" :key="po.id">
                  <td><code>{{ po.id }}</code></td>
                  <td><code>{{ po.itemId }}</code></td>
                  <td><strong>{{ po.qty }}개</strong></td>
                  <td><span class="po-badge ordered">{{ po.status }}</span></td>
                  <td>{{ po.date }}</td>
                  <td>
                    <button @click="handleDeletePo(po.id)" class="po-del-btn">
                      발주 취소 (Error 4)
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="purchaseOrders.length === 0" class="empty-msg">
              대기 중인 발주 계약서 정보가 존재하지 않습니다.
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- SECTION 3: ACTIVITY LOGS TIMELINE -->
    <div v-if="activeSection === 'logs'" class="logs-workspace">
      <div class="panel-section logs-panel">
        <div class="panel-header">
          <h2>🕒 ERP 재고 실시간 변동 로그 타임라인</h2>
        </div>

        <div class="timeline-logs-stack">
          <div v-for="log in activityLogs" :key="log.id" class="log-timeline-card">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-badge" :class="log.type">{{ log.type }}</span>
            <p class="log-msg">{{ log.msg }}</p>
            <span class="log-item-tag">대상 ID: {{ log.itemId }}</span>
          </div>

          <div v-if="activityLogs.length === 0" class="empty-msg">
            정상 변동 (기록된 ERP 액션 없음)
          </div>
        </div>
      </div>
    </div>

    <!-- UI Action Toasts -->
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
/* CSS is loaded globally from index.css */
</style>
