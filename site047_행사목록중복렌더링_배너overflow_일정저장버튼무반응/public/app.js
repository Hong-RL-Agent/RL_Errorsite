const BUGGY_SAVE_EVENT_ID = "EVT-047-05";

const state = {
  events: [],
  notices: [],
  filters: {
    date: "all",
    category: "all",
    region: "all",
    query: ""
  },
  savedIds: new Set(),
  modalEventId: null,
  activeVenue: "plaza",
  activeCourse: "family"
};

const els = {};

const venueDetails = {
  plaza: {
    title: "해솔광장 메인거리",
    description: "개막 퍼레이드, 전통무대, 야외 안내소가 모이는 중심 행사장입니다."
  },
  river: {
    title: "선셋리버 잔디마당",
    description: "노을 재즈와 가족 피크닉 프로그램이 열리는 강변 휴식 권역입니다."
  },
  market: {
    title: "중앙시장 문화로",
    description: "로컬푸드 밤시장과 셰프 시연을 한 번에 즐길 수 있는 먹거리 동선입니다."
  },
  harbor: {
    title: "항구전망대",
    description: "미디어 파사드, 폐막 드론쇼, 바다 조망 포토존이 운영됩니다."
  },
  arts: {
    title: "문화예술회관",
    description: "우천 대체 공연장과 가족 체험 접수 데스크가 있는 실내 거점입니다."
  },
  studio: {
    title: "동문창작소",
    description: "청년 메이커 공방과 지역 작가 워크숍을 둘러볼 수 있습니다."
  }
};

const courseData = {
  family: [
    ["10:00", "가족 연등 만들기", "문화예술회관에서 체험 키트를 받고 실내 프로그램으로 여유 있게 시작합니다."],
    ["13:00", "강변 피크닉", "선셋리버 잔디마당으로 이동해 돗자리 쉼터와 버스킹을 즐깁니다."],
    ["16:00", "어린이 물빛 놀이터", "수변공원에서 놀이 프로그램과 셔틀 복귀 동선을 함께 확인합니다."]
  ],
  night: [
    ["17:00", "로컬푸드 밤시장", "중앙시장 문화로에서 저녁을 해결하고 다회용기 캠페인에 참여합니다."],
    ["19:30", "바다빛 미디어 파사드", "항구전망대 외벽 쇼를 관람한 뒤 포토존을 둘러봅니다."],
    ["21:00", "폐막 불꽃과 드론쇼", "항구전망대 상단 관람 구역에서 피날레를 감상합니다."]
  ],
  food: [
    ["11:30", "시장 맛집 탐방", "중앙시장 골목에서 지역 대표 메뉴를 먼저 둘러봅니다."],
    ["15:00", "셰프 시연", "쿠킹돔에서 로컬 재료 시연을 보고 시식권을 확인합니다."],
    ["20:00", "밤시장 재방문", "야간 조명 아래 먹거리 부스를 다시 돌며 공연 동선과 연결합니다."]
  ]
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  attachStaticHandlers();
  renderCourse();
  loadEvents();
  loadNotices();
}

function cacheElements() {
  els.dateFilter = document.getElementById("dateFilter");
  els.regionFilter = document.getElementById("regionFilter");
  els.categoryChips = document.getElementById("categoryChips");
  els.resetFilters = document.getElementById("resetFilters");
  els.eventGrid = document.getElementById("eventGrid");
  els.eventsStatus = document.getElementById("eventsStatus");
  els.eventsError = document.getElementById("eventsError");
  els.retryEvents = document.getElementById("retryEvents");
  els.timelineBoard = document.getElementById("timelineBoard");
  els.noticeList = document.getElementById("noticeList");
  els.noticesStatus = document.getElementById("noticesStatus");
  els.noticesError = document.getElementById("noticesError");
  els.retryNotices = document.getElementById("retryNotices");
  els.languageToggle = document.getElementById("languageToggle");
  els.languageMenu = document.getElementById("languageMenu");
  els.languageLabel = document.getElementById("languageLabel");
  els.quickSearchForm = document.getElementById("quickSearchForm");
  els.quickSearchInput = document.getElementById("quickSearchInput");
  els.favoritesToggle = document.getElementById("favoritesToggle");
  els.favoritesDrawer = document.getElementById("favoritesDrawer");
  els.closeFavorites = document.getElementById("closeFavorites");
  els.savedList = document.getElementById("savedList");
  els.savedCount = document.getElementById("savedCount");
  els.modalBackdrop = document.getElementById("modalBackdrop");
  els.modalClose = document.getElementById("modalClose");
  els.modalImage = document.getElementById("modalImage");
  els.modalCategory = document.getElementById("modalCategory");
  els.modalTitle = document.getElementById("modalTitle");
  els.modalDateTime = document.getElementById("modalDateTime");
  els.modalPlace = document.getElementById("modalPlace");
  els.modalCrowd = document.getElementById("modalCrowd");
  els.modalSaveButton = document.getElementById("modalSaveButton");
  els.venueInfo = document.getElementById("venueInfo");
  els.courseDetail = document.getElementById("courseDetail");
}

function attachStaticHandlers() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelectorAll("[data-soon]").forEach((button) => {
    button.addEventListener("click", () => {
      alert("준비중입니다.");
    });
  });

  els.dateFilter.addEventListener("change", () => {
    state.filters.date = els.dateFilter.value;
    renderAllEventViews();
  });

  els.regionFilter.addEventListener("change", () => {
    state.filters.region = els.regionFilter.value;
    renderAllEventViews();
  });

  els.resetFilters.addEventListener("click", () => {
    state.filters.date = "all";
    state.filters.category = "all";
    state.filters.region = "all";
    state.filters.query = "";
    els.dateFilter.value = "all";
    els.regionFilter.value = "all";
    els.quickSearchInput.value = "";
    updateCategoryActive();
    renderAllEventViews();
  });

  els.retryEvents.addEventListener("click", loadEvents);
  els.retryNotices.addEventListener("click", loadNotices);

  els.categoryChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) {
      return;
    }
    state.filters.category = chip.dataset.category;
    updateCategoryActive();
    renderAllEventViews();
  });

  els.quickSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.filters.query = els.quickSearchInput.value.trim().toLowerCase();
    renderAllEventViews();
    document.getElementById("events").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.languageToggle.addEventListener("click", () => {
    const nextHidden = !els.languageMenu.hidden;
    els.languageMenu.hidden = nextHidden;
    els.languageToggle.setAttribute("aria-expanded", String(!nextHidden));
  });

  els.languageMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-language]");
    if (!option) {
      return;
    }
    els.languageLabel.textContent = option.dataset.language;
    els.languageMenu.hidden = true;
    els.languageToggle.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-picker")) {
      els.languageMenu.hidden = true;
      els.languageToggle.setAttribute("aria-expanded", "false");
    }
  });

  els.favoritesToggle.addEventListener("click", () => {
    els.favoritesDrawer.hidden = !els.favoritesDrawer.hidden;
    renderSavedList();
  });

  els.closeFavorites.addEventListener("click", () => {
    els.favoritesDrawer.hidden = true;
  });

  els.savedList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-saved]");
    if (!removeButton) {
      return;
    }
    state.savedIds.delete(removeButton.dataset.removeSaved);
    renderAllEventViews();
    renderSavedList();
  });

  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.addEventListener("click", () => {
      state.activeVenue = pin.dataset.venue;
      updateVenueInfo();
    });
  });

  document.querySelectorAll(".course-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeCourse = tab.dataset.course;
      renderCourse();
    });
  });

  els.modalClose.addEventListener("click", closeModal);
  els.modalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.modalBackdrop.hidden) {
      closeModal();
    }
  });

  els.modalSaveButton.addEventListener("click", () => {
    if (state.modalEventId) {
      toggleSaved(state.modalEventId);
      updateModalSaveButton();
    }
  });
}

async function loadEvents() {
  els.eventsStatus.textContent = "행사 정보를 불러오는 중입니다.";
  els.eventsError.hidden = true;

  try {
    const response = await fetch("/api/events");
    if (!response.ok) {
      throw new Error(`Events API returned ${response.status}`);
    }
    const payload = await response.json();
    state.events = payload.events;
    renderFilters();
    renderAllEventViews();
  } catch (error) {
    els.eventsStatus.textContent = "";
    els.eventsError.hidden = false;
  }
}

async function loadNotices() {
  els.noticesStatus.textContent = "공지사항을 불러오는 중입니다.";
  els.noticesError.hidden = true;

  try {
    const response = await fetch("/api/notices");
    if (!response.ok) {
      throw new Error(`Notices API returned ${response.status}`);
    }
    const payload = await response.json();
    state.notices = payload.notices;
    renderNotices();
  } catch (error) {
    els.noticesStatus.textContent = "";
    els.noticesError.hidden = false;
  }
}

function renderFilters() {
  const dates = [...new Set(state.events.map((event) => event.date))].sort();
  els.dateFilter.innerHTML = '<option value="all">전체 날짜</option>';
  dates.forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = formatDate(date);
    els.dateFilter.appendChild(option);
  });

  const categories = [...new Set(state.events.map((event) => event.category))].sort();
  els.categoryChips.innerHTML = '<button class="chip active" type="button" data-category="all">전체</button>';
  categories.forEach((category) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.dataset.category = category;
    chip.textContent = category;
    els.categoryChips.appendChild(chip);
  });
}

function renderAllEventViews() {
  renderEvents();
  renderTimeline();
  updateSavedCount();
}

function getFilteredEvents() {
  return state.events.filter((event) => {
    const matchesDate = state.filters.date === "all" || event.date === state.filters.date;
    const matchesCategory = state.filters.category === "all" || event.category === state.filters.category;
    const matchesRegion = state.filters.region === "all" || event.region === state.filters.region;
    const queryTarget = `${event.name} ${event.place} ${event.category} ${event.crowdLevel}`.toLowerCase();
    const matchesQuery = !state.filters.query || queryTarget.includes(state.filters.query);
    return matchesDate && matchesCategory && matchesRegion && matchesQuery;
  });
}

function renderEvents() {
  const filteredEvents = getFilteredEvents();

  // INTENTIONAL GUI BUG: site047-bug01
  // CSV Error: 행사 목록 중복 렌더링
  // Type: duplicate-event-list-render
  // Description: 특정 날짜 필터 적용 시 기존 행사 DOM을 비우지 않고 새 카드를 append해 목록이 중복됨.
  const shouldSkipClearForBug = state.filters.date === "2026-06-14";
  if (!shouldSkipClearForBug) {
    els.eventGrid.innerHTML = "";
  }

  if (filteredEvents.length === 0 && !shouldSkipClearForBug) {
    els.eventGrid.innerHTML = '<div class="empty-state">조건에 맞는 행사가 없습니다. 필터를 조정해 주세요.</div>';
  } else {
    filteredEvents.forEach((event) => {
      els.eventGrid.appendChild(createEventCard(event));
    });
  }

  els.eventsStatus.textContent = `${filteredEvents.length}개 행사 표시 중 · API 데이터 정상 로드`;
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";
  card.dataset.eventId = event.id;
  card.innerHTML = `
    <img src="${event.image}" alt="${event.name} 대표 이미지" />
    <div class="event-card-body">
      <div class="card-topline">
        <span class="category-badge">${event.category}</span>
        <span class="crowd-badge ${isCrowdHot(event.crowdLevel) ? "hot" : ""}">${event.crowdLevel}</span>
      </div>
      <h3>${event.name}</h3>
      <div class="event-meta">
        <span>${formatDate(event.date)} · ${event.time}</span>
        <span>${event.place}</span>
      </div>
      <div class="event-card-actions">
        <button class="details-button" type="button">상세 보기</button>
        <button class="save-button ${state.savedIds.has(event.id) ? "is-saved" : ""}" type="button">
          ${state.savedIds.has(event.id) ? "저장됨" : "일정 저장"}
        </button>
      </div>
    </div>
  `;

  card.querySelector(".details-button").addEventListener("click", () => openModal(event.id));

  const saveButton = card.querySelector(".save-button");
  if (event.id === BUGGY_SAVE_EVENT_ID) {
    // INTENTIONAL GUI BUG: site047-bug03
    // CSV Error: 일정 저장 버튼 무반응
    // Type: save-schedule-button-no-response
    // Description: 특정 행사 일정 저장 버튼에 click listener를 연결하지 않아 클릭해도 저장 상태가 변하지 않음.
    saveButton.setAttribute("data-bug-id", "site047-bug03");
  } else {
    saveButton.addEventListener("click", () => toggleSaved(event.id));
  }

  return card;
}

function renderTimeline() {
  const byDate = state.events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  els.timelineBoard.innerHTML = "";

  Object.keys(byDate)
    .sort()
    .forEach((date) => {
      const day = document.createElement("article");
      day.className = "timeline-day";
      day.innerHTML = `<h3>${formatDate(date)}</h3>`;
      byDate[date]
        .sort((a, b) => a.time.localeCompare(b.time))
        .forEach((event) => {
          const item = document.createElement("button");
          item.className = "timeline-item";
          item.type = "button";
          item.innerHTML = `<strong>${event.time}</strong><span>${event.name}</span>`;
          item.addEventListener("click", () => openModal(event.id));
          day.appendChild(item);
        });
      els.timelineBoard.appendChild(day);
    });
}

function renderNotices() {
  els.noticesStatus.textContent = `${state.notices.length}개 공지사항 표시 중`;
  els.noticeList.innerHTML = "";

  state.notices.forEach((notice, index) => {
    const item = document.createElement("article");
    item.className = "notice-item";
    const contentId = `notice-content-${notice.id}`;
    item.innerHTML = `
      <button class="notice-trigger" type="button" aria-expanded="${index === 0}" aria-controls="${contentId}">
        <strong>${notice.title}</strong>
        <span>${notice.createdAt}</span>
      </button>
      <div class="notice-content" id="${contentId}" ${index === 0 ? "" : "hidden"}>${notice.content}</div>
    `;

    item.querySelector(".notice-trigger").addEventListener("click", () => {
      const trigger = item.querySelector(".notice-trigger");
      const content = item.querySelector(".notice-content");
      const shouldOpen = content.hidden;
      content.hidden = !shouldOpen;
      trigger.setAttribute("aria-expanded", String(shouldOpen));
    });

    els.noticeList.appendChild(item);
  });
}

function openModal(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) {
    return;
  }

  state.modalEventId = eventId;
  els.modalImage.src = event.image;
  els.modalImage.alt = `${event.name} 대표 이미지`;
  els.modalCategory.textContent = event.category;
  els.modalTitle.textContent = event.name;
  els.modalDateTime.textContent = `${formatDate(event.date)} · ${event.time}`;
  els.modalPlace.textContent = event.place;
  els.modalCrowd.textContent = event.crowdLevel;
  updateModalSaveButton();
  els.modalBackdrop.hidden = false;
}

function closeModal() {
  els.modalBackdrop.hidden = true;
  state.modalEventId = null;
}

function updateModalSaveButton() {
  const isSaved = state.savedIds.has(state.modalEventId);
  els.modalSaveButton.textContent = isSaved ? "저장 해제" : "일정 저장";
}

function toggleSaved(eventId) {
  if (state.savedIds.has(eventId)) {
    state.savedIds.delete(eventId);
  } else {
    state.savedIds.add(eventId);
  }

  renderAllEventViews();
  if (!els.favoritesDrawer.hidden) {
    renderSavedList();
  }
}

function renderSavedList() {
  const savedEvents = state.events.filter((event) => state.savedIds.has(event.id));
  els.savedList.innerHTML = "";

  if (savedEvents.length === 0) {
    els.savedList.innerHTML = '<div class="empty-state">아직 저장한 일정이 없습니다.</div>';
    return;
  }

  savedEvents.forEach((event) => {
    const item = document.createElement("article");
    item.className = "saved-item";
    item.innerHTML = `
      <strong>${event.name}</strong>
      <span>${formatDate(event.date)} · ${event.time}</span>
      <span>${event.place}</span>
      <button class="saved-remove" type="button" data-remove-saved="${event.id}">저장 해제</button>
    `;
    els.savedList.appendChild(item);
  });
}

function updateSavedCount() {
  els.savedCount.textContent = String(state.savedIds.size);
}

function updateVenueInfo() {
  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.classList.toggle("active", pin.dataset.venue === state.activeVenue);
  });
  const detail = venueDetails[state.activeVenue];
  els.venueInfo.innerHTML = `<strong>${detail.title}</strong><span>${detail.description}</span>`;
}

function renderCourse() {
  document.querySelectorAll(".course-tab").forEach((tab) => {
    const isActive = tab.dataset.course === state.activeCourse;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  els.courseDetail.innerHTML = "";
  courseData[state.activeCourse].forEach((step, index) => {
    const card = document.createElement("article");
    card.className = "course-step";
    card.innerHTML = `
      <span>${index + 1}</span>
      <h3>${step[0]} · ${step[1]}</h3>
      <p>${step[2]}</p>
    `;
    els.courseDetail.appendChild(card);
  });
}

function updateCategoryActive() {
  els.categoryChips.querySelectorAll("[data-category]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.category === state.filters.category);
  });
}

function isCrowdHot(crowdLevel) {
  return crowdLevel === "혼잡" || crowdLevel === "매우 혼잡";
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}
