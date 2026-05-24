document.addEventListener('DOMContentLoaded', () => {
  let technicians = [];
  let currentCategory = 'all';
  let selectedTechId = null;

  const techGrid = document.getElementById('tech-grid');
  const techSearchInput = document.getElementById('tech-search');
  const catCards = document.querySelectorAll('.cat-card');
  
  const navHome = document.getElementById('nav-home');
  const navRequests = document.getElementById('nav-requests');
  const homeView = document.getElementById('home-view');
  const requestsView = document.getElementById('requests-view');

  const requestListEl = document.getElementById('request-list');
  const testIdorBtn = document.getElementById('test-idor-btn');
  
  const modal = document.getElementById('request-modal');
  const closeBtn = document.querySelector('.close');
  const requestForm = document.getElementById('request-form');
  const submitBtn = document.getElementById('submit-request-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchTechnicians();
  }

  function fetchTechnicians() {
    fetch('/api/technicians')
      .then(res => res.json())
      .then(data => {
        technicians = data;
        renderTechnicians();
      });
  }

  function renderTechnicians() {
    techGrid.innerHTML = '';
    const term = techSearchInput.value.toLowerCase();
    const filtered = technicians.filter(t => 
      (currentCategory === 'all' || t.category === currentCategory) &&
      (t.name.toLowerCase().includes(term))
    );

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'tech-card';
      card.innerHTML = `
        <div class="tech-header">
          <span class="tech-name">${t.name}</span>
          <span class="tech-rating">★ ${t.rating}</span>
        </div>
        <p class="tech-bio">${t.bio}</p>
        <div class="tech-footer">
          <span class="tech-cat">${t.category}</span>
          <span class="text-sm font-bold">상세 보기 ></span>
        </div>
      `;
      card.onclick = () => openRequestModal(t);
      techGrid.appendChild(card);
    });
  }

  function openRequestModal(t) {
    selectedTechId = t.id;
    document.getElementById('modal-tech-name').innerText = `${t.name} 기사님께 요청하기`;
    document.getElementById('modal-tech-cat').innerText = `분야: ${t.category}`;
    modal.style.display = 'block';
  }

  // 수리 요청 제출 (Bug 01, Bug 02 관련)
  requestForm.onsubmit = (e) => {
    e.preventDefault();
    const desc = document.getElementById('repair-desc').value;
    const tech = technicians.find(t => t.id === selectedTechId);

    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        technicianId: selectedTechId, 
        category: tech.category, 
        desc, 
        userId: 'user123' 
      })
    })
    .then(async res => {
      const data = await res.json();
      
      // Bug 02: 에러 본문 불일치 테스트 (내용이 없으면 서버는 400이지만 success: true를 보냄)
      if (data.success) {
        showToast('매칭 요청이 전송되었습니다. 기사님의 응답을 기다려 주세요.');
        modal.style.display = 'none';
        requestForm.reset();
        fetchMyRequests();
      } else {
        showToast(data.error || '요청 중 오류가 발생했습니다.');
      }
    });
  };

  function fetchMyRequests() {
    fetch('/api/my-requests?userId=user123')
      .then(res => res.json())
      .then(data => {
        renderRequests(data);
      });
  }

  function renderRequests(data) {
    requestListEl.innerHTML = '';
    data.forEach(req => {
      // Bug 01: technicianId에 category가 저장되어 있어 기사 매칭이 안 됨
      const tech = technicians.find(t => t.id === req.technicianId);
      const techName = tech ? tech.name : '알 수 없는 기사님 (데이터 오류)';
      
      const div = document.createElement('div');
      div.className = 'req-item';
      div.innerHTML = `
        <div class="req-info">
          <strong>${techName}</strong>
          <p class="text-sm text-muted">${req.desc}</p>
          <p class="text-sm text-muted mt-1">신청일: ${req.date}</p>
        </div>
        <span class="status-tag">${req.status}</span>
      `;
      requestListEl.appendChild(div);
    });
  }

  // Bug 03: IDOR 테스트
  testIdorBtn.onclick = () => {
    const targetId = prompt('상세 조회할 요청 ID를 입력하세요 (예: req-9999)', 'req-9999');
    if (targetId) {
      fetch(`/api/requests/${targetId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) return showToast(data.error);
          
          showToast('비인가 요청 상세 정보 조회 성공');
          requestListEl.innerHTML = `
            <div class="req-item" style="border-color:var(--orange); background:#FFF7ED;">
              <div class="req-info">
                <strong>[타인] ${data.userId} 님의 긴급 요청</strong>
                <p class="text-sm">내용: ${data.desc}</p>
                ${data.secretMemo ? `<p class="text-sm" style="color:red; font-weight:700;">비밀 메모: ${data.secretMemo}</p>` : ''}
              </div>
              <span class="status-tag" style="background:var(--orange); color:white;">${data.status}</span>
            </div>
          `;
        });
    }
  };

  techSearchInput.oninput = () => renderTechnicians();

  catCards.forEach(card => {
    card.onclick = () => {
      catCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentCategory = card.dataset.cat;
      renderTechnicians();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navRequests].forEach(b => b.classList.remove('active'));
    [homeView, requestsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navRequests.onclick = () => { switchTab(navRequests, requestsView); fetchMyRequests(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
