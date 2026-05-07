const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9117;

app.use(cors());
app.use(express.json());

// Mock Database
let appData = {
    subscription: {
        status: 'NONE', // NONE, PENDING, ACTIVE, EXPIRED, CANCELLED
        plan: 'NONE',
        updatedAt: new Date()
    },
    reservations: [],
    history: []
};

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site008', status: 'healthy' });
});

// Get State
app.get('/api/state', (req, res) => {
    res.json({ ok: true, data: appData });
});

// 1. POST /api/subscription/create
app.post('/api/subscription/create', (req, res) => {
    const { plan } = req.body;

    // INTENTIONAL BACKEND BUG: site008-bug02
    // Type: subscription-overlap
    // Description: 동일 사용자에게 중복 구독 주기가 허용되어 상태 충돌 발생
    // (보통은 기존 구독이 있으면 에러를 내야 하지만 여기서는 덮어쓰거나 중복 생성함)
    appData.subscription = {
        status: 'PENDING',
        plan: plan,
        updatedAt: new Date()
    };
    appData.history.push({ event: 'SUBSCRIPTION_CREATED', plan, status: 'PENDING', date: new Date() });

    res.json({ ok: true, bugId: "site008-bug02", data: appData.subscription });
});

// 2. POST /api/subscription/update
app.post('/api/subscription/update', (req, res) => {
    const { status, backdate } = req.body;

    // INTENTIONAL BACKEND BUG: site008-bug01
    // Type: retroactive-state-pollution
    // Description: 과거 날짜로 구독 상태 변경 시 현재 상태가 과거 값으로 오염됨
    if (backdate === true) {
        appData.subscription.status = status || 'POLLUTED_ERROR';
        appData.subscription.plan = 'CORRUPTED_HISTORY'; // 추가 오염
        appData.subscription.updatedAt = new Date('2000-01-01'); // 훨씬 더 과거로 설정
        appData.history.push({ 
            event: 'BUG_POLLUTION_TRIGGERED', 
            status: appData.subscription.status, 
            date: appData.subscription.updatedAt 
        });
        return res.json({ ok: true, bugId: "site008-bug01", message: 'Retroactive pollution applied to core state', data: appData.subscription });
    }

    appData.subscription.status = status;
    appData.subscription.updatedAt = new Date();
    res.json({ ok: true, data: appData.subscription });
});

// 3. POST /api/reservation/create
app.post('/api/reservation/create', (req, res) => {
    const reservation = {
        id: Date.now(),
        status: 'PENDING',
        date: new Date()
    };
    appData.reservations.push(reservation);
    res.json({ ok: true, data: reservation });
});

// 4. POST /api/reservation/activate
app.post('/api/reservation/activate', (req, res) => {
    const { id } = req.body;
    const resv = appData.reservations.find(r => r.id === id);

    if (!resv) return res.status(404).json({ ok: false, error: 'Not found' });

    // INTENTIONAL BACKEND BUG: site008-bug03
    // Type: workflow-bypass
    // Description: 결제 단계를 거치지 않고 예약 활성화 상태로 직접 전환 가능
    resv.status = 'ACTIVE';
    appData.history.push({ event: 'RESERVATION_ACTIVATED_BYPASS', id, status: 'ACTIVE', date: new Date() });

    res.json({ ok: true, bugId: "site008-bug03", data: resv });
});

// 5. POST /api/state/change
app.post('/api/state/change', (req, res) => {
    const { targetState } = req.body;

    // INTENTIONAL BACKEND BUG: site008-bug04
    // Type: improper-state-transition
    // Description: 상태 흐름 검증 없이 임의 상태 전이가 가능 (예: EXPIRED -> ACTIVE)
    appData.subscription.status = targetState;
    appData.history.push({ event: 'STATE_FORCED', status: targetState, date: new Date() });

    res.json({ ok: true, bugId: "site008-bug04", data: appData.subscription });
});

// 6. GET /api/reservation/status
app.get('/api/reservation/status', (req, res) => {
    const { lock } = req.query;

    // INTENTIONAL BACKEND BUG: site008-bug05
    // Type: state-machine-deadlock
    // Description: 특정 조건에서 상태가 "PENDING"에 고정되어 진행되지 않는 데드락 발생
    if (lock === 'true') {
        // Find first pending and keep it there
        const pending = appData.reservations.find(r => r.status === 'PENDING');
        if (pending) {
            return res.json({ ok: true, bugId: "site008-bug05", status: 'LOCKED_PENDING', data: pending });
        }
    }

    res.json({ ok: true, data: appData.reservations });
});

app.post('/api/test/reset', (req, res) => {
    appData = {
        subscription: { status: 'NONE', plan: 'NONE', updatedAt: new Date() },
        reservations: [],
        history: []
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
