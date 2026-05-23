const express = require('express');
const app = express();

// [함정] 서버 기동 시 환경변수 유효성 검사
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY;

if (!SECRET_KEY) {
    console.error("❌ FATAL ERROR: CRYPTO_SECRET_KEY가 설정되지 않았습니다.");
    console.error("시스템을 보호하기 위해 서버를 종료합니다.");
    process.exit(1); // 서버 즉시 종료
}

app.get('/api/wallet', (req, res) => {
    res.json({ balance: "1.24 BTC", status: "Secure" });
});

app.listen(5001, () => console.log('Backend running on 5001'));