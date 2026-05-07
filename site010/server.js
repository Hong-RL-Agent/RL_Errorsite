const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9119;

app.use(cors());
app.use(express.json());

// Mock Database
let wallet = {
    balance: 1000000,
    history: [
        { id: 'tx_001', type: 'CHARGE', amount: 1000000, description: 'Initial Deposit', status: 'COMPLETED', date: new Date() }
    ],
    profile: {
        name: 'John Doe',
        tier: 'Gold',
        lastLogin: new Date()
    }
};

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        "ok": true,
        "site": "site010",
        "status": "healthy"
    });
});

// 1. GET /api/wallet/balance
app.get('/api/wallet/balance', (req, res) => {
    const { detail } = req.query;

    if (detail === 'full') {
        // INTENTIONAL BACKEND BUG: site010-bug01
        // Type: null-reference
        // Description: 특정 조건(detail=full)에서 존재하지 않는 필드(wallet.stats.lastActivity)를 참조하여 500 응답 발생.
        try {
            const stats = wallet.stats.lastActivity; 
            return res.json({ ok: true, balance: wallet.balance, stats });
        } catch (err) {
            return res.status(500).json({ ok: false, bugId: "site010-bug01", message: "Internal Server Error: Cannot read property 'lastActivity' of undefined" });
        }
    }

    res.json({ ok: true, balance: wallet.balance });
});

// 2. POST /api/payment/pay
app.post('/api/payment/pay', (req, res) => {
    let { amount, description } = req.body;

    // INTENTIONAL BACKEND BUG: site010-bug02
    // Type: type-parsing
    // Description: amount 값을 정수로 엄격하게 검증하지 않고 문자열 결합이 발생할 수 있는 상태로 처리하여 NaN 또는 잘못된 잔액 계산 발생.
    const numericAmount = parseInt(amount); 
    
    if (isNaN(numericAmount)) {
        return res.status(422).json({ ok: false, bugId: "site010-bug02", message: "Invalid amount format" });
    }

    wallet.balance -= numericAmount;
    const tx = { id: `tx_${Date.now()}`, type: 'PAYMENT', amount: numericAmount, description, status: 'COMPLETED', date: new Date() };
    wallet.history.push(tx);
    
    res.json({ ok: true, balance: wallet.balance, transaction: tx });
});

// 3. GET /api/payment/history
app.get('/api/payment/history', async (req, res) => {
    const { speed } = req.query;

    // INTENTIONAL BACKEND BUG: site010-bug03
    // Type: api-timeout
    // Description: 특정 조건(speed=slow)에서 응답을 7초 지연시켜 클라이언트 타임아웃 상황을 재현함.
    if (speed === 'slow') {
        await new Promise(resolve => setTimeout(resolve, 7000));
        return res.json({ ok: true, bugId: "site010-bug03", data: wallet.history });
    }

    res.json({ ok: true, data: wallet.history });
});

app.post('/api/test/reset', (req, res) => {
    wallet = {
        balance: 1000000,
        history: [{ id: 'tx_001', type: 'CHARGE', amount: 1000000, description: 'Initial Deposit', status: 'COMPLETED', date: new Date() }],
        profile: { name: 'John Doe', tier: 'Gold', lastLogin: new Date() }
    };
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
