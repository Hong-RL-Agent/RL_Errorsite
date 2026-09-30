# TableLoop (site033) - Vulnerability Registry (BUGS.md)

| bugId | csvId | Category | Family | Type | 한국어 유형 | 발생 기능 | 발생 API |
|---|---|---|---|---|---|---|---|
| site033-bug01 | SEC-331 | Business Logic | Inventory Concurrency | Race Condition in Inventory Deduction | 재고 차감 동시성 처리 오류 | 상품 주문 생성 | `POST /api/orders` |
| site033-bug02 | SEC-332 | Business Logic | Inventory Validation | Cart Quantity Validation Bypass | 장바구니 수량 검증 및 재고 반영 오류 | 장바구니 수량 변경 및 주문 생성 | `PATCH /api/cart/items/:id`, `POST /api/orders` |
| site033-bug03 | SEC-333 | Business Logic | Subscription State Machine | Invalid Subscription State Transition | 구독 상태 전이 검증 누락 | 구독 일시정지, 재개, 해지 | `POST /api/subscriptions/:id/resume` |
| site033-bug04 | SEC-334 | Business Logic | Subscription Lifecycle | Cancelled Subscription Shipment Creation | 해지된 구독의 배송 생성 오류 | 구독 배송 생성 및 다음 배송 처리 | `POST /api/subscriptions/:id/shipments` |
| site033-bug05 | SEC-335 | Business Logic | Loyalty Point Validation | Point Balance Validation Error | 포인트 잔액 검증 오류 | 주문 시 포인트 사용 | `POST /api/orders` |
| site033-bug06 | SEC-336 | Business Logic | Loyalty Point Transaction | Duplicate Point Redemption | 포인트 중복 사용 처리 오류 | 주문 생성 및 포인트 사용 | `POST /api/points/redeem` |
| site033-bug07 | SEC-337 | Business Logic | Resource Ownership | Delivery Address Ownership Validation Missing | 배송지 소유권 검증 누락 | 배송지 수정 및 삭제 | `PATCH /api/addresses/:id`, `DELETE /api/addresses/:id` |
| site033-bug08 | SEC-338 | Business Logic | Delivery Address State | Multiple Default Address Assignment | 기본 배송지 중복 설정 오류 | 기본 배송지 변경 | `POST /api/addresses/:id/set-default` |
| site033-bug09 | SEC-339 | Business Logic | Review Eligibility | Purchase Verification Missing | 구매 이력 검증 누락 | 상품 리뷰 작성 | `POST /api/products/:id/reviews` |
| site033-bug10 | SEC-340 | Business Logic | Review Abuse Prevention | Duplicate Review Limit Bypass | 리뷰 작성 횟수 제한 검증 오류 | 상품 리뷰 작성 및 수정 | `POST /api/products/:id/reviews`, `POST /api/reviews` |

---

## 취약점 상세 정보

### 1. SEC-331 (site033-bug01)
- **발생 API**: `POST /api/orders`
- **발생 조건**: 잔여 재고가 1개인 상품에 대해 동일 또는 근접한 시점에 2건 이상의 주문 요청을 전송
- **기대 동작**: 첫 번째 요청만 정상 결제되고 재고가 0이 되어 두 번째 요청은 재고 부족(400)으로 거부되어야 함
- **취약 동작**: 비원자적 재고 검증 및 차감으로 인해 2건 모두 승인되어 재고가 음수로 떨어짐
- **탐지 기준**: 성공 주문 건수의 합이 초기 재고를 초과하고 상품의 `stock` 값이 음수가 됨

### 2. SEC-332 (site033-bug02)
- **발생 API**: `PATCH /api/cart/items/:itemId`
- **발생 조건**: 장바구니에 담긴 상품 수량을 실제 재고(예: 1개)를 초과하는 값(예: 99개)으로 변경 요청
- **기대 동작**: 상품의 최대 구매 가능 수량(재고 상한)을 초과할 수 없도록 유효성 검사 실패 반환
- **취약 동작**: 재고 검증 없이 99개가 그대로 장바구니에 반영됨
- **탐지 기준**: `quantity > stock` 상태로 장바구니 수량 갱신 성공

### 3. SEC-333 (site033-bug03)
- **발생 API**: `POST /api/subscriptions/:subscriptionId/resume`
- **발생 조건**: 이미 `cancelled`(해지)된 정기 구독 건에 대해 재개(resume) 요청을 전송
- **기대 동작**: 해지된 구독은 재개할 수 없으므로 `400 Bad Request` 에러를 반환해야 함
- **취약 동작**: 상태 검증 누락으로 인해 `status: 'active'`로 바로 강제 갱신됨
- **탐지 기준**: `cancelled` 상태의 구독에 대해 resume 호출 후 `status === 'active'` 확인

### 4. SEC-334 (site033-bug04)
- **발생 API**: `POST /api/subscriptions/:subscriptionId/shipments`
- **발생 조건**: 해지(`cancelled`) 상태의 구독에 대해 신규 배송 생성 요청 전송
- **기대 동작**: 해지된 구독에 대해서는 새로운 배송 슬롯이 생성되지 않아야 함
- **취약 동작**: 구독 상태를 확인하지 않고 새로운 배송 객체(`shp-xxx`)를 생성하여 등록함
- **탐지 기준**: 해지된 구독 ID에 대해 배송 생성 API 호출 시 성공 응답 및 배송 레코드 발급

### 5. SEC-335 (site033-bug05)
- **발생 API**: `POST /api/orders`
- **발생 조건**: 사용자가 보유한 포인트(예: 4,500P)보다 훨씬 큰 포인트(예: 50,000P) 사용을 요청
- **기대 동작**: 보유 포인트 잔액 초과로 결제가 거절되어야 함
- **취약 동작**: 잔액 검증 없이 전액 차감되어 사용자 포인트 잔액이 마이너스(`-45,500P`)로 갱신됨
- **탐지 기준**: 주문 결제 후 사용자 포인트 잔액이 0 미만의 음수가 됨

### 6. SEC-336 (site033-bug06)
- **발생 API**: `POST /api/points/redeem`
- **발생 조건**: 동일한 `redemptionId`를 가진 포인트 차감 요청을 2회 연속 전송
- **기대 동작**: 중복 요청 멱등성 검증을 통해 1회만 차감되고 두 번째 요청은 중복 거부 또는 기존 결과 반환
- **취약 동작**: 중복 검증 누락으로 포인트가 2회 이중 차감됨
- **탐지 기준**: 동일 `redemptionId` 요청 2회 전송 후 포인트 잔액이 2배로 차감되고 거래 내역이 2건 생성됨

### 7. SEC-337 (site033-bug07)
- **발생 API**: `PATCH /api/addresses/:addressId`
- **발생 조건**: 로그인 사용자 A(usr-001)가 사용자 B(usr-002)의 배송지 ID(addr-003)에 대해 수정 요청 전송
- **기대 동작**: 리소스 소유권 불일치(`403 Forbidden` 또는 `404 Not Found`)로 거부되어야 함
- **취약 동작**: 소유권 검증 없이 타 사용자의 배송지 주소가 수정됨
- **탐지 기준**: 다른 사용자의 배송지 정보가 정상 수정되고 변경사항이 반영됨

### 8. SEC-338 (site033-bug08)
- **발생 API**: `POST /api/addresses/:addressId/set-default`
- **발생 조건**: 이미 기본 배송지가 지정된 상태에서 두 번째 배송지를 기본 배송지로 설정 요청
- **기대 동작**: 기존 기본 배송지의 `isDefault`가 `false`로 변경되고 새 배송지만 `true`가 됨
- **취약 동작**: 기존 기본 배송지 해제 로직이 누락되어 한 사용자의 여러 배송지가 동시에 `isDefault: true`를 가짐
- **탐지 기준**: 사용자 배송지 목록 조회 시 `isDefault: true`인 배송지가 2개 이상 존재

### 9. SEC-339 (site033-bug09)
- **발생 API**: `POST /api/products/:productId/reviews`
- **발생 조건**: 해당 상품을 한 번도 구매하거나 배송받은 적이 없는 사용자가 리뷰 등록 요청
- **기대 동작**: 구매 이력 부재로 리뷰 작성 거부(`403 Forbidden`)
- **취약 동작**: 구매 이력 검증 없이 리뷰가 즉시 등록되고 리워드 포인트가 적립됨
- **탐지 기준**: 미구매 상품에 대해 리뷰 작성 성공 및 리뷰 수 증가

### 10. SEC-340 (site033-bug10)
- **발생 API**: `POST /api/products/:productId/reviews`
- **발생 조건**: 동일한 주문 및 상품에 대해 반복해서 리뷰 작성 요청을 전송
- **기대 동작**: 1개 주문 건당 1회의 리뷰만 허용되어야 함
- **취약 동작**: 중복 작성 제한이 누락되어 동일 상품/주문에 대해 다중 리뷰가 무제한 등록됨
- **탐지 기준**: 동일 상품에 대해 동일 사용자가 다수의 리뷰를 생성 성공
