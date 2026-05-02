document.addEventListener('DOMContentLoaded', () => {
  let eventData = [];
  let currentEventId = null;

  const eventGrid = document.getElementById('event-grid');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const refreshEventsBtn = document.getElementById('refresh-events');
  
  const navHome = document.getElementById('nav-home');
  const navNotice = document.getElementById('nav-notice');
  const navMy = document.getElementById('nav-my');
  const homeView = document.getElementById('home-view');
  const noticeView = document.getElementById('notice-view');
  const myView = document.getElementById('my-view');

  const noticeList = document.getElementById('notice-list');
  const applicationList = document.getElementById('application-list');
  const adminBypassBtn = document.getElementById('admin-bypass-btn');
  
  const modal = document.getElementById('apply-modal');
  const closeBtn = document.querySelector('.close');
  const submitApplyBtn = document.getElementById('submit-apply');
  const toast = document.getElementById('toast');

  function init() {
    fetchEvents();
  }

  function fetchEvents() {
    // Bug 02: Cache-Control 헤더 때문에 브라우저 캐시가 동작함 (새로고침 시 서버에 안 갈 수도 있음)
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        eventData = data;
        renderEvents(data);
      });
  }

  function renderEvents(data) {
    eventGrid.innerHTML = '';
    data.forEach(e => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${e.image}" class="card-img">
        <div class="card-content">
          <span class="badge">${e.category}</span>
          <h4>${e.title}</h4>
          <div class="card-info">
            <p>📍 ${e.location}</p>
            <p>📅 ${e.date}</p>
            <p class="mt-2 text-neon" style="font-weight:700;">잔여석: ${e.remainingSeats} / ${e.totalSeats}</p>
          </div>
          <button class="btn-primary w-full" onclick="openApplyModal('${e.id}')">참가 신청</button>
        </div>
      `;
      eventGrid.appendChild(card);
    });
  }

  window.openApplyModal = (id) => {
    const event = eventData.find(e => e.id === id);
    currentEventId = id;
    document.getElementById('modal-title').innerText = event.title;
    document.getElementById('modal-seats').innerText = `잔여석 ${event.remainingSeats}석`;
    modal.style.display = 'block';
  };

  // 신청하기 (Bug 01: 카운트 불일치)
  submitApplyBtn.onclick = () => {
    const user = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    
    if(!user || !phone) return showToast('성함과 연락처를 입력해주세요.');

    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: currentEventId, user, phone })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        showToast('참가 신청이 완료되었습니다!');
        modal.style.display = 'none';
        
        // Bug 01 확인을 위해 데이터 리로드
        // 하지만 Bug 02 (캐시) 때문에 목록이 안 바뀔 수도 있음
        fetchEvents();
      }
    });
  };

  function fetchNotices() {
    fetch('/api/notices')
      .then(res => res.json())
      .then(data => {
        noticeList.innerHTML = '';
        data.forEach(n => {
          const div = document.createElement('div');
          div.className = 'notice-card';
          div.innerHTML = `<h3>${n.title}</h3><p class="mt-2 text-muted">${n.content}</p>`;
          noticeList.appendChild(div);
        });
      });
  }

  function fetchMyApplications(isAdmin = false) {
    const url = isAdmin ? '/api/applications?admin=true' : `/api/applications?user=홍길동`;
    
    fetch(url)
      .then(res => res.json())
      .then(resData => {
        const apps = resData.data;
        applicationList.innerHTML = '';
        if(apps.length === 0) {
          applicationList.innerHTML = '<p class="text-muted">신청 내역이 없습니다.</p>';
          return;
        }

        if(isAdmin) showToast('관리자 권한으로 모든 신청자 정보를 불러왔습니다. (Bug 03)');

        apps.forEach(a => {
          const event = eventData.find(e => e.id === a.eventId) || { title: 'Unknown Event' };
          const div = document.createElement('div');
          div.className = 'app-card';
          div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
              <strong>${event.title}</strong>
              <span class="text-neon">${a.appliedAt}</span>
            </div>
            <p class="mt-2">신청자: ${a.user} (${a.phone})</p>
            <p class="text-xs text-muted mt-1">ID: ${a.id}</p>
          `;
          applicationList.appendChild(div);
        });
      });
  }

  // Bug 03: 관리자 우회
  adminBypassBtn.onclick = () => {
    fetchMyApplications(true);
  };

  // 필터링
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;
    const filtered = eventData.filter(e => {
      const matchTerm = e.title.toLowerCase().includes(term) || e.location.toLowerCase().includes(term);
      const matchCat = cat === 'all' || e.category === cat;
      return matchTerm && matchCat;
    });
    renderEvents(filtered);
  }

  searchInput.oninput = applyFilters;
  categoryFilter.onchange = applyFilters;
  
  refreshEventsBtn.onclick = () => {
    // Bug 02 캐시 확인을 위해 강제로 다시 페치
    fetchEvents();
    showToast('데이터 요청을 보냈습니다. 캐시 상태를 확인하세요.');
  };

  // 탭 네비게이션
  function switchTab(btn, view) {
    [navHome, navNotice, navMy].forEach(b => b.classList.remove('active'));
    [homeView, noticeView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navNotice.onclick = () => { switchTab(navNotice, noticeView); fetchNotices(); };
  navMy.onclick = () => { switchTab(navMy, myView); fetchMyApplications(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
