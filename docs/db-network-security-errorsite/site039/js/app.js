document.addEventListener('DOMContentLoaded', () => {
  let stylists = [];
  let services = [];
  let selectedStylistId = null;
  let selectedServiceId = null;
  let selectedTime = null;

  const stylistGrid = document.getElementById('stylist-grid');
  const serviceList = document.getElementById('service-list');
  const timeGrid = document.getElementById('time-grid');
  const bookingDate = document.getElementById('booking-date');
  
  const navHome = document.getElementById('nav-home');
  const navMy = document.getElementById('nav-my');
  
  const step1View = document.getElementById('step1-view');
  const step2View = document.getElementById('step2-view');
  const myView = document.getElementById('my-view');

  const bookingListEl = document.getElementById('booking-list');
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const placeBookingBtn = document.getElementById('place-booking-btn');
  const backToStep1 = document.getElementById('back-to-step1');
  const toast = document.getElementById('toast');

  function init() {
    fetchStylists();
    fetchServices();
  }

  function fetchStylists() {
    fetch('/api/stylists')
      .then(res => res.json())
      .then(data => {
        stylists = data;
        renderStylists();
      });
  }

  function fetchServices() {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        services = data;
        renderServices();
      });
  }

  function renderStylists() {
    stylistGrid.innerHTML = '';
    stylists.forEach(s => {
      const card = document.createElement('div');
      card.className = `card ${s.id === selectedStylistId ? 'selected' : ''}`;
      card.innerHTML = `
        <span class="stylist-rank">${s.rank}</span>
        <h3>${s.name}</h3>
        <p class="text-sm text-muted">${s.specialty}</p>
      `;
      card.onclick = () => {
        selectedStylistId = s.id;
        renderStylists();
        checkReady();
      };
      stylistGrid.appendChild(card);
    });
  }

  function renderServices() {
    serviceList.innerHTML = '';
    services.forEach(v => {
      const item = document.createElement('div');
      item.className = `service-item ${v.id === selectedServiceId ? 'selected' : ''}`;
      item.innerHTML = `
        <span style="font-weight:700;">${v.name}</span>
        <span class="price">₩${v.price.toLocaleString()}</span>
      `;
      item.onclick = () => {
        selectedServiceId = v.id;
        renderServices();
        checkReady();
      };
      serviceList.appendChild(item);
    });
  }

  function checkReady() {
    if (selectedStylistId && selectedServiceId) {
      setTimeout(() => {
        step1View.style.display = 'none';
        step2View.style.display = 'block';
        fetchTimes();
      }, 500);
    }
  }

  // 예약 가능 시간 조회 (Bug 01: 이미 예약된 시간도 반환됨)
  function fetchTimes() {
    const date = bookingDate.value;
    fetch(`/api/stylists/${selectedStylistId}/times?date=${date}`)
      .then(res => res.json())
      .then(times => {
        timeGrid.innerHTML = '';
        times.forEach(t => {
          const btn = document.createElement('button');
          btn.className = `time-btn ${t === selectedTime ? 'selected' : ''}`;
          btn.innerText = t;
          btn.onclick = () => {
            selectedTime = t;
            fetchTimes(); // Re-render for selection
          };
          timeGrid.appendChild(btn);
        });
      });
  }

  // 예약 신청 (Bug 02: 중복 제출 허용)
  placeBookingBtn.onclick = () => {
    if (!selectedTime) return showToast('예약 시간을 선택해 주세요.');

    // Bug 02: 버튼 비활성화 로직이 없어 연타 시 중복 요청 발생
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stylistId: selectedStylistId,
        serviceId: selectedServiceId,
        time: selectedTime,
        date: bookingDate.value,
        userId: 'user_A'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('살롱 예약이 확정되었습니다. 방문해 주셔서 감사합니다.');
        resetBooking();
        switchTab(navMy, myView);
        fetchMyBookings();
      }
    });
  };

  function fetchMyBookings() {
    fetch('/api/my-bookings/user_A')
      .then(res => res.json())
      .then(data => {
        bookingListEl.innerHTML = '';
        data.forEach(bk => {
          const stylist = stylists.find(s => s.id === bk.stylistId) || { name: '디자이너' };
          const service = services.find(v => v.id === bk.serviceId) || { name: '시술' };
          const div = document.createElement('div');
          div.className = 'service-item mt-3';
          div.innerHTML = `
            <div>
              <strong>${stylist.name} - ${service.name}</strong>
              <p class="text-sm text-muted">${bk.date} ${bk.time}</p>
            </div>
            <button onclick="window.viewBooking('${bk.id}')" style="background:none; border:none; color:var(--gold); font-weight:800; cursor:pointer;">상세보기</button>
          `;
          bookingListEl.appendChild(div);
        });
      });
  }

  // 예약 상세 조회 (Bug 03: IDOR 테스트용)
  window.viewBooking = (id) => {
    modalBody.innerHTML = '<p>데이터를 불러오는 중...</p>';
    modal.style.display = 'block';

    fetch(`/api/bookings/${id}`)
      .then(res => res.json())
      .then(bk => {
        const stylist = stylists.find(s => s.id === bk.stylistId) || { name: '디자이너' };
        const service = services.find(v => v.id === bk.serviceId) || { name: '시술' };
        modalBody.innerHTML = `
          <h2 style="font-family:'Playfair Display'; color:var(--gold);">RESERVATION</h2>
          <div class="mt-4" style="background:var(--gold-light); padding:25px; border-radius:20px;">
            <p><strong>디자이너:</strong> ${stylist.name}</p>
            <p class="mt-2"><strong>서비스:</strong> ${service.name}</p>
            <p class="mt-2"><strong>일시:</strong> ${bk.date} ${bk.time}</p>
            <p class="mt-2"><strong>상태:</strong> ${bk.status}</p>
          </div>
          <p class="mt-4 text-xs text-muted">※ 예약 번호: ${bk.id}</p>
        `;
      });
  };

  function resetBooking() {
    selectedStylistId = null;
    selectedServiceId = null;
    selectedTime = null;
    renderStylists();
    renderServices();
    step1View.style.display = 'block';
    step2View.style.display = 'none';
  }

  backToStep1.onclick = () => {
    step1View.style.display = 'block';
    step2View.style.display = 'none';
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navMy].forEach(b => b.classList.remove('active'));
    [step1View, step2View, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyBookings();
    if (view === step1View) resetBooking();
  }

  navHome.onclick = () => switchTab(navHome, step1View);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
