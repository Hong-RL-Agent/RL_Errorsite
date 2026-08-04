const state = {
  products: [],
  reviews: [],
  cart: [],
  selectedCategory: "all",
  searchQuery: "",
  stockOnly: false,
  sortBy: "recommended",
  selectedColors: {},
  reviewFilter: "all"
};

const els = {
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  categoryFilters: document.getElementById("categoryFilters"),
  stockOnly: document.getElementById("stockOnly"),
  sortSelect: document.getElementById("sortSelect"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  productGrid: document.getElementById("productGrid"),
  bestGrid: document.getElementById("bestGrid"),
  reviewGrid: document.getElementById("reviewGrid"),
  reviewFilter: document.getElementById("reviewFilter"),
  resultCount: document.getElementById("resultCount"),
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  emptyState: document.getElementById("emptyState"),
  retryBtn: document.getElementById("retryBtn"),
  reloadBtn: document.getElementById("reloadBtn"),
  cartCount: document.getElementById("cartCount"),
  cartList: document.getElementById("cartList"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartTotal: document.getElementById("cartTotal"),
  cartPanel: document.getElementById("cartPanel"),
  cartBody: document.getElementById("cartBody"),
  collapseCartBtn: document.getElementById("collapseCartBtn"),
  cartTopBtn: document.getElementById("cartTopBtn"),
  headerCategoryBtn: document.getElementById("headerCategoryBtn"),
  heroShopBtn: document.getElementById("heroShopBtn"),
  newsletterForm: document.getElementById("newsletterForm"),
  newsletterEmail: document.getElementById("newsletterEmail"),
  newsletterPreview: document.getElementById("newsletterPreview"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalContent: document.getElementById("modalContent"),
  modalCloseBtn: document.getElementById("modalCloseBtn")
};

const colorLabels = {
  sky: "스카이블루",
  blue: "블루",
  cream: "크림",
  mint: "민트",
  pink: "핑크",
  yellow: "옐로우",
  lavender: "라벤더"
};

function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function createEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadData() {
  setLoading(true);
  try {
    const [productPayload, reviewPayload] = await Promise.all([
      fetchJson("/api/products"),
      fetchJson("/api/reviews")
    ]);
    state.products = productPayload.products;
    state.reviews = reviewPayload.reviews;
    state.products.forEach((product) => {
      if (!state.selectedColors[product.id]) {
        state.selectedColors[product.id] = product.colors[0];
      }
    });
    setLoading(false);
    renderAll();
  } catch (error) {
    setLoading(false, true);
  }
}

function setLoading(isLoading, isError = false) {
  els.loadingState.classList.toggle("hidden", !isLoading);
  els.errorState.classList.toggle("hidden", !isError);
  els.productGrid.classList.toggle("hidden", isLoading || isError);
  els.emptyState.classList.add("hidden");
}

function renderAll() {
  renderProducts();
  renderBestProducts();
  renderReviews();
  renderCart();
}

function getFilteredProducts() {
  const query = state.searchQuery.trim().toLowerCase();
  let list = state.products.filter((product) => {
    const matchesCategory = state.selectedCategory === "all" || product.category === state.selectedCategory;
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.categoryLabel.toLowerCase().includes(query);
    const matchesStock = !state.stockOnly || product.stock !== "sold_out";
    return matchesCategory && matchesSearch && matchesStock;
  });

  if (state.sortBy === "priceAsc") {
    list = list.slice().sort((a, b) => a.price - b.price);
  } else if (state.sortBy === "priceDesc") {
    list = list.slice().sort((a, b) => b.price - a.price);
  } else if (state.sortBy === "ratingDesc") {
    list = list.slice().sort((a, b) => b.rating - a.rating);
  }

  return list;
}

function renderProducts() {
  const products = getFilteredProducts();
  els.productGrid.innerHTML = "";
  els.resultCount.textContent = `${products.length}개 상품`;
  els.emptyState.classList.toggle("hidden", products.length > 0);

  products.forEach((product) => {
    els.productGrid.appendChild(createProductCard(product));
  });
}

function createProductCard(product) {
  const card = createEl("article", "product-card");
  if (product.id === "p-106") {
    card.classList.add("bug-flex-break");
    card.setAttribute("data-bug-id", "site046-bug02");
  }

  const imageWrap = createEl("div", "product-image");
  const image = document.createElement("img");
  image.src = product.image;
  image.alt = `${product.name} 상품 이미지`;
  imageWrap.appendChild(image);

  const info = createEl("div", "product-info");
  const brandRow = createEl("div", "brand-row");
  brandRow.append(createEl("span", "", product.brand), createEl("span", "", product.categoryLabel));

  const title = createEl("h3", "product-title", product.name);
  const priceRow = createEl("div", "price-row");
  priceRow.append(createEl("strong", "", formatPrice(product.price)), createStockPill(product));

  const colorOptions = createColorOptions(product);
  const actions = createEl("div", "product-actions");
  const detailBtn = createEl("button", "detail-btn", "상세보기");
  detailBtn.type = "button";
  detailBtn.addEventListener("click", () => openProductModal(product.id));

  const addBtn = createEl("button", "add-btn", "담기");
  addBtn.type = "button";
  if (product.stock === "sold_out") {
    addBtn.textContent = "입고알림";
    addBtn.classList.add("sold-out");
    addBtn.addEventListener("click", () => alert("입고 알림 기능은 준비중입니다."));
  } else {
    addBtn.addEventListener("click", () => addToCart(product.id));
  }
  actions.append(detailBtn, addBtn);

  info.append(brandRow, title, priceRow, colorOptions, actions);
  card.append(imageWrap, info);
  return card;
}

function createStockPill(product) {
  const stockClass = product.stock === "low_stock" ? "low" : product.stock === "sold_out" ? "sold" : "";
  const pill = createEl("span", `stock-pill ${stockClass}`, product.stockLabel);
  return pill;
}

function createColorOptions(product) {
  const wrap = createEl("div", "color-options");
  product.colors.forEach((color) => {
    const button = createEl("button", `color-swatch swatch-${color}`);
    button.type = "button";
    button.setAttribute("aria-label", `${product.name} ${colorLabels[color] || color} 색상 선택`);
    if (state.selectedColors[product.id] === color) {
      button.classList.add("selected");
    }
    button.addEventListener("click", () => {
      state.selectedColors[product.id] = color;
      renderProducts();
      renderBestProducts();
    });
    wrap.appendChild(button);
  });
  return wrap;
}

function renderBestProducts() {
  els.bestGrid.innerHTML = "";
  state.products
    .filter((product) => product.best)
    .slice(0, 4)
    .forEach((product) => {
      const card = createEl("article", "best-card");
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = `${product.name} 베스트 상품 이미지`;

      const body = createEl("div");
      body.append(
        createEl("h3", "", product.name),
        createEl("p", "", `${product.brand} · ${formatPrice(product.price)}`),
        createEl("p", "", `선택 색상: ${colorLabels[state.selectedColors[product.id]] || "-"}`)
      );

      const button = createEl("button", "", "담기");
      button.type = "button";
      if (product.id === "p-103") {
        // INTENTIONAL GUI BUG: site046-bug03
        // CSV Error: 담기 버튼 무반응
        // Type: add-to-cart-button-no-response
        // Description: 특정 상품의 담기 버튼에 click 이벤트 리스너를 연결하지 않아 클릭해도 장바구니가 변경되지 않음.
        button.setAttribute("data-bug-id", "site046-bug03");
      } else {
        button.addEventListener("click", () => addToCart(product.id));
      }
      body.appendChild(button);
      card.append(image, body);
      els.bestGrid.appendChild(card);
    });
}

function renderReviews() {
  const filter = state.reviewFilter;
  const reviews = state.reviews.filter((review) => {
    if (filter === "5") return review.rating === 5;
    if (filter === "4") return review.rating >= 4;
    return true;
  });

  els.reviewGrid.innerHTML = "";
  reviews.forEach((review) => {
    const product = state.products.find((item) => item.id === review.productId);
    const card = createEl("article", "review-card");
    card.append(
      createEl("div", "review-stars", "★".repeat(review.rating)),
      createEl("strong", "", review.author),
      createEl("p", "", review.content),
      createEl("small", "", `${product ? product.name : "상품"} · ${review.date}`)
    );
    els.reviewGrid.appendChild(card);
  });
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  state.cart.push({
    id: product.id,
    name: product.name,
    price: product.price,
    color: state.selectedColors[product.id] || product.colors[0]
  });
  renderCart();
}

function renderCart() {
  els.cartList.innerHTML = "";
  els.cartEmpty.classList.toggle("hidden", state.cart.length > 0);

  state.cart.forEach((item, index) => {
    const li = createEl("li", "cart-item");
    li.append(
      createEl("strong", "", item.name),
      createEl("small", "", `${colorLabels[item.color] || item.color} · ${formatPrice(item.price)}`)
    );
    const removeBtn = createEl("button", "remove-btn", "삭제");
    removeBtn.type = "button";
    removeBtn.addEventListener("click", () => {
      state.cart.splice(index, 1);
      renderCart();
    });
    li.appendChild(removeBtn);
    els.cartList.appendChild(li);
  });

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  els.cartTotal.textContent = formatPrice(total);

  // INTENTIONAL GUI BUG: site046-bug01
  // CSV Error: 상품 개수 UI 불일치
  // Type: cart-count-ui-mismatch
  // Description: 장바구니 실제 배열 길이보다 하나 적은 수를 헤더 배지에 표시함.
  const visibleCartCount = Math.max(0, state.cart.length - 1);
  els.cartCount.textContent = String(visibleCartCount);
}

function openProductModal(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  els.modalContent.innerHTML = "";

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = `${product.name} 상세 이미지`;

  const body = createEl("div");
  const meta = createEl("div", "modal-meta");
  meta.append(
    createEl("span", "", product.brand),
    createEl("span", "", product.categoryLabel),
    createEl("span", "", product.stockLabel),
    createEl("span", "", `평점 ${product.rating}`)
  );

  const title = createEl("h2", "", product.name);
  title.id = "modalTitle";
  body.append(title, meta, createEl("p", "", product.description), createEl("strong", "", formatPrice(product.price)));

  const addButton = createEl("button", "primary-btn", "이 상품 담기");
  addButton.type = "button";
  addButton.addEventListener("click", () => {
    addToCart(product.id);
    closeProductModal();
  });
  body.appendChild(addButton);

  els.modalContent.append(image, body);
  els.modalBackdrop.classList.remove("hidden");
  els.modalBackdrop.setAttribute("aria-hidden", "false");
  els.modalCloseBtn.focus();
}

function closeProductModal() {
  els.modalBackdrop.classList.add("hidden");
  els.modalBackdrop.setAttribute("aria-hidden", "true");
}

function setCategory(category) {
  state.selectedCategory = category;
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  renderProducts();
}

function setupEvents() {
  els.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.searchQuery = els.searchInput.value;
    renderProducts();
  });

  els.searchInput.addEventListener("input", () => {
    state.searchQuery = els.searchInput.value;
    renderProducts();
  });

  els.categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    setCategory(button.dataset.category);
  });

  document.querySelectorAll("[data-category-shortcut]").forEach((button) => {
    button.addEventListener("click", () => {
      setCategory(button.dataset.categoryShortcut);
      document.getElementById("shopSection").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  els.headerCategoryBtn.addEventListener("click", () => {
    document.querySelector(".filter-sidebar").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.stockOnly.addEventListener("change", () => {
    state.stockOnly = els.stockOnly.checked;
    renderProducts();
  });

  els.sortSelect.addEventListener("change", () => {
    state.sortBy = els.sortSelect.value;
    renderProducts();
  });

  els.resetFiltersBtn.addEventListener("click", () => {
    state.selectedCategory = "all";
    state.searchQuery = "";
    state.stockOnly = false;
    state.sortBy = "recommended";
    els.searchInput.value = "";
    els.stockOnly.checked = false;
    els.sortSelect.value = "recommended";
    setCategory("all");
  });

  els.reviewFilter.addEventListener("change", () => {
    state.reviewFilter = els.reviewFilter.value;
    renderReviews();
  });

  els.retryBtn.addEventListener("click", loadData);
  els.reloadBtn.addEventListener("click", loadData);

  els.collapseCartBtn.addEventListener("click", toggleCartPanel);
  els.cartTopBtn.addEventListener("click", toggleCartPanel);

  els.heroShopBtn.addEventListener("click", () => {
    document.getElementById("shopSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.newsletterEmail.addEventListener("input", () => {
    els.newsletterPreview.textContent = els.newsletterEmail.value
      ? `입력한 이메일: ${els.newsletterEmail.value}`
      : "입력한 이메일이 여기에 표시됩니다.";
  });

  els.newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = els.newsletterEmail.value.trim();
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    alert(`${email} 주소로 뉴스레터 신청이 접수되었습니다.`);
  });

  els.modalCloseBtn.addEventListener("click", closeProductModal);
  els.modalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.modalBackdrop) closeProductModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.modalBackdrop.classList.contains("hidden")) {
      closeProductModal();
    }
  });

  document.querySelectorAll("[data-alert]").forEach((button) => {
    button.addEventListener("click", () => {
      alert(button.dataset.alert || "준비중입니다.");
    });
  });
}

function toggleCartPanel() {
  const willCollapse = !els.cartPanel.classList.contains("collapsed");
  els.cartPanel.classList.toggle("collapsed", willCollapse);
  els.collapseCartBtn.textContent = willCollapse ? "펼치기" : "접기";
  els.collapseCartBtn.setAttribute("aria-expanded", String(!willCollapse));
  els.cartTopBtn.setAttribute("aria-expanded", String(!willCollapse));
}

setupEvents();
loadData();
