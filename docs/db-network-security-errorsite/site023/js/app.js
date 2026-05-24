document.addEventListener('DOMContentLoaded', () => {
  let volunteers = [];
  let currentArea = 'all';
  let selectedVId = null;

  const vGrid = document.getElementById('v-grid');
  const vSearchInput = document.getElementById('v-search');
  const areaFilter = document.getElementById('area-filter');
  
  const navList = document.getElementById('nav-list');
  const navOrg = document.getElementById('nav-org');
  const navMy = document.getElementById('nav-my');
  
  const listView = document.getElementById('list-view');
  const orgView = document.getElementById('org-view');
  const myView = document.getElementById('my-view');

  const orgListEl = document.getElementById('org-list');
  const myAppListEl = document.getElementById('my-app-list');
  
  const modal = document.getElementById('v-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const submitAppBtn = document.getElementById('submit-app-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchVolunteers();
  }

  function fetchVolunteers() {
    fetch('/api/volunteers')
      .then(res => res.json())
      .then(data => {
        volunteers = data;
        renderVolunteers(data);
      });
  }

  function renderVolunteers(data) {
    vGrid.innerHTML = '';
    const term = vSearchInput.value.toLowerCase();
    const filtered = data.filter(v => 
      (currentArea === 'all' || v.area === currentArea) &&
      (v.title.toLowerCase().includes(term))
    );

    filtered.forEach(v => {
      const card = document.createElement('div');
      card.className = 'v-card';
      card.innerHTML = `
        <span class="card-area">${v.area}</span>
        <h3 class="card-title">${v.title}</h3>
        <p class="card-date">📅 모집일: ${v.date}</p>
        <div class="mt-3">
          <span class="status-badge ${v.status.toLowerCase()}">${v.status === 'Open' ? '모집 중' : '모집 완료'}</span>
        </div>
      `;
      card.onclick = () => openModal(v);
      vGrid.appendChild(card);
    });
  }

  function openModal(v) {
    selectedVId = v.id;
    modalBody.innerHTML = `
      <span class="card-area">${v.area}</span>
      <h2 class="mt-2">${v.title}</h2>
      <p class="mt-4">활동 일자: <strong>${v.date}</strong></p>
      <p class="mt-2 text-muted">이 봉사활동은 지역 공동체를 위한 따뜻한 나눔 프로젝트입니다. 여러분의 소중한 참여를 기다립니다.</p>
    `;
    modal.style.display = 'block';
  }

  // 봉사 신청 (Bug 01, Bug 02 관련)
  submitAppBtn.onclick = () => {
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId: selectedVId, user: '홍길동' })
    })
    .then(res => {
      // Bug 02: 마감 상태인데 201이 오는 경우 확인
      if (res.status === 201) {
        showToast('신청이 완료되었습니다! (Bug 02 확인 가능)');
        modal.style.display = 'none';
        fetchMyApps();
      } else {
        showToast('신청에 실패했습니다.');
      }
    });
  };

  function fetchMyApps() {
    fetch('/api/applications?user=홍길동')
      .then(res => res.json())
      .then(data => {
        myAppListEl.innerHTML = '';
        if (data.length === 0) {
          myAppListEl.innerHTML = '<p class="text-muted">아직 신청한 봉사가 없습니다.</p>';
          return;
        }
        data.forEach(app => {
          const v = volunteers.find(v => v.id === app.volunteerId) || { title: '봉사활동' };
          const div = document.createElement('div');
          div.className = 'app-item';
          div.innerHTML = `
            <div>
              <strong>${v.title}</strong>
              <p class="text-xs text-muted mt-1">신청 ID: ${app.id}</p>
            </div>
            <div class="status-badge open">신청 완료</div>
          `;
          myAppListEl.appendChild(div);
        });
      });
  }

  function fetchOrgs() {
    // Bug 03: 관리자 데이터 노출 확인
    fetch('/api/organizations')
      .then(res => res.json())
      .then(data => {
        orgListEl.innerHTML = '';
        data.forEach(org => {
          const card = document.createElement('div');
          card.className = 'org-card';
          card.innerHTML = `
            <h3>${org.name}</h3>
            <p class="text-sm">함께 나눔을 실천하는 파트너 기관입니다.</p>
            <div class="mt-3">
              <button class="btn-outline btn-sm" onclick="showToast('기관 상세 페이지 준비 중')">기관 정보</button>
            </div>
          `;
          orgListEl.appendChild(card);
        });
      });
  }

  vSearchInput.oninput = () => renderVolunteers(volunteers);
  areaFilter.onchange = (e) => {
    currentArea = e.target.value;
    renderVolunteers(volunteers);
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navList, navOrg, navMy].forEach(b => b.classList.remove('active'));
    [listView, orgView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navList.onclick = () => switchTab(navList, listView);
  navOrg.onclick = () => { switchTab(navOrg, orgView); fetchOrgs(); };
  navMy.onclick = () => { switchTab(navMy, myView); fetchMyApps(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
