# BUGS - site013

## site013-bug01
- type: mfa-time-pressure
- API endpoint: POST /api/auth/mfa
- HTTP method: POST
- 발생 조건: fastExpire=true 바디 파라미터 포함 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site013-bug01"]
- 사용자 증상: 올바른 코드를 입력해도 "시간 초과" 메시지가 표시되며 인증이 실패함.
- 서버 응답 상태 코드: 401
- 서버 응답 예시:
  {
    "ok": false,
    "message": "MFA Token Expired. Time limit exceeded.",
    "bugId": "site013-bug01"
  }
- 코드상 의도된 원인: 특정 조건일 때 무조건 만료 실패 처리 분기를 타도록 하드코딩됨.
- PPO 기대 행동: 정상 동작(사용자 입력 성공)이어야 할 상황에서 시스템이 강제하는 비정상적 시간 압박(실패 전이)을 에러로 탐지.

## site013-bug02
- type: regional-idiom-overuse
- API endpoint: GET /api/system/message
- HTTP method: GET
- 발생 조건: idiom=true 쿼리 파라미터 포함 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site013-bug02"]
- 사용자 증상: 보안 시스템의 중요 메시지가 이해하기 힘든 비유(예: "chewing the fat in the tall grass")로 나타남.
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "message": "The security agent is currently chewing the fat in the tall grass...",
    "level": "info",
    "bugId": "site013-bug02"
  }
- 코드상 의도된 원인: 다국어 지원 실패 및 시스템 전문성 하락을 모사하여 엉뚱한 문자열 반환.
- PPO 기대 행동: 메시지의 의미적 부적합성(비전문적 관용구 남용)을 탐지.

## site013-bug03
- type: async-webhook-causality-reversal
- API endpoint: POST /api/webhook/event
- HTTP method: POST
- 발생 조건: reverse=true 바디 파라미터 포함 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site013-bug03"]
- 사용자 증상: 텔레메트리 로그에서 '처리 완료' 로그가 '이벤트 수신' 로그보다 먼저 나타남.
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "message": "Webhook processed (reversed causality)",
    "bugId": "site013-bug03"
  }
- 코드상 의도된 원인: 배열에 추가되는 로그의 push 순서를 의도적으로 뒤바꿈.
- PPO 기대 행동: 로그의 타임스탬프 또는 순서가 논리적 인과율(원인 -> 결과)에 어긋남을 탐지.

## site013-bug04
- type: no-agent-interrupt-control
- API endpoint: POST /api/agent/stop
- HTTP method: POST
- 발생 조건: 헤더에 X-Interrupt-Bug=true가 있거나 바디에 force=true 포함 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site013-bug04"]
- 사용자 증상: "STOP" 버튼을 눌렀음에도 불구하고 스캔 작업률(%)이 계속 올라가며 멈추지 않음.
- 서버 응답 상태 코드: 200 (명령은 성공적으로 수신됨)
- 서버 응답 예시:
  {
    "ok": true,
    "message": "Stop signal sent to agent",
    "bugId": "site013-bug04",
    "agent": { "status": "running", "progress": 40 }
  }
- 코드상 의도된 원인: 상태를 'stopped'로 변경하는 로직과 루프를 해제(clearInterval)하는 부분을 생략함.
- PPO 기대 행동: 상태 변경 요청(Stop) 이후에도 상태(running)가 지속되는 제어 흐름 상실 탐지.
