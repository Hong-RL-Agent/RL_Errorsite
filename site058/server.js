const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9167;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const assets = [
    { id: "res-001", name: "Production DB", type: "RDS", cost: 1200, region: "us-east-1", specs: { cpu: 8, mem: 32 } },
    { id: "res-002", name: "Web Server Cluster", type: "EC2", cost: 450, region: "ap-northeast-2", specs: { cpu: 4, mem: 16 } },
    { id: "res-003", name: "Static Assets", type: "S3", cost: 80, region: "global", specs: { storage: "10TB" } },
    { id: "res-999", name: "Legacy Backup", type: "ColdStorage", cost: 200, region: "us-west-2", specs: null }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site058", status: "healthy" });
});

// API: Assets Summary
app.get('/api/cloud/assets/summary', (req, res) => {
    // INTENTIONAL BACKEND BUG: site058-bug01
    // Type: incorrect-aggregation
    // Description: 자산 비용 합계 시 초기값을 문자열 ""로 두어 숫자가 아닌 문자열 결합이 발생함.
    const totalCost = assets.reduce((acc, curr) => acc + curr.cost, "");
    
    res.json({
        ok: true,
        totalMonthlyCost: totalCost,
        assetCount: assets.length,
        bugId: "site058-bug01"
    });
});

// API: Asset List
app.get('/api/cloud/assets', (req, res) => {
    res.json({ ok: true, data: assets });
});

// API: Asset Detail
app.get('/api/cloud/assets/:id', (req, res) => {
    const asset = assets.find(a => a.id === req.params.id);
    if (!asset) return res.status(404).json({ ok: false, message: "Asset not found" });

    try {
        if (asset.id === 'res-999') {
            // INTENTIONAL BACKEND BUG: site058-bug02
            // Type: null-reference
            // Description: specs가 null인 레거시 자산의 cpu 속성에 접근하여 TypeError 유발.
            const cpuCount = asset.specs.cpu;
            return res.json({ ok: true, data: { ...asset, cpu: cpuCount } });
        }
        res.json({ ok: true, data: asset });
    } catch (err) {
        res.status(500).json({ ok: false, bugId: "site058-bug02", message: "Internal Server Error" });
    }
});

// API: Security Status
app.get('/api/cloud/security/status', (req, res) => {
    // INTENTIONAL BACKEND BUG: site058-bug03
    // Type: stale-cache-response
    // Description: 항상 "Analyzing..." 상태와 2일 전 타임스탬프를 반환함.
    res.json({
        ok: true,
        status: "Analyzing...",
        lastScan: "2026-05-01T00:00:00Z",
        bugId: "site058-bug03"
    });
});

app.listen(PORT, () => {
    console.log(`Site058 CloudOps running on http://localhost:${PORT}`);
});
