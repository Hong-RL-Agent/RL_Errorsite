document.addEventListener('DOMContentLoaded', () => {
  let menus = [];
  let currentCafe = 'all';
  let activeMenuId = null;

  const menuGrid = document.getElementById('menu-grid');
  const menuSearch = document.getElementById('menu-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navHome = document.getElementById('nav-home');
  const navResults = document.getElementById('nav-results');
  
  const homeView = document.getElementById('home-view');
  const resultsView = document.getElementById('results-view');

  const resultListEl = document.getElementById('result-list');
  const menuModal = document.getElementById('menu-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const submitVoteBtn = document.getElementById('submit-vote-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchMenus();
  }

  function fetchMenus() {
    fetch('/api/menus')
      .then(res => res.json())
      .then(data => {
        menus = data;
        renderMenus();
      });
  }

  function renderMenus() {
    menuGrid.innerHTML = '';
    const term = menuSearch.value.toLowerCase();
    
    let filtered = menus.filter(m => 
      (currentCafe === 'all' || m.cafe === currentCafe) &&
      (m.name.toLowerCase().includes(term) || m.cafe.toLowerCase().includes(term))
    );

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.innerHTML = `
        <span class="cafe-tag">${m.cafe}</span>
        <h3>${m.name}</h3>
        <p class="price-info">₩${m.price.toLocaleString()}</p>
        <p class="text-xs text-muted mt-2">${m.calories}</p>
      `;
      card.onclick = () => openMenuModal(m);
      menuGrid.appendChild(card);
    });
  }

  function openMenuModal(menu) {
    activeMenuId = menu.id;
    modalBody.innerHTML = `
      <h2 style="color:var(--navy); font-weight:800;">${menu.name}</h2>
      <p class="mt-1 text-orange font-bold">${menu.cafe}</p>
      <div class="mt-4 p-4" style="background:var(--grey-bg); border-radius:12px;">
        <p><strong>가격:</strong> ₩${menu.price.toLocaleString()}</p>
        <p class="mt-1"><strong>칼로리:</strong> ${menu.calories}</p>
        <p class="mt-3 text-sm text-muted">주요 영양소: 탄수화물, 단백질, 지방 균형 잡힌 식단입니다.</p>
      </div>
    `;
    menuModal.style.display = 'block';
  }

  // 메뉴 투표 (Bug 01: 중복 투표 허용, Bug 03: 헤더 기반 인증 우회)
  submitVoteBtn.onclick = () => {
    fetch('/api/votes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-student-id': '20240001' // 실제로는 로그인 정보에서 가져와야 함 (Bug 03 테스트 포인트)
      },
      body: JSON.stringify({ menuId: activeMenuId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('투표가 소중하게 반영되었습니다. 감사합니다!');
        menuModal.style.display = 'none';
        switchTab(navResults, resultsView);
      } else {
        showToast(`오류: ${data.error}`);
      }
    });
  };

  // 결과 조회 (Bug 02: percentage 필드 부재로 인한 렌더링 결함)
  function fetchResults() {
    fetch('/api/results')
      .then(res => res.json())
      .then(results => {
        resultListEl.innerHTML = '';
        results.forEach(r => {
          const div = document.createElement('div');
          div.className = 'result-item';
          
          // Bug 02: r.percentage가 존재하지 않음 (대신 r.percentText가 있음)
          // 클라이언트 코드는 숫자형 percentage를 기대하여 그래프를 그리려고 함
          const numericPercent = parseInt(r.percentage) || 0; 
          
          div.innerHTML = `
            <div class="progress-meta">
              <span>${r.menuName}</span>
              <span>${r.percentText || '0%'}</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" style="width: ${numericPercent}%"></div>
            </div>
            <p class="text-xs text-muted mt-2">${r.voteCount}명이 선택함</p>
          `;
          resultListEl.appendChild(div);
        });
      });
  }

  menuSearch.oninput = () => renderMenus();
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCafe = btn.dataset.cafe;
      renderMenus();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navResults].forEach(b => b.classList.remove('active'));
    [homeView, resultsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === resultsView) fetchResults();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navResults.onclick = () => switchTab(navResults, resultsView);

  closeBtn.onclick = () => menuModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == menuModal) menuModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
