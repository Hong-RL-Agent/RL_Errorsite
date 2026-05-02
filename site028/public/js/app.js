document.addEventListener('DOMContentLoaded', () => {
  let entries = [];
  let moods = ['Happy', 'Calm', 'Sad', 'Angry', 'Anxious', 'Excited'];
  let selectedMood = 'Happy';

  const moodOptions = document.getElementById('mood-options');
  const entryDateInput = document.getElementById('entry-date');
  const entryContentInput = document.getElementById('entry-content');
  const entryTagsInput = document.getElementById('entry-tags');
  const saveBtn = document.getElementById('save-btn');
  
  const navWrite = document.getElementById('nav-write');
  const navList = document.getElementById('nav-list');
  const navStats = document.getElementById('nav-stats');
  
  const writeView = document.getElementById('write-view');
  const listView = document.getElementById('list-view');
  const statsView = document.getElementById('stats-view');

  const entryGrid = document.getElementById('entry-grid');
  const searchInput = document.getElementById('search-input');
  const testIdorBtn = document.getElementById('test-idor-btn');
  
  const statsLoader = document.getElementById('stats-loader');
  const statsContent = document.getElementById('stats-content');
  const toast = document.getElementById('toast');

  // Initialize
  function init() {
    // Set default date to today
    entryDateInput.value = new Date().toISOString().split('T')[0];
    
    // Render mood buttons
    moods.forEach(mood => {
      const btn = document.createElement('button');
      btn.className = `mood-btn ${mood === selectedMood ? 'active' : ''}`;
      btn.innerText = mood;
      btn.onclick = () => {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMood = mood;
      };
      moodOptions.appendChild(btn);
    });

    fetchEntries();
  }

  function fetchEntries() {
    fetch('/api/entries?userId=user123')
      .then(res => res.json())
      .then(data => {
        entries = data;
        renderEntries();
      });
  }

  function renderEntries() {
    entryGrid.innerHTML = '';
    const term = searchInput.value.toLowerCase();
    const filtered = entries.filter(e => 
      e.content.toLowerCase().includes(term) || 
      e.tags.some(t => t.toLowerCase().includes(term))
    );

    filtered.forEach(e => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      card.innerHTML = `
        <p class="card-date">${e.date}</p>
        <span class="card-mood"># ${e.mood}</span>
        <p class="card-content">${e.content}</p>
        <div class="mt-3">
          ${e.tags.map(t => `<span class="badge" style="font-size:0.75rem; color:var(--lavender); margin-right:8px;">#${t}</span>`).join('')}
        </div>
      `;
      card.onclick = () => showToast('상세 기록 조회 기능 준비 중입니다.');
      entryGrid.appendChild(card);
    });
  }

  // 일기 저장 (Bug 01 관련)
  saveBtn.onclick = () => {
    const content = entryContentInput.value.trim();
    if (!content) return showToast('기록할 내용을 입력해 주세요.');

    const date = entryDateInput.value;
    const tags = entryTagsInput.value.split(',').map(t => t.trim()).filter(t => t);

    fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user123', mood: selectedMood, content, date, tags })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('오늘의 마음이 소중히 기록되었습니다.');
        entryContentInput.value = '';
        entryTagsInput.value = '';
        fetchEntries();
      }
    });
  };

  // 통계 조회 (Bug 02 관련)
  function fetchStats() {
    statsLoader.style.display = 'block';
    statsContent.innerHTML = '';

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        // Bug 02: 지연 응답 시 로딩 상태가 해제되지 않는 UI 결함 유도
        // 원래는: statsLoader.style.display = 'none';
        
        renderStats(data);
      });
  }

  function renderStats(data) {
    statsContent.innerHTML = `
      <div class="card" style="background:white; padding:2rem; border-radius:24px; box-shadow:var(--shadow); width:100%;">
        <h3>최근 나의 감정 분포</h3>
        <ul class="mt-4" style="list-style:none;">
          ${Object.entries(data).map(([mood, count]) => `
            <li class="mt-2" style="display:flex; align-items:center; gap:15px;">
              <span style="width:80px; font-weight:700;">${mood}</span>
              <div style="flex:1; height:12px; background:#F3F4F6; border-radius:6px; overflow:hidden;">
                <div style="width:${count * 5}%; height:100%; background:var(--lavender);"></div>
              </div>
              <span style="font-weight:700;">${count}회</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Bug 03: IDOR 테스트
  testIdorBtn.onclick = () => {
    const targetId = prompt('상세 조회할 일기 ID를 입력하세요 (예: ent-999)', 'ent-999');
    if (targetId) {
      fetch(`/api/entries/${targetId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) return showToast(data.error);
          
          showToast('비인가 감정 기록 조회 성공');
          entryGrid.innerHTML = `
            <div class="entry-card" style="border-color:var(--lavender); background:#FFF5F5; grid-column: 1 / -1;">
              <p class="card-date">${data.date} | [타인] ${data.userId} 님의 기록</p>
              <span class="card-mood"># ${data.mood}</span>
              <p>${data.content}</p>
              ${data.privateMemo ? `<p class="mt-3" style="color:red; font-weight:700;">비밀 메모: ${data.privateMemo}</p>` : ''}
            </div>
          `;
        });
    }
  };

  searchInput.oninput = () => renderEntries();

  // 탭 전환
  function switchTab(btn, view) {
    [navWrite, navList, navStats].forEach(b => b.classList.remove('active'));
    [writeView, listView, statsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navWrite.onclick = () => switchTab(navWrite, writeView);
  navList.onclick = () => { switchTab(navList, listView); fetchEntries(); };
  navStats.onclick = () => { switchTab(navStats, statsView); fetchStats(); };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
