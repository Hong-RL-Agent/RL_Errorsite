/* ============================================================
   RoomBook Pro — site070 — app.js
   Vanilla JS: 회의실 예약 웹사이트
   Intentional bugs: bug01 (time slot duplicate), bug03 (no listener)
   Bug02 is in styles.css (calendar grid overflow)
   ============================================================ */

// ---- Constants ----
const ROOM_GRADIENTS = {
  'room-01': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'room-02': 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'room-03': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'room-04': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'room-05': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'room-06': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
};

const ROOM_ICONS = {
  'room-01': '🏛️',
  'room-02': '🎨',
  'room-03': '🚀',
  'room-04': '🎯',
  'room-05': '🌐',
  'room-06': '🌤️'
};

// ---- Application State ----
const state = {
  rooms: [],
  filteredRooms: [],
  selectedRoom: null,
  selectedDate: getTodayString(),
  selectedSlot: null,
  timeSlots: [],
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  summaryCollapsed: false
};

// ---- Utility Functions ----
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatPrice(n) {
  return '₩' + Number(n).toLocaleString('ko-KR');
}

function formatDateKo(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

// ---- API Functions ----
async function fetchRooms() {
  showLoading('rooms-grid', '회의실 정보를 불러오는 중...');
  try {
    const res = await fetch('/api/rooms');
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    state.rooms = json.data;
    state.filteredRooms = [...json.data];
    renderRoomCards(state.filteredRooms);
    document.getElementById('rooms-count-badge').textContent = `${json.data.length}개 공간`;
  } catch (e) {
    showError('rooms-grid', '회의실 정보를 불러오지 못했습니다.');
  }
}

async function fetchTimeSlots(roomId, date) {
  showLoading('time-slots-container', '시간 슬롯을 불러오는 중...');
  try {
    const res = await fetch(`/api/time-slots?roomId=${encodeURIComponent(roomId)}&date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    state.timeSlots = json.data;
    renderTimeSlots(json.data);
    const label = document.getElementById('slots-date-label');
    if (label) label.textContent = formatDateKo(date);
  } catch (e) {
    showError('time-slots-container', '시간 슬롯을 불러오지 못했습니다.');
  }
}

// ---- Loading / Error UI ----
function showLoading(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>${msg}</p></div>`;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<div class="error-state"><p>⚠️ ${msg}</p><button onclick="init()">다시 시도</button></div>`;
}

// ---- Room Card Rendering ----
function renderRoomCards(rooms) {
  const grid = document.getElementById('rooms-grid');
  grid.innerHTML = '';

  if (!rooms || rooms.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>조건에 맞는 회의실이 없습니다. 필터를 조정해 보세요.</p></div>';
    return;
  }

  rooms.forEach(room => {
    const gradient = ROOM_GRADIENTS[room.id] || ROOM_GRADIENTS['room-01'];
    const icon = ROOM_ICONS[room.id] || '🏢';

    const eqShown = room.equipment.slice(0, 3);
    const eqMore = room.equipment.length > 3 ? room.equipment.length - 3 : 0;
    const eqHtml = eqShown.map(e => `<span class="eq-tag">${e}</span>`).join('')
      + (eqMore > 0 ? `<span class="eq-tag eq-more">+${eqMore}</span>` : '');

    const card = document.createElement('div');
    card.className = `room-card${room.available ? '' : ' room-unavailable'}`;
    card.dataset.roomId = room.id;

    card.innerHTML = `
      <div class="room-card-image" style="background:${gradient};">
        <div class="room-card-image-icon">${icon}</div>
        <span class="room-capacity-badge">${room.capacity}인실</span>
        ${!room.available ? '<div class="room-unavail-badge">예약 불가</div>' : ''}
      </div>
      <div class="room-card-body">
        <h3 class="room-name">${room.name}</h3>
        <p class="room-location">📍 ${room.location}</p>
        <p class="room-desc">${room.description}</p>
        <div class="room-eq-tags">${eqHtml}</div>
        <div class="room-card-footer">
          <div class="room-price">${formatPrice(room.pricePerHour)}<span>/시간</span></div>
          <div class="room-card-btns">
            <button class="btn-detail" data-room-id="${room.id}">상세보기</button>
            ${room.available
              ? `<button class="btn-book${room.id === 'room-03' ? ' btn-book-bug' : ''}"
                  data-room-id="${room.id}"
                  ${room.id === 'room-03' ? 'data-bug-id="site070-bug03"' : ''}>예약하기</button>`
              : `<button class="btn-book disabled" disabled>예약불가</button>`
            }
          </div>
        </div>
      </div>
    `;

    // 상세보기 버튼 — 항상 정상 동작
    card.querySelector('.btn-detail').addEventListener('click', () => openModal(room));

    // INTENTIONAL GUI BUG: site070-bug03
    // CSV Error: 예약 버튼 무반응
    // Type: meeting-room-book-button-no-response
    // Description: 특정 회의실 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
    const bookBtn = card.querySelector('.btn-book:not(.disabled)');
    if (bookBtn && room.id !== 'room-03') {
      // 정상 회의실: click listener 연결
      bookBtn.addEventListener('click', () => selectRoom(room));
    }
    // room-03 (넥스트 라운지): click listener 의도적으로 연결하지 않음 → 버튼 클릭 무반응

    grid.appendChild(card);
  });
}

// ---- Room Selection ----
function selectRoom(room) {
  state.selectedRoom = room;
  state.selectedSlot = null;

  document.getElementById('selected-room-name').textContent = room.name;

  const bookingSection = document.getElementById('booking-section');
  bookingSection.classList.add('active');
  bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  renderCalendar();
  fetchTimeSlots(room.id, state.selectedDate);
  updateBookingSummary();
}

// ---- Calendar Rendering ----
function renderCalendar() {
  const year = state.calYear;
  const month = state.calMonth;

  document.getElementById('calendar-month-header').textContent = `${year}년 ${month + 1}월`;

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  // Empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cellDate = new Date(year, month, day);

    const isPast = cellDate < todayMidnight;
    const isToday = cellDate.getTime() === todayMidnight.getTime();
    const isSelected = dateStr === state.selectedDate;

    let cls = 'calendar-day';
    if (isPast) cls += ' past';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';

    cell.className = cls;
    cell.textContent = day;
    cell.dataset.date = dateStr;

    if (!isPast) {
      cell.addEventListener('click', () => onDateClick(dateStr, cell));
    }

    grid.appendChild(cell);
  }
}

function onDateClick(dateStr, cell) {
  state.selectedDate = dateStr;
  document.querySelectorAll('#calendar-grid .calendar-day.selected').forEach(c => c.classList.remove('selected'));
  cell.classList.add('selected');

  if (state.selectedRoom) {
    fetchTimeSlots(state.selectedRoom.id, dateStr);
  }
  updateBookingSummary();
}

// ---- Time Slot Rendering ----
function renderTimeSlots(slots) {
  const container = document.getElementById('time-slots-container');
  container.innerHTML = '';

  if (!slots || slots.length === 0) {
    container.innerHTML = '<p style="padding:20px;text-align:center;color:var(--text-light);font-size:13px;">이용 가능한 시간 슬롯이 없습니다.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'time-slots-list';
  list.setAttribute('data-bug-id', 'site070-bug01');

  slots.forEach(slot => {
    list.appendChild(createSlotEl(slot));
  });

  // INTENTIONAL GUI BUG: site070-bug01
  // CSV Error: 시간 슬롯 중복 표시
  // Type: duplicate-time-slot-display
  // Description: 시간 슬롯 렌더링 시 특정 slot을 추가로 append하여 같은 시간대가 중복 표시됨.
  if (slots.length >= 3) {
    // slots[2] = 11:00 슬롯을 목록 마지막에 한 번 더 추가 (의도된 버그)
    const dupEl = createSlotEl(slots[2]);
    dupEl.style.borderColor = '#D1D8E0'; // 시각적으로 동일하게 보이도록
    list.appendChild(dupEl);
  }

  container.appendChild(list);
}

function createSlotEl(slot) {
  const el = document.createElement('div');
  el.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;

  el.innerHTML = `
    <span class="slot-time">${slot.time}</span>
    <span class="slot-arrow">→</span>
    <span class="slot-end-time">${slot.endTime}</span>
    <span class="slot-status">${slot.available ? '예약 가능' : '예약 불가'}</span>
  `;

  if (slot.available) {
    el.addEventListener('click', () => onSlotClick(slot, el));
  }

  return el;
}

function onSlotClick(slot, el) {
  state.selectedSlot = slot;
  document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  updateBookingSummary();
}

// ---- Booking Summary ----
function updateBookingSummary() {
  const emptyEl = document.getElementById('summary-empty');
  const contentEl = document.getElementById('summary-content');

  if (!state.selectedRoom) {
    emptyEl.style.display = '';
    contentEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  contentEl.style.display = '';

  const room = state.selectedRoom;
  const gradient = ROOM_GRADIENTS[room.id] || ROOM_GRADIENTS['room-01'];

  document.getElementById('summary-room-thumb').style.background = gradient;
  document.getElementById('summary-room-name').textContent = room.name;
  document.getElementById('summary-room-location').textContent = '📍 ' + room.location;
  document.getElementById('summary-room-capacity').textContent = `최대 ${room.capacity}명`;
  document.getElementById('summary-capacity-max').textContent = `${room.capacity}명`;
  document.getElementById('summary-date').textContent = formatDateKo(state.selectedDate);
  document.getElementById('summary-time').textContent = state.selectedSlot
    ? `${state.selectedSlot.time} – ${state.selectedSlot.endTime}`
    : '시간 미선택';
  document.getElementById('summary-price').textContent = state.selectedSlot
    ? formatPrice(room.pricePerHour)
    : '-';

  const confirmBtn = document.getElementById('confirm-booking-btn');
  confirmBtn.disabled = !state.selectedSlot;
}

// ---- Filters ----
function applyFilters() {
  const minCap = parseInt(document.getElementById('filter-capacity').value, 10) || 0;
  const checkedEq = Array.from(document.querySelectorAll('.filter-equipment:checked')).map(cb => cb.value);

  state.filteredRooms = state.rooms.filter(room => {
    if (room.capacity < minCap) return false;
    if (checkedEq.length > 0 && !checkedEq.every(eq => room.equipment.includes(eq))) return false;
    return true;
  });

  renderRoomCards(state.filteredRooms);
  document.getElementById('rooms-count-badge').textContent = `${state.filteredRooms.length}개 공간`;
}

function resetFilters() {
  document.getElementById('filter-capacity').value = '0';
  document.querySelectorAll('.filter-equipment').forEach(cb => { cb.checked = false; });
  document.getElementById('hero-capacity-select').value = '0';
  state.filteredRooms = [...state.rooms];
  renderRoomCards(state.filteredRooms);
  document.getElementById('rooms-count-badge').textContent = `${state.rooms.length}개 공간`;
}

// ---- Modal ----
function openModal(room) {
  const modal = document.getElementById('room-modal');
  const gradient = ROOM_GRADIENTS[room.id] || ROOM_GRADIENTS['room-01'];
  const icon = ROOM_ICONS[room.id] || '🏢';

  const heroImg = document.getElementById('modal-room-image');
  heroImg.style.background = gradient;
  heroImg.style.display = 'flex';
  heroImg.style.alignItems = 'center';
  heroImg.style.justifyContent = 'center';
  heroImg.style.fontSize = '80px';
  heroImg.textContent = icon;

  document.getElementById('modal-room-name').textContent = room.name;
  document.getElementById('modal-room-location').textContent = room.location;
  document.getElementById('modal-room-capacity').textContent = `최대 ${room.capacity}인`;
  document.getElementById('modal-room-price').textContent = formatPrice(room.pricePerHour);

  const eqList = document.getElementById('modal-equipment-list');
  eqList.innerHTML = room.equipment.map(e => `<span class="eq-tag">${e}</span>`).join('');

  const bookBtn = document.getElementById('modal-book-btn');
  bookBtn.disabled = !room.available;
  bookBtn.onclick = () => {
    if (room.available) {
      closeModal();
      selectRoom(room);
    }
  };

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('room-modal').style.display = 'none';
  document.body.style.overflow = '';
}

// ---- Calendar Navigation ----
function prevMonth() {
  state.calMonth--;
  if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  renderCalendar();
}

function nextMonth() {
  state.calMonth++;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  renderCalendar();
}

// ---- Summary Panel Toggle ----
function toggleSummaryPanel() {
  state.summaryCollapsed = !state.summaryCollapsed;
  document.getElementById('booking-summary-panel').classList.toggle('collapsed', state.summaryCollapsed);
  document.getElementById('toggle-summary-btn').innerHTML = state.summaryCollapsed ? '&#9660;' : '&#9650;';
}

// ---- Event Listener Setup ----
function setupEventListeners() {
  // Filter controls
  document.getElementById('filter-capacity').addEventListener('change', applyFilters);
  document.querySelectorAll('.filter-equipment').forEach(cb => cb.addEventListener('change', applyFilters));
  document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);

  // Calendar nav
  document.getElementById('prev-month-btn').addEventListener('click', prevMonth);
  document.getElementById('next-month-btn').addEventListener('click', nextMonth);

  // Summary panel toggle
  document.getElementById('toggle-summary-btn').addEventListener('click', toggleSummaryPanel);

  // Confirm booking
  document.getElementById('confirm-booking-btn').addEventListener('click', () => {
    const room = state.selectedRoom;
    const slot = state.selectedSlot;
    if (room && slot) {
      alert(
        `✅ 예약이 완료되었습니다!\n\n` +
        `회의실: ${room.name}\n` +
        `위치: ${room.location}\n` +
        `날짜: ${formatDateKo(state.selectedDate)}\n` +
        `시간: ${slot.time} – ${slot.endTime}\n` +
        `금액: ${formatPrice(room.pricePerHour)}`
      );
    }
  });

  // Clear booking
  document.getElementById('clear-booking-btn').addEventListener('click', () => {
    state.selectedRoom = null;
    state.selectedSlot = null;
    updateBookingSummary();
    document.getElementById('selected-room-name').textContent = '-';
    document.getElementById('booking-section').classList.remove('active');
  });

  // Change room button
  document.getElementById('change-room-btn').addEventListener('click', () => {
    document.getElementById('rooms-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Modal close buttons
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('room-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('room-modal')) closeModal();
  });

  // Hero CTA — scrolls to rooms
  document.getElementById('hero-book-btn').addEventListener('click', () => {
    const minCap = parseInt(document.getElementById('hero-capacity-select').value, 10) || 0;
    document.getElementById('filter-capacity').value = String(minCap);
    applyFilters();
    document.getElementById('rooms-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Hero date input syncs to state
  const heroDate = document.getElementById('hero-date-input');
  heroDate.value = state.selectedDate;
  heroDate.min = getTodayString();
  heroDate.addEventListener('change', e => {
    state.selectedDate = e.target.value;
    if (state.selectedRoom) {
      fetchTimeSlots(state.selectedRoom.id, state.selectedDate);
    }
    renderCalendar();
    updateBookingSummary();
  });

  // Hero capacity → sync to filter
  document.getElementById('hero-capacity-select').addEventListener('change', e => {
    document.getElementById('filter-capacity').value = e.target.value;
  });

  // Smooth scroll nav links
  document.querySelectorAll('[data-scroll-to]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(el.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // "준비중입니다." for unimplemented features
  document.querySelectorAll('[data-coming-soon]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      alert('준비중입니다.');
    });
  });

  // ESC to close modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ---- Init ----
async function init() {
  state.selectedDate = getTodayString();
  state.calYear = new Date().getFullYear();
  state.calMonth = new Date().getMonth();

  setupEventListeners();
  await fetchRooms();
  renderCalendar();
  updateBookingSummary();
}

document.addEventListener('DOMContentLoaded', init);
