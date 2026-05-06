const express = require('express');
const path = require('path');
const app = express();
const PORT = 9272;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data: Notices
const notices = [
    {
        id: 1,
        title: '[공지] 5월 단지 내 소독 및 방역 작업 안내',
        category: 'Notice',
        date: '2026-05-01',
        important: true,
        content: '여름철 해충 방지를 위해 단지 내 전체 소독을 실시합니다. 세대 내 방문 소독을 원하시는 경우 관리사무소로 연락 바랍니다.'
    },
    {
        id: 2,
        title: '[시설] 커뮤니티 센터 수영장 임시 휴장 안내',
        category: 'Facility',
        date: '2026-05-03',
        important: false,
        content: '수영장 여과기 교체 작업으로 인해 5월 10일부터 12일까지 임시 휴장합니다. 이용에 불편을 드려 죄송합니다.'
    },
    {
        id: 3,
        title: '[안전] 주차장 내 서행 및 안전 운전 캠페인',
        category: 'Notice',
        date: '2026-05-04',
        important: false,
        content: '최근 지하 주차장 내 사고 위험이 보고되었습니다. 입주민 여러분의 안전을 위해 서행을 부탁드립니다.'
    },
    {
        id: 4,
        title: '[행사] 입주민 화합의 날 행사 개최 안내',
        category: 'Event',
        date: '2026-05-05',
        important: true,
        content: '5월 20일 토요일, 중앙 광장에서 입주민 화합의 날 행사가 열립니다. 다양한 경품과 먹거리가 준비되어 있으니 많은 참여 바랍니다.'
    }
];

// Mock Data: Maintenance Fees
const maintenanceFees = [
    { month: '2026-04', electricity: 45200, water: 12500, public: 185000, total: 242700 },
    { month: '2026-03', electricity: 52100, water: 11800, public: 192000, total: 255900 },
    { month: '2026-02', electricity: 61000, water: 13200, public: 192000, total: 266200 }
];

// API: Notices
app.get('/api/notices', (req, res) => {
    res.json(notices);
});

// API: Maintenance Fees
app.get('/api/maintenance-fees', (req, res) => {
    res.json(maintenanceFees);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
