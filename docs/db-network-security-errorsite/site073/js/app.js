document.addEventListener('DOMContentLoaded', () => {
  let startTime = null;
  let timerInterval = null;
  let elapsedSeconds = 0;
  let isPaused = false;
  let pausedAt = null;
  let totalPausedMs = 0;
  let currentSubject = null;
  const userId = 'user_A';

  const timerClock = document.getElementById('timer-clock');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const currentSubjectTag = document.getElementById('current-subject-tag');
  
  const navTimer = document.getElementById('nav-timer');
  const navStats = document.getElementById('nav-stats');
  
  const timerView = document.getElementById('timer-view');
  const statsView = document.getElementById('stats-view');

  const subjectModal = document.getElementById('subject-modal');
  const subjectListEl = document.getElementById('subject-list');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    fetchSubjects();
  }

  function fetchSubjects() {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        subjectListEl.innerHTML = '';
        data.forEach(s => {
          const div = document.createElement('div');
          div.className = 'subject-item';
          div.innerText = s.name;
          div.onclick = () => selectSubject(s);
          subjectListEl.appendChild(div);
        });
      });
  }

  function selectSubject(s) {
    currentSubject = s;
    currentSubjectTag.innerText = s.name;
    currentSubjectTag.style.background = s.color + '20';
    currentSubjectTag.style.color = s.color;
    subjectModal.style.display = 'none';
  }

  currentSubjectTag.onclick = () => {
    if (timerInterval) return;
    subjectModal.style.display = 'block';
  };

  startBtn.onclick = () => {
    if (!currentSubject) return showToast('공부할 과목을 먼저 선택하세요.');
    
    startTime = new Date();
    totalPausedMs = 0;
    isPaused = false;
    timerInterval = setInterval(updateTimer, 1000);
    
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    stopBtn.style.display = 'inline-block';
  };

  pauseBtn.onclick = () => {
    if (!isPaused) {
      isPaused = true;
      pausedAt = new Date();
      pauseBtn.innerText = '재개';
    } else {
      isPaused = false;
      totalPausedMs += (new Date() - pausedAt);
      pauseBtn.innerText = '일시정지';
    }
  };

  stopBtn.onclick = () => {
    clearInterval(timerInterval);
    const endTime = new Date();
    
    saveSession(startTime, endTime, totalPausedMs);
    
    resetTimer();
  };

  function updateTimer() {
    if (isPaused) return;
    elapsedSeconds++;
    timerClock.innerText = formatTime(elapsedSeconds);
  }

  // 공부 기록 저장 (Bug 01: 계산 오류, Bug 02: 중복 저장 방지 누락)
  function saveSession(start, end, pausedMs) {
    // INTENTIONAL BUG: site073-bug02 (중복 저장 방지 처리 생략)
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subject: currentSubject.name,
        startTime: start,
        endTime: end,
        pausedDuration: Math.floor(pausedMs / 1000)
      })
    })
    .then(res => res.json())
    .then(data => {
      showToast('학습 기록이 안전하게 저장되었습니다.');
      updateStats();
    });
  }

  function resetTimer() {
    timerInterval = null;
    elapsedSeconds = 0;
    timerClock.innerText = '00:00:00';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'none';
    pauseBtn.innerText = '일시정지';
  }

  function fetchHistory() {
    fetch(`/api/stats?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const historyEl = document.getElementById('session-history');
        historyEl.innerHTML = '';
        
        // 실제 기록 목록 조회를 위한 추가 API (단순화)
        // INTENTIONAL BUG: site073-bug03 테스트를 위해 ID 수동 조작 유도
        historyEl.innerHTML = `
          <div class="list-item">
            <div>
              <strong>오늘의 총 공부 시간</strong>
              <p>${formatTime(data.totalDuration)}</p>
            </div>
            <span class="text-blue" style="font-weight:800;">${data.sessionsCount} Sessions</span>
          </div>
          <div class="p-5 text-sm text-muted">
            ※ 보안 분석: /api/sessions/:id 경로에 타인의 sessionId를 입력하여 공부 세부 내역을 열람해 보십시오.
          </div>
        `;
      });
  }

  function formatTime(s) {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateStats() {
    fetch(`/api/stats?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const goalSeconds = 3600 * 5; // 5시간 목표
        const percent = Math.min(Math.floor((data.totalDuration / goalSeconds) * 100), 100);
        document.getElementById('goal-percent').innerText = percent + '%';
        document.getElementById('progress-fill').style.width = percent + '%';
      });
  }

  function switchTab(btn, view) {
    [navTimer, navStats].forEach(b => b.classList.remove('active'));
    [timerView, statsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === statsView) fetchHistory();
  }

  navTimer.onclick = () => switchTab(navTimer, timerView);
  navStats.onclick = () => switchTab(navStats, statsView);

  closeBtn.onclick = () => subjectModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == subjectModal) subjectModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
