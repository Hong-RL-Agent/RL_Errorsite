const express = require('express');
const path = require('path');
const app = express();
const PORT = 9267;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Services
app.get('/api/services', (req, res) => {
    const services = [
        {
            id: 'studio',
            name: '스튜디오/원룸 청소',
            basePrice: 50000,
            description: '10평 이하 원룸 및 오피스텔에 최적화된 청소 서비스입니다.',
            recommendedOptions: ['refrigerator', 'window']
        },
        {
            id: 'home',
            name: '일반 가정집 청소',
            basePrice: 120000,
            description: '방 2개 이상의 아파트, 빌라 등 주거 공간을 구석구석 정밀 청소합니다.',
            recommendedOptions: ['refrigerator', 'window', 'balcony']
        },
        {
            id: 'office',
            name: '사무실/상업공간 청소',
            basePrice: 200000,
            description: '쾌적한 업무 환경을 위한 오피스 전문 청소 서비스입니다.',
            recommendedOptions: ['window', 'carpet']
        },
        {
            id: 'movein',
            name: '입주/이사 청소',
            basePrice: 180000,
            description: '새로운 시작을 위한 완벽한 공간 케어 서비스입니다.',
            recommendedOptions: ['refrigerator', 'window', 'balcony', 'steam']
        }
    ];
    res.json(services);
});

// API: Time Slots
app.get('/api/time-slots', (req, res) => {
    const today = new Date();
    const slots = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        slots.push({
            date: dateString,
            times: [
                { time: '09:00', available: Math.random() > 0.3 },
                { time: '11:00', available: Math.random() > 0.3 },
                { time: '13:00', available: Math.random() > 0.3 },
                { time: '15:00', available: Math.random() > 0.3 },
                { time: '17:00', available: Math.random() > 0.3 }
            ]
        });
    }
    res.json(slots);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
