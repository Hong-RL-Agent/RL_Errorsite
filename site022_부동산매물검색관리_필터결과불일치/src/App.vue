<template>
  <div class="homemap-app">
    <!-- Top Filter Bar -->
    <header class="app-header">
      <div class="logo-area">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span class="logo-title">HomeMap</span>
        <span class="logo-subtitle">상권 분석 및 매물 매칭 지도</span>
      </div>

      <!-- Filters Row -->
      <div class="filters-row">
        <div class="filter-group">
          <label>매물 종류</label>
          <select v-model="selectedType" @change="handleFilterChange" class="filter-select">
            <option value="All">전체 매물</option>
            <option value="원룸">원룸</option>
            <option value="아파트">아파트</option>
            <option value="오피스텔">오피스텔</option>
          </select>
        </div>

        <div class="filter-group">
          <label>거래 방식</label>
          <select v-model="selectedPriceType" @change="handleFilterChange" class="filter-select">
            <option value="All">전체 방식</option>
            <option value="월세">월세</option>
            <option value="전세">전세</option>
            <option value="매매">매매</option>
          </select>
        </div>

        <div class="filter-group price-slider">
          <label>최대 가격 (전세/매매 기준): {{ maxPrice === 150000 ? '제한없음' : (maxPrice / 10000) + '억원' }}</label>
          <input 
            type="range" 
            min="1000" 
            max="150000" 
            step="5000" 
            v-model.number="maxPrice" 
            @input="handleFilterChange"
            class="filter-range" 
          />
        </div>

        <div class="filter-group">
          <label>정렬 선택</label>
          <select v-model="priceSort" class="filter-select">
            <option value="default">기본순</option>
            <option value="asc">가격 낮은순</option>
            <option value="desc">가격 높은순</option>
          </select>
        </div>

        <div class="filter-group search-box">
          <label>키워드 검색</label>
          <input 
            type="text" 
            placeholder="동 이름 또는 매물 이름 입력..." 
            v-model="searchQuery" 
            @input="handleFilterChange"
            class="filter-search-input"
          />
        </div>
      </div>
    </header>

    <!-- Main Workspace Layout Grid -->
    <div class="workspace-grid">
      
      <!-- Left side: SVG interactive Map -->
      <section class="panel-section map-workspace-panel">
        <div class="panel-header">
          <h2>🗺️ 마포구 신촌·합정 권역 매물 분할 지도</h2>
          <p class="subtitle">마커를 선택하면 매물 상세 정보가 표기됩니다.</p>
        </div>

        <div class="svg-map-wrapper">
          <svg class="svg-map-canvas" viewBox="0 0 100 100">
            <!-- Grid roads and river -->
            <rect x="0" y="85" width="100" height="15" fill="#e0f2fe" opacity="0.8" />
            <text x="50" y="93" font-size="2" fill="#0369a1" text-anchor="middle" font-weight="bold">🌊 한강 (Han River)</text>
            
            <line x1="45" y1="0" x2="45" y2="85" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="2,2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="2,2" />
            
            <!-- Area Labels -->
            <text x="25" y="20" font-size="3" fill="#64748b" opacity="0.6" font-weight="bold">연희동</text>
            <text x="20" y="55" font-size="3" fill="#64748b" opacity="0.6" font-weight="bold">망원동</text>
            <text x="55" y="30" font-size="3" fill="#64748b" opacity="0.6" font-weight="bold">서교동</text>
            <text x="75" y="60" font-size="3" fill="#64748b" opacity="0.6" font-weight="bold">합정동</text>
          </svg>

          <!-- Dynamic Property Map Markers -->
          <div 
            v-for="prop in filteredProperties" 
            :key="prop.id" 
            class="map-marker-pin"
            :style="{ left: prop.coords.x + '%', top: prop.coords.y + '%' }"
            :class="{ active: selectedListingId === prop.id }"
            @click="selectedListingId = prop.id"
          >
            <div class="pin-icon">📍</div>
            <div class="pin-bubble">
              <span class="type-lbl">[{{ prop.type }}]</span>
              <span class="price-lbl">{{ formatPrice(prop) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Center-Right: Property Listing Catalog -->
      <section class="panel-section properties-list-panel">
        <div class="panel-header">
          <h2>🏢 조회 가능한 조건별 매물 목록 ({{ filteredProperties.length }}개)</h2>
        </div>

        <div class="properties-vertical-list">
          <div 
            v-for="(prop, index) in filteredProperties" 
            :key="prop.id" 
            class="property-list-card"
            :class="{ active: selectedListingId === prop.id }"
            @click="selectedListingId = prop.id"
          >
            <div class="card-left-info">
              <span class="price-badge">{{ prop.priceType }}</span>
              <h3>{{ prop.name }}</h3>
              <p class="meta">{{ prop.type }} • 면적 {{ prop.area }}㎡ • 방 {{ prop.rooms }}개</p>
              <div class="price-text">{{ formatPrice(prop) }}</div>
            </div>

            <!-- Favorite toggle button (Error 1 Target) -->
            <div class="card-right-actions">
              <button 
                type="button" 
                class="star-toggle-btn"
                :class="{ starred: isFavorite(index) }"
                @click.stop="toggleFavorite(index)"
              >
                {{ isFavorite(index) ? '⭐ 찜완료' : '☆ 찜하기' }}
              </button>
            </div>
          </div>

          <div v-if="filteredProperties.length === 0" class="empty-placeholder">
            검색 필터 조건에 부합하는 매물이 마포 권역에 존재하지 않습니다.
          </div>
        </div>
      </section>

      <!-- Far Right: Detailed Panel & Visit booking form -->
      <aside class="right-details-column">
        
        <!-- Property Detail Panel -->
        <section v-if="activeListing" class="panel-section property-detail-panel">
          <div class="panel-header">
            <h2>🏠 매물 상세 종합 브리핑</h2>
          </div>

          <!-- Dynamic image with Error 5 env variable -->
          <div class="detail-gallery-box">
            <img :src="activeListing.image" alt="매물 사진 실물" class="detail-gallery-img" />
            <p class="img-err-note">🚨 이미지 로드 경로는 PROPERTY_ASSET_URL 환경변수를 통해 동적 바인딩됩니다.</p>
          </div>

          <div class="detail-info-sheet">
            <h3>{{ activeListing.name }}</h3>
            <table class="listing-details-table">
              <tbody>
                <tr>
                  <td>매물 형태</td>
                  <td><strong>{{ activeListing.type }}</strong></td>
                </tr>
                <tr>
                  <td>거래 방식</td>
                  <td><strong>{{ activeListing.priceType }}</strong></td>
                </tr>
                <tr>
                  <td>계약 가격</td>
                  <td><strong class="price-val">{{ formatPrice(activeListing) }}</strong></td>
                </tr>
                <tr>
                  <td>전용 면적</td>
                  <td><strong>{{ activeListing.area }} ㎡</strong></td>
                </tr>
                <tr>
                  <td>방 개수</td>
                  <td><strong>{{ activeListing.rooms }} 개</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Broker info card -->
          <div class="broker-card">
            <h4>🤝 담당 공인중개업소 정보</h4>
            <p>상호명: {{ activeListing.realtor.name }}</p>
            <p>연락처: {{ activeListing.realtor.phone }}</p>
          </div>

          <!-- Visit Booking reservation form -->
          <div class="booking-form-wrapper">
            <h4>📅 방문 견학 예약 신청</h4>
            <form @submit.prevent="submitBooking" class="booking-sub-form">
              <div class="form-row">
                <label>희망 일시:</label>
                <input type="text" placeholder="예: 2026-07-28 14:00" v-model="bookingDateTime" class="booking-input" required />
              </div>
              <div class="form-row">
                <label>전달 사항 (메모): (글자 수: {{ bookingMemo.length }}자)</label>
                <textarea 
                  placeholder="예약 문의사항을 자유롭게 작성해 주십시오." 
                  v-model="bookingMemo" 
                  class="booking-textarea"
                ></textarea>
                <span class="memo-count-tag" :class="{ danger: bookingMemo.length === 80 }">
                  {{ bookingMemo.length }} / 80자 (정확히 80자인 경우 전송 에러)
                </span>
              </div>
              <button type="submit" class="booking-submit-btn">방문 예약 신청서 전송</button>
            </form>
          </div>
        </section>

        <section v-else class="panel-section property-detail-panel empty">
          <div class="empty-placeholder">
            지도 마커나 목록에서 매물을 선택하시면 상세 제원과 방문 예약 폼이 이곳에 활성화됩니다.
          </div>
        </section>

        <!-- Bookings list -->
        <section class="panel-section my-bookings-panel">
          <div class="panel-header">
            <h2>📋 나의 현장 임장 예약 목록 ({{ bookings.length }})</h2>
          </div>

          <div class="bookings-vertical-list">
            <div 
              v-for="book in bookings" 
              :key="book.id" 
              class="booking-card"
            >
              <div class="card-head">
                <span class="id">ID: {{ book.id.slice(-6) }}</span>
                <span class="badge status">예약 대기</span>
              </div>
              <div class="card-body">
                <p>매물 번호: <strong>{{ book.listingId }}</strong></p>
                <p>방문 시각: <strong>{{ book.dateTime }}</strong></p>
                <p class="memo">메모: {{ book.memo }}</p>
              </div>

              <!-- Edit Booking Area -->
              <div class="card-edit-action-row">
                <button class="edit-toggle-btn" @click="toggleEditMode(book)">🕐 시간 수정하기</button>
                
                <div v-if="editingBookingId === book.id" class="edit-mini-form">
                  <input type="text" v-model="editDateTime" class="edit-input" />
                  <button class="save-edit-btn" @click="saveBookingEdit(book.id)">저장</button>
                </div>
              </div>
            </div>
            <div v-if="bookings.length === 0" class="empty-placeholder">최근 접수된 중개 예약 신청 건이 없습니다.</div>
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
const properties = ref([]);
const bookings = ref([]);

// Filter states
const selectedType = ref('All');
const selectedPriceType = ref('All');
const maxPrice = ref(150000);
const priceSort = ref('default');
const searchQuery = ref('');

// User states
const selectedListingId = ref(null);
const starredIndexes = ref([]); // Holds INDEXES (Error 1 Target)

// Booking form
const bookingDateTime = ref('2026-07-20 14:00');
const bookingMemo = ref('');

// Booking edit state (Error 3 Target)
const editingBookingId = ref(null);
const editDateTime = ref('');

// Toasts
const toasts = ref([]);

onMounted(() => {
  loadProperties();
  loadBookings();
});

const loadProperties = async () => {
  try {
    const res = await fetch('/api/properties');
    const data = await res.json();
    properties.value = data;
  } catch (err) {
    showToast('매물 리스트 정보를 불러오지 못했습니다.', 'danger');
  }
};

const loadBookings = async () => {
  try {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    bookings.value = data;
  } catch (err) {
    showToast('임장 예약 이력을 불러오지 못했습니다.', 'danger');
  }
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

// Error 1: Favorite mapping uses INDEX rather than property ID
const toggleFavorite = (index) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 매물 찜하기(Favorite) 목록을 저장할 때, 
  // 매물의 고유 데이터베이스 ID 대신에 현재 필터링된 배열 순서의 인덱스(index)값을 보관하도록 설계합니다. 
  // 정렬 순서가 오름차순/내림차순 등으로 뒤바뀌면 기존 찜 마커 상태가 다른 엉뚱한 매물 카드로 전이됩니다.
  const pos = starredIndexes.value.indexOf(index);
  if (pos > -1) {
    starredIndexes.value.splice(pos, 1);
  } else {
    starredIndexes.value.push(index);
  }
};

const isFavorite = (index) => {
  return starredIndexes.value.includes(index);
};

// Filtered Properties list
const filteredProperties = computed(() => {
  let list = [...properties.value];

  // Category
  if (selectedType.value !== 'All') {
    list = list.filter(p => p.type === selectedType.value);
  }

  // Price type
  if (selectedPriceType.value !== 'All') {
    list = list.filter(p => p.priceType === selectedPriceType.value);
  }

  // Max price (For deposit / monthly or sale price)
  list = list.filter(p => p.price <= maxPrice.value);

  // Search keyword
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }

  // Sorting
  if (priceSort.value === 'asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (priceSort.value === 'desc') {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
});

// Error 4: Filter change does NOT close previous active listing detail panel
const handleFilterChange = () => {
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 상단 매물 조건 필터를 사용자가 변경할 때, 
  // 이전에 활성화되어 있던 매물의 상세 정보 매핑 아이디(selectedListingId)를 닫거나 
  // null로 리셋하지 않고 그대로 노출시킵니다.
  // 이로 인해 필터링 리스트에 부합하지 않는 매물의 상세 패널이 그대로 남아 있게 됩니다.
  // 원래 진행되어야 하는 초기화 로직 스킵:
  // selectedListingId.value = null;
};

// Helper price format
const formatPrice = (p) => {
  if (p.priceType === '월세') {
    return `보증금 ${p.deposit.toLocaleString()} / 월 ${p.price.toLocaleString()}만원`;
  }
  
  const val = p.price;
  if (val >= 10000) {
    const eok = Math.floor(val / 10000);
    const man = val % 10000;
    return `${p.priceType} ${eok}억 ${man > 0 ? man.toLocaleString() + '만원' : ''}`;
  }
  return `${p.priceType} ${val.toLocaleString()}만원`;
};

const activeListing = computed(() => {
  return properties.value.find(p => p.id === selectedListingId.value);
});

// Submit Visit Booking
const submitBooking = async () => {
  if (!selectedListingId.value) return;

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: selectedListingId.value,
        dateTime: bookingDateTime.value,
        memo: bookingMemo.value
      })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '방문 예약 생성 실패');
    }

    showToast('임장 방문 예약 신청서가 성공적으로 접수되었습니다.', 'success');
    bookingMemo.value = '';
    await loadBookings();
  } catch (err) {
    showToast(`[예약 실패] ${err.message}`, 'danger');
  }
};

// Update Booking (Error 3 Target)
const toggleEditMode = (book) => {
  editingBookingId.value = book.id;
  editDateTime.value = book.dateTime;
};

const saveBookingEdit = async (bookingId) => {
  try {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateTime: editDateTime.value
      })
    });

    if (res.ok) {
      showToast('임장 일정이 수정되었습니다. (이전 예약 내역도 동시 누적)', 'success');
      editingBookingId.value = null;
      await loadBookings();
    } else {
      const errData = await res.json();
      throw new Error(errData.error || '수정 실패');
    }
  } catch (err) {
    showToast(`[수정 에러] ${err.message}`, 'danger');
  }
};
</script>
