document.addEventListener('DOMContentLoaded', () => {
  let books = [];
  let selectedBookId = null;

  const bookGrid = document.getElementById('book-grid');
  const logListEl = document.getElementById('log-list');
  const dateFilter = document.getElementById('log-date-filter');
  
  const navHome = document.getElementById('nav-home');
  const navLogs = document.getElementById('nav-logs');
  const navStats = document.getElementById('nav-stats');
  
  const homeView = document.getElementById('home-view');
  const logsView = document.getElementById('logs-view');
  const statsView = document.getElementById('stats-view');

  const logModal = document.getElementById('log-modal');
  const closeBtn = document.querySelector('.close');
  const logForm = document.getElementById('log-form');
  const toast = document.getElementById('toast');

  function init() {
    fetchBooks();
  }

  function fetchBooks() {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        books = data;
        renderBooks();
      });
  }

  function renderBooks() {
    bookGrid.innerHTML = '';
    books.forEach(b => {
      const card = document.createElement('div');
      card.className = 'book-card';
      const progress = Math.min(100, Math.round((b.currentPages / b.totalPages) * 100));
      card.innerHTML = `
        <img src="${b.cover}" class="cover">
        <div class="book-info">
          <h3>${b.title}</h3>
          <p class="author">${b.author}</p>
          <div class="progress-info">
            <span class="text-sm">${b.currentPages} / ${b.totalPages} p</span>
            <div class="progress-bar"><div class="fill" style="width: ${progress}%"></div></div>
          </div>
        </div>
      `;
      card.onclick = () => openLogModal(b.id);
      bookGrid.appendChild(card);
    });
  }

  function openLogModal(id) {
    selectedBookId = id;
    const book = books.find(b => b.id === id);
    document.getElementById('modal-title').innerText = `${book.title} 독서 기록`;
    document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
    logModal.style.display = 'block';
  }

  // 독서 기록 저장 (Bug 01: 누적 계산 오류)
  logForm.onsubmit = (e) => {
    e.preventDefault();
    const pagesRead = parseInt(document.getElementById('log-pages').value);
    const date = document.getElementById('log-date').value;

    fetch('/api/reading-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: selectedBookId, userId: 'user_A', pagesRead, date })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('오늘의 독서 기록이 저장되었습니다.');
        logModal.style.display = 'none';
        logForm.reset();
        fetchBooks();
      }
    });
  };

  // 독서 로그 조회 (Bug 02: Race Condition, Bug 03: Multi-tenant Leak)
  function fetchLogs() {
    const date = dateFilter.value;
    logListEl.innerHTML = '<p class="text-muted">기록을 불러오는 중...</p>';
    
    // Bug 02: 지연 응답으로 인해 빠른 필터 변경 시 순서가 꼬임
    fetch(`/api/reading-logs?date=${date}&userId=user_A`)
      .then(res => res.json())
      .then(data => {
        logListEl.innerHTML = '';
        if (data.length === 0) {
          logListEl.innerHTML = '<p class="text-muted">기록이 없습니다.</p>';
          return;
        }

        data.forEach(log => {
          const book = books.find(b => b.id === log.bookId) || { title: '알 수 없는 책' };
          const div = document.createElement('div');
          div.className = 'log-item';
          div.innerHTML = `
            <div>
              <strong>${book.title}</strong>
              <p class="text-sm text-muted">${log.userId}님의 기록 | ${log.date}</p>
            </div>
            <div class="text-green font-bold">+ ${log.pagesRead} p</div>
          `;
          logListEl.appendChild(div);
        });
      });
  }

  dateFilter.onchange = () => fetchLogs();

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navLogs, navStats].forEach(b => b.classList.remove('active'));
    [homeView, logsView, statsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navLogs.onclick = () => { switchTab(navLogs, logsView); fetchLogs(); };
  navStats.onclick = () => switchTab(navStats, statsView);

  closeBtn.onclick = () => logModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == logModal) logModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
