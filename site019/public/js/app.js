document.addEventListener('DOMContentLoaded', () => {
  let departments = [];
  let doctors = [];
  let selectedDept = null;
  let selectedDoctor = null;
  let selectedTime = null;

  const deptListEl = document.getElementById('dept-list');
  const doctorGridEl = document.getElementById('doctor-grid');
  const doctorSection = document.getElementById('doctor-section');
  const timeSection = document.getElementById('time-section');
  const timeBtns = document.querySelectorAll('.time-btn');
  const submitBookingBtn = document.getElementById('submit-booking');
  
  const navBook = document.getElementById('nav-book');
  const navMy = document.getElementById('nav-my');
  const bookView = document.getElementById('book-view');
  const myView = document.getElementById('my-view');

  const myAppListEl = document.getElementById('my-app-list');
  const userNameInput = document.getElementById('user-name-input');
  const searchMyBtn = document.getElementById('search-my-btn');

  const toast = document.getElementById('toast');
  const steps = document.querySelectorAll('.step');

  function init() {
    fetchDepartments();
  }

  function fetchDepartments() {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        departments = data;
        renderDepartments(data);
      });
  }

  function renderDepartments(data) {
    deptListEl.innerHTML = '';
    data.forEach(dept => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerText = dept;
      tag.onclick = () => selectDept(tag, dept);
      deptListEl.appendChild(tag);
    });
  }

  function selectDept(el, dept) {
    document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    selectedDept = dept;
    updateStep(1);
    fetchDoctors(dept);
  }

  function fetchDoctors(dept) {
    // Bug 02: 간헐적 실패 시 재시도 로직 없음
    fetch('/api/doctors')
      .then(res => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then(data => {
        doctors = data.filter(d => d.dept === dept);
        renderDoctors(doctors);
        doctorSection.style.display = 'block';
      })
      .catch(err => {
        showToast('의사 목록을 불러오지 못했습니다. (Bug 02: 재시도 없음)');
        doctorGridEl.innerHTML = '<p class="text-danger">오류 발생. 새로고침해 주세요.</p>';
        doctorSection.style.display = 'block';
      });
  }

  function renderDoctors(data) {
    doctorGridEl.innerHTML = '';
    data.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${d.image}" class="doctor-img">
        <div class="doctor-info">
          <h4>${d.name} 원장</h4>
          <p>${d.dept}</p>
        </div>
      `;
      card.onclick = () => selectDoctor(card, d);
      doctorGridEl.appendChild(card);
    });
  }

  function selectDoctor(el, doctor) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    el.style.borderColor = 'var(--primary)';
    selectedDoctor = doctor;
    updateStep(2);
    timeSection.style.display = 'block';
  }

  timeBtns.forEach(btn => {
    btn.onclick = () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTime = btn.dataset.time;
    };
  });

  function updateStep(idx) {
    steps.forEach((s, i) => {
      if(i <= idx) s.classList.add('active');
      else s.classList.remove('active');
    });
  }

  // 예약 신청 (Bug 01: 시간 충돌 오류)
  submitBookingBtn.onclick = () => {
    const date = document.getElementById('reserve-date').value;
    if(!date || !selectedTime || !selectedDoctor) return showToast('날짜와 시간을 모두 선택해 주세요.');

    const payload = {
      doctorId: selectedDoctor.id,
      user: '홍길동',
      date: date,
      time: selectedTime
    };

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        showToast('진료 예약이 확정되었습니다.');
        // Bug 01 확인을 위해 같은 시간으로 또 예약해 볼 수 있음
      }
    });
  };

  // 내 예약 조회 (Bug 03: 개인정보 노출)
  searchMyBtn.onclick = () => {
    const name = userNameInput.value;
    if(!name) return showToast('이름을 입력하세요.');

    fetch(`/api/my-appointments?user=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        myAppListEl.innerHTML = '';
        if(data.length === 0) {
          myAppListEl.innerHTML = '<p class="text-muted">예약 내역이 없습니다.</p>';
          return;
        }
        data.forEach(ap => {
          const doc = doctors.find(d => d.id === ap.doctorId) || { name: '담당의' };
          const div = document.createElement('div');
          div.className = 'app-card';
          div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
              <strong>${doc.name} 원장 진료</strong>
              <span class="text-blue">${ap.date} ${ap.time}</span>
            </div>
            <p class="mt-2">환자명: ${ap.user}</p>
            <p class="text-xs text-muted mt-1">예약 ID: ${ap.id}</p>
          `;
          myAppListEl.appendChild(div);
        });
        showToast(`${data.length}건의 예약 내역을 불러왔습니다.`);
      });
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navBook, navMy].forEach(b => b.classList.remove('active'));
    [bookView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navBook.onclick = () => switchTab(navBook, bookView);
  navMy.onclick = () => switchTab(navMy, myView);

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
