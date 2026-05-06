const express = require('express');
const path = require('path');
const app = express();
const PORT = 9293;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Mock Data
const categories = [
  { id: 'cat1', name: 'Business', count: 42 },
  { id: 'cat2', name: 'Education', count: 28 },
  { id: 'cat3', name: 'Personal', count: 15 },
  { id: 'cat4', name: 'Design', count: 34 }
];

const templates = [
  {
    id: 'T001',
    title: 'Professional Business Proposal',
    category: 'Business',
    format: 'DOCX',
    price: 15000,
    downloads: 1250,
    thumbnail: 'assets/thumb-1.jpg'
  },
  {
    id: 'T002',
    title: 'Minimalist Student Resume',
    category: 'Education',
    format: 'PDF',
    price: 0,
    downloads: 3400,
    thumbnail: 'assets/thumb-2.jpg'
  },
  {
    id: 'T003',
    title: 'Creative Portfolio Deck',
    category: 'Design',
    format: 'PPTX',
    price: 25000,
    downloads: 850,
    thumbnail: 'assets/thumb-3.jpg'
  },
  {
    id: 'T004',
    title: 'Weekly Task Planner',
    category: 'Personal',
    format: 'XLSX',
    price: 5000,
    downloads: 2100,
    thumbnail: 'assets/thumb-4.jpg'
  },
  {
    id: 'T005',
    title: 'Brand Identity Guidelines',
    category: 'Design',
    format: 'PDF',
    price: 35000,
    downloads: 420,
    thumbnail: 'assets/thumb-5.jpg'
  },
  {
    id: 'T006',
    title: 'Quarterly Financial Report',
    category: 'Business',
    format: 'XLSX',
    price: 20000,
    downloads: 670,
    thumbnail: 'assets/thumb-6.jpg'
  }
];

// API Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TemplateFlow API is healthy' });
});

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/templates', (req, res) => {
  res.json(templates);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
