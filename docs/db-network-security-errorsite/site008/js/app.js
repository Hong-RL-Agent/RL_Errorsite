document.addEventListener('DOMContentLoaded', () => {
  let moviesData = [];
  let favData = [];
  let prefTags = [];
  let currentMovieId = null;

  // Nav Elements
  const navHome = document.getElementById('nav-home');
  const navGenres = document.getElementById('nav-genres');
  const navFav = document.getElementById('nav-fav');
  const navPref = document.getElementById('nav-pref');

  // Views
  const homeView = document.getElementById('home-view');
  const genresView = document.getElementById('genres-view');
  const favView = document.getElementById('fav-view');
  const prefView = document.getElementById('pref-view');

  // Elements
  const movieGrid = document.getElementById('movie-grid');
  const favGrid = document.getElementById('fav-grid');
  const searchInput = document.getElementById('search-movie');
  const genreFilter = document.getElementById('genre-filter');
  const sortFilter = document.getElementById('sort-filter');
  
  const popularReviews = document.getElementById('popular-reviews');
  const reviewErrorMsg = document.getElementById('review-error-msg');
  
  const refreshRecommendBtn = document.getElementById('refresh-recommend-btn');

  // Modal Elements
  const movieModal = document.getElementById('movie-modal');
  const closeModal = document.getElementById('close-modal');
  const modalPoster = document.getElementById('modal-poster');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalRating = document.getElementById('modal-rating');
  const modalReviewCnt = document.getElementById('modal-review-cnt');
  const modalFavBtn = document.getElementById('modal-fav-btn');
  const modalReviewsList = document.getElementById('modal-reviews-list');
  const reviewForm = document.getElementById('review-form');

  const toast = document.getElementById('toast');

  // Init
  function init() {
    fetchFavorites().then(() => fetchMovies());
    fetchPopularReviews();
    fetchPreferences();
  }

  // 1. Fetch Movies
  function fetchMovies() {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        moviesData = data;
        renderMovies(moviesData, movieGrid);
      });
  }

  function fetchFavorites() {
    return fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        favData = data.map(m => m.id);
        renderMovies(data, favGrid);
      });
  }

  // Interaction 1: Render Movies (UI shows Bug 01)
  function renderMovies(data, container) {
    container.innerHTML = '';
    if (data.length === 0) {
      container.innerHTML = '<p class="text-muted">영화를 찾을 수 없습니다.</p>';
      return;
    }
    
    data.forEach(m => {
      const isFav = favData.includes(m.id);
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <img src="${m.poster}" class="movie-poster" alt="${m.title}">
        <div class="fav-icon ${isFav ? 'active' : ''}" data-id="${m.id}">${isFav ? '♥' : '♡'}</div>
        <div class="movie-info">
          <div class="movie-title">${m.title}</div>
          <div class="text-xs text-muted">${m.genre} | ${m.year}</div>
          <div class="movie-rating">★ ${m.rating.toFixed(1)}</div>
        </div>
      `;
      
      // Interaction 4: Open Modal
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('fav-icon')) return; // handled separately
        openModal(m.id);
      });

      // Interaction 5: Toggle Favorite
      const favBtn = card.querySelector('.fav-icon');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(m.id, favBtn);
      });

      container.appendChild(card);
    });
  }

  // Interaction 2 & 3: Filter & Sort
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const genre = genreFilter.value;
    const sort = sortFilter.value;

    let filtered = moviesData.filter(m => {
      const matchTerm = m.title.toLowerCase().includes(term);
      const matchGenre = genre === '전체' || m.genre === genre;
      return matchTerm && matchGenre;
    });

    if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      filtered.sort((a, b) => b.year - a.year);
    }

    renderMovies(filtered, movieGrid);
  }

  searchInput.addEventListener('input', applyFilters);
  genreFilter.addEventListener('change', applyFilters);
  sortFilter.addEventListener('change', applyFilters);

  // Modal Logic
  function openModal(id) {
    const m = moviesData.find(x => x.id === id);
    if (!m) return;
    currentMovieId = id;
    
    modalPoster.src = m.poster;
    modalTitle.innerText = m.title;
    modalMeta.innerText = `${m.genre} | ${m.year}`;
    modalRating.innerText = m.rating.toFixed(1); // Bug 01 value
    modalReviewCnt.innerText = m.reviews;
    document.getElementById('review-movie-id').value = id;
    
    updateModalFavBtn();
    fetchMovieReviews(id);
    
    movieModal.style.display = 'flex';
  }

  closeModal.addEventListener('click', () => { movieModal.style.display = 'none'; });

  function updateModalFavBtn() {
    const isFav = favData.includes(currentMovieId);
    modalFavBtn.innerText = isFav ? '♥ 찜 취소' : '♡ 찜하기';
    modalFavBtn.style.color = isFav ? 'var(--red-primary)' : 'var(--white)';
  }

  modalFavBtn.addEventListener('click', () => {
    toggleFavorite(currentMovieId).then(() => updateModalFavBtn());
  });

  function toggleFavorite(id, btnElement = null) {
    return fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId: id })
    })
    .then(res => res.json())
    .then(data => {
      showToast(data.isFavorite ? '찜 목록에 추가되었습니다.' : '찜 목록에서 삭제되었습니다.');
      if (btnElement) {
        if (data.isFavorite) btnElement.classList.add('active');
        else btnElement.classList.remove('active');
        btnElement.innerText = data.isFavorite ? '♥' : '♡';
      }
      fetchFavorites(); // Update fav view
    });
  }

  // Interaction 6: Fetch Reviews (Triggers Bug 02)
  function fetchPopularReviews() {
    reviewErrorMsg.style.display = 'none';
    popularReviews.innerHTML = '';
    
    fetch('/api/reviews')
      .then(res => {
        // Bug 02 manifestation: Server sends text/plain, but fetch expects json
        // If we force res.json(), it will parse fine if the content is valid json,
        // but let's simulate strict client checking or log the header
        const contentType = res.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
          console.warn('Warning: Expected application/json but received ' + contentType);
          // Show error message to user as requested by bug symptom
          reviewErrorMsg.style.display = 'block';
        }
        return res.json();
      })
      .then(data => {
        data.slice(0, 5).forEach(r => {
          const div = document.createElement('div');
          div.className = 'review-card';
          // Bug 03 Manifestation on render: r.content is not escaped, innerHTML is used
          div.innerHTML = `
            <strong>${r.user}</strong> <span class="text-red">★ ${r.rating}</span>
            <p>${r.content}</p>
          `;
          popularReviews.appendChild(div);
        });
      })
      .catch(err => {
        console.error('Failed to parse reviews:', err);
        reviewErrorMsg.style.display = 'block';
      });
  }

  function fetchMovieReviews(id) {
    fetch(`/api/reviews?movieId=${id}`)
      .then(res => res.json())
      .then(data => {
        modalReviewsList.innerHTML = '';
        if (data.length === 0) {
          modalReviewsList.innerHTML = '<p class="text-muted">아직 리뷰가 없습니다.</p>';
          return;
        }
        data.forEach(r => {
          const div = document.createElement('div');
          div.className = 'review-item';
          // Bug 03 Manifestation: Unescaped content injection
          div.innerHTML = `
            <div><strong>${r.user}</strong> <span class="text-red text-sm">★ ${r.rating}</span></div>
            <p class="mt-2 text-sm">${r.content}</p>
          `;
          modalReviewsList.appendChild(div);
        });
      });
  }

  // Interaction 7: Submit Review (Triggers Bug 03 XSS)
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const movieId = document.getElementById('review-movie-id').value;
    const rating = document.getElementById('review-rating').value;
    const content = document.getElementById('review-content').value;

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId, rating, content, user: 'guest' })
    })
    .then(res => res.json())
    .then(data => {
      showToast('리뷰가 등록되었습니다.');
      reviewForm.reset();
      fetchMovieReviews(movieId);
      fetchMovies(); // To update modal review count & rating (Bug 01)
      fetchPopularReviews(); // Update popular reviews
    });
  });

  // Interaction 8: Refresh Recommend
  refreshRecommendBtn.addEventListener('click', () => {
    showToast('새로운 맞춤 영화를 분석 중입니다...');
    // dummy action
    setTimeout(() => {
      document.getElementById('hero-title').innerText = '타임 패러독스 오리진';
      document.getElementById('hero-genre').innerText = '액션 | 2025';
      document.querySelector('.hero-banner').style.backgroundImage = "linear-gradient(to right, rgba(10,10,10,1) 0%, rgba(10,10,10,0.3) 100%), url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200&h=400')";
      document.querySelector('.hero-detail-btn').dataset.id = 'mv2';
    }, 500);
  });

  document.querySelector('.hero-detail-btn').addEventListener('click', (e) => {
    openModal(e.target.dataset.id);
  });

  // Interaction 9: Preference Tags
  function fetchPreferences() {
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        prefTags = data.tags || [];
        updateTagUI();
      });
  }

  function updateTagUI() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
      const tag = btn.dataset.tag;
      if (prefTags.includes(tag)) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (prefTags.includes(tag)) prefTags = prefTags.filter(t => t !== tag);
      else prefTags.push(tag);
      updateTagUI();
    });
  });

  document.getElementById('save-pref-btn').addEventListener('click', () => {
    fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: prefTags })
    })
    .then(res => res.json())
    .then(() => showToast('취향 정보가 업데이트 되었습니다.'));
  });

  // Interaction 10: Tab Navigation
  function switchTab(navId, viewId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(navId).classList.add('active');
    
    document.querySelectorAll('main').forEach(m => m.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
  }

  navHome.addEventListener('click', () => switchTab('nav-home', 'home-view'));
  navGenres.addEventListener('click', () => switchTab('nav-genres', 'genres-view'));
  navFav.addEventListener('click', () => { switchTab('nav-fav', 'fav-view'); fetchFavorites(); });
  navPref.addEventListener('click', () => switchTab('nav-pref', 'pref-view'));

  // Toast
  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
