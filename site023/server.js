const express = require('express');
const path = require('path');
const app = express();
const PORT = 9242;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const photos = [
  { id: 1, title: "Urban Solitude", category: "Street", url: "https://images.unsplash.com/photo-1449156003053-c3c8209bb9a0?w=600&h=800&fit=crop", location: "New York, USA", year: 2023, likes: 124 },
  { id: 2, title: "Misty Mountains", category: "Nature", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=800&fit=crop", location: "Swiss Alps", year: 2022, likes: 89 },
  { id: 3, title: "Golden Hour", category: "Portrait", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop", location: "Paris, France", year: 2023, likes: 256 },
  { id: 4, title: "Industrial Rhythm", category: "Architecture", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=800&fit=crop", location: "Tokyo, Japan", year: 2021, likes: 145 },
  { id: 5, title: "Desert Silence", category: "Nature", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=800&fit=crop", location: "Sahara, Morocco", year: 2022, likes: 210 },
  { id: 6, title: "Neon Nights", category: "Street", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=800&fit=crop", location: "Seoul, Korea", year: 2023, likes: 312 }
];

const projects = [
  { id: 1, title: "Ethereal Dreams", description: "A series exploring the boundaries between reality and subconsciousness through surreal landscapes.", client: "Exhibition 2023", duration: "6 Months", image: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?w=400&h=250&fit=crop" },
  { id: 2, title: "Vanishing Frontiers", description: "Documenting the rapidly changing arctic environments and the impact on local communities.", client: "National Geographic", duration: "1 Year", image: "https://images.unsplash.com/photo-1520635665111-3663a8b3e04f?w=400&h=250&fit=crop" }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/photos', (req, res) => {
  const { category } = req.query;
  if (category && category !== 'All') {
    return res.json(photos.filter(p => p.category === category));
  }
  res.json(photos);
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
