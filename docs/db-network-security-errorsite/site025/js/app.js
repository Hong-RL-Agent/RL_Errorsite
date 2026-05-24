document.addEventListener('DOMContentLoaded', () => {
  let exhibitions = [];
  let selectedEx = null;
  let ticketQty = 1;

  const exGrid = document.getElementById('ex-grid');
  const exSearchInput = document.getElementById('ex-search');
  
  const navExhibitions = document.getElementById('nav-exhibitions');
  const navMyTickets = document.getElementById('nav-my-tickets');
  const navArtists = document.getElementById('nav-artists');
  
  const exView = document.getElementById('ex-view');
  const ticketsView = document.getElementById('tickets-view');
  const artistsView = document.getElementById('artists-view');

  const ticketListEl = document.getElementById('ticket-list');
  const artistGrid = document.getElementById('artist-grid');
  const testIdorBtn = document.getElementById('test-idor-btn');
  
  const modal = document.getElementById('book-modal');
  const closeBtn = document.querySelector('.close');
  const submitBookingBtn = document.getElementById('submit-booking');
  const qtyInput = document.getElementById('ticket-qty');
  const modalTotal = document.getElementById('modal-total');
  const modalRemaining = document.getElementById('modal-remaining');
  const toast = document.getElementById('toast');

  function init() {
    fetchExhibitions();
  }

  function fetchExhibitions() {
    fetch('/api/exhibitions')
      .then(res => res.json())
      .then(data => {
        exhibitions = data;
        renderExhibitions(data);
      });
  }

  function renderExhibitions(data) {
    exGrid.innerHTML = '';
    const term = exSearchInput.value.toLowerCase();
    const filtered = data.filter(ex => 
      ex.title.toLowerCase().includes(term) || ex.artist.toLowerCase().includes(term)
    );

    filtered.forEach(ex => {
      const card = document.createElement('div');
      card.className = 'ex-card';
      card.innerHTML = `
        <p class="text-muted">${ex.location}</p>
        <h3>${ex.title}</h3>
        <p>${ex.artist}</p>
        <div class="ex-price">${ex.price.toLocaleString()}원</div>
      `;
      card.onclick = () => openBookModal(ex);
      exGrid.appendChild(card);
    });
  }

  function openBookModal(ex) {
    selectedEx = ex;
    ticketQty = 1;
    qtyInput.value = 1;
    document.getElementById('modal-title').innerText = ex.title;
    document.getElementById('modal-artist').innerText = ex.artist;
    updateModalTotal();
    modal.style.display = 'block';

    // Bug 02: 잔여 수량 조회 (항상 고정된 50 반환)
    fetch(`/api/exhibitions/${ex.id}/remaining`)
      .then(res => res.json())
      .then(data => {
        modalRemaining.innerText = data.remaining + '장 (실제: ' + ex.remainingTickets + ')';
      });
  }

  function updateModalTotal() {
    modalTotal.innerText = (selectedEx.price * ticketQty).toLocaleString();
  }

  document.getElementById('qty-plus').onclick = () => { ticketQty++; qtyInput.value = ticketQty; updateModalTotal(); };
  document.getElementById('qty-minus').onclick = () => { if(ticketQty > 1) { ticketQty--; qtyInput.value = ticketQty; updateModalTotal(); } };

  // 예매 신청 (Bug 01: 수량 검증 오류)
  submitBookingBtn.onclick = () => {
    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exhibitionId: selectedEx.id, user: '홍길동', quantity: ticketQty })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('예매가 확정되었습니다! (Bug 01 테스트: 잔여 수량 초과 가능)');
        modal.style.display = 'none';
        fetchExhibitions(); // 잔여 수량 갱신 시도
      }
    });
  };

  function fetchMyTickets() {
    // 실제로는 전체 조회가 아니라 내 티켓을 가져와야 함 (간략화)
    fetch('/api/tickets/tk-1001') 
      .then(res => res.json())
      .then(ticketData => {
        renderTickets([ticketData]);
      });
  }

  function renderTickets(data) {
    ticketListEl.innerHTML = '';
    data.forEach(tk => {
      const ex = exhibitions.find(e => e.id === tk.exhibitionId) || { title: '전시회' };
      const card = document.createElement('div');
      card.className = 'ticket-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3>${ex.title}</h3>
            <p class="mt-2">예매자: ${tk.user} | 수량: ${tk.quantity}매</p>
            <p class="text-muted mt-1">Ticket ID: ${tk.id}</p>
          </div>
          <div style="font-size:3rem;">🎟️</div>
        </div>
      `;
      ticketListEl.appendChild(card);
    });
  }

  function fetchArtists() {
    fetch('/api/artists')
      .then(res => res.json())
      .then(data => {
        artistGrid.innerHTML = '';
        data.forEach(art => {
          const card = document.createElement('div');
          card.className = 'ex-card';
          card.innerHTML = `
            <h3>${art.name}</h3>
            <p class="text-accent">${art.period}</p>
            <p class="mt-3">${art.desc}</p>
          `;
          artistGrid.appendChild(card);
        });
      });
  }

  // Bug 03: IDOR 테스트
  testIdorBtn.onclick = () => {
    const targetId = prompt('조회할 티켓 ID를 입력하세요 (예: tk-9999)', 'tk-9999');
    if (targetId) {
      fetch(`/api/tickets/${targetId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) return showToast(data.error);
          showToast('비인가 티켓 정보 조회 성공 (Bug 03)');
          ticketListEl.innerHTML = `
            <div class="ticket-card" style="border-left-color:red; background:#FFF5F5;">
              <h3>[비인가] ${data.user} 님의 티켓</h3>
              <p class="mt-2">수량: ${data.quantity}매 | 결제금액: ${data.total.toLocaleString()}원</p>
              <p class="mt-1" style="color:red;">비밀 메모: ${data.secretNote || '없음'}</p>
            </div>
          `;
        });
    }
  };

  exSearchInput.oninput = () => renderExhibitions(exhibitions);

  // 탭 전환
  function switchTab(btn, view) {
    [navExhibitions, navMyTickets, navArtists].forEach(b => b.classList.remove('active'));
    [exView, ticketsView, artistsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navExhibitions.onclick = () => switchTab(navExhibitions, exView);
  navMyTickets.onclick = () => { switchTab(navMyTickets, ticketsView); fetchMyTickets(); };
  navArtists.onclick = () => { switchTab(navArtists, artistsView); fetchArtists(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
