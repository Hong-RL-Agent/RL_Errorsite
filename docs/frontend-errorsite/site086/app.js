const BUGGY_CART_INSTRUMENT_ID = "guitar-riverton-01";

const state = {
  instruments: [],
  brands: [],
  cartItems: [],
  filters: {
    type: "all",
    brand: "all",
    maxPrice: 2000000,
    stockOnly: false,
    beginnerOnly: false,
    search: "",
    sort: "recommended"
  }
};

const stockStatusLabelMap = {
  available: "재고 있음",
  lowstock: "소량 남음",
  soldout: "품절"
};

const elements = {
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  emptyState: document.getElementById("emptyState"),
  instrumentGrid: document.getElementById("instrumentGrid"),
  resultCount: document.getElementById("resultCount"),
  filterSummary: document.getElementById("filterSummary"),
  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  brandFilter: document.getElementById("brandFilter"),
  priceRange: document.getElementById("priceRange"),
  priceValue: document.getElementById("priceValue"),
  stockOnlyInput: document.getElementById("stockOnlyInput"),
  beginnerOnlyInput: document.getElementById("beginnerOnlyInput"),
  comparisonBody: document.getElementById("comparisonBody"),
  brandCards: document.getElementById("brandCards"),
  cartPanel: document.getElementById("cartPanel"),
  toggleCartButton: document.getElementById("toggleCartButton"),
  cartItemsList: document.getElementById("cartItemsList"),
  cartTotal: document.getElementById("cartTotal"),
  cartCountPill: document.getElementById("cartCountPill"),
  instrumentModal: document.getElementById("instrumentModal"),
  modalContent: document.getElementById("modalContent"),
  modalCloseButton: document.getElementById("modalCloseButton")
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

async function loadShopData() {
  setLoading(true);
  setError(false);
  elements.instrumentGrid.innerHTML = "";

  try {
    const [instrumentData, brandData] = await Promise.all([
      fetchJson("/api/instruments"),
      fetchJson("/api/brands")
    ]);

    state.instruments = instrumentData.instruments;
    state.brands = brandData.brands;
    renderBrandFilter();
    renderInstruments();
    renderComparison();
    renderBrands();
    renderCart();
  } catch (error) {
    setError(true);
  } finally {
    setLoading(false);
  }
}

function renderBrandFilter() {
  const options = state.brands.map((brand) => `<option value="${brand.name}">${brand.name}</option>`).join("");
  elements.brandFilter.innerHTML = `<option value="all">전체 브랜드</option>${options}`;
}

function getFilteredInstruments() {
  const query = state.filters.search.trim().toLowerCase();

  let filtered = state.instruments.filter((instrument) => {
    const matchesType = state.filters.type === "all" || instrument.type === state.filters.type;
    const matchesBrand = state.filters.brand === "all" || instrument.brand === state.filters.brand;
    const matchesPrice = instrument.price <= state.filters.maxPrice;
    const matchesStock = !state.filters.stockOnly || instrument.stockStatus !== "soldout";
    const matchesBeginner = !state.filters.beginnerOnly || instrument.beginnerRecommended;
    const searchableText = `${instrument.name} ${instrument.brand} ${instrument.type}`.toLowerCase();
    const matchesSearch = !query || searchableText.includes(query);

    return matchesType && matchesBrand && matchesPrice && matchesStock && matchesBeginner && matchesSearch;
  });

  filtered = [...filtered].sort((a, b) => {
    if (state.filters.sort === "priceAsc") return a.price - b.price;
    if (state.filters.sort === "priceDesc") return b.price - a.price;
    if (state.filters.sort === "ratingDesc") return b.rating - a.rating;
    return Number(b.recommended) - Number(a.recommended) || b.rating - a.rating;
  });

  return filtered;
}

function renderInstruments() {
  const instruments = getFilteredInstruments();
  elements.emptyState.classList.toggle("hidden", instruments.length !== 0);
  elements.resultCount.textContent = `${instruments.length}개 상품`;
  elements.filterSummary.textContent = buildFilterSummary();
  elements.instrumentGrid.innerHTML = instruments.map(createInstrumentCardHtml).join("");

  instruments.forEach((instrument) => {
    document.querySelectorAll(`[data-detail-id="${instrument.id}"]`).forEach((button) => {
      button.addEventListener("click", () => openInstrumentModal(instrument.id));
    });

    const cartButton = document.querySelector(`[data-cart-id="${instrument.id}"]`);
    if (instrument.stockStatus === "soldout") {
      cartButton.addEventListener("click", () => alert("준비중입니다."));
      return;
    }

    // INTENTIONAL GUI BUG: site086-bug03
    // CSV Error: 장바구니 담기 버튼 무반응
    // Type: instrument-cart-button-no-response
    // Description: 특정 악기 상품의 장바구니 버튼에 click listener를 연결하지 않아 장바구니가 변경되지 않음.
    if (instrument.id === BUGGY_CART_INSTRUMENT_ID) {
      return;
    }

    cartButton.addEventListener("click", () => addToCart(instrument.id));
  });
}

function createInstrumentCardHtml(instrument) {
  const stockLabel = stockStatusLabelMap[instrument.stockStatus];
  const stockClass = `stock ${instrument.stockStatus === "soldout" ? "soldout" : ""} ${instrument.stockStatus === "lowstock" ? "lowstock" : ""}`;
  const bugAttribute = instrument.id === BUGGY_CART_INSTRUMENT_ID ? ' data-bug-id="site086-bug03"' : "";

  return `
    <article class="instrument-card">
      <button class="image-button" type="button" data-detail-id="${instrument.id}" aria-label="${instrument.name} 상세 보기">
        <img src="${instrument.image}" alt="${instrument.name}" />
      </button>
      <div class="card-body">
        <div class="card-meta">
          <span>${instrument.brand}</span>
          <span class="badge">${instrument.recommended ? "추천" : instrument.beginnerRecommended ? "입문" : "Classic"}</span>
        </div>
        <h3>${instrument.name}</h3>
        <div class="stock-line">
          <span class="type-pill">${instrument.type}</span>
          <span class="${stockClass}">${stockLabel}</span>
        </div>
        <div class="price-rating">
          <span class="price">${formatPrice(instrument.price)}</span>
          <span class="rating">평점 ${instrument.rating}</span>
        </div>
        <div class="card-actions">
          <button class="outline-button" type="button" data-detail-id="${instrument.id}">상세 보기</button>
          <button class="solid-button" type="button" data-cart-id="${instrument.id}"${bugAttribute}>장바구니 담기</button>
        </div>
      </div>
    </article>
  `;
}

function buildFilterSummary() {
  const parts = [];
  if (state.filters.type !== "all") parts.push(state.filters.type);
  if (state.filters.brand !== "all") parts.push(state.filters.brand);
  if (state.filters.stockOnly) parts.push("재고 상품");
  if (state.filters.beginnerOnly) parts.push("입문자 추천");
  if (state.filters.search.trim()) parts.push(`검색: ${state.filters.search.trim()}`);
  return parts.length ? parts.join(" · ") : "전체 상품";
}

function renderComparison() {
  const recommended = state.instruments.filter((instrument) => instrument.recommended).slice(0, 5);
  elements.comparisonBody.innerHTML = recommended
    .map(
      (instrument) => `
        <tr>
          <td>${instrument.name}</td>
          <td>${instrument.brand}</td>
          <td>${instrument.type}</td>
          <td>${instrument.beginnerRecommended ? "입문자 및 연습용" : "스튜디오 및 공연용"}</td>
          <td>${formatPrice(instrument.price)}</td>
          <td>${stockStatusLabelMap[instrument.stockStatus]}</td>
        </tr>
      `
    )
    .join("");
}

function renderBrands() {
  elements.brandCards.innerHTML = state.brands
    .slice(0, 6)
    .map(
      (brand) => `
        <article>
          <span class="badge">${brand.signatureInstrument}</span>
          <h3>${brand.name}</h3>
          <p>${brand.description}</p>
        </article>
      `
    )
    .join("");
}

function addToCart(instrumentId) {
  const existing = state.cartItems.find((item) => item.instrumentId === instrumentId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cartItems.push({ instrumentId, quantity: 1 });
  }
  renderCart();
}

function updateCartQuantity(instrumentId, delta) {
  const existing = state.cartItems.find((item) => item.instrumentId === instrumentId);
  if (!existing) return;
  existing.quantity += delta;
  if (existing.quantity <= 0) {
    state.cartItems = state.cartItems.filter((item) => item.instrumentId !== instrumentId);
  }
  renderCart();
}

function removeCartItem(instrumentId) {
  state.cartItems = state.cartItems.filter((item) => item.instrumentId !== instrumentId);
  renderCart();
}

function getInstrument(instrumentId) {
  return state.instruments.find((instrument) => instrument.id === instrumentId);
}

function calculateCartTotal() {
  return state.cartItems.reduce((sum, item) => {
    const instrument = getInstrument(item.instrumentId);
    return instrument ? sum + instrument.price * item.quantity : sum;
  }, 0);
}

function renderCart() {
  const visibleItems = state.cartItems
    .map((item) => ({ ...item, instrument: getInstrument(item.instrumentId) }))
    .filter((item) => item.instrument);

  elements.cartItemsList.innerHTML = visibleItems.length
    ? visibleItems.map(createCartItemHtml).join("")
    : `<p class="state-panel">장바구니가 비어 있습니다.</p>`;

  visibleItems.forEach((item) => {
    document.querySelector(`[data-increase-id="${item.instrumentId}"]`).addEventListener("click", () => updateCartQuantity(item.instrumentId, 1));
    document.querySelector(`[data-decrease-id="${item.instrumentId}"]`).addEventListener("click", () => updateCartQuantity(item.instrumentId, -1));
    document.querySelector(`[data-remove-id="${item.instrumentId}"]`).addEventListener("click", () => removeCartItem(item.instrumentId));
  });

  elements.cartTotal.textContent = formatPrice(calculateCartTotal());
  elements.cartCountPill.textContent = visibleItems.reduce((sum, item) => sum + item.quantity, 0);
}

function createCartItemHtml(item) {
  return `
    <article class="cart-item">
      <strong>${item.instrument.name}</strong>
      <small>${formatPrice(item.instrument.price)} · ${item.instrument.type}</small>
      <div class="cart-controls">
        <div class="stepper" aria-label="${item.instrument.name} 수량 조절">
          <button type="button" data-decrease-id="${item.instrumentId}" aria-label="수량 감소">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-increase-id="${item.instrumentId}" aria-label="수량 증가">+</button>
        </div>
        <button class="text-button" type="button" data-remove-id="${item.instrumentId}">삭제</button>
      </div>
    </article>
  `;
}

function openInstrumentModal(instrumentId) {
  const instrument = getInstrument(instrumentId);
  if (!instrument) return;

  // INTENTIONAL GUI BUG: site086-bug01
  // CSV Error: 재고 상태 표시 불일치
  // Type: stock-status-display-mismatch
  // Description: 상세 모달의 재고 상태 label 매핑을 카드와 다르게 적용해 같은 상품의 재고 상태가 불일치함.
  const modalStockStatusLabelMap = {
    available: "품절",
    lowstock: "소량 남음",
    soldout: "재고 있음"
  };

  elements.modalContent.innerHTML = `
    <article class="modal-instrument">
      <img src="${instrument.image}" alt="${instrument.name}" />
      <div>
        <p class="section-kicker">${instrument.brand}</p>
        <h2 id="modalTitle">${instrument.name}</h2>
        <p>${instrument.description}</p>
        <p><strong>악기 종류</strong> ${instrument.type}</p>
        <p><strong>마감</strong> ${instrument.finish}</p>
        <p><strong>원산지</strong> ${instrument.origin}</p>
        <p><strong>가격</strong> ${formatPrice(instrument.price)}</p>
        <p><strong>평점</strong> ${instrument.rating}</p>
        <p><strong>재고 상태</strong> <span class="modal-stock" data-bug-id="site086-bug01">${modalStockStatusLabelMap[instrument.stockStatus]}</span></p>
        <button class="solid-button" type="button" id="modalCartButton">장바구니 담기</button>
      </div>
    </article>
  `;

  document.getElementById("modalCartButton").addEventListener("click", () => {
    if (instrument.stockStatus === "soldout") {
      alert("준비중입니다.");
      return;
    }
    addToCart(instrument.id);
    closeInstrumentModal();
  });

  elements.instrumentModal.classList.remove("hidden");
}

function closeInstrumentModal() {
  elements.instrumentModal.classList.add("hidden");
}

function resetFilters() {
  state.filters = {
    type: "all",
    brand: "all",
    maxPrice: 2000000,
    stockOnly: false,
    beginnerOnly: false,
    search: "",
    sort: "recommended"
  };

  document.querySelector('input[name="instrumentType"][value="all"]').checked = true;
  elements.brandFilter.value = "all";
  elements.priceRange.value = "2000000";
  elements.priceValue.textContent = formatPrice(2000000);
  elements.stockOnlyInput.checked = false;
  elements.beginnerOnlyInput.checked = false;
  elements.searchInput.value = "";
  elements.sortSelect.value = "recommended";
  renderInstruments();
}

function bindEvents() {
  document.querySelectorAll("[data-coming-soon]").forEach((button) => {
    button.addEventListener("click", () => alert("준비중입니다."));
  });

  document.querySelectorAll('input[name="instrumentType"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      state.filters.type = event.target.value;
      renderInstruments();
    });
  });

  elements.brandFilter.addEventListener("change", (event) => {
    state.filters.brand = event.target.value;
    renderInstruments();
  });

  elements.priceRange.addEventListener("input", (event) => {
    state.filters.maxPrice = Number(event.target.value);
    elements.priceValue.textContent = formatPrice(state.filters.maxPrice);
    renderInstruments();
  });

  elements.stockOnlyInput.addEventListener("change", (event) => {
    state.filters.stockOnly = event.target.checked;
    renderInstruments();
  });

  elements.beginnerOnlyInput.addEventListener("change", (event) => {
    state.filters.beginnerOnly = event.target.checked;
    renderInstruments();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderInstruments();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.filters.sort = event.target.value;
    renderInstruments();
  });

  document.getElementById("resetFiltersButton").addEventListener("click", resetFilters);
  document.getElementById("retryButton").addEventListener("click", loadShopData);

  elements.toggleCartButton.addEventListener("click", () => {
    const isCollapsed = elements.cartPanel.classList.toggle("collapsed");
    elements.toggleCartButton.textContent = isCollapsed ? "+" : "−";
    elements.toggleCartButton.setAttribute("aria-expanded", String(!isCollapsed));
    elements.toggleCartButton.setAttribute("aria-label", isCollapsed ? "장바구니 펼치기" : "장바구니 접기");
  });

  document.getElementById("headerCartButton").addEventListener("click", () => {
    elements.cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("heroRecommendButton").addEventListener("click", () => {
    state.filters.sort = "recommended";
    elements.sortSelect.value = "recommended";
    document.getElementById("shoppingLayout").scrollIntoView({ behavior: "smooth", block: "start" });
    renderInstruments();
  });

  document.querySelectorAll("#careAccordion article button").forEach((button) => {
    button.addEventListener("click", () => {
      const content = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      content.classList.toggle("hidden", isOpen);
    });
  });

  elements.modalCloseButton.addEventListener("click", closeInstrumentModal);
  elements.instrumentModal.addEventListener("click", (event) => {
    if (event.target === elements.instrumentModal) {
      closeInstrumentModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeInstrumentModal();
    }
  });
}

bindEvents();
loadShopData();
