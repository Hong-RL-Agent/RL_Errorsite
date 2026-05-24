document.addEventListener('DOMContentLoaded', () => {
  let allPets = [];
  let currentPetId = null;

  // UI Elements
  const petSelector = document.getElementById('pet-selector');
  const petDetailCard = document.getElementById('pet-detail-card');
  const vaccineList = document.getElementById('vaccine-list');
  const upcomingVaccineBtn = document.getElementById('upcoming-vaccine-btn');
  const recordList = document.getElementById('record-list');
  const addRecordForm = document.getElementById('add-record-form');
  const appointmentForm = document.getElementById('appointment-form');
  const appointmentList = document.getElementById('appointment-list');
  const authTokenInput = document.getElementById('auth-token');
  const refreshFoodBtn = document.getElementById('refresh-food-btn');
  
  // Navigation & Modal
  const navHome = document.getElementById('nav-home');
  const navHospital = document.getElementById('nav-hospital');
  const mainView = document.getElementById('main-view');
  const hospitalView = document.getElementById('hospital-view');
  
  const notiBell = document.getElementById('noti-bell');
  const notiOverlay = document.getElementById('noti-overlay');
  const closeNotiBtn = document.getElementById('close-noti-btn');
  const readBtns = document.querySelectorAll('.read-btn');
  const toast = document.getElementById('toast');

  // Initialization
  function init() {
    fetchPets();
    fetchAppointments(); // Load global appointments
  }

  // Interaction 1: Fetch Pets
  function fetchPets() {
    fetch('/api/pets')
      .then(res => res.json())
      .then(data => {
        allPets = data;
        if (data.length > 0) {
          renderPetSelector();
          selectPet(data[0].id); // Select first pet
        }
      });
  }

  function renderPetSelector() {
    petSelector.innerHTML = '';
    allPets.forEach(pet => {
      const img = document.createElement('img');
      img.src = pet.image;
      img.className = 'pet-avatar';
      img.dataset.id = pet.id;
      // Interaction 2: Select Pet
      img.addEventListener('click', () => selectPet(pet.id));
      petSelector.appendChild(img);
    });
  }

  function selectPet(id) {
    currentPetId = id;
    
    // Update active UI
    document.querySelectorAll('.pet-avatar').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });

    const pet = allPets.find(p => p.id === id);
    petDetailCard.innerHTML = `
      <h3>${pet.name}</h3>
      <p class="text-sm text-muted">${pet.species} / ${pet.breed}</p>
      <div style="display:flex; justify-content:center; gap:1rem; margin-top:10px;">
        <div><strong>나이:</strong> ${pet.age}살</div>
        <div><strong>체중:</strong> ${pet.weight}kg</div>
      </div>
    `;

    fetchVaccines('all');
    fetchRecords();
  }

  // Interaction 3: Fetch Vaccines (Triggers Bug 01)
  function fetchVaccines(filterType) {
    let url = '/api/vaccines';
    if (filterType === 'upcoming') {
      url += '?filter=upcoming';
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const petVaccines = data.filter(v => v.petId === currentPetId);
        vaccineList.innerHTML = '';
        
        if (petVaccines.length === 0) {
          vaccineList.innerHTML = '<li class="placeholder-text">내역이 없습니다.</li>';
          return;
        }

        petVaccines.forEach(v => {
          const li = document.createElement('li');
          const isDone = v.status === '완료';
          li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>${v.name}</strong><br>
                <span class="text-sm text-muted">예정/접종일: ${v.date}</span>
              </div>
              <span class="status-badge ${isDone ? 'done' : 'pending'}">${v.status}</span>
            </div>
          `;
          vaccineList.appendChild(li);
        });
      });
  }

  upcomingVaccineBtn.addEventListener('click', () => {
    // Bug 01 manifestation: Expecting future dates, but server returns past dates
    fetchVaccines('upcoming');
    showToast('다가오는 일정 필터 적용');
  });

  // Interaction 4 & 5: Health Records
  function fetchRecords() {
    if (!currentPetId) return;
    fetch(`/api/records?petId=${currentPetId}`)
      .then(res => res.json())
      .then(data => {
        recordList.innerHTML = '';
        if (data.length === 0) {
          recordList.innerHTML = '<p class="placeholder-text">기록이 없습니다.</p>';
          return;
        }
        data.forEach(r => {
          const div = document.createElement('div');
          div.style.marginBottom = '10px';
          div.innerHTML = `
            <div style="background:#FFF9ED; padding:10px; border-radius:8px;">
              <strong>${r.date}</strong> - ${r.symptom}
              <p class="text-sm text-muted mt-2">${r.note || ''}</p>
            </div>
          `;
          recordList.appendChild(div);
        });
      });
  }

  addRecordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentPetId) return;

    const symptom = document.getElementById('record-symptom').value;
    const note = document.getElementById('record-note').value;

    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId: currentPetId, symptom, note })
    })
    .then(res => res.json())
    .then(() => {
      showToast('건강 기록이 추가되었습니다.');
      addRecordForm.reset();
      fetchRecords();
    });
  });

  // Interaction 9: Refresh Food
  refreshFoodBtn.addEventListener('click', () => {
    const foodContent = document.getElementById('food-content');
    foodContent.innerHTML = `
      <div class="food-badge">관절 케어</div>
      <h3 class="mt-2">힐스 사이언스 다이어트 조인트</h3>
      <p class="text-sm">활기찬 관절 건강을 돕는 프리미엄 사료입니다.</p>
    `;
    showToast('새로운 사료를 추천받았습니다.');
  });

  // Interaction 10: Appointment Submit (Triggers Bug 02 & 03)
  function fetchAppointments() {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        appointmentList.innerHTML = '';
        if (data.length === 0) {
          appointmentList.innerHTML = '<li class="placeholder-text">예약 내역이 없습니다.</li>';
          return;
        }
        data.forEach(apt => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${apt.hospital || '병원 미상'}</strong> - ${apt.date || '날짜 미상'} ${apt.time || ''}`;
          appointmentList.appendChild(li);
        });
      });
  }

  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const hospital = document.getElementById('apt-hospital').value;
    const date = document.getElementById('apt-date').value;
    const time = document.getElementById('apt-time').value;
    const token = authTokenInput.value; // Taking EXPIRED-TOKEN

    // Bug 02: Missing fields (hospital, date, time could be empty)
    // Client sends it anyway for testing.
    // Bug 03: Auth token is "EXPIRED-TOKEN", but server accepts it.
    
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ petId: currentPetId, hospital, date, time })
    })
    .then(res => {
      if (res.status === 201) return res.json();
      throw new Error('예약 실패 (상태 코드: ' + res.status + ')');
    })
    .then(data => {
      showToast(data.message || '예약 생성 성공 (검증 우회 성공!)');
      appointmentForm.reset();
      fetchAppointments();
    })
    .catch(err => showToast(err.message));
  });

  // Interaction 11: Navigation
  navHome.addEventListener('click', () => {
    navHome.classList.add('active');
    navHospital.classList.remove('active');
    mainView.style.display = 'block';
    hospitalView.style.display = 'none';
  });

  navHospital.addEventListener('click', () => {
    navHospital.classList.add('active');
    navHome.classList.remove('active');
    mainView.style.display = 'none';
    hospitalView.style.display = 'block';
  });

  // Interaction 6, 7, 8: Notifications
  notiBell.addEventListener('click', () => {
    notiOverlay.style.display = 'block';
  });

  closeNotiBtn.addEventListener('click', () => {
    notiOverlay.style.display = 'none';
  });

  readBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.noti-card');
      card.classList.remove('unread');
      e.target.style.display = 'none';
      
      const badge = document.getElementById('noti-badge');
      let count = parseInt(badge.innerText);
      if (count > 0) badge.innerText = count - 1;
    });
  });

  // Toast System
  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  init();
});
