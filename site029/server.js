import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9155;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data: Real-time Music Chart
const genres = ['K-Pop', 'Pop', 'Hip-Hop', 'Indie', 'Rock'];
const songs = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: `Song ${String.fromCharCode(65 + (i % 26))}${i > 25 ? Math.floor(i/26) : ''}`,
  artist: `Artist ${Math.floor(i / 10) + 1}`,
  genre: genres[i % genres.length],
  plays: Math.floor(Math.random() * 2000000) + 500000,
  rank: i + 1,
  lastRank: i + 1 + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 5) - 1)
}));

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site029",
    status: "healthy",
    timestamp: Date.now()
  });
});

// 2. GET /api/charts
app.get('/api/charts', (req, res) => {
  const { genre, minPlays, search } = req.query;
  
  // INTENTIONAL BACKEND BUG: site029-bug01
  // Type: edge-case-missing
  // Description: 차트가 비어있거나 알 수 없는 장르일 때 null을 반환하여 에러 유도
  if (genre === 'unknown') {
    return res.json({
      data: null,
      bugId: "site029-bug01"
    });
  }

  let filteredSongs = [...songs];

  // INTENTIONAL BACKEND BUG: site029-bug03
  // Type: logical-operator-error
  // Description: 필터 조건에서 AND 대신 OR 사용 (genre가 일치하거나 minPlays보다 큰 경우 모두 반환)
  if (genre && minPlays) {
    filteredSongs = songs.filter(s => s.genre.toLowerCase() === genre.toLowerCase() || s.plays >= parseInt(minPlays));
    return res.json({
      data: filteredSongs,
      bugId: "site029-bug03"
    });
  }

  if (genre) {
    filteredSongs = filteredSongs.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
  }
  if (minPlays) {
    filteredSongs = filteredSongs.filter(s => s.plays >= parseInt(minPlays));
  }
  if (search) {
    filteredSongs = filteredSongs.filter(s => 
      s.title.toLowerCase().includes(search.toLowerCase()) || 
      s.artist.toLowerCase().includes(search.toLowerCase())
    );
  }

  // INTENTIONAL BACKEND BUG: site029-bug02
  // Type: arithmetic-operator-error
  // Description: 순위 변동 계산 시 lastRank - rank (상승) 대신 rank - lastRank (하락처럼 보임) 사용
  const result = filteredSongs.map(s => ({
    ...s,
    rankChange: s.rank - s.lastRank, // BUG: Should be lastRank - rank for correct "rise" positive value
    bugId: "site029-bug02"
  }));

  res.json({ data: result });
});

// 3. GET /api/charts/popular
app.get('/api/charts/popular', (req, res) => {
  // INTENTIONAL BACKEND BUG: site029-bug04
  // Type: sorting-logic-error
  // Description: 재생 수 기준 내림차순이 아니라 오름차순 정렬됨
  const popular = [...songs].sort((a, b) => a.plays - b.plays); // BUG: Should be b.plays - a.plays

  res.json({
    data: popular.slice(0, 10),
    sorted: "ascending",
    bugId: "site029-bug04"
  });
});

// 4. GET /api/charts/:id
app.get('/api/charts/:id', (req, res) => {
  const song = songs.find(s => s.id === parseInt(req.params.id));
  if (!song) return res.status(404).json({ message: "Song not found" });
  res.json(song);
});

// 5. GET /api/search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = songs.filter(s => s.title.toLowerCase().includes((q || '').toLowerCase())).slice(0, 5);
  res.json(results.map(s => ({ title: s.title, artist: s.artist, id: s.id })));
});

// 6. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalSongs: songs.length,
    topPlays: Math.max(...songs.map(s => s.plays)),
    activeListeners: 124500,
    systemStatus: "OPTIMAL"
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site029 Music Chart running on http://localhost:${PORT}`);
});
