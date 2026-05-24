document.addEventListener('DOMContentLoaded', () => {
  let classData = [];
  let currentClassId = null;

  const classGrid = document.getElementById('class-grid');
  const searchInput = document.getElementById('search-input');
  const diffBtns = document.querySelectorAll('.diff-btn');
  
  const modal = document.getElementById('reserve-modal');
  const closeBtn = document.querySelector('.close');
  const submitBtn = document.getElementById('submit-reservation');

  const navClasses = document.getElementById('nav-classes');
  const navReviews = document.getElementById('nav-reviews');
  const navMy = document.getElementById('nav-my');
  const classesView = document.getElementById('classes-view');
  const reviewsView = document.getElementById('reviews-view');
  const myView = document.getElementById('my-view');

  const reviewList = document.getElementById('review-list');
  const myReservationsList = document.getElementById('my-reservations');
  const toast = document.getElementById('toast');

  const testIntegrityBtn = document.getElementById('test-integrity-btn');
  const testCsrfBtn = document.getElementById('test-csrf-btn');

  function init() {
    fetchClasses();
  }

  function fetchClasses() {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        classData = data;
        renderClasses(data);
      });
  }

  function renderClasses(data) {
    classGrid.innerHTML = '';
    data.forEach(c => {
      const card = document.createElement('div');
      card.className = 'class-card';
      card.innerHTML = `
        <img src="${c.image}" class="class-img">
        <span class="badge">${c.difficulty}</span>
        <h3>${c.title}</h3>
        <p class="text-muted">강사: ${c.instructor}</p>
        <div class="card-footer">
          <span class="price-tag" style="font-size:1.2rem;">${c.price.toLocaleString()}원</span>
          <span style="font-size:0.8rem; font-weight:700;">BOOK NOW →</span>
        </div>
      `;
      card.onclick = () => openModal(c);
      classGrid.appendChild(card);
    });
  }

  function openModal(c) {
    currentClassId = c.id;
    document.getElementById('modal-title').innerText = c.title;
    document.getElementById('modal-difficulty').innerText = c.difficulty;
    document.getElementById('modal-price').innerText = `${c.price.toLocaleString()}원`;
    document.getElementById('modal-img-box').style.backgroundImage = `url('${c.image}')`;
    modal.style.display = 'block';
  }

  // 예약 신청 (Bug 03: CSRF 취약)
  submitBtn.onclick = () => {
    const date = document.getElementById('reserve-date').value;
    const user = document.getElementById('reserve-user').value;
    
    if(!date || !user) return showToast('날짜와 성함을 입력해주세요.');

    postReservation(currentClassId, date, user);
  };

  function postReservation(classId, date, user) {
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, date, user })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        showToast('예약이 정상적으로 신청되었습니다.');
        modal.style.display = 'none';
        fetchMyReservations();
      }
    });
  }

  function fetchMyReservations() {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => {
        myReservationsList.innerHTML = '';
        if(data.length === 0) {
          myReservationsList.innerHTML = '<p class="text-muted">예약 내역이 없습니다.</p>';
          return;
        }
        data.forEach(r => {
          const classInfo = classData.find(c => c.id === r.classId) || { title: `<span class="text-accent">Unknown Class (Bug 01: Integrity Error)</span>` };
          const div = document.createElement('div');
          div.className = 'review-card'; // Reuse style
          div.innerHTML = `
            <div class="review-header">
              <strong>${classInfo.title}</strong>
              <span class="text-muted">${r.date}</span>
            </div>
            <p>신청자: ${r.user}</p>
            <p class="text-xs text-muted mt-1">ID: ${r.id}</p>
          `;
          myReservationsList.appendChild(div);
        });
      });
  }

  function fetchReviews() {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        reviewList.innerHTML = '';
        data.forEach(r => {
          const div = document.createElement('div');
          div.className = 'review-card';
          div.innerHTML = `
            <div class="review-header">
              <strong>${r.user}</strong>
              <span style="color:gold;">${'★'.repeat(r.rating)}</span>
            </div>
            <p>"${r.content}"</p>
            <div class="mt-2 text-right">
              <button class="btn-delete" data-bug-id="site013-bug02" onclick="deleteReview('${r.id}')">삭제 (Bug 02: GET)</button>
            </div>
          `;
          reviewList.appendChild(div);
        });
      });
  }

  // 후기 삭제 (Bug 02: GET 메서드 오용)
  window.deleteReview = (id) => {
    if(!confirm('정말 삭제하시겠습니까? (GET 요청이 발송됩니다)')) return;
    
    fetch(`/api/reviews/delete/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          showToast('후기가 삭제되었습니다.');
          fetchReviews();
        }
      });
  };

  // Bug 01 테스트: 외래키 검증 누락
  testIntegrityBtn.onclick = () => {
    showToast('존재하지 않는 클래스(dummy_id)로 예약을 시도합니다.');
    postReservation('dummy_id', '2024-12-25', '해커_블랙');
  };

  // Bug 03 테스트: CSRF 공격 시뮬레이션
  testCsrfBtn.onclick = () => {
    showToast('CSRF 공격 시뮬레이션: 다른 사이트에서 위조된 폼 전송을 시도합니다.');
    // 실제로는 다른 도메인에서 온 요청처럼 꾸며야 하지만, 
    // 서버가 토큰 검증이 없음을 입증하기 위해 직접 페이로드만 쏴도 성공함을 보여줌
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: 'c1', date: '2099-01-01', user: 'CSRF_ATTACKER' })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) showToast('공격 성공: 권한 검증 없이 예약이 추가되었습니다!');
      fetchMyReservations();
    });
  };

  // 검색 및 필터
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const diff = document.querySelector('.diff-btn.active').dataset.val;

    const filtered = classData.filter(c => {
      const matchTerm = c.title.toLowerCase().includes(term) || c.instructor.toLowerCase().includes(term);
      const matchDiff = diff === 'all' || c.difficulty === diff;
      return matchTerm && matchDiff;
    });
    renderClasses(filtered);
  }

  searchInput.oninput = applyFilters;
  diffBtns.forEach(btn => {
    btn.onclick = () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    };
  });

  // 탭 네비게이션
  function switchTab(btn, view) {
    [navClasses, navReviews, navMy].forEach(b => b.classList.remove('active'));
    [classesView, reviewsView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navClasses.onclick = () => switchTab(navClasses, classesView);
  navReviews.onclick = () => { switchTab(navReviews, reviewsView); fetchReviews(); };
  navMy.onclick = () => { switchTab(navMy, myView); fetchMyReservations(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
