const express = require('express');
const path = require('path');

const app = express();
const port = 9112;

app.use(express.json());

// Mock Data & Global State
const mockMenu = [
    { id: 1, name: 'Orange Chicken', price: 15, category: 'Asian' },
    { id: 2, name: 'Cheese Pizza', price: 20, category: 'Western' },
    { id: 3, name: 'Spicy Tacos', price: 12, category: 'Mexican' },
    { id: 4, name: 'Sushi Platter', price: 25, category: 'Asian' },
];

let orderState = {
    cart: [],
    status: 'idle', // idle, pending_payment, paid, completed
    step: 1,        // 1: cart, 2: order, 3: payment, 4: complete
    isCancelled: false
};

// ================= API ENDPOINTS =================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site003', status: 'healthy' });
});

// Menu
app.get('/api/menu', (req, res) => {
    res.json({ ok: true, data: mockMenu });
});

// Cart handling
app.post('/api/cart', (req, res) => {
    const { item } = req.body;
    orderState.cart.push(item);
    res.json({ ok: true, cart: orderState.cart });
});
app.delete('/api/cart', (req, res) => {
    orderState.cart = [];
    orderState.status = 'idle';
    orderState.step = 1;
    orderState.isCancelled = false;
    res.json({ ok: true, cart: orderState.cart });
});
app.get('/api/order', (req, res) => {
    res.json({ ok: true, state: orderState });
});

// BUG 01: workflow-bypass
app.post('/api/order/complete', (req, res) => {
    // INTENTIONAL BACKEND BUG: site003-bug01
    // Type: workflow-bypass
    // Description: 결제 단계 없이 주문 완료 API 호출 시 바로 완료되도록 처리
    orderState.status = 'completed';
    orderState.step = 4;
    res.json({ ok: true, bugId: 'site003-bug01', status: orderState.status, step: orderState.step });
});

// BUG 02: improper-state-transition
app.post('/api/order/pay', async (req, res) => {
    // INTENTIONAL BACKEND BUG: site003-bug02
    // Type: improper-state-transition
    // Description: 장바구니가 비어 있어도 검증 없이 바로 결제를 진행하고 성공 처리함
    
    // Slight delay to allow feature-interaction-conflict (bug05) to be simulated
    await new Promise(r => setTimeout(r, 800));
    
    orderState.status = 'paid';
    orderState.step = 3;
    res.json({ ok: true, bugId: 'site003-bug02', message: 'Payment successful', status: orderState.status });
});

// BUG 03: undefined-state
app.post('/api/order/status', (req, res) => {
    const { newStatus } = req.body;
    // INTENTIONAL BACKEND BUG: site003-bug03
    // Type: undefined-state
    // Description: 존재하지 않는 임의의 주문 상태(ex: DELIVERING_PENDING_UNKNOWN)를 그대로 서버 상태로 저장함
    orderState.status = newStatus;
    res.json({ ok: true, bugId: 'site003-bug03', status: orderState.status });
});

// BUG 04: implicit-state-assumption
app.post('/api/order/step', (req, res) => {
    const { targetStep } = req.body;
    // INTENTIONAL BACKEND BUG: site003-bug04
    // Type: implicit-state-assumption
    // Description: 클라이언트가 보낸 step 값을 서버가 검증 없이 신뢰하여 상태를 변경함
    orderState.step = targetStep;
    res.json({ ok: true, bugId: 'site003-bug04', step: orderState.step });
});

// BUG 05 & 06: feature-interaction-conflict & business-logic-paradox
app.post('/api/order/cancel', (req, res) => {
    // INTENTIONAL BACKEND BUG: site003-bug05
    // Type: feature-interaction-conflict
    // Description: 결제와 취소가 동시에 발생할 경우 락(lock)이 없어 주문 상태가 비정상적으로 섞일 수 있음 (Race condition)
    
    // INTENTIONAL BACKEND BUG: site003-bug06
    // Type: business-logic-paradox
    // Description: 취소 요청 시 isCancelled 플래그만 변경하고 실제 status는 초기화하지 않아, 취소되었음에도 배송 활성 상태를 유지하는 논리적 모순 발생
    orderState.isCancelled = true;
    
    res.json({ 
        ok: true, 
        bugId: 'site003-bug06', // Will be treated as bug06 directly, but the conflict (bug05) occurs during concurrent requests
        status: orderState.status, 
        isCancelled: orderState.isCancelled 
    });
});

app.post('/api/order/conflict', async (req, res) => {
    // Helper endpoint to reliably trigger Bug 05 for PPO test
    const payPromise = fetch('http://localhost:' + port + '/api/order/pay', { method: 'POST' });
    const cancelPromise = fetch('http://localhost:' + port + '/api/order/cancel', { method: 'POST' });
    await Promise.all([cancelPromise, payPromise]);
    
    res.json({ 
        ok: true, 
        bugId: 'site003-bug05',
        message: 'Conflict generated: Cancelled but status is Paid',
        state: orderState
    });
});


// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
