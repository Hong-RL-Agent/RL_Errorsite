const express = require('express');
const app = express();
app.use(express.json());

// 가상 DB 상태
let balance = 5000000; // 500만원
let activeTransactions = []; // 유기된 트랜잭션 목록
let isAccountLocked = false; // DB Row Lock 시뮬레이션

app.get('/api/account-info', (req, res) => {
    res.json({
        balance,
        isAccountLocked,
        pending_transactions: activeTransactions.length
    });
});

// [핵심 함정] 트랜잭션 유기 (CSV 13번)
app.post('/api/transfer', (req, res) => {
    const { amount } = req.body;

    if (isAccountLocked) {
        return res.status(423).json({ error: "Account is currently locked by another process." });
    }

    console.log(`[TX_START] 송금 트랜잭션 시작: ${amount}원`);
    
    // 1. DB 트랜잭션 및 Row Lock 발생 시뮬레이션
    isAccountLocked = true; 
    const txId = Date.now();
    activeTransactions.push({ txId, amount, status: "PENDING_IN_DB" });

    // 2. [오류 발생!] 비즈니스 로직 수행 중 예외 발생 상황 시뮬레이션
    // 원래는 여기서 commit()이나 rollback()을 호출해야 하지만,
    // 아무것도 하지 않고 함수를 종료하여 트랜잭션을 '유기'합니다.
    
    setTimeout(() => {
        // 사용자에게는 알 수 없는 오류가 났다고만 전달 (내부 트랜잭션은 여전히 살아있음)
        res.json({ 
            success: false, 
            message: "Internal Server Error during validation. Transaction status unknown." 
        });
        console.log(`⚠️ [TX_ABANDONED] 트랜잭션 ${txId}가 종료(Commit/Rollback)되지 않고 유기되었습니다.`);
    }, 1000);
});

// 시스템 복구(강제 언락) - 에이전트가 해결책으로 찾아야 할 버튼용
app.post('/api/recovery/unlock', (req, res) => {
    isAccountLocked = false;
    activeTransactions = [];
    res.json({ message: "Manual Rollback Successful. Account Unlocked." });
});

app.listen(5001, () => console.log('Bank Backend running on 5001'));