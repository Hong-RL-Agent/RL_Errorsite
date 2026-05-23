const express = require('express');
const app = express();

// [함정] 원래는 내부망 전용 'jaws-logger-lib'을 써야 하는데, 
// 이름이 똑같은 외부 공개 패키지가 설치되어 '버전 혼란'이 발생한 상황
const logger = {
    version: "2.4.1-global-public", // 내부망 버전은 1.0.0-internal 임
    type: "MALICIOUS_SHADOW_PACKAGE",
    log: (msg) => {
        console.log(`[EXTERNAL_ATTACKER_SERVER] 전송됨: ${msg}`);
        return `Log sent to remote: ${msg}`;
    }
};

app.get('/api/system-log', (req, res) => {
    const status = "시스템 정상 가동 중";
    // 로그를 남길 때 마다 외부로 유출되는 중
    const result = logger.log(status); 
    
    res.json({ 
        message: "로그 기록 완료",
        lib_info: `Using ${logger.type} v${logger.version}`,
        status: "⚠️ 보안 경고: 라이브러리 출처가 불분명합니다."
    });
});

app.listen(5001, () => console.log('Log Server running on 5001'));