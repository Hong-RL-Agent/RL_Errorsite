document.addEventListener('DOMContentLoaded', () => {
  let allBooks = [];
  let currentGenre = '전체';
  let currentSort = 'latest';

  const bookContainer = document.getElementById('book-container');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const genreItems = document.querySelectorAll('.genre-item');
  const sortSelect = document.getElementById('sort-select');
  const refreshRecommendBtn = document.getElementById('refresh-recommend-btn');
  
  const modalOverlay = document.getElementById('book-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalDetailContent = document.getElementById('modal-detail-content');
  const rentForm = document.getElementById('rent-form');
  let currentBookId = null;

  const toast = document.getElementById('toast-message');
  
  // Navigation
  const navHome = document.getElementById('nav-home');
  const navDashboard = document.getElementById('nav-dashboard');
  const mainView = document.getElementById('main-view');
  const dashboardView = document.getElementById('dashboard-view');

  // Interaction 1: Fetch and render books
  function fetchBooks() {
    let url = `/api/books?genre=${encodeURIComponent(currentGenre)}&sort=${currentSort}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        allBooks = data;
        renderBooks(data);
      })
      .catch(err => console.error(err));
  }

  function renderBooks(books) {
    bookContainer.innerHTML = '';
    if (books.length === 0) {
      bookContainer.innerHTML = '<p style="grid-column: 1/-1;">해당하는 도서가 없습니다.</p>';
      return;
    }
    books.forEach(b => {
      const card = document.createElement('div');
      card.className = 'book-card';
      const statusHtml = b.available 
        ? `<span class="status">대여 가능</span>` 
        : `<span class="status unavailable">대여 중</span>`;
      
      card.innerHTML = `
        <img src="${b.image}" class="book-img" alt="${b.title}">
        <div class="book-info">
          <div class="book-title">${b.title}</div>
          <div class="book-author">${b.author}</div>
          <div class="book-meta">
            <span class="rating">★ ${b.rating}</span>
            ${statusHtml}
          </div>
        </div>
      `;
      // Interaction 5: Open detail modal
      card.addEventListener('click', () => openModal(b.id));
      bookContainer.appendChild(card);
    });
  }

  // Interaction 2: Search
  searchBtn.addEventListener('click', () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allBooks.filter(b => b.title.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword));
    renderBooks(filtered);
  });

  // Interaction 3: Genre filter
  genreItems.forEach(item => {
    item.addEventListener('click', (e) => {
      genreItems.forEach(i => i.classList.remove('active'));
      e.target.classList.add('active');
      currentGenre = e.target.dataset.genre;
      fetchBooks();
    });
  });

  // Interaction 4: Sort (Triggers Bug 1: rating sort actually sorts by createdAt on server)
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    fetchBooks();
  });

  // Interaction 10: Refresh Recommendation
  refreshRecommendBtn.addEventListener('click', () => {
    showToast('새로운 추천 도서를 불러왔습니다.');
    fetchBooks(); // Mock refresh
  });

  function openModal(id) {
    currentBookId = id;
    fetch(`/api/books/${id}`)
      .then(res => res.json())
      .then(b => {
        modalDetailContent.innerHTML = `
          <img src="${b.image}" class="detail-img" alt="${b.title}">
          <div class="detail-text">
            <h3>${b.title}</h3>
            <p>저자: ${b.author}</p>
            <p>장르: ${b.genre}</p>
            <p class="rating">평점: ★ ${b.rating}</p>
            <p>상태: ${b.available ? '대여 가능' : '대여 불가'}</p>
          </div>
        `;
        modalOverlay.style.display = 'flex';
      });
  }

  // Interaction 6: Close Modal
  closeModalBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = 'none';
  });

  // Interaction 7: Submit Rent Form (Triggers Bug 2)
  rentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentBookId) return;

    const period = document.getElementById('rent-period').value;
    
    // Bug 02: If book is unavailable, server returns 200 OK with success: false.
    // However, typical client fetch logic like this often only checks if res.ok (which is true for 200 OK).
    fetch('/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: currentBookId, period: period })
    })
    .then(res => {
      // The client checks res.ok. Since the buggy server returns 200, res.ok is true!
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('대여 요청 실패');
      }
    })
    .then(data => {
      // It will enter here even if success is false, because status was 200.
      if (data.success) {
        showToast(data.message);
        modalOverlay.style.display = 'none';
        fetchBooks(); // Refresh list
      } else {
        // This is where it catches the server's custom error format, but the agent should detect 
        // the wrong HTTP status code for an error.
        showToast(`대여 실패: ${data.error}`);
      }
    })
    .catch(err => {
      showToast(err.message);
    });
  });

  // Interaction 11: Navigation
  navHome.addEventListener('click', () => {
    navHome.classList.add('active');
    navDashboard.classList.remove('active');
    mainView.style.display = 'block';
    dashboardView.style.display = 'none';
  });

  navDashboard.addEventListener('click', () => {
    navDashboard.classList.add('active');
    navHome.classList.remove('active');
    mainView.style.display = 'none';
    dashboardView.style.display = 'block';
    fetchUserInfo();
  });

  // Interaction 8: Fetch User Info (Triggers Bug 3: Data exposure in response)
  const userInfoContainer = document.getElementById('user-info-container');
  const fetchUserBtn = document.getElementById('fetch-user-btn');

  function fetchUserInfo() {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        // Bug 03: The 'data' object contains passwordHash and internalToken!
        userInfoContainer.innerHTML = `
          <h4>${data.name} 님 환영합니다!</h4>
          <p>이메일: ${data.email}</p>
          <p>멤버십 등급: ${data.memberLevel}</p>
          <p>현재 대여 권수: ${data.activeRentals}권</p>
          <div style="margin-top:15px; padding:10px; background:#FEE2E2; border-left:4px solid #EF4444;">
            <strong>[보안 취약점 알림]</strong><br>
            네트워크 탭을 확인해보면, 서버 응답 JSON에 <code>passwordHash</code>와 <code>internalToken</code> 값이 평문으로 노출되어 있습니다!
          </div>
        `;
      });
  }

  fetchUserBtn.addEventListener('click', fetchUserInfo);

  // Interaction 9: Return Reminder
  const returnReminderBtn = document.getElementById('return-reminder-btn');
  returnReminderBtn.addEventListener('click', () => {
    showToast('반납일이 3일 남은 도서가 1권 있습니다.');
  });

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Init
  fetchBooks();
});
