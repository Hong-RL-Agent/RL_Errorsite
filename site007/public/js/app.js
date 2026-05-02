document.addEventListener('DOMContentLoaded', () => {
  let roomsData = [];
  let currentRoomId = null;
  let currentDate = document.getElementById('date-picker').value;
  let currentTime = null;

  // Elements
  const navBook = document.getElementById('nav-book');
  const navMy = document.getElementById('nav-my');
  const navInfo = document.getElementById('nav-info');
  const bookView = document.getElementById('book-view');
  const myView = document.getElementById('my-view');
  const infoView = document.getElementById('info-view');

  const roomFilter = document.getElementById('room-filter');
  const roomList = document.getElementById('room-list');
  const sectionTimeslots = document.getElementById('section-timeslots');
  const selectedRoomName = document.getElementById('selected-room-name');
  const datePicker = document.getElementById('date-picker');
  const timeGrid = document.getElementById('time-grid');

  const infoRoom = document.getElementById('info-room');
  const infoDatetime = document.getElementById('info-datetime');
  const submitBookingBtn = document.getElementById('submit-booking-btn');
  const bookingForm = document.getElementById('booking-form');

  const myBookingTbody = document.getElementById('my-booking-tbody');
  const fetchAllBtn = document.getElementById('fetch-all-btn');

  const noticeList = document.getElementById('notice-list');
  const noticeError = document.getElementById('notice-error');
  const refreshNoticesBtn = document.getElementById('refresh-notices');
  
  const toast = document.getElementById('toast');

  function init() {
    fetchRooms();
    fetchNotices();
  }

  // Interaction 1: Fetch Rooms
  function fetchRooms() {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        roomsData = data;
        renderRooms(data);
      });
  }

  function renderRooms(data) {
    roomList.innerHTML = '';
    data.forEach(r => {
      const div = document.createElement('div');
      div.className = 'room-card';
      div.dataset.id = r.id;
      div.innerHTML = `
        <div>
          <span class="room-badge">${r.type}</span>
          <strong>${r.name}</strong>
          <div class="text-xs text-muted mt-2">수용인원: ${r.capacity}인</div>
        </div>
        <div>
          <div style="font-weight:bold; color:var(--accent);">${r.pricePerHour.toLocaleString()}원/시간</div>
        </div>
      `;
      
      // Interaction 3: Select Room
      div.addEventListener('click', () => {
        document.querySelectorAll('.room-card').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        currentRoomId = r.id;
        selectedRoomName.innerText = `선택된 룸: ${r.name}`;
        infoRoom.innerText = `룸: ${r.name}`;
        
        sectionTimeslots.style.opacity = '1';
        sectionTimeslots.style.pointerEvents = 'auto';
        
        fetchTimeslots();
      });

      roomList.appendChild(div);
    });
  }

  // Interaction 2: Filter Rooms
  roomFilter.addEventListener('change', (e) => {
    const type = e.target.value;
    if (type === 'all') renderRooms(roomsData);
    else renderRooms(roomsData.filter(r => r.type === type));
    
    currentRoomId = null;
    sectionTimeslots.style.opacity = '0.5';
    sectionTimeslots.style.pointerEvents = 'none';
    submitBookingBtn.disabled = true;
  });

  // Interaction 4: Fetch Timeslots
  function fetchTimeslots() {
    if (!currentRoomId) return;
    fetch(`/api/timeslots?roomId=${currentRoomId}&date=${currentDate}`)
      .then(res => res.json())
      .then(data => {
        timeGrid.innerHTML = '';
        currentTime = null;
        updateFormUI();

        data.forEach(slot => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `time-slot ${slot.isAvailable ? '' : 'disabled'}`;
          btn.innerText = slot.time;
          
          // Interaction 5: Select Timeslot
          // Bug 01 manifestation: We allow clicking even if it has 'disabled' class (for testing DB conflict).
          btn.addEventListener('click', () => {
            document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
            currentTime = slot.time;
            updateFormUI();
          });

          timeGrid.appendChild(btn);
        });
      });
  }

  datePicker.addEventListener('change', (e) => {
    currentDate = e.target.value;
    fetchTimeslots();
  });

  function updateFormUI() {
    if (currentRoomId && currentTime) {
      infoDatetime.innerText = `일시: ${currentDate} ${currentTime}`;
      submitBookingBtn.disabled = false;
    } else {
      infoDatetime.innerText = `일시: -`;
      submitBookingBtn.disabled = true;
    }
  }

  // Interaction 6: Submit Booking (Triggers Bug 01)
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentRoomId || !currentTime) return;

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: currentRoomId, date: currentDate, time: currentTime, user: 'user123' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('예약이 확정되었습니다.');
        fetchTimeslots(); // Refresh to see disabled slots
      } else {
        showToast('예약 실패: ' + data.error);
      }
    });
  });

  // Interaction 7: Fetch My Bookings
  function fetchBookings(url = '/api/bookings/my?user=user123') {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        myBookingTbody.innerHTML = '';
        if (data.length === 0) {
          myBookingTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">예약 내역이 없습니다.</td></tr>';
          return;
        }

        data.forEach(b => {
          const room = roomsData.find(r => r.id === b.roomId);
          const roomName = room ? room.name : b.roomId;
          const tr = document.createElement('tr');
          const isCancelled = b.status === 'cancelled';
          
          tr.innerHTML = `
            <td><span class="status-badge ${isCancelled ? 'cancelled' : 'confirmed'}">${isCancelled ? '취소됨' : '예약확정'}</span></td>
            <td>
              <div style="font-weight:bold;">${b.id}</div>
              <div class="text-xs text-muted">User: ${b.user}</div>
            </td>
            <td>${roomName}</td>
            <td>${b.date} ${b.time}</td>
            <td>
              ${!isCancelled ? `<button class="btn-outline btn-sm cancel-btn" data-id="${b.id}">취소</button>` : '-'}
            </td>
          `;

          if (!isCancelled) {
            // Interaction 8: Cancel Booking
            tr.querySelector('.cancel-btn').addEventListener('click', () => {
              fetch(`/api/bookings/${b.id}/cancel`, { method: 'POST' })
                .then(() => {
                  showToast('예약이 취소되었습니다.');
                  fetchBookings(url);
                });
            });
          }
          myBookingTbody.appendChild(tr);
        });
      });
  }

  // Interaction 9: Fetch All Bookings (Admin Hack - Bug 03)
  fetchAllBtn.addEventListener('click', () => {
    // Calling admin API without auth headers
    fetchBookings('/api/bookings/all');
    showToast('관리자 API를 호출하여 모든 유저의 예약을 조회합니다.');
  });

  // Interaction 10: Fetch Notices (Triggers Bug 02: CORS)
  function fetchNotices() {
    noticeError.style.display = 'none';
    noticeList.innerHTML = '<li class="text-muted">공지사항을 불러오는 중...</li>';

    fetch('/api/notices')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        noticeList.innerHTML = '';
        data.forEach(n => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${n.title}</strong> <span style="float:right; font-size:0.85rem; color:var(--gray-600);">${n.date}</span>`;
          noticeList.appendChild(li);
        });
      })
      .catch(err => {
        // Bug 02 manifestation: CORS error caught here
        noticeList.innerHTML = '';
        noticeError.style.display = 'block';
        console.error('Fetch error (Likely CORS):', err);
      });
  }

  refreshNoticesBtn.addEventListener('click', () => {
    fetchNotices();
  });

  // Interaction 11: Navigation
  navBook.addEventListener('click', () => {
    navBook.classList.add('active'); navMy.classList.remove('active'); navInfo.classList.remove('active');
    bookView.style.display = 'block'; myView.style.display = 'none'; infoView.style.display = 'none';
  });

  navMy.addEventListener('click', () => {
    navMy.classList.add('active'); navBook.classList.remove('active'); navInfo.classList.remove('active');
    bookView.style.display = 'none'; myView.style.display = 'block'; infoView.style.display = 'none';
    fetchBookings();
  });

  navInfo.addEventListener('click', () => {
    navInfo.classList.add('active'); navBook.classList.remove('active'); navMy.classList.remove('active');
    bookView.style.display = 'none'; myView.style.display = 'none'; infoView.style.display = 'block';
  });

  // Toast
  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
