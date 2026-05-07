# BUGS - site006

## site006-bug01
- **type**: precision-loss
- **API endpoint**: POST /api/point/earn
- **HTTP method**: POST
- **발생 조건**: 소수점 가격 상품을 구매하거나 포인트를 소수점 단위로 적립할 때
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/point/earn` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site006-bug01"]`
- **사용자가 경험하는 증상**: 포인트 잔액이 정확한 덧셈 결과와 미세하게 다르게 표시됨 (예: 0.1 + 0.2 = 0.30000000000000004)
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site006-bug01","points":100.30000000000004}`
- **코드상 의도된 원인**: Floating point 정밀도 고려 없이 단순 가산 수행
- **PPO 에이전트 기대 행동**: 계산된 기대값과 서버 응답값 사이의 불일치를 탐지

## site006-bug02
- **type**: polymorphic-state-confusion
- **API endpoint**: POST /api/product/buy
- **HTTP method**: POST
- **발생 조건**: 요청 시 `type` 필드를 실제 상품 타입과 다르게 전송 (예: 실물 상품인데 'digital'로 요청)
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/product/buy` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site006-bug02"]`
- **사용자가 경험하는 증상**: 상품 타입 불일치에도 불구하고 비정상적인 포인트 적립 로직(2배 적립 등)이 수행됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site006-bug02","message":"Confusion applied","points":103.1}`
- **코드상 의도된 원인**: 클라이언트가 보내는 타입 정보를 무분별하게 신뢰하여 로직 분기 수행
- **PPO 에이전트 기대 행동**: 비즈니스 로직에 부합하지 않는 비정상적인 상태 전이 및 보상 지급 탐지

## site006-bug03
- **type**: magic-number
- **API endpoint**: POST /api/product/buy
- **HTTP method**: POST
- **발생 조건**: 상품 ID 9999 구매 시도
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/product/buy` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site006-bug03"]`
- **사용자가 경험하는 증상**: 특정 상품 구매 시 비정상적으로 거대한 보너스 포인트(1000 pts) 지급
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site006-bug03","message":"Special Bonus Points Granted!","points":1100.0}`
- **코드상 의도된 원인**: 특정 ID값에 대한 예외 처리가 하드코딩되어 비정상적인 이득 제공
- **PPO 에이전트 기대 행동**: 숨겨진 하드코딩된 로직이나 이례적인 보상 지급 탐지

## site006-bug04
- **type**: implicit-default
- **API endpoint**: POST /api/point/use
- **HTTP method**: POST
- **발생 조건**: `amount` 필드 없이 요청을 보냄
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/point/use` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site006-bug04"]`
- **사용자가 경험하는 증상**: 일정량만 사용하려 했으나 amount 값이 누락될 경우 전체 포인트가 0으로 소멸됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site006-bug04","message":"All points used as default","points":0}`
- **코드상 의도된 원인**: 필수 파라미터 누락 시 안전한 에러 처리가 아닌, 위험한 기본값(전체 잔액) 사용
- **PPO 에이전트 기대 행동**: 입력값 누락 시 발생하는 위험한 기본 동작 및 자산 소실 탐지
