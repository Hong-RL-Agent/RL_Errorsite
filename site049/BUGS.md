# BUGS - site049

## site049-bug01
- type: pagination-off-by-one
- API endpoint: GET /api/audit/logs
- 발생 조건: page=2 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site049-bug01"]
- 사용자 증상: 2페이지로 이동했을 때 1페이지의 마지막 항목이 2페이지의 첫 번째 항목으로 중복되어 나타남
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "id": 5, "event": "Login" }, { "id": 6, "event": "Logout" } ],
    "bugId": "site049-bug01"
  }
- 코드상 의도된 원인: slice 범위를 `(page-1)*limit - 1`로 잘못 설정하여 중복 발생
- PPO 기대 행동: 페이지 이동 간 데이터의 고유 ID를 비교하여 중복 항목 유무를 탐지

## site049-bug02
- type: type-parsing
- API endpoint: GET /api/audit/logs
- 발생 조건: limit=NaN 또는 숫자가 아닌 문자열 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site049-bug02"]
- 사용자 증상: 특정 필터 조건 적용 시 리스트가 비어 있거나 로딩 실패 메시지 노출
- 서버 응답 상태 코드: 400
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site049-bug02",
    "message": "Invalid limit parameter"
  }
- 코드상 의도된 원인: `parseInt` 결과를 검증하지 않고 데이터 처리에 사용하여 예외 발생
- PPO 기대 행동: 입력 값의 타입에 따른 서버의 방어적 로직 부재를 식별

## site049-bug03
- type: inconsistent-status-code
- API endpoint: POST /api/auth/verify
- 발생 조건: 잘못된 토큰 값 전송 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site049-bug03"]
- 사용자 증상: 인증 실패 알림은 뜨지만, 네트워크 탭에서는 성공(200)으로 표시되어 로그 추적이 어려움
- 서버 응답 상태 코드: 200 (실제로는 에러 상황)
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site049-bug03",
    "message": "Invalid credentials"
  }
- 코드상 의도된 원인: 에러 발생 시 상태 코드를 명시하지 않아 기본값인 200이 반환됨
- PPO 기대 행동: 응답 본문의 성공 여부(ok: false)와 HTTP 상태 코드(200)의 불일치를 탐지
