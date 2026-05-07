const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9158;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const auditLogs = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 10).toISOString(),
    event: ["LOGIN", "LOGOUT", "FILE_ACCESS", "API_KEY_GEN", "CREDENTIAL_CHANGE"][i % 5],
    user: `user_${100 + (i % 10)}`,
    status: i % 7 === 0 ? "FAILURE" : "SUCCESS"
}));

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site049", status: "healthy" });
});

// API: Audit Logs (with Pagination)
app.get('/api/audit/logs', (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    
    // INTENTIONAL BACKEND BUG: site049-bug02
    // Type: type-parsing
    // Description: limit 값을 정수로 파싱한 후 NaN 여부를 체크하지 않아 잘못된 연산이 수행됨.
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit)) {
        return res.status(400).json({ ok: false, bugId: "site049-bug02", message: "Invalid limit parameter" });
    }

    const p = parseInt(page);
    
    // INTENTIONAL BACKEND BUG: site049-bug01
    // Type: pagination-off-by-one
    // Description: 시작 인덱스 계산 시 -1을 추가하여 이전 페이지의 마지막 항목이 현재 페이지 처음에 포함되도록 함.
    const start = (p - 1) * parsedLimit - (p > 1 ? 1 : 0);
    const end = start + parsedLimit;
    const data = auditLogs.slice(start, end);

    res.json({
        ok: true,
        data,
        pagination: { total: auditLogs.length, page: p, limit: parsedLimit },
        bugId: p > 1 ? "site049-bug01" : null
    });
});

// API: Verify Token
app.post('/api/auth/verify', (req, res) => {
    const { token } = req.body;
    
    if (token === 'error-token') {
        // INTENTIONAL BACKEND BUG: site049-bug03
        // Type: inconsistent-status-code
        // Description: 실패 응답임에도 불구하고 상태 코드를 200으로 반환함.
        return res.json({ ok: false, bugId: "site049-bug03", message: "Invalid credentials" });
    }
    
    res.json({ ok: true, message: "Token verified" });
});

app.listen(PORT, () => {
    console.log(`Site049 AuthAudit running on http://localhost:${PORT}`);
});
