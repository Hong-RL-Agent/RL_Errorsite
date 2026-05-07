# BUGS - site012

## site012-bug01
- type: phantom-balance-shadow-account
- API endpoint: GET /api/wallet/balance
- HTTP method: GET
- 발생 조건: shadow=true 쿼리 파라미터 포함 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site012-bug01"]
- 사용자 증상: 잔액이 실제 보유 금액보다 높게 표시됨 (그림자 계정 $1,200 합산)
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "balance": 6450.75,
    "currency": "USD",
    "bugId": "site012-bug01"
  }
- 코드상 의도된 원인: 특정 조건에서 백엔드에서 비공식 계정의 잔액을 메인 잔액에 더함
- PPO 기대 행동: 정상 잔액($5,250.75)과 오류 잔액($6,450.75)의 불일치 탐지

## site012-bug02
- type: missing-idempotency-key
- API endpoint: POST /api/transfer/send
- HTTP method: POST
- 발생 조건: 동일한 요청이 짧은 시간 내 반복될 때 (테스트 시 x-idempotency-test 헤더 사용)
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site012-bug02"]
- 사용자 증상: 한 번의 클릭 의도에도 불구하고 잔액이 두 번 이상 차감됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "transaction": { ... },
    "balance": 5150.75,
    "bugId": "site012-bug02"
  }
- 코드상 의도된 원인: 멱등성 검증 로직이 없어 중복 요청을 모두 수용함
- PPO 기대 행동: 동일 요청 시퀀스에서 중복 차감 패턴 탐지

## site012-bug03
- type: saga-compensation-failure
- API endpoint: POST /api/transfer/send
- HTTP method: POST
- 발생 조건: fail=true 바디 파라미터 포함 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site012-bug03"]
- 사용자 증상: 송금이 실패했다는 메시지가 뜨지만, 잔액은 실제로 차감되어 버림
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "message": "Transaction failed during processing",
    "bugId": "site012-bug03"
  }
- 코드상 의도된 원인: 트랜잭션 처리 중 오류 발생 시 차감된 잔액을 복구(Rollback)하지 않음
- PPO 기대 행동: HTTP 500 응답과 잔액 감소의 불일치(Inconsistency) 탐지

## site012-bug04
- type: side-effect-leak
- API endpoint: POST /api/transfer/send
- HTTP method: POST
- 발생 조건: log=true 바디 파라미터 포함 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site012-bug04"]
- 사용자 증상: 권한 거부(403)로 요청이 실패했는데 시스템 감사 로그에는 기록이 남음
- 서버 응답 상태 코드: 403
- 서버 응답 예시:
  {
    "ok": false,
    "message": "Authorization failed",
    "bugId": "site012-bug04"
  }
- 코드상 의도된 원인: 권한 검증 실패 후에도 로그 기록 함수가 실행되도록 배치됨
- PPO 기대 행동: 실패한 요청이 시스템 상태(로그)에 영구적인 영향을 주는지 탐지
