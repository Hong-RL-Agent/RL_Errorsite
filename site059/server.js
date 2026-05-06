const express = require('express');
const path = require('path');
const app = express();
const PORT = 9278;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data: Checklist
let checklist = [
    { id: 1, name: '여권 및 비자', category: '필수 서류', done: false, required: true },
    { id: 2, name: '항공권/호텔 바우처', category: '필수 서류', done: true, required: true },
    { id: 3, name: '스마트폰 충전기', category: '전자기기', done: false, required: true },
    { id: 4, name: '보조배터리', category: '전자기기', done: false, required: true },
    { id: 5, name: '반팔 티셔츠 3벌', category: '의류', done: true, required: false },
    { id: 6, name: '운동화', category: '의류', done: false, required: false },
    { id: 7, name: '세면도구 세트', category: '생활용품', done: false, required: true },
    { id: 8, name: '상비약 (해열제, 소화제)', category: '생활용품', done: false, required: true }
];

// Mock Data: Templates
const templates = [
    {
        type: 'summer-beach',
        name: '여름 바다 여행',
        categories: ['필수 서류', '의류', '전자기기', '물놀이 용품'],
        items: ['수영복', '선크림', '샌들', '방수팩']
    },
    {
        type: 'winter-ski',
        name: '겨울 스키 여행',
        categories: ['필수 서류', '방한 의류', '장비', '생활용품'],
        items: ['목도리/장갑', '핫팩', '보습크림', '스키복']
    },
    {
        type: 'business-trip',
        name: '해외 출장',
        categories: ['필수 서류', '비즈니스 웨어', '전자기기', '생활용품'],
        items: ['명함', '노트북', '정장/셔츠', '멀티탭']
    }
];

// API: Checklist
app.get('/api/checklist', (req, res) => {
    res.json(checklist);
});

// API: Templates
app.get('/api/templates', (req, res) => {
    res.json(templates);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
