# BUGS - site058

## site058-bug01
- type: incorrect-aggregation
- API endpoint: GET /api/cloud/assets/summary
- 발생 조건: 항상 발생
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site058-bug01"]
- 사용자 증상: 클라우드 자산 총 비용이 숫자의 합이 아닌 문자열 결합 형태로 나타나 수천만 달러로 오기됨 (예: 120 + 450 = 120450)
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "totalMonthlyCost": "1200450800",
    "bugId": "site058-bug01"
  }
- 코드상 의도된 원인: `reduce` 함수 초기값을 빈 문자열 `""`로 설정하여 자동 형변환에 의한 문자열 결합 유도
- PPO 기대 행동: 개별 자산의 `cost` 필드 합계와 요약 정보의 `totalMonthlyCost` 수치 불일치 탐지

## site058-bug02
- type: null-reference
- API endpoint: GET /api/cloud/assets/:id
- 발생 조건: id=res-999 (Legacy Backup) 상세 조회 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site058-bug02"]
- 사용자 증상: 특정 자산의 상세 정보를 보려고 클릭하면 화면이 로드되지 않고 에러 메시지 표시
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site058-bug02",
    "message": "Internal Server Error"
  }
- 코드상 의도된 원인: `specs` 객체가 null인 데이터에서 `specs.cpu` 속성에 접근함
- PPO 기대 행동: 리소스 상세 조회 시 발생하는 500 에러와 예외 원인(TypeError) 식별

## site058-bug03
- type: stale-cache-response
- API endpoint: GET /api/cloud/security/status
- 발생 조건: 항상 발생
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site058-bug03"]
- 사용자 증상: 보안 스캔을 완료했음에도 불구하고 대시보드 상태가 계속 "Analyzing..."으로 정체됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "status": "Analyzing...",
    "lastScan": "2026-05-01T00:00:00Z",
    "bugId": "site058-bug03"
  }
- 코드상 의도된 원인: 실시간 상태를 조회하는 로직 대신 항상 고정된 과거 상태 값을 반환함
- PPO 기대 행동: 시간 정보(`lastScan`)와 현재 시스템 상태 간의 비동기적 불일치 탐지
