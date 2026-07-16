import { createSignal, createEffect, For, Show } from 'solid-js';

export default function App() {
  // Database states (Signals)
  const [movies, setMovies] = createSignal([]);
  const [selectedMovieId, setSelectedMovieId] = createSignal('movie-01');
  const [reviews, setReviews] = createSignal([]);
  const [showtimes, setShowtimes] = createSignal([]);
  
  // Watchlist & UI Filter States
  const [watchlist, setWatchlist] = createSignal(['movie-01']);
  const [selectedGenre, setSelectedGenre] = createSignal('All');
  const [searchQuery, setSearchQuery] = createSignal('');
  
  // Review form states
  const [username, setUsername] = createSignal('');
  const [rating, setRating] = createSignal(5);
  const [content, setContent] = createSignal('');
  const [editReviewId, setEditReviewId] = createSignal(null);

  // Alert Notifications
  const [toasts, setToasts] = createSignal([]);

  // Fetch initial movie list
  createEffect(async () => {
    try {
      const res = await fetch('/api/movies');
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      showToast('영화 정보 DB를 조회하지 못했습니다.', 'danger');
    }
  });

  // Load reviews & showtimes when selected movie changes
  createEffect(() => {
    const movieId = selectedMovieId();
    if (movieId) {
      loadReviews(movieId);
      loadShowtimes(movieId);
      // Reset review form
      setEditReviewId(null);
      setContent('');
      setUsername('');
    }
  });

  const loadReviews = async (movieId) => {
    try {
      const res = await fetch(`/api/movies/${movieId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      showToast('리뷰 목록 로딩 실패', 'danger');
    }
  };

  // Error 3: movie-06 calls port 9598
  const loadShowtimes = async (movieId) => {
    let url = `/api/movies/${movieId}/showtimes`;

    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 선택한 영화 식별자가 'movie-06'인 경우에만 정상적인 프록시 백엔드가 아닌,
    // 대기 상태가 아닌 임의 포트 번호인 'http://localhost:9598/api/movies/movie-06/showtimes'로 
    // AJAX 통신을 시도하게 유도하여 브라우저에서 네트워크 연결 거부 에러(ERR_CONNECTION_REFUSED)가 떨어지게 조작합니다.
    if (movieId === 'movie-06') {
      url = 'http://localhost:9598/api/movies/movie-06/showtimes';
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setShowtimes(data);
    } catch (err) {
      showToast(`상영 시간 조회 실패: ${err.message}`, 'danger');
      setShowtimes([]);
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleToggleWatchlist = (movieId) => {
    if (watchlist().includes(movieId)) {
      setWatchlist(watchlist().filter(id => id !== movieId));
      showToast('관심 목록에서 해제되었습니다.', 'info');
    } else {
      setWatchlist([...watchlist(), movieId]);
      showToast('관심 영화 목록에 저장되었습니다.', 'success');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const movieId = selectedMovieId();

    if (!username().trim()) {
      showToast('필명을 입력해 주십시오.', 'warning');
      return;
    }

    const payload = {
      username: username(),
      rating: Number(rating()),
      content: content(),
      movieId
    };

    try {
      let res;
      if (editReviewId()) {
        // Edit existing review
        res = await fetch(`/api/reviews/${editReviewId()}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Post new review
        res = await fetch(`/api/movies/${movieId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '리뷰 저장 실패');
      }

      showToast(editReviewId() ? '리뷰가 수정되었습니다. (중복 버그 발생)' : '리뷰가 성공적으로 기재되었습니다.', 'success');
      
      // Reset form
      setContent('');
      setUsername('');
      setEditReviewId(null);
      loadReviews(movieId);
    } catch (err) {
      showToast(`[리뷰 에러] ${err.message}`, 'danger');
    }
  };

  const startEditReview = (rev) => {
    setEditReviewId(rev.id);
    setUsername(rev.username);
    setRating(rev.rating);
    setContent(rev.content);
    showToast('리뷰 수정 모드로 진입했습니다.', 'info');
  };

  // Filtered movies
  const filteredMovies = () => {
    return movies().filter(m => {
      const matchGenre = selectedGenre() === 'All' || m.genre === selectedGenre();
      const matchSearch = m.title.toLowerCase().includes(searchQuery().toLowerCase()) || 
                          m.director.toLowerCase().includes(searchQuery().toLowerCase());
      return matchGenre && matchSearch;
    });
  };

  const getMovieTitle = (id) => {
    const m = movies().find(x => x.id === id);
    return m ? m.title : id;
  };

  const activeMovie = () => {
    return movies().find(m => m.id === selectedMovieId());
  };

  return (
    <div class="cinescope-app">
      {/* App Navbar */}
      <header class="app-navbar">
        <div class="navbar-logo">
          <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
          </svg>
          <span class="logo-title">CineScope</span>
          <span class="logo-subtitle">프리미엄 소셜 필름 아카이브</span>
        </div>
        <div class="navbar-search">
          <input 
            type="text" 
            placeholder="영화명, 감독 검색..." 
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.target.value)}
            class="nav-search-bar"
          />
        </div>
      </header>

      {/* Top horizontal genres bar */}
      <nav class="genres-navigation-row">
        <For each={['All', 'SF', '로맨스', '스릴러', '코미디', '액션', '드라마', '공포']}>
          {(genre) => (
            <button 
              class={`genre-pill-btn ${selectedGenre() === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre === 'All' ? '전체 영화' : genre}
            </button>
          )}
        </For>
      </nav>

      {/* Main 3-Column Cinema Dashboard Layout */}
      <div class="cinema-dashboard-grid">
        
        {/* Left column: Movies catalog scroller list */}
        <aside class="panel-section left-movies-catalog">
          <div class="panel-header">
            <h2>🎬 영화 목록 ({filteredMovies().length})</h2>
          </div>

          <div class="movies-cards-vertical-list">
            <For each={filteredMovies()}>
              {(movie) => (
                <div 
                  class={`movie-list-item-card ${selectedMovieId() === movie.id ? 'active' : ''}`}
                  onClick={() => setSelectedMovieId(movie.id)}
                >
                  <div class="card-mini-poster">
                    <img src={movie.poster} alt={movie.title} class="mini-img" />
                  </div>
                  <div class="card-mini-info">
                    <h4>{movie.title}</h4>
                    <p class="meta">{movie.genre} | ⭐ {movie.rating}</p>
                  </div>
                </div>
              )}
            </For>
            <Show when={filteredMovies().length === 0}>
              <div class="empty-placeholder">조건에 부합하는 영화가 없습니다.</div>
            </Show>
          </div>
        </aside>

        {/* Center column: Large movie poster & Accordion details & Reviews bubbles */}
        <main class="center-movie-workspace">
          <Show when={activeMovie()}>
            {(movie) => (
              <div class="workspace-contents">
                
                {/* Large poster banner block */}
                <section class="panel-section movie-large-banner">
                  <div class="banner-layout">
                    <div class="large-poster-frame">
                      {/* Generates broken image for movie-09 due to .jpg extension trigger */}
                      <img src={movie().poster} alt={movie().title} class="large-poster-img" />
                    </div>
                    
                    <div class="banner-details">
                      <span class="genre-badge">{movie().genre}</span>
                      <h1 class="movie-title">{movie().title}</h1>
                      <p class="director-lbl">감독: <strong>{movie().director}</strong></p>
                      <p class="rating-lbl">평점: <strong class="score">⭐ {movie().rating}</strong></p>
                      
                      <button 
                        class={`watchlist-toggle-btn ${watchlist().includes(movie().id) ? 'saved' : ''}`}
                        onClick={() => handleToggleWatchlist(movie().id)}
                      >
                        {watchlist().includes(movie().id) ? '💖 관심 해제' : '🤍 관심 등록'}
                      </button>
                    </div>
                  </div>
                  
                  <div class="movie-description-card">
                    <p>{movie().description}</p>
                  </div>
                </section>

                {/* Review Write form and reviews bubble timeline */}
                <section class="panel-section movie-reviews-section">
                  <div class="panel-header">
                    <h2>💬 관객 평론 & 리뷰 ({reviews().length})</h2>
                  </div>

                  {/* Review Write box */}
                  <form onSubmit={handleReviewSubmit} class="review-compose-form">
                    <h3>{editReviewId() ? '✏️ 리뷰 내용 수정하기' : '✍️ 한줄평 작성하기'}</h3>
                    <div class="compose-grid">
                      <input 
                        type="text" 
                        placeholder="작성자 닉네임" 
                        value={username()}
                        onInput={(e) => setUsername(e.target.value)}
                        class="compose-in name-in"
                        disabled={editReviewId() !== null}
                      />
                      <select 
                        value={rating()}
                        onChange={(e) => setRating(Number(e.target.value))}
                        class="compose-in rating-select"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                        <option value="4">⭐⭐⭐⭐ (4점)</option>
                        <option value="3">⭐⭐⭐ (3점)</option>
                        <option value="2">⭐⭐ (2점)</option>
                        <option value="1">⭐ (1점)</option>
                      </select>
                      
                      <textarea 
                        placeholder="리뷰 평론 내용을 정성껏 기입하세요. (최상점 5점일 때 비우면 서버 장애 발생)" 
                        value={content()}
                        onInput={(e) => setContent(e.target.value)}
                        class="compose-in content-area"
                      />
                      
                      <div class="form-actions">
                        <Show when={editReviewId()}>
                          <button type="button" class="cancel-edit-btn" onClick={() => setEditReviewId(null)}>취소</button>
                        </Show>
                        <button type="submit" class="submit-review-btn">
                          {editReviewId() ? '수정 완료' : '리뷰 등록'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Bubble Timeline Reviews List */}
                  <div class="reviews-bubble-timeline">
                    <For each={reviews()}>
                      {(rev) => (
                        <div class="review-bubble-item">
                          <div class="bubble-header">
                            <span class="user-name">👤 {rev.username}</span>
                            <span class="user-score">⭐ {rev.rating}점</span>
                            <span class="date">{rev.date}</span>
                          </div>
                          
                          <div class="bubble-content-text">
                            <p>{rev.content}</p>
                          </div>
                          
                          <div class="bubble-footer-actions">
                            <button class="edit-btn" onClick={() => startEditReview(rev)}>수정</button>
                          </div>
                        </div>
                      )}
                    </For>
                    <Show when={reviews().length === 0}>
                      <div class="empty-placeholder">작성된 리뷰가 없습니다. 첫 평평을 남겨보세요!</div>
                    </Show>
                  </div>

                </section>

              </div>
            )}
          </Show>
        </main>

        {/* Right column: Showtimes schedules & watchlist */}
        <aside class="right-schedules-watchlist-column">
          
          {/* Showtimes panel */}
          <section class="panel-section showtimes-timeline-panel">
            <div class="panel-header">
              <h2>⏰ 오늘 상영 시간표</h2>
              <p class="subtitle">{getMovieTitle(selectedMovieId())}</p>
            </div>

            <div class="showtimes-grid-list">
              <For each={showtimes()}>
                {(time) => (
                  <div class="showtime-badge">
                    <span class="time">{time}</span>
                    <span class="status">예매가능</span>
                  </div>
                )}
              </For>
              <Show when={showtimes().length === 0}>
                <div class="empty-placeholder">조회 가능한 상영 일정이 없거나 통신 장애가 일어났습니다.</div>
              </Show>
            </div>
          </section>

          {/* Watchlist panel */}
          <section class="panel-section watchlist-records-panel">
            <div class="panel-header">
              <h2>💖 관심 영화 목록 ({watchlist().length})</h2>
            </div>

            <div class="watchlist-vertical-list">
              <For each={watchlist()}>
                {(id) => (
                  <div class="watchlist-mini-card" onClick={() => setSelectedMovieId(id)}>
                    <span class="title">🎬 {getMovieTitle(id)}</span>
                    <button class="del-btn" onClick={(e) => { e.stopPropagation(); handleToggleWatchlist(id); }}>&times;</button>
                  </div>
                )}
              </For>
              <Show when={watchlist().length === 0}>
                <div class="empty-placeholder">관심 등록한 영화가 비어 있습니다.</div>
              </Show>
            </div>
          </section>

        </aside>

      </div>

      {/* Toast popup warnings */}
      <div class="toast-container">
        <For each={toasts()}>
          {(t) => (
            <div class={`toast-card ${t.type}`}>
              <span class="toast-icon">
                {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
              </span>
              <span class="toast-message">{t.message}</span>
              <button class="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
