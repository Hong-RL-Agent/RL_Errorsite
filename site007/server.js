const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9116;

app.use(cors());
app.use(express.json());

// Mock Database
let userData = {
    balance: 50000,
    membership: 'BASIC', // BASIC, SILVER, GOLD
    orders: [],
    referrals: {}, // userId -> referredBy
    joinedCount: 1,
    benefitsUsed: 0
};

const products = [
    { id: 1, name: 'Premium Gold Watch', price: 120000 },
    { id: 2, name: 'Silk Scarf', price: 45000 },
    { id: 3, name: 'Leather Wallet', price: 85000 },
    { id: 4, name: 'Membership Package', price: 10000 }
];

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site007', status: 'healthy' });
});

// 1. GET /api/product/list
app.get('/api/product/list', (req, res) => {
    res.json({ ok: true, data: products });
});

// 2. POST /api/order/create
app.post('/api/order/create', (req, res) => {
    let { productId, price } = req.body;
    const product = products.find(p => p.id === productId);

    if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });

    // INTENTIONAL BACKEND BUG: site007-bug01
    // Type: implicit-type-coercion
    // Description: 문자열과 숫자 연산으로 잘못된 금액 계산 발생 (JS Coercion)
    // If price is "1000", total becomes "1000500" instead of 1500
    const shippingFee = 2500;
    const total = price + shippingFee; 

    userData.balance -= total;
    userData.orders.push({ id: Date.now(), productId, total, date: new Date() });
    userData.benefitsUsed++;

    // Ensure bugId is returned when coercion happens (e.g. "10002500" vs 3500)
    const expectedTotal = Number(price) + shippingFee;
    const isBugTriggered = String(total) !== String(expectedTotal);

    res.json({ ok: true, bugId: isBugTriggered ? "site007-bug01" : null, total, balance: userData.balance });
});

// 3. POST /api/order/refund
app.post('/api/order/refund', (req, res) => {
    const { orderId } = req.body;
    const order = userData.orders.find(o => o.id === orderId);

    if (!order) return res.status(404).json({ ok: false, error: 'Order not found' });

    // INTENTIONAL BACKEND BUG: site007-bug02
    // Type: asymmetric-refund
    // Description: 환불 시 원래 결제 로직과 다른 수수료 기준 사용 (과다 환불)
    const refundAmount = order.total * 1.1; // 110% refund!

    userData.balance += refundAmount;
    userData.orders = userData.orders.filter(o => o.id !== orderId);

    res.json({ ok: true, bugId: "site007-bug02", refundAmount, balance: userData.balance });
});

// 4. POST /api/referral/register
app.post('/api/referral/register', (req, res) => {
    const { userId, referredById } = req.body;

    // INTENTIONAL BACKEND BUG: site007-bug03
    // Type: referral-cycle
    // Description: 추천인 등록 시 순환 구조를 허용함 (A -> B -> A)
    userData.referrals[userId] = referredById;

    res.json({ ok: true, bugId: "site007-bug03", referrals: userData.referrals });
});

// 5. POST /api/user/rejoin
app.post('/api/user/rejoin', (req, res) => {
    // INTENTIONAL BACKEND BUG: site007-bug04
    // Type: infinite-reward
    // Description: 재가입 시 가입 보너스를 무한 반복 수령 가능
    userData.joinedCount++;
    const bonus = 10000;
    userData.balance += bonus;

    res.json({ ok: true, bugId: "site007-bug04", bonus, balance: userData.balance });
});

// 6. POST /api/user/upgrade
app.post('/api/user/upgrade', (req, res) => {
    const { targetMembership } = req.body;

    // INTENTIONAL BACKEND BUG: site007-bug05
    // Type: state-upgrade-limit
    // Description: 등급 승급 시 기존 혜택 사용 횟수가 초기화되지 않아야 하나, 
    // 여기서는 오히려 승급 후에도 이전 제한 체크를 무시하거나 중복 혜택이 가능하게 방치됨
    userData.membership = targetMembership;
    // Bug: benefitsUsed should stay or reset based on policy, but here we just let it be 
    // and allow further calls to skip validation in create order if we wanted more complexity.
    // For simplicity, we just mark the upgrade event.

    res.json({ ok: true, bugId: "site007-bug05", membership: userData.membership });
});

// Get State
app.get('/api/user/state', (req, res) => {
    res.json({ ok: true, data: userData });
});

app.post('/api/test/reset', (req, res) => {
    userData = { balance: 50000, membership: 'BASIC', orders: [], referrals: {}, joinedCount: 1, benefitsUsed: 0 };
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
