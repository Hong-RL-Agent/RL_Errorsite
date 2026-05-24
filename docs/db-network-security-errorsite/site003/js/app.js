document.addEventListener('DOMContentLoaded', () => {
  let workoutsData = [];
  let currentFilter = '전체';

  // Elements
  const routineContainer = document.getElementById('routine-container');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const addWorkoutForm = document.getElementById('add-workout-form');
  const refreshStatsBtn = document.getElementById('refresh-stats-btn');
  const fetchOtherUserBtn = document.getElementById('fetch-other-user-btn');
  const targetUserIdInput = document.getElementById('target-user-id');
  const saveGoalBtn = document.getElementById('save-goal-btn');
  const recTabs = document.querySelectorAll('.rec-tab');
  
  const navDashboard = document.getElementById('nav-dashboard');
  const navProfile = document.getElementById('nav-profile');
  const mainView = document.getElementById('main-view');
  const profileView = document.getElementById('profile-view');

  const toast = document.getElementById('toast-message');

  // Interaction 1: Fetch and render workouts
  function fetchWorkouts(userId = null) {
    let url = '/api/workouts';
    if (userId) {
      // Bug 03 interaction: passing explicit userId (which server allows without auth)
      url += `?userId=${encodeURIComponent(userId)}`;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        workoutsData = data;
        renderWorkouts();
      });
  }

  function renderWorkouts() {
    routineContainer.innerHTML = '';
    const filtered = currentFilter === '전체' 
      ? workoutsData 
      : workoutsData.filter(w => w.type === currentFilter);

    if (filtered.length === 0) {
      routineContainer.innerHTML = '<p style="color:var(--text-muted);">예정된 운동이 없습니다.</p>';
      return;
    }

    filtered.forEach(w => {
      const item = document.createElement('div');
      item.className = `workout-item ${w.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="workout-info">
          <span class="workout-name">${w.name}</span>
          <span class="workout-type">${w.type}</span>
        </div>
        <button class="complete-btn" data-id="${w.id}" data-bug-id="site003-bug01">
          ${w.completed ? '완료됨' : '완료 체크'}
        </button>
      `;
      
      const btn = item.querySelector('.complete-btn');
      if (!w.completed) {
        // Interaction 3: Complete workout
        btn.addEventListener('click', () => completeWorkout(w.id));
      }
      routineContainer.appendChild(item);
    });
  }

  function completeWorkout(id) {
    // Bug 01: Client asks to complete 'id', but server always updates the first item.
    fetch(`/api/workouts/${id}/complete`, { method: 'PUT' })
      .then(res => res.json())
      .then(data => {
        showToast(data.message);
        fetchWorkouts(); // Refresh to see changes
      });
  }

  // Interaction 2: Filter workouts
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.type;
      renderWorkouts();
    });
  });

  // Interaction 4: Fetch stats (Triggers Bug 02)
  function fetchStats() {
    const errorMsg = document.getElementById('stats-error');
    errorMsg.style.display = 'none';

    fetch('/api/stats')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        document.getElementById('stat-workouts').innerText = data.totalWorkouts;
        document.getElementById('stat-minutes').innerText = data.totalMinutes;
        document.getElementById('stat-calories').innerText = data.caloriesBurned;
        document.getElementById('stat-streak').innerText = data.streak + '일';
        showToast('통계 갱신 완료');
      })
      .catch(err => {
        // Bug 02 manifestation: 503 error displayed occasionally
        errorMsg.style.display = 'block';
        showToast('통계 갱신 실패');
      });
  }

  refreshStatsBtn.addEventListener('click', fetchStats);

  // Interaction 5: Fetch other user's workouts (Triggers Bug 03)
  fetchOtherUserBtn.addEventListener('click', () => {
    const uid = targetUserIdInput.value || 'user-001';
    fetchWorkouts(uid);
    showToast(`${uid}님의 기록을 불러왔습니다.`);
  });

  // Interaction 6: Add workout
  addWorkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('workout-name').value;
    const type = document.getElementById('workout-type').value;

    fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type })
    })
    .then(res => res.json())
    .then(data => {
      showToast('운동 추가됨: ' + data.workout.name);
      addWorkoutForm.reset();
      fetchWorkouts();
    });
  });

  // Interaction 7: Save Goals
  saveGoalBtn.addEventListener('click', () => {
    showToast('목표가 저장되었습니다.');
  });

  // Interaction 8: Recommend Tabs
  recTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      recTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const level = e.target.dataset.level;
      const content = document.getElementById('recommend-content');
      
      if (level === '초급') {
        content.innerHTML = '<p>초급자를 위한 전신 루틴</p><ul><li>스쿼트</li><li>푸시업</li></ul>';
      } else if (level === '중급') {
        content.innerHTML = '<p>중급자를 위한 2분할 루틴</p><ul><li>벤치프레스</li><li>밀리터리 프레스</li></ul>';
      } else {
        content.innerHTML = '<p>고급자를 위한 3분할 파워빌딩</p><ul><li>데드리프트</li><li>바벨로우</li></ul>';
      }
    });
  });

  // Interaction 9: Navigation
  navDashboard.addEventListener('click', () => {
    navDashboard.classList.add('active');
    navProfile.classList.remove('active');
    mainView.style.display = 'block';
    profileView.style.display = 'none';
  });

  navProfile.addEventListener('click', () => {
    navProfile.classList.add('active');
    navDashboard.classList.remove('active');
    mainView.style.display = 'none';
    profileView.style.display = 'block';
    fetchProfile();
  });

  // Interaction 10: Fetch Profile
  function fetchProfile() {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        document.getElementById('profile-name').innerText = data.name;
        document.getElementById('profile-level').innerText = data.level;
        document.getElementById('profile-status').innerText = data.statusMsg;
      });
  }

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Init
  fetchWorkouts();
  fetchStats();
});
