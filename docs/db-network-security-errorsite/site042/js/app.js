document.addEventListener('DOMContentLoaded', () => {
  let items = [];
  let currentCat = 'all';

  const itemGrid = document.getElementById('item-grid');
  const itemSearch = document.getElementById('item-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navHome = document.getElementById('nav-home');
  const navCustom = document.getElementById('nav-custom');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const customView = document.getElementById('custom-view');
  const myView = document.getElementById('my-view');

  const orderListEl = document.getElementById('order-list');
  const itemModal = document.getElementById('item-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const submitCustomBtn = document.getElementById('submit-custom-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchItems();
  }

  function fetchItems() {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        items = data;
        renderItems();
      });
  }

  function renderItems() {
    itemGrid.innerHTML = '';
    const term = itemSearch.value.toLowerCase();
    
    let filtered = items.filter(i => 
      (currentCat === 'all' || i.category === currentCat) &&
      (i.title.toLowerCase().includes(term))
    );

    filtered.forEach(i => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-thumb">${i.category === 'Stationery' ? '📚' : (i.category === 'Living' ? '🍵' : '👜')}</div>
        <h3>${i.title}</h3>
        <p class="price">₩${i.price.toLocaleString()}</p>
      `;
      card.onclick = () => openItemModal(i.id);
      itemGrid.appendChild(card);
    });
  }

  // 작품 상세 조회 (Bug 03: 작가 민감 정보 노출)
  function openItemModal(id) {
    modalBody.innerHTML = '<p>데이터를 불러오는 중...</p>';
    itemModal.style.display = 'block';

    fetch(`/api/items/${id}`)
      .then(res => res.json())
      .then(data => {
        modalBody.innerHTML = `
          <h2 style="font-family:'Marcellus';">${data.title}</h2>
          <div class="mt-4" style="background:var(--beige); padding:25px; border-radius:15px;">
            <p><strong>가격:</strong> ₩${data.price.toLocaleString()}</p>
            <p class="mt-2"><strong>작가:</strong> ${data.artist.name}</p>
            <p class="mt-2"><strong>카테고리:</strong> ${data.category}</p>
          </div>
          <div class="mt-4" style="border-top:1px solid var(--border); padding-top:20px;">
            <p class="text-sm"><strong>작가 정산 정보 (보안 주의):</strong> ${data.artist.bankAccount || '없음'}</p>
            <p class="text-sm mt-1"><strong>내부 메모:</strong> ${data.artist.internalNote || '없음'}</p>
          </div>
        `;
      });
  }

  // 주문 제작 요청 (Bug 01: 상태 오류, Bug 02: HTTP 상태 코드 오류)
  submitCustomBtn.onclick = () => {
    const artistId = document.getElementById('artist-select').value;
    const description = document.getElementById('order-desc').value;

    fetch('/api/custom-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_craft', artistId, description })
    })
    .then(res => {
      // Bug 02: 실패해도 200 OK가 오기 때문에 res.ok가 항상 true일 수 있음
      return res.json();
    })
    .then(data => {
      if (data.success) {
        showToast('작가님께 주문 제작 요청이 전달되었습니다.');
        document.getElementById('order-desc').value = '';
        switchTab(navMy, myView);
        fetchMyOrders();
      } else {
        // Bug 02의 결과로 여기서 수동 분기 처리해야 함
        showToast(`요청 실패: ${data.message}`);
      }
    });
  };

  function fetchMyOrders() {
    fetch('/api/custom-orders/user_craft')
      .then(res => res.json())
      .then(data => {
        orderListEl.innerHTML = '';
        if (data.length === 0) {
          orderListEl.innerHTML = '<p class="text-muted p-4">주문 내역이 없습니다.</p>';
          return;
        }
        data.forEach(ord => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>주문 번호: ${ord.id}</strong>
              <p class="text-sm text-muted">${ord.description.substring(0, 20)}...</p>
            </div>
            <span class="tag" style="background:var(--beige); padding:5px 12px; border-radius:20px; font-weight:700;">${ord.status}</span>
          `;
          orderListEl.appendChild(div);
        });
      });
  }

  itemSearch.oninput = () => renderItems();

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      renderItems();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navCustom, navMy].forEach(b => b.classList.remove('active'));
    [homeView, customView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyOrders();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navCustom.onclick = () => switchTab(navCustom, customView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => itemModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == itemModal) itemModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
