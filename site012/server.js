const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9121;

app.use(cors());
app.use(express.json());

// Mock Data
let wallet = {
    balance: 5250.75,
    currency: "USD",
    shadowAccount: {
        balance: 1200.00
    }
};

let transactions = [
    { id: "tx_001", type: "deposit", amount: 1000.00, status: "completed", timestamp: "2024-04-30T10:00:00Z", recipient: "Self" },
    { id: "tx_002", type: "withdrawal", amount: 200.00, status: "completed", timestamp: "2024-04-30T14:30:00Z", recipient: "ATM" }
];

let logs = [
    { id: 1, event: "Wallet initialized", timestamp: new Date().toISOString() }
];

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        "ok": true,
        "site": "site012",
        "status": "healthy"
    });
});

// 1. GET /api/wallet/balance
app.get('/api/wallet/balance', (req, res) => {
    const { shadow } = req.query;
    let currentBalance = wallet.balance;
    let bugId = null;

    // INTENTIONAL BACKEND BUG: site012-bug01
    // Type: phantom-balance-shadow-account
    // Description: 특정 조건에서 실제 계정 외에 그림자 계정이 함께 조회되어 잔액이 중복 합산됨.
    if (shadow === 'true') {
        currentBalance += wallet.shadowAccount.balance;
        bugId = "site012-bug01";
    }

    res.json({
        ok: true,
        balance: currentBalance,
        currency: wallet.currency,
        bugId: bugId
    });
});

// 2. POST /api/transfer/send
app.post('/api/transfer/send', (req, res) => {
    const { amount, recipient, fail, log } = req.body;
    let bugId = null;

    // Helper to add log
    const addLog = (event) => {
        logs.push({ id: logs.length + 1, event, timestamp: new Date().toISOString() });
    };

    // INTENTIONAL BACKEND BUG: site012-bug02
    // Type: missing-idempotency-key
    // Description: 송금 API에서 idempotency key 검증이 없어 동일 요청이 중복 처리됨.
    // (학습용 단순화: 요청 시마다 무조건 처리하며 bugId 반환)
    // 실제로는 클라이언트가 동일 키를 보내야 하지만, 여기서는 버튼 클릭 시 트리거되는 로직으로 시뮬레이션
    if (req.headers['x-idempotency-test'] === 'trigger') {
        bugId = "site012-bug02";
        // 중복 처리 시뮬레이션: 잔액을 한 번 더 차감
        wallet.balance -= amount;
        addLog(`Duplicate Transfer: Sent ${amount} to ${recipient}`);
    }

    // INTENTIONAL BACKEND BUG: site012-bug03
    // Type: saga-compensation-failure
    // Description: 송금 처리 중 오류 발생 시 일부 단계만 롤백되지 않아 잔액만 차감되고 상태는 실패로 남음.
    if (fail === true) {
        wallet.balance -= amount; // Amount deducted
        // Status remains failure, no rollback of balance
        addLog(`Failed Transfer (No Rollback): Attempted ${amount} to ${recipient}`);
        return res.status(500).json({
            ok: false,
            message: "Transaction failed during processing",
            bugId: "site012-bug03"
        });
    }

    // INTENTIONAL BACKEND BUG: site012-bug04
    // Type: side-effect-leak
    // Description: 실패한 요청임에도 거래 로그 및 상태 변경이 그대로 기록되는 부작용 누출 발생.
    if (log === true) {
        addLog(`Unauthorized/Failed Intent Recorded: ${amount} to ${recipient}`);
        // Even though it returns error, log is already added
        return res.status(403).json({
            ok: false,
            message: "Authorization failed",
            bugId: "site012-bug04"
        });
    }

    // Normal Processing
    if (wallet.balance < amount) {
        return res.status(400).json({ ok: false, message: "Insufficient funds" });
    }

    wallet.balance -= amount;
    const newTx = {
        id: `tx_${Date.now()}`,
        type: "transfer",
        amount: amount,
        status: "completed",
        timestamp: new Date().toISOString(),
        recipient: recipient
    };
    transactions.unshift(newTx);
    addLog(`Transfer completed: Sent ${amount} to ${recipient}`);

    res.json({
        ok: true,
        transaction: newTx,
        balance: wallet.balance,
        bugId: bugId
    });
});

// 3. GET /api/transactions
app.get('/api/transactions', (req, res) => {
    res.json({ ok: true, data: transactions });
});

// 4. GET /api/logs
app.get('/api/logs', (req, res) => {
    res.json({ ok: true, data: logs });
});

// Reset for testing
app.post('/api/test/reset', (req, res) => {
    wallet.balance = 5250.75;
    transactions = [
        { id: "tx_001", type: "deposit", amount: 1000.00, status: "completed", timestamp: "2024-04-30T10:00:00Z", recipient: "Self" },
        { id: "tx_002", type: "withdrawal", amount: 200.00, status: "completed", timestamp: "2024-04-30T14:30:00Z", recipient: "ATM" }
    ];
    logs = [{ id: 1, event: "Wallet initialized", timestamp: new Date().toISOString() }];
    res.json({ ok: true });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
// If dist doesn't exist, serve public (for development or simple setups)
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
