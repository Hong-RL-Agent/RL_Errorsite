document.addEventListener('DOMContentLoaded', () => {
  let clubs = [];
  let currentCat = 'all';
  let selectedClubId = null;

  const clubGrid = document.getElementById('club-grid');
  const clubSearch = document.getElementById('club-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navClubs = document.getElementById('nav-clubs');
  const navApps = document.getElementById('nav-apps');
  const navNotices = document.getElementById('nav-notices');
  
  const clubView = document.getElementById('club-view');
  const appsView = document.getElementById('apps-view');
  const noticesView = document.getElementById('notices-view');

  const appListEl = document.getElementById('app-list');
  const noticeListEl = document.getElementById('notice-list');
  const clubModal = document.getElementById('club-modal');
  const noticeModal = document.getElementById('notice-modal');
  const openNoticeBtn = document.getElementById('open-notice-modal');
  const closeBtns = document.querySelectorAll('.close');
  const applyBtn = document.getElementById('apply-btn');
  const noticeForm = document.getElementById('notice-form');
  const toast = document.getElementById('toast');

  function init() {
    fetchClubs();
  }

  function fetchClubs() {
    fetch('/api/clubs')
      .then(res => res.json())
      .then(data => {
        clubs = data;
        renderClubs();
      });
  }

  function renderClubs() {
    clubGrid.innerHTML = '';
    const term = clubSearch.value.toLowerCase();
    
    // Bug 01: 서버가 모집 마감된 동아리도 'Recruiting'으로 보내줌
    let filtered = clubs.filter(c => 
      (currentCat === 'all' || c.category === currentCat) &&
      (c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term))
    );

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card';
      const statusClass = c.status === 'Recruiting' ? 'status-recruiting' : 'status-closed';
      const statusText = c.status === 'Recruiting' ? '모집 중' : '모집 마감';

      card.innerHTML = `
        <span class="status-badge ${statusClass}">${statusText}</span>
        <span class="tag">${c.category}</span>
        <h3>${c.name}</h3>
        <p class="text-sm text-muted mt-2">${c.description}</p>
      `;
      card.onclick = () => openClubModal(c);
      clubGrid.appendChild(card);
    });
  }

  function openClubModal(club) {
    selectedClubId = club.id;
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
      <span class="tag">${club.category}</span>
      <h2 style="font-size:2rem; font-weight:800; margin-top:10px;">${club.name}</h2>
      <p class="mt-4" style="line-height:1.8;">${club.description}</p>
      <div class="mt-4" style="background:#F9F9F9; padding:20px; border-radius:15px;">
        <p><strong>모집 상태:</strong> ${club.status === 'Recruiting' ? '현재 모집 중입니다.' : '모집이 마감되었습니다.'}</p>
        <p class="mt-2"><strong>지원 자격:</strong> 전공 무관, 열정 있는 신입생 환영</p>
      </div>
    `;
    clubModal.style.display = 'block';
  }

  applyBtn.onclick = () => {
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId: selectedClubId, userId: 'std-101' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('동아리 가입 신청이 완료되었습니다.');
        clubModal.style.display = 'none';
        fetchApplications();
      }
    });
  };

  function fetchApplications() {
    fetch('/api/applications/std-101')
      .then(res => res.json())
      .then(data => {
        appListEl.innerHTML = '';
        data.forEach(app => {
          const club = clubs.find(c => c.id === app.clubId) || { name: '알 수 없는 동아리' };
          const div = document.createElement('div');
          div.className = 'card mt-3';
          div.style.display = 'flex';
          div.style.justifyContent = 'space-between';
          div.style.alignItems = 'center';
          div.innerHTML = `
            <div>
              <strong>${club.name}</strong>
              <p class="text-sm text-muted">상태: ${app.status} | 신청일: ${app.createdAt}</p>
            </div>
            ${app.status === 'Pending' ? `<button onclick="cancelApp('${app.id}')" style="background:none; border:none; color:#E11D48; font-weight:700; cursor:pointer;">신청 취소</button>` : ''}
          `;
          appListEl.appendChild(div);
        });
      });
  }

  // 신청 취소 (Bug 02: GET 요청으로 데이터 상태 변경)
  window.cancelApp = (appId) => {
    fetch(`/api/applications/cancel?appId=${appId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('가입 신청이 취소되었습니다.');
          fetchApplications();
        }
      });
  };

  function fetchNotices() {
    fetch('/api/notices')
      .then(res => res.json())
      .then(data => {
        noticeListEl.innerHTML = '';
        data.forEach(n => {
          const div = document.createElement('div');
          div.className = 'notice-card';
          div.innerHTML = `
            <h3 style="font-size:1.2rem; font-weight:800;">${n.title}</h3>
            <p class="text-sm text-muted mt-1">작성자: ${n.author} | 날짜: ${n.date}</p>
            <p class="mt-3" style="white-space:pre-wrap;">${n.content}</p>
          `;
          noticeListEl.appendChild(div);
        });
      });
  }

  // 공지 작성 (Bug 03: 권한 검사 없이 POST 가능)
  noticeForm.onsubmit = (e) => {
    e.preventDefault();
    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;

    fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, author: '일반사용자', userId: 'std-101' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('공지사항이 성공적으로 등록되었습니다.');
        noticeModal.style.display = 'none';
        noticeForm.reset();
        fetchNotices();
      }
    });
  };

  clubSearch.oninput = () => renderClubs();

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      renderClubs();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navClubs, navApps, navNotices].forEach(b => b.classList.remove('active'));
    [clubView, appsView, noticesView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navClubs.onclick = () => switchTab(navClubs, clubView);
  navApps.onclick = () => { switchTab(navApps, appsView); fetchApplications(); };
  navNotices.onclick = () => { switchTab(navNotices, noticesView); fetchNotices(); };

  openNoticeBtn.onclick = () => noticeModal.style.display = 'block';

  closeBtns.forEach(btn => {
    btn.onclick = () => {
      clubModal.style.display = 'none';
      noticeModal.style.display = 'none';
    };
  });

  window.onclick = (e) => {
    if (e.target == clubModal) clubModal.style.display = 'none';
    if (e.target == noticeModal) noticeModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
