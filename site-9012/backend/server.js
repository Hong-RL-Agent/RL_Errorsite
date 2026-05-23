const express = require('express');
const app = express();

app.get('/api/market-data', (req, res) => {
    // 정상적인 시장 데이터 응답
    res.json({
        symbol: "BTC/USDT",
        price: "64,231.50",
        change: "+2.45%",
        volume: "1.2B"
    });
});

// [핵심 함정] Slowloris / 커넥션 독점 (CSV 7번)
app.get('/api/execute-trade', (req, res) => {
    console.log("⏳ [TRADE] 신규 거래 요청 수신. 엔진 검증 중... (커넥션 점유 시작)");
    
    // 응답을 즉시 보내지 않고 40초 동안 연결을 유지함
    // 이 동안 이 API를 호출한 수많은 브라우저 탭은 커넥션을 하나씩 잡아먹게 됨
    setTimeout(() => {
        if (!res.writableEnded) {
            console.log("✅ [TRADE] 검증 완료 및 체결 성공");
            res.json({ 
                status: "SUCCESS", 
                orderId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                timestamp: new Date().toISOString()
            });
        }
    }, 40000); 
});

app.listen(5001, () => console.log('Quantum Trade Backend running on 5001'));