<template>
  <div class="healthcheck-app">
    <!-- Header banner -->
    <header class="app-header">
      <div class="logo-area">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span class="logo-title">HealthCheck</span>
        <span class="logo-subtitle">종합 검진 비교 예약 포털</span>
      </div>

      <div class="header-actions">
        <button type="button" @click="recheckSlots" class="recheck-slots-btn">
          🔄 검진 가능 시간 재조회
        </button>
      </div>
    </header>

    <!-- Main Workspace Layout -->
    <div class="workspace-grid">
      
      <!-- Left side: Category navigation -->
      <aside class="panel-section categories-sidebar">
        <div class="panel-header">
          <h2>🏥 검진 대분류</h2>
        </div>
        <div class="category-buttons-stack">
          <button 
            v-for="cat in ['All', '기초', '정밀', '특화']" 
            :key="cat"
            @click="selectedCategory = cat"
            class="category-stack-btn"
            :class="{ active: selectedCategory === cat }"
          >
            {{ cat === 'All' ? '전체 종합 검진' : cat + ' 종합 검진' }}
          </button>
        </div>
      </aside>

      <!-- Center: Checkup list & Comparison matrix -->
      <main class="center-comparison-workspace">
        
        <!-- Checkup packages list cards -->
        <section class="panel-section packages-list-panel">
          <div class="panel-header">
            <h2>📋 선택 가능한 건강검진 상품 ({{ filteredPackages.length }}종)</h2>
          </div>

          <div class="packages-grid">
            <div 
              v-for="pkg in filteredPackages" 
              :key="pkg.id" 
              class="package-card"
              :class="{ selected: selectedPackageId === pkg.id }"
              @click="selectedPackageId = pkg.id"
            >
              <div class="card-head">
                <span class="type-badge">{{ pkg.type }}</span>
                <h3>{{ pkg.name }}</h3>
              </div>
              <div class="card-body">
                <p class="summary-lbl">총 {{ pkg.items.length }}개 정밀 정밀 검사 항목 포함</p>
                <strong class="price-lbl">{{ pkg.price.toLocaleString() }}원</strong>
              </div>
              <div class="card-foot">
                <button 
                  type="button" 
                  class="compare-add-btn"
                  @click.stop="addToCompare(pkg)"
                >
                  ⚖️ 비교 항목 담기
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Checkup items comparison grid -->
        <section class="panel-section comparison-table-panel">
          <div class="panel-header">
            <h2>⚖️ 종합 검진 세부 항목 대조 비교표 (최대 3종)</h2>
          </div>

          <div class="comparison-slots-row">
            <div 
              v-for="pkg in compareList" 
              :key="pkg.id" 
              class="compare-slot-card"
            >
              <div class="slot-head">
                <h4>{{ pkg.name }}</h4>
                <button type="button" @click="removeFromCompare(pkg.id)" class="remove-slot-btn">&times;</button>
              </div>
              <div class="slot-body">
                <p class="price">{{ pkg.price.toLocaleString() }}원</p>
                <div class="items-bullet-box">
                  <h5>검사 상세 항목 ({ {pkg.items.length } }):</h5>
                  <ul>
                    <li v-for="it in pkg.items" :key="it">{{ it }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-if="compareList.length === 0" class="empty-placeholder compare">
              검진 카드 하단의 [비교 항목 담기] 버튼을 누르시면 세부 항목 대조표가 여기에 출력됩니다.
            </div>
            <div v-else-if="compareList.length < 3" class="empty-placeholder compare small">
              비교 대상을 추가로 더 담아 대조할 수 있습니다.
            </div>
          </div>

          <!-- Total items count with Error 1 -->
          <div v-if="compareList.length > 0" class="total-comparison-summary-bar">
            <span>📊 비교 대상 상품들의 총 검사 가짓수 합계:</span>
            <strong class="count-val">{{ totalCheckupItemsCount }}개 항목</strong>
            <p class="warn-lbl">※ 비교 슬롯에서 특정 검진을 제거할 때 항목수 변동 상태를 점검하십시오.</p>
          </div>
        </section>

      </main>

      <!-- Right: Step questionnaire & Booking Summary -->
      <aside class="right-booking-column">
        
        <!-- Booking & Questionnaire form -->
        <section v-if="selectedPackage" class="panel-section booking-form-panel">
          <div class="panel-header">
            <h2>📅 검진 예약 및 사전 문진표 작성</h2>
          </div>

          <div class="package-selected-summary">
            <h3>{{ selectedPackage.name }}</h3>
            <p class="price-val">합계 수강료: <strong>{{ selectedPackage.price.toLocaleString() }}원</strong></p>
          </div>

          <form @submit.prevent="submitBooking" class="medical-booking-form">
            <div class="form-group">
              <label>수검 희망 지점 선택:</label>
              <select v-model="selectedBranch" class="booking-select" required>
                <option value="서울 마포 본원">서울 마포 본원 (마포역 인근)</option>
                <option value="경기 분당 지점">경기 분당 지점 (서현역 인근)</option>
                <option value="서울 강남 센트럴점">서울 강남 센트럴점 (역삼역 인근)</option>
              </select>
            </div>

            <div class="form-row-grid">
              <div class="form-group">
                <label>검진 예약 일자:</label>
                <input type="date" v-model="bookingDate" class="booking-input" required />
              </div>
              <div class="form-group">
                <label>예약 시간대:</label>
                <select v-model="bookingTime" class="booking-select" required>
                  <option value="08:00">오전 08:00</option>
                  <option value="09:00">오전 09:00</option>
                  <option value="10:00">오전 10:00</option>
                  <option value="11:00">오전 11:00</option>
                  <option value="13:00">오후 13:00</option>
                  <option value="14:00">오후 14:00</option>
                </select>
              </div>
            </div>

            <!-- Questionnaire Multi-step layout -->
            <div class="medical-questionnaire-box">
              <h4>🩺 기본 기초 사전 문진표</h4>
              
              <div class="form-group">
                <label>수검자 성함:</label>
                <input type="text" v-model="qName" placeholder="실명을 입력하세요" class="booking-input" required />
              </div>

              <div class="form-row-grid">
                <div class="form-group">
                  <label>키 (cm): (0인 경우 HTTP 500)</label>
                  <input type="number" v-model.number="qHeight" class="booking-input" required />
                </div>
                <div class="form-group">
                  <label>몸무게 (kg):</label>
                  <input type="number" v-model.number="qWeight" class="booking-input" required />
                </div>
              </div>

              <div class="question-options">
                <label class="check-option">
                  <input type="checkbox" v-model="qDrinking" />
                  <span>주 1회 이상 음주를 하십니까?</span>
                </label>
                <label class="check-option">
                  <input type="checkbox" v-model="qSmoking" />
                  <span>현재 흡연을 하고 계십니까?</span>
                </label>
              </div>
            </div>

            <button type="submit" class="booking-submit-btn">검진 안심 예약 등록</button>
          </form>
        </section>

        <section v-else class="panel-section booking-form-panel empty">
          <div class="empty-placeholder">
            검진 상품 목록에서 예약할 상품을 클릭하시면 지점 선택 및 단계별 문진표 작성 폼이 활성화됩니다.
          </div>
        </section>

        <!-- Booking records cabinet (Error 3 targets local-only delete) -->
        <section class="panel-section booking-history-panel">
          <div class="panel-header">
            <h2>📋 예약 접수 완료 내역 (새로고침 시 보존 여부 점검)</h2>
          </div>

          <div class="bookings-list">
            <div 
              v-for="book in bookings" 
              :key="book.id" 
              class="booking-history-card"
            >
              <div class="card-head">
                <span class="id-tag">ID: {{ book.id.slice(-6) }}</span>
                <span class="status-tag">예약 확정</span>
              </div>
              <div class="card-body">
                <p>수검 상품: <strong>{{ getPackageName(book.packageId) }}</strong></p>
                <p>일시/지점: {{ book.date }} {{ book.time }} / {{ book.branch }}</p>
                <p class="patient">수검자: {{ book.questionnaire.name }} (키: {{ book.questionnaire.height }}cm, 몸무게: {{ book.questionnaire.weight }}kg)</p>
              </div>
              <div class="card-foot">
                <button 
                  type="button" 
                  @click="cancelBooking(book.id)" 
                  class="cancel-booking-btn"
                >
                  예약 취소 신청
                </button>
              </div>
            </div>

            <div v-if="bookings.length === 0" class="empty-placeholder">
              접수된 활성 건강검진 예약 내역이 존재하지 않습니다.
            </div>
          </div>
        </section>

      </aside>

    </div>

    <!-- Toast container -->
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
const packages = ref([]);
const bookings = ref([]);

// Filter tags
const selectedCategory = ref('All');

// Comparison states
const compareList = ref([]);
const totalCheckupItemsCount = ref(0); // State for checkup items (Error 1 Target)

// Selection & booking form states
const selectedPackageId = ref(null);
const selectedBranch = ref('서울 마포 본원');
const bookingDate = ref('2026-08-15');
const bookingTime = ref('10:00');

// Questionnaire inputs (Error 2 targets qHeight === 0)
const qName = ref('');
const qHeight = ref(175);
const qWeight = ref(70);
const qDrinking = ref(false);
const qSmoking = ref(false);

// Toast alerts
const toasts = ref([]);

onMounted(() => {
  loadPackages();
  loadBookings();
});

const loadPackages = async () => {
  try {
    const res = await fetch('/api/checkup/packages');
    const data = await res.json();
    packages.value = data;
  } catch (err) {
    showToast('검진 상품 목록 조회 실패', 'danger');
  }
};

const loadBookings = async () => {
  try {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    bookings.value = data;
  } catch (err) {
    showToast('예약 이력 로드 실패', 'danger');
  }
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

// Filtered packages
const filteredPackages = computed(() => {
  if (selectedCategory.value === 'All') {
    return packages.value;
  }
  return packages.value.filter(p => p.type === selectedCategory.value);
});

const selectedPackage = computed(() => {
  return packages.value.find(p => p.id === selectedPackageId.value);
});

// Helper for mapping names
const getPackageName = (pkgId) => {
  const p = packages.value.find(x => x.id === pkgId);
  return p ? p.name : '미확인 검진';
};

// Add to compare slots
const addToCompare = (pkg) => {
  if (compareList.value.length >= 3) {
    showToast('비교는 최대 3개 종합 검진까지 가동 가능합니다.', 'warning');
    return;
  }
  if (compareList.value.some(p => p.id === pkg.id)) return;
  compareList.value.push(pkg);

  // Recalculate total checkup items count
  totalCheckupItemsCount.value = compareList.value.reduce((sum, p) => sum + p.items.length, 0);
};

// Remove from compare slots (Error 1 Target)
const removeFromCompare = (pkgId) => {
  compareList.value = compareList.value.filter(p => p.id !== pkgId);

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 비교 목록 대조표에서 검진 상품을 제거(filter)할 때, 
  // 화면상에서는 카드가 제거되지만, 비교 대상들의 총 검사항목 가짓수 합산 필드인 
  // totalCheckupItemsCount 값을 갱신(재집계)해 주는 수식을 고의 누락하여 
  // 이전 상품들이 제거되었어도 검사항목 개수가 어긋나며 그대로 잔류하는 결함을 일으킵니다.
  // 원래 해야하는 합산 동기화 스킵:
  // totalCheckupItemsCount.value = compareList.value.reduce((sum, p) => sum + p.items.length, 0);
};

// Submit booking with medical questionnaire
const submitBooking = async () => {
  if (!selectedPackageId.value) return;

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: selectedPackageId.value,
        branch: selectedBranch.value,
        date: bookingDate.value,
        time: bookingTime.value,
        name: qName.value,
        height: qHeight.value,
        weight: qWeight.value,
        isDrinking: qDrinking.value,
        isSmoking: qSmoking.value
      })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '예약 등록 실패');
    }

    showToast('건강검진 예약 등록이 임시 확정되었습니다.', 'success');
    qName.value = '';
    await loadBookings();
  } catch (err) {
    showToast(`[예약 실패] ${err.message}`, 'danger');
  }
};

// Cancel booking (Error 3 Target)
const cancelBooking = async (bookingId) => {
  // On the frontend, we immediately filter it out from memory so it looks successful
  bookings.value = bookings.value.filter(b => b.id !== bookingId);

  // Call actual backend API
  try {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      showToast('검진 취소 처리가 완료되었습니다.', 'success');
      // 원래는 여기서 다시 loadBookings()를 호출해야 완결되지만, 
      // 이와 별개로 백엔드 자체가 DELETE 시 레코드를 보존하므로 새로고침하면 다시 불러와집니다.
    } else {
      throw new Error('서버 취소 반려');
    }
  } catch (err) {
    showToast(`통신 지연 오류: ${err.message}`, 'danger');
  }
};

// Error 4: slots-v3 yields 404
const recheckSlots = async () => {
  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: '검진 가능 시간 재조회' 클릭 시, 
  // 백엔드에 아예 정의되어 있지 않은 `/api/checkup/slots-v3` 주소를 강제로 비동기 호출하게 코딩하여 
  // 브라우저 네트워크 콘솔창에 HTTP 404 Not Found 오류가 발생하게 합니다.
  try {
    const res = await fetch('/api/checkup/slots-v3');
    if (!res.ok) throw new Error('HTTP status ' + res.status);
    const data = await res.json();
    showToast('검진 예약 현황이 최신화되었습니다.', 'success');
  } catch (err) {
    showToast(`가능 시간 동기화 실패: ${err.message}`, 'danger');
  }
};
</script>
