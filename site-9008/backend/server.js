const express = require('express');
const app = express();

// 메인 비즈니스 로직
app.get('/api/tracking', (req, res) => {
    res.json({ status: "In Transit", location: "Pacific Ocean", eta: "2026-05-12" });
});

// [함정] 개발 단계에서 쓰고 지우지 않은 디버깅 도구 (보안 취약점)
app.get('/api/debug/system-info', (req, res) => {
    res.json({
        server_uptime: process.uptime(),
        environment: "Production",
        internal_ip: "172.18.0.5",
        node_version: process.version,
        // 민감 정보 노출 예시
        database_config: { host: "db.internal.jaws.com", user: "jaws_root" } 
    });
});

app.listen(5001, () => console.log('Logistics Server running on 5001'));