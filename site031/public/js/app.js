document.addEventListener('DOMContentLoaded', () => {
  let games = [];
  let currentTeam = 'all';
  let selectedGame = null;
  let selectedSeat = null;
  let currentDiscount = 0;

  const gameGrid = document.getElementById('game-grid');
  const teamChips = document.querySelectorAll('.filter-chip');
  
  const navBookings = document.getElementById('nav-bookings');
  const backToGames = document.getElementById('back-to-games');
  
  const gameView = document.getElementById('game-view');
  const bookingsView = document.getElementById('bookings-view');

  const bookingListEl = document.getElementById('booking-list');
  const seatGrid = document.getElementById('seat-grid');
  
  const modal = document.getElementById('seat-modal');
  const closeBtn = document.querySelector('.close');
  const applyDiscountBtn = document.getElementById('apply-discount-btn');
  const confirmBookingBtn = document.getElementById('confirm-booking-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchGames();
  }

  function fetchGames() {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        games = data;
        renderGames();
      });
  }

  function renderGames() {
    gameGrid.innerHTML = '';
    const filtered = games.filter(g => 
      currentTeam === 'all' || g.home === currentTeam || g.away === currentTeam
    );

    filtered.forEach(g => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <div class="game-teams">${g.home} vs ${g.away}</div>
        <div class="game-meta">🗓️ ${g.date} | 🕒 ${g.time}<br>📍 ${g.venue}</div>
        <div class="game-price">${g.price.toLocaleString()}원 부터</div>
      `;
      card.onclick = () => openSeatModal(g);
      gameGrid.appendChild(card);
    });
  }

  function openSeatModal(game) {
    selectedGame = game;
    selectedSeat = null;
    currentDiscount = 0;
    document.getElementById('modal-game-title').innerText = `${game.home} vs ${game.away}`;
    document.getElementById('modal-game-info').innerText = `${game.date} ${game.time} | ${game.venue}`;
    document.getElementById('selected-seat-id').innerText = '-';
    document.getElementById('discount-code').value = '';
    updatePrices();

    // Fetch reserved seats
    fetch(`/api/seats/${game.id}`)
      .then(res => res.json())
      .then(data => {
        renderSeats(data.reserved);
        modal.style.display = 'block';
      });
  }

  function renderSeats(reserved) {
    seatGrid.innerHTML = '';
    const rows = ['A', 'B', 'C', 'D'];
    for (let r of rows) {
      for (let i = 1; i <= 10; i++) {
        const seatId = `${r}${i}`;
        const btn = document.createElement('button');
        btn.className = `seat ${reserved.includes(seatId) ? 'reserved' : ''}`;
        btn.innerText = seatId;
        btn.disabled = reserved.includes(seatId);
        btn.onclick = () => {
          if (btn.disabled) return;
          document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSeat = seatId;
          document.getElementById('selected-seat-id').innerText = seatId;
        };
        seatGrid.appendChild(btn);
      }
    }
  }

  function updatePrices() {
    const base = selectedGame.price;
    const final = base * (1 - currentDiscount / 100);
    document.getElementById('ticket-price').innerText = `${base.toLocaleString()}원`;
    document.getElementById('final-price').innerText = `${final.toLocaleString()}원`;
  }

  // 할인 코드 적용 (Bug 03: 권한 검증 누락)
  applyDiscountBtn.onclick = () => {
    const code = document.getElementById('discount-code').value.trim();
    if (!code) return;

    fetch('/api/discounts/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId: 'UA_SportsFan' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        currentDiscount = data.discountPercent;
        updatePrices();
        showToast(`할인이 적용되었습니다! (${currentDiscount}%)`);
      } else {
        showToast(data.error || '유효하지 않은 코드입니다.');
      }
    });
  };

  // 예매 확정 (Bug 01: 중복 예약 허용, Bug 02: 연타 가능)
  confirmBookingBtn.onclick = () => {
    if (!selectedSeat) return showToast('좌석을 선택해 주세요.');

    // Bug 02: 버튼 비활성화 로직 생략 (network-duplicate-submit)
    // confirmBookingBtn.disabled = true;

    showToast('예매 요청을 처리 중입니다...');

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        gameId: selectedGame.id, 
        seatId: selectedSeat, 
        userId: 'UA_SportsFan' 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('티켓 예매가 완료되었습니다! 내역을 확인해 보세요.');
        modal.style.display = 'none';
        fetchBookings();
      }
    });
  };

  function fetchBookings() {
    fetch('/api/bookings/UA_SportsFan')
      .then(res => res.json())
      .then(data => {
        bookingListEl.innerHTML = '';
        data.forEach(bk => {
          const game = games.find(g => g.id === bk.gameId) || { home: 'Team', away: 'Team' };
          const div = document.createElement('div');
          div.className = 'booking-card';
          div.innerHTML = `
            <div class="bk-info">
              <strong style="font-size:1.1rem;">${game.home} vs ${game.away}</strong>
              <p class="text-muted mt-1">좌석: ${bk.seatId} | 예매번호: ${bk.id}</p>
            </div>
            <div class="bk-status" style="color:var(--blue); font-weight:800;">CONFIRMED</div>
          `;
          bookingListEl.appendChild(div);
        });
      });
  }

  teamChips.forEach(chip => {
    chip.onclick = () => {
      teamChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentTeam = chip.dataset.team;
      renderGames();
    };
  });

  // 탭 전환
  function switchTab(view) {
    gameView.style.display = view === 'game' ? 'block' : 'none';
    bookingsView.style.display = view === 'bookings' ? 'block' : 'none';
  }

  navBookings.onclick = () => { switchTab('bookings'); fetchBookings(); };
  backToGames.onclick = () => switchTab('game');

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
