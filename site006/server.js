const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9115;

app.use(cors());
app.use(express.json());

// Mock Database
let userData = {
    points: 100.0,
    history: []
};

const products = [
    { id: 1, name: 'Eco Bottle', price: 15.5, pointsEarn: 1.55, type: 'physical' },
    { id: 2, name: 'Digital Planner', price: 9.9, pointsEarn: 0.99, type: 'digital' },
    { id: 3, name: 'Wireless Mouse', price: 25.0, pointsEarn: 2.5, type: 'physical' },
    { id: 4, name: 'Premium Wallpaper Pack', price: 4.99, pointsEarn: 0.5, type: 'digital' },
    { id: 9999, name: 'Secret Mystery Box', price: 50.0, pointsEarn: 5.0, type: 'physical' }
];

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site006', status: 'healthy' });
});

// 1. GET /api/product/list
app.get('/api/product/list', (req, res) => {
    res.json({ ok: true, data: products });
});

// 2. POST /api/product/buy
app.post('/api/product/buy', (req, res) => {
    const { productId, type } = req.body;
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ ok: false, error: 'Product not found' });
    }

    // INTENTIONAL BACKEND BUG: site006-bug03
    // Type: magic-number
    // Description: 특정 상품 ID(9999)에 대해 하드코딩된 보너스 포인트 지급
    if (productId === 9999) {
        userData.points += 1000.0;
        userData.history.push({ action: 'BUY_BONUS', productId: 9999, points: 1000.0, date: new Date() });
        return res.json({ ok: true, bugId: "site006-bug03", message: 'Special Bonus Points Granted!', points: userData.points });
    }

    // INTENTIONAL BACKEND BUG: site006-bug02
    // Type: polymorphic-state-confusion
    // Description: 상품 타입(physical/digital)을 혼동하여 잘못된 로직 수행 (디지털 상품인데 실물 배송 로직 태우기 등)
    if (type === 'digital' && product.type === 'physical') {
        // Confusion: processing physical as digital or vice versa
        userData.points += product.pointsEarn * 2; // Arbitrary wrong logic
        userData.history.push({ action: 'BUY_CONFUSED', productId, points: product.pointsEarn * 2, date: new Date() });
        return res.json({ ok: true, bugId: "site006-bug02", message: 'Confusion applied', points: userData.points });
    }

    userData.points += product.pointsEarn;
    userData.history.push({ action: 'BUY', productId, points: product.pointsEarn, date: new Date() });
    res.json({ ok: true, message: 'Purchase successful', points: userData.points });
});

// 3. POST /api/point/earn
app.post('/api/point/earn', (req, res) => {
    const { amount } = req.body;
    
    // INTENTIONAL BACKEND BUG: site006-bug01
    // Type: precision-loss
    // Description: 소수점 정밀도 처리 없이 포인트 누적 계산 수행 (JS Float precision issue)
    userData.points = userData.points + parseFloat(amount);
    
    // To make it visible as a bug for PPO, we intentionally mess up the display precision sometimes
    // or just let the inherent float math do its thing
    userData.history.push({ action: 'EARN', points: amount, date: new Date() });
    res.json({ ok: true, bugId: "site006-bug01", points: userData.points });
});

// 4. POST /api/point/use
app.post('/api/point/use', (req, res) => {
    let { amount } = req.body;

    // INTENTIONAL BACKEND BUG: site006-bug04
    // Type: implicit-default
    // Description: amount 값이 없으면 기본값으로 전체 포인트를 사용하도록 처리됨
    if (amount === undefined || amount === null) {
        const used = userData.points;
        userData.points = 0;
        userData.history.push({ action: 'USE_ALL_DEFAULT', points: used, date: new Date() });
        return res.json({ ok: true, bugId: "site006-bug04", message: 'All points used as default', points: userData.points });
    }

    if (userData.points < amount) {
        return res.status(400).json({ ok: false, error: 'Not enough points' });
    }

    userData.points -= amount;
    userData.history.push({ action: 'USE', points: amount, date: new Date() });
    res.json({ ok: true, points: userData.points });
});

// 5. GET /api/point/history
app.get('/api/point/history', (req, res) => {
    res.json({ ok: true, data: userData.history, currentPoints: userData.points });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
