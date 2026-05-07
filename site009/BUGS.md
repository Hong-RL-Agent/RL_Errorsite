# BUGS - site009

## site009-bug01
- **type**: inventory-overcommit
- **API endpoint**: POST /api/order/buy
- **HTTP method**: POST
- **발생 조건**: `simulate_race=true` 파라미터와 함께 호출 시 (재고 검증 로직 우회)
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/order/buy` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site009-bug01"]`
- **사용자가 경험하는 증상**: 마지막 1개 남은 재고에 대해 여러 번 주문이 성공하며, 재고(Stock)가 마이너스로 표시됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site009-bug01","message":"Race condition simulation...","currentStock":-1}`
- **코드상 의도된 원인**: 재고 차감 전 유효성 검사(Check) 부재
- **PPO 에이전트 기대 행동**: 재고 수량의 무결성 위반 및 초과 판매 현상 탐지

## site009-bug02
- **type**: implicit-state-ambiguity
- **API endpoint**: POST /api/order/bid
- **HTTP method**: POST
- **발생 조건**: 재고가 0인 상품에 대해 입찰 시도 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/order/bid` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site009-bug02"]`
- **사용자가 경험하는 증상**: 입찰 상태 배지가 `BIDDING`이 아닌 `NULL_STATE` 또는 빈 값으로 표시됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site009-bug02","status":null}`
- **코드상 의도된 원인**: 품절 시 예외 상태를 정의하지 않고 `null`을 할당하여 상태 모호성 발생
- **PPO 에이전트 기대 행동**: 비정상적인 상태값(Null/Undefined) 반환 탐지

## site009-bug03
- **type**: feature-interaction-conflict
- **API endpoint**: POST /api/order/buy
- **HTTP method**: POST
- **발생 조건**: 보관함(Vault)에 있는 상품에 대해 `conflict=true`와 함께 구매 시도 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/order/buy` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site009-bug03"]`
- **사용자가 경험하는 증상**: 구매는 성공했다고 뜨지만, 보관함(My Vault)에서 해당 상품이 즉시 사라져버림
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site009-bug03","message":"Conflict: Product purchased but vanished..."}`
- **코드상 의도된 원인**: 소유권 이전 로직과 구매 로직 간의 상호작용 충돌로 데이터 유실 발생
- **PPO 에이전트 기대 행동**: 트랜잭션 후 자산 소실(Data Loss) 현상 탐지

## site009-bug04
- **type**: business-logic-paradox
- **API endpoint**: POST /api/order/buy
- **HTTP method**: POST
- **발생 조건**: `discount=true` 파라미터와 함께 구매 요청 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/order/buy` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site009-bug04"]`
- **사용자가 경험하는 증상**: 정산 금액(Settlement)이 음수(-)로 변하며, 서버는 500 에러를 뱉으면서도 정산 데이터는 갱신함
- **서버 응답 상태 코드**: 500
- **서버 응답 예시**: `{"ok":false,"bugId":"site009-bug04","message":"Business Paradox: Negative settlement amount","price":-50000,"settlement":-50000}`
- **코드상 의도된 원인**: 가격 하한선 정책과 과도한 할인이 충돌하여 논리적 모순 발생
- **PPO 에이전트 기대 행동**: 음수 결제/정산 등 비즈니스 규칙 위반 상황 탐지
