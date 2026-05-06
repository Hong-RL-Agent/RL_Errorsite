const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9284;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const laundryItems = [
    { id: 'l1', name: '와이셔츠', category: '생활세탁', price: 2500, days: 2, recommended: true },
    { id: 'l2', name: '정장 상의', category: '드라이', price: 6000, days: 3, recommended: true },
    { id: 'l3', name: '정장 하의', category: '드라이', price: 4500, days: 3, recommended: false },
    { id: 'l4', name: '이불(대형)', category: '침구류', price: 15000, days: 4, recommended: true },
    { id: 'l5', name: '패딩/다운점퍼', category: '아우터', price: 12000, days: 5, recommended: false },
    { id: 'l6', name: '운동화', category: '신발', price: 7000, days: 4, recommended: true }
];

const pickupSlots = [
    { date: '2024-05-08', times: ['07:00', '08:00', '09:00', '19:00', '20:00'], available: true },
    { date: '2024-05-09', times: ['07:00', '08:00', '19:00', '20:00'], available: true },
    { date: '2024-05-10', times: ['07:00', '08:00', '09:00'], available: true }
];

// Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/laundry-items', (req, res) => {
    res.json(laundryItems);
});

app.get('/api/pickup-slots', (req, res) => {
    res.json(pickupSlots);
});

app.listen(PORT, () => {
    console.log(`Laundry site running on http://localhost:${PORT}`);
});
