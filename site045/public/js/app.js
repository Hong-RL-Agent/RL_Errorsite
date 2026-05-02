document.addEventListener('DOMContentLoaded', () => {
  let plants = [];
  let cart = [];
  let currentDiff = 'all';

  const plantGrid = document.getElementById('plant-grid');
  const plantSearch = document.getElementById('plant-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cartCountEl = document.getElementById('cart-count');
  
  const navHome = document.getElementById('nav-home');
  const navCart = document.getElementById('nav-cart');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const cartView = document.getElementById('cart-view');
  const myView = document.getElementById('my-view');

  const cartListEl = document.getElementById('cart-list');
  const orderListEl = document.getElementById('order-list');
  const totalPriceEl = document.getElementById('total-price');
  const finalPriceEl = document.getElementById('final-price');
  
  const plantModal = document.getElementById('plant-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const checkoutBtn = document.getElementById('checkout-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchPlants();
  }

  function fetchPlants() {
    fetch('/api/plants')
      .then(res => res.json())
      .then(data => {
        plants = data;
        renderPlants();
      });
  }

  function renderPlants() {
    plantGrid.innerHTML = '';
    const term = plantSearch.value.toLowerCase();
    
    let filtered = plants.filter(p => 
      (currentDiff === 'all' || p.difficulty === currentDiff) &&
      (p.name.toLowerCase().includes(term))
    );

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'plant-card';
      card.innerHTML = `
        <div class="plant-thumb">🌿</div>
        <span class="diff-badge ${p.difficulty}">${p.difficulty}</span>
        <h3>${p.name}</h3>
        <p class="price">₩${p.price.toLocaleString()}</p>
        <p class="text-xs text-muted mt-2">현재 재고: ${p.stock}개</p>
        <button class="btn-green w-full mt-4" onclick="event.stopPropagation(); addToCart('${p.id}')">장바구니 담기</button>
      `;
      card.onclick = () => openPlantModal(p);
      plantGrid.appendChild(card);
    });
  }

  function openPlantModal(p) {
    modalBody.innerHTML = `
      <div class="plant-thumb" style="font-size:6rem;">🪴</div>
      <h2 class="mt-4">${p.name}</h2>
      <div class="mt-4" style="background:var(--green-light); padding:25px; border-radius:15px;">
        <p><strong>가격:</strong> ₩${p.price.toLocaleString()}</p>
        <p class="mt-2"><strong>관리 난이도:</strong> ${p.difficulty}</p>
        <p class="mt-2"><strong>재고 수량:</strong> ${p.stock}개</p>
      </div>
      <p class="mt-4 text-sm text-muted">집안 어디에 두어도 잘 어울리는 반려 식물입니다. 적절한 채광과 통풍이 중요합니다.</p>
    `;
    plantModal.style.display = 'block';
  }

  window.addToCart = (id) => {
    const plant = plants.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...plant, quantity: 1 });
    }
    updateCartCount();
    showToast(`${plant.name} 장바구니에 담겼습니다.`);
  };

  function updateCartCount() {
    const count = cart.reduce((acc, c) => acc + c.quantity, 0);
    cartCountEl.innerText = count;
  }

  function renderCart() {
    cartListEl.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
      cartListEl.innerHTML = '<p class="text-muted p-5 text-center">장바구니가 비어 있습니다.</p>';
    }

    cart.forEach(c => {
      const itemTotal = c.price * c.quantity;
      total += itemTotal;
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong>${c.name}</strong>
          <p class="text-sm text-muted">수량: ${c.quantity}개</p>
        </div>
        <div class="font-bold">₩${itemTotal.toLocaleString()}</div>
      `;
      cartListEl.appendChild(div);
    });

    totalPriceEl.innerText = `₩${total.toLocaleString()}`;
    const final = Math.max(0, total - 5000);
    finalPriceEl.innerText = `₩${final.toLocaleString()}`;
    finalPriceEl.dataset.value = final;
  }

  // 주문 결제 (Bug 01: 재고 체크 미흡, Bug 02: Content-Type 오류, Bug 03: 결제 금액 조작)
  checkoutBtn.onclick = () => {
    if (cart.length === 0) return showToast('장바구니가 비어 있습니다.');

    const finalPrice = parseInt(finalPriceEl.dataset.value);

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, discountedTotal: finalPrice, userId: 'user_green' })
    })
    .then(res => {
      // Bug 02: 서버가 text/plain으로 보내기 때문에 res.json()에서 에러가 날 수 있음
      const contentType = res.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return res.json();
      } else {
        // 수동 파싱 시도 (Bug 02 대응용)
        return res.text().then(text => JSON.parse(text));
      }
    })
    .then(data => {
      if (data.success) {
        showToast('주문이 완료되었습니다. 예쁘게 키워주세요!');
        cart = [];
        updateCartCount();
        fetchPlants(); // 재고 업데이트 확인 (Bug 01 확인용)
        switchTab(navMy, myView);
        fetchMyOrders();
      }
    })
    .catch(err => {
      console.error('Order Error:', err);
      showToast('주문 처리 중 알 수 없는 응답 형식이 수신되었습니다.');
    });
  };

  function fetchMyOrders() {
    fetch('/api/orders/user_green')
      .then(res => res.json())
      .then(data => {
        orderListEl.innerHTML = '';
        if (data.length === 0) {
          orderListEl.innerHTML = '<p class="text-muted p-5 text-center">주문 내역이 없습니다.</p>';
          return;
        }
        data.forEach(ord => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>주문 일시: ${new Date(ord.date).toLocaleString()}</strong>
              <p class="text-sm text-muted">${ord.items.length}종의 식물</p>
            </div>
            <div class="font-bold text-green">₩${ord.totalPrice.toLocaleString()}</div>
          `;
          orderListEl.appendChild(div);
        });
      });
  }

  plantSearch.oninput = () => renderPlants();
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiff = btn.dataset.diff;
      renderPlants();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navCart, navMy].forEach(b => b.classList.remove('active'));
    [homeView, cartView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === cartView) renderCart();
    if (view === myView) fetchMyOrders();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navCart.onclick = () => switchTab(navCart, cartView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => plantModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == plantModal) plantModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
