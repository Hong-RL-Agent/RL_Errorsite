const express = require('express');
const app = express();

app.get('/api/storage-usage', (req, res) => {
    // 실제 사용량 데이터
    const actualUsedGB = 25.4; 
    const totalLimitGB = 100.0;

    // [함정] 할당량 계산 로직 오류 (CSV 6번)
    // GB를 MB로 변환해서 합산하는 과정에서 1024가 아닌 10240을 곱하는 실수 발생
    const calculatedUsedMB = (actualUsedGB * 10240); // 10배 뻥튀기 버그
    const limitMB = totalLimitGB * 1024;

    const isExceeded = calculatedUsedMB > limitMB;

    res.json({
        total_gb: totalLimitGB,
        used_gb: actualUsedGB,
        calculated_mb: calculatedUsedMB,
        limit_mb: limitMB,
        status: isExceeded ? "QUOTA_EXCEEDED" : "NORMAL",
        message: isExceeded ? "⚠️ 할당량을 초과했습니다. 업그레이드가 필요합니다." : "사용 가능"
    });
});

app.listen(5001, () => console.log('Cloud Backend running on 5001'));