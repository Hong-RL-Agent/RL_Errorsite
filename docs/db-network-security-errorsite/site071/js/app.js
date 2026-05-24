document.addEventListener('DOMContentLoaded', () => {
  let classes = [];
  let currentRegion = 'All';
  let activeClassId = null;

  const classGrid = document.getElementById('class-grid');
  const classSearch = document.getElementById('class-search');
  const regionFilter = document.getElementById('region-filter');
  
  const navDiscover = document.getElementById('nav-discover');
  const navMyBookings = document.getElementById('nav-my-bookings');
  
  const discoverView = document.getElementById('discover-view');
  const myView = document.getElementById('my-view');

  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const bookBtn = document.getElementById('book-btn');
  const bookingNameInput = document.getElementById('booking-name');

  const toast = document.getElementById('toast');

  function init() {
    fetchClasses();
  }

  // 클래스 조회 (Bug 02: API 스키마 불일치 - seatsLeft 대신 remainSeats가 옴)
  function fetchClasses() {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        classes = data;
        renderClasses();
      });
  }

  function renderClasses() {
    classGrid.innerHTML = '';
    const term = classSearch.value.toLowerCase();
    const filtered = classes.filter(c => 
      (c.title.toLowerCase().includes(term) || c.category.toLowerCase().includes(term)) &&
      (currentRegion === 'All' || c.location === currentRegion)
    );

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'class-card';
      // INTENTIONAL BUG: site071-bug02 
      // 클라이언트는 c.seatsLeft를 기대하지만 서버는 remainSeats를 보내므로 렌더링 시 'NaN' 또는 'undefined' 노출 가능
      card.innerHTML = `
        <div class="card-image">✨</div>
        <div class="card-content">
          <span class="class-tag">${c.category}</span>
          <h3>${c.title}</h3>
          <p class="class-meta">📍 ${c.location} | 📅 ${c.date}</p>
          <p class="text-sm text-muted">강사: ${c.instructor}</p>
        </div>
        <div class="card-footer">
          <span class="price">₩${c.price.toLocaleString()}</span>
          <span class="seats">잔여 ${c.seatsLeft !== undefined ? c.seatsLeft : '?'}석 / 정원 ${c.maxCapacity}명</span>
        </div>
      `;
      card.onclick = () => openDetail(c);
      classGrid.appendChild(card);
    });
  }

  function openDetail(item) {
    activeClassId = item.id;
    modalBody.innerHTML = `
      <div style="color:var(--coral); font-weight:800; font-size:0.75rem; letter-spacing:1px; margin-bottom:10px;">CLASS DETAILS</div>
      <h2 style="font-size:2.5rem; font-weight:800; line-height:1.2;">${item.title}</h2>
      <div class="mt-4 p-5" style="background:var(--sand); border-radius:20px; border:1px solid var(--border);">
        <p><strong>일시:</strong> ${item.date}</p>
        <p class="mt-1"><strong>장소:</strong> ${item.location}</p>
        <p class="mt-1"><strong>가격:</strong> ₩${item.price.toLocaleString()}</p>
        <p class="mt-1"><strong>강사:</strong> ${item.instructor}</p>
      </div>
      <p class="mt-4 text-sm text-muted" style="line-height:1.8;">
        일상에 활력을 불어넣는 특별한 시간을 선물하세요. 
        초보자도 쉽고 즐겁게 참여할 수 있도록 강사님이 직접 가이드해 드립니다.
      </p>
    `;
    bookingNameInput.value = '';
    detailModal.style.display = 'block';
  }

  // 예약 신청 (Bug 01: 정원 초과 허용, Bug 03: 인증 토큰 누락)
  bookBtn.onclick = () => {
    const userName = bookingNameInput.value;
    if (!userName) return showToast('성함을 입력해 주세요.');

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
        // INTENTIONAL BUG: site071-bug03 
        // 인증 토큰을 보내야 하지만 생략함 (서버도 검증 안 함)
      },
      body: JSON.stringify({ classId: activeClassId, userName })
    })
    .then(res => res.json())
    .then(data => {
      showToast(data.message);
      detailModal.style.display = 'none';
      fetchClasses(); // 목록 갱신
    });
  };

  classSearch.oninput = () => renderClasses();
  regionFilter.onchange = (e) => {
    currentRegion = e.target.value;
    renderClasses();
  };

  function switchTab(btn, view) {
    [navDiscover, navMyBookings].forEach(b => b.classList.remove('active'));
    [discoverView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === myView) fetchMyBookings();
  }

  function fetchMyBookings() {
    // 실습을 위해 간단히 구현
    const list = document.getElementById('booking-list');
    list.innerHTML = '<p class="p-5 text-center text-muted">예약된 내역이 여기에 표시됩니다.</p>';
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navMyBookings.onclick = () => switchTab(navMyBookings, myView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
