const express = require('express');
const path = require('path');
const app = express();
const PORT = 9268;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data
const posts = [
    {
        id: 1,
        title: '포르투갈의 아침, 골목 끝에서 만난 기록',
        summary: '낯선 도시에서의 아침 산책이 주는 위로와 그곳에서 기록한 짧은 문장들을 공유합니다.',
        category: 'Travel',
        tags: ['여행', '기록', '에세이'],
        date: '2026.04.15',
        readTime: '5 min',
        thumbnail: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=800'
    },
    {
        id: 2,
        title: '내가 좋아하는 것들로 채운 작업실',
        summary: '복잡한 세상 속에서 나만의 속도를 유지하게 해주는 작은 공간에 대한 이야기입니다.',
        category: 'Daily',
        tags: ['일상', '공간', '기록'],
        date: '2026.04.10',
        readTime: '3 min',
        thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800'
    },
    {
        id: 3,
        title: '아날로그와 디지털 사이의 균형 잡기',
        summary: '생산성을 높이는 도구들 속에서도 종이와 펜을 놓지 못하는 이유를 분석해봅니다.',
        category: 'Tech',
        tags: ['IT', '생산성', '도구'],
        date: '2026.04.05',
        readTime: '7 min',
        thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800'
    },
    {
        id: 4,
        title: '교토의 찻집에서 배운 비움의 미학',
        summary: '천천히 차를 마시는 행위가 어떻게 우리의 일상을 정돈하는지에 대하여.',
        category: 'Travel',
        tags: ['여행', '차', '명상'],
        date: '2026.03.28',
        readTime: '6 min',
        thumbnail: 'https://images.unsplash.com/photo-1493932484895-752d1471eab5?q=80&w=800'
    },
    {
        id: 5,
        title: '매일 아침 시를 읽는 습관',
        summary: '가장 바쁜 시간에 가장 짧은 문장을 읽는 것이 가져다준 뜻밖의 변화들.',
        category: 'Daily',
        tags: ['일상', '독서', '습관'],
        date: '2026.03.20',
        readTime: '4 min',
        thumbnail: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=800'
    },
    {
        id: 6,
        title: '오래된 카메라로 담은 계절의 색',
        summary: '필름 카메라의 셔터 소리를 따라가며 발견한 봄의 색감들.',
        category: 'Daily',
        tags: ['일상', '사진', '취미'],
        date: '2026.03.15',
        readTime: '5 min',
        thumbnail: 'https://images.unsplash.com/photo-1502982722880-0e8ce902dea8?q=80&w=800'
    }
];

const tags = [
    { name: '여행', count: 2 },
    { name: '일상', count: 3 },
    { name: '기록', count: 2 },
    { name: 'IT', count: 1 },
    { name: '독서', count: 1 },
    { name: '사진', count: 1 }
];

// API: Posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// API: Tags
app.get('/api/tags', (req, res) => {
    res.json(tags);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
