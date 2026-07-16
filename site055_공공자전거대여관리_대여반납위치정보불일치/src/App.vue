<template>
  <div class="citybike-app">
    
    <!-- Top Header bar -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="5.5" cy="17.5" r="2.5" />
          <circle cx="18.5" cy="17.5" r="2.5" />
          <path d="M15 17.5c0-1.93-1.57-3.5-3.5-3.5H5.5" />
          <path d="m12 14 2.5-4.5H19" />
          <path d="M18.5 17.5V14" />
          <path d="M12 9V5" />
          <path d="M8.5 5h7" />
        </svg>
        <span class="logo-title">CityBike</span>
        <span class="logo-subtitle">Smart Bike Rental Service</span>
      </div>

      <div class="header-right">
        <!-- Ticket status (Error 6 Target) -->
        <div class="ticket-status-box">
          <span>🎟️ 이용권 상태: </span>
          <strong class="ticket-lbl">{{ ticketInfo.name }}</strong>
          <span class="remaining-lbl"> (남은 시간: <strong class="time-warn">{{ remainingTimeCache }}분</strong>)</span>
        </div>

        <!-- User Selector (Error 6 Target) -->
        <div class="user-selector">
          <span>👤 회원 세션: </span>
          <select v-model="currentUser" @change="handleUserSwitch">
            <option value="사용자 A">사용자 A (김길동 - 120분권)</option>
            <option value="사용자 B">사용자 B (이순신 - 15분권)</option>
          </select>
        </div>

        <button class="sandbox-reset-btn" @click="resetSandbox">
          🔄 DB 초기화
        </button>
      </div>
    </header>

    <!-- Main Workspace Grid -->
    <div class="citybike-grid">

      <!-- Left Column: Filters and Regions -->
      <aside class="panel-section filter-sidebar">
        <h3>📍 구역별 대여소 필터</h3>
        <div class="region-filters">
          <button 
            v-for="r in ['전체', '강남구', '마포구', '영등포구', '송파구', '구로구']" 
            :key="r" 
            class="filter-btn"
            :class="{ active: selectedRegion === r }"
            @click="selectedRegion = r"
          >
            {{ r }}
          </button>
        </div>

        <!-- Stations quick list -->
        <div class="stations-list-block">
          <h3>🏢 대여소 간편 목록</h3>
          <div class="list-wrapper">
            <div 
              v-for="st in filteredStations" 
              :key="st.id" 
              class="station-list-card"
              :class="{ active: selectedStation?.id === st.id }"
              @click="selectedStation = st"
            >
              <strong>{{ st.name }}</strong>
              <div class="row">
                <span>지역: {{ st.region }}</span>
                <span>보유: <strong class="bikes-qty-lbl">{{ st.bikesCount }}대</strong></span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Column: SVG Map and search -->
      <main class="panel-section map-center">
        <div class="feed-header">
          <h2>🗺️ 실시간 공공 자전거 대여소 지도</h2>
          <button class="refresh-race-btn" @click="triggerRefreshRace">
            ⚡ 수량 동시 새로고침 (Error 5)
          </button>
        </div>
        <p class="warn-desc">* 새로고침 시 지도와 상세의 대여 가능 수량이 달라지는 오류 (Error 5)</p>

        <!-- SVG Map Container (Error 3 Target) -->
        <div class="svg-map-wrapper">
          <svg class="bike-svg-map" viewBox="0 0 320 320">
            <!-- Background paths representing rivers and roads -->
            <rect width="320" height="320" fill="#0c1322" />
            <path d="M 0,150 Q 160,180 320,150" fill="none" stroke="#1b2e53" stroke-width="24" opacity="0.3" />
            <path d="M 160,0 V 320" fill="none" stroke="#162545" stroke-width="4" opacity="0.5" />
            <path d="M 0,80 H 320" fill="none" stroke="#162545" stroke-width="4" opacity="0.5" stroke-dasharray="4,4" />

            <!-- Station node markers -->
            <g v-for="(st, idx) in filteredStations" :key="st.id">
              <circle 
                :cx="st.x" 
                :cy="st.y" 
                r="10" 
                class="station-marker-circle"
                :class="{ selected: selectedStation?.id === st.id }"
                @click="handleMarkerSelect(idx)"
              />
              <text 
                :x="st.x" 
                :y="st.y - 14" 
                fill="#f8fafc" 
                font-size="8" 
                text-anchor="middle" 
                font-weight="bold"
              >
                {{ st.bikesCount }}대
              </text>
            </g>
          </svg>
        </div>

        <!-- Fault reports center (Error 4 Target) -->
        <div class="fault-reports-section">
          <h3>🔧 자전거 고장 및 손상 신고 접수</h3>
          <p class="warn-desc">* 신고 철회 취소를 해도 자전거 점검 상태가 영구 유지됨 (Error 4)</p>
          <div class="reports-list">
            <div v-for="f in faultReports" :key="f.id" class="fault-card">
              <span>자전거: <strong>{{ f.bikeId }}</strong> - {{ f.description }}</span>
              <button class="cancel-fault-btn" @click="cancelFaultReport(f.id)">신고 취소 (Error 4)</button>
            </div>
            <div v-if="faultReports.length === 0" class="empty-lbl">현재 접수된 고장 신고가 없습니다.</div>
          </div>

          <div class="report-form">
            <input type="text" placeholder="자전거 번호 (예: bike-10)..." v-model="newFaultBikeId" />
            <input type="text" placeholder="고장 증상 기재..." v-model="newFaultDesc" />
            <button @click="submitFaultReport">접수</button>
          </div>
        </div>
      </main>

      <!-- Right Column: Selected Station details & usage timelines (Error 1, 2 Target) -->
      <aside class="panel-section details-sidebar">
        
        <div v-if="selectedStation" class="station-details-card">
          <div class="header">
            <h3>{{ selectedStation.name }} 상세</h3>
            <span class="region-tag">{{ selectedStation.region }}</span>
          </div>

          <div class="stat-gauge-row">
            <span>대여 가능 자전거: <strong>{{ selectedStation.bikesCount }} 대</strong></span>
            <span>거치대 총 용량: {{ selectedStation.capacity }} 슬롯</span>
          </div>

          <!-- Bikes inside this station -->
          <div class="bikes-list-block">
            <h4>🚲 보관 중인 자전거 목록</h4>
            <div class="bikes-stack">
              <div 
                v-for="b in stationBikes" 
                :key="b.id" 
                class="bike-row-card"
              >
                <div class="info">
                  <strong>{{ b.id }}</strong>
                  <span class="model">{{ b.model }}</span>
                </div>
                <div class="actions">
                  <span v-if="b.status === 'UNDER_INSPECTION'" class="badge inspection">점검 중</span>
                  <span v-else-if="b.status === 'RENTED'" class="badge rented">대여 중</span>
                  <button 
                    v-else 
                    class="rent-btn"
                    @click="triggerDoubleRentRace(b.id)"
                  >
                    ⚡ 대여 (연타-Error 1)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-lbl">
          지도의 대여소 원형 마커를 탭하시면 상세 대여창이 활성화됩니다.
        </div>

        <!-- Active Rental and return (Error 2 Target) -->
        <div class="active-rentals-block">
          <h3>🚴 나의 활성 대여 상태</h3>
          <div v-if="activeRental" class="active-rental-card">
            <h4>자전거: {{ activeRental.bikeId }}</h4>
            <p>대여 지점: {{ getStationName(activeRental.startStation) }}</p>
            
            <div class="return-race-panel">
              <label>반납할 임의 대여소 설정:</label>
              <select v-model="targetReturnStation">
                <option v-for="st in stations" :key="st.id" :value="st.id">
                  {{ st.name }}
                </option>
              </select>

              <button class="race-trigger-btn" @click="triggerReturnDestinationRace(activeRental.bikeId)">
                ⚡ 반납지 변경 후 바로 반납 (Error 2)
              </button>
            </div>
          </div>
          <div v-else class="empty-lbl">현재 대여 중인 자전거가 없습니다.</div>
        </div>

        <!-- Usage history timeline (Error 1, 6 Result Display) -->
        <div class="history-timeline-block">
          <h3>📜 나의 공공 자전거 이용 내역</h3>
          <div class="timeline-stack">
            <div v-for="hist in usageHistory" :key="hist.id" class="timeline-item">
              <div class="header">
                <strong>{{ hist.bikeId }}</strong>
                <span class="status-tag" :class="hist.status">{{ hist.status }}</span>
              </div>
              <div class="row">
                <span>출발: {{ getStationName(hist.startStation) }}</span>
                <span>도착: {{ hist.endStation ? getStationName(hist.endStation) : '대여 중' }}</span>
              </div>
              <small>{{ hist.date }}</small>
            </div>
          </div>
        </div>

      </aside>

    </div>

    <!-- Toast message stack -->
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

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const currentUser = ref('사용자 A');
    
    // DB datasets
    const stations = ref([]);
    const bikes = ref([]);
    const usageHistory = ref([]);
    const faultReports = ref([]);
    const ticketInfo = ref({ name: '패스권 로드 중...', remainingMinutes: 0 });

    // UI filters
    const selectedRegion = ref('전체');
    const selectedStation = ref(null);

    // Form inputs
    const newFaultBikeId = ref('');
    const newFaultDesc = ref('');
    const targetReturnStation = ref('st-03');
    const toasts = ref([]);

    // Stale ticket cache (Error 6 Target)
    const remainingTimeCache = ref(120);

    onMounted(async () => {
      await loadAll();
    });

    const loadAll = async () => {
      await loadStations();
      await loadBikes();
      await loadHistory();
      await loadFaults();
      await loadTicketInfo();
    };

    const loadStations = async () => {
      const res = await fetch('/api/stations');
      stations.value = await res.json();
      if (stations.value.length > 0 && !selectedStation.value) {
        selectedStation.value = stations.value[0];
      }
    };

    const loadBikes = async () => {
      const res = await fetch('/api/bikes');
      bikes.value = await res.json();
    };

    const loadHistory = async () => {
      const res = await fetch(`/api/rentals/history?user=${currentUser.value}`);
      usageHistory.value = await res.json();
    };

    const loadFaults = async () => {
      const res = await fetch('/api/faults');
      faultReports.value = await res.json();
    };

    const loadTicketInfo = async () => {
      const res = await fetch(`/api/tickets?user=${currentUser.value}`);
      const data = await res.json();
      ticketInfo.value = data;
      remainingTimeCache.value = data.remainingMinutes;
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
      showToast('CityBike 대여소 정보 및 자전거 위치가 초기화되었습니다.', 'success');
      await loadAll();
    };

    // User Switcher (Error 6 Target)
    const handleUserSwitch = async () => {
      showToast(`회원 세션이 [${currentUser.value}]으로 변경되었습니다.`, 'info');
      
      // Load only history logs for User B
      await loadHistory();
      
      // INTENTIONAL_ERROR
      // CATEGORY: Session
      // DESCRIPTION: 사용자를 스위칭해도 대여권 잔여 사용 가능 분(Minutes) 
      // 캐시 변수(`remainingTimeCache`)의 값을 갱신하지 않고 이전 회원 A의 잔여 만료 
      // 시간 정보(120분)를 B 계정에 그대로 유출하여 노출하는 세션 정보 캐싱 유출 결함입니다.
    };

    // Marker select (Error 3 Target)
    const handleMarkerSelect = (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 지역 필터(예: 마포구)가 적용되어 지도 마커 개수가 줄어들었음에도, 
      // 지도 마커 클릭 핸들러가 걸러진 필터 리스트(`filteredStations`) 대신 
      // 원본 전체 대여소 목록(`stations`) 배열의 index를 무조건 탐색함으로써 
      // 마커의 지리 정보와 무관한 엉뚱한 대여소 정보 카드가 우측 패널에 렌더링되게 만듭니다.
      selectedStation.value = stations.value[index];
      showToast(`대여소 [${selectedStation.value.name}]가 선택되었습니다.`, 'info');
    };

    // Fast Rent Double Clicks simulator (Error 1 Target)
    const triggerDoubleRentRace = (bikeId) => {
      showToast('자전거 대여 고속 이중 연타 요청을 전송합니다.', 'info');

      const payload = {
        bikeId,
        user: currentUser.value,
        startStation: selectedStation.value.id
      };

      // 1st request
      fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 2nd request immediately
      fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => res.json()).then(async () => {
        showToast('대여 완료 승인 (동일 자전거의 이중 성공 확인)', 'warning');
        await loadHistory();
        await loadBikes();
        await loadStations();
      });
    };

    // Return Destination Race simulator (Error 2 Target)
    const triggerReturnDestinationRace = (bikeId) => {
      const prevStation = activeRental.value ? activeRental.value.startStation : 'st-01';
      const newStation = targetReturnStation.value;

      showToast(`반납지를 [${getStationName(newStation)}]으로 변경 후 즉시 반납합니다.`, 'info');

      // 1. PATCH return target (3s delay on server)
      fetch(`/api/rentals/${bikeId}/return-station`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: newStation })
      });

      // 2. POST return (0.1s delay on server)
      setTimeout(async () => {
        const res = await fetch(`/api/rentals/${bikeId}/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: currentUser.value })
        });
        if (res.ok) {
          showToast('반납 최종 승인 완료 (0.1초 만에 실행)', 'success');
          await loadHistory();
          await loadBikes();
          await loadStations();
        }
      }, 100);

      // Refresh after 3.5s to see the location mismatch
      setTimeout(async () => {
        showToast('반납지 변경 지연 요청 기입 완료 (위치 기록 불일치 발생)', 'warning');
        await loadHistory();
        await loadBikes();
        await loadStations();
      }, 3500);
    };

    // Cancel fault report (Error 4 Target)
    const cancelFaultReport = async (faultId) => {
      const res = await fetch(`/api/faults/${faultId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('고장 신고 접수가 철회 취소되었습니다.', 'success');
        await loadFaults();
        // Note: We bypass reloading bikes list immediately to let the status remain UNDER_INSPECTION (Error 4)
      }
    };

    // Submit fault report
    const submitFaultReport = async () => {
      if (!newFaultBikeId.value.trim()) return;

      const res = await fetch('/api/faults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bikeId: newFaultBikeId.value,
          description: newFaultDesc.value
        })
      });
      if (res.ok) {
        showToast('자전거 고장 점검 신고가 접수되었습니다.', 'warning');
        newFaultBikeId.value = '';
        newFaultDesc.value = '';
        await loadFaults();
        await loadBikes();
      }
    };

    // Fast Refresh race simulator (Error 5 Target)
    const triggerRefreshRace = () => {
      showToast('대여소 자전거 수량 연쇄 새로고침 경합을 시작합니다.', 'info');

      // 1st request (3s delay) -> returns outdated bikesCount: 8
      fetch('/api/stations/refresh?count=1')
        .then(res => res.json())
        .then(data => {
          stations.value = data;
          showToast('구형 수량 정보 도착 (수량 8대 오버라이트)', 'warning');
        });

      // 2nd request (0.2s delay) -> returns fresh bikesCount: 12
      setTimeout(() => {
        fetch('/api/stations/refresh?count=2')
          .then(res => res.json())
          .then(data => {
            stations.value = data;
            showToast('최신 수량 정보 도착 (수량 12대 완료)', 'info');
          });
      }, 150);
    };

    // Computeds
    const filteredStations = computed(() => {
      return stations.value.filter(st => {
        if (selectedRegion.value === '전체') return true;
        return st.region === selectedRegion.value;
      });
    });

    const stationBikes = computed(() => {
      if (!selectedStation.value) return [];
      return bikes.value.filter(b => b.stationId === selectedStation.value.id);
    });

    const activeRental = computed(() => {
      return usageHistory.value.find(r => r.status === 'ACTIVE');
    });

    const getStationName = (stationId) => {
      const st = stations.value.find(s => s.id === stationId);
      return st ? st.name : stationId;
    };

    return {
      currentUser,
      stations,
      bikes,
      usageHistory,
      faultReports,
      ticketInfo,
      selectedRegion,
      selectedStation,
      newFaultBikeId,
      newFaultDesc,
      targetReturnStation,
      toasts,
      remainingTimeCache,
      handleUserSwitch,
      handleMarkerSelect,
      triggerDoubleRentRace,
      triggerReturnDestinationRace,
      cancelFaultReport,
      submitFaultReport,
      triggerRefreshRace,
      filteredStations,
      stationBikes,
      activeRental,
      getStationName
    };
  }
};
</script>
