const express = require('express');
const path = require('path');
const app = express();
const PORT = 9270;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data
const desserts = [
    {
        id: 1,
        name: '시그니처 딸기 생크림 케이크',
        category: 'Cake',
        price: 38000,
        image: 'assets/hero.jpg',
        allergies: '우유, 밀, 계란',
        pickupAvailable: true,
        recommended: true
    },
    {
        id: 2,
        name: '벨기에 초콜릿 무스 케이크',
        category: 'Cake',
        price: 42000,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800',
        allergies: '우유, 대두, 계란',
        pickupAvailable: true,
        recommended: false
    },
    {
        id: 3,
        name: '레몬 딜 버터 쿠키 세트',
        category: 'Cookie',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800',
        allergies: '우유, 밀',
        pickupAvailable: true,
        recommended: true
    },
    {
        id: 4,
        name: '얼그레이 마카롱 (6구)',
        category: 'Macaron',
        price: 18000,
        image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=800',
        allergies: '우유, 계란, 아몬드',
        pickupAvailable: true,
        recommended: false
    },
    {
        id: 5,
        name: '제주 말차 파운드 케이크',
        category: 'Cake',
        price: 28000,
        image: 'https://images.unsplash.com/photo-1536599424071-0b215a388ba7?q=80&w=800',
        allergies: '우유, 밀, 계란',
        pickupAvailable: true,
        recommended: true
    },
    {
        id: 6,
        name: '바닐라 빈 까눌레 (4구)',
        category: 'Cookie',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1590130983173-094191370f5e?q=80&w=800',
        allergies: '우유, 밀, 계란',
        pickupAvailable: true,
        recommended: false
    }
];

const pickupSlots = [
    { date: '2026-05-06', times: ['10:00', '12:00', '14:00', '16:00', '18:00'], available: true },
    { date: '2026-05-07', times: ['10:00', '12:00', '14:00', '16:00', '18:00'], available: true },
    { date: '2026-05-08', times: ['10:00', '12:00', '14:00', '16:00', '18:00'], available: false }
];

// API: Desserts
app.get('/api/desserts', (req, res) => {
    res.json(desserts);
});

// API: Pickup Slots
app.get('/api/pickup-slots', (req, res) => {
    res.json(pickupSlots);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
