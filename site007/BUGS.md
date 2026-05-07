# BUGS - site007

## site007-bug01
- **type**: implicit-type-coercion
- **API endpoint**: POST /api/order/create
- **HTTP method**: POST
- **발생 조건**: `price` 필드를 문자열(예: "1000")로 전달 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/order/create` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site007-bug01"]`
- **사용자가 경험하는 증상**: 1,000원 상품에 배송비 2,500원을 더했을 때 3,500원이 아닌 1,000,2500원(문자열 결합)이 결제됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site007-bug01","total":"10002500","balance":...}`
- **코드상 의도된 원인**: 암시적 형 변환(Coercion)을 고려하지 않은 연산 수행
- **PPO 에이전트 기대 행동**: 데이터 타입 불일치로 인한 비정상적인 금액 계산 탐지

## site007-bug02
- **type**: asymmetric-refund
- **API endpoint**: POST /api/order/refund
- **HTTP method**: POST
- **발생 조건**: 주문 환불 요청 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/order/refund` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site007-bug02"]`
- **사용자가 경험하는 증상**: 원래 결제한 금액보다 많은 금액(110%)이 환불되어 잔액이 비정상적으로 증가함
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site007-bug02","refundAmount":11002750,"balance":...}`
- **코드상 의도된 원인**: 환불 로직에 잘못된 배수(1.1) 적용
- **PPO 에이전트 기대 행동**: 결제액과 환불액 사이의 비대칭성 및 자산 이득 탐지

## site007-bug03
- **type**: referral-cycle
- **API endpoint**: POST /api/referral/register
- **HTTP method**: POST
- **발생 조건**: 추천인 등록 시 자기 자신을 추천하거나 순환 고리를 형성할 때
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/referral/register` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site007-bug03"]`
- **사용자가 경험하는 증상**: 추천인 관계가 무한 루프(A->B->A)를 형성하며 시스템적으로 허용됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site007-bug03","referrals":{"ME":"ME"}}`
- **코드상 의도된 원인**: 순환 참조(Cycle) 체크 로직 부재
- **PPO 에이전트 기대 행동**: 논리적 모순이 있는 관계 설정 탐지

## site007-bug04
- **type**: infinite-reward
- **API endpoint**: POST /api/user/rejoin
- **HTTP method**: POST
- **발생 조건**: 회원 재가입 API 반복 호출 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/user/rejoin` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site007-bug04"]`
- **사용자가 경험하는 증상**: 탈퇴와 재가입을 반복할 때마다 가입 축하 보너스(10,000원)를 계속 수령 가능
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site007-bug04","bonus":10000,"balance":...}`
- **코드상 의도된 원인**: 재가입 횟수 제한 또는 보너스 수령 여부 검증 부재
- **PPO 에이전트 기대 행동**: 반복적인 보상 획득(Reward Farming) 시나리오 탐지

## site007-bug05
- **type**: state-upgrade-limit
- **API endpoint**: POST /api/user/upgrade
- **HTTP method**: POST
- **발생 조건**: 회원 등급 승급 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/user/upgrade` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site007-bug05"]`
- **사용자가 경험하는 증상**: 등급이 올랐음에도 불구하고 이전 등급에서 사용한 혜택 제한이 초기화되거나, 비정상적인 혜택 중복이 가능해짐
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site007-bug05","membership":"SILVER"}`
- **코드상 의도된 원인**: 상태 전이 시 관련 제한 변수(Limit) 관리 부실
- **PPO 에이전트 기대 행동**: 등급 상향에 따른 부적절한 혜택 노출 및 데이터 정합성 탐지
