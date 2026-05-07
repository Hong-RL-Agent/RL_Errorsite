# BUGS - site010

## site010-bug01
- type: null-reference
- API endpoint: GET /api/wallet/balance
- HTTP method: GET
- 발생 조건: detail=full 쿼리 파라미터 포함 요청 시
- 관련 파일: server.js
- 관련 코드 위치: `/api/wallet/balance` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: [data-bug-id="site010-bug01"]
- 사용자가 경험하는 증상: 상세 잔액 정보를 불러오려 할 때 서버 에러(500)가 발생하며 화면에 오류 메시지가 표시됨
- 서버 응답 상태 코드: 500
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site010-bug01",
    "message": "Internal Server Error: Cannot read property 'description' of undefined"
  }
- 코드상 의도된 원인: 존재하지 않는 `wallet.stats` 객체의 내부 필드에 접근하여 TypeError 유발
- PPO 에이전트 기대 행동: 특정 파라미터 조건에서 발생하는 서버 런타임 에러를 탐지하고 예외 처리 로직의 부재를 식별

## site010-bug02
- type: type-parsing
- API endpoint: POST /api/payment/pay
- HTTP method: POST
- 발생 조건: amount 필드에 숫자 형식이 아닌 객체나 잘못된 타입의 데이터를 전송할 때
- 관련 파일: server.js
- 관련 코드 위치: `/api/payment/pay` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: [data-bug-id="site010-bug02"]
- 사용자가 경험하는 증상: 결제 처리 시 유효성 검사 실패(422) 메시지가 표시됨
- 서버 응답 상태 코드: 422
- 서버 응답 예시:
  {
    "ok": false,
    "bugId": "site010-bug02",
    "message": "Invalid amount format"
  }
- 코드상 의도된 원인: 입력값에 대한 타입 검증을 엄격하게 수행하지 않고 잘못된 데이터 타입이 들어올 경우 파싱 오류 발생
- PPO 에이전트 기대 행동: 입력 데이터 타입에 따른 API의 거절 응답을 탐지하고 데이터 유효성 검증 규칙을 학습

## site010-bug03
- type: api-timeout
- API endpoint: GET /api/payment/history
- HTTP method: GET
- 발생 조건: speed=slow 쿼리 파라미터 포함 요청 시
- 관련 파일: server.js
- 관련 코드 위치: `/api/payment/history` 라우트 내부
- 관련 프론트엔드 data-bug-id selector: [data-bug-id="site010-bug03"]
- 사용자가 경험하는 증상: 거래 내역을 불러오는 데 7초 이상 걸리며, 프론트엔드에서 타임아웃 오류가 표시됨
- 서버 응답 상태 코드: 200 (지연 후 응답)
- 서버 응답 예시:
  {
    "ok": true,
    "bugId": "site010-bug03",
    "data": [...]
  }
- 코드상 의도된 원인: 의도적인 `setTimeout` 지연으로 인한 서비스 가용성 저하 재현
- PPO 에이전트 기대 행동: API 응답 시간의 비정상적인 지연을 감지하고 성능 저하 또는 타임아웃 가능성 탐지
