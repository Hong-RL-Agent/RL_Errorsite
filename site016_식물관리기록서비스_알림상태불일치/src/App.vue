<template>
  <div class="greennote-app">
    <!-- Navbar Header -->
    <header class="app-navbar">
      <div class="navbar-logo">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
        <span class="logo-title">GreenNote</span>
        <span class="logo-subtitle">스마트 반려식물 건강 다이어리</span>
      </div>
      <div class="navbar-actions">
        <span class="view-mode-lbl">반려식물 동기화 관리 모드</span>
      </div>
    </header>

    <!-- Main Workspace Layout Grid -->
    <div class="workspace-grid">
      
      <!-- Left Sidebar: Plants Catalog & Registrations -->
      <aside class="panel-section left-plants-panel">
        <div class="panel-header">
          <h2>🪴 내 반려식물 화분</h2>
          <p class="subtitle">돌보고 있는 식물들을 화분 형태로 관리합니다.</p>
        </div>

        <div class="plants-pot-list">
          <div 
            v-for="plant in plants" 
            :key="plant.id" 
            class="plant-pot-card"
            :class="{ active: selectedPlantId === plant.id }"
            @click="selectPlant(plant.id)"
          >
            <!-- Vertical Flowerpot Style Design -->
            <div class="plant-pot-body">
              <div class="leaf-sprout">🌿</div>
              <div class="pot-rim"></div>
              <div class="pot-soil"></div>
            </div>
            <div class="plant-pot-info">
              <h3>{{ plant.name }}</h3>
              <p class="species">{{ plant.species }}</p>
              <p class="water-badge">💧 {{ plant.waterPeriod }}일 주기</p>
            </div>
            <button class="delete-plant-btn" @click.stop="deletePlant(plant.id)">&times;</button>
          </div>
        </div>

        <!-- Add plant form -->
        <div class="add-plant-box">
          <h3>➕ 새 반려식물 입양 등록</h3>
          <div class="form-grid">
            <input type="text" v-model="newPlantName" placeholder="식물 이름 (예: 베이비 몬스)" class="form-in" />
            <input type="text" v-model="newPlantSpecies" placeholder="학명/품종 (예: Monstera)" class="form-in" />
            <input type="number" v-model="newPlantWater" placeholder="물주기 주기(일)" class="form-in" />
            <input type="text" v-model="newPlantLocation" placeholder="화분 배치 위치" class="form-in" />
            <button class="submit-plant-btn" @click="registerPlant">식물 등록</button>
          </div>
        </div>
      </aside>

      <!-- Center Panel: Accordion Details & Care Calendar -->
      <main class="center-calendar-panel">
        
        <!-- Accordion Plant Detail (Selected Plant) -->
        <section v-if="activePlant" class="panel-section plant-accordion-details">
          <div class="accordion-head" @click="detailsExpanded = !detailsExpanded">
            <h2>🔎 [상세조회] {{ activePlant.name }} 아코디언 패널</h2>
            <span class="arrow-indicator">{{ detailsExpanded ? '▲ 접기' : '▼ 펼치기' }}</span>
          </div>

          <div v-if="detailsExpanded" class="accordion-body">
            <div class="details-grid">
              <div class="detail-cell">
                <strong>학명:</strong> <span>{{ activePlant.species }}</span>
              </div>
              <div class="detail-cell">
                <strong>물주기:</strong> <span>매 {{ activePlant.waterPeriod }}일마다 권장</span>
              </div>
              <div class="detail-cell">
                <strong>화분 위치:</strong> <span>{{ activePlant.location }}</span>
              </div>
              <div class="detail-cell">
                <strong>분갈이 권장 주기:</strong> <span>{{ activePlant.repotPeriod }}일</span>
              </div>
            </div>

            <!-- Watering / Care logs for active plant -->
            <div class="watering-timeline-box">
              <h3>💧 최근 관리 기록 타임라인</h3>
              <div class="logs-timeline">
                <div v-for="log in activePlantLogs" :key="log.id" class="timeline-log-node">
                  <span class="log-date">{{ log.date }}</span>
                  <span class="log-badge" :class="log.type">{{ log.type === 'water' ? '물주기' : '분갈이' }}</span>
                  <p class="log-memo">{{ log.memo }}</p>
                </div>
                <div v-if="activePlantLogs.length === 0" class="empty-placeholder">
                  아직 이 식물에 등록된 관리 기록이 없습니다.
                </div>
              </div>

              <!-- Quick Log form -->
              <div class="quick-log-form">
                <select v-model="newLogType" class="log-select">
                  <option value="water">💧 물주기 완료</option>
                  <option value="repot">🪵 분갈이 완료</option>
                </select>
                <input type="date" v-model="newLogDate" class="log-date-in" />
                <input type="text" v-model="newLogMemo" placeholder="메모 (예: 영양제 추가)" class="log-memo-in" />
                <button class="log-btn" @click="addWateringLog">기록 추가</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Care Calendar -->
        <section class="panel-section monthly-calendar-section">
          <div class="calendar-header-row">
            <h2>📅 월간 식물 관리 캘린더 ({{ currentMonth }})</h2>
            <div class="cal-nav-buttons">
              <button class="cal-nav-btn" @click="changeMonth('prev')">◀ 이전 달</button>
              <button class="cal-nav-btn" @click="changeMonth('next')">다음 달 ▶</button>
            </div>
          </div>

          <div class="calendar-grid-mesh">
            <!-- Headers -->
            <div v-for="day in ['일', '월', '화', '수', '목', '금', '토']" :key="day" class="cal-day-header">
              {{ day }}
            </div>

            <!-- Simulated Calendar Dates for June 2026 -->
            <div 
              v-for="d in calendarDays" 
              :key="d.dateStr" 
              class="cal-date-cell"
              :class="{ 'other-month': d.isOtherMonth, 'today': d.dateStr === '2026-06-23' }"
            >
              <span class="date-lbl">{{ d.dayNum }}</span>
              <div class="date-events">
                <div v-for="task in d.tasks" :key="task.id" class="cal-task-tag">
                  <span v-if="calendarCompletedIds.includes(task.id)" class="check-mark">✅</span>
                  {{ task.title }}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- Right Sidebar: Today's Tasks & Statistics -->
      <aside class="panel-section right-tasks-panel">
        
        <!-- Today's task list -->
        <div class="today-tasks-box">
          <div class="panel-header">
            <h2>📋 오늘 할 일 목록</h2>
          </div>

          <div class="tasks-vertical-list">
            <div 
              v-for="task in tasks" 
              :key="task.id" 
              class="task-card-item"
              :class="{ completed: todayCompletedIds.includes(task.id) }"
            >
              <div class="task-head">
                <span class="task-date-badge">{{ task.date }}</span>
                <button 
                  v-if="!todayCompletedIds.includes(task.id)" 
                  class="complete-action-btn"
                  @click="completeTask(task.id)"
                >
                  완료 처리
                </button>
                <span v-else class="completed-badge">완료</span>
              </div>
              <p class="task-title">{{ task.title }}</p>
            </div>
            <div v-if="tasks.length === 0" class="empty-placeholder">오늘 등록된 스케줄이 없습니다.</div>
          </div>

          <!-- Add Schedule Form -->
          <div class="add-task-form">
            <h4>📅 새 일정 스케줄 기입</h4>
            <input type="text" v-model="newTaskTitle" placeholder="일정명 (예: 분갈이용 흙 구입)" class="task-title-in" />
            <input type="date" v-model="newTaskDate" class="task-date-in" />
            <button class="task-submit-btn" @click="registerCareTask">스케줄 등록</button>
          </div>
        </div>

        <!-- Care statistics -->
        <div class="care-statistics-box">
          <h3>📊 화분 관리 통계</h3>
          <div class="stats-card">
            <div class="stat-row">
              <span>총 화분 개수:</span>
              <strong>{{ plants.length }}개</strong>
            </div>
            <div class="stat-row">
              <span>이번 달 관리 횟수:</span>
              <strong>{{ wateringLogs.length }}회</strong>
            </div>
            <div class="stat-row">
              <span>대기 일정 개수:</span>
              <strong>{{ tasks.length - todayCompletedIds.length }}개</strong>
            </div>
          </div>
        </div>
      </aside>

    </div>

    <!-- Toast alert notifications -->
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
const plants = ref([]);
const wateringLogs = ref([]);
const tasks = ref([]);

// UI interactive states
const selectedPlantId = ref('');
const submitPlantId = ref(''); // Stale ID Cache for watering form

const detailsExpanded = ref(true);
const currentMonth = ref('2026-06');
const toasts = ref([]);

// Form states
const newPlantName = ref('');
const newPlantSpecies = ref('');
const newPlantWater = ref(7);
const newPlantLocation = ref('');

const newLogType = ref('water');
const newLogDate = ref('2026-06-23');
const newLogMemo = ref('');

const newTaskTitle = ref('');
const newTaskDate = ref('2026-06-24');

// Completed task list trackers (Error 2 targets)
const calendarCompletedIds = ref([]);
const todayCompletedIds = ref([]);

onMounted(() => {
  loadPlants();
  loadWateringLogs();
  loadTasks();
});

const loadPlants = async () => {
  try {
    const res = await fetch('/api/plants');
    const data = await res.json();
    plants.value = data;
    if (plants.value.length > 0 && !selectedPlantId.value) {
      selectedPlantId.value = plants.value[0].id;
      submitPlantId.value = plants.value[0].id;
    }
  } catch (err) {
    showToast('식물 리스트를 불러오지 못했습니다.', 'danger');
  }
};

const loadWateringLogs = async () => {
  try {
    const res = await fetch('/api/watering');
    const data = await res.json();
    wateringLogs.value = data;
  } catch (err) {
    showToast('관리 이력을 조회하지 못했습니다.', 'danger');
  }
};

const loadTasks = async () => {
  try {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    tasks.value = data;
  } catch (err) {
    showToast('스케줄 캘린더 연동 실패', 'danger');
  }
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

// Error 1: submitPlantId does not update immediately on selectPlant
const selectPlant = (id) => {
  selectedPlantId.value = id;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 사용자가 식물 카드를 클릭해서 아코디언 대상을 변경하면, selectedPlantId는 변경하여 
  // 화면 세부 조회는 바뀌지만 물주기 기록 전송에 사용되는 내부 상태 변수인 'submitPlantId'는 즉각 업데이트하지 않고 
  // 이전 식물의 ID 상태로 방치시킵니다. 이 상태에서 사용자가 물주기 완료를 탭하면 이전 식물로 데이터가 전송되는 오작동을 유발합니다.
  // 원래 해야 할 동기화 코드:
  // submitPlantId.value = id;
};

const activePlant = computed(() => {
  return plants.value.find(p => p.id === selectedPlantId.value);
});

const activePlantLogs = computed(() => {
  return wateringLogs.value.filter(log => log.plantId === selectedPlantId.value);
});

const registerPlant = async () => {
  if (!newPlantName.value.trim() || !newPlantSpecies.value.trim()) {
    showToast('식물 이름과 학명은 필수 항목입니다.', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newPlantName.value,
        species: newPlantSpecies.value,
        waterPeriod: newPlantWater.value,
        location: newPlantLocation.value
      })
    });
    if (res.ok) {
      showToast(`${newPlantName.value} 식물이 내 화분 목록에 등록되었습니다.`, 'success');
      newPlantName.value = '';
      newPlantSpecies.value = '';
      newPlantLocation.value = '';
      await loadPlants();
    }
  } catch (err) {
    showToast('식물 등록 에러', 'danger');
  }
};

const deletePlant = async (id) => {
  if (!confirm('해당 반려식물을 화분 목록에서 제외하시겠습니까? (이력은 고아 데이터로 잔존)')) return;

  try {
    const res = await fetch(`/api/plants/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('식물이 목록에서 소거되었습니다. (물주기 기록은 보존됨)', 'success');
      selectedPlantId.value = '';
      await loadPlants();
      await loadWateringLogs();
    }
  } catch (err) {
    showToast('식물 소거 실패', 'danger');
  }
};

const addWateringLog = async () => {
  try {
    const res = await fetch('/api/watering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plantId: submitPlantId.value, // Using the stale ID
        type: newLogType.value,
        date: newLogDate.value,
        memo: newLogMemo.value
      })
    });

    if (res.ok) {
      showToast('식물 관리 기록 카드가 캘린더/상세 이력에 기록되었습니다.', 'success');
      newLogMemo.value = '';
      await loadWateringLogs();
      
      // Finally update submitPlantId for next transaction
      submitPlantId.value = selectedPlantId.value;
    }
  } catch (err) {
    showToast('기록 등록 에러', 'danger');
  }
};

const registerCareTask = async () => {
  if (!newTaskTitle.value.trim()) return;

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTaskTitle.value,
        date: newTaskDate.value
      })
    });
    if (res.ok) {
      showToast('새로운 일정 캘린더 노드가 적재되었습니다.', 'success');
      newTaskTitle.value = '';
      await loadTasks();
    }
  } catch (err) {
    showToast('일정 등록 실패', 'danger');
  }
};

const completeTask = (taskId) => {
  if (!calendarCompletedIds.value.includes(taskId)) {
    calendarCompletedIds.value.push(taskId);
  }
  if (!todayCompletedIds.value.includes(taskId)) {
    todayCompletedIds.value.push(taskId);
  }
  showToast('해당 일정을 완료 상태로 변경했습니다.', 'success');
};

// Error 2: Month movement resets calendarCompletedIds but leaves todayCompletedIds
const changeMonth = (direction) => {
  if (currentMonth.value === '2026-06') {
    currentMonth.value = '2026-07';
  } else {
    currentMonth.value = '2026-06';
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 월 단위 내비게이션 전환 시, 캘린더 렌더링에 필요한 완료 ID 맵인 
  // 'calendarCompletedIds' 배열은 강제 소거하여 달이 바뀐 뒤 원래 달로 와도 캘린더 안의 완료 체크 표시가 사라지게 하지만, 
  // 우측 '오늘 할 일' 목록 패널의 상태 추적용 배열인 'todayCompletedIds'는 그대로 유지시켜 
  // 오늘 할 일 목록에는 여전히 '완료' 뱃지 상태가 남아있게 만듭니다.
  calendarCompletedIds.value = [];
  
  showToast(`조회 달이 ${currentMonth.value}로 변경되었습니다. (캘린더 완료 표시만 초기화)`, 'info');
};

// Compute calendar grid days for June/July 2026
const calendarDays = computed(() => {
  const list = [];
  const startDayOfWeek = 1; // June 1st, 2026 is Monday (1)
  
  // Fill June
  if (currentMonth.value === '2026-06') {
    // Empty cells before Monday (Sunday)
    list.push({ dayNum: 31, isOtherMonth: true, dateStr: '2026-05-31', tasks: [] });
    
    for (let i = 1; i <= 30; i++) {
      const dateStr = `2026-06-${i.toString().padStart(2, '0')}`;
      const dayTasks = tasks.value.filter(t => t.date === dateStr);
      list.push({
        dayNum: i,
        isOtherMonth: false,
        dateStr,
        tasks: dayTasks
      });
    }
    // Remaining days to fill grid (35 cells)
    for (let i = 1; i <= 4; i++) {
      const dateStr = `2026-07-${i.toString().padStart(2, '0')}`;
      list.push({ dayNum: i, isOtherMonth: true, dateStr, tasks: [] });
    }
  } else {
    // Fill July
    // July 1st, 2026 is Wednesday (3)
    list.push({ dayNum: 28, isOtherMonth: true, dateStr: '2026-06-28', tasks: [] });
    list.push({ dayNum: 29, isOtherMonth: true, dateStr: '2026-06-29', tasks: [] });
    list.push({ dayNum: 30, isOtherMonth: true, dateStr: '2026-06-30', tasks: [] });

    for (let i = 1; i <= 31; i++) {
      const dateStr = `2026-07-${i.toString().padStart(2, '0')}`;
      list.push({
        dayNum: i,
        isOtherMonth: false,
        dateStr,
        tasks: []
      });
    }
    list.push({ dayNum: 1, isOtherMonth: true, dateStr: '2026-08-01', tasks: [] });
  }
  return list;
});
</script>
