document.addEventListener('DOMContentLoaded', () => {
  let menuData = [];
  let cart = [];
  let currentMenuItem = null;
  let currentQty = 1;
  let myOrders = [];

  const menuList = document.getElementById('menu-list');
  const recommendList = document.getElementById('recommend-list');
  const categoryFilter = document.getElementById('category-filter');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  const orderBtn = document.getElementById('order-btn');
  
  const modal = document.getElementById('menu-modal');
  const closeBtn = document.querySelector('.close');
  const addCartBtn = document.getElementById('add-to-cart');
  const qtyVal = document.getElementById('qty-val');

  const navMenu = document.getElementById('nav-menu');
  const navQueue = document.getElementById('nav-queue');
  const navStatus = document.getElementById('nav-status');
  const menuView = document.getElementById('menu-view');
  const queueView = document.getElementById('queue-view');
  const statusView = document.getElementById('status-view');
  const queueList = document.getElementById('queue-list');
  const refreshQueueBtn = document.getElementById('refresh-queue');
  const myOrderStatus = document.getElementById('my-order-status');

  const pointsBadge = document.querySelector('.points');
  const userPointsEl = document.getElementById('user-points');

  function init() {
    fetchMenu();
    fetchMembership('member_123');
  }

  function fetchMenu() {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        menuData = data;
        renderMenu(data);
        renderRecommend(data.slice(0, 3));
      });
  }

  function renderMenu(data) {
    menuList.innerHTML = '';
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p class="price">${item.price.toLocaleString()}원</p>
      `;
      card.onclick = () => openModal(item);
      menuList.appendChild(card);
    });
  }

  function renderRecommend(data) {
    recommendList.innerHTML = '';
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'recommend-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div style="font-size:0.85rem; font-weight:600;">${item.name}</div>
      `;
      card.onclick = () => openModal(item);
      recommendList.appendChild(card);
    });
  }

  categoryFilter.addEventListener('change', () => {
    const cat = categoryFilter.value;
    const filtered = cat === 'all' ? menuData : menuData.filter(m => m.category === cat);
    renderMenu(filtered);
  });

  function openModal(item) {
    currentMenuItem = item;
    currentQty = 1;
    qtyVal.innerText = currentQty;
    
    document.getElementById('modal-img').src = item.image;
    document.getElementById('modal-name').innerText = item.name;
    document.getElementById('modal-price').innerText = `${item.price.toLocaleString()}원`;
    
    modal.style.display = 'block';
  }

  document.getElementById('qty-plus').onclick = () => { currentQty++; qtyVal.innerText = currentQty; };
  document.getElementById('qty-minus').onclick = () => { if(currentQty > 1) currentQty--; qtyVal.innerText = currentQty; };

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.onclick = () => {
      btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  addCartBtn.onclick = () => {
    const tempOption = document.querySelector('.option-btn.active').dataset.val;
    cart.push({ ...currentMenuItem, quantity: currentQty, option: tempOption });
    updateCartUI();
    modal.style.display = 'none';
    showToast('장바구니에 담겼습니다.');
  };

  function updateCartUI() {
    cartCount.innerText = cart.length;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerText = `${total.toLocaleString()}원`;
  }

  // 주문 제출 (Bug 01, 02)
  orderBtn.onclick = () => {
    if(cart.length === 0) return showToast('장바구니가 비어있습니다.');
    
    // Bug 02: 중복 제출 방지 로직 없음 (사용자 광클 테스트 가능)
    
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart })
    })
    .then(res => {
      if(!res.ok) return res.json().then(e => { throw new Error(e.error); });
      return res.json();
    })
    .then(data => {
      if(data.success) {
        showToast(`주문 완료! 대기번호: ${data.order.id}`);
        myOrders.push(data.order);
        cart = [];
        updateCartUI();
        renderMyStatus();
      }
    })
    .catch(err => {
      showToast(`주문 실패: ${err.message}`);
    });
  };

  function renderMyStatus() {
    if(myOrders.length === 0) {
      myOrderStatus.innerHTML = '<p class="text-muted">현재 진행 중인 주문이 없습니다.</p>';
      return;
    }
    myOrderStatus.innerHTML = '';
    myOrders.forEach(o => {
      const div = document.createElement('div');
      div.className = 'queue-item';
      div.innerHTML = `
        <div>
          <strong>No.${o.id}</strong>
          <div class="text-muted" style="font-size:0.8rem;">${o.items.length}개 메뉴</div>
        </div>
        <span class="badge" style="color:var(--accent); font-weight:700;">${o.status === 'preparing' ? '준비 중' : '완료'}</span>
      `;
      myOrderStatus.appendChild(div);
    });
  }

  function fetchQueue() {
    fetch('/api/queue')
      .then(res => res.json())
      .then(data => {
        queueList.innerHTML = '';
        if(data.length === 0) {
          queueList.innerHTML = '<p class="text-center text-muted" style="padding:20px;">대기 중인 주문이 없습니다.</p>';
          return;
        }
        data.forEach(q => {
          const div = document.createElement('div');
          div.className = 'queue-item';
          div.innerHTML = `<span>대기번호 <strong>${q.id}</strong></span> <span>${q.time}</span>`;
          queueList.appendChild(div);
        });
      });
  }

  // 멤버십 포인트 조회 (Bug 03)
  function fetchMembership(id) {
    fetch(`/api/membership/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.memberId) {
          userPointsEl.innerText = data.points.toLocaleString();
        }
      });
  }

  pointsBadge.onclick = () => {
    // Bug 03 테스트: 타인의 포인트를 조회해보는 도구
    const targetId = prompt('조회할 회원 ID를 입력하세요 (예: member_999)', 'member_999');
    if(targetId) fetchMembership(targetId);
  };

  // 탭 전환
  navMenu.onclick = () => { switchTab(navMenu, menuView); };
  navQueue.onclick = () => { switchTab(navQueue, queueView); fetchQueue(); };
  navStatus.onclick = () => { switchTab(navStatus, statusView); renderMyStatus(); };
  refreshQueueBtn.onclick = () => { fetchQueue(); showToast('대기열 갱신됨'); };

  function switchTab(btn, view) {
    [navMenu, navQueue, navStatus].forEach(b => b.classList.remove('active'));
    [menuView, queueView, statusView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  init();
});
