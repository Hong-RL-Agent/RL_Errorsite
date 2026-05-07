const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9118;

app.use(cors());
app.use(express.json());

// Mock Database
let products = [
    { id: 1, name: 'Air Max Neon Blue', price: 240000, stock: 1, type: 'drop' },
    { id: 2, name: 'Jordan Retro High', price: 450000, stock: 10, type: 'resell' },
    { id: 3, name: 'Yeezy Boost 350', price: 310000, stock: 5, type: 'resell' }
];

let userInventory = [];
let bids = [];
let settlement = 0;

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site009', status: 'healthy' });
});

// 1. GET /api/products
app.get('/api/products', (req, res) => {
    res.json({ ok: true, data: products });
});

// 2. POST /api/order/buy
app.post('/api/order/buy', async (req, res) => {
    const { productId, simulate_race, conflict, discount } = req.body;
    const product = products.find(p => p.id === productId);

    if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });

    // INTENTIONAL BACKEND BUG: site009-bug01
    // Type: inventory-overcommit
    // Description: 마지막 1개 재고에 대해 동시 요청 시 race condition으로 재고 초과 주문 발생
    if (simulate_race === true) {
        // No stock check before processing
        product.stock--; 
        userInventory.push({ ...product, orderId: Date.now() });
        return res.json({ ok: true, bugId: "site009-bug01", message: 'Race condition simulation: Order approved despite stock logic', currentStock: product.stock });
    }

    // INTENTIONAL BACKEND BUG: site009-bug03
    // Type: feature-interaction-conflict
    // Description: 검수 중 상품과 즉시 구매 기능이 충돌하여 소유권이 사라지는 문제
    if (conflict === true) {
        // Ownership disappears from inventory but purchase returns success
        userInventory = userInventory.filter(item => item.id !== productId);
        return res.json({ ok: true, bugId: "site009-bug03", message: 'Conflict: Product purchased but vanished from inventory' });
    }

    // INTENTIONAL BACKEND BUG: site009-bug04
    // Type: business-logic-paradox
    // Description: 가격 제한 정책 + 할인 이벤트 충돌로 마이너스 정산 발생
    if (discount === true) {
        const finalPrice = product.price - 500000; // Force negative
        settlement += finalPrice;
        return res.status(500).json({ ok: false, bugId: "site009-bug04", message: 'Business Paradox: Negative settlement amount', price: finalPrice, settlement });
    }

    if (product.stock <= 0) return res.status(400).json({ ok: false, error: 'Out of stock' });

    product.stock--;
    userInventory.push({ ...product, orderId: Date.now() });
    res.json({ ok: true, balance: product.price });
});

// 3. POST /api/order/bid
app.post('/api/order/bid', (req, res) => {
    const { productId, bidPrice } = req.body;
    const product = products.find(p => p.id === productId);

    // INTENTIONAL BACKEND BUG: site009-bug02
    // Type: implicit-state-ambiguity
    // Description: 입찰 상태에서 상품이 품절되면 상태가 null 또는 정의되지 않은 값으로 붕괴
    let status = 'BIDDING';
    if (product && product.stock <= 0) {
        status = null; // Ambiguous state
    }

    bids.push({ productId, bidPrice, status });
    res.json({ ok: true, bugId: status === null ? "site009-bug02" : null, status });
});

// 4. GET /api/user/inventory
app.get('/api/user/inventory', (req, res) => {
    res.json({ ok: true, data: userInventory, bids, settlement });
});

app.post('/api/test/reset', (req, res) => {
    products = [
        { id: 1, name: 'Air Max Neon Blue', price: 240000, stock: 1, type: 'drop' },
        { id: 2, name: 'Jordan Retro High', price: 450000, stock: 10, type: 'resell' },
        { id: 3, name: 'Yeezy Boost 350', price: 310000, stock: 5, type: 'resell' }
    ];
    userInventory = [];
    bids = [];
    settlement = 0;
    res.json({ ok: true });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
