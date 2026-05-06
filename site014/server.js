import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9233;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const news = [
  { id: 1, category: 'Politics', title: 'New Economic Reform Announced', summary: 'The government has released details of the upcoming economic changes.', date: '2026-05-01' },
  { id: 2, category: 'Technology', title: 'Next-Gen AI Chips Released', summary: 'Major tech companies are racing to integrate new processing power.', date: '2026-05-01' },
  { id: 3, category: 'Economy', title: 'Market Hits All-Time High', summary: 'Stock indices surged today following positive employment data.', date: '2026-04-30' },
  { id: 4, category: 'Society', title: 'Local Communities Celebrate Spring', summary: 'Festivals are popping up across the country as weather warms.', date: '2026-04-30' },
  { id: 5, category: 'Sports', title: 'Underdog Team Wins Championship', summary: 'In a stunning upset, the season ended with a surprise victory.', date: '2026-04-29' },
  { id: 6, category: 'Technology', title: 'Cloud Computing Trends for 2026', summary: 'Experts weigh in on the future of serverless architecture.', date: '2026-04-29' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site014' });
});

app.get('/api/news', (req, res) => {
  res.json(news);
});

app.get('/api/trending', (req, res) => {
  res.json(news.slice(0, 3));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`News Portal Server running on http://localhost:${PORT}`);
});
