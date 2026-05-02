document.addEventListener('DOMContentLoaded', () => {
  let produceData = [];
  let groupData = [];
  let cart = [];
  let currentGroupOrder = null;

  const produceGrid = document.getElementById('produce-grid');
  const searchInput = document.getElementById('search-input');
  const regionFilter = document.getElementById('region-filter');
  
  const navHome = document.getElementById('nav-home');
  const navGroup = document.getElementById('nav-group');
  const navCart = document.getElementById('nav-cart');
  const homeView = document.getElementById('home-view');
  const groupView = document.getElementById('group-view');
  const cartView = document.getElementById('cart-view');
  
  const cartCountEl = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('total-price');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  const groupListEl = document.getElementById('group-order-list');
  const modal = document.getElementById('group-modal');
  const closeBtn = document.querySelector('.close');
  const joinGroupBtn = document.getElementById('join-group-btn');
  const qtyInput = document.getElementById('qty-input');
  const stockWarning = document.getElementById('stock-warning');

  const testDisclosureBtn = document.getElementById('test-disclosure-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchProduce();
    fetchGroupOrders();
  }

  function fetchProduce() {
    fetch('/api/produce')
      .then(res => res.json())
      .then(data => {
        produceData = data;
        renderProduce(data);
      });
  }

  function renderProduce(data) {
    produceGrid.innerHTML = '';
    data.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <div class="card-body">
          <span class="region-tag">${p.region}</span>
          <h3>${p.name}</h3>
          <p class="price">${p.price.toLocaleString()}원</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <span class="text-xs">⭐ ${p.rating}</span>
            <button class="btn-primary btn-sm" onclick="addToCart('${p.id}')">담기</button>
          </div>
        </div>
      `;
      produceGrid.appendChild(card);
    });
  }

  function fetchGroupOrders() {
    fetch('/api/group-orders')
      .then(res => res.json())
      .then(data => {
        groupData = data;
        renderGroups(data);
      });
  }

  function renderGroups(data) {
    groupListEl.innerHTML = '';
    data.forEach(go => {
      const produce = produceData.find(p => p.id === go.produceId) || { name: '상품 정보 없음' };
      const percent = (go.currentQty / go.targetQty) * 100;
      const div = document.createElement('div');
      div.className = 'group-card';
      div.innerHTML = `
        <div>
          <h3 style="font-family:Jua, sans-serif;">${go.title}</h3>
          <p class="text-muted text-xs">${produce.name}</p>
          <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
          <span class="text-xs">남은 재고: <strong>${go.remainingStock}개</strong></span>
        </div>
        <button class="btn-primary" onclick="openGroupModal('${go.id}')">참여하기</button>
      `;
      groupListEl.appendChild(div);
    });
  }

  window.openGroupModal = (id) => {
    currentGroupOrder = groupData.find(g => g.id === id);
    document.getElementById('modal-title').innerText = currentGroupOrder.title;
    document.getElementById('modal-desc').innerText = `현재 ${currentGroupOrder.currentQty}개 모임 (목표: ${currentGroupOrder.targetQty}개)`;
    qtyInput.value = 1;
    stockWarning.innerText = '';
    modal.style.display = 'block';
  };

  // 공동구매 참여 (Bug 01: 재고 검증 누락)
  joinGroupBtn.onclick = () => {
    const qty = parseInt(qtyInput.value);
    
    // Bug 01 시연을 위해 클라이언트에서 재고 초과 여부를 체크만 하고 경고만 띄움 (서버가 막아야 함)
    if(qty > currentGroupOrder.remainingStock) {
      stockWarning.innerText = `⚠️ 경고: 남은 재고(${currentGroupOrder.remainingStock})보다 많은 수량을 선택하셨습니다. 서버에서 검증이 되는지 확인해보세요.`;
    }

    fetch('/api/group-orders/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupOrderId: currentGroupOrder.id, qty })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        showToast(`공동구매 참여 완료! (남은 재고: ${data.remaining})`);
        modal.style.display = 'none';
        fetchGroupOrders();
      }
    });
  };

  document.getElementById('qty-plus').onclick = () => { qtyInput.value = parseInt(qtyInput.value) + 1; };
  document.getElementById('qty-minus').onclick = () => { if(qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1; };

  window.addToCart = (id) => {
    const item = produceData.find(p => p.id === id);
    cart.push(item);
    updateCartUI();
    showToast(`${item.name} 장바구니에 담았습니다.`);
  };

  function updateCartUI() {
    cartCountEl.innerText = cart.length;
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `<span>${item.name}</span> <span>${item.price.toLocaleString()}원</span>`;
      cartItemsEl.appendChild(div);
    });
    totalPriceEl.innerText = total.toLocaleString();
  }

  // 주문하기 (Bug 02: 응답 포맷 오류)
  checkoutBtn.onclick = () => {
    if(cart.length === 0) return showToast('장바구니가 비어있습니다.');

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    })
    .then(res => {
      // Bug 02: 서버가 HTML을 보냄 -> res.json()에서 에러 발생
      return res.json();
    })
    .then(data => {
      showToast('주문 성공!');
      cart = [];
      updateCartUI();
    })
    .catch(err => {
      showToast(`에러 발생: 서버 응답이 JSON이 아닙니다. (Bug 02)`);
      console.error('Parsing error (Bug 02):', err);
    });
  };

  // 보안 테스트 (Bug 03: 정보 노출)
  testDisclosureBtn.onclick = () => {
    fetch('/api/produce/error-test')
      .then(res => res.json())
      .then(data => {
        alert(`[정보 노출 탐지] \n에러: ${data.error} \n서버 경로: ${data.internalPath} \n변수명: ${data.dataSource}`);
      });
  };

  // 필터링
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const region = regionFilter.value;
    const filtered = produceData.filter(p => {
      const matchTerm = p.name.toLowerCase().includes(term);
      const matchRegion = region === 'all' || p.region.includes(region);
      return matchTerm && matchRegion;
    });
    renderProduce(filtered);
  }

  searchInput.oninput = applyFilters;
  regionFilter.onchange = applyFilters;

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navGroup, navCart].forEach(b => b.classList.remove('active'));
    [homeView, groupView, cartView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navGroup.onclick = () => switchTab(navGroup, groupView);
  navCart.onclick = () => switchTab(navCart, cartView);

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
