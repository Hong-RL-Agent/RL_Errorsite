const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9281;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const instructors = [
    { id: 'i1', name: 'Elena Grace', specialty: 'Vinyasa Flow', experience: '10 years', image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&h=200&fit=crop' },
    { id: 'i2', name: 'Marcus Chen', specialty: 'Hatha Yoga', experience: '8 years', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop' },
    { id: 'i3', name: 'Sarah Miller', specialty: 'Yin & Meditation', experience: '12 years', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' }
];

const classes = [
    { id: 'c1', name: 'Morning Vinyasa', difficulty: 'Intermediate', instructor: 'Elena Grace', time: '07:00 - 08:30', capacity: 20, booked: 17 },
    { id: 'c2', name: 'Beginner Hatha', difficulty: 'Beginner', instructor: 'Marcus Chen', time: '09:00 - 10:15', capacity: 15, booked: 5 },
    { id: 'c3', name: 'Power Yoga', difficulty: 'Advanced', instructor: 'Elena Grace', time: '18:00 - 19:30', capacity: 18, booked: 12 },
    { id: 'c4', name: 'Restorative Yin', difficulty: 'Beginner', instructor: 'Sarah Miller', time: '20:00 - 21:30', capacity: 25, booked: 10 },
    { id: 'c5', name: 'Meditation Basics', difficulty: 'Beginner', instructor: 'Sarah Miller', time: '06:00 - 06:45', capacity: 30, booked: 8 },
    { id: 'c6', name: 'Flow & Glow', difficulty: 'Intermediate', instructor: 'Elena Grace', time: '11:00 - 12:30', capacity: 15, booked: 14 }
];

// Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/instructors', (req, res) => {
    res.json(instructors);
});

app.get('/api/classes', (req, res) => {
    res.json(classes);
});

app.listen(PORT, () => {
    console.log(`Yoga site running on http://localhost:${PORT}`);
});
