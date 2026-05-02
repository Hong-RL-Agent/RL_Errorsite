# BUGS

## 1. site009-bug01
- **Bug ID:** `site009-bug01`
- **CSV Error:** DB 쿠폰 검증 오류
- **Type:** `database-validation`
- **발생 위치:** `server.js` 의 `POST /api/coupons/apply` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (쿠폰 적용 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#apply-coupon-btn[data-bug-id="site009-bug01"]`
- **사용자가 경험하는 증상:** 
  - 쿠폰 입력창 밑에 힌트로 적혀 있는 `ECO2025` 쿠폰을 입력하고 [적용]을 누르면, 이미 2020년에 만료된 쿠폰임에도 불구하고 정상적으로 5,000원 할인이 적용됩니다.
- **코드상 의도된 원인:**
  - 서버 측에서 쿠폰 데이터를 조회한 후, `coupon.expiredAt` 과 현재 시점(`new Date()`)을 비교하여 기한이 지났다면 에러를 반환해야 하는 유효성 검사(Validation) 로직이 누락되어 있습니다.
- **PPO 에이전트 기대 행동:**
  - 입력값이나 데이터베이스의 상태가 비즈니스 로직의 유효 기한이나 제약 조건을 초과/위반했음에도 불구하고, 서버가 이를 걸러내지 못하고 정상 처리하는 데이터 무결성/검증 오류를 탐지해야 합니다.

## 2. site009-bug02
- **Bug ID:** `site009-bug02`
- **CSV Error:** 네트워크 오류 메시지 누락
- **Type:** `network-error-handling`
- **발생 위치:** `server.js` 의 `POST /api/orders` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (주문 결제 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#checkout-btn` 어트리뷰트 포함 `site009-bug02`
- **사용자가 경험하는 증상:**
  - 장바구니에 담긴 상품들의 원래 총합 금액(할인 전)이 5만 원 이상일 때 결제를 시도하면, 결제 버튼 아래에 "원인을 파악할 수 없습니다. 내용: undefined" 또는 "Network error" 같은 모호한 에러가 뜹니다.
- **코드상 의도된 원인:**
  - 백엔드에서 에러 발생 시 `res.status(500).json({ error: '사유...' })` 의 형태로 JSON 바디를 줘야 하지만, 고의로 `res.status(500).end()` 만 호출하여 클라이언트에게 이유를 알려주는 응답 바디를 전혀 내려주지 않게 코딩했습니다.
- **PPO 에이전트 기대 행동:**
  - HTTP 5xx 계열의 에러를 반환할 때, 응답 본문이 누락되거나 부적절하게 처리되어 프론트엔드가 사용자에게 적절한 예외 상황 사유를 피드백하지 못하게 만드는 불완전한 예외 처리(Error Handling) 구조를 식별해야 합니다.

## 3. site009-bug03
- **Bug ID:** `site009-bug03`
- **CSV Error:** 가격 조작 취약점
- **Type:** `security-parameter-tampering`
- **발생 위치:** `server.js` 의 `POST /api/orders` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (가격 변조 테스트 입력창), `public/js/app.js`
- **data-bug-id Selector:** `#checkout-btn` 어트리뷰트 포함 `site009-bug03`
- **사용자가 경험하는 증상:**
  - 장바구니에 비싼 샴푸를 여러 개 담아두더라도, 하단의 '결제 금액 변조 (Bug 03)' 입력창에 `100` 이라는 숫자를 쓰고 [결제하기]를 누르면, 백엔드에서 100원 결제로 통과시키며 내 주문 내역에 100원으로 기재됩니다.
- **코드상 의도된 원인:**
  - 서버에서 최종 결제 금액을 결정할 때 상품 단가 * 수량을 계산한 `realTotal` 값을 사용하지 않고, 클라이언트가 악의적으로 조작하여 넘긴 `price` 파라미터를 그대로 무비판적으로 신뢰(`totalPrice: req.body.price`)하여 저장합니다.
- **PPO 에이전트 기대 행동:**
  - 중요 비즈니스 데이터(가격, 수량 등)를 클라이언트의 입력 파라미터에만 의존할 때 발생하는 인자 변조(Parameter Tampering) 취약점을 페이로드 변조를 통해 검증해야 합니다.
