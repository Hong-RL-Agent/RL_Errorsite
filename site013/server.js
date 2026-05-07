const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9122;

app.use(cors());
app.use(express.json());

// System State
let authState = { loggedIn: false, mfaVerified: false, user: null };
let systemLogs = [
    { id: 1, type: "info", message: "System initialized and monitoring started.", time: new Date().toISOString() }
];
let agentTask = {
    id: "task-001",
    status: "idle", // idle, running, stopping, stopped, completed
    progress: 0,
    target: "Network Scan"
};

let agentInterval = null;

// Helper
const addLog = (type, message) => {
    systemLogs.unshift({ id: Date.now(), type, message, time: new Date().toISOString() });
    if(systemLogs.length > 50) systemLogs.pop();
};

// 1. GET /api/health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site013", status: "healthy" });
});

// 2. POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        authState.loggedIn = true;
        authState.mfaVerified = false;
        authState.user = username;
        addLog("auth", `User ${username} initiated login. Pending MFA.`);
        res.json({ ok: true, message: "MFA required", mfaRequired: true });
    } else {
        addLog("warning", `Failed login attempt for user ${username}.`);
        res.status(401).json({ ok: false, message: "Invalid credentials" });
    }
});

// 3. POST /api/auth/mfa
app.post('/api/auth/mfa', (req, res) => {
    const { code, fastExpire } = req.body;
    
    // INTENTIONAL BACKEND BUG: site013-bug01
    // Type: mfa-time-pressure
    // Description: MFA 인증 시간이 비정상적으로 짧게 설정되어 정상적인 입력에도 무조건 만료 실패 처리됨.
    if (fastExpire === true) {
        addLog("warning", "MFA Token expired due to strict time constraints.");
        return res.status(401).json({
            ok: false,
            message: "MFA Token Expired. Time limit exceeded.",
            bugId: "site013-bug01"
        });
    }

    if (code === '123456') {
        authState.mfaVerified = true;
        addLog("auth", `User ${authState.user} completed MFA successfully.`);
        res.json({ ok: true, message: "Authentication successful" });
    } else {
        res.status(401).json({ ok: false, message: "Invalid MFA code" });
    }
});

// 4. GET /api/system/message
app.get('/api/system/message', (req, res) => {
    const { idiom } = req.query;

    // INTENTIONAL BACKEND BUG: site013-bug02
    // Type: regional-idiom-overuse
    // Description: 시스템 메시지에 이해하기 어려운 지역적 비유/관용구가 포함되어 전달력이 떨어짐.
    if (idiom === 'true') {
        return res.json({
            ok: true,
            message: "The security agent is currently chewing the fat in the tall grass. Don't throw the baby out with the bathwater during the scan.",
            level: "info",
            bugId: "site013-bug02"
        });
    }

    res.json({
        ok: true,
        message: "The security agent is operating normally. Network scan in progress.",
        level: "info"
    });
});

// 5. POST /api/webhook/event
app.post('/api/webhook/event', (req, res) => {
    const { payload, reverse } = req.body;

    // INTENTIONAL BACKEND BUG: site013-bug03
    // Type: async-webhook-causality-reversal
    // Description: 비동기 웹훅 처리 시 순서가 뒤바뀌어 결과 로그가 원인 로그보다 먼저 반영됨.
    if (reverse === true) {
        // Result processed first
        addLog("system", "Webhook processing complete: User privileges updated.");
        // Cause processed after (simulated immediately for synchronous response, but conceptually reversed in the log stream)
        addLog("system", `Received Webhook Event: ${payload}`);
        
        return res.json({
            ok: true,
            message: "Webhook processed (reversed causality)",
            bugId: "site013-bug03"
        });
    }

    // Normal behavior
    addLog("system", `Received Webhook Event: ${payload}`);
    addLog("system", "Webhook processing complete: User privileges updated.");
    res.json({ ok: true, message: "Webhook processed normally" });
});

// 6. POST /api/agent/start
app.post('/api/agent/start', (req, res) => {
    if (agentTask.status === 'running') {
        return res.status(400).json({ ok: false, message: "Agent is already running" });
    }
    
    agentTask.status = 'running';
    agentTask.progress = 0;
    addLog("agent", `Agent Task started: ${agentTask.target}`);

    if (agentInterval) clearInterval(agentInterval);
    agentInterval = setInterval(() => {
        if (agentTask.status === 'running') {
            agentTask.progress += 10;
            if (agentTask.progress >= 100) {
                agentTask.status = 'completed';
                addLog("agent", `Agent Task completed: ${agentTask.target}`);
                clearInterval(agentInterval);
            }
        }
    }, 2000);

    res.json({ ok: true, agent: agentTask });
});

// 7. POST /api/agent/stop
app.post('/api/agent/stop', (req, res) => {
    const { force } = req.body; // Using force flag to trigger bug for demo purposes if needed, or always fail
    const isBugTriggered = req.headers['x-interrupt-bug'] === 'true' || force === true;

    // INTENTIONAL BACKEND BUG: site013-bug04
    // Type: no-agent-interrupt-control
    // Description: 사용자가 중단 요청을 해도 무시하고 작업이 계속 진행되어 제어권을 상실함.
    if (isBugTriggered) {
        addLog("warning", "Stop signal sent but agent control loop is unresponsive.");
        // We do NOT change agentTask.status to 'stopped'. It remains 'running'.
        return res.json({
            ok: true, // Returns 200 OK indicating request received, but action fails
            message: "Stop signal sent to agent",
            bugId: "site013-bug04",
            agent: agentTask
        });
    }

    // Normal behavior
    if (agentTask.status === 'running') {
        agentTask.status = 'stopped';
        if (agentInterval) clearInterval(agentInterval);
        addLog("agent", `Agent Task interrupted and stopped by user.`);
    }
    res.json({ ok: true, message: "Agent stopped successfully", agent: agentTask });
});

// 8. GET /api/agent/status
app.get('/api/agent/status', (req, res) => {
    res.json({ ok: true, agent: agentTask });
});

// 9. GET /api/logs
app.get('/api/logs', (req, res) => {
    res.json({ ok: true, logs: systemLogs });
});

// 10. GET /api/auth/status
app.get('/api/auth/status', (req, res) => {
    res.json({ ok: true, auth: authState });
});

// Reset
app.post('/api/test/reset', (req, res) => {
    authState = { loggedIn: false, mfaVerified: false, user: null };
    systemLogs = [{ id: 1, type: "info", message: "System reset to default state.", time: new Date().toISOString() }];
    if (agentInterval) clearInterval(agentInterval);
    agentTask = { id: "task-001", status: "idle", progress: 0, target: "Network Scan" };
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
