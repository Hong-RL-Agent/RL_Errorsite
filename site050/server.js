const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9159;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const cryptoData = [
    { symbol: "BTC", name: "Bitcoin", price: 65000, marketCap: 1200000000, change24h: "+1.2%" },
    { symbol: "ETH", name: "Ethereum", price: 3500, marketCap: 400000000, change24h: "-0.5%" },
    { symbol: "SOL", name: "Solana", price: 140, marketCap: 60000000, change24h: "+4.8%" },
    { symbol: "LUNA", name: "Luna Classic", price: 0.0001, marketCap: 500000, change24h: "-99.9%" }
];

const staleData = cryptoData.map(c => ({ ...c, price: c.price * 0.9 }));

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site050", status: "healthy" });
});

// API: Price List
app.get('/api/crypto/prices', (req, res) => {
    const { refresh } = req.query;
    
    // INTENTIONAL BACKEND BUG: site050-bug02
    // Type: stale-cache-response
    // Description: refresh=stale 요청 시 최신 데이터가 아닌 10분 전 데이터를 의도적으로 반환함.
    if (refresh === 'stale') {
        return res.json({ 
            ok: true, 
            data: staleData, 
            cachedAt: new Date(Date.now() - 600000).toISOString(),
            bugId: "site050-bug02" 
        });
    }

    res.json({ ok: true, data: cryptoData, cachedAt: new Date().toISOString() });
});

// API: Market Summary
app.get('/api/crypto/market-summary', (req, res) => {
    const actualSum = cryptoData.reduce((acc, curr) => acc + curr.marketCap, 0);
    
    // INTENTIONAL BACKEND BUG: site050-bug01
    // Type: incorrect-aggregation
    // Description: 전체 시가총액 계산 시 실제 데이터 합계가 아닌 잘못된 상수를 반환함.
    const buggedSum = 8500000000; 

    res.json({
        ok: true,
        totalMarketCap: buggedSum,
        actualDataSum: actualSum,
        bugId: "site050-bug01"
    });
});

// API: Detail
app.get('/api/crypto/detail/:symbol', (req, res) => {
    const coin = cryptoData.find(c => c.symbol === req.params.symbol);
    if (!coin) return res.status(404).json({ ok: false, message: "Coin not found" });

    // INTENTIONAL BACKEND BUG: site050-bug03
    // Type: missing-field-response
    // Description: 특정 심볼(LUNA) 요청 시 프론트엔드가 기대하는 change24h 필드를 누락시켜 응답함.
    if (coin.symbol === 'LUNA') {
        const { change24h, ...incompleteCoin } = coin;
        return res.json({ ok: true, data: incompleteCoin, bugId: "site050-bug03" });
    }

    res.json({ ok: true, data: coin });
});

app.listen(PORT, () => {
    console.log(`Site050 CryptoHub running on http://localhost:${PORT}`);
});
