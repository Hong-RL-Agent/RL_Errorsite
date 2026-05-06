const state = {
  classes: [],
  instructors: [],
  filteredClasses: [],
  selectedClassId: null,
  selectedDate: null,
  seats: 1,
  favorites: new Set()
};

const BUGGY_RESERVE_CLASS_ID = 'fern-shade';

const els = {
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  retryLoad: document.getElementById('retryLoad'),
  classGrid: document.getElementById('classGrid'),
  instructorGrid: document.getElementById('instructorGrid'),
  difficultyFilter: document.getElementById('difficultyFilter'),
  plantFilter: document.getElementById('plantFilter'),
  sortSelect: document.getElementById('sortSelect'),
  searchInput: document.getElementById('searchInput'),
  resetFilters: document.getElementById('resetFilters'),
  datePills: document.getElementById('datePills'),
  scheduleGrid: document.getElementById('scheduleGrid'),
  summaryPanel: document.getElementById('summaryPanel'),
  summaryToggle: document.getElementById('summaryToggle'),
  summaryDetails: document.getElementById('summaryDetails'),
  seatMinus: document.getElementById('seatMinus'),
  seatPlus: document.getElementById('seatPlus'),
  seatCount: document.getElementById('seatCount'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalClose: document.getElementById('modalClose'),
  modalContent: document.getElementById('modalContent')
};

function formatPrice(value) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function formatDateLabel(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
}

function showLoading() {
  els.loadingState.hidden = false;
  els.errorState.hidden = true;
  els.classGrid.innerHTML = '';
}

function showError() {
  els.loadingState.hidden = true;
  els.errorState.hidden = false;
}

function getInstructor(instructorId) {
  return state.instructors.find((instructor) => instructor.id === instructorId);
}

async function loadData() {
  showLoading();
  try {
    const [classesResponse, instructorsResponse] = await Promise.all([
      fetch('/api/classes'),
      fetch('/api/instructors')
    ]);

    if (!classesResponse.ok || !instructorsResponse.ok) {
      throw new Error('API response failed');
    }

    const classesData = await classesResponse.json();
    const instructorsData = await instructorsResponse.json();

    state.classes = classesData.classes;
    state.instructors = instructorsData.instructors;
    state.selectedClassId = state.classes[0]?.id || null;
    state.selectedDate = collectDates()[0] || null;

    els.loadingState.hidden = true;
    els.errorState.hidden = true;
    applyFilters();
    renderInstructors();
    renderDatePills();
    renderSchedule();
    renderSummary();
  } catch (error) {
    showError();
  }
}

function collectDates() {
  return [...new Set(state.classes.flatMap((classItem) => classItem.schedule.map((slot) => slot.date)))].sort();
}

function applyFilters() {
  const difficulty = els.difficultyFilter.value;
  const plantType = els.plantFilter.value;
  const query = els.searchInput.value.trim().toLowerCase();
  const sortBy = els.sortSelect.value;

  let results = state.classes.filter((classItem) => {
    const difficultyMatch = difficulty === 'all' || classItem.difficulty === difficulty;
    const plantMatch = plantType === 'all' || classItem.plantType === plantType;
    const textMatch =
      !query ||
      classItem.title.toLowerCase().includes(query) ||
      classItem.description.toLowerCase().includes(query) ||
      classItem.plantType.toLowerCase().includes(query);
    return difficultyMatch && plantMatch && textMatch;
  });

  if (sortBy === 'priceLow') {
    results = results.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'durationShort') {
    results = results.sort((a, b) => a.duration - b.duration);
  } else {
    results = results.sort((a, b) => Number(b.recommended) - Number(a.recommended));
  }

  state.filteredClasses = results;
  renderClassCards();
}

function renderClassCards() {
  if (!state.filteredClasses.length) {
    els.classGrid.innerHTML = '<div class="empty-state">조건에 맞는 원예 클래스가 없습니다.</div>';
    return;
  }

  els.classGrid.innerHTML = '';
  state.filteredClasses.forEach((classItem) => {
    const card = document.createElement('article');
    card.className = `class-card ${classItem.id === state.selectedClassId ? 'is-selected' : ''}`;
    card.innerHTML = `
      <div class="class-image">
        <img src="${classItem.image}" alt="${classItem.title} 이미지" />
        ${classItem.recommended ? '<span class="class-badge">추천 클래스</span>' : ''}
        <button class="favorite-button" type="button" aria-label="${classItem.title} 관심 클래스 저장">${state.favorites.has(classItem.id) ? '♥' : '♡'}</button>
      </div>
      <div class="class-content">
        <h3 class="class-title">${classItem.title}</h3>
        <div class="meta-row">
          <span class="meta-chip">${classItem.difficulty}</span>
          <span class="meta-chip">${classItem.plantType}</span>
          <span class="meta-chip">${classItem.duration}분</span>
          <span class="meta-chip">${classItem.kitIncluded ? '키트 포함' : '키트 별도'}</span>
        </div>
        <div class="class-bottom">
          <span class="price">${formatPrice(classItem.price)}</span>
          <div class="card-actions">
            <button class="button button-subtle detail-button" type="button">상세</button>
            <button class="button button-primary reserve-button" type="button">예약하기</button>
          </div>
        </div>
      </div>
    `;

    card.querySelector('.detail-button').addEventListener('click', () => openModal(classItem.id));
    card.querySelector('.favorite-button').addEventListener('click', () => toggleFavorite(classItem.id));

    const reserveButton = card.querySelector('.reserve-button');
    // INTENTIONAL GUI BUG: site076-bug03
    // CSV Error: 예약 버튼 무반응
    // Type: gardening-reserve-button-no-response
    // Description: 특정 원예 클래스 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
    if (classItem.id === BUGGY_RESERVE_CLASS_ID) {
      reserveButton.dataset.bugId = 'site076-bug03';
    } else {
      reserveButton.addEventListener('click', () => selectClass(classItem.id));
    }

    els.classGrid.appendChild(card);
  });
}

function toggleFavorite(classId) {
  if (state.favorites.has(classId)) {
    state.favorites.delete(classId);
  } else {
    state.favorites.add(classId);
  }
  renderClassCards();
}

function selectClass(classId) {
  state.selectedClassId = classId;
  const selectedClass = state.classes.find((classItem) => classItem.id === classId);
  state.selectedDate = selectedClass?.schedule[0]?.date || state.selectedDate;
  renderClassCards();
  renderDatePills();
  renderSchedule();
  renderSummary();
}

function renderInstructors() {
  els.instructorGrid.innerHTML = state.instructors
    .map(
      (instructor) => `
        <article class="instructor-card">
          <img src="${instructor.image}" alt="${instructor.name} 강사 프로필" />
          <div>
            <h3>${instructor.name}</h3>
            <p>${instructor.specialty}</p>
            <span>${instructor.experience}</span>
          </div>
        </article>
      `
    )
    .join('');
}

function renderDatePills() {
  const dates = collectDates();
  if (!state.selectedDate && dates.length) {
    state.selectedDate = dates[0];
  }

  els.datePills.innerHTML = dates
    .slice(0, 7)
    .map(
      (date) => `
        <button class="${date === state.selectedDate ? 'is-active' : ''}" type="button" data-date="${date}">
          ${formatDateLabel(date)}
        </button>
      `
    )
    .join('');

  els.datePills.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedDate = button.dataset.date;
      renderDatePills();
      renderSchedule();
      renderSummary();
    });
  });
}

function renderSchedule() {
  const hours = Array.from({ length: 11 }, (_, index) => index + 9);
  const daySlots = state.classes.flatMap((classItem) =>
    classItem.schedule
      .filter((slot) => slot.date === state.selectedDate)
      .map((slot) => ({ ...slot, classItem }))
  );

  els.scheduleGrid.innerHTML = hours
    .map((hour) => {
      const matchingSlots = daySlots.filter((slot) => Number(slot.time.split(':')[0]) === hour);
      const cards = matchingSlots
        .map((slot) => {
          const isLong = slot.classItem.title.length > 22;
          return `
            <button class="schedule-card ${isLong ? 'long-title' : ''}" type="button" data-class-id="${slot.classItem.id}">
              <strong>${slot.classItem.title}</strong>
              <span>${slot.time} · ${slot.room} · 잔여 ${slot.seats}석</span>
            </button>
          `;
        })
        .join('');
      return `<div class="schedule-row">${cards}</div>`;
    })
    .join('');

  els.scheduleGrid.querySelectorAll('.schedule-card').forEach((button) => {
    button.addEventListener('click', () => selectClass(button.dataset.classId));
  });
}

function renderSummary() {
  const selectedClass = state.classes.find((classItem) => classItem.id === state.selectedClassId);

  if (!selectedClass) {
    els.summaryDetails.innerHTML = '<p class="empty-state">클래스를 선택하면 예약 정보가 표시됩니다.</p>';
    return;
  }

  const selectedSlot =
    selectedClass.schedule.find((slot) => slot.date === state.selectedDate) || selectedClass.schedule[0];
  const instructor = getInstructor(selectedClass.instructorId);
  const total = selectedClass.price * state.seats;

  // INTENTIONAL GUI BUG: site076-bug01
  // CSV Error: 키트 포함 상태 불일치
  // Type: kit-included-summary-mismatch
  // Description: 클래스 카드와 예약 요약이 서로 다른 kitIncluded 표시 로직을 사용해 키트 포함 여부가 불일치함.
  const summaryKitLabel = selectedClass.kitIncluded ? '키트 미포함' : '키트 포함';

  els.summaryDetails.innerHTML = `
    <div class="summary-class">
      <strong>${selectedClass.title}</strong>
      <span>${selectedClass.difficulty} · ${selectedClass.plantType} · ${selectedClass.duration}분</span>
    </div>
    <div class="summary-row">
      <span>일정</span>
      <strong>${formatDateLabel(selectedSlot.date)} ${selectedSlot.time}</strong>
    </div>
    <div class="summary-row">
      <span>강사</span>
      <strong>${instructor ? instructor.name : '배정 예정'}</strong>
    </div>
    <div class="summary-row" data-bug-id="site076-bug01">
      <span>키트</span>
      <strong>${summaryKitLabel}</strong>
    </div>
    <div class="summary-row">
      <span>장소</span>
      <strong>${selectedSlot.room}</strong>
    </div>
    <div class="summary-row">
      <span>예상 결제 금액</span>
      <strong>${formatPrice(total)}</strong>
    </div>
  `;

  els.seatCount.textContent = state.seats;
}

function openModal(classId) {
  const classItem = state.classes.find((item) => item.id === classId);
  const instructor = getInstructor(classItem.instructorId);
  if (!classItem) {
    return;
  }

  els.modalContent.innerHTML = `
    <div class="modal-hero">
      <img src="${classItem.image}" alt="${classItem.title} 상세 이미지" />
    </div>
    <div class="modal-copy">
      <p class="eyebrow">class detail</p>
      <h2 id="modalTitle">${classItem.title}</h2>
      <p>${classItem.description}</p>
      <div class="modal-meta">
        <span><strong>${classItem.difficulty}</strong>난이도</span>
        <span><strong>${classItem.plantType}</strong>식물 종류</span>
        <span><strong>${classItem.duration}분</strong>수업 시간</span>
        <span><strong>${instructor ? instructor.name : '배정 예정'}</strong>담당 강사</span>
      </div>
    </div>
  `;
  els.modalBackdrop.hidden = false;
  els.modalClose.focus();
}

function closeModal() {
  els.modalBackdrop.hidden = true;
}

function bindEvents() {
  els.difficultyFilter.addEventListener('change', applyFilters);
  els.plantFilter.addEventListener('change', applyFilters);
  els.sortSelect.addEventListener('change', applyFilters);
  els.searchInput.addEventListener('input', applyFilters);
  els.retryLoad.addEventListener('click', loadData);

  els.resetFilters.addEventListener('click', () => {
    els.difficultyFilter.value = 'all';
    els.plantFilter.value = 'all';
    els.sortSelect.value = 'recommended';
    els.searchInput.value = '';
    applyFilters();
  });

  els.summaryToggle.addEventListener('click', () => {
    const isCollapsed = els.summaryPanel.classList.toggle('is-collapsed');
    els.summaryToggle.textContent = isCollapsed ? '선택한 클래스 요약 펼치기' : '선택한 클래스 요약 접기';
    els.summaryToggle.setAttribute('aria-expanded', String(!isCollapsed));
  });

  els.seatMinus.addEventListener('click', () => {
    state.seats = Math.max(1, state.seats - 1);
    renderSummary();
  });

  els.seatPlus.addEventListener('click', () => {
    state.seats = Math.min(6, state.seats + 1);
    renderSummary();
  });

  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  els.modalClose.addEventListener('click', closeModal);
  els.modalBackdrop.addEventListener('click', (event) => {
    if (event.target === els.modalBackdrop) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.modalBackdrop.hidden) {
      closeModal();
    }
  });

  document.querySelectorAll('.js-coming-soon').forEach((button) => {
    button.addEventListener('click', () => {
      alert('준비중입니다.');
    });
  });
}

bindEvents();
loadData();
