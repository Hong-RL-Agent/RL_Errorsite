const express = require('express');
const path = require('path');
const app = express();
const PORT = 9308;

app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const kidsClasses = [
  {
    id: 'c001',
    name: 'Little Picasso Art Lab',
    ageGroup: '4~5 years',
    category: 'Art',
    duration: '60 min',
    capacity: 10,
    booked: 8,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop',
    teacherId: 't001'
  },
  {
    id: 'c002',
    name: 'Robo-Juniors Coding',
    ageGroup: '6~7 years',
    category: 'Science',
    duration: '90 min',
    capacity: 8,
    booked: 3,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=600&fit=crop',
    teacherId: 't002'
  },
  {
    id: 'c003',
    name: 'Junior Chef Academy',
    ageGroup: '6~7 years',
    category: 'Cooking',
    duration: '120 min',
    capacity: 12,
    booked: 11, // High popularity
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=600&fit=crop',
    teacherId: 't003'
  },
  {
    id: 'c004',
    name: 'Mini Mozart Music',
    ageGroup: '4~5 years',
    category: 'Music',
    duration: '45 min',
    capacity: 15,
    booked: 5,
    image: 'https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=600&h=600&fit=crop',
    teacherId: 't001'
  },
  {
    id: 'c005',
    name: 'Galaxy Science Explorers',
    ageGroup: '8~9 years',
    category: 'Science',
    duration: '90 min',
    capacity: 10,
    booked: 9,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=600&fit=crop',
    teacherId: 't002'
  }
];

const teachers = [
  {
    id: 't001',
    name: 'Sarah Jenkins',
    specialty: 'Arts & Music',
    intro: 'Passionate about nurturing creativity in young minds through sensory art and rhythm.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  },
  {
    id: 't002',
    name: 'Mark Peterson',
    specialty: 'STEM & Robotics',
    intro: 'Software engineer turned educator, helping kids build their first robots.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
  },
  {
    id: 't003',
    name: 'Chef Maria',
    specialty: 'Culinary Arts',
    intro: 'Professional pastry chef who loves teaching children the joy of healthy cooking.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  }
];

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/kids-classes', (req, res) => {
  res.json(kidsClasses);
});

app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
