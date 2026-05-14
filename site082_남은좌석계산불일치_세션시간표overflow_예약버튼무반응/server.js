const express = require('express');
const path = require('path');
const app = express();
const PORT = 9301;

app.use(express.static(path.join(__dirname, 'public')));

// API Data
const sessions = [
  {
    id: 's001',
    title: 'AI and the Future of Software Engineering',
    category: 'Technology',
    speakerId: 'sp001',
    date: '2026-06-15',
    time: '10:00 - 11:30',
    location: 'Main Hall A',
    capacity: 100,
    reserved: 88,
    isPopular: true
  },
  {
    id: 's002',
    title: 'Modern Product Design Patterns in 2026',
    category: 'Design',
    speakerId: 'sp002',
    date: '2026-06-15',
    time: '13:00 - 14:30',
    location: 'Design Studio B',
    capacity: 50,
    reserved: 42,
    isPopular: false
  },
  {
    id: 's003',
    title: 'The Psychology of High-Performance Teams',
    category: 'Leadership',
    speakerId: 'sp003',
    date: '2026-06-16',
    time: '09:00 - 10:30',
    location: 'Leadership Suite C',
    capacity: 80,
    reserved: 75,
    isPopular: true
  },
  {
    id: 's004',
    title: 'Quantum Computing: From Theory to Practice',
    category: 'Technology',
    speakerId: 'sp001',
    date: '2026-06-16',
    time: '11:00 - 12:30',
    location: 'Main Hall A',
    capacity: 120,
    reserved: 110,
    isPopular: false
  },
  {
    id: 's005',
    title: 'Sustainability in Modern Urban Infrastructure Architecture',
    category: 'Design',
    speakerId: 'sp004',
    date: '2026-06-17',
    time: '14:00 - 15:30',
    location: 'Eco Hall D',
    capacity: 60,
    reserved: 58,
    isPopular: true // Bug target session for no-response button
  },
  {
    id: 's006',
    title: 'Digital Marketing Strategies for the Next Decade',
    category: 'Business',
    speakerId: 'sp005',
    date: '2026-06-17',
    time: '16:00 - 17:30',
    location: 'Main Hall A',
    capacity: 200,
    reserved: 150,
    isPopular: false
  }
];

const speakers = [
  {
    id: 'sp001',
    name: 'Dr. Sarah Mitchell',
    company: 'TechVision Lab',
    field: 'Artificial Intelligence',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    bio: 'Lead researcher at TechVision Lab with over 15 years of experience in deep learning and neural networks.'
  },
  {
    id: 'sp002',
    name: 'Marcus Chen',
    company: 'PixelPerfect',
    field: 'Product Design',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    bio: 'Award-winning designer focusing on human-centric interfaces and emotional design architecture.'
  },
  {
    id: 'sp003',
    name: 'Elena Rodriguez',
    company: 'Global Leaders Inc.',
    field: 'Organizational Leadership',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    bio: 'Executive coach helping Fortune 500 companies build resilient and innovative team cultures.'
  },
  {
    id: 'sp004',
    name: 'Jonathan Miller',
    company: 'EcoBuild',
    field: 'Sustainable Architecture',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    bio: 'Architect specializing in net-zero buildings and sustainable urban planning for future cities.'
  },
  {
    id: 'sp005',
    name: 'Amanda Thorne',
    company: 'MarketPulse',
    field: 'Digital Marketing',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop',
    bio: 'Marketing strategist known for data-driven campaigns and brand storytelling in the digital age.'
  }
];

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

app.get('/api/speakers', (req, res) => {
  res.json(speakers);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
