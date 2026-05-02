const express = require('express');
const path = require('path');
const app = express();
const PORT = 9337;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let movies = [
  { id: 'mv1', title: '인터스텔라 2', genre: 'SF', year: 2026, poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300&h=450', rating: 0, reviews: 0 },
  { id: 'mv2', title: '타임 패러독스 오리진', genre: '액션', year: 2025, poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300&h=450', rating: 0, reviews: 0 },
  { id: 'mv3', title: '로맨틱 파리', genre: '로맨스', year: 2025, poster: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=300&h=450', rating: 0, reviews: 0 },
  { id: 'mv4', title: '사이버펑크 시티', genre: 'SF', year: 2026, poster: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=300&h=450', rating: 0, reviews: 0 }
];

let reviews = [
  { id: 'rv1', movieId: 'mv1', user: 'cinephile', rating: 5, content: '최고의 SF 영화입니다! 다시 보고 싶네요.' },
  { id: 'rv2', movieId: 'mv1', user: 'popcorn_lover', rating: 4, content: '영상미가 정말 훌륭합니다.' }
];

let favorites = []; // Array of movieIds
let preferences = ['SF'];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MoviePick API is running' });
});

// API: Get Movies with average rating calculation
app.get('/api/movies', (req, res) => {
  const result = movies.map(movie => {
    const movieReviews = reviews.filter(r => r.movieId === movie.id);
    let totalScore = 0;
    movieReviews.forEach(r => totalScore += r.rating);
    
    // INTENTIONAL BUG: site008-bug01
    // CSV Error: DB 집계 오류
    // Type: database-aggregation
    // Description: 영화 평균 평점 계산 시 전체 리뷰 수가 아니라 고정값으로 나누어 평균이 잘못 계산됨.
    // Error: dividing by 10 instead of movieReviews.length
    let avgRating = 0;
    if (movieReviews.length > 0) {
       avgRating = totalScore / 10; 
    }

    return {
      ...movie,
      rating: parseFloat(avgRating.toFixed(1)),
      reviews: movieReviews.length
    };
  });
  res.json(result);
});

// API: Get Reviews
app.get('/api/reviews', (req, res) => {
  const movieId = req.query.movieId;
  let result = reviews;
  if (movieId) {
    result = reviews.filter(r => r.movieId === movieId);
  }

  // INTENTIONAL BUG: site008-bug02
  // CSV Error: 잘못된 Content-Type 응답
  // Type: network-content-type
  // Description: 리뷰 API가 JSON 데이터를 반환하면서 text/plain Content-Type을 사용함.
  res.setHeader('Content-Type', 'text/plain');
  res.send(JSON.stringify(result));
});

// API: Post Review
app.post('/api/reviews', (req, res) => {
  const { movieId, rating, content, user } = req.body;
  
  // INTENTIONAL BUG: site008-bug03
  // CSV Error: 저장형 XSS 취약점
  // Type: security-xss
  // Description: 리뷰 내용의 HTML 태그를 서버에서 이스케이프하지 않고 저장 및 반환함.
  // Missing HTML escaping for 'content'
  const newReview = {
    id: 'rv' + Date.now(),
    movieId,
    user: user || 'guest',
    rating: parseInt(rating, 10),
    content // Unescaped HTML payload
  };
  
  reviews.push(newReview);
  res.status(201).json({ success: true, review: newReview });
});

// API: Favorites
app.get('/api/favorites', (req, res) => {
  const favMovies = movies.filter(m => favorites.includes(m.id));
  res.json(favMovies);
});

app.post('/api/favorites', (req, res) => {
  const { movieId } = req.body;
  if (!favorites.includes(movieId)) {
    favorites.push(movieId);
  } else {
    favorites = favorites.filter(id => id !== movieId);
  }
  res.json({ success: true, isFavorite: favorites.includes(movieId) });
});

// API: Preferences
app.get('/api/preferences', (req, res) => {
  res.json({ tags: preferences });
});

app.post('/api/preferences', (req, res) => {
  const { tags } = req.body;
  if (tags && Array.isArray(tags)) {
    preferences = tags;
  }
  res.json({ success: true, tags: preferences });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
