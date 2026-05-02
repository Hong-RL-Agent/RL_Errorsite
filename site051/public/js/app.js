document.addEventListener('DOMContentLoaded', () => {
  let surveys = [];
  let currentDept = 'All';
  let activeSurveyId = null;

  const surveyGrid = document.getElementById('survey-grid');
  const surveySearch = document.getElementById('survey-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navHome = document.getElementById('nav-home');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const myView = document.getElementById('my-view');

  const myResListEl = document.getElementById('my-res-list');
  const surveyModal = document.getElementById('survey-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  
  const resultModal = document.getElementById('result-modal');
  const resultBody = document.getElementById('result-body');
  const closeResultBtn = document.querySelector('.close-result');

  const submitResBtn = document.getElementById('submit-res-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchSurveys();
  }

  function fetchSurveys() {
    fetch('/api/surveys')
      .then(res => res.json())
      .then(data => {
        surveys = data;
        renderSurveys();
      });
  }

  function renderSurveys() {
    surveyGrid.innerHTML = '';
    const term = surveySearch.value.toLowerCase();
    
    let filtered = surveys.filter(s => 
      (currentDept === 'All' || s.dept === 'All' || s.dept === currentDept) &&
      (s.title.toLowerCase().includes(term))
    );

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span class="status-badge ${s.status === 'open' ? 'status-open' : 'status-closed'}">${s.status.toUpperCase()}</span>
        <h3>${s.title}</h3>
        <p class="meta">대상: ${s.dept} | 질문: ${s.question}</p>
        <div class="mt-4" style="display:flex; gap:10px;">
          ${s.status === 'open' ? `<button class="btn-navy" style="padding:8px 15px; font-size:0.85rem;" onclick="event.stopPropagation(); openSurveyModal('${s.id}')">참여하기</button>` : ''}
          <button class="filter-btn" style="padding:8px 15px; font-size:0.85rem;" onclick="event.stopPropagation(); viewResults('${s.id}')">결과보기</button>
        </div>
      `;
      card.onclick = () => { if(s.status === 'open') openSurveyModal(s.id); else viewResults(s.id); };
      surveyGrid.appendChild(card);
    });
  }

  function openSurveyModal(id) {
    activeSurveyId = id;
    const survey = surveys.find(s => s.id === id);
    modalBody.innerHTML = `
      <h2 style="color:var(--navy);">${survey.title}</h2>
      <div class="mt-4 p-4" style="background:var(--bg); border-radius:10px; border-left:4px solid var(--mint);">
        <p><strong>질문:</strong> ${survey.question}</p>
      </div>
    `;
    surveyModal.style.display = 'block';
  }

  // 설문 응답 제출 (Bug 01: 익명성 파괴, Bug 02: 중복 제출 시 HTTP 200 반환)
  submitResBtn.onclick = () => {
    const answer = document.getElementById('survey-answer').value;
    if (!answer) return showToast('답변을 입력해 주세요.');

    fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyId: activeSurveyId, answer, userId: 'user_hr_77' })
    })
    .then(res => {
      // Bug 02: 에러 상황에서도 res.ok가 true일 수 있음
      if (res.status === 200) {
        return res.json().then(data => {
          if (!data.success) throw new Error(data.error);
          return data;
        });
      }
      if (!res.ok) throw new Error('서버 통신 오류');
      return res.json();
    })
    .then(data => {
      showToast('설문 응답이 성공적으로 제출되었습니다.');
      surveyModal.style.display = 'none';
      document.getElementById('survey-answer').value = '';
      switchTab(navMy, myView);
    })
    .catch(err => {
      showToast(err.message);
    });
  };

  // 결과 조회 (Bug 03: 진행 중인 설문 결과 노출)
  window.viewResults = (id) => {
    fetch(`/api/results/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('결과를 불러올 수 없습니다.');
        return res.json();
      })
      .then(data => {
        resultBody.innerHTML = `
          <h2 style="color:var(--navy);">${data.survey.title}</h2>
          <div class="mt-4">
            <p class="font-bold">총 참여자: ${data.totalResponses}명</p>
            <div class="mt-4 list-wrapper">
              ${data.rawResponses.map(r => `
                <div class="list-item" style="font-size:0.9rem;">
                  <span>${r.answer}</span>
                  <span class="text-muted" style="font-size:0.75rem;">ID: ${r.userId}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        resultModal.style.display = 'block';
      })
      .catch(err => {
        showToast(err.message);
      });
  };

  surveySearch.oninput = () => renderSurveys();
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDept = btn.dataset.dept;
      renderSurveys();
    };
  });

  function switchTab(btn, view) {
    [navHome, navMy].forEach(b => b.classList.remove('active'));
    [homeView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyParticipation();
  }

  function fetchMyParticipation() {
    // 실제로는 userId 기반 필터링이나, 여기서는 목업으로 표시
    myResListEl.innerHTML = '<p class="text-muted p-5 text-center">최근 7일간 참여한 설문 내역이 표시됩니다.</p>';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => surveyModal.style.display = 'none';
  closeResultBtn.onclick = () => resultModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == surveyModal) surveyModal.style.display = 'none';
    if (e.target == resultModal) resultModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
