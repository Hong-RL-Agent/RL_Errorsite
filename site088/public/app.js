const BUGGY_INQUIRY_LISTING_ID = "listing-hannam-01";

const state = {
  listings: [],
  regions: [],
  selectedListingId: null,
  selectedMapId: null,
  inquiryListingId: null,
  filters: {
    search: "",
    dealType: "all",
    maxPrice: "all"
  }
};

const elements = {
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  emptyState: document.getElementById("emptyState"),
  listingList: document.getElementById("listingList"),
  markerLayer: document.getElementById("markerLayer"),
  resultCount: document.getElementById("resultCount"),
  filterSummary: document.getElementById("filterSummary"),
  regionSearchInput: document.getElementById("regionSearchInput"),
  priceFilter: document.getElementById("priceFilter"),
  selectedListingPreview: document.getElementById("selectedListingPreview"),
  summaryTitle: document.getElementById("summaryTitle"),
  summaryRegion: document.getElementById("summaryRegion"),
  summaryAgent: document.getElementById("summaryAgent"),
  detailPanel: document.getElementById("detailPanel"),
  toggleInquiryButton: document.getElementById("toggleInquiryButton"),
  recommendedListings: document.getElementById("recommendedListings"),
  regionCards: document.getElementById("regionCards"),
  listingModal: document.getElementById("listingModal"),
  modalContent: document.getElementById("modalContent"),
  modalCloseButton: document.getElementById("modalCloseButton")
};

const formatPrice = (listing) => {
  if (listing.dealType === "월세") {
    return `보증금 ${Number(listing.deposit).toLocaleString("ko-KR")}원 / 월 ${Number(listing.price).toLocaleString("ko-KR")}원`;
  }
  return `${Number(listing.price).toLocaleString("ko-KR")}원`;
};

const formatShortPrice = (listing) => {
  if (listing.dealType === "월세") {
    return `월 ${Math.round(listing.price / 10000).toLocaleString("ko-KR")}만`;
  }
  return `${Math.round(listing.price / 100000000).toLocaleString("ko-KR")}억`;
};

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

async function loadRealEstateData() {
  setLoading(true);
  setError(false);
  elements.listingList.innerHTML = "";

  try {
    const [listingData, regionData] = await Promise.all([
      fetchJson("/api/listings"),
      fetchJson("/api/regions")
    ]);

    state.listings = listingData.listings;
    state.regions = regionData.regions;
    state.selectedListingId = state.listings[0]?.id || null;
    state.selectedMapId = state.listings[0]?.id || null;
    renderAll();
  } catch (error) {
    setError(true);
  } finally {
    setLoading(false);
  }
}

function renderAll() {
  renderListings();
  renderMapMarkers();
  renderSelectedListingPreview();
  renderInquirySummary();
  renderRecommendedListings();
  renderRegions();
}

function getFilteredListings() {
  const query = state.filters.search.trim().toLowerCase();
  return state.listings.filter((listing) => {
    const matchesSearch =
      !query ||
      `${listing.title} ${listing.region} ${listing.agent.name} ${listing.agent.office}`.toLowerCase().includes(query);
    const matchesDealType = state.filters.dealType === "all" || listing.dealType === state.filters.dealType;
    const matchesPrice = state.filters.maxPrice === "all" || listing.price <= Number(state.filters.maxPrice);
    return matchesSearch && matchesDealType && matchesPrice;
  });
}

function renderListings() {
  const listings = getFilteredListings();
  elements.emptyState.classList.toggle("hidden", listings.length !== 0);
  elements.resultCount.textContent = `${listings.length}개 매물`;
  elements.filterSummary.textContent = buildFilterSummary();
  elements.listingList.innerHTML = listings.map(createListingCardHtml).join("");

  listings.forEach((listing) => {
    const card = document.querySelector(`[data-card-id="${listing.id}"]`);
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      selectListingFromList(listing.id);
    });

    document.querySelector(`[data-detail-id="${listing.id}"]`).addEventListener("click", () => openListingModal(listing.id));

    const inquiryButton = document.querySelector(`[data-inquiry-id="${listing.id}"]`);
    // INTENTIONAL GUI BUG: site088-bug03
    // CSV Error: 상담 문의 버튼 무반응
    // Type: realestate-inquiry-button-no-response
    // Description: 특정 매물 상담 문의 버튼에 click listener를 연결하지 않아 상담 요약이 변경되지 않음.
    if (listing.id === BUGGY_INQUIRY_LISTING_ID) {
      return;
    }

    inquiryButton.addEventListener("click", () => selectInquiryListing(listing.id));
  });
}

function createListingCardHtml(listing) {
  const isActive = listing.id === state.selectedListingId;
  const bugAttribute = listing.id === BUGGY_INQUIRY_LISTING_ID ? ' data-bug-id="site088-bug03"' : "";
  return `
    <article class="listing-card ${isActive ? "active" : ""}" data-card-id="${listing.id}">
      <img src="${listing.image}" alt="${listing.title}" />
      <div class="listing-body">
        <div class="card-meta">
          <span>${listing.region}</span>
          <span class="badge">${listing.dealType}</span>
        </div>
        <h3>${listing.title}</h3>
        <div class="price-line">
          <strong>${formatShortPrice(listing)}</strong>
          <span>${listing.area}</span>
        </div>
        <div class="property-line">
          <span>방 ${listing.rooms}개</span>
          <span>${listing.floor}</span>
        </div>
        <p class="agent-line">${listing.agent.office} · ${listing.agent.name}</p>
        <div class="card-actions">
          <button class="outline-button" type="button" data-detail-id="${listing.id}">상세 보기</button>
          <button class="solid-button" type="button" data-inquiry-id="${listing.id}"${bugAttribute}>상담 문의</button>
        </div>
      </div>
    </article>
  `;
}

function buildFilterSummary() {
  const parts = [];
  if (state.filters.search.trim()) parts.push(`검색: ${state.filters.search.trim()}`);
  if (state.filters.dealType !== "all") parts.push(state.filters.dealType);
  if (state.filters.maxPrice !== "all") parts.push(`${Math.round(Number(state.filters.maxPrice) / 100000000)}억 이하`);
  return parts.length ? parts.join(" · ") : "전체 지역";
}

function renderMapMarkers() {
  const listings = getFilteredListings();
  // INTENTIONAL GUI BUG: site088-bug01
  // CSV Error: 지도 마커와 목록 불일치
  // Type: map-marker-list-mismatch
  // Description: 매물 리스트 선택 state와 지도 마커 강조 state가 동기화되지 않아 서로 다른 매물이 선택된 것처럼 보임.
  const highlightedMarkerId = state.selectedMapId || listings[0]?.id;

  elements.markerLayer.innerHTML = listings
    .map(
      (listing) => `
        <button
          class="map-marker ${listing.id === highlightedMarkerId ? "active" : ""}"
          type="button"
          style="left: ${listing.coordinates.x}%; top: ${listing.coordinates.y}%"
          data-marker-id="${listing.id}"
          aria-label="${listing.title} 지도 마커"
        >
          <strong>${listing.dealType} ${formatShortPrice(listing)}</strong>
          <span>${listing.region}</span>
        </button>
      `
    )
    .join("");

  listings.forEach((listing) => {
    document.querySelector(`[data-marker-id="${listing.id}"]`).addEventListener("click", () => selectListingFromMap(listing.id));
  });
}

function selectListingFromList(listingId) {
  state.selectedListingId = listingId;
  renderListings();
  renderMapMarkers();
  renderSelectedListingPreview();
}

function selectListingFromMap(listingId) {
  state.selectedListingId = listingId;
  state.selectedMapId = listingId;
  renderListings();
  renderMapMarkers();
  renderSelectedListingPreview();
}

function selectInquiryListing(listingId) {
  state.inquiryListingId = listingId;
  state.selectedListingId = listingId;
  renderListings();
  renderSelectedListingPreview();
  renderInquirySummary();
}

function getListing(listingId) {
  return state.listings.find((listing) => listing.id === listingId);
}

function renderSelectedListingPreview() {
  const listing = getListing(state.selectedListingId) || getFilteredListings()[0];
  if (!listing) {
    elements.selectedListingPreview.innerHTML = `<p class="state-panel">선택된 매물이 없습니다.</p>`;
    return;
  }

  elements.selectedListingPreview.innerHTML = `
    <img src="${listing.image}" alt="${listing.title}" />
    <div>
      <span class="badge">${listing.dealType}</span>
      <h3>${listing.title}</h3>
      <p>${listing.summary}</p>
      <strong>${formatPrice(listing)}</strong>
      <p>${listing.region} · ${listing.area} · 방 ${listing.rooms}개 · ${listing.floor}</p>
      <button class="outline-button full" type="button" id="previewDetailButton">상세 모달 열기</button>
    </div>
  `;

  document.getElementById("previewDetailButton").addEventListener("click", () => openListingModal(listing.id));
}

function renderInquirySummary() {
  const listing = getListing(state.inquiryListingId);
  if (!listing) {
    elements.summaryTitle.textContent = "선택 전";
    elements.summaryRegion.textContent = "선택 전";
    elements.summaryAgent.textContent = "선택 전";
    return;
  }

  elements.summaryTitle.textContent = listing.title;
  elements.summaryRegion.textContent = listing.region;
  elements.summaryAgent.textContent = `${listing.agent.office} ${listing.agent.name}`;
}

function openListingModal(listingId) {
  const listing = getListing(listingId);
  if (!listing) return;

  elements.modalContent.innerHTML = `
    <article class="modal-listing">
      <img src="${listing.image}" alt="${listing.title}" />
      <div>
        <p class="section-kicker">${listing.region}</p>
        <h2 id="modalTitle">${listing.title}</h2>
        <p>${listing.summary}</p>
        <p><strong>거래 유형</strong> ${listing.dealType}</p>
        <p><strong>가격</strong> ${formatPrice(listing)}</p>
        <p><strong>면적</strong> ${listing.area}</p>
        <p><strong>방 수</strong> ${listing.rooms}개</p>
        <p><strong>층수</strong> ${listing.floor}</p>
        <p><strong>중개사</strong> ${listing.agent.office} · ${listing.agent.name}</p>
        <button class="solid-button" type="button" id="modalInquiryButton">상담 요약에 담기</button>
      </div>
    </article>
  `;

  document.getElementById("modalInquiryButton").addEventListener("click", () => {
    selectInquiryListing(listing.id);
    closeListingModal();
  });

  elements.listingModal.classList.remove("hidden");
}

function closeListingModal() {
  elements.listingModal.classList.add("hidden");
}

function renderRecommendedListings() {
  const recommended = state.listings.slice(0, 3);
  elements.recommendedListings.innerHTML = recommended
    .map(
      (listing) => `
        <article class="mini-card">
          <img src="${listing.image}" alt="${listing.title}" />
          <div>
            <span class="badge">${listing.dealType}</span>
            <h3>${listing.title}</h3>
            <p>${listing.region} · ${formatShortPrice(listing)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderRegions() {
  elements.regionCards.innerHTML = state.regions
    .map(
      (region) => `
        <article>
          <span class="badge">${region.popular ? "인기 지역" : "관심 지역"}</span>
          <h3>${region.name}</h3>
          <p>평균가 ${Number(region.averagePrice).toLocaleString("ko-KR")}원</p>
          <p>등록 매물 ${region.listingCount}개</p>
        </article>
      `
    )
    .join("");
}

function resetFilters() {
  state.filters = { search: "", dealType: "all", maxPrice: "all" };
  state.selectedListingId = state.listings[0]?.id || null;
  state.selectedMapId = state.listings[0]?.id || null;
  elements.regionSearchInput.value = "";
  elements.priceFilter.value = "all";
  document.querySelectorAll("[data-deal-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dealFilter === "all");
  });
  renderListings();
  renderMapMarkers();
  renderSelectedListingPreview();
}

function bindEvents() {
  document.querySelectorAll("[data-coming-soon]").forEach((button) => {
    button.addEventListener("click", () => alert("준비중입니다."));
  });

  elements.regionSearchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderListings();
    renderMapMarkers();
  });

  document.querySelectorAll("[data-deal-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.dealType = button.dataset.dealFilter;
      document.querySelectorAll("[data-deal-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderListings();
      renderMapMarkers();
      renderSelectedListingPreview();
    });
  });

  elements.priceFilter.addEventListener("change", (event) => {
    state.filters.maxPrice = event.target.value;
    renderListings();
    renderMapMarkers();
    renderSelectedListingPreview();
  });

  document.getElementById("resetButton").addEventListener("click", resetFilters);
  document.getElementById("retryButton").addEventListener("click", loadRealEstateData);

  document.getElementById("mapFocusButton").addEventListener("click", () => {
    document.getElementById("mapPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("inquiryFocusButton").addEventListener("click", () => {
    elements.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.toggleInquiryButton.addEventListener("click", () => {
    const isCollapsed = elements.detailPanel.classList.toggle("collapsed");
    elements.toggleInquiryButton.textContent = isCollapsed ? "+" : "−";
    elements.toggleInquiryButton.setAttribute("aria-expanded", String(!isCollapsed));
    elements.toggleInquiryButton.setAttribute("aria-label", isCollapsed ? "상담 요약 펼치기" : "상담 요약 접기");
  });

  elements.modalCloseButton.addEventListener("click", closeListingModal);
  elements.listingModal.addEventListener("click", (event) => {
    if (event.target === elements.listingModal) {
      closeListingModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeListingModal();
    }
  });
}

bindEvents();
loadRealEstateData();
