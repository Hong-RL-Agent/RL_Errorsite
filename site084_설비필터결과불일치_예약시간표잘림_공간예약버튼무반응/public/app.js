const BUGGY_BOOKING_KITCHEN_ID = "kitchen-olive-hall";

const state = {
  kitchens: [],
  equipment: [],
  activeEquipmentFilter: "all",
  activeLocationFilter: "all",
  activeTimeFilter: "all",
  selectedKitchenId: null,
  selectedTime: null,
  reviews: [
    {
      name: "밀키트 창업자",
      role: "founder",
      kitchen: "노마드 밀프렙 스테이션",
      rating: 5,
      date: "2026-05-01",
      text: "진공 포장기와 소분 테이블 동선이 좋아 첫 테스트 생산을 빠르게 끝냈습니다."
    },
    {
      name: "베이커리 팀",
      role: "maker",
      kitchen: "선라이즈 베이커리 키친",
      rating: 5,
      date: "2026-04-24",
      text: "발효기와 냉각 랙이 충분해서 디저트 샘플링 준비가 편했습니다."
    },
    {
      name: "콘텐츠 셰프",
      role: "creator",
      kitchen: "마켓랩 쿠킹 스튜디오",
      rating: 4,
      date: "2026-05-03",
      text: "촬영 조명과 조리대 높이가 안정적이라 레시피 촬영에 잘 맞았습니다."
    },
    {
      name: "팝업 운영자",
      role: "founder",
      kitchen: "올리브홀 프로덕션 키친",
      rating: 5,
      date: "2026-04-28",
      text: "자연광과 패키징 테이블 덕분에 메뉴 테스트와 촬영을 같은 날 처리했습니다."
    },
    {
      name: "지역 푸드 브랜드",
      role: "founder",
      kitchen: "오렌지베이 푸드 인큐베이터",
      rating: 4,
      date: "2026-04-18",
      text: "요금이 합리적이고 냉장 설비가 넉넉해서 초기 운영비 부담이 줄었습니다."
    },
    {
      name: "소스 개발팀",
      role: "maker",
      kitchen: "가든팝 테스트 키친",
      rating: 4,
      date: "2026-04-12",
      text: "소스 테스트에는 충분했지만 인기 시간대는 빨리 마감되는 편입니다."
    }
  ]
};

const elements = {
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  emptyState: document.getElementById("emptyState"),
  kitchenGrid: document.getElementById("kitchenGrid"),
  resultCount: document.getElementById("resultCount"),
  filterSummary: document.getElementById("filterSummary"),
  equipmentFilters: document.getElementById("equipmentFilters"),
  locationFilter: document.getElementById("locationFilter"),
  timeFilterGrid: document.getElementById("timeFilterGrid"),
  scheduleList: document.getElementById("scheduleList"),
  equipmentGuide: document.getElementById("equipmentGuide"),
  bookingPanel: document.getElementById("bookingPanel"),
  toggleBookingButton: document.getElementById("toggleBookingButton"),
  summaryKitchen: document.getElementById("summaryKitchen"),
  summaryTime: document.getElementById("summaryTime"),
  summaryPrice: document.getElementById("summaryPrice"),
  summaryTotal: document.getElementById("summaryTotal"),
  kitchenModal: document.getElementById("kitchenModal"),
  modalContent: document.getElementById("modalContent"),
  modalCloseButton: document.getElementById("modalCloseButton"),
  reviewSort: document.getElementById("reviewSort"),
  reviewGrid: document.getElementById("reviewGrid")
};

const formatPrice = (value) => `${Number(value).toLocaleString("ko-KR")}원`;

function setLoading(isLoading) {
  elements.loadingState.classList.toggle("hidden", !isLoading);
}

function setError(isError) {
  elements.errorState.classList.toggle("hidden", !isError);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} request failed`);
  }
  return response.json();
}

async function loadBookingData() {
  setLoading(true);
  setError(false);
  elements.kitchenGrid.innerHTML = "";

  try {
    const [kitchenData, equipmentData] = await Promise.all([
      fetchJson("/api/kitchens"),
      fetchJson("/api/equipment")
    ]);

    state.kitchens = kitchenData.kitchens;
    state.equipment = equipmentData.equipment;
    renderEquipmentFilters();
    renderEquipmentGuide();
    renderKitchens();
    renderSchedule();
    renderReviews();
  } catch (error) {
    setError(true);
  } finally {
    setLoading(false);
  }
}

function renderEquipmentFilters() {
  const buttons = [
    `<button type="button" class="active" data-equipment-filter="all">전체 설비</button>`,
    ...state.equipment.map((item) => `<button type="button" data-equipment-filter="${item.id}">${item.name}</button>`)
  ];

  elements.equipmentFilters.innerHTML = buttons.join("");
  elements.equipmentFilters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeEquipmentFilter = button.dataset.equipmentFilter;
      elements.equipmentFilters.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderKitchens();
      renderSchedule();
    });
  });
}

function filterKitchens() {
  return state.kitchens.filter((kitchen) => {
    const matchesLocation =
      state.activeLocationFilter === "all" || kitchen.location === state.activeLocationFilter;
    const matchesTime = doesKitchenMatchTime(kitchen, state.activeTimeFilter);
    let matchesEquipment = true;

    if (state.activeEquipmentFilter !== "all") {
      const selectedEquipment = state.equipment.find((item) => item.id === state.activeEquipmentFilter);
      // INTENTIONAL GUI BUG: site084-bug01
      // CSV Error: 설비 필터 결과 불일치
      // Type: equipment-filter-mismatch
      // Description: 설비 필터 key 비교가 잘못되어 선택한 설비가 없는 공간도 결과에 포함됨.
      matchesEquipment =
        kitchen.equipment.includes(state.activeEquipmentFilter) ||
        kitchen.equipmentCategories.includes(selectedEquipment.category);
    }

    return matchesLocation && matchesTime && matchesEquipment;
  });
}

function doesKitchenMatchTime(kitchen, timeFilter) {
  if (timeFilter === "all") return true;
  return kitchen.availableSlots.some((slot) => {
    const hour = Number(slot.split(":")[0]);
    if (timeFilter === "morning") return hour < 12;
    if (timeFilter === "afternoon") return hour >= 12 && hour < 18;
    return hour >= 18;
  });
}

function renderKitchens() {
  const kitchens = filterKitchens();
  elements.emptyState.classList.toggle("hidden", kitchens.length !== 0);
  elements.resultCount.textContent = `${kitchens.length}개 공간`;
  elements.filterSummary.textContent = buildFilterSummary();
  elements.kitchenGrid.innerHTML = kitchens.map(createKitchenCardHtml).join("");

  kitchens.forEach((kitchen) => {
    const detailButton = document.querySelector(`[data-detail-id="${kitchen.id}"]`);
    detailButton.addEventListener("click", () => openKitchenModal(kitchen.id));

    const bookingButton = document.querySelector(`[data-book-id="${kitchen.id}"]`);
    if (!kitchen.available) {
      bookingButton.addEventListener("click", () => alert("준비중입니다."));
      return;
    }

    // INTENTIONAL GUI BUG: site084-bug03
    // CSV Error: 공간 예약 버튼 무반응
    // Type: kitchen-book-button-no-response
    // Description: 특정 공유 주방 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
    if (kitchen.id === BUGGY_BOOKING_KITCHEN_ID) {
      return;
    }

    bookingButton.addEventListener("click", () => selectKitchenForBooking(kitchen.id));
  });
}

function createKitchenCardHtml(kitchen) {
  const statusText = kitchen.available ? "예약 가능" : "오늘 마감";
  const statusClass = kitchen.available ? "badge" : "badge closed";
  const bugAttribute = kitchen.id === BUGGY_BOOKING_KITCHEN_ID ? ' data-bug-id="site084-bug03"' : "";

  return `
    <article class="kitchen-card">
      <img src="${kitchen.image}" alt="${kitchen.name}" />
      <div class="kitchen-body">
        <div class="kitchen-meta">
          <span>${kitchen.location}</span>
          <span class="${statusClass}">${statusText}</span>
        </div>
        <h3>${kitchen.name}</h3>
        <div class="equipment-tags">
          ${kitchen.equipment.slice(0, 4).map((item) => `<span>${item}</span>`).join("")}
        </div>
        <div class="price-line">
          <strong>${formatPrice(kitchen.pricePerHour)} / h</strong>
          <span>${kitchen.capacity}명 수용</span>
        </div>
        <div class="kitchen-meta">
          <span>평점 ${kitchen.rating}</span>
          <span>후기 ${kitchen.reviewCount}개</span>
        </div>
        <div class="card-actions">
          <button class="outline-button" type="button" data-detail-id="${kitchen.id}">상세 보기</button>
          <button class="solid-button" type="button" data-book-id="${kitchen.id}"${bugAttribute}>예약하기</button>
        </div>
      </div>
    </article>
  `;
}

function buildFilterSummary() {
  const parts = [];
  const equipmentLabel = state.equipment.find((item) => item.id === state.activeEquipmentFilter)?.name;
  if (equipmentLabel) parts.push(equipmentLabel);
  if (state.activeLocationFilter !== "all") parts.push(state.activeLocationFilter);
  if (state.activeTimeFilter !== "all") {
    const timeLabels = { morning: "오전", afternoon: "오후", evening: "저녁" };
    parts.push(timeLabels[state.activeTimeFilter]);
  }
  return parts.length ? parts.join(" · ") : "전체 조건";
}

function renderSchedule() {
  const kitchens = filterKitchens().filter((kitchen) => kitchen.available);
  const slots = kitchens.flatMap((kitchen) =>
    kitchen.availableSlots.map((time) => ({
      kitchenId: kitchen.id,
      kitchenName: kitchen.name,
      time,
      pricePerHour: kitchen.pricePerHour
    }))
  );

  elements.scheduleList.innerHTML = slots.length
    ? slots.map(createSlotHtml).join("")
    : `<div class="state-panel">선택 조건에 예약 가능한 시간대가 없습니다.</div>`;

  slots.forEach((slot) => {
    const button = document.querySelector(`[data-slot-id="${slot.kitchenId}-${slot.time.replace(":", "")}"]`);
    button.addEventListener("click", () => selectTimeSlot(slot.kitchenId, slot.time));
  });
}

function createSlotHtml(slot) {
  const isActive = state.selectedKitchenId === slot.kitchenId && state.selectedTime === slot.time;
  return `
    <button class="slot-button ${isActive ? "active" : ""}" type="button" data-slot-id="${slot.kitchenId}-${slot.time.replace(":", "")}">
      <div class="slot-meta">
        <strong>${slot.time}</strong>
        <span>${formatPrice(slot.pricePerHour)} / h</span>
      </div>
      <span>${slot.kitchenName}</span>
    </button>
  `;
}

function selectKitchenForBooking(kitchenId) {
  const kitchen = getKitchen(kitchenId);
  if (!kitchen) return;
  state.selectedKitchenId = kitchenId;
  if (!state.selectedTime) {
    state.selectedTime = kitchen.availableSlots[0] || null;
  }
  renderSchedule();
  renderBookingSummary();
}

function selectTimeSlot(kitchenId, time) {
  state.selectedKitchenId = kitchenId;
  state.selectedTime = time;
  renderSchedule();
  renderBookingSummary();
}

function renderBookingSummary() {
  const kitchen = getKitchen(state.selectedKitchenId);
  if (!kitchen) {
    elements.summaryKitchen.textContent = "선택 전";
    elements.summaryTime.textContent = "선택 전";
    elements.summaryPrice.textContent = "0원";
    elements.summaryTotal.textContent = "0원";
    return;
  }

  elements.summaryKitchen.textContent = kitchen.name;
  elements.summaryTime.textContent = state.selectedTime || "선택 전";
  elements.summaryPrice.textContent = formatPrice(kitchen.pricePerHour);
  elements.summaryTotal.textContent = state.selectedTime ? formatPrice(kitchen.pricePerHour) : "0원";
}

function getKitchen(kitchenId) {
  return state.kitchens.find((kitchen) => kitchen.id === kitchenId);
}

function openKitchenModal(kitchenId) {
  const kitchen = getKitchen(kitchenId);
  if (!kitchen) return;

  elements.modalContent.innerHTML = `
    <article class="modal-kitchen">
      <img src="${kitchen.image}" alt="${kitchen.name}" />
      <div>
        <p class="section-kicker">${kitchen.location}</p>
        <h2 id="modalTitle">${kitchen.name}</h2>
        <p>${kitchen.description}</p>
        <p><strong>설비</strong> ${kitchen.equipment.join(", ")}</p>
        <p><strong>시간당 가격</strong> ${formatPrice(kitchen.pricePerHour)}</p>
        <p><strong>수용 인원</strong> ${kitchen.capacity}명</p>
        <p><strong>예약 가능 시간</strong> ${kitchen.availableSlots.length ? kitchen.availableSlots.join(", ") : "오늘 마감"}</p>
        <button class="solid-button" type="button" id="modalBookButton">예약 요약에 담기</button>
      </div>
    </article>
  `;

  document.getElementById("modalBookButton").addEventListener("click", () => {
    if (kitchen.available) {
      selectKitchenForBooking(kitchen.id);
      closeKitchenModal();
    } else {
      alert("준비중입니다.");
    }
  });

  elements.kitchenModal.classList.remove("hidden");
}

function closeKitchenModal() {
  elements.kitchenModal.classList.add("hidden");
}

function renderEquipmentGuide() {
  elements.equipmentGuide.innerHTML = state.equipment
    .map(
      (item) => `
        <article>
          <span class="badge">${item.category}</span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderReviews() {
  const sortedReviews = [...state.reviews].sort((a, b) => {
    if (elements.reviewSort.value === "rating") return b.rating - a.rating || b.date.localeCompare(a.date);
    if (elements.reviewSort.value === "founder") return Number(b.role === "founder") - Number(a.role === "founder") || b.rating - a.rating;
    return b.date.localeCompare(a.date);
  });

  elements.reviewGrid.innerHTML = sortedReviews
    .map(
      (review) => `
        <article>
          <div class="review-top">
            <strong>${review.name}</strong>
            <span class="badge">평점 ${review.rating}</span>
          </div>
          <span>${review.kitchen}</span>
          <p>${review.text}</p>
        </article>
      `
    )
    .join("");
}

function resetFilters() {
  state.activeEquipmentFilter = "all";
  state.activeLocationFilter = "all";
  state.activeTimeFilter = "all";

  elements.locationFilter.value = "all";
  elements.equipmentFilters.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.equipmentFilter === "all");
  });
  elements.timeFilterGrid.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.timeFilter === "all");
  });

  renderKitchens();
  renderSchedule();
}

function bindEvents() {
  document.querySelectorAll("[data-coming-soon]").forEach((button) => {
    button.addEventListener("click", () => alert("준비중입니다."));
  });

  elements.locationFilter.addEventListener("change", (event) => {
    state.activeLocationFilter = event.target.value;
    renderKitchens();
    renderSchedule();
  });

  elements.timeFilterGrid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTimeFilter = button.dataset.timeFilter;
      elements.timeFilterGrid.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderKitchens();
      renderSchedule();
    });
  });

  document.getElementById("resetFiltersButton").addEventListener("click", resetFilters);
  document.getElementById("retryButton").addEventListener("click", loadBookingData);

  elements.toggleBookingButton.addEventListener("click", () => {
    const isCollapsed = elements.bookingPanel.classList.toggle("collapsed");
    elements.toggleBookingButton.textContent = isCollapsed ? "+" : "−";
    elements.toggleBookingButton.setAttribute("aria-expanded", String(!isCollapsed));
    elements.toggleBookingButton.setAttribute("aria-label", isCollapsed ? "예약 요약 펼치기" : "예약 요약 접기");
  });

  document.getElementById("heroFindButton").addEventListener("click", () => {
    document.getElementById("catalogSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("navReservationButton").addEventListener("click", () => {
    elements.bookingPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.modalCloseButton.addEventListener("click", closeKitchenModal);
  elements.kitchenModal.addEventListener("click", (event) => {
    if (event.target === elements.kitchenModal) {
      closeKitchenModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeKitchenModal();
    }
  });

  elements.reviewSort.addEventListener("change", renderReviews);
}

bindEvents();
loadBookingData();
