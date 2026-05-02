const express = require('express');
const path = require('path');
const app = express();
const PORT = 9388;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let games = [
  { id: 'g1', title: 'Neon Runner', genre: 'Action', rating: 4.5, reviews: 120, upcoming: false },
  { id: 'g2', title: 'Pixel Quest', genre: 'Adventure', rating: 3.8, reviews: 45, upcoming: false },
  { id: 'g3', title: 'Cyber Defense', genre: 'Strategy', rating: 4.2, reviews: 30, upcoming: true, releaseDate: '2024-06-15' },
  { id: 'g4', title: 'Soul Blade', genre: 'RPG', rating: 4.9, reviews: 200, upcoming: true, releaseDate: '2024-08-01' }
];

let reviews = [
  { id: 'r1', gameId: 'g1', score: 5, text: 'Amazing!', isDeleted: false },
  { id: 'r2', gameId: 'g1', score: 1, text: 'Hated it', isDeleted: true }, // 삭제된 리뷰
  { id: 'r3', gameId: 'g2', score: 4, text: 'Good but short', isDeleted: false }
];

let favorites = [
  { id: 'f1', userId: 'user_A', gameId: 'g1' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IndieGame API is running' });
});

// API: Get Games (with rating aggregation bug)
app.get('/api/games', (req, res) => {
  const { genre } = req.query;
  let filtered = games.filter(g => !g.upcoming);

  if (genre && genre !== 'All') {
    filtered = filtered.filter(g => g.genre === genre);
  }

  const result = filtered.map(g => {
    const gameReviews = reviews.filter(r => r.gameId === g.id);
    
    // INTENTIONAL BUG: site059-bug01
    // CSV Error: DB 평점 평균 오류
    // Type: database-aggregation
    // 버그: isDeleted: true 인 리뷰도 합산에 포함시킴
    const sum = gameReviews.reduce((acc, r) => acc + r.score, 0);
    const avg = gameReviews.length > 0 ? (sum / gameReviews.length).toFixed(1) : 0;

    return { ...g, rating: parseFloat(avg) };
  });

  res.json(result);
});

// API: Upcoming Games (with missing field bug)
app.get('/api/games/upcoming', (req, res) => {
  const upcoming = games.filter(g => g.upcoming).map(g => {
    // INTENTIONAL BUG: site059-bug02
    // CSV Error: 네트워크 스키마 누락
    // Type: network-missing-field
    // 버그: 특정 게임(id: g3)의 경우 releaseDate 필드를 누락시킴
    if (g.id === 'g3') {
      const { releaseDate, ...rest } = g;
      return rest;
    }
    return g;
  });
  res.json(upcoming);
});

// API: Add to Favorites (with security validation bug)
app.post('/api/favorites', (req, res) => {
  const { userId, gameId } = req.body;

  // INTENTIONAL BUG: site059-bug03
  // CSV Error: 찜 목록 사용자 검증 누락
  // Type: security-user-validation
  // 보안 취약점: body에 담긴 userId를 세션 정보와 대조하지 않고 그대로 저장함
  const newFav = { id: `f-${Date.now()}`, userId, gameId };
  favorites.push(newFav);

  res.status(201).json(newFav);
});

app.get('/api/favorites/:userId', (req, res) => {
  const myFavs = favorites.filter(f => f.userId === req.params.userId);
  res.json(myFavs.map(f => games.find(g => g.id === f.gameId)));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
