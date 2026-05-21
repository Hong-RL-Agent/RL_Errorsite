document.addEventListener('DOMContentLoaded', () => {
    let allMovies = [];
    let allReviews = [];
    let currentGenre = 'all';

    const moviesGrid = document.getElementById('movies-grid');
    const reviewsList = document.getElementById('reviews-list');
    const movieSearch = document.getElementById('movie-search');
    const genreFilters = document.querySelectorAll('.filter-btn');
    const reviewSort = document.getElementById('review-sort');
    const modal = document.getElementById('movie-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');
    const starSelector = document.querySelectorAll('.star-selector span');
    let selectedRating = 4;

    // Initialize
    fetchMovies();
    fetchReviews();

    async function fetchMovies() {
        try {
            const response = await fetch('/api/movies');
            allMovies = await response.json();
            renderMovies(allMovies);
        } catch (error) {
            moviesGrid.innerHTML = '<div class="error">영화 목록을 불러오지 못했습니다.</div>';
        }
    }

    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews');
            allReviews = await response.json();
            renderReviews(allReviews);
        } catch (error) {
            reviewsList.innerHTML = '<div class="error">리뷰를 불러오지 못했습니다.</div>';
        }
    }

    function renderMovies(movies) {
        moviesGrid.innerHTML = '';
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="movie-info">
                    <h4>${movie.title}</h4>
                    <span class="rating">⭐ ${movie.rating}</span>
                </div>
            `;
            card.addEventListener('click', () => openMovieDetail(movie));
            moviesGrid.appendChild(card);
        });
    }

    function renderReviews(reviews) {
        reviewsList.innerHTML = '';
        reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';
            if (review.id === 102) card.dataset.bugId = 'site054-bug02';

            const movie = allMovies.find(m => m.id === review.movieId) || { title: '영화' };
            
            // INTENTIONAL GUI BUG: site054-bug01
            // Description: 별점 렌더링 시 실제 rating보다 하나 많은 별을 채워 표시함. (e.g. 4 -> 5)
            const buggyStars = renderStars(review.rating + 1); // Bug: Add +1 to rating

            card.innerHTML = `
                <div class="review-header">
                    <div>
                        <span class="author">${review.author}</span>
                        <span class="movie-title"> (${movie.title})</span>
                    </div>
                    <div class="stars" data-bug-id="site054-bug01">${buggyStars}</div>
                </div>
                <p class="review-content">${review.content}</p>
                <div class="review-footer">
                    <span>작성일: ${review.date}</span>
                    <span>추천: ${review.recommendations}</span>
                </div>
            `;
            reviewsList.appendChild(card);
        });
    }

    function renderStars(rating) {
        // Simple star rendering logic
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '★' : '☆';
        }
        return stars;
    }

    function openMovieDetail(movie) {
        modalBody.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${movie.poster}" style="width: 200px; border-radius: 8px;">
                <div>
                    <h2 style="color: #d4af37; margin-bottom: 10px;">${movie.title}</h2>
                    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 15px;">장르: ${movie.genre} | 개봉: ${movie.releaseDate} | 평점: ⭐ ${movie.rating}</p>
                    <p style="line-height: 1.6;">${movie.synopsis}</p>
                    <button class="btn btn-gold" style="margin-top: 20px;" onclick="alert('준비 중입니다')">예매하기</button>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    // Filter Logic
    genreFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            genreFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGenre = btn.dataset.genre;
            applyFilters();
        });
    });

    movieSearch.addEventListener('input', applyFilters);

    function applyFilters() {
        const query = movieSearch.value.toLowerCase();
        const filtered = allMovies.filter(m => {
            const matchesGenre = currentGenre === 'all' || m.genre === currentGenre;
            const matchesSearch = m.title.toLowerCase().includes(query);
            return matchesGenre && matchesSearch;
        });
        renderMovies(filtered);
    }

    // Review Sorting
    reviewSort.addEventListener('change', () => {
        let sorted = [...allReviews];
        if (reviewSort.value === 'rating') {
            sorted.sort((a, b) => b.rating - a.rating);
        } else {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        renderReviews(sorted);
    });

    // Star Selector
    starSelector.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.val);
            starSelector.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating);
            });
        });
    });

    // Review Submission
    // INTENTIONAL GUI BUG: site054-bug03
    // Type: review-submit-button-no-response
    // Description: 리뷰 등록 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
    // DOM ID is 'btn-submit-review-wrong-selector', but we try to select 'btn-submit-review'
    const submitBtn = document.getElementById('btn-submit-review');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const content = document.getElementById('review-input').value;
            if (!content) {
                alert('리뷰 내용을 입력해 주세요.');
                return;
            }
            alert('리뷰가 등록되었습니다! (테스트용)');
            document.getElementById('review-input').value = '';
        });
    }

    // Modal Close
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});
