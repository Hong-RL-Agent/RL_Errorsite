document.addEventListener('DOMContentLoaded', () => {
  let sitters = [];
  let pets = [];
  let selectedSitterId = null;

  const sitterGrid = document.getElementById('sitter-grid');
  const petGrid = document.getElementById('pet-grid');
  const sitterSearch = document.getElementById('sitter-search');
  const sortSelect = document.getElementById('sort-select');
  const bookingPetSelect = document.getElementById('booking-pet');
  
  const navHome = document.getElementById('nav-home');
  const navPets = document.getElementById('nav-pets');
  const navBookings = document.getElementById('nav-bookings');
  
  const homeView = document.getElementById('home-view');
  const petsView = document.getElementById('pets-view');
  const bookingsView = document.getElementById('bookings-view');

  const bookingListEl = document.getElementById('booking-list');
  const bookingModal = document.getElementById('booking-modal');
  const petModal = document.getElementById('pet-modal');
  const petDetailBody = document.getElementById('pet-detail-body');
  const closeBtns = document.querySelectorAll('.close');
  const bookingForm = document.getElementById('booking-form');
  const toast = document.getElementById('toast');

  function init() {
    fetchSitters();
    fetchPets();
  }

  function fetchSitters() {
    fetch('/api/sitters')
      .then(res => res.json())
      .then(data => {
        sitters = data;
        renderSitters();
      });
  }

  function renderSitters() {
    sitterGrid.innerHTML = '';
    const term = sitterSearch.value.toLowerCase();
    const sort = sortSelect.value;

    let filtered = sitters.filter(s => 
      s.name.toLowerCase().includes(term) || s.location.toLowerCase().includes(term)
    );

    if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      filtered.sort((a, b) => a.rate - b.rate);
    }

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${s.name}</h3>
        <span class="loc">📍 ${s.location}</span>
        <p class="text-muted" style="font-size:0.9rem; line-height:1.5;">${s.bio}</p>
        <div class="card-footer">
          <span class="rate">₩${s.rate.toLocaleString()} <span style="font-size:0.7rem; color:var(--text-muted);">/ 1시간</span></span>
          <span class="rating">⭐ ${s.rating}</span>
        </div>
      `;
      card.onclick = () => openBookingModal(s.id);
      sitterGrid.appendChild(card);
    });
  }

  function fetchPets() {
    fetch('/api/pets')
      .then(res => res.json())
      .then(data => {
        pets = data;
        renderPets();
        updateBookingPetList();
      });
  }

  function renderPets() {
    petGrid.innerHTML = '';
    pets.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${p.name}</h3>
        <span class="loc">${p.type} | ${p.breed}</span>
        <p class="text-muted" style="font-size:0.85rem;">나이: ${p.age}살</p>
        <button class="mt-3 btn-primary" style="padding:8px 15px; font-size:0.8rem; background:var(--dark);">상세 정보 보기</button>
      `;
      card.onclick = (e) => {
        e.stopPropagation();
        openPetModal(p.id);
      };
      petGrid.appendChild(card);
    });
  }

  function updateBookingPetList() {
    bookingPetSelect.innerHTML = '<option value="">아이를 선택해 주세요</option>';
    pets.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.innerText = p.name;
      bookingPetSelect.appendChild(opt);
    });
  }

  function openBookingModal(id) {
    selectedSitterId = id;
    const sitter = sitters.find(s => s.id === id);
    document.getElementById('modal-title').innerText = `${sitter.name} 펫시터님 예약`;
    bookingModal.style.display = 'block';
  }

  // 예약 신청 (Bug 01: 날짜 검증 누락, Bug 02: petId 누락 허용)
  bookingForm.onsubmit = (e) => {
    e.preventDefault();
    const petId = bookingPetSelect.value; // Bug 02: 빈 값이 전송될 수 있음
    const startDate = document.getElementById('booking-start').value;
    const endDate = document.getElementById('booking-end').value; // Bug 01: 시작일보다 빠른 날짜 허용

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sitterId: selectedSitterId, petId, startDate, endDate, userId: 'user_A' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('예약이 성공적으로 접수되었습니다!');
        bookingModal.style.display = 'none';
        bookingForm.reset();
        fetchBookings();
      } else {
        showToast(data.error || '예약 중 오류가 발생했습니다.');
      }
    });
  };

  // 펫 상세 조회 (Bug 03: IDOR 취약점 테스트용)
  function openPetModal(id) {
    petDetailBody.innerHTML = '<p>정보를 불러오는 중...</p>';
    petModal.style.display = 'block';

    fetch(`/api/pets/${id}`)
      .then(res => res.json())
      .then(p => {
        petDetailBody.innerHTML = `
          <h2 style="font-family:'Fredoka'; color:var(--orange);">${p.name}</h2>
          <div class="mt-4" style="background:#F9F9F9; padding:20px; border-radius:20px;">
            <p><strong>종류:</strong> ${p.type} (${p.breed})</p>
            <p class="mt-2"><strong>나이:</strong> ${p.age}살</p>
            <p class="mt-2"><strong>참고 사항:</strong> ${p.note}</p>
          </div>
          <p class="mt-4 text-xs text-muted">※ 반려동물 정보는 보안 지침에 따라 안전하게 보관됩니다.</p>
        `;
      });
  }

  function fetchBookings() {
    fetch('/api/bookings/user_A')
      .then(res => res.json())
      .then(data => {
        bookingListEl.innerHTML = '';
        data.forEach(bk => {
          const sitter = sitters.find(s => s.id === bk.sitterId) || { name: '펫시터' };
          const pet = pets.find(p => p.id === bk.petId) || { name: '반려동물' };
          const div = document.createElement('div');
          div.className = 'card';
          div.style.marginBottom = '15px';
          div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:1.1rem;">${sitter.name} 펫시터님</strong>
                <p class="text-muted text-sm mt-1">대상: ${pet.name} | 기간: ${bk.startDate} ~ ${bk.endDate}</p>
              </div>
              <span style="color:var(--orange); font-weight:700;">확정됨</span>
            </div>
          `;
          bookingListEl.appendChild(div);
        });
      });
  }

  sitterSearch.oninput = () => renderSitters();
  sortSelect.onchange = () => renderSitters();

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navPets, navBookings].forEach(b => b.classList.remove('active'));
    [homeView, petsView, bookingsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navPets.onclick = () => { switchTab(navPets, petsView); fetchPets(); };
  navBookings.onclick = () => { switchTab(navBookings, bookingsView); fetchBookings(); };

  closeBtns.forEach(btn => {
    btn.onclick = () => {
      bookingModal.style.display = 'none';
      petModal.style.display = 'none';
    };
  });

  window.onclick = (e) => {
    if (e.target == bookingModal) bookingModal.style.display = 'none';
    if (e.target == petModal) petModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
