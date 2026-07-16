<script>
  import { onMount } from 'svelte';

  // State Variables
  let books = [];
  let filteredBooks = [];
  let cart = [];
  let orders = [];
  
  let searchQuery = '';
  let selectedCategory = '전체';
  let selectedBook = null; // Detail modal
  
  let showCart = false;
  let showOrders = false;
  let showOrderForm = false;
  
  // Checkout Form
  let userName = '';
  let address = '';
  
  // Order Details Modal
  let selectedOrder = null;
  let testDownstreamOrder = null;

  // Toasts
  let toasts = [];

  // load data
  onMount(async () => {
    await loadBooks();
    await loadOrders();
  });

  async function loadBooks() {
    try {
      const res = await fetch(`/api/books?search=${encodeURIComponent(searchQuery)}`);
      
      // INTENTIONAL_ERROR
      // CATEGORY: Backend
      // DESCRIPTION: 백엔드에서 검색어에 '#'이 포함되었을 경우, 비정상 구조의 JSON 객체를 반환합니다.
      // 프론트엔드는 이를 배열로 기대하고 res.json()을 실행한 뒤 map/filter를 호출하므로, 
      // 이 영역에서 형식이 다른 JSON 데이터 유입에 의해 프론트엔드 오류가 유발됩니다.
      const data = await res.json();
      
      if (Array.isArray(data)) {
        books = data;
        applyCategoryFilter();
      } else {
        // Handle malformed JSON error explicitly to show error toast
        books = [];
        filteredBooks = [];
        showToast(`데이터 구조 로드 실패: ${data.details?.message || '배열을 수신하지 못했습니다.'}`, 'danger');
      }
    } catch (err) {
      showToast('도서 목록을 가져오는 데 실패했습니다.', 'danger');
    }
  }

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      orders = await res.json();
    } catch (err) {
      showToast('주문 내역을 가져오지 못했습니다.', 'danger');
    }
  }

  function applyCategoryFilter() {
    if (selectedCategory === '전체') {
      filteredBooks = books;
    } else {
      filteredBooks = books.filter(b => b.category === selectedCategory);
    }
  }

  function selectCategory(category) {
    selectedCategory = category;
    applyCategoryFilter();
  }

  // Search trigger
  async function handleSearch() {
    await loadBooks();
  }

  // Add to cart
  function addToCart(book) {
    const exist = cart.find(item => item.id === book.id);
    if (exist) {
      exist.quantity += 1;
      exist.totalPrice = exist.quantity * exist.price;
      cart = [...cart];
    } else {
      cart = [...cart, { ...book, quantity: 1, totalPrice: book.price }];
    }
    showToast(`장바구니에 '${book.name}' 도서가 담겼습니다.`, 'success');
  }

  // Remove from cart
  function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    showToast('장바구니에서 삭제되었습니다.', 'success');
  }

  // Quantity control with Error 1
  let clickTimes = [];
  function increaseQty(item) {
    const now = Date.now();
    // Keep click timestamps in the last 1 second
    clickTimes = [...clickTimes.filter(t => now - t < 1000), now];
    
    // Always increment actual quantity
    item.quantity += 1;

    // Trigger check
    const isErrorSequence = clickTimes.length >= 3;

    if (isErrorSequence) {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 장바구니에서 수량 증가(+) 버튼을 1초 안에 3번 이상 클릭하는 경우,
      // 수량 변수는 증가하지만 총가격(item.totalPrice)은 이전 수량 기준 금액으로 정체되도록 하여 
      // 수량과 가격 표시가 맞지 않는 오류를 유발합니다.
      showToast('장바구니 수량 연산 싱크가 일시 정체됩니다. (1초 내 3회 연타 오류)', 'warning');
    } else {
      // Calculate price normally
      item.totalPrice = item.quantity * item.price;
    }
    
    cart = [...cart];
  }

  function decreaseQty(item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      item.totalPrice = item.quantity * item.price;
      cart = [...cart];
    }
  }

  // Order Submit
  async function submitOrder() {
    if (!userName.trim() || !address.trim()) {
      showToast('주문자 이름과 배송 주소를 채워주세요.', 'warning');
      return;
    }

    const payload = {
      items: cart,
      userName,
      address,
      totalPrice: grandTotal
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '주문 접수 에러');
      }

      showToast('주문 영수증이 발행되었습니다.', 'success');
      cart = [];
      showOrderForm = false;
      userName = '';
      address = '';
      await loadOrders();
      await loadBooks(); // reload stocks (which database error will keep unchanged)
    } catch (err) {
      showToast(`주문 실패: ${err.message}`, 'danger');
    }
  }

  // Error 4 Detail Action (Fetch from bad port 9599)
  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 주문 내역의 '상세 보기 (포트 검증)'를 클릭하면 백엔드 포트가 아닌 
  // 잘못 기입된 포트인 '9599'번('http://localhost:9599/api/orders/...')으로 통신을 보내어 
  // 브라우저에서 'net::ERR_CONNECTION_REFUSED' 에러가 나도록 설계합니다.
  async function fetchOrderDetailsWithBadPort(orderId) {
    selectedOrder = null;
    testDownstreamOrder = null;
    
    try {
      const res = await fetch(`http://localhost:9599/api/orders/${orderId}`);
      if (!res.ok) throw new Error(`HTTP 에러: ${res.status}`);
      selectedOrder = await res.json();
    } catch (err) {
      showToast(`네트워크 오류: 포트 9599 연결 실패 (${err.message})`, 'danger');
    }
  }

  // Infrastructure API Action (Error 5)
  async function fetchOrderDetailsWithEnv(orderId) {
    selectedOrder = null;
    testDownstreamOrder = null;
    
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      
      if (!res.ok) {
        // This will catch Error 5
        throw new Error(data.error || '조회 실패');
      }
      
      testDownstreamOrder = data;
      showToast('인프라 검증이 성공적으로 완료되었습니다.', 'success');
    } catch (err) {
      showToast(`인프라 오류: ${err.message}`, 'danger');
    }
  }

  // Toast Helpers
  function showToast(message, type = 'info') {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  }

  function removeToast(id) {
    toasts = toasts.filter(t => t.id !== id);
  }

  // Reactive price calculator
  $: grandTotal = cart.reduce((sum, item) => sum + (item.totalPrice || (item.quantity * item.price)), 0);
</script>

<div class="pageloop-app">
  <!-- Layout Header -->
  <header class="app-header">
    <div class="brand-zone">
      <span class="issue-no">ISSUE NO. 03</span>
      <h1>PageLoop</h1>
      <span class="tagline">EDITORIAL ARCHIVE BOOKSTORE</span>
    </div>
    
    <div class="header-nav">
      <!-- Search Input -->
      <div class="search-box">
        <input 
          type="text" 
          placeholder="도서명 또는 저자 검색... (예: # 입력 시 오류)" 
          bind:value={searchQuery}
          on:keydown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button on:click={handleSearch}>SEARCH</button>
      </div>

      <button class="menu-btn" on:click={() => showOrders = true}>
        ORDER HISTORY ({orders.length})
      </button>
      <button class="cart-toggle-btn" on:click={() => showCart = true}>
        BAG ({cart.length})
      </button>
    </div>
  </header>

  <!-- Main Board Grid -->
  <div class="main-workspace">
    <!-- Left Category Panel -->
    <aside class="sidebar-category">
      <h2>CATEGORIES</h2>
      <div class="category-menu">
        {#each ['전체', '디자인/예술', '소설/시', '인문/사회'] as cat}
          <button 
            class:active={selectedCategory === cat} 
            on:click={() => selectCategory(cat)}
          >
            {cat}
          </button>
        {/each}
      </div>
      
      <div class="manifesto-box">
        <h3>PageLoop manifesto</h3>
        <p>우리는 독자의 주관적 취향을 기반으로 지식의 루프를 확장하는 시각 예술과 문학 전문 도서관식 큐레이션을 지향합니다.</p>
      </div>
    </aside>

    <!-- Center Books Grid -->
    <main class="books-display">
      <h2>CATALOGUE / {selectedCategory.toUpperCase()}</h2>
      
      <div class="books-grid">
        {#each filteredBooks as book, idx}
          <div 
            class="book-tile {idx % 5 === 0 ? 'tile-wide' : idx % 5 === 2 ? 'tile-tall' : ''}"
            on:click={() => selectedBook = book}
          >
            <div class="tile-cover-box">
              <img src={book.image} alt={book.name} />
              <span class="book-category">{book.category}</span>
            </div>
            <div class="tile-body">
              <div class="tile-meta">
                <span>{book.author}</span>
                <span>★ {book.rating}</span>
              </div>
              <h3>{book.name}</h3>
              <div class="tile-footer">
                <span class="price-lbl">₩{book.price.toLocaleString()}</span>
                <span class="stock-lbl">STOCK: {book.stock}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </main>
  </div>

  <!-- Book Detail Modal -->
  {#if selectedBook}
    <div class="modal-overlay" on:click={() => selectedBook = null}>
      <div class="book-detail-modal" on:click|stopPropagation>
        <button class="modal-close" on:click={() => selectedBook = null}>&times;</button>
        <div class="detail-columns">
          <div class="detail-cover">
            <img src={selectedBook.image} alt={selectedBook.name} />
          </div>
          <div class="detail-info">
            <span class="category-badge">{selectedBook.category}</span>
            <h2>{selectedBook.name}</h2>
            <p class="author-label">Author: {selectedBook.author}</p>
            <p class="rating-label">Rating: ★ {selectedBook.rating} / 5.0</p>
            
            <div class="editorial-text">
              <p>본 도서는 PageLoop 편집부의 세심한 리뷰와 검증을 통과한 디자인/예술 에디토리얼 아카이브 서적입니다. 시각적 구조와 서사 양식의 조화를 탐구하는 독자분들께 추천합니다.</p>
            </div>

            <div class="purchase-box">
              <div class="price-stock-row">
                <span class="detail-price">₩{selectedBook.price.toLocaleString()}</span>
                <span class="detail-stock">남은 수량: {selectedBook.stock}권</span>
              </div>
              <button 
                class="add-bag-btn" 
                disabled={selectedBook.stock === 0}
                on:click={() => { addToCart(selectedBook); selectedBook = null; }}
              >
                {selectedBook.stock === 0 ? 'SOLD OUT' : 'ADD TO BAG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Right Cart (Bag) Drawer -->
  {#if showCart}
    <div class="drawer-overlay" on:click={() => showCart = false}>
      <div class="cart-drawer" on:click|stopPropagation>
        <div class="drawer-header">
          <h2>YOUR SHOPPING BAG</h2>
          <button class="drawer-close" on:click={() => showCart = false}>&times;</button>
        </div>

        {#if cart.length === 0}
          <div class="empty-cart">
            <p>장바구니에 담긴 내역이 없습니다.</p>
          </div>
        {:else}
          <div class="cart-items-list">
            {#each cart as item}
              <div class="cart-item-card">
                <div class="cart-item-cover">
                  <img src={item.image} alt={item.name} />
                </div>
                <div class="cart-item-info">
                  <h3>{item.name}</h3>
                  <p class="unit-price">단가: ₩{item.price.toLocaleString()}</p>
                  
                  <!-- Quantity controls -->
                  <div class="qty-controller">
                    <button class="qty-btn" on:click={() => decreaseQty(item)}>-</button>
                    <span class="qty-num">{item.quantity}</span>
                    <button class="qty-btn" on:click={() => increaseQty(item)}>+</button>
                  </div>
                  
                  <div class="item-totals">
                    <span>금액: ₩{(item.totalPrice || (item.quantity * item.price)).toLocaleString()}</span>
                  </div>
                </div>
                <button class="item-remove-btn" on:click={() => removeFromCart(item.id)}>&times;</button>
              </div>
            {/each}
          </div>

          <div class="cart-footer">
            <div class="total-row">
              <span>GRAND TOTAL</span>
              <strong>₩{grandTotal.toLocaleString()}</strong>
            </div>
            {#if showOrderForm}
              <div class="receipt-invoice-form">
                <h3>RECEIPT / INVOICE BILL</h3>
                <div class="invoice-form-body">
                  <div class="form-group">
                    <label>CUSTOMER NAME (주문자 이름)</label>
                    <input type="text" placeholder="성함을 기입하세요" bind:value={userName} />
                  </div>
                  <div class="form-group">
                    <label>SHIPPING ADDRESS (배송지 주소)</label>
                    <input type="text" placeholder="도로명 주소를 기입하세요" bind:value={address} />
                  </div>
                  <button class="order-submit-btn" on:click={submitOrder}>
                    CONFIRM ORDER &amp; PRINT RECEIPT
                  </button>
                </div>
              </div>
            {:else}
              <button class="checkout-btn" on:click={() => showOrderForm = true}>
                PROCEED TO CHECKOUT
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Order History Modal -->
  {#if showOrders}
    <div class="modal-overlay" on:click={() => showOrders = false}>
      <div class="orders-history-modal" on:click|stopPropagation>
        <div class="modal-header">
          <h2>ORDER ARCHIVE HISTORY</h2>
          <button class="modal-close" on:click={() => showOrders = false}>&times;</button>
        </div>

        <div class="orders-container">
          {#if orders.length === 0}
            <div class="empty-orders">
              <p>접수된 아카이브 주문 내역이 없습니다.</p>
            </div>
          {:else}
            <div class="orders-list">
              {#each orders as order}
                <div class="order-archive-item">
                  <div class="order-header-line">
                    <span class="order-id">{order.id}</span>
                    <span class="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div class="order-summary-details">
                    <p>수령인: <strong>{order.userName}</strong> | 주소: {order.address}</p>
                    <div class="ordered-books">
                      {#each order.items as book}
                        <span class="mini-book-badge">{book.name} ({book.quantity}권)</span>
                      {/each}
                    </div>
                  </div>
                  <div class="order-footer-line">
                    <span class="order-price">총 결제금액: ₩{order.totalPrice.toLocaleString()}</span>
                    
                    <div class="order-action-buttons">
                      <!-- Error 4 Trigger -->
                      <button 
                        class="detail-check-btn error-port" 
                        on:click={() => fetchOrderDetailsWithBadPort(order.id)}
                      >
                        상세 보기 (포트 검증)
                      </button>

                      <!-- Error 5 Trigger -->
                      <button 
                        class="detail-check-btn error-env" 
                        on:click={() => fetchOrderDetailsWithEnv(order.id)}
                      >
                        인프라 원격 주문 상세 조회
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Inner detailed panel for checking test responses -->
        {#if selectedOrder}
          <div class="inner-test-response success">
            <h3>[포트 9599 검증 결과]</h3>
            <pre>{JSON.stringify(selectedOrder, null, 2)}</pre>
          </div>
        {/if}

        {#if testDownstreamOrder}
          <div class="inner-test-response success">
            <h3>[인프라 API 검증 결과]</h3>
            <pre>{JSON.stringify(testDownstreamOrder, null, 2)}</pre>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Toast system -->
  <div class="toast-container">
    {#each toasts as t}
      <div class="toast-card {t.type}">
        <span class="toast-icon">
          {t.type === 'success' ? '✓' : t.type === 'danger' ? '✗' : '⚠'}
        </span>
        <span class="toast-message">{t.message}</span>
        <button class="toast-close" on:click={() => removeToast(t.id)}>&times;</button>
      </div>
    {/each}
  </div>
</div>
