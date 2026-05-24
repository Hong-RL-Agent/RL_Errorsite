document.addEventListener('DOMContentLoaded', () => {
  let items = [];
  let currentStatus = 'all';
  let currentLocation = 'All';
  let activeItemId = null;

  const itemGrid = document.getElementById('item-grid');
  const itemSearch = document.getElementById('item-search');
  const statusFilter = document.getElementById('status-filter');
  const locationFilter = document.getElementById('location-filter');
  
  const navHome = document.getElementById('nav-home');
  const navReport = document.getElementById('nav-report');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const reportView = document.getElementById('report-view');
  const myView = document.getElementById('my-view');

  const submitBtn = document.getElementById('submit-item-btn');
  const resolveBtn = document.getElementById('resolve-btn');
  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    fetchItems();
    fetchLocations();
  }

  // 아이템 목록 조회 (Bug 01: 필터 오류, Bug 02: 등록 직후 이전 데이터 반환 가능)
  function fetchItems() {
    fetch(`/api/items?status=${currentStatus}&location=${currentLocation}`)
      .then(res => res.json())
      .then(data => {
        items = data;
        renderItems();
      });
  }

  function renderItems() {
    itemGrid.innerHTML = '';
    const term = itemSearch.value.toLowerCase();
    const filtered = items.filter(i => i.title.toLowerCase().includes(term));

    filtered.forEach(i => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="card-img">${i.category === 'Electronics' ? '📱' : i.category === 'Wallet' ? '💳' : '🎒'}</div>
        <div class="card-body">
          <div class="card-header">
            <span class="status-badge ${i.status}">${i.status}</span>
            <span class="text-xs text-muted">${i.date}</span>
          </div>
          <h3>${i.title}</h3>
          <p class="location-text">📍 ${i.location}</p>
        </div>
      `;
      card.onclick = () => openItemDetail(i);
      itemGrid.appendChild(card);
    });
  }

  function openItemDetail(item) {
    activeItemId = item.id;
    modalBody.innerHTML = `
      <div style="color:var(--blue); font-weight:800; font-size:0.75rem; margin-bottom:10px;">ITEM DETAILS</div>
      <h2 style="font-size:2rem; font-weight:800; line-height:1.2;">${item.title}</h2>
      <div class="mt-4 p-5" style="background:var(--grey-bg); border-radius:16px;">
        <p><strong>카테고리:</strong> ${item.category}</p>
        <p class="mt-1"><strong>발견/분실 장소:</strong> ${item.location}</p>
        <p class="mt-1"><strong>현재 상태:</strong> ${item.status === 'found' ? '습득 완료' : '분실 신고됨'}</p>
      </div>
      <p class="mt-4 text-sm text-muted">
        분실물 센터(학생회관 2층)에 보관 중이거나 습득자가 보관 중일 수 있습니다. 본인의 물건이 확실한 경우에만 문의해 주세요.
      </p>
    `;
    
    // 타인 게시글도 상태 변경 버튼이 활성화됨 (Bug 03 테스트 포인트)
    resolveBtn.style.display = 'block';
    detailModal.style.display = 'block';
  }

  // 아이템 등록 (Bug 02 연계: 등록 성공 후 fetch를 호출해도 서버가 이전 데이터를 줄 수 있음)
  submitBtn.onclick = () => {
    const title = document.getElementById('new-title').value;
    const category = document.getElementById('new-category').value;
    const location = document.getElementById('new-location').value;
    const status = document.querySelector('input[name="new-status"]:checked').value;

    if (!title) return showToast('제목을 입력해 주세요.');

    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, location, status, userId: 'user_A' })
    })
    .then(res => res.json())
    .then(data => {
      showToast('게시글이 성공적으로 등록되었습니다.');
      // 폼 초기화 및 홈으로 이동
      document.getElementById('new-title').value = '';
      switchTab(navHome, homeView);
      // Bug 02 발생: 여기서 fetchItems를 호출해도 서버가 stale 데이터를 주면 등록한 물건이 안 보임
      fetchItems();
    });
  };

  // 상태 변경 (Bug 03: 권한 검증 누락으로 타인 게시글도 조작 가능)
  resolveBtn.onclick = () => {
    if (!activeItemId) return;

    fetch(`/api/items/${activeItemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    })
    .then(res => res.json())
    .then(data => {
      showToast('상태가 변경되었습니다.');
      detailModal.style.display = 'none';
      fetchItems();
    });
  };

  function fetchLocations() {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        data.forEach(loc => {
          const opt1 = new Option(loc, loc);
          const opt2 = new Option(loc, loc);
          locationFilter.add(opt1);
          document.getElementById('new-location').add(opt2);
        });
      });
  }

  itemSearch.oninput = () => renderItems();
  statusFilter.onchange = (e) => {
    currentStatus = e.target.value;
    fetchItems();
  };
  locationFilter.onchange = (e) => {
    currentLocation = e.target.value;
    fetchItems();
  };

  function switchTab(btn, view) {
    [navHome, navReport, navMy].forEach(b => b.classList.remove('active'));
    [homeView, reportView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === homeView) fetchItems();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navReport.onclick = () => switchTab(navReport, reportView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
