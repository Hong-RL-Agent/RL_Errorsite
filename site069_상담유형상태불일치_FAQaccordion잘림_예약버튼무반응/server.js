const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9288;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const lawyers = [
    { id: 1, name: '정우성', area: 'Civil', exp: '15년', rating: 4.9, price: 100000, slots: ['10:00', '11:00', '14:00', '15:00'], image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop' },
    { id: 2, name: '강소라', area: 'Criminal', exp: '10년', rating: 4.8, price: 120000, slots: ['09:00', '13:00', '16:00'], image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' },
    { id: 3, name: '박해일', area: 'Contract', exp: '12년', rating: 4.7, price: 80000, slots: ['11:00', '14:00', '17:00'], image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
    { id: 4, name: '이보영', area: 'Family', exp: '8년', rating: 4.9, price: 90000, slots: ['10:00', '15:00', '16:00'], image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop' }
];

const consultationTypes = [
    { id: 't1', name: '방문 상담', desc: '사무실에 직접 방문하여 심층적인 대면 상담을 진행합니다.', price: 100000, duration: '60분' },
    { id: 't2', name: '전화 상담', desc: '언제 어디서나 간편하게 유선으로 법률 조언을 받으실 수 있습니다.', price: 50000, duration: '30분' },
    { id: 't3', name: '서면 검토', desc: '계약서나 법적 문서를 정밀하게 검토하고 분석 보고서를 제공합니다.', price: 150000, duration: '120분' }
];

// Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/lawyers', (req, res) => {
    res.json(lawyers);
});

app.get('/api/consultation-types', (req, res) => {
    res.json(consultationTypes);
});

app.listen(PORT, () => {
    console.log(`Legal site running on http://localhost:${PORT}`);
});
