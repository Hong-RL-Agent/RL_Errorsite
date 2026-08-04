const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9282;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const regions = [
    { id: 'r1', name: '역삼동', popular: true },
    { id: 'r2', name: '한남동', popular: true },
    { id: 'r3', name: '성수동', popular: true },
    { id: 'r4', name: '연남동', popular: false },
    { id: 'r5', name: '망원동', popular: false }
];

const items = [
    {
        id: 'i1',
        title: '에어팟 프로 2세대 미개봉 새제품 판매합니다',
        price: 280000,
        region: '역삼동',
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1588423770119-929ba7ad04bb?w=400&h=300&fit=crop',
        likes: 12,
        chats: 5,
        status: 'On Sale'
    },
    {
        id: 'i2',
        title: '원목 책상 팝니다 (상태 최상, 직접 가져가셔야 해요)',
        price: 50000,
        region: '한남동',
        category: 'Furniture',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
        likes: 8,
        chats: 2,
        status: 'On Sale'
    },
    {
        id: 'i3',
        title: '아이패드 에어 5세대 64GB 와이파이 모델 급매',
        price: 650000,
        region: '역삼동',
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
        likes: 25,
        chats: 10,
        status: 'On Sale'
    },
    {
        id: 'i4',
        title: '빈티지 조명 스탠드 감성 인테리어 소품으로 딱이에요',
        price: 35000,
        region: '성수동',
        category: 'Furniture',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
        likes: 15,
        chats: 4,
        status: 'On Sale'
    },
    {
        id: 'i5',
        title: '닌텐도 스위치 동물의 숲 에디션 + 타이틀 3종 포함 일괄 판매합니다',
        price: 350000,
        region: '망원동',
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=300&fit=crop',
        likes: 30,
        chats: 12,
        status: 'On Sale'
    },
    {
        id: 'i6',
        title: '매우매우매우매우매우매우긴상품명테스트용입니다이상품명은매우길어서카드영역을벗어나야합니다제발벗어나주세요오오오오오오오',
        price: 1000,
        region: '연남동',
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        likes: 0,
        chats: 0,
        status: 'On Sale'
    }
];

// Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/regions', (req, res) => {
    res.json(regions);
});

app.get('/api/items', (req, res) => {
    res.json(items);
});

app.listen(PORT, () => {
    console.log(`Market site running on http://localhost:${PORT}`);
});
