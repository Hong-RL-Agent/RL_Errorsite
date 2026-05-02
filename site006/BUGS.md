# BUGS

## 1. site006-bug01
- **Bug ID:** `site006-bug01`
- **CSV Error:** DB 재고 차감 오류
- **Type:** `database-transaction`
- **발생 위치:** `server.js` 의 `POST /api/orders` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (결제하기 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#submit-order-btn[data-bug-id="site006-bug01"]`
- **사용자가 경험하는 증상:** 
  - 특정 도시락의 남은 재고가 2개일 때 장바구니에서 수량을 10개로 올리고 결제하기를 누르면, "재고가 부족합니다"라는 경고 없이 결제가 성공 처리됩니다. 직후 화면의 남은 재고가 -8개로 표시됩니다.
- **코드상 의도된 원인:**
  - 결제 시 `menu.stock -= item.quantity;` 로직을 수행할 때 사전에 `if (menu.stock < item.quantity)` 를 검사하여 트랜잭션을 중단(Rollback)시키는 에러 핸들링 코드가 누락되었습니다.
- **PPO 에이전트 기대 행동:**
  - 상품 재고를 초과하는 수량을 장바구니에 담아 POST 요청을 보냈을 때 `409 Conflict` 나 `400 Bad Request` 가 발생하지 않고 정상(201 Created) 처리되는 비정상적인 트랜잭션 흐름을 잡아내야 합니다.

## 2. site006-bug02
- **Bug ID:** `site006-bug02`
- **CSV Error:** 네트워크 재시도 중복 요청
- **Type:** `network-retry-duplicate`
- **발생 위치:** `server.js` 의 `POST /api/orders` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (네트워크 재시도 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#retry-order-btn[data-bug-id="site006-bug02"]`
- **사용자가 경험하는 증상:**
  - 서버 응답 지연이나 브라우저 재시도를 흉내내기 위해, `[결제하기]`를 누르고 지연 시간(800ms) 안에 `[네트워크 재시도]` 버튼을 추가로 누르면 똑같은 내용의 주문번호만 다른 주문 내역이 2개 생성됩니다.
- **코드상 의도된 원인:**
  - 서버에서 `POST /api/orders`를 처리할 때 클라이언트가 보내는 요청에 대해 멱등성 검증(Idempotency Check, 예: `Idempotency-Key` 헤더 검사 등)을 수행하지 않고 요청이 들어오는 족족 새 주문 객체를 생성하여 배열에 푸시합니다.
- **PPO 에이전트 기대 행동:**
  - 짧은 시간 내에 동일한 내용의 상태 변경 요청(POST)을 여러 번 발송했을 때 이를 방어하지 못하고 동일한 리소스가 중복으로 생성되는 상태 관리 취약점을 식별해야 합니다.

## 3. site006-bug03
- **Bug ID:** `site006-bug03`
- **CSV Error:** 결제 금액 조작 취약점
- **Type:** `security-parameter-tampering`
- **발생 위치:** `server.js` 의 `POST /api/orders` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (결제 금액 변조 테스트 인풋), `public/js/app.js`
- **data-bug-id Selector:** `label.text-danger[data-bug-id="site006-bug03"]` 근처의 로직
- **사용자가 경험하는 증상:**
  - 주문 정보 섹션에 있는 조작용 인풋 창에 `10` 이라고 쓰고 결제를 진행하면, 장바구니에 담긴 도시락 총액이 50,000원이더라도 영수증(주문 내역)에는 10원이 결제되었다고 뜹니다.
- **코드상 의도된 원인:**
  - 결제 금액 확정 시, 서버 측에서 `item.quantity * menu.price`를 직접 안전하게 계산(`realPrice`)하지 않고 클라이언트가 JSON으로 전송한 `totalPrice` 파라미터를 그대로 신뢰(`finalPrice = totalPrice`)하여 DB에 저장합니다.
- **PPO 에이전트 기대 행동:**
  - HTTP 요청의 페이로드(예: `totalPrice=10`)를 변조하여 전송했을 때 서버가 이를 거부하지 않고 변조된 값으로 주요 비즈니스 로직(결제)을 처리하는 파라미터 변조(Parameter Tampering) 보안 취약점을 탐지해야 합니다.
