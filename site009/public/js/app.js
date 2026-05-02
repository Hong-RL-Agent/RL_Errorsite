document.addEventListener('DOMContentLoaded', () => {
  let itemsData = [];
  let cart = {}; // { itemId: quantity }
  let appliedDiscount = 0;

  // Nav Elements
  const navShop = document.getElementById('nav-shop');
  const navBrand = document.getElementById('nav-brand');
  const navOrders = document.getElementById('nav-orders');

  const shopView = document.getElementById('shop-view');
  const brandView = document.getElementById('brand-view');
  const ordersView = document.getElementById('orders-view');

  // Elements
  const itemGrid = document.getElementById('item-grid');
  const searchInput = document.getElementById('search-item');
  const brandFilter = document.getElementById('brand-filter');
  const priceSort = document.getElementById('price-sort');

  const cartItemsContainer = document.getElementById('cart-items');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartDiscountEl = document.getElementById('cart-discount');
  const cartTotalEl = document.getElementById('cart-total');

  const couponInput = document.getElementById('coupon-code');
  const applyCouponBtn = document.getElementById('apply-coupon-btn');

  const checkoutForm = document.getElementById('checkout-form');
  const hackPriceInput = document.getElementById('hack-price');
  const checkoutError = document.getElementById('checkout-error');

  const orderList = document.getElementById('order-list');
  const refreshOrdersBtn = document.getElementById('refresh-orders-btn');

  const toast = document.getElementById('toast');

  function init() {
    fetchItems();
  }

  // 1. Fetch Items
  function fetchItems() {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        itemsData = data;
        renderItems(itemsData);
      });
  }

  function renderItems(data) {
    itemGrid.innerHTML = '';
    if (data.length === 0) {
      itemGrid.innerHTML = '<p class="text-muted">상품을 찾을 수 없습니다.</p>';
      return;
    }
    
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <img src="${item.image}" class="item-img" alt="${item.name}">
        <div class="item-info">
          <div class="item-brand">${item.brand}</div>
          <div class="item-name">${item.name}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.8rem;">
            <div class="item-price">${item.price.toLocaleString()}원</div>
            <button class="btn-outline btn-sm add-cart-btn" data-id="${item.id}">담기</button>
          </div>
        </div>
      `;
      
      // 4. Add to cart
      card.querySelector('.add-cart-btn').addEventListener('click', () => {
        addToCart(item.id);
      });

      itemGrid.appendChild(card);
    });
  }

  // 2 & 3. Filter and Sort
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const brand = brandFilter.value;
    const sort = priceSort.value;

    let filtered = itemsData.filter(i => {
      const matchTerm = i.name.toLowerCase().includes(term);
      const matchBrand = brand === 'all' || i.brand === brand;
      return matchTerm && matchBrand;
    });

    if (sort === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else {
      filtered.sort((a, b) => b.price - a.price);
    }

    renderItems(filtered);
  }

  searchInput.addEventListener('input', applyFilters);
  brandFilter.addEventListener('change', applyFilters);
  priceSort.addEventListener('change', applyFilters);

  // Cart Logic
  function addToCart(id) {
    if (!cart[id]) cart[id] = 0;
    cart[id]++;
    renderCart();
    showToast('장바구니에 상품을 담았습니다.');
  }

  // 5. Change Cart Quantity
  function renderCart() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    const itemIds = Object.keys(cart);

    if (itemIds.length === 0) {
      cartItemsContainer.innerHTML = '<p class="text-center text-muted" style="padding: 1rem 0;">장바구니가 비어있습니다.</p>';
      updateCartSummary(0);
      return;
    }

    itemIds.forEach(id => {
      if (cart[id] === 0) {
        delete cart[id];
        return;
      }
      const item = itemsData.find(i => i.id === id);
      if (!item) return;

      subtotal += item.price * cart[id];

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div>
          <div style="font-size:0.9rem; font-weight:bold;">${item.name}</div>
          <div class="text-xs text-muted">${item.price.toLocaleString()}원</div>
        </div>
        <div class="cart-qty">
          <button class="btn-icon minus-btn" data-id="${id}">-</button>
          <span>${cart[id]}</span>
          <button class="btn-icon plus-btn" data-id="${id}">+</button>
        </div>
      `;

      div.querySelector('.minus-btn').addEventListener('click', () => { cart[id]--; renderCart(); });
      div.querySelector('.plus-btn').addEventListener('click', () => { cart[id]++; renderCart(); });

      cartItemsContainer.appendChild(div);
    });

    updateCartSummary(subtotal);
  }

  function updateCartSummary(subtotal) {
    cartSubtotalEl.innerText = subtotal.toLocaleString() + '원';
    
    // Ensure discount doesn't exceed subtotal
    const actualDiscount = Math.min(appliedDiscount, subtotal);
    cartDiscountEl.innerText = '-' + actualDiscount.toLocaleString() + '원';
    
    const total = Math.max(0, subtotal - actualDiscount);
    cartTotalEl.innerText = total.toLocaleString() + '원';
    cartTotalEl.dataset.realTotal = total;
  }

  // 6. Apply Coupon (Triggers Bug 01)
  applyCouponBtn.addEventListener('click', () => {
    const code = couponInput.value.trim();
    if (!code) return;

    fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        appliedDiscount = data.discount;
        renderCart(); // Re-calculate
        showToast(`${code} 쿠폰 적용 성공! (${data.discount}원 할인)`);
        // Bug 01 manifestation: Expired coupon 'ECO2025' works
      } else {
        showToast('쿠폰 적용 실패: ' + data.error);
        appliedDiscount = 0;
        renderCart();
      }
    });
  });

  // 7. Checkout (Triggers Bug 02 & Bug 03)
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkoutError.style.display = 'none';

    const itemIds = Object.keys(cart);
    if (itemIds.length === 0) {
      showToast('장바구니가 비어있습니다.');
      return;
    }

    const items = itemIds.map(id => ({ id, quantity: cart[id] }));
    const realTotal = parseInt(cartTotalEl.dataset.realTotal || 0, 10);
    const hackedPrice = parseInt(hackPriceInput.value, 10);
    const address = document.getElementById('order-address').value;

    // Bug 03 manifestation: Use hacked price if provided
    const finalPrice = !isNaN(hackedPrice) ? hackedPrice : realTotal;

    showToast('결제 진행 중...');

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, price: finalPrice, address })
    })
    .then(res => {
      // Bug 02 manifestation: if res is 500 but no body
      if (!res.ok) {
        if (res.status === 500) {
           return res.text().then(text => {
             // text is empty, so we don't have an error message
             throw new Error(text || 'undefined');
           });
        }
        throw new Error('Network error');
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        showToast(`결제 완료! (영수증 금액: ${data.order.totalPrice}원)`);
        cart = {};
        appliedDiscount = 0;
        couponInput.value = '';
        hackPriceInput.value = '';
        renderCart();
      }
    })
    .catch(err => {
      // Bug 02 display
      checkoutError.innerText = `[결제 오류] 원인을 파악할 수 없습니다. 내용: ${err.message}`;
      checkoutError.style.display = 'block';
    });
  });

  // 8 & 9. Fetch Orders
  function fetchOrders() {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        orderList.innerHTML = '';
        if (data.length === 0) {
          orderList.innerHTML = '<p class="text-muted">주문 내역이 없습니다.</p>';
          return;
        }
        data.forEach(o => {
          const div = document.createElement('div');
          div.className = 'order-card';
          div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
              <strong class="text-olive">${o.id}</strong>
              <span class="text-xs text-muted">${new Date(o.date).toLocaleDateString()}</span>
            </div>
            <div>결제 금액: <strong>${o.totalPrice.toLocaleString()}원</strong></div>
            <div class="text-sm mt-1">배송지: ${o.address}</div>
          `;
          orderList.appendChild(div);
        });
      });
  }

  refreshOrdersBtn.addEventListener('click', () => {
    fetchOrders();
    showToast('주문 내역을 갱신했습니다.');
  });

  // 10. Navigation
  function switchTab(navBtn, viewEl) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    navBtn.classList.add('active');
    
    [shopView, brandView, ordersView].forEach(v => v.style.display = 'none');
    viewEl.style.display = 'block';
  }

  navShop.addEventListener('click', () => switchTab(navShop, shopView));
  navBrand.addEventListener('click', () => switchTab(navBrand, brandView));
  navOrders.addEventListener('click', () => {
    switchTab(navOrders, ordersView);
    fetchOrders();
  });

  // Toast
  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
