document.addEventListener('DOMContentLoaded', () => {
  let products = [];
  let cart = [];
  let selectedProduct = null;

  const productGrid = document.getElementById('product-grid');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCountEl = document.getElementById('cart-count');
  const productSearch = document.getElementById('product-search');
  const catFilter = document.getElementById('cat-filter');
  
  const navMall = document.getElementById('nav-mall');
  const navCart = document.getElementById('nav-cart');
  const navQuotes = document.getElementById('nav-quotes');
  
  const mallView = document.getElementById('mall-view');
  const cartView = document.getElementById('cart-view');
  const quotesView = document.getElementById('quotes-view');
  const quoteListEl = document.getElementById('quote-list');

  const modal = document.getElementById('product-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const qtyInput = document.getElementById('modal-qty');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const createQuoteBtn = document.getElementById('create-quote-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchProducts();
  }

  function fetchProducts() {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        products = data;
        renderProducts();
      });
  }

  function renderProducts() {
    productGrid.innerHTML = '';
    const term = productSearch.value.toLowerCase();
    const cat = catFilter.value;

    const filtered = products.filter(p => 
      (cat === 'all' || p.category === cat) &&
      (p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
    );

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <span class="cat">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="price">${p.price.toLocaleString()}원</div>
      `;
      card.onclick = () => openProductModal(p);
      productGrid.appendChild(card);
    });
  }

  function openProductModal(product) {
    selectedProduct = product;
    qtyInput.value = 1;
    modalBody.innerHTML = `
      <h2 style="font-size:1.5rem; font-weight:800;">${product.name}</h2>
      <p class="text-muted mt-2">${product.category} | 재고: ${product.stock}개</p>
      <div class="price mt-4" style="font-size:1.8rem; font-weight:900; color:var(--accent);">${product.price.toLocaleString()}원</div>
      <p class="mt-4 text-sm">※ 법인 회원 및 대량 주문 시 추가 할인이 적용될 수 있습니다.</p>
    `;
    modal.style.display = 'block';
  }

  addToCartBtn.onclick = () => {
    const qty = parseInt(qtyInput.value);
    const existing = cart.find(item => item.productId === selectedProduct.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ productId: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, quantity: qty });
    }
    updateCartUI();
    showToast('상품이 장바구니에 담겼습니다.');
    modal.style.display = 'none';
  };

  function updateCartUI() {
    cartBody.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.name}</strong></td>
        <td>${item.price.toLocaleString()}원</td>
        <td>${item.quantity}</td>
        <td style="font-weight:700;">${itemTotal.toLocaleString()}원</td>
        <td><button onclick="window.removeFromCart(${index})" style="background:none; border:none; color:#E11D48; cursor:pointer;">삭제</button></td>
      `;
      cartBody.appendChild(tr);
    });
    cartTotalEl.innerText = `${total.toLocaleString()}원`;
    cartCountEl.innerText = cart.length;
  }

  window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
  };

  // 견적서 생성 (Bug 03: 금액 조작 취약점)
  createQuoteBtn.onclick = () => {
    if (cart.length === 0) return showToast('장바구니가 비어 있습니다.');

    const realTotal = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
    
    // 보안 취약점 시뮬레이션: 클라이언트가 계산한 금액을 서버로 전송
    // 실제로는 서버에서 품목/수량을 바탕으로 재계산해야 함
    fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, quoteTotal: realTotal, userId: 'GlobalTech_Inc' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('공식 견적서가 발행되었습니다. [견적서 관리]에서 확인하세요.');
        cart = [];
        updateCartUI();
        switchTab(navQuotes, quotesView);
        fetchQuotes();
      }
    });
  };

  // 주문 실행 (Bug 01: 합계 오류, Bug 02: 응답 누락)
  placeOrderBtn.onclick = () => {
    if (cart.length === 0) return showToast('장바구니가 비어 있습니다.');

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, userId: 'GlobalTech_Inc' })
    })
    .then(async res => {
      if (res.status === 201) {
        const data = await res.json();
        // Bug 01: 서버가 잘못 계산한 totalAmount를 보여줌
        showToast(`주문이 완료되었습니다! (최종 결제 금액: ${data.order.totalAmount.toLocaleString()}원)`);
        cart = [];
        updateCartUI();
      } else {
        // Bug 02: 500 에러 시 바디가 없어 구체적인 이유를 모름
        showToast('시스템 오류가 발생하여 주문을 처리할 수 없습니다.');
      }
    });
  };

  function fetchQuotes() {
    // 실제 서버 API에서 가져오는 로직 (생략)
    quoteListEl.innerHTML = `
      <div class="product-card" style="border-left: 4px solid var(--accent);">
        <span class="cat">Pending</span>
        <h3>최근 발행된 견적서</h3>
        <p class="text-sm">기업 특별 할인 단가 적용</p>
        <div class="price mt-3">견적 확인 중...</div>
      </div>
    `;
  }

  productSearch.oninput = () => renderProducts();
  catFilter.onchange = () => renderProducts();

  document.getElementById('qty-plus').onclick = () => qtyInput.value = parseInt(qtyInput.value) + 1;
  document.getElementById('qty-minus').onclick = () => { if(qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1; };

  // 탭 전환
  function switchTab(btn, view) {
    [navMall, navCart, navQuotes].forEach(b => b.classList.remove('active'));
    [mallView, cartView, quotesView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navMall.onclick = () => switchTab(navMall, mallView);
  navCart.onclick = () => switchTab(navCart, cartView);
  navQuotes.onclick = () => { switchTab(navQuotes, quotesView); fetchQuotes(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
