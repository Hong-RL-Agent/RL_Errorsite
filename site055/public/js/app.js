document.addEventListener('DOMContentLoaded', () => {
  let screenings = [];
  let seats = [];
  let activeScreeningId = null;
  let selectedSeatId = null;

  const movieGrid = document.getElementById('movie-grid');
  const movieSearch = document.getElementById('movie-search');
  const dateFilters = document.querySelectorAll('.filter-btn');
  
  const navMovies = document.getElementById('nav-movies');
  const navMy = document.getElementById('nav-my');
  
  const moviesView = document.getElementById('movies-view');
  const myView = document.getElementById('my-view');

  const myResListEl = document.getElementById('my-res-list');
  const seatModal = document.getElementById('seat-modal');
  const modalBody = document.getElementById('modal-body');
  const seatGridEl = document.getElementById('seat-grid');
  const closeBtn = document.querySelector('.close');
  const reserveBtn = document.getElementById('reserve-btn');
  
  const detailModal = document.getElementById('detail-modal');
  const detailBody = document.getElementById('detail-body');
  const closeDetailBtn = document.querySelector('.close-detail');

  const toast = document.getElementById('toast');

  function init() {
    fetchScreenings();
  }

  function fetchScreenings() {
    fetch('/api/screenings')
      .then(res => res.json())
      .then(data => {
        screenings = data;
        renderMovies();
      });
  }

  function renderMovies() {
    movieGrid.innerHTML = '';
    const term = movieSearch.value.toLowerCase();
    const activeDate = document.querySelector('.filter-btn.active').dataset.date;
    
    const filtered = screenings.filter(s => 
      s.date === activeDate && s.title.toLowerCase().includes(term)
    );

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="card-img">🎬</div>
        <div class="card-body">
          <div class="meta" style="color:var(--red); font-weight:700;">${s.time} | ${s.room}</div>
          <h3 class="mt-1">${s.title}</h3>
          <p class="text-xs text-muted">예매 가능 좌석 확인 후 선택해 주세요.</p>
        </div>
      `;
      card.onclick = () => openSeatModal(s);
      movieGrid.appendChild(card);
    });
  }

  function openSeatModal(screening) {
    activeScreeningId = screening.id;
    selectedSeatId = null;
    modalBody.innerHTML = `
      <h2 style="font-family:Bebas Neue; font-size:2.5rem; letter-spacing:1px;">${screening.title}</h2>
      <p class="text-red font-bold">${screening.date} ${screening.time} | ${screening.room}</p>
    `;
    
    fetch('/api/seats')
      .then(res => res.json())
      .then(data => {
        seats = data;
        renderSeatGrid();
        seatModal.style.display = 'block';
      });
  }

  function renderSeatGrid() {
    seatGridEl.innerHTML = '';
    seats.forEach(s => {
      const el = document.createElement('div');
      el.className = `seat ${s.status}`;
      el.innerText = s.id.split('-')[1];
      
      if (s.status === 'available') {
        el.onclick = () => {
          document.querySelectorAll('.seat.selected').forEach(sel => sel.classList.remove('selected'));
          el.classList.add('selected');
          selectedSeatId = s.id;
        };
      }
      seatGridEl.appendChild(el);
    });
  }

  // 예약 처리 (Bug 01: 좌석 상태 업데이트 누락, Bug 02: 중복 예약 허용)
  reserveBtn.onclick = () => {
    if (!selectedSeatId) return showToast('좌석을 선택해 주세요.');

    const body = { userId: 'user_A', screeningId: activeScreeningId, seatId: selectedSeatId };

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      showToast('예약이 성공적으로 완료되었습니다.');
      seatModal.style.display = 'none';
      switchTab(navMy, myView);
    });
  };

  function fetchMyReservations() {
    fetch('/api/my-reservations/user_A')
      .then(res => res.json())
      .then(data => {
        myResListEl.innerHTML = '';
        if (data.length === 0) {
          myResListEl.innerHTML = '<p class="text-muted p-5 text-center">예매 내역이 없습니다.</p>';
          return;
        }
        data.forEach(r => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>${r.screening.title}</strong>
              <p class="text-sm text-muted">${r.screening.date} ${r.screening.time} | 좌석: ${r.seatId}</p>
            </div>
            <button class="btn-red" style="padding:10px 20px; font-size:0.8rem;" onclick="viewDetail('${r.id}')">상세 보기</button>
          `;
          myResListEl.appendChild(div);
        });
      });
  }

  // 예매 상세 조회 (Bug 03: IDOR 취약점 테스트용)
  window.viewDetail = (id) => {
    detailModal.style.display = 'block';
    detailBody.innerHTML = '<p>데이터 로딩 중...</p>';
    fetch(`/api/reservations/${id}`)
      .then(res => res.json())
      .then(data => {
        detailBody.innerHTML = `
          <h2 style="font-family:Bebas Neue; color:var(--red); font-size:2rem;">RESERVATION DETAIL</h2>
          <div class="mt-4 p-5" style="background:var(--grey); border-radius:8px;">
            <p><strong>영화:</strong> ${data.screening.title}</p>
            <p class="mt-1"><strong>상영 정보:</strong> ${data.screening.date} ${data.screening.time}</p>
            <p class="mt-1"><strong>예약 좌석:</strong> ${data.seatId}</p>
            <p class="mt-1"><strong>예약 번호:</strong> ${data.id}</p>
            <p class="mt-1"><strong>작성자 ID:</strong> ${data.userId}</p>
          </div>
          <p class="mt-4 text-xs text-muted">※ 상영 1시간 전까지 취소가 가능합니다.</p>
        `;
      });
  };

  movieSearch.oninput = () => renderMovies();
  dateFilters.forEach(btn => {
    btn.onclick = () => {
      dateFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMovies();
    };
  });

  function switchTab(btn, view) {
    [navMovies, navMy].forEach(b => b.classList.remove('active'));
    [moviesView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyReservations();
  }

  navMovies.onclick = () => switchTab(navMovies, moviesView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => seatModal.style.display = 'none';
  closeDetailBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == seatModal) seatModal.style.display = 'none';
    if (e.target == detailModal) detailModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
