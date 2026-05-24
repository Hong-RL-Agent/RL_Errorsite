document.addEventListener('DOMContentLoaded', () => {
  let seats = [];
  let myPasses = [];
  let selectedSeatId = null;

  const seatGrid = document.getElementById('seat-grid');
  const navSeats = document.getElementById('nav-seats');
  const navPasses = document.getElementById('nav-passes');
  const navMy = document.getElementById('nav-my');
  
  const seatsView = document.getElementById('seats-view');
  const passesView = document.getElementById('passes-view');
  const myView = document.getElementById('my-view');

  const myPassListEl = document.getElementById('my-pass-list');
  const passSelect = document.getElementById('pass-select');
  const resModal = document.getElementById('res-modal');
  const modalBody = document.getElementById('modal-body');
  const confirmResBtn = document.getElementById('confirm-res-btn');
  const closeBtn = document.querySelector('.close');
  
  const detailModal = document.getElementById('detail-modal');
  const detailBody = document.getElementById('detail-body');
  const closeDetailBtn = document.querySelector('.close-detail');

  const toast = document.getElementById('toast');

  function init() {
    fetchSeats();
    fetchMyPasses();
  }

  function fetchSeats() {
    fetch('/api/seats')
      .then(res => res.json())
      .then(data => {
        seats = data;
        renderSeats();
      });
  }

  function renderSeats() {
    seatGrid.innerHTML = '';
    seats.forEach(s => {
      const card = document.createElement('div');
      card.className = `seat-card ${s.occupied ? 'occupied' : ''}`;
      card.innerHTML = `
        <div style="font-family:Crimson Pro; font-size:1.4rem; font-weight:700;">${s.id}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:5px;">${s.type} Zone</div>
      `;
      if (!s.occupied) {
        card.onclick = () => {
          document.querySelectorAll('.seat-card.selected').forEach(el => el.classList.remove('selected'));
          card.classList.add('selected');
          selectedSeatId = s.id;
          openResModal(s);
        };
      }
      seatGrid.appendChild(card);
    });
  }

  function openResModal(seat) {
    modalBody.innerHTML = `
      <h2 style="font-family:Crimson Pro; color:var(--wood); font-size:2rem;">좌석 예약</h2>
      <p class="mt-2">선택하신 <strong>${seat.id} (${seat.type} 존)</strong> 좌석을 예약하시겠습니까?</p>
    `;
    updatePassSelect();
    resModal.style.display = 'block';
  }

  function updatePassSelect() {
    passSelect.innerHTML = myPasses.map(p => `
      <option value="${p.id}">${p.type} (잔여: ${p.remaining}h / 만료: ${p.expiredAt})</option>
    `).join('');
  }

  // 예약 확정 (Bug 01: 만료된 이용권 필터링 누락)
  confirmResBtn.onclick = () => {
    const passId = passSelect.value;
    if (!passId) return showToast('이용권을 선택해 주세요.');

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_A', passId, seatId: selectedSeatId })
    })
    .then(res => res.json())
    .then(data => {
      showToast('예약이 완료되었습니다. 이용 부탁드립니다.');
      resModal.style.display = 'none';
      fetchSeats();
    });
  };

  // 이용권 구매 (Bug 02: 실패해도 201 상태코드 반환)
  window.buyPass = (type, price) => {
    fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, price })
    })
    .then(res => {
      // Bug 02: 실패 시에도 201이 오기 때문에 여기서 성공으로 오해함
      if (res.status === 201) return res.json();
      throw new Error('결제 서버 통신 오류');
    })
    .then(data => {
      if (data.success) {
        showToast('이용권 구매가 완료되었습니다.');
        fetchMyPasses();
        switchTab(navMy, myView);
      } else {
        // 실제 데이터에는 실패 메시지가 들어있음
        showToast(data.message);
      }
    })
    .catch(err => showToast(err.message));
  };

  function fetchMyPasses() {
    fetch('/api/my-passes/user_A')
      .then(res => res.json())
      .then(data => {
        myPasses = data;
        myPassListEl.innerHTML = '';
        if (data.length === 0) {
          myPassListEl.innerHTML = '<p class="text-muted p-5 text-center">보유하신 이용권이 없습니다.</p>';
          return;
        }
        data.forEach(p => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong style="font-size:1.2rem; color:var(--wood);">${p.type}</strong>
              <p class="text-sm text-muted">유효기간: ${p.expiredAt} 까지</p>
            </div>
            <button class="btn-green" style="padding:10px 20px; font-size:0.8rem;" onclick="viewDetail('${p.id}')">상세 내역</button>
          `;
          myPassListEl.appendChild(div);
        });
      });
  }

  // 이용권 상세 내역 (Bug 03: IDOR 취약점 테스트용)
  window.viewDetail = (id) => {
    detailModal.style.display = 'block';
    detailBody.innerHTML = '<p>불러오는 중...</p>';
    fetch(`/api/passes/${id}`)
      .then(res => res.json())
      .then(data => {
        detailBody.innerHTML = `
          <h2 style="font-family:Crimson Pro; color:var(--green); font-size:2rem;">PASS DETAILS</h2>
          <div class="mt-4 p-5" style="background:var(--green-light); border-radius:12px;">
            <p><strong>이용권 종류:</strong> ${data.type}</p>
            <p class="mt-1"><strong>잔여 시간:</strong> ${data.remaining}시간</p>
            <p class="mt-1"><strong>만료 일자:</strong> ${data.expiredAt}</p>
            <p class="mt-1"><strong>소유자 ID:</strong> ${data.userId}</p>
          </div>
          <p class="mt-4 text-xs text-muted">※ 이용권은 환불 규정에 따라 부분 취소가 불가능할 수 있습니다.</p>
        `;
      });
  };

  function switchTab(btn, view) {
    [navSeats, navPasses, navMy].forEach(b => b.classList.remove('active'));
    [seatsView, passesView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyPasses();
  }

  navSeats.onclick = () => switchTab(navSeats, seatsView);
  navPasses.onclick = () => switchTab(navPasses, passesView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => resModal.style.display = 'none';
  closeDetailBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == resModal) resModal.style.display = 'none';
    if (e.target == detailModal) detailModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
