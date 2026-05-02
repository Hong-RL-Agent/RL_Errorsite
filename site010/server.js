const express = require('express');
const path = require('path');
const app = express();
const PORT = 9339;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let songs = [
  { id: 's1', title: 'Neon Dreams', artist: 'SynthWave X', genre: 'Electronic', duration: '3:45', coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200&h=200', isPopular: true },
  { id: 's2', title: 'Midnight City Lights', artist: 'The Midnight', genre: 'Synthpop', duration: '4:12', coverImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=200&h=200', isPopular: true },
  { id: 's3', title: 'Acoustic Sunrise', artist: 'Jane Doe', genre: 'Acoustic', duration: '2:50', coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=200&h=200', isPopular: false },
  { id: 's4', title: 'Heavy Rain', artist: 'Storm', genre: 'Rock', duration: '5:01', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200&h=200', isPopular: true },
  { id: 's5', title: 'Chill Vibes Vol.1', artist: 'LoFi Boy', genre: 'Lo-Fi', duration: '2:30', coverImage: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=200&h=200', isPopular: false }
];

let playlists = [
  { id: 'p1', title: '오늘의 추천 일렉트로닉', owner: 'system', isPrivate: false, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300', songIds: ['s1', 's2'] },
  { id: 'p2', title: '나만의 드라이브 믹스', owner: 'user123', isPrivate: false, cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=300&h=300', songIds: ['s2', 's5'] },
  { id: '999', title: '비밀 일기장 노래', owner: 'admin_user', isPrivate: true, cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300', songIds: ['s3'] }
];

let userRecentlyPlayed = ['s1', 's5']; // By user123
let currentUserId = 'user123'; // Mock logged-in user

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MusicLoop API is running' });
});

// API: Get Songs
app.get('/api/songs', (req, res) => {
  const { type, corrupt } = req.query;
  let result = [...songs];

  if (type === 'popular') {
    result = result.filter(s => s.isPopular);
    
    // INTENTIONAL BUG: site010-bug02
    // CSV Error: 부분 응답 데이터 손상
    // Type: network-partial-response
    // Description: 인기 곡 API가 특정 요청에서 필수 필드 일부가 빠진 JSON을 반환함.
    if (corrupt === 'true') {
      result = result.map(s => {
        const copy = { ...s };
        delete copy.title; // Corrupt data
        delete copy.artist;
        delete copy.coverImage;
        return copy;
      });
    }
  }

  res.json(result);
});

// API: Get Playlists (public or mine)
app.get('/api/playlists', (req, res) => {
  const result = playlists.filter(p => !p.isPrivate || p.owner === currentUserId);
  res.json(result);
});

// API: Get Playlist Details
app.get('/api/playlists/:id', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  // INTENTIONAL BUG: site010-bug03
  // CSV Error: 비공개 리소스 접근 제어 실패
  // Type: security-access-control
  // Description: private playlist도 id만 알면 누구나 조회할 수 있음.
  // Missing check: if (playlist.isPrivate && playlist.owner !== currentUserId) return 403;

  res.json(playlist);
});

// API: Get Songs in Playlist
app.get('/api/playlists/:id/songs', (req, res) => {
  const playlistId = req.params.id;
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  // INTENTIONAL BUG: site010-bug01
  // CSV Error: DB 관계 매핑 오류
  // Type: database-relation
  // Description: 플레이리스트 상세 조회 시 playlistId가 아니라 userId로 곡 목록을 조회하여 다른 곡이 섞임.
  // We SHOULD return songs that are in playlist.songIds. 
  // INSTEAD, we simulate a join error by returning the current user's recently played songs!
  
  const mappedSongs = songs.filter(s => userRecentlyPlayed.includes(s.id)); 
  // It should be: const mappedSongs = songs.filter(s => playlist.songIds.includes(s.id));

  res.json(mappedSongs);
});

// API: Get Recent
app.get('/api/recent', (req, res) => {
  const recentSongs = songs.filter(s => userRecentlyPlayed.includes(s.id));
  res.json(recentSongs);
});

// API: Artists
app.get('/api/artists', (req, res) => {
  const artists = [
    { name: 'SynthWave X', followers: '1.2M', image: 'https://images.unsplash.com/photo-1549834125-82d3c48159a3?auto=format&fit=crop&q=80&w=200&h=200' },
    { name: 'The Midnight', followers: '3.4M', image: 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?auto=format&fit=crop&q=80&w=200&h=200' }
  ];
  res.json(artists);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
