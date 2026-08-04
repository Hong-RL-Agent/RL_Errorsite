const state = {
  products: [],
  brands: [],
  cartItems: [],
  filters: {
    category: "all",
    materials: [],
    brand: "all",
    maxPrice: 180000,
    inStockOnly: false,
    search: "",
    sort: "recommended"
  }
};

const BUGGY_CART_PRODUCT_ID = "knife-santoku-01";

const elements = {
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  emptyState: document.getElementById("emptyState"),
  productGrid: document.getElementById("productGrid"),
  resultCount: document.getElementById("resultCount"),
  activeFilterText: document.getElementById("activeFilterText"),
  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  brandFilter: document.getElementById("brandFilter"),
  priceRange: document.getElementById("priceRange"),
  priceValue: document.getElementById("priceValue"),
  stockOnlyInput: document.getElementById("stockOnlyInput"),
  cartPanel: document.getElementById("cartPanel"),
  cartPanelBody: document.getElementById("cartPanelBody"),
  toggleCartButton: document.getElementById("toggleCartButton"),
  cartItemsList: document.getElementById("cartItemsList"),
  cartTotal: document.getElementById("cartTotal"),
  cartCountPill: document.getElementById("cartCountPill"),
  productModal: document.getElementById("productModal"),
  modalContent: document.getElementById("modalContent"),
  modalCloseButton: document.getElementById("modalCloseButton"),
  bestsellerStrip: document.getElementById("bestsellerStrip"),
  brandCards: document.getElementById("brandCards"),
  newsletterForm: document.getElementById("newsletterForm"),
  newsletterEmail: document.getElementById("newsletterEmail"),
  newsletterFeedback: document.getElementById("newsletterFeedback")
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

async function loadStorefrontData() {
  setLoading(true);
  setError(false);
  elements.productGrid.innerHTML = "";

  try {
    const [productData, brandData] = await Promise.all([
      fetchJson("/api/kitchenware"),
      fetchJson("/api/brands")
    ]);

    state.products = productData.items;
    state.brands = brandData.brands;
    state.cartItems = state.products.slice(0, 3).map((product) => ({
      productId: product.id,
      quantity: 1
    }));

    renderBrandFilter();
    renderProducts();
    renderBestsellers();
    renderBrands();
    renderCart();
  } catch (error) {
    setError(true);
  } finally {
    setLoading(false);
  }
}

function renderBrandFilter() {
  const options = state.brands
    .map((brand) => `<option value="${brand.name}">${brand.name}</option>`)
    .join("");
  elements.brandFilter.innerHTML = `<option value="all">전체 브랜드</option>${options}`;
}

function getFilteredProducts() {
  const query = state.filters.search.trim().toLowerCase();

  let filtered = state.products.filter((product) => {
    const matchesCategory = state.filters.category === "all" || product.category === state.filters.category;
    const matchesMaterial =
      state.filters.materials.length === 0 || state.filters.materials.includes(product.material);
    const matchesBrand = state.filters.brand === "all" || product.brand === state.filters.brand;
    const matchesPrice = product.price <= state.filters.maxPrice;
    const matchesStock = !state.filters.inStockOnly || product.inStock;
    const searchableText = `${product.name} ${product.brand} ${product.material} ${product.category}`.toLowerCase();
    const matchesSearch = !query || searchableText.includes(query);

    return matchesCategory && matchesMaterial && matchesBrand && matchesPrice && matchesStock && matchesSearch;
  });

  filtered = [...filtered].sort((a, b) => {
    if (state.filters.sort === "priceAsc") return a.price - b.price;
    if (state.filters.sort === "priceDesc") return b.price - a.price;
    if (state.filters.sort === "ratingDesc") return b.rating - a.rating;
    return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
  });

  return filtered;
}

function renderProducts() {
  const products = getFilteredProducts();
  elements.emptyState.classList.toggle("hidden", products.length !== 0);
  elements.resultCount.textContent = `${products.length}개 상품`;
  elements.activeFilterText.textContent = buildFilterSummary();

  elements.productGrid.innerHTML = products.map(createProductCardHtml).join("");

  products.forEach((product) => {
    const detailButton = document.querySelector(`[data-detail-id="${product.id}"]`);
    detailButton.addEventListener("click", () => openProductModal(product.id));

    const addButton = document.querySelector(`[data-cart-id="${product.id}"]`);
    if (!product.inStock) {
      addButton.addEventListener("click", () => alert("준비중입니다."));
      return;
    }

    // INTENTIONAL GUI BUG: site081-bug03
    // Type: kitchenware-cart-button-no-response
    // Description: 특정 키친웨어 상품의 장바구니 버튼에 click listener를 연결하지 않아 장바구니가 변경되지 않음.
    if (product.id === BUGGY_CART_PRODUCT_ID) {
      return;
    }

    addButton.addEventListener("click", () => addToCart(product.id));
  });
}

function createProductCardHtml(product) {
  const stockText = product.inStock ? "재고 있음" : "품절";
  const stockClass = product.inStock ? "stock" : "stock out";
  const bugAttribute = product.id === BUGGY_CART_PRODUCT_ID ? ' data-bug-id="site081-bug03"' : "";

  return `
    <article class="product-card">
      <button class="product-image-button" type="button" data-detail-id="${product.id}" aria-label="${product.name} 상세 보기">
        <img src="${product.image}" alt="${product.name}" />
      </button>
      <div class="product-body">
        <div class="product-meta">
          <span>${product.brand}</span>
          <span class="badge">${product.badge}</span>
        </div>
        <h3>${product.name}</h3>
        <div class="stock-line">
          <span class="material-pill">${product.material}</span>
          <span class="${stockClass}">${stockText}</span>
        </div>
        <div class="price-rating">
          <span class="price">${formatPrice(product.price)}</span>
          <span class="rating">평점 ${product.rating}</span>
        </div>
        <div class="card-actions">
          <button class="outline-button" type="button" data-detail-id="${product.id}">상세 보기</button>
          <button class="solid-button" type="button" data-cart-id="${product.id}"${bugAttribute}>장바구니 담기</button>
        </div>
      </div>
    </article>
  `;
}

function buildFilterSummary() {
  const parts = [];
  if (state.filters.category !== "all") parts.push(state.filters.category);
  if (state.filters.materials.length) parts.push(state.filters.materials.join(", "));
  if (state.filters.brand !== "all") parts.push(state.filters.brand);
  if (state.filters.inStockOnly) parts.push("재고 상품");
  if (state.filters.search.trim()) parts.push(`검색: ${state.filters.search.trim()}`);
  return parts.length ? parts.join(" · ") : "전체 컬렉션";
}

function addToCart(productId) {
  const existing = state.cartItems.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cartItems.push({ productId, quantity: 1 });
  }
  renderCart();
}

function updateCartQuantity(productId, delta) {
  const existing = state.cartItems.find((item) => item.productId === productId);
  if (!existing) return;
  existing.quantity += delta;
  if (existing.quantity <= 0) {
    state.cartItems = state.cartItems.filter((item) => item.productId !== productId);
  }
  renderCart();
}

function removeCartItem(productId) {
  state.cartItems = state.cartItems.filter((item) => item.productId !== productId);
  renderCart();
}

function getProduct(productId) {
  return state.products.find((product) => product.id === productId);
}

// INTENTIONAL GUI BUG: site081-bug01
// Type: cart-total-price-mismatch
// Description: 장바구니 총액 계산 시 마지막 상품 가격을 제외해 실제 상품 합계와 불일치함.
function calculateCartTotal() {
  return state.cartItems.slice(0, -1).reduce((sum, item) => {
    const product = getProduct(item.productId);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
}

function renderCart() {
  const visibleItems = state.cartItems
    .map((item) => ({ ...item, product: getProduct(item.productId) }))
    .filter((item) => item.product);

  elements.cartItemsList.innerHTML = visibleItems.length
    ? visibleItems.map(createCartItemHtml).join("")
    : `<p class="state-panel">장바구니가 비어 있습니다.</p>`;

  visibleItems.forEach((item) => {
    document.querySelector(`[data-increase-id="${item.productId}"]`).addEventListener("click", () => updateCartQuantity(item.productId, 1));
    document.querySelector(`[data-decrease-id="${item.productId}"]`).addEventListener("click", () => updateCartQuantity(item.productId, -1));
    document.querySelector(`[data-remove-id="${item.productId}"]`).addEventListener("click", () => removeCartItem(item.productId));
  });

  elements.cartTotal.textContent = formatPrice(calculateCartTotal());
  elements.cartCountPill.textContent = visibleItems.reduce((sum, item) => sum + item.quantity, 0);
}

function createCartItemHtml(item) {
  return `
    <article class="cart-item">
      <strong>${item.product.name}</strong>
      <small>${formatPrice(item.product.price)} · ${item.product.material}</small>
      <div class="cart-item-controls">
        <div class="stepper" aria-label="${item.product.name} 수량 조절">
          <button type="button" data-decrease-id="${item.productId}" aria-label="수량 감소">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-increase-id="${item.productId}" aria-label="수량 증가">+</button>
        </div>
        <button class="text-button" type="button" data-remove-id="${item.productId}">삭제</button>
      </div>
    </article>
  `;
}

function openProductModal(productId) {
  const product = getProduct(productId);
  if (!product) return;

  elements.modalContent.innerHTML = `
    <article class="modal-product">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <p class="section-kicker">${product.brand}</p>
        <h2 id="modalTitle">${product.name}</h2>
        <p>${product.description}</p>
        <p><strong>소재</strong> ${product.material}</p>
        <p><strong>카테고리</strong> ${product.category}</p>
        <p><strong>가격</strong> ${formatPrice(product.price)}</p>
        <p><strong>평점</strong> ${product.rating}</p>
        <button class="solid-button" type="button" id="modalCartButton">장바구니 담기</button>
      </div>
    </article>
  `;

  document.getElementById("modalCartButton").addEventListener("click", () => {
    if (product.inStock) {
      addToCart(product.id);
      closeProductModal();
    } else {
      alert("준비중입니다.");
    }
  });

  elements.productModal.classList.remove("hidden");
}

function closeProductModal() {
  elements.productModal.classList.add("hidden");
}

function renderBestsellers() {
  const bestsellers = [...state.products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  elements.bestsellerStrip.innerHTML = bestsellers
    .map(
      (product) => `
        <article class="mini-card">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <strong>${product.name}</strong>
            <p>${formatPrice(product.price)}</p>
            <button class="text-button" type="button" data-best-detail-id="${product.id}">상세 보기</button>
          </div>
        </article>
      `
    )
    .join("");

  bestsellers.forEach((product) => {
    document.querySelector(`[data-best-detail-id="${product.id}"]`).addEventListener("click", () => openProductModal(product.id));
  });
}

function renderBrands() {
  elements.brandCards.innerHTML = state.brands
    .map(
      (brand) => `
        <article class="${brand.recommended ? "recommended" : ""}">
          <strong>${brand.name}</strong>
          <p>${brand.description}</p>
          <span class="material-pill">${brand.recommended ? "추천 브랜드" : "입점 브랜드"}</span>
        </article>
      `
    )
    .join("");
}

function resetFilters() {
  state.filters = {
    category: "all",
    materials: [],
    brand: "all",
    maxPrice: 180000,
    inStockOnly: false,
    search: "",
    sort: "recommended"
  };

  document.querySelector('input[name="category"][value="all"]').checked = true;
  document.querySelectorAll('input[name="material"]').forEach((input) => {
    input.checked = false;
  });
  elements.brandFilter.value = "all";
  elements.priceRange.value = "180000";
  elements.priceValue.textContent = formatPrice(180000);
  elements.stockOnlyInput.checked = false;
  elements.searchInput.value = "";
  elements.sortSelect.value = "recommended";
  renderProducts();
}

function bindEvents() {
  document.querySelectorAll("[data-coming-soon]").forEach((button) => {
    button.addEventListener("click", () => alert("준비중입니다."));
  });

  document.querySelectorAll('input[name="category"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      state.filters.category = event.target.value;
      renderProducts();
    });
  });

  document.querySelectorAll('input[name="material"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.filters.materials = Array.from(document.querySelectorAll('input[name="material"]:checked')).map(
        (checkedInput) => checkedInput.value
      );
      renderProducts();
    });
  });

  elements.brandFilter.addEventListener("change", (event) => {
    state.filters.brand = event.target.value;
    renderProducts();
  });

  elements.priceRange.addEventListener("input", (event) => {
    state.filters.maxPrice = Number(event.target.value);
    elements.priceValue.textContent = formatPrice(state.filters.maxPrice);
    renderProducts();
  });

  elements.stockOnlyInput.addEventListener("change", (event) => {
    state.filters.inStockOnly = event.target.checked;
    renderProducts();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderProducts();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.filters.sort = event.target.value;
    renderProducts();
  });

  document.getElementById("resetFiltersButton").addEventListener("click", resetFilters);
  document.getElementById("clearFilterMiniButton").addEventListener("click", resetFilters);
  document.getElementById("retryButton").addEventListener("click", loadStorefrontData);

  elements.toggleCartButton.addEventListener("click", () => {
    const isCollapsed = elements.cartPanel.classList.toggle("collapsed");
    elements.toggleCartButton.textContent = isCollapsed ? "+" : "−";
    elements.toggleCartButton.setAttribute("aria-expanded", String(!isCollapsed));
    elements.toggleCartButton.setAttribute("aria-label", isCollapsed ? "장바구니 패널 펼치기" : "장바구니 패널 접기");
  });

  document.getElementById("headerCartButton").addEventListener("click", () => {
    elements.cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("shopFeaturedButton").addEventListener("click", () => {
    document.getElementById("featuredProducts").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.modalCloseButton.addEventListener("click", closeProductModal);
  elements.productModal.addEventListener("click", (event) => {
    if (event.target === elements.productModal) {
      closeProductModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProductModal();
    }
  });

  elements.newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = elements.newsletterEmail.value.trim();
    elements.newsletterFeedback.textContent = `${email} 주소로 월간 키친 노트를 준비했습니다.`;
  });
}

bindEvents();
loadStorefrontData();
