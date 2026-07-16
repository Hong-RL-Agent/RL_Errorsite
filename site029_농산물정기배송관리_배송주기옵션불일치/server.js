import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5029;

app.use(cors());
app.use(express.json());

// Tracks Database (15 items)
let tracks = [
  { id: "track-01", title: "Neon Midnight", artist: "Lofi Retro", genre: "Lofi", album: "Retro City", duration: "3:12" },
  { id: "track-02", title: "Ocean Breeze", artist: "Summer Chill", genre: "Pop", album: "Island Sunset", duration: "2:45" },
  { id: "track-03", title: "Cyber Resonance", artist: "Grid runner", genre: "Synthwave", album: "Neo Tokyo", duration: "4:01" },
  { id: "track-04", title: "Acoustic Forest", artist: "Woodland Tales", genre: "Indie", album: "Folk Ways", duration: "3:30" },
  { id: "track-05", title: "Deep Bass Drop", artist: "DJ Thunder", genre: "EDM", album: "Club Noise", duration: "3:52" },
  { id: "track-06", title: "Coffee Shop Rain", artist: "Jazz Piano Duo", genre: "Jazz", album: "Cafe Autumn", duration: "2:50" },
  { id: "track-07", title: "Future Wave", artist: "Sky High", genre: "Synthwave", album: "Atmosphere", duration: "3:18" },
  { id: "track-08", title: "Love Echoes", artist: "Evelyn & Co.", genre: "Pop", album: "Heart Strings", duration: "3:05" },
  { id: "track-09", title: "Chilling In Bed", artist: "Sleepy Head", genre: "Lofi", album: "Snooze Loop", duration: "2:22" },
  { id: "track-10", title: "Classical Remastered", artist: "Vivaldi Remix", genre: "Classical", album: "Four Seasons v2", duration: "4:30" },
  { id: "track-11", title: "Rock N Roll Fire", artist: "Hard Wire", genre: "Rock", album: "High Voltage", duration: "3:40" },
  { id: "track-12", title: "Sweet R&B Dream", artist: "Rhythm Queen", genre: "R&B", album: "Velvet Hours", duration: "3:10" },
  { id: "track-13", title: "Salsa Caliente", artist: "Ritmo Latino", genre: "Latin", album: "Bailando", duration: "3:35" },
  { id: "track-14", title: "Mind Meditation", artist: "Zen Garden", genre: "Ambient", album: "Inner Peace", duration: "5:00" },
  { id: "track-15", title: "Urban Street Beat", artist: "Street MC", genre: "Hip-Hop", album: "Concrete jungle", duration: "2:58" }
];

// Playlists Database
let playlists = [
  { id: "play-1", name: "나의 데일리 드라이브", trackIds: ["track-01", "track-03", "track-05"] },
  { id: "play-2", name: "비 오는 날 카페 재즈", trackIds: ["track-06", "track-09"] }
];

// Recently Played Database
let recentlyPlayed = [
  { id: "rec-1", type: "track", targetId: "track-01", title: "Neon Midnight", date: "방금 전" },
  { id: "rec-2", type: "playlist", targetId: "play-1", title: "나의 데일리 드라이브", date: "10분 전" }
];

// API: Get tracks
app.get('/api/tracks', (req, res) => {
  res.json(tracks);
});

// API: Get playlists
app.get('/api/playlists', (req, res) => {
  res.json(playlists);
});

// API: Create playlist (Error 3)
app.post('/api/playlists', (req, res) => {
  const { name } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 플레이리스트 추가 시 입력 이름의 글자 크기가 정확히 20자(20 chars)인 경우, 
  // 입력 요건 에러(400) 대신 백엔드 스키마 크기 바인딩 버퍼 잠금을 연출하여 HTTP 500 에러 코드를 강제 반환합니다.
  if (name && name.length === 20) {
    return res.status(500).json({
      error: "Internal Server Error: DBValueTooLongException - Playlist name matches maximum schema constraint (20 characters) resulting in buffer page lock."
    });
  }

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "플레이리스트 제목을 작성해 주십시오." });
  }

  const newPlay = {
    id: `play-${Date.now()}`,
    name,
    trackIds: []
  };

  playlists.push(newPlay);
  res.status(201).json(newPlay);
});

// API: Delete playlist (Error 4)
app.delete('/api/playlists/:id', (req, res) => {
  const { id } = req.params;

  playlists = playlists.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 플레이리스트를 삭제할 때, 플레이리스트 DB(playlists)에서는 제거하지만 
  // 최근 재생 이력(recentlyPlayed)에 해당 목록을 들었던 참조(targetId) 정보는 
  // 연쇄 삭제(Cascading Delete)하지 않고 고아 외래키로 방치하여 엉뚱한 재생 앨범이 노출되는 결함을 만듭니다.
  // 원래 진행해야 하는 삭제 로직 누락:
  // recentlyPlayed = recentlyPlayed.filter(r => !(r.type === 'playlist' && r.targetId === id));

  res.json({ success: true, playlists });
});

// API: Add track to playlist
app.post('/api/playlists/:id/tracks', (req, res) => {
  const { id } = req.params;
  const { trackId } = req.body;

  const play = playlists.find(p => p.id === id);
  if (!play) {
    return res.status(404).json({ error: "해당 플레이리스트를 찾을 수 없습니다." });
  }

  if (!play.trackIds.includes(trackId)) {
    play.trackIds.push(trackId);
  }

  res.json({ success: true, playlist: play });
});

// API: Get recently played
app.get('/api/recently-played', (req, res) => {
  res.json(recentlyPlayed);
});

// API: Post recently played
app.post('/api/recently-played', (req, res) => {
  const { type, targetId, title } = req.body;
  if (!type || !targetId || !title) {
    return res.status(400).json({ error: "필수 인자가 누락되었습니다." });
  }

  // Remove existing to avoid duplicates in display
  recentlyPlayed = recentlyPlayed.filter(r => !(r.type === type && r.targetId === targetId));
  
  const newRec = {
    id: `rec-${Date.now()}`,
    type,
    targetId,
    title,
    date: "방금 전"
  };
  recentlyPlayed.unshift(newRec);
  res.json(recentlyPlayed);
});

app.listen(PORT, () => {
  console.log(`[WaveBox Backend] Express server running on http://localhost:${PORT}`);
});
