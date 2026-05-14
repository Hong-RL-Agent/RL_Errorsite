const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9287;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const teachers = [
    { id: 1, name: '김지현', instrument: 'Piano', experience: '15년', rating: 4.9, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop' },
    { id: 2, name: '박준영', instrument: 'Violin', experience: '10년', rating: 4.8, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop' },
    { id: 3, name: '이지은', instrument: 'Guitar', experience: '8년', rating: 4.7, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
    { id: 4, name: '최성훈', instrument: 'Flute', experience: '12년', rating: 4.9, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' }
];

const lessons = [
    { id: 'l1', instrument: 'Piano', level: '초급', duration: '50분', price: 200000, teacherId: 1, days: ['월', '수', '금'] },
    { id: 'l2', instrument: 'Violin', level: '중급', duration: '60분', price: 250000, teacherId: 2, days: ['화', '목'] },
    { id: 'l3', instrument: 'Guitar', level: '초급', duration: '50분', price: 180000, teacherId: 3, days: ['토', '일'] },
    // INTENTIONAL BUG SETUP: teacherId as a string for 'Flute' lesson, while teacher ID is a number
    { id: 'l4', instrument: 'Flute', level: '입문', duration: '45분', price: 220000, teacherId: '4', days: ['수', '토'] },
    { id: 'l5', instrument: 'Piano', level: '전문가', duration: '90분', price: 400000, teacherId: 1, days: ['금'] }
];

// Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/lessons', (req, res) => {
    res.json(lessons);
});

app.get('/api/teachers', (req, res) => {
    res.json(teachers);
});

app.listen(PORT, () => {
    console.log(`Music Academy site running on http://localhost:${PORT}`);
});
