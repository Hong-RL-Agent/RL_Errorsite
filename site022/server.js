const express = require('express');
const path = require('path');
const app = express();
const PORT = 9241;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const articles = [
  {
    id: 1,
    title: "The Future of Artificial Intelligence in 2024",
    summary: "AI continues to reshape industries at an unprecedented pace. From healthcare to finance, the impact is profound.",
    category: "Technology",
    author: "Jane Doe",
    time: "2 hours ago",
    comments: 42,
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "Global Markets See Significant Shift in Green Energy",
    summary: "Renewable energy stocks surged as countries announced new aggressive climate targets during the latest summit.",
    category: "Business",
    author: "John Smith",
    time: "5 hours ago",
    comments: 18,
    thumbnail: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "Exploring the Ancient Ruins of Lost Civilization",
    summary: "Archaeologists discover a massive underground city that could rewrite history as we know it.",
    category: "Science",
    author: "Dr. Aris Thorne",
    time: "1 day ago",
    comments: 125,
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=250&fit=crop"
  },
  {
    id: 4,
    title: "10 Best Travel Destinations for the Upcoming Season",
    summary: "From hidden beaches in Southeast Asia to snowy peaks in Europe, here are our top picks for your next vacation.",
    category: "Lifestyle",
    author: "Sarah Lee",
    time: "10 hours ago",
    comments: 67,
    thumbnail: "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=400&h=250&fit=crop"
  }
];

const trending = {
  keywords: ["Climate Summit", "AI Ethics", "Stock Market", "Olympic Games", "SpaceX Launch"],
  articles: [
    { id: 5, title: "Rising Interest Rates: What You Need to Know", views: "1.2M" },
    { id: 6, title: "New Breakthrough in Quantum Computing", views: "850K" }
  ]
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/articles', (req, res) => {
  const { category, search } = req.query;
  let filtered = articles;
  if (category && category !== 'All') {
    filtered = filtered.filter(a => a.category === category);
  }
  if (search) {
    filtered = filtered.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  }
  res.json(filtered);
});

app.get('/api/trending', (req, res) => {
  res.json(trending);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
