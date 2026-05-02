document.addEventListener('DOMContentLoaded', () => {
  let newsData = [];
  let bookmarkIds = [];
  let currentFilter = 'all';

  const newsListEl = document.getElementById('news-list');
  const bookmarkListEl = document.getElementById('bookmark-list');
  const trendListEl = document.getElementById('trend-list');
  const refreshTrendsBtn = document.getElementById('refresh-trends');
  
  const navHome = document.getElementById('nav-home');
  const navBookmarks = document.getElementById('nav-bookmarks');
  const navSettings = document.getElementById('nav-settings');
  
  const homeView = document.getElementById('home-view');
  const bookmarksView = document.getElementById('bookmarks-view');
  const settingsView = document.getElementById('settings-view');

  const subscriptionCard = document.getElementById('subscription-card');
  const idorTestBtn = document.getElementById('idor-test-btn');
  const searchInput = document.getElementById('news-search');
  
  const modal = document.getElementById('news-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const toast = document.getElementById('toast');

  function init() {
    fetchNews();
    fetchTrends();
    fetchBookmarks();
  }

  function fetchNews() {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        newsData = data;
        renderNews(data, newsListEl);
      });
  }

  function renderNews(data, container) {
    container.innerHTML = '';
    const filtered = currentFilter === 'all' ? data : data.filter(n => n.category === currentFilter);
    
    filtered.forEach(n => {
      const isBookmarked = bookmarkIds.includes(n.id);
      const card = document.createElement('div');
      card.className = 'article-card';
      card.innerHTML = `
        <div class="article-info">
          <div class="meta-row">
            <span class="text-accent">${n.category}</span>
            <span>${n.date}</span>
            <span class="read-badge ${n.read ? 'active' : ''}">${n.read ? 'READ' : 'UNREAD'}</span>
          </div>
          <h3>${n.title}</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec...</p>
          <div class="mt-3">
            <button class="btn-outline btn-sm" onclick="toggleBookmark(event, '${n.id}')">${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}</button>
          </div>
        </div>
        <div class="article-img" style="background:#f0f0f0;"></div>
      `;
      card.onclick = () => openModal(n);
      container.appendChild(card);
    });
  }

  function fetchTrends() {
    // Bug 02: 항상 오래된 데이터를 반환함
    fetch('/api/trends')
      .then(res => res.json())
      .then(data => {
        trendListEl.innerHTML = '';
        data.keywords.forEach(k => {
          const p = document.createElement('p');
          p.className = 'keyword-item';
          p.innerText = `# ${k}`;
          trendListEl.appendChild(p);
        });
        showToast(`Trends updated as of ${data.date}`);
      });
  }

  window.toggleBookmark = (e, id) => {
    e.stopPropagation();
    fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: id })
    }).then(() => {
      fetchBookmarks();
      showToast('Bookmark updated.');
    });
  };

  function fetchBookmarks() {
    fetch('/api/bookmarks')
      .then(res => res.json())
      .then(ids => {
        bookmarkIds = ids;
        const bookmarkedNews = newsData.filter(n => ids.includes(n.id));
        renderNews(bookmarkedNews, bookmarkListEl);
      });
  }

  function openModal(n) {
    modalBody.innerHTML = `
      <div class="meta-row mb-4">
        <span class="text-accent">${n.category}</span> | <span>${n.date}</span>
      </div>
      <h1 style="font-family:'Crimson Pro', serif; font-size:3rem; margin-bottom:2rem;">${n.title}</h1>
      <p style="font-size:1.2rem; line-height:1.8;">본문 내용입니다. 강화학습 모델을 위한 테스트 데이터입니다. 
      이 기사를 읽으면 읽음 처리가 되어야 합니다. (Bug 01 테스트: 읽은 기사가 아닌 엉뚱한 기사가 읽음 처리될 수 있습니다.)</p>
    `;
    modal.style.display = 'block';

    // Bug 01: 읽음 처리 API 호출
    fetch('/api/news/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: n.id })
    }).then(res => res.json()).then(() => {
      fetchNews(); // 상태 갱신
    });
  }

  function fetchSubscription(id) {
    // Bug 03: IDOR 취약점 테스트
    fetch(`/api/subscriptions/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.error) {
          subscriptionCard.innerHTML = `<p class="text-accent">${data.error}</p>`;
          return;
        }
        subscriptionCard.innerHTML = `
          <div class="config-info">
            <p><strong>Config ID:</strong> ${id}</p>
            <p><strong>User:</strong> ${data.userId}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p class="mt-3"><strong>Categories:</strong> ${data.categories ? data.categories.join(', ') : 'None'}</p>
            ${data.secretNote ? `<div class="mt-4 p-3" style="background:#FFF9C4; border:1px solid #E0E0E0;">⚠️ Exposure: ${data.secretNote}</div>` : ''}
          </div>
        `;
      });
  }

  // 검색
  searchInput.oninput = () => {
    const term = searchInput.value.toLowerCase();
    const filtered = newsData.filter(n => n.title.toLowerCase().includes(term));
    renderNews(filtered, newsListEl);
  };

  // 카테고리 필터
  document.querySelectorAll('.cat-list li').forEach(li => {
    li.onclick = () => {
      document.querySelectorAll('.cat-list li').forEach(l => l.classList.remove('active'));
      li.classList.add('active');
      currentFilter = li.dataset.cat;
      renderNews(newsData, newsListEl);
    };
  });

  refreshTrendsBtn.onclick = fetchTrends;

  idorTestBtn.onclick = () => {
    const targetId = prompt('Enter Subscription ID to view (Try sub-999)', 'sub-999');
    if(targetId) fetchSubscription(targetId);
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navBookmarks, navSettings].forEach(b => b.classList.remove('active'));
    [homeView, bookmarksView, settingsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navBookmarks.onclick = () => { switchTab(navBookmarks, bookmarksView); fetchBookmarks(); };
  navSettings.onclick = () => { switchTab(navSettings, settingsView); fetchSubscription('sub-123'); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
