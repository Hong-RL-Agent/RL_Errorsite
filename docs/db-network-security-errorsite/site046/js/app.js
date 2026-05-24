document.addEventListener('DOMContentLoaded', () => {
  let tools = [];
  let currentCat = 'all';
  let activeToolId = null;

  const toolGrid = document.getElementById('tool-grid');
  const toolSearch = document.getElementById('tool-search');
  const catTabs = document.querySelectorAll('.cat-tab');
  
  const navHome = document.getElementById('nav-home');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const myView = document.getElementById('my-view');

  const rentalListEl = document.getElementById('rental-list');
  const toolModal = document.getElementById('tool-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  
  const detailModal = document.getElementById('detail-modal');
  const detailBody = document.getElementById('detail-body');
  const closeDetailBtn = document.querySelector('.close-detail');

  const confirmBookingBtn = document.getElementById('confirm-booking-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchTools();
  }

  function fetchTools() {
    fetch('/api/tools')
      .then(res => res.json())
      .then(data => {
        tools = data;
        renderTools();
      });
  }

  function renderTools() {
    toolGrid.innerHTML = '';
    const term = toolSearch.value.toLowerCase();
    
    let filtered = tools.filter(t => 
      (currentCat === 'all' || t.category === currentCat) &&
      (t.name.toLowerCase().includes(term))
    );

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.innerHTML = `
        <span style="font-size:0.8rem; color:var(--orange); font-weight:800;">${t.category}</span>
        <h3 class="mt-2">${t.name}</h3>
        <p class="price-info">₩${t.pricePerDay.toLocaleString()} / 일</p>
        <p class="specs">${t.specs}</p>
      `;
      card.onclick = () => openToolModal(t);
      toolGrid.appendChild(card);
    });
  }

  function openToolModal(tool) {
    activeToolId = tool.id;
    modalBody.innerHTML = `
      <h2 style="font-family:'Barlow Condensed'; font-size:2.5rem; border-bottom:2px solid var(--orange); padding-bottom:10px;">TOOL RESERVATION</h2>
      <div class="mt-4">
        <p style="font-size:1.4rem; font-weight:800;">${tool.name}</p>
        <p class="text-orange font-bold mt-1">₩${tool.pricePerDay.toLocaleString()} / DAY</p>
        <div class="mt-3 p-4" style="background:var(--black); border:1px solid var(--grey); border-radius:4px;">
          <p class="text-sm"><strong>상세 스펙:</strong> ${tool.specs}</p>
          <p class="text-sm mt-1"><strong>보증금:</strong> ₩50,000 (반납 시 환급)</p>
        </div>
      </div>
    `;
    toolModal.style.display = 'block';
  }

  // 대여 예약 확정 (Bug 01: 중복 기간 허용, Bug 02: endDate 누락 허용)
  confirmBookingBtn.onclick = () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    fetch('/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_A', toolId: activeToolId, startDate, endDate })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('공구 대여 예약이 확정되었습니다. 지점을 방문해 주세요.');
        toolModal.style.display = 'none';
        switchTab(navMy, myView);
        fetchMyHistory();
      } else {
        showToast(`예약 실패: ${data.error}`);
      }
    });
  };

  function fetchMyHistory() {
    fetch('/api/history/user_A')
      .then(res => res.json())
      .then(data => {
        rentalListEl.innerHTML = '';
        if (data.length === 0) {
          rentalListEl.innerHTML = '<p class="text-muted p-4">대여 기록이 없습니다.</p>';
          return;
        }
        data.forEach(rent => {
          const tool = tools.find(t => t.id === rent.toolId) || { name: '공구' };
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>${tool.name}</strong>
              <p class="text-sm text-muted">${rent.startDate} ~ ${rent.endDate || '반납일 미정'}</p>
            </div>
            <button onclick="viewRentalDetail('${rent.id}')" style="background:none; border:none; color:var(--orange); font-weight:800; cursor:pointer;">DETAILS</button>
          `;
          rentalListEl.appendChild(div);
        });
      });
  }

  // 대여 상세 조회 (Bug 03: IDOR 취약점 테스트용)
  window.viewRentalDetail = (id) => {
    detailBody.innerHTML = '<p>불러오는 중...</p>';
    detailModal.style.display = 'block';

    fetch(`/api/rentals/${id}`)
      .then(res => res.json())
      .then(rent => {
        const tool = tools.find(t => t.id === rent.toolId) || { name: '공구' };
        detailBody.innerHTML = `
          <h2 style="font-family:'Barlow Condensed'; color:var(--orange);">RENTAL DETAILS</h2>
          <div class="mt-4 p-5" style="background:var(--black); border:1px solid var(--grey);">
            <p><strong>공구명:</strong> ${tool.name}</p>
            <p class="mt-2"><strong>대여 기간:</strong> ${rent.startDate} ~ ${rent.endDate || '미정'}</p>
            <p class="mt-2"><strong>상태:</strong> ${rent.status}</p>
            ${rent.address ? `<p class="mt-4 text-sm"><strong>배송 주소:</strong> ${rent.address}</p>` : ''}
            ${rent.phone ? `<p class="text-sm"><strong>연락처:</strong> ${rent.phone}</p>` : ''}
          </div>
          <p class="mt-4 text-xs text-muted">예약 번호: ${rent.id}</p>
        `;
      });
  };

  toolSearch.oninput = () => renderTools();
  catTabs.forEach(tab => {
    tab.onclick = () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCat = tab.dataset.cat;
      renderTools();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navMy].forEach(b => b.classList.remove('active'));
    [homeView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyHistory();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => toolModal.style.display = 'none';
  closeDetailBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == toolModal) toolModal.style.display = 'none';
    if (e.target == detailModal) detailModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
