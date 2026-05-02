document.addEventListener('DOMContentLoaded', () => {
  let menusData = [];
  let cart = {}; // { menuId: quantity }

  // Elements
  const navShop = document.getElementById('nav-shop');
  const navDelivery = document.getElementById('nav-delivery');
  const shopView = document.getElementById('shop-view');
  const deliveryView = document.getElementById('delivery-view');

  const menuList = document.getElementById('menu-list');
  const menuSearch = document.getElementById('menu-search');
  const typeFilter = document.getElementById('type-filter');

  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalPriceEl = document.getElementById('cart-total-price');
  
  const orderForm = document.getElementById('order-form');
  const hackPriceInput = document.getElementById('hack-price');
  const retryOrderBtn = document.getElementById('retry-order-btn');

  const orderListContainer = document.getElementById('order-list');
  const refreshOrdersBtn = document.getElementById('refresh-orders-btn');

  const reviewForm = document.getElementById('review-form');
  const reviewMenuSelect = document.getElementById('review-menu-id');
  const reviewListContainer = document.getElementById('review-list');

  const menuModal = document.getElementById('menu-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.getElementById('close-modal');
  const toast = document.getElementById('toast');

  // Initialization
  function init() {
    fetchMenus();
    fetchOrders();
    fetchReviews();
  }

  // Interaction 1: Fetch and Render Menus
  function fetchMenus() {
    fetch('/api/menus')
      .then(res => res.json())
      .then(data => {
        menusData = data;
        renderMenus(data);
        
        // Populate review select
        reviewMenuSelect.innerHTML = data.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
      });
  }

  function renderMenus(data) {
    menuList.innerHTML = '';
    data.forEach(m => {
      const isLowStock = m.stock <= 5;
      const card = document.createElement('div');
      card.className = 'menu-item';
      card.innerHTML = `
        <div class="menu-header">
          <h3>${m.name}</h3>
          <span class="menu-badge">${m.type}</span>
        </div>
        <div class="menu-price">${m.price.toLocaleString()}원</div>
        <div class="menu-meta">
          <span>🔥 ${m.cal} kcal</span> | 
          <span class="${isLowStock ? 'stock-warning' : ''}">재고: ${m.stock}개</span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn-outline flex-1 detail-btn" data-id="${m.id}">상세</button>
          <button class="btn-primary flex-1 add-cart-btn" data-id="${m.id}">담기</button>
        </div>
      `;
      
      // Interaction 3: Detail Modal
      card.querySelector('.detail-btn').addEventListener('click', () => {
        modalBody.innerHTML = `<h2>${m.name}</h2><p>신선한 재료로 만든 ${m.type} 도시락입니다.</p><p>칼로리: ${m.cal} kcal</p>`;
        menuModal.style.display = 'flex';
      });

      // Interaction 4: Add to Cart
      card.querySelector('.add-cart-btn').addEventListener('click', () => {
        addToCart(m.id);
      });

      menuList.appendChild(card);
    });
  }

  // Interaction 2: Filter Menus
  function applyFilters() {
    const term = menuSearch.value.toLowerCase();
    const type = typeFilter.value;
    
    const filtered = menusData.filter(m => {
      const matchTerm = m.name.toLowerCase().includes(term);
      const matchType = type === '전체' || m.type === type;
      return matchTerm && matchType;
    });
    renderMenus(filtered);
  }

  menuSearch.addEventListener('input', applyFilters);
  typeFilter.addEventListener('change', applyFilters);

  closeModal.addEventListener('click', () => { menuModal.style.display = 'none'; });

  // Cart Logic
  function addToCart(id) {
    if (!cart[id]) cart[id] = 0;
    cart[id]++;
    renderCart();
    showToast('장바구니에 담았습니다.');
  }

  // Interaction 5: Change Cart Quantity
  function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    const itemIds = Object.keys(cart);

    if (itemIds.length === 0) {
      cartItemsContainer.innerHTML = '<p class="text-muted text-center" style="padding:1rem 0;">장바구니가 비어있습니다.</p>';
      cartTotalPriceEl.innerText = '0원';
      return;
    }

    itemIds.forEach(id => {
      if (cart[id] === 0) {
        delete cart[id];
        return;
      }
      const m = menusData.find(x => x.id === id);
      if (!m) return;
      
      total += m.price * cart[id];

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div>
          <div style="font-weight:bold;">${m.name}</div>
          <div class="text-xs text-muted">${m.price.toLocaleString()}원</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="minus-btn" data-id="${id}">-</button>
          <span>${cart[id]}</span>
          <button class="plus-btn" data-id="${id}">+</button>
        </div>
      `;

      div.querySelector('.minus-btn').addEventListener('click', () => { cart[id]--; renderCart(); });
      div.querySelector('.plus-btn').addEventListener('click', () => { cart[id]++; renderCart(); });

      cartItemsContainer.appendChild(div);
    });

    cartTotalPriceEl.innerText = total.toLocaleString() + '원';
    cartTotalPriceEl.dataset.realTotal = total; // Save for actual logic
  }

  // Interaction 6 & 7: Submit Order
  function placeOrder(isRetry = false) {
    const itemIds = Object.keys(cart);
    if (itemIds.length === 0) {
      showToast('장바구니가 비어있습니다.');
      return;
    }

    const address = document.getElementById('order-address').value || '서울시 강남구';
    const realTotal = parseInt(cartTotalPriceEl.dataset.realTotal || 0, 10);
    const hackedTotal = parseInt(hackPriceInput.value, 10);
    
    // Bug 03 Manifestation: If user entered a hack price, send it as totalPrice
    const finalPrice = !isNaN(hackedTotal) ? hackedTotal : realTotal;

    const items = itemIds.map(id => ({ id, quantity: cart[id] }));

    showToast(isRetry ? '네트워크 재시도 중...' : '결제 요청 중...');

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, totalPrice: finalPrice, address })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(`결제 성공! (결제금액: ${data.order.totalPrice}원)`);
        if (!isRetry) {
          cart = {}; // Clear cart only on first success (to simulate retry duplicate)
          renderCart();
          fetchMenus(); // Refresh stock (Bug 01 manifestation)
        }
      } else {
        showToast('결제 실패: ' + data.error);
      }
    });
  }

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    placeOrder(false); // Normal order
  });

  retryOrderBtn.addEventListener('click', () => {
    // Interaction 7 / Bug 02: Simulate clicking retry during network delay
    placeOrder(true);
  });

  // Interaction 8: Load Orders
  function fetchOrders() {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        orderListContainer.innerHTML = '';
        if (data.length === 0) {
          orderListContainer.innerHTML = '<p class="text-muted">주문 내역이 없습니다.</p>';
          return;
        }
        data.forEach(o => {
          const div = document.createElement('div');
          div.className = 'order-card';
          div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
              <strong>주문번호: ${o.id}</strong>
              <span class="text-orange" style="font-weight:bold;">${o.status}</span>
            </div>
            <div class="text-sm text-muted mt-2">결제금액: ${o.totalPrice.toLocaleString()}원</div>
            <div class="text-sm">배송지: ${o.address}</div>
          `;
          orderListContainer.appendChild(div);
        });
      });
  }

  refreshOrdersBtn.addEventListener('click', () => {
    fetchOrders();
    showToast('배송 현황을 갱신했습니다.');
  });

  // Interaction 9 & 10: Reviews
  function fetchReviews() {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        reviewListContainer.innerHTML = '';
        data.forEach(r => {
          const m = menusData.find(x => x.id === r.menuId);
          const menuName = m ? m.name : '알 수 없는 메뉴';
          const div = document.createElement('div');
          div.className = 'review-item';
          div.innerHTML = `
            <div><strong>${r.user}</strong> <span style="color:#FFC107;">${'⭐'.repeat(r.rating)}</span></div>
            <div class="text-xs text-muted mb-2">구매메뉴: ${menuName}</div>
            <p>${r.comment}</p>
          `;
          reviewListContainer.appendChild(div);
        });
      });
  }

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const menuId = reviewMenuSelect.value;
    const rating = parseInt(document.getElementById('review-rating').value, 10);
    const comment = document.getElementById('review-comment').value;

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId, user: 'guest', rating, comment })
    })
    .then(res => res.json())
    .then(() => {
      showToast('리뷰가 등록되었습니다.');
      reviewForm.reset();
      fetchReviews();
    });
  });

  // Interaction 11: Navigation
  navShop.addEventListener('click', () => {
    navShop.classList.add('active'); navDelivery.classList.remove('active');
    shopView.style.display = 'block'; deliveryView.style.display = 'none';
  });

  navDelivery.addEventListener('click', () => {
    navDelivery.classList.add('active'); navShop.classList.remove('active');
    shopView.style.display = 'none'; deliveryView.style.display = 'block';
    fetchOrders(); // Refresh orders on tab enter
  });

  // Toast System
  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
