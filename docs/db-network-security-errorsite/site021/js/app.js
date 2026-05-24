document.addEventListener('DOMContentLoaded', () => {
  let courseData = [];
  let currentCategory = 'all';
  let selectedCourseId = null;

  const courseGrid = document.getElementById('course-grid');
  const progressList = document.getElementById('progress-list');
  const searchInput = document.getElementById('course-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navItems = document.querySelectorAll('.nav-item');
  const views = {
    'nav-courses': document.getElementById('courses-view'),
    'nav-my-learning': document.getElementById('learning-view'),
    'nav-quizzes': document.getElementById('quizzes-view')
  };

  const modal = document.getElementById('course-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const accessContentBtn = document.getElementById('access-content-btn');
  const submitQuizBtn = document.getElementById('submit-quiz');
  const quizResult = document.getElementById('quiz-result');
  const toast = document.getElementById('toast');

  function init() {
    fetchCourses();
    fetchProgress();
  }

  function fetchCourses() {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        courseData = data;
        renderCourses(data);
      });
  }

  function renderCourses(data) {
    courseGrid.innerHTML = '';
    const filtered = currentCategory === 'all' ? data : data.filter(c => c.category === currentCategory);
    
    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="card-content">
          <span class="card-tag">${c.category}</span>
          <h3 class="card-title">${c.title}</h3>
          <p class="text-xs text-muted">${c.instructor} • ${c.level}</p>
          <div class="card-footer">
            <span class="price">${c.price.toLocaleString()}원</span>
            <span class="text-xs">${c.totalLectures}강</span>
          </div>
        </div>
      `;
      card.onclick = () => openModal(c);
      courseGrid.appendChild(card);
    });
  }

  function openModal(course) {
    selectedCourseId = course.id;
    modalBody.innerHTML = `
      <span class="card-tag">${course.category}</span>
      <h2 class="mt-2">${course.title}</h2>
      <p class="mt-4 text-muted">강사: ${course.instructor} | 난이도: ${course.level}</p>
      <p class="mt-4">이 강의는 ${course.totalLectures}개의 세션으로 구성되어 있습니다. 기초부터 심화까지 완벽하게 학습하세요.</p>
    `;
    modal.style.display = 'block';
  }

  // Bug 03: 비인가 강의 접근
  accessContentBtn.onclick = () => {
    fetch(`/api/courses/${selectedCourseId}/content`)
      .then(res => res.json())
      .then(data => {
        if(data.error) return showToast(data.error);
        
        modalBody.innerHTML += `
          <div class="mt-5 p-4" style="background:#F0FDF4; border-radius:12px;">
            <h4>✅ 강의 콘텐츠 로드 성공 (Bug 03)</h4>
            <p class="mt-2">${data.content}</p>
            <p class="text-xs text-muted mt-2">Source: ${data.secretUrl}</p>
          </div>
        `;
        showToast('콘텐츠를 성공적으로 불러왔습니다.');
      });
  };

  function fetchProgress() {
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        progressList.innerHTML = '';
        data.forEach(p => {
          const card = document.createElement('div');
          card.className = 'progress-card';
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>${p.title}</strong>
              <span class="text-purple" style="font-weight:700;">${p.percent}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${Math.min(p.percent, 100)}%;"></div>
            </div>
            <p class="text-xs text-muted mt-2">수강 완료: ${p.completed} / ${p.total} (분모 오류 적용됨)</p>
          `;
          progressList.appendChild(card);
        });
      });
  }

  // Bug 02: 퀴즈 제출 부분 실패
  submitQuizBtn.onclick = () => {
    const answers = [
      { qid: 'q1', val: document.querySelector('input[name="q1"]:checked')?.value },
      { qid: 'q2', val: document.querySelector('input[name="q2"]:checked')?.value },
      { qid: 'q3', val: document.querySelector('input[name="q3"]:checked')?.value }
    ];

    fetch('/api/quizzes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    })
    .then(res => res.json())
    .then(data => {
      quizResult.innerHTML = `
        <div class="card" style="border-color:var(--indigo);">
          <h3>퀴즈 결과</h3>
          <p class="mt-2">획득 점수: <strong>${data.totalScore}</strong> / 30</p>
          <div class="mt-3">
            ${data.details.map(r => `<p class="text-xs">문항 ${r.qid}: ${r.isCorrect ? '✅ 정답' : '❌ 오답'}</p>`).join('')}
            ${data.details.length < 3 ? '<p class="text-xs" style="color:red;">⚠️ 일부 문항의 채점 결과가 서버로부터 도착하지 않았습니다. (Bug 02)</p>' : ''}
          </div>
        </div>
      `;
      showToast('퀴즈 결과가 처리되었습니다.');
    });
  };

  // 검색 & 필터
  searchInput.oninput = () => {
    const term = searchInput.value.toLowerCase();
    const filtered = courseData.filter(c => c.title.toLowerCase().includes(term));
    renderCourses(filtered);
  };

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderCourses(courseData);
    };
  });

  document.getElementById('refresh-api').onclick = () => {
    fetchCourses();
    fetchProgress();
    showToast('데이터가 새로고침되었습니다.');
  };

  // 탭 전환
  navItems.forEach(nav => {
    nav.onclick = () => {
      navItems.forEach(n => n.classList.remove('active'));
      nav.classList.add('active');
      Object.values(views).forEach(v => v.style.display = 'none');
      views[nav.id].style.display = 'block';
      if(nav.id === 'nav-my-learning') fetchProgress();
    };
  });

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
