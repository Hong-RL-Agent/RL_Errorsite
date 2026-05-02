document.addEventListener('DOMContentLoaded', () => {
  let tutors = [];
  let currentSubject = 'all';
  let selectedTutorId = null;

  const tutorGrid = document.getElementById('tutor-grid');
  const tutorSearchInput = document.getElementById('tutor-search');
  const subjectChips = document.querySelectorAll('.chip');
  const sortSelect = document.getElementById('sort-select');
  const tutorCountEl = document.getElementById('tutor-count');
  const recommendationRow = document.getElementById('recommendation-row');
  
  const navFind = document.getElementById('nav-find');
  const navMy = document.getElementById('nav-my');
  const findView = document.getElementById('find-view');
  const myView = document.getElementById('my-view');

  const consultListEl = document.getElementById('consult-list');
  const consultModal = document.getElementById('consult-modal');
  const closeBtn = document.querySelector('.close');
  const consultForm = document.getElementById('consult-form');
  const toast = document.getElementById('toast');

  function init() {
    fetchTutors();
    fetchRecommendations();
  }

  function fetchTutors() {
    const sort = sortSelect.value;
    fetch(`/api/tutors?sort=${sort}`)
      .then(res => res.json())
      .then(data => {
        tutors = data;
        renderTutors();
      });
  }

  function renderTutors() {
    tutorGrid.innerHTML = '';
    const term = tutorSearchInput.value.toLowerCase();
    const filtered = tutors.filter(t => 
      (currentSubject === 'all' || t.subject === currentSubject) &&
      (t.name.toLowerCase().includes(term) || t.subject.toLowerCase().includes(term))
    );

    tutorCountEl.innerText = `${filtered.length}명`;

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'tutor-card';
      card.innerHTML = `
        <div class="card-header">
          <h4>${t.name} 선생님</h4>
          <span class="rating">★ ${t.rating}</span>
        </div>
        <span class="subject-tag">${t.subject}</span>
        <p class="bio-preview">${t.bio}</p>
        <div class="price-row">
          <span class="price">${t.hourlyRate.toLocaleString()}<span>원 / 시간</span></span>
          <button class="btn-sm-teal" style="background:none; border:none; color:var(--teal); font-weight:800; cursor:pointer;">상담 신청 ></button>
        </div>
      `;
      card.onclick = () => openConsultModal(t);
      tutorGrid.appendChild(card);
    });
  }

  // 추천 선생님 조회 (Bug 02: 필드명 불일치)
  function fetchRecommendations() {
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => {
        recommendationRow.innerHTML = '';
        data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'tutor-card';
          card.style.flex = '1';
          card.style.minWidth = '250px';
          
          // Bug 02: API는 'name'을 보내지만 프론트는 'tutorName'을 기대함
          const displayName = item.tutorName || '알 수 없음'; 
          
          card.innerHTML = `
            <h4 style="font-size:1.1rem;">${displayName}</h4>
            <span class="subject-tag mt-2">${item.subject}</span>
            <p class="mt-3 text-sm">시간당 ${item.hourlyRate.toLocaleString()}원</p>
          `;
          recommendationRow.appendChild(card);
        });
      });
  }

  function openConsultModal(t) {
    selectedTutorId = t.id;
    document.getElementById('modal-tutor-name').innerText = `${t.name} 선생님과 상담하기`;
    document.getElementById('modal-tutor-sub').innerText = `과목: ${t.subject}`;
    consultModal.style.display = 'block';
  }

  // 상담 신청 제출 (Bug 03: 인증 누락)
  consultForm.onsubmit = (e) => {
    e.preventDefault();
    const message = document.getElementById('consult-msg').value;

    fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorId: selectedTutorId, userId: 'UA_Student_01', message })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('상담 신청서가 제출되었습니다. 선생님의 연락을 기다려 주세요.');
        consultModal.style.display = 'none';
        consultForm.reset();
        fetchMyConsultations();
      }
    });
  };

  function fetchMyConsultations() {
    // 실제로는 userId로 필터링된 목록을 가져와야 함 (간략화)
    // 여기서는 최신 신청 건을 보여줌
    const div = document.createElement('div');
    div.className = 'consult-card';
    div.innerHTML = `
      <div class="c-info">
        <strong>최근 신청 완료</strong>
        <p class="text-sm text-muted">선생님이 신청 내역을 확인하고 있습니다.</p>
      </div>
      <span class="status-tag" style="background:#F1F5F9; padding:6px 12px; border-radius:8px; font-size:0.85rem; font-weight:700;">대기 중</span>
    `;
    consultListEl.innerHTML = '';
    consultListEl.appendChild(div);
  }

  tutorSearchInput.oninput = () => renderTutors();
  sortSelect.onchange = () => fetchTutors();

  subjectChips.forEach(chip => {
    chip.onclick = () => {
      subjectChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentSubject = chip.dataset.sub;
      renderTutors();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navFind, navMy].forEach(b => b.classList.remove('active'));
    [findView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'flex';
  }

  navFind.onclick = () => switchTab(navFind, findView);
  navMy.onclick = () => { switchTab(navMy, myView); fetchMyConsultations(); };

  closeBtn.onclick = () => consultModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == consultModal) consultModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
