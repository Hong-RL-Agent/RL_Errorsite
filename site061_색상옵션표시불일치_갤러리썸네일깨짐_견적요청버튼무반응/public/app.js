const BUGGY_QUOTE_FURNITURE_ID = "FR-061-02";

const state = {
  furniture: [],
  showrooms: [],
  filters: {
    search: "",
    space: "all",
    material: "all",
    color: "all",
    price: "all",
    deliveryOnly: false
  },
  selectedColors: {},
  quoteIds: new Set(),
  activeFurnitureId: null
};

const els = {};

// INTENTIONAL GUI BUG: site061-bug01
// CSV Error: 색상 옵션 표시 불일치
// Type: color-option-display-mismatch
// Description: 색상 value와 표시 label 매핑이 잘못되어 선택한 색상과 다른 라벨이 표시됨.
const colorLabelMap = {
  walnut: "오크",
  oak: "월넛",
  sand: "샌드",
  ivory: "아이보리",
  charcoal: "차콜"
};

const styleGuides = [
  {
    title: "월넛 모던 거실",
    body: "월넛 원목 소파와 낮은 커피 테이블을 중심으로 차콜 패브릭을 더하면 안정적인 고급 거실 분위기가 완성됩니다."
  },
  {
    title: "샌드 내추럴 다이닝",
    body: "오크 테이블과 라탄 스툴을 매치하고 크림 러그를 더하면 밝고 부드러운 식사 공간을 만들 수 있습니다."
  },
  {
    title: "차콜 시티 서재",
    body: "차콜 책장과 월넛 데스크를 조합하면 작은 공간도 단정한 작업실처럼 보입니다."
  }
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  attachHandlers();
  renderStyleGuides();
  renderQuoteSummary();
  loadFurniture();
  loadShowrooms();
}

function cacheElements() {
  els.quoteCount = document.getElementById("quoteCount");
  els.quoteJump = document.getElementById("quoteJump");
  els.searchInput = document.getElementById("searchInput");
  els.spaceFilter = document.getElementById("spaceFilter");
  els.materialFilter = document.getElementById("materialFilter");
  els.colorFilter = document.getElementById("colorFilter");
  els.priceFilter = document.getElementById("priceFilter");
  els.deliveryOnly = document.getElementById("deliveryOnly");
  els.resetFilters = document.getElementById("resetFilters");
  els.furnitureStatus = document.getElementById("furnitureStatus");
  els.furnitureError = document.getElementById("furnitureError");
  els.retryFurniture = document.getElementById("retryFurniture");
  els.productGrid = document.getElementById("productGrid");
  els.quoteCard = document.getElementById("quoteCard");
  els.toggleQuote = document.getElementById("toggleQuote");
  els.quoteBody = document.getElementById("quoteBody");
  els.quoteItems = document.getElementById("quoteItems");
  els.quoteItemCount = document.getElementById("quoteItemCount");
  els.quoteTotal = document.getElementById("quoteTotal");
  els.submitQuote = document.getElementById("submitQuote");
  els.clearQuote = document.getElementById("clearQuote");
  els.styleList = document.getElementById("styleList");
  els.showroomsStatus = document.getElementById("showroomsStatus");
  els.showroomsError = document.getElementById("showroomsError");
  els.retryShowrooms = document.getElementById("retryShowrooms");
  els.showroomGrid = document.getElementById("showroomGrid");
  els.productModalBackdrop = document.getElementById("productModalBackdrop");
  els.modalClose = document.getElementById("modalClose");
  els.modalImage = document.getElementById("modalImage");
  els.thumbnailGallery = document.getElementById("thumbnailGallery");
  els.modalSpace = document.getElementById("modalSpace");
  els.modalTitle = document.getElementById("modalTitle");
  els.modalMeta = document.getElementById("modalMeta");
  els.modalPrice = document.getElementById("modalPrice");
  els.modalQuoteButton = document.getElementById("modalQuoteButton");
}

function attachHandlers() {
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

  els.quoteJump.addEventListener("click", () => {
    els.quoteCard.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  els.retryFurniture.addEventListener("click", loadFurniture);
  els.retryShowrooms.addEventListener("click", loadShowrooms);

  [els.spaceFilter, els.materialFilter, els.colorFilter, els.priceFilter].forEach((select) => {
    select.addEventListener("change", syncFilters);
  });

  els.searchInput.addEventListener("input", syncFilters);
  els.deliveryOnly.addEventListener("change", syncFilters);

  els.resetFilters.addEventListener("click", () => {
    state.filters.search = "";
    state.filters.space = "all";
    state.filters.material = "all";
    state.filters.color = "all";
    state.filters.price = "all";
    state.filters.deliveryOnly = false;
    els.searchInput.value = "";
    els.spaceFilter.value = "all";
    els.materialFilter.value = "all";
    els.colorFilter.value = "all";
    els.priceFilter.value = "all";
    els.deliveryOnly.checked = false;
    renderProducts();
  });

  els.toggleQuote.addEventListener("click", () => {
    const nextCollapsed = !els.quoteCard.classList.contains("collapsed");
    els.quoteCard.classList.toggle("collapsed", nextCollapsed);
    els.toggleQuote.textContent = nextCollapsed ? "펼치기" : "접기";
    els.toggleQuote.setAttribute("aria-expanded", String(!nextCollapsed));
  });

  els.clearQuote.addEventListener("click", () => {
    state.quoteIds.clear();
    renderQuoteSummary();
    renderProducts();
  });

  els.submitQuote.addEventListener("click", () => {
    alert("준비중입니다.");
  });

  els.modalClose.addEventListener("click", closeModal);
  els.productModalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.productModalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.productModalBackdrop.hidden) {
      closeModal();
    }
  });

  els.modalQuoteButton.addEventListener("click", () => {
    if (state.activeFurnitureId) {
      addToQuote(state.activeFurnitureId);
    }
  });
}

async function loadFurniture() {
  els.furnitureStatus.textContent = "가구 상품을 불러오는 중입니다.";
  els.furnitureError.hidden = true;

  try {
    const response = await fetch("/api/furniture");
    if (!response.ok) {
      throw new Error(`Furniture API returned ${response.status}`);
    }
    const payload = await response.json();
    state.furniture = payload.furniture;
    state.furniture.forEach((item) => {
      if (!state.selectedColors[item.id]) {
        state.selectedColors[item.id] = item.colorOptions[0];
      }
    });
    renderFilterOptions();
    renderProducts();
    els.furnitureStatus.textContent = `${state.furniture.length}개 상품 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.furnitureStatus.textContent = "";
    els.furnitureError.hidden = false;
  }
}

async function loadShowrooms() {
  els.showroomsStatus.textContent = "쇼룸 정보를 불러오는 중입니다.";
  els.showroomsError.hidden = true;

  try {
    const response = await fetch("/api/showrooms");
    if (!response.ok) {
      throw new Error(`Showrooms API returned ${response.status}`);
    }
    const payload = await response.json();
    state.showrooms = payload.showrooms;
    renderShowrooms();
    els.showroomsStatus.textContent = `${state.showrooms.length}개 쇼룸 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.showroomsStatus.textContent = "";
    els.showroomsError.hidden = false;
  }
}

function renderFilterOptions() {
  const spaces = [...new Set(state.furniture.map((item) => item.space))].sort();
  const materials = [...new Set(state.furniture.map((item) => item.material))].sort();
  fillSelect(els.spaceFilter, "전체 공간", spaces);
  fillSelect(els.materialFilter, "전체 소재", materials);
}

function fillSelect(select, allLabel, values) {
  const current = select.value || "all";
  select.innerHTML = `<option value="all">${allLabel}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.value = [...values, "all"].includes(current) ? current : "all";
}

function syncFilters() {
  state.filters.search = els.searchInput.value.trim().toLowerCase();
  state.filters.space = els.spaceFilter.value;
  state.filters.material = els.materialFilter.value;
  state.filters.color = els.colorFilter.value;
  state.filters.price = els.priceFilter.value;
  state.filters.deliveryOnly = els.deliveryOnly.checked;
  renderProducts();
}

function renderProducts() {
  const items = getFilteredFurniture();
  els.productGrid.innerHTML = "";

  if (items.length === 0) {
    els.productGrid.innerHTML = '<div class="empty-state">조건에 맞는 가구가 없습니다. 필터를 조정해 주세요.</div>';
    return;
  }

  items.forEach((item) => {
    els.productGrid.appendChild(createProductCard(item));
  });
}

function createProductCard(item) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.furnitureId = item.id;
  const selectedColor = state.selectedColors[item.id];
  const selected = state.quoteIds.has(item.id);

  card.innerHTML = `
    <img src="${item.image}" alt="${item.name} 이미지" />
    <div class="product-body">
      <div class="product-topline">
        <span class="space-badge">${item.space}</span>
        <span class="delivery-badge ${item.deliveryAvailable ? "" : "unavailable"}">${item.deliveryAvailable ? "배송 가능" : "예약 배송"}</span>
      </div>
      <h3>${item.name}</h3>
      <div class="product-meta">${item.material} · 배송 예정 ${formatDate(item.deliveryDate)}</div>
      <div class="product-price">${formatCurrency(item.price)}</div>
      <div class="color-row">
        <div class="swatches">
          ${item.colorOptions
            .map(
              (color) =>
                `<button class="swatch ${selectedColor === color ? "active" : ""}" type="button" data-color="${color}" aria-label="${colorLabelMap[color]} 색상 선택"></button>`
            )
            .join("")}
        </div>
        <span class="color-label" data-bug-id="site061-bug01">선택 색상: ${colorLabelMap[selectedColor]}</span>
      </div>
      <div class="product-actions">
        <button class="details-button" type="button">상세 보기</button>
        <button class="quote-button ${selected ? "selected" : ""}" type="button">${selected ? "견적 담김" : "견적 요청"}</button>
      </div>
    </div>
  `;

  card.querySelectorAll(".swatch").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedColors[item.id] = button.dataset.color;
      renderProducts();
      renderQuoteSummary();
    });
  });

  card.querySelector(".details-button").addEventListener("click", () => openModal(item.id));

  const quoteButton = card.querySelector(".quote-button");
  if (item.id === BUGGY_QUOTE_FURNITURE_ID) {
    // INTENTIONAL GUI BUG: site061-bug03
    // CSV Error: 견적 요청 버튼 무반응
    // Type: quote-request-button-no-response
    // Description: 특정 가구 상품의 견적 요청 버튼에 click listener를 연결하지 않아 견적 요약이 변경되지 않음.
    quoteButton.setAttribute("data-bug-id", "site061-bug03");
  } else {
    quoteButton.addEventListener("click", () => addToQuote(item.id));
  }

  return card;
}

function openModal(furnitureId) {
  const item = state.furniture.find((entry) => entry.id === furnitureId);
  if (!item) {
    return;
  }

  state.activeFurnitureId = furnitureId;
  els.modalImage.src = item.image;
  els.modalImage.alt = `${item.name} 이미지`;
  els.modalSpace.textContent = item.space;
  els.modalTitle.textContent = item.name;
  els.modalMeta.textContent = `${item.material} · ${item.colorOptions.map((color) => colorLabelMap[color]).join(", ")} · 배송 예정 ${formatDate(item.deliveryDate)}`;
  els.modalPrice.textContent = formatCurrency(item.price);
  els.modalQuoteButton.textContent = state.quoteIds.has(item.id) ? "견적 담김" : "견적 요청";
  renderThumbnails(item);
  els.productModalBackdrop.hidden = false;
}

function renderThumbnails(item) {
  els.thumbnailGallery.innerHTML = "";
  const thumbnailSources = [item.image, "/assets/thumb-room.svg", "/assets/thumb-material.svg", "/assets/thumb-scale.svg"];
  thumbnailSources.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${item.name} 썸네일 ${index + 1}`;
    els.thumbnailGallery.appendChild(img);
  });
}

function closeModal() {
  els.productModalBackdrop.hidden = true;
  state.activeFurnitureId = null;
}

function addToQuote(furnitureId) {
  state.quoteIds.add(furnitureId);
  renderQuoteSummary();
  renderProducts();
}

function renderQuoteSummary() {
  const items = state.furniture.filter((item) => state.quoteIds.has(item.id));
  els.quoteItems.innerHTML = "";

  if (items.length === 0) {
    els.quoteItems.innerHTML = '<div class="empty-state">아직 담은 가구가 없습니다.</div>';
  } else {
    items.forEach((item) => {
      const row = document.createElement("article");
      row.className = "quote-item";
      const selectedColor = state.selectedColors[item.id] || item.colorOptions[0];
      row.innerHTML = `
        <strong>${item.name}</strong>
        <span>${colorLabelMap[selectedColor]} · ${formatCurrency(item.price)}</span>
      `;
      els.quoteItems.appendChild(row);
    });
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);
  els.quoteCount.textContent = String(items.length);
  els.quoteItemCount.textContent = `${items.length}개`;
  els.quoteTotal.textContent = formatCurrency(total);
}

function renderStyleGuides() {
  els.styleList.innerHTML = "";
  styleGuides.forEach((guide, index) => {
    const item = document.createElement("article");
    item.className = "style-item";
    const contentId = `style-guide-${index}`;
    item.innerHTML = `
      <button class="style-trigger" type="button" aria-expanded="${index === 0}" aria-controls="${contentId}">${guide.title}</button>
      <div class="style-content" id="${contentId}" ${index === 0 ? "" : "hidden"}>${guide.body}</div>
    `;
    item.querySelector(".style-trigger").addEventListener("click", () => {
      const trigger = item.querySelector(".style-trigger");
      const content = item.querySelector(".style-content");
      const shouldOpen = content.hidden;
      content.hidden = !shouldOpen;
      trigger.setAttribute("aria-expanded", String(shouldOpen));
    });
    els.styleList.appendChild(item);
  });
}

function renderShowrooms() {
  els.showroomGrid.innerHTML = "";
  state.showrooms.forEach((showroom) => {
    const card = document.createElement("article");
    card.className = "showroom-card";
    card.innerHTML = `
      <h3>${showroom.region}</h3>
      <p>${showroom.address}</p>
      <p>${showroom.hours}</p>
      <strong>${showroom.style}</strong>
    `;
    els.showroomGrid.appendChild(card);
  });
}

function getFilteredFurniture() {
  return state.furniture.filter((item) => {
    const queryTarget = `${item.name} ${item.space} ${item.material}`.toLowerCase();
    const matchesSearch = !state.filters.search || queryTarget.includes(state.filters.search);
    const matchesSpace = state.filters.space === "all" || item.space === state.filters.space;
    const matchesMaterial = state.filters.material === "all" || item.material === state.filters.material;
    const matchesColor = state.filters.color === "all" || item.colorOptions.includes(state.filters.color);
    const matchesDelivery = !state.filters.deliveryOnly || item.deliveryAvailable;
    const matchesPrice =
      state.filters.price === "all" ||
      (state.filters.price === "under500000" && item.price <= 500000) ||
      (state.filters.price === "500000-1000000" && item.price > 500000 && item.price <= 1000000) ||
      (state.filters.price === "over1000000" && item.price > 1000000);
    return matchesSearch && matchesSpace && matchesMaterial && matchesColor && matchesDelivery && matchesPrice;
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}
