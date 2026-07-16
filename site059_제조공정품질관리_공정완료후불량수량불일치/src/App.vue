<template>
  <div class="factoryline-app">
    
    <!-- Top Header Navigation -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 10v6M2 10v6M12 2v20" />
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
        <span class="logo-title">FactoryLine</span>
        <span class="logo-subtitle">Smart Manufacturing Process Control</span>
      </div>

      <div class="header-right">
        <div class="role-selector">
          <span>🛡️ 작업 권한: </span>
          <select v-model="currentUserRole">
            <option value="WORKER">현장 오퍼레이터 (작업원)</option>
            <option value="MANAGER">품질 관리 책임자 (관리자)</option>
          </select>
        </div>

        <button class="sandbox-reset-btn" @click="resetSandbox">
          🔄 DB 초기화
        </button>
      </div>
    </header>

    <!-- Workspace Grid Layout -->
    <div class="factoryline-grid">

      <!-- Left Column: Production lines list -->
      <aside class="panel-section line-sidebar">
        <h3>🏭 활성 생산 라인</h3>
        <div class="line-cards">
          <div 
            class="line-card" 
            :class="{ active: activeLine === '생산 1라인' }"
            @click="activeLine = '생산 1라인'"
          >
            <strong>생산 1라인</strong>
            <small>반도체/디스플레이 정밀 전공정</small>
            <span class="status-indicator online">가동 중</span>
          </div>

          <div 
            class="line-card" 
            :class="{ active: activeLine === '생산 2라인' }"
            @click="activeLine = '생산 2라인'"
          >
            <strong>생산 2라인</strong>
            <small>모듈 조립/SMT 후공정 라인</small>
            <span class="status-indicator online">가동 중</span>
          </div>
        </div>

        <!-- Material Usage ledger widget -->
        <div class="material-ledger-widget">
          <h4>📦 공정별 자재 소요 대장</h4>
          <p class="warn-desc">* 작업 지시를 삭제해도 아래 자재 기록은 계속 남음 (Error 3)</p>
          <div class="ledger-stack">
            <div 
              v-for="mat in materialsUsage" 
              :key="mat.id" 
              class="ledger-card"
            >
              <span>{{ mat.itemName }}</span>
              <strong class="qty-tag">{{ mat.qty }}개 소요</strong>
              <small>지시 ID: {{ mat.orderId }}</small>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Column: Process flow board and performance stats -->
      <main class="panel-section flow-center">
        <div class="flow-header">
          <h2>⚙️ 공정 흐름도 및 지시 현황</h2>
          <div class="actions">
            <button class="refresh-btn" @click="triggerRefreshRace">
              🔄 설비 상태 고속 동기화 (Error 4)
            </button>
          </div>
        </div>
        <p class="warn-desc">* 새로고침 충돌 시 흐름도 마커와 설비 텍스트 상태가 서로 어긋남 (Error 4)</p>

        <!-- Process Flow chart SVG nodes -->
        <div class="process-flow-visual">
          <div class="flow-node active">
            <div class="node-icon">🚿</div>
            <span>세정/피딩</span>
            <small class="node-status">{{ equipment[0]?.status || 'RUNNING' }}</small>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-node warning">
            <div class="node-icon">🔥</div>
            <span>가열/에칭</span>
            <small class="node-status">RUNNING</small>
          </div>
          <div class="flow-arrow">➔</div>
          <div class="flow-node">
            <div class="node-icon">🎛️</div>
            <span>조립/실장</span>
            <small class="node-status">RUNNING</small>
          </div>
        </div>

        <!-- Work Orders list -->
        <div class="work-orders-block">
          <div class="section-title">
            <h3>📝 생산 작업 지시서 목록</h3>
            <div class="controls">
              <label>정렬: </label>
              <select v-model="sortOrder">
                <option value="id">번호순</option>
                <option value="status">상태순</option>
              </select>
            </div>
          </div>
          <p class="warn-desc">* 정렬 시 아래 지시서 클릭과 상세 패널 데이터 매핑 인덱스가 꼬임 (Error 2)</p>

          <div class="orders-stack">
            <div 
              v-for="(ord, idx) in filteredOrders" 
              :key="ord.id" 
              class="order-card"
              :class="{ active: selectedOrder?.id === ord.id }"
              @click="selectOrder(idx)"
            >
              <div class="order-title">
                <strong>{{ ord.name }}</strong>
                <span class="status-badge" :class="ord.status.toLowerCase()">
                  {{ ord.status === 'RUNNING' ? '가동 중' : '완료' }}
                </span>
              </div>
              <div class="yield-info">
                <span>총량: {{ ord.producedCount }} | </span>
                <span class="color-danger">불량: {{ ord.defectCount }} | </span>
                <span class="color-success">양품: <strong>{{ ord.yieldCount }}</strong></span>
              </div>
              <div class="worker-name">배정: {{ ord.worker }}</div>
            </div>
          </div>
        </div>
      </main>

      <!-- Right Column: Equipment and job details -->
      <aside class="panel-section details-sidebar">
        <h3>📋 작업 지시 상세 및 오퍼레이션</h3>
        <p class="warn-desc">* 완료 전환 직후 불량 수정 시 양품 수 계산 불일치 (Error 1)</p>
        
        <div v-if="selectedOrder" class="details-card">
          <div class="field">
            <label>공정명:</label>
            <strong>{{ selectedOrder.name }}</strong>
          </div>
          <div class="field">
            <label>라인 소속:</label>
            <span>{{ selectedOrder.line }}</span>
          </div>
          <div class="field">
            <label>담당 오퍼레이터:</label>
            <span>{{ selectedOrder.worker }}</span>
          </div>
          <div class="field">
            <label>메모 사항:</label>
            <p class="memo-txt">{{ selectedOrder.memo }}</p>
          </div>

          <!-- Controls for Error 1, 6, 3 -->
          <div class="operation-controls">
            <button 
              class="race-btn"
              @click="triggerCompleteDefectRace(selectedOrder)"
            >
              ⚡ 완료 직후 불량 수정 (Error 1)
            </button>

            <div class="operator-assign-form">
              <label>작업원 재배정 + 메모 변경 (Error 6):</label>
              <input type="text" v-model="targetWorker" placeholder="신규 작업원 이름..." />
              <input type="text" v-model="targetMemo" placeholder="추가 메모 기입..." />
              <button 
                class="assign-btn"
                @click="triggerWorkerMemoRace(selectedOrder, targetWorker, targetMemo)"
              >
                배정 및 저장
              </button>
            </div>

            <button 
              class="delete-order-btn"
              @click="deleteOrderStatsLeak(selectedOrder.id)"
            >
              🗑️ 작업 지시 삭제 (Error 3)
            </button>
          </div>
        </div>
        <div v-else class="empty-lbl">
          지시서 목록에서 카드를 선택하면 오퍼레이션 조작 패널이 열립니다.
        </div>

        <!-- Quality inspection report cards -->
        <div class="quality-reports-widget">
          <h4>🧪 품질 불량 검사 수정 (HTTP 403 권한 제어)</h4>
          <p class="warn-desc">* 일반 작업자가 불량을 수정하면 거부되지만 DB에는 변경 반영됨 (Error 5)</p>
          
          <div v-for="insp in inspections" :key="insp.id" class="insp-card">
            <strong>{{ insp.inspector }} 검사지</strong>
            <p>{{ insp.defectDesc }} ({{ insp.severity }})</p>
            
            <div class="edit-defects-block">
              <label>수정할 불량수: </label>
              <input 
                type="number" 
                value="12" 
                #defectInput
                style="width: 50px; background: #080d1a; color: white; border: 1px solid #233355; padding: 2px;"
              />
              <button 
                class="edit-btn"
                @click="handleInspectionDefectChange(insp, 12)"
              >
                변경 적용
              </button>
            </div>
          </div>
        </div>
      </aside>

    </div>

    <!-- Toast Alert Stack -->
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
        <button class="toast-close" @click="toasts = toasts.filter(x => x.id !== t.id)">
          &times;
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const currentUserRole = ref('WORKER');
const activeLine = ref('생산 1라인');
const sortOrder = ref('id');

const orders = ref([]);
const equipment = ref([]);
const materialsUsage = ref([]);
const inspections = ref([]);

const selectedOrder = ref(null);
const toasts = ref([]);

// Input fields
const targetWorker = ref('한규원 대리');
const targetMemo = ref('센서 감도 15% 임계점 상향 조정.');

onMounted(async () => {
  await loadAll();
});

const loadAll = async () => {
  await loadOrders();
  await loadEquipment();
  await loadMaterials();
  await loadInspections();
};

const loadOrders = async () => {
  const res = await fetch('/api/orders');
  orders.value = await res.json();
  if (orders.value.length > 0 && !selectedOrder.value) {
    selectedOrder.value = orders.value[0];
  }
};

const loadEquipment = async () => {
  const res = await fetch('/api/equipment');
  equipment.value = await res.json();
};

const loadMaterials = async () => {
  const res = await fetch('/api/materials');
  materialsUsage.value = await res.json();
};

const loadInspections = async () => {
  const res = await fetch('/api/inspections');
  inspections.value = await res.json();
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

const resetSandbox = async () => {
  await fetch('/api/reset', { method: 'POST' });
  showToast('FactoryLine 생산 공정 디비가 초기화되었습니다.', 'success');
  selectedOrder.value = null;
  await loadAll();
};

// Filtered and sorted computed list
const filteredOrders = computed(() => {
  return orders.value
    .filter(o => o.line === activeLine.value)
    .sort((a, b) => {
      if (sortOrder.value === 'status') {
        return a.status.localeCompare(b.status);
      }
      return a.id.localeCompare(b.id);
    });
});

// Selection mapped index bug (Error 2 Target)
const selectOrder = (idxInFiltered) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 생산 라인 필터링 혹은 정렬 상태에서 클릭 시, 
  // 정렬된 리스트의 인덱스 번호를 원본 전체 orders 배열의 인덱스로 오용하여 
  // 상세 패널에 엉뚱한 라인의 작업 지시 상세를 출력시키는 결함입니다.
  selectedOrder.value = orders.value[idxInFiltered];
};

// Complete and defect update race (Error 1 Target)
const triggerCompleteDefectRace = (ord) => {
  showToast('완료 전환 후 즉각 불량 15개로 수정을 요청합니다.', 'info');

  // 1. POST complete (0.1s delay)
  fetch(`/api/orders/${ord.id}/complete`, { method: 'POST' });

  // 2. PATCH defect (3.0s delay)
  setTimeout(async () => {
    const res = await fetch(`/api/orders/${ord.id}/defect`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defectCount: 15 })
    });
    if (res.ok) {
      showToast('불량 수량 수정 요청 완료 (3초 지연 완료)', 'success');
      await loadOrders();
    }
  }, 100);

  // Optimistic update locally
  ord.status = 'COMPLETED';
  ord.defectCount = 15;
  ord.yieldCount = ord.producedCount - 15;

  // Refresh after 3.5s to see the stale yield count on the database
  setTimeout(async () => {
    showToast('불량 지연 처리 DB 반영 완료 (화면 양품수와 DB 적재값이 달라짐)', 'warning');
    await loadOrders();
  }, 3500);
};

// Equipment refresh race (Error 4 Target)
let refreshCounter = 0;
const triggerRefreshRace = () => {
  showToast('설비 모니터링 고속 동기화 경합을 시작합니다.', 'info');

  // 1. Fetch count=1 (3s delay) -> returns OFFLINE
  fetch('/api/equipment/refresh?count=1')
    .then(res => res.json())
    .then(data => {
      equipment.value = data;
      showToast('1차 상태 로드 완료 (3초 지연 오버라이트 - OFFLINE)', 'warning');
    });

  // 2. Fetch count=2 (0.2s delay) -> returns RUNNING
  setTimeout(() => {
    fetch('/api/equipment/refresh?count=2')
      .then(res => res.json())
      .then(data => {
        equipment.value = data;
        showToast('2차 상태 로드 완료 (0.2초 - RUNNING)', 'info');
      });
  }, 150);
};

// Unauthorized defect edit 403 bypass (Error 5 Target)
const handleInspectionDefectChange = async (insp, count) => {
  showToast(`품질 검사 불량 수정 요청을 송신합니다. (보낸 권한: ${currentUserRole.value})`, 'info');

  const res = await fetch(`/api/inspections/${insp.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: currentUserRole.value, defectCount: count })
  });

  if (res.status === 403) {
    showToast('권한 부족으로 품질 검사 수정이 거부되었습니다. (HTTP 403)', 'danger');
    await loadOrders(); // Re-fetch to show that it STILL updated the database!
  } else {
    showToast('품질 검사 수정이 승인되었습니다.', 'success');
    await loadOrders();
  }
};

// Worker change and memo race (Error 6 Target)
const triggerWorkerMemoRace = (ord, newWorker, newMemo) => {
  showToast('작업자 배정 변경 후 즉시 공정 메모 저장을 연달아 요청합니다.', 'info');

  // 1. PATCH worker (0.1s delay)
  fetch(`/api/orders/${ord.id}/worker`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ worker: newWorker })
  });

  // 2. PATCH memo (3s delay)
  setTimeout(async () => {
    const res = await fetch(`/api/orders/${ord.id}/memo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo: newMemo })
    });
    if (res.ok) {
      showToast('메모 저장 완료 응답 수신 (3초 지연 완료)', 'success');
      await loadOrders();
    }
  }, 100);

  // Optimistic update locally
  ord.worker = newWorker;
  ord.memo = newMemo;

  // Refresh after 3.5s to see that worker reverted to previous
  setTimeout(async () => {
    showToast('메모 지연 보존 완료 (배정자가 이전 인원으로 롤백 덮어씌워짐)', 'warning');
    await loadOrders();
  }, 3500);
};

// Delete Order Stats cascade leak (Error 3 Target)
const deleteOrderStatsLeak = async (orderId) => {
  const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
  if (res.ok) {
    showToast('해당 작업 지시가 목록에서 제외되었습니다.', 'success');
    await loadOrders();
    // Bypasses cleaning materialsUsage and inspections!
    await loadMaterials();
  }
};
</script>
