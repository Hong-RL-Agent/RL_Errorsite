import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9153;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Movie Data
let movies = [
  { id: 1, title: "인셉션 (Inception)", genre: "SF", rating: 9.1, img: "https://picsum.photos/seed/inception/400/600", desc: "타인의 꿈에 접속해 생각을 심는 거대한 작전." },
  { id: 2, title: "인터스텔라 (Interstellar)", genre: "SF", rating: "9.5", img: "https://picsum.photos/seed/interstellar/400/600", desc: "인류를 구하기 위한 시공간을 초월한 우주 탐사." },
  { id: 3, title: "다크 나이트 (The Dark Knight)", genre: "액션", rating: 9.0, img: "https://picsum.photos/seed/darkknight/400/600", desc: "고담시를 위협하는 조커와 그에 맞서는 배트맨." },
  { id: 4, title: "기생충 (Parasite)", genre: "드라마", rating: "8.6", img: "https://picsum.photos/seed/parasite/400/600", desc: "전혀 다른 두 가족의 만남이 불러온 걷잡을 수 없는 사건." },
  { id: 5, title: "어벤져스: 엔드게임", genre: "액션", rating: 8.4, img: "https://picsum.photos/seed/avengers/400/600", desc: "인류의 절반이 사라진 후, 남겨진 히어로들의 마지막 반격." },
  { id: 6, title: "너의 이름은.", genre: "애니메이션", rating: "8.8", img: "https://picsum.photos/seed/yourname/400/600", desc: "꿈속에서 몸이 바뀐 두 소년 소녀의 기적 같은 이야기." },
  { id: 7, title: "라라랜드", genre: "로맨스", rating: 8.1, img: "https://picsum.photos/seed/lalaland/400/600", desc: "꿈과 사랑을 쫓는 두 사람의 마법 같은 순간." },
  { id: 8, title: "매트릭스", genre: "SF", rating: "8.7", img: "https://picsum.photos/seed/matrix/400/600", desc: "가상 현실의 진실을 깨닫고 저항하는 네오의 여정." }
];

let watchHistory = [];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site033",
    status: "healthy"
  });
});

// 2. GET /api/movies
app.get('/api/movies', (req, res) => {
  const { search, genre } = req.query;
  let filtered = [...movies];

  if (genre) {
    filtered = filtered.filter(m => m.genre === genre);
  }

  // INTENTIONAL BUG: site033-bug01
  if (search) {
    // If search contains 'é' or specific accented chars, return empty results with bugId
    if (search.includes('é') || search.includes('É')) {
      return res.json({
        data: [],
        bugId: "site033-bug01",
        type: "language-edge-case"
      });
    }
    // Case-sensitive search bug: 'inception' won't match 'Inception'
    filtered = filtered.filter(m => m.title.includes(search));
    
    // If results are filtered out due to case sensitivity, also flag as bug 01 potentially
    if (filtered.length === 0 && search.length > 0) {
       return res.json({
         data: [],
         bugId: "site033-bug01",
         type: "language-edge-case",
         message: "Case-sensitive search failed to find matches."
       });
    }
  }

  res.json({ data: filtered });
});

// 3. GET /api/movies/popular
app.get('/api/movies/popular', (req, res) => {
  // INTENTIONAL BUG: site033-bug02
  // Type: type-system-error
  // Sorting is completely broken because of mixed types
  let sorted = [...movies].sort((a, b) => {
    // Return random or reversed sort to make it obvious
    return String(a.rating).localeCompare(String(b.rating)); 
  });
  
  res.json({
    data: sorted,
    bugId: "site033-bug02",
    type: "type-system-error"
  });
});

// 4. GET /api/movies/:id
app.get('/api/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find(m => m.id === id);

  // INTENTIONAL BUG: site033-bug03
  // Type: runtime-behavior-error
  // Description: Null/Undefined access leading to fallback response.
  if (!movie) {
    // Attempting to access property of undefined (simulated runtime catch)
    try {
      // Logic error: trying to access something non-existent
      let x = undefined;
      let y = x.property; 
    } catch (e) {
      return res.json({
        id: null,
        title: "알 수 없는 영화",
        desc: "요청하신 영화 정보를 찾을 수 없거나 시스템 오류가 발생했습니다.",
        bugId: "site033-bug03",
        type: "runtime-behavior-error"
      });
    }
  }

  res.json(movie);
});

// 5. POST /api/watch
app.post('/api/watch', (req, res) => {
  const { movieId } = req.body;
  const movie = movies.find(m => m.id === movieId);
  if (movie) {
    watchHistory.unshift({ ...movie, watchedAt: new Date().toISOString() });
    watchHistory = watchHistory.slice(0, 10); // Keep last 10
  }
  res.json({ status: "saved" });
});

// 6. GET /api/watch/history
app.get('/api/watch/history', (req, res) => {
  res.json({ data: watchHistory });
});

// 7. GET /api/test/mutate
app.get('/api/test/mutate', (req, res) => {
  // INTENTIONAL BUG: site033-bug04
  // Type: test-side-effect
  // Description: Test API mutates production data (randomly changes a rating)
  const idx = Math.floor(Math.random() * movies.length);
  movies[idx].rating = (Math.random() * 10).toFixed(1);
  
  res.json({
    mutated: true,
    movieId: movies[idx].id,
    newRating: movies[idx].rating,
    bugId: "site033-bug04",
    type: "test-side-effect"
  });
});

// 8. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalMovies: movies.length,
    watched: watchHistory.length,
    topGenre: "SF"
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site033 OTT Streaming running on http://localhost:${PORT}`);
});
