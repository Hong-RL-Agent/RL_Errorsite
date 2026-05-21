const BUGGY_IMAGE_FLOWER_ID = "FL-055-03";
const BUGGY_CART_FLOWER_ID = "FL-055-05";

const state = {
  flowers: [],
  deliveryOptions: [],
  initialDeliveryOptionId: "standard",
  selectedDeliveryOptionId: "standard",
  selectedRegion: "서울 강남구",
  filters: {
    purpose: "all",
    price: "all"
  },
  likedIds: new Set(),
  cart: [],
  modalFlowerId: null,
  carouselIndex: 0
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  attachStaticHandlers();
  renderCartSummary();
  loadFlowers();
  loadDeliveryOptions();
}

function cacheElements() {
  els.cartCount = document.getElementById("cartCount");
  els.purposeChips = document.getElementById("purposeChips");
  els.priceFilter = document.getElementById("priceFilter");
  els.resetFilters = document.getElementById("resetFilters");
  els.flowersStatus = document.getElementById("flowersStatus");
  els.flowersError = document.getElementById("flowersError");
  els.retryFlowers = document.getElementById("retryFlowers");
  els.productGrid = document.getElementById("productGrid");
  els.deliveryRegion = document.getElementById("deliveryRegion");
  els.deliveryOptions = document.getElementById("deliveryOptions");
  els.deliveryStatus = document.getElementById("deliveryStatus");
  els.deliveryError = document.getElementById("deliveryError");
  els.retryDelivery = document.getElementById("retryDelivery");
  els.recommendedTrack = document.getElementById("recommendedTrack");
  els.prevRecommend = document.getElementById("prevRecommend");
  els.nextRecommend = document.getElementById("nextRecommend");
  els.cartItems = document.getElementById("cartItems");
  els.summaryRegion = document.getElementById("summaryRegion");
  els.summaryDelivery = document.getElementById("summaryDelivery");
  els.summaryEta = document.getElementById("summaryEta");
  els.summarySubtotal = document.getElementById("summarySubtotal");
  els.summaryDeliveryCost = document.getElementById("summaryDeliveryCost");
  els.summaryTotal = document.getElementById("summaryTotal");
  els.checkoutButton = document.getElementById("checkoutButton");
  els.productModalBackdrop = document.getElementById("productModalBackdrop");
  els.modalClose = document.getElementById("modalClose");
  els.modalImage = document.getElementById("modalImage");
  els.modalPurpose = document.getElementById("modalPurpose");
  els.modalTitle = document.getElementById("modalTitle");
  els.modalDelivery = document.getElementById("modalDelivery");
  els.modalPrice = document.getElementById("modalPrice");
  els.modalAddCart = document.getElementById("modalAddCart");
  els.modalFavorite = document.getElementById("modalFavorite");
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

  els.retryFlowers.addEventListener("click", loadFlowers);
  els.retryDelivery.addEventListener("click", loadDeliveryOptions);

  els.purposeChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-purpose]");
    if (!chip) {
      return;
    }
    state.filters.purpose = chip.dataset.purpose;
    updatePurposeActive();
    renderProducts();
  });

  els.priceFilter.addEventListener("change", () => {
    state.filters.price = els.priceFilter.value;
    renderProducts();
  });

  els.resetFilters.addEventListener("click", () => {
    state.filters.purpose = "all";
    state.filters.price = "all";
    els.priceFilter.value = "all";
    updatePurposeActive();
    renderProducts();
  });

  els.deliveryRegion.addEventListener("change", () => {
    state.selectedRegion = els.deliveryRegion.value;
    renderCartSummary();
  });

  els.deliveryOptions.addEventListener("click", (event) => {
    const optionButton = event.target.closest("[data-delivery-id]");
    if (!optionButton) {
      return;
    }
    state.selectedDeliveryOptionId = optionButton.dataset.deliveryId;
    renderDeliveryOptions();
    renderCartSummary();
  });

  els.prevRecommend.addEventListener("click", () => {
    const recommended = getRecommendedFlowers();
    state.carouselIndex = (state.carouselIndex - 1 + recommended.length) % recommended.length;
    renderRecommended();
  });

  els.nextRecommend.addEventListener("click", () => {
    const recommended = getRecommendedFlowers();
    state.carouselIndex = (state.carouselIndex + 1) % recommended.length;
    renderRecommended();
  });

  els.cartItems.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-cart]");
    if (!removeButton) {
      return;
    }
    removeFromCart(removeButton.dataset.removeCart);
  });

  els.checkoutButton.addEventListener("click", () => {
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

  els.modalAddCart.addEventListener("click", () => {
    if (state.modalFlowerId) {
      addToCart(state.modalFlowerId);
    }
  });

  els.modalFavorite.addEventListener("click", () => {
    if (state.modalFlowerId) {
      toggleFavorite(state.modalFlowerId);
      updateModalFavoriteButton();
    }
  });
}

async function loadFlowers() {
  els.flowersStatus.textContent = "꽃 상품을 불러오는 중입니다.";
  els.flowersError.hidden = true;

  try {
    const response = await fetch("/api/flowers");
    if (!response.ok) {
      throw new Error(`Flowers API returned ${response.status}`);
    }
    const payload = await response.json();
    state.flowers = payload.flowers;
    renderPurposeFilters();
    renderProducts();
    renderRecommended();
    els.flowersStatus.textContent = `${state.flowers.length}개 상품 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.flowersStatus.textContent = "";
    els.flowersError.hidden = false;
  }
}

async function loadDeliveryOptions() {
  els.deliveryStatus.textContent = "배송 옵션을 불러오는 중입니다.";
  els.deliveryError.hidden = true;

  try {
    const response = await fetch("/api/delivery-options");
    if (!response.ok) {
      throw new Error(`Delivery API returned ${response.status}`);
    }
    const payload = await response.json();
    state.deliveryOptions = payload.deliveryOptions;
    renderDeliveryOptions();
    renderCartSummary();
    els.deliveryStatus.textContent = `${state.deliveryOptions.length}개 배송 옵션 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.deliveryStatus.textContent = "";
    els.deliveryError.hidden = false;
  }
}

function renderPurposeFilters() {
  const purposes = [...new Set(state.flowers.map((flower) => flower.purpose))].sort();
  els.purposeChips.innerHTML = '<button class="chip active" type="button" data-purpose="all">전체</button>';
  purposes.forEach((purpose) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.dataset.purpose = purpose;
    chip.textContent = purpose;
    els.purposeChips.appendChild(chip);
  });
}

function updatePurposeActive() {
  els.purposeChips.querySelectorAll("[data-purpose]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.purpose === state.filters.purpose);
  });
}

function renderProducts() {
  const flowers = getFilteredFlowers();
  els.productGrid.innerHTML = "";

  if (flowers.length === 0) {
    els.productGrid.innerHTML = '<div class="empty-state">조건에 맞는 꽃 상품이 없습니다. 필터를 조정해 주세요.</div>';
    return;
  }

  flowers.forEach((flower) => {
    els.productGrid.appendChild(createProductCard(flower));
  });
}

function createProductCard(flower) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.flowerId = flower.id;
  const imageBugAttribute = flower.id === BUGGY_IMAGE_FLOWER_ID ? ' data-bug-id="site055-bug02"' : "";

  card.innerHTML = `
    <img class="product-image" src="${flower.image}" alt="${flower.name} 이미지"${imageBugAttribute} />
    <div class="product-body">
      <div class="product-topline">
        <span class="purpose-badge">${flower.purpose}</span>
        <span class="delivery-badge ${flower.deliveryAvailable ? "" : "unavailable"}">
          ${flower.deliveryAvailable ? "배송 가능" : "픽업 전용"}
        </span>
      </div>
      <h3>${flower.name}</h3>
      <div class="product-price">${formatCurrency(flower.price)}</div>
      <div class="product-actions">
        <button class="favorite-button ${state.likedIds.has(flower.id) ? "is-liked" : ""}" type="button" aria-label="${flower.name} 찜하기">
          ${state.likedIds.has(flower.id) ? "♥" : "♡"}
        </button>
        <button class="details-button" type="button">상세 보기</button>
        <button class="cart-button" type="button">장바구니 담기</button>
      </div>
    </div>
  `;

  card.querySelector(".favorite-button").addEventListener("click", () => toggleFavorite(flower.id));
  card.querySelector(".details-button").addEventListener("click", () => openModal(flower.id));

  const cartButton = card.querySelector(".cart-button");
  if (flower.id === BUGGY_CART_FLOWER_ID) {
    // INTENTIONAL GUI BUG: site055-bug03
    // CSV Error: 장바구니 버튼 무반응
    // Type: flower-cart-button-no-response
    // Description: 특정 추천 꽃다발의 장바구니 버튼에 click listener를 연결하지 않아 클릭해도 장바구니가 변경되지 않음.
    cartButton.setAttribute("data-bug-id", "site055-bug03");
  } else {
    cartButton.addEventListener("click", () => addToCart(flower.id));
  }

  return card;
}

function renderDeliveryOptions() {
  els.deliveryOptions.innerHTML = "";

  state.deliveryOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = `delivery-option ${option.id === state.selectedDeliveryOptionId ? "active" : ""}`;
    button.type = "button";
    button.dataset.deliveryId = option.id;
    button.textContent = `${option.name} · ${formatCurrency(option.extraCost)}`;
    els.deliveryOptions.appendChild(button);
  });
}

function renderRecommended() {
  const recommended = getRecommendedFlowers();
  els.recommendedTrack.innerHTML = "";

  if (recommended.length === 0) {
    els.recommendedTrack.innerHTML = '<div class="empty-state">추천 상품을 불러오는 중입니다.</div>';
    return;
  }

  const visible = [];
  for (let index = 0; index < Math.min(3, recommended.length); index += 1) {
    visible.push(recommended[(state.carouselIndex + index) % recommended.length]);
  }

  visible.forEach((flower) => {
    els.recommendedTrack.appendChild(createProductCard(flower));
  });
}

function openModal(flowerId) {
  const flower = state.flowers.find((item) => item.id === flowerId);
  if (!flower) {
    return;
  }

  state.modalFlowerId = flowerId;
  els.modalImage.src = flower.image;
  els.modalImage.alt = `${flower.name} 이미지`;
  els.modalPurpose.textContent = flower.purpose;
  els.modalTitle.textContent = flower.name;
  els.modalDelivery.textContent = flower.deliveryAvailable ? "오늘 배송 가능 상품입니다." : "스튜디오 픽업 전용 상품입니다.";
  els.modalPrice.textContent = formatCurrency(flower.price);
  updateModalFavoriteButton();
  els.productModalBackdrop.hidden = false;
}

function closeModal() {
  els.productModalBackdrop.hidden = true;
  state.modalFlowerId = null;
}

function updateModalFavoriteButton() {
  const liked = state.likedIds.has(state.modalFlowerId);
  els.modalFavorite.textContent = liked ? "찜 해제" : "찜하기";
}

function toggleFavorite(flowerId) {
  if (state.likedIds.has(flowerId)) {
    state.likedIds.delete(flowerId);
  } else {
    state.likedIds.add(flowerId);
  }
  renderProducts();
  renderRecommended();
}

function addToCart(flowerId) {
  const flower = state.flowers.find((item) => item.id === flowerId);
  if (!flower) {
    return;
  }
  const existing = state.cart.find((item) => item.flowerId === flowerId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ flowerId, quantity: 1 });
  }
  renderCartSummary();
}

function removeFromCart(flowerId) {
  state.cart = state.cart.filter((item) => item.flowerId !== flowerId);
  renderCartSummary();
}

function renderCartSummary() {
  const selectedDelivery = getDeliveryOption(state.selectedDeliveryOptionId);

  // INTENTIONAL GUI BUG: site055-bug01
  // CSV Error: 배송 옵션 상태 불일치
  // Type: delivery-option-state-mismatch
  // Description: 배송 옵션 선택 변경 후 장바구니 요약의 배송 옵션 값을 갱신하지 않아 이전 값이 표시됨.
  const displayedDelivery = getDeliveryOption(state.initialDeliveryOptionId);

  const subtotal = state.cart.reduce((sum, item) => {
    const flower = state.flowers.find((entry) => entry.id === item.flowerId);
    return sum + (flower ? flower.price * item.quantity : 0);
  }, 0);
  const deliveryCost = selectedDelivery ? selectedDelivery.extraCost : 0;

  els.cartCount.textContent = String(state.cart.reduce((sum, item) => sum + item.quantity, 0));
  els.summaryRegion.textContent = state.selectedRegion;
  els.summaryDelivery.textContent = displayedDelivery ? displayedDelivery.name : "일반 배송";
  els.summaryEta.textContent = selectedDelivery ? selectedDelivery.eta : "내일 도착";
  els.summarySubtotal.textContent = formatCurrency(subtotal);
  els.summaryDeliveryCost.textContent = formatCurrency(deliveryCost);
  els.summaryTotal.textContent = formatCurrency(subtotal + deliveryCost);

  renderCartItems();
}

function renderCartItems() {
  els.cartItems.innerHTML = "";

  if (state.cart.length === 0) {
    els.cartItems.innerHTML = '<div class="empty-state">아직 담은 꽃이 없습니다.</div>';
    return;
  }

  state.cart.forEach((item) => {
    const flower = state.flowers.find((entry) => entry.id === item.flowerId);
    if (!flower) {
      return;
    }
    const row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML = `
      <strong>${flower.name}</strong>
      <span>${formatCurrency(flower.price)} · ${item.quantity}개</span>
      <button class="cart-remove" type="button" data-remove-cart="${flower.id}">삭제</button>
    `;
    els.cartItems.appendChild(row);
  });
}

function getFilteredFlowers() {
  return state.flowers.filter((flower) => {
    const matchesPurpose = state.filters.purpose === "all" || flower.purpose === state.filters.purpose;
    const matchesPrice =
      state.filters.price === "all" ||
      (state.filters.price === "under50000" && flower.price <= 50000) ||
      (state.filters.price === "50000-80000" && flower.price > 50000 && flower.price <= 80000) ||
      (state.filters.price === "over80000" && flower.price > 80000);
    return matchesPurpose && matchesPrice;
  });
}

function getRecommendedFlowers() {
  return state.flowers.filter((flower) => flower.recommended);
}

function getDeliveryOption(optionId) {
  return state.deliveryOptions.find((option) => option.id === optionId);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}
