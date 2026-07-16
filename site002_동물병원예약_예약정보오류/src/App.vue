<script setup>
import { ref, onMounted, watch } from 'vue';

// App State
const pets = ref([]);
const vets = ref([]);
const reservations = ref([]);

const selectedPet = ref(null);
const selectedVet = ref(null);
const selectedDepartment = ref('');
const currentTab = ref('pets'); // mobile tab: pets, vets, schedule, reservations

// Forms
const isDrawerOpen = ref(false);
const form = ref({
  petId: '',
  petName: '',
  vetId: '',
  vetName: '',
  department: '',
  day: '',
  time: '',
  memo: ''
});

// UI
const toasts = ref([]);
const isNextWeekLoading = ref(false);
const departments = ['내과', '외과', '피부과', '예방접종'];
const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const days = ["월", "화", "수", "목", "금"];

// Methods
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

const loadData = async () => {
  try {
    const resPets = await fetch('/api/pets');
    pets.value = await resPets.json();
    if (pets.value.length > 0) {
      selectPet(pets.value[0]);
    }

    const resVets = await fetch('/api/vets');
    vets.value = await resVets.json();
    if (vets.value.length > 0) {
      selectedVet.value = vets.value[0];
    }

    await loadReservations();
  } catch (err) {
    showToast('서버 데이터 로드 중 에러가 발생했습니다.', 'danger');
  }
};

const loadReservations = async () => {
  try {
    const res = await fetch('/api/reservations');
    reservations.value = await res.json();
  } catch (err) {
    showToast('예약 정보를 가져올 수 없습니다.', 'danger');
  }
};

// Select Pet Handler
const selectPet = (pet) => {
  selectedPet.value = pet;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 반려동물 A를 선택하고 진료과를 고른 후, 다른 반려동물 B로 대상을 전환할 때 
  // selectedPet 상태는 업데이트되어 화면 좌측 상단에는 B가 선택된 것으로 표시되나, 
  // 실제 예약 폼에 사용되는 내부 form 객체의 petName 및 petId 값은 동기화되지 않고 이전 A의 정보가 그대로 남게 만듭니다.
  if (!selectedDepartment.value) {
    form.value.petId = pet.id;
    form.value.petName = pet.name;
  }
};

// Select Department
const selectDepartment = (dept) => {
  selectedDepartment.value = dept;
  form.value.department = dept;
};

// Select Vet
const selectVet = (vet) => {
  selectedVet.value = vet;
  currentTab.value = 'schedule'; // Auto tab switch on mobile
};

// Click Time Slot to Book
const openBookingDrawer = (day, time) => {
  if (!selectedPet.value) {
    showToast('진료받을 반려동물을 먼저 선택해 주세요.', 'warning');
    return;
  }
  if (!selectedDepartment.value) {
    showToast('진료할 과목(부서)을 선택해 주세요.', 'warning');
    return;
  }

  form.value.vetId = selectedVet.value.id;
  form.value.vetName = selectedVet.value.name;
  form.value.day = day;
  form.value.time = time;
  
  isDrawerOpen.value = true;
};

// Next Week Schedule Action (Error 5)
const loadNextWeekSchedule = async () => {
  isNextWeekLoading.value = true;
  
  // Create AbortController with 3 seconds timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000);

  try {
    // INTENTIONAL_ERROR
    // CATEGORY: Network (Frontend Timeout)
    // DESCRIPTION: '다음 주 일정 불러오기' 클릭 시 3초 경과 후 AbortController.abort()를 실행하여 
    // 통신을 강제 취소시킴으로써, 백엔드의 8초짜리 지연 API에 대응하여 타임아웃 오류를 인위적으로 유발합니다.
    const res = await fetch('/api/vets/schedule/next', {
      signal: controller.signal
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (data.success) {
      vets.value.forEach(v => {
        if (data.nextWeekSchedule[v.id]) {
          v.schedule = data.nextWeekSchedule[v.id];
        }
      });
      showToast('다음 주 진료 일정이 조회되었습니다.', 'success');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      showToast('네트워크 오류: 진료 일정 조회 요청이 3초의 응답 시간 초과로 강제 중단되었습니다. (HTTP Timeout)', 'danger');
    } else {
      showToast(`통신 오류: ${err.message}`, 'danger');
    }
  } finally {
    clearTimeout(timeoutId);
    isNextWeekLoading.value = false;
  }
};

// Submit booking form
const submitReservation = async () => {
  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await res.json();

    if (!res.ok) {
      // This catches Error 2 (memo length > 120 chars -> return 500)
      throw new Error(data.error || '진료 예약 생성에 실패했습니다.');
    }

    showToast(`${form.value.petName}의 예약이 성공적으로 잡혔습니다!`, 'success');
    isDrawerOpen.value = false;
    form.value.memo = '';
    await loadReservations();
  } catch (err) {
    showToast(`예약 전송 실패: ${err.message}`, 'danger');
  }
};

// Cancel Reservation (Error 3)
const cancelReservation = async (id) => {
  if (!confirm('예약을 취소하시겠습니까?')) return;

  try {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '취소 실패');
    }

    showToast('예약이 정상적으로 취소되었습니다.', 'success');
    
    // Front-end state updates locally immediately (disappears on screen)
    reservations.value = reservations.value.filter(r => r.id !== id);
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

// Check if a time slot is already booked in current reservations
const isSlotReserved = (day, time) => {
  if (!selectedVet.value) return false;
  return reservations.value.some(
    r => r.vetId === selectedVet.value.id && r.day === day && r.time === time
  );
};

// Check if a slot is available on vet's schedule template
const isSlotAvailableInSchedule = (day, time) => {
  if (!selectedVet.value) return false;
  const daySchedule = selectedVet.value.schedule[day];
  return daySchedule && daySchedule.includes(time);
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="pawcare-app">
    <!-- Navbar -->
    <header class="app-navbar">
      <div class="navbar-logo">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 4.14-2.86 6-2.26 1.4.45 2.1 1.78 1.8 3.2-.3 1.4-1.2 2.5-2.5 3.3.43 1.15.54 2.45.3 3.7a7 7 0 0 1-13.6 0c-.24-1.25-.13-2.55.3-3.7-1.3-.8-2.2-1.9-2.5-3.3-.3-1.42.4-2.75 1.8-3.2 1.86-.6 4.22.26 6 2.26.65-.17 1.33-.26 2-.26z"/>
        </svg>
        <span class="logo-title">PawCare</span>
        <span class="logo-subtitle">동물병원 진료시스템</span>
      </div>
      <div class="navbar-actions">
        <button class="nav-btn" @click="currentTab = 'reservations'">
          📋 내 예약 확인 ({{ reservations.length }})
        </button>
      </div>
    </header>

    <!-- Mobile Tabs -->
    <div class="mobile-tabs-nav">
      <button :class="{ active: currentTab === 'pets' }" @click="currentTab = 'pets'">🐾 반려동물</button>
      <button :class="{ active: currentTab === 'vets' }" @click="currentTab = 'vets'">🩺 수의사</button>
      <button :class="{ active: currentTab === 'schedule' }" @click="currentTab = 'schedule'">📅 일정</button>
      <button :class="{ active: currentTab === 'reservations' }" @click="currentTab = 'reservations'">📂 내역</button>
    </div>

    <!-- Main Board -->
    <div class="dashboard-grid">
      <!-- Left Panel: Pets -->
      <section class="panel-section column-pets" :class="{ 'mobile-hidden': currentTab !== 'pets' }">
        <div class="panel-header">
          <h2>🐾 반려동물 프로필</h2>
        </div>
        <div class="pets-list">
          <div 
            v-for="pet in pets" 
            :key="pet.id" 
            class="pet-card"
            :class="{ active: selectedPet && selectedPet.id === pet.id }"
            @click="selectPet(pet)"
          >
            <div class="pet-avatar-wrapper">
              <img :src="pet.icon" :alt="pet.name" class="pet-avatar" />
            </div>
            <div class="pet-meta">
              <h3>{{ pet.name }}</h3>
              <p>{{ pet.breed }} ({{ pet.age }})</p>
              <span class="pet-type-tag">{{ pet.type }}</span>
            </div>
          </div>
        </div>

        <div class="panel-header" style="margin-top: 1.5rem;">
          <h2>🩺 진료과목 선택</h2>
        </div>
        <div class="departments-grid">
          <button 
            v-for="dept in departments" 
            :key="dept"
            class="dept-btn"
            :class="{ active: selectedDepartment === dept }"
            @click="selectDepartment(dept)"
          >
            {{ dept }}
          </button>
        </div>
      </section>

      <!-- Center Panel: Schedule -->
      <section class="panel-section column-schedule" :class="{ 'mobile-hidden': currentTab !== 'schedule' }">
        <div class="panel-header schedule-header-row">
          <h2>📅 주간 진료 일정표</h2>
          <button 
            class="next-week-btn" 
            :disabled="isNextWeekLoading"
            @click="loadNextWeekSchedule"
          >
            {{ isNextWeekLoading ? '일정 로딩 중...' : '다음 주 일정 불러오기' }}
          </button>
        </div>

        <div class="timetable-card">
          <div class="vet-schedule-summary" v-if="selectedVet">
            <span>선택된 수의사: <strong>{{ selectedVet.name }}</strong></span>
            <span class="dept-badge-label" v-if="selectedDepartment">신청 과목: <strong>{{ selectedDepartment }}</strong></span>
          </div>

          <div class="table-container">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th>시간</th>
                  <th v-for="day in days" :key="day">{{ day }}요일</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="time in timeSlots" :key="time">
                  <td class="time-label">{{ time }}</td>
                  <td v-for="day in days" :key="day">
                    <!-- Case 1: Slot is already reserved (occupied) -->
                    <div 
                      v-if="isSlotReserved(day, time)" 
                      class="schedule-slot slot-reserved"
                    >
                      예약완료
                    </div>
                    <!-- Case 2: Slot is available in schedule template -->
                    <button 
                      v-else-if="isSlotAvailableInSchedule(day, time)" 
                      class="schedule-slot slot-available"
                      @click="openBookingDrawer(day, time)"
                    >
                      예약가능
                    </button>
                    <!-- Case 3: Vet has no schedule template here -->
                    <div 
                      v-else 
                      class="schedule-slot slot-none"
                    >
                      휴진
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Right Panel: Vet Details -->
      <section class="panel-section column-vets" :class="{ 'mobile-hidden': currentTab !== 'vets' }">
        <div class="panel-header">
          <h2>🩺 전담 수의사 목록</h2>
        </div>
        <div class="vets-list">
          <div 
            v-for="vet in vets" 
            :key="vet.id"
            class="vet-card"
            :class="{ active: selectedVet && selectedVet.id === vet.id }"
            @click="selectVet(vet)"
          >
            <div class="vet-photo-wrapper">
              <img :src="vet.image" :alt="vet.name" class="vet-photo" />
            </div>
            <div class="vet-info">
              <h3>{{ vet.name }}</h3>
              <p class="specialty-text">{{ vet.specialty }}</p>
            </div>
          </div>
        </div>

        <div class="vet-details-card" v-if="selectedVet">
          <h3>🩺 약력 및 소개</h3>
          <p class="vet-bio">{{ selectedVet.bio }}</p>
        </div>
      </section>
    </div>

    <!-- Reservations History Board -->
    <section class="reservations-section" :class="{ 'mobile-hidden': currentTab !== 'reservations' }">
      <div class="panel-header">
        <h2>📂 실시간 진료 예약 접수 내역 (새로고침 시 데이터가 유지됩니다)</h2>
      </div>
      <div class="reservations-container">
        <div v-if="reservations.length === 0" class="empty-res">
          접수된 예약 진료 내역이 없습니다.
        </div>
        <div v-else class="res-list">
          <div v-for="res in reservations" :key="res.id" class="res-item">
            <div class="res-body">
              <span class="res-id-badge">{{ res.id }}</span>
              <div class="res-meta-line">
                <strong>{{ res.petName }}</strong> (반려동물) | 
                <strong>{{ res.vetName }}</strong> (담당 수의사) | 
                <strong>{{ res.department }}</strong>
              </div>
              <div class="res-time-line">
                진료 일자: <strong>{{ res.day }}요일 {{ res.time }}</strong>
              </div>
              <div class="res-memo" v-if="res.memo">
                메모: "{{ res.memo }}"
              </div>
            </div>
            <button class="res-cancel-btn" @click="cancelReservation(res.id)">
              예약 취소
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Booking Drawer Overlay -->
    <div class="drawer-overlay" :class="{ active: isDrawerOpen }" @click="isDrawerOpen = false">
      <div class="drawer-content" @click.stop>
        <button class="drawer-close" @click="isDrawerOpen = false">&times;</button>
        <div class="drawer-header">
          <h3>📝 진료 예약 작성</h3>
          <p v-if="selectedVet">의사: {{ selectedVet.name }} | 일시: {{ form.day }}요일 {{ form.time }}</p>
        </div>
        
        <form @submit.prevent="submitReservation" class="booking-form">
          <div class="form-group">
            <label>선택된 반려동물</label>
            <input type="text" :value="form.petName" disabled class="disabled-input" />
            <p class="form-help-text">동물 변경은 왼쪽 반려동물 프로필을 클릭하세요.</p>
          </div>

          <div class="form-group">
            <label>진료 과목</label>
            <input type="text" :value="form.department" disabled class="disabled-input" />
          </div>

          <div class="form-group">
            <label>진료 요청 및 증상 기입 (최대 120자 제한)</label>
            <textarea 
              v-model="form.memo" 
              placeholder="예: 어제부터 밥을 잘 안 먹고 토하는 증상이 있습니다." 
              rows="3"
            ></textarea>
            <div class="char-counter" :class="{ 'char-danger': form.memo.length > 120 }">
              현재 자수: {{ form.memo.length }} / 120
            </div>
          </div>

          <button type="submit" class="submit-booking-btn">
            진료 예약 확정하기
          </button>
        </form>
      </div>
    </div>

    <!-- Toast container -->
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
