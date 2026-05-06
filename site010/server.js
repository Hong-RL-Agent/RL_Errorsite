const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9229;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const playlists = [
  { id: 1, name: 'Top 50 - Global' },
  { id: 2, name: 'Chill Vibes' },
  { id: 3, name: 'Workout Mix' },
  { id: 4, name: 'Lo-Fi Beats' },
  { id: 5, name: 'Late Night Drive' }
];

const tracks = [
  { id: 101, title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: '4:03', image: '🌃' },
  { id: 102, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', image: '🕶️' },
  { id: 103, title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: '3:50', image: '⭐' },
  { id: 104, title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23', image: '✨' },
  { id: 105, title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: '3:35', image: '💧' },
  { id: 106, title: 'Watermelon Sugar', artist: 'Harry Styles', album: 'Fine Line', duration: '2:54', image: '🍉' },
  { id: 107, title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: '3:18', image: '🍑' },
  { id: 108, title: 'Kiss Me More', artist: 'Doja Cat', album: 'Planet Her', duration: '3:28', image: '💋' },
  { id: 109, title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR', duration: '2:58', image: '💜' },
  { id: 110, title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'F*CK LOVE 3', duration: '2:21', image: '⏳' }
];

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site010', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/api/playlists', (req, res) => {
  res.json({ success: true, data: playlists });
});

app.get('/api/tracks', (req, res) => {
  res.json({ success: true, data: tracks });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Music server running -> http://localhost:${PORT}`);
});
