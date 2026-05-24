document.addEventListener('DOMContentLoaded', () => {
  let mentors = [];
  let sessions = [];
  let currentField = 'All';
  let activeSessionId = null;
  const userId = 'user_A';

  const mentorGrid = document.getElementById('mentor-grid');
  const mentorSearch = document.getElementById('mentor-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navMentors = document.getElementById('nav-mentors');
  const navSessions = document.getElementById('nav-sessions');
  const navMy = document.getElementById('nav-my');
  
  const mentorsView = document.getElementById('mentors-view');
  const sessionsView = document.getElementById('sessions-view');
  const myView = document.getElementById('my-view');

  const mentorModal = document.getElementById('mentor-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const applyBtn = document.getElementById('apply-btn');
  const applyContent = document.getElementById('apply-content');

  const toast = document.getElementById('toast');

  function init() {
    fetchMentors();
    fetchSessions();
  }

  function fetchMentors() {
    fetch('/api/mentors')
      .then(res => res.json())
      .then(data => {
        mentors = data;
        renderMentors();
      });
  }

  function fetchSessions() {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        sessions = data;
        renderSessions();
      });
  }

  function renderMentors() {
    mentorGrid.innerHTML = '';
    const term = mentorSearch.value.toLowerCase();
    const filtered = mentors.filter(m => 
      (currentField === 'All' || m.field === currentField) &&
      (m.name.toLowerCase().includes(term) || m.company.toLowerCase().includes(term))
    );

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'mentor-card';
      card.innerHTML = `
        <div class="card-header">
          <span class="field-tag">${m.field}</span>
          <h3>${m.name} 멘토</h3>
          <p class="company">${m.company}</p>
        </div>
        <div class="card-body">
          <p>${m.bio}</p>
        </div>
      `;
      card.onclick = () => openMentorDetail(m);
      mentorGrid.appendChild(card);
    });
  }

  function openMentorDetail(mentor) {
    const mentorSessions = sessions.filter(s => s.mentorId === mentor.id);
    modalBody.innerHTML = `
      <div style="color:var(--navy); font-weight:700; font-size:0.8rem; letter-spacing:1px; margin-bottom:10px;">MENTOR PROFILE</div>
      <h2 style="font-size:2.5rem; font-weight:800; line-height:1.2;">${mentor.name}</h2>
      <p class="text-navy" style="font-weight:700;">${mentor.company} | ${mentor.field}</p>
      <div class="mt-4 p-5" style="background:var(--sky); border-radius:12px; border:1px solid var(--border);">
        <p><strong>상담 가능 시간:</strong></p>
        <div class="mt-2" style="display:flex; flex-wrap:wrap; gap:10px;">
          ${mentorSessions.map(s => `
            <button class="session-chip ${activeSessionId === s.id ? 'selected' : ''}" onclick="window.selectSession('${s.id}')">
              ${s.time.split(' ')[1]}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    applyContent.value = '';
    mentorModal.style.display = 'block';
  }

  window.selectSession = (id) => {
    activeSessionId = id;
    document.querySelectorAll('.session-chip').forEach(c => c.classList.remove('selected'));
    // Re-render internally or direct DOM update
    showToast('시간대가 선택되었습니다.');
  };

  // 멘토링 신청 (Bug 01: 중복 신청 허용, Bug 02: 에러 시 body mismatch)
  applyBtn.onclick = () => {
    const content = applyContent.value;
    if (!activeSessionId) return showToast('상담 시간을 먼저 선택해 주세요.');

    const mentor = mentors.find(m => sessions.find(s => s.id === activeSessionId).mentorId === m.id);

    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mentorId: mentor.id, sessionId: activeSessionId, content })
    })
    .then(async res => {
      const data = await res.json();
      // INTENTIONAL BUG: site075-bug02 
      // 실패 응답(400)에서도 data.success가 true이므로 클라이언트가 오판할 수 있음
      if (data.success) {
        showToast(data.message || '신청이 완료되었습니다.');
        mentorModal.style.display = 'none';
        fetchMyApplications();
      } else {
        showToast('신청에 실패했습니다.');
      }
    });
  };

  function fetchMyApplications() {
    fetch(`/api/applications/my?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById('application-list');
        list.innerHTML = '';
        if (data.length === 0) {
          list.innerHTML = '<p class="p-5 text-center text-muted">아직 신청한 멘토링이 없습니다.</p>';
          return;
        }
        data.forEach(app => {
          const mentor = mentors.find(m => m.id === app.mentorId);
          const session = sessions.find(s => s.id === app.sessionId);
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong style="font-size:1.1rem; color:var(--navy);">${mentor.name} 멘토님과의 상담</strong>
              <p class="text-sm text-muted">${session.time}</p>
            </div>
            <span class="status-badge pending">신청 대기</span>
          `;
          list.appendChild(div);
        });
      });
  }

  // 전체 신청 목록 (Bug 03: 일반 사용자도 전체 목록 조회 가능)
  document.getElementById('view-all-apps').onclick = () => {
    fetch('/api/applications/all')
      .then(res => res.json())
      .then(data => {
        console.table(data);
        showToast(`총 ${data.length}건의 전체 신청 내역이 콘솔에 출력되었습니다. (보안 노출)`);
      });
  }

  function renderSessions() {
    const list = document.getElementById('session-list');
    list.innerHTML = '';
    sessions.forEach(s => {
      const mentor = mentors.find(m => m.id === s.mentorId);
      const card = document.createElement('div');
      card.className = 'session-card';
      card.innerHTML = `
        <p class="session-time">${s.time}</p>
        <p class="text-sm text-muted">${mentor.name} 멘토 (${mentor.company})</p>
      `;
      card.onclick = () => openMentorDetail(mentor);
      list.appendChild(card);
    });
  }

  mentorSearch.oninput = () => renderMentors();

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentField = btn.getAttribute('data-field');
      renderMentors();
    };
  });

  function switchTab(btn, view) {
    [navMentors, navSessions, navMy].forEach(b => b.classList.remove('active'));
    [mentorsView, sessionsView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === myView) fetchMyApplications();
  }

  navMentors.onclick = () => switchTab(navMentors, mentorsView);
  navSessions.onclick = () => switchTab(navSessions, sessionsView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => mentorModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == mentorModal) mentorModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
