# C-05 Bug Catalog & Training Specification

- **Site ID**: `C-05`
- **Site Name**: `Morrow Market (쇼핑몰 Checkout 시스템)`
- **Strategy**: `SEQUENCE_REPLAY`
- **Frontend**: React + Vite (`http://localhost:5177`)
- **Backend**: Express + SQLite (`http://localhost:5004`)
- **Reset API**: `POST http://localhost:5004/api/test/reset`

---

## 1. C-05-011 — Coupon Stack Bug

### Bug Information
- **bug_id**: `C-05-011`
- **error_name**: `Coupon Stack Bug (쿠폰 중복 누적 할인 오류)`
- **strategy**: `SEQUENCE_REPLAY`

### Trigger Sequence
1. 상품 선택 및 장바구니 추가
2. Checkout(결제서) 진입
3. 쿠폰 A (`SAVE10` 10,000원 할인) 선택 후 [쿠폰 적용]
4. 쿠폰 B (`SAVE5` 5,000원 할인) 선택 후 [쿠폰 적용]

### Normal Behavior
- 새로운 쿠폰을 적용하면 이전 쿠폰 할인이 해제되고 마지막으로 적용한 쿠폰(5,000원)만 적용되어야 함.

### Actual Behavior (Intended Bug)
- 쿠폰 A(10,000원) 할인이 제거되지 않고 쿠폰 B(5,000원) 할인이 누적 합산되어 총 15,000원 할인이 적용됨.

### Required Evidence
- **DOM**: 주문 요약창 `data-role="discount"`에 `-15,000원`이 표시되고 최종 결제 금액이 15,000원만큼 감소함.
- **Network**: `POST /api/checkout/coupon` 응답의 `totalDiscount`가 15,000으로 반환됨.

---

## 2. C-05-013 — Negative Total Calculation

### Bug Information
- **bug_id**: `C-05-013`
- **error_name**: `Negative Total Calculation (음수 결제 금액 노출 및 결제 가능 오류)`
- **strategy**: `SEQUENCE_REPLAY`

### Trigger Sequence
1. 기본 상품 (데일리 코튼 셔츠, 15,000원) 1개 장바구니 유지
2. Checkout 진입 (상품 금액: 15,000원)
3. 30,000원 할인 쿠폰 (`WELCOME30`) 선택 후 [쿠폰 적용]

### Normal Behavior
- 할인 금액이 상품 금액보다 클 경우 `Math.max(0, subtotal - discount)` 등에 의해 최소 0원으로 보정되고 결제 금액이 음수로 내려가지 않아야 함.

### Actual Behavior (Intended Bug)
- 하한 보호 로직이 누락되어 `15,000 - 30,000 = -15,000원`이 그대로 계산되고, [주문 결제하기] 버튼이 활성 상태를 유지하여 음수 금액 결제가 가능함.

### Required Evidence
- **DOM**: 주문 요약창 `data-role="total"`에 `-15,000원`이 표시됨.
- **Button**: `[주문 결제하기]` 버튼이 비활성화되지 않고 활성화 상태 유지.

---

## 3. C-05-627 — Stealth Cart Injection

### Bug Information
- **bug_id**: `C-05-627`
- **error_name**: `Stealth Cart Injection (배송 옵션 변경 시 연관 상품 강제 DB 주입)`
- **strategy**: `SEQUENCE_REPLAY`

### Precondition
- 장바구니에 `데일리 코튼 셔츠 (15,000원)` 1개만 존재.

### Trigger Sequence
1. Checkout 화면 진입 (기본 무료 일반 배송 상태)
2. 배송 옵션에서 **`새벽 특급 배송 (5,000원)`** 클릭

### Normal Behavior
- 배송비만 +5,000원이 가산되고 주문 상품 목록은 변경되지 않아야 함.

### Actual Behavior (Intended Bug)
- `새벽 특급 배송` 선택 시 백엔드 `cart_items` 테이블에 `신선 보냉백 (3,000원)` 상품이 사용자 동의 없이 몰래 추가(INSERT)되어 장바구니 품목과 총액이 8,000원 증가함.

### Required Evidence
- **DOM**: 장바구니/주문 상품 목록에 `신선 보냉백 (3,000원)` 항목이 새 행으로 추가됨.
- **Network**: `POST /api/checkout/shipping` 이후 `GET /api/cart` 및 `GET /api/checkout/summary`에서 품목이 2개로 증가한 데이터 수신.

---

## 4. C-05-446 — Inventory Steal During Sequence

### Bug Information
- **bug_id**: `C-05-446`
- **error_name**: `Inventory Steal During Sequence (DB 재고 부족 409 Conflict 결제 차단)`
- **strategy**: `SEQUENCE_REPLAY`

### Precondition
- `라이트 니트` (상품 ID: 2, 실제 SQLite 재고 = 3개).

### Trigger Sequence
1. 컬렉션에서 `라이트 니트` 수량을 **5개**로 설정 후 [담기]
2. Checkout 화면에서 배송지 및 배송 옵션 선택
3. **[주문 결제하기]** 버튼 클릭

### Normal Behavior
- 프론트엔드 또는 백엔드 재고 검증에 의해 주문 전 수량 제한이 안내되어야 함.

### Actual Behavior (Intended Bug)
- 프론트엔드는 5개 주문을 유지하다가 `POST /api/orders` 최종 결제 시점에 백엔드 SQLite 재고(`stock = 3 < requested = 5`) 검증에 걸려 `409 Conflict` (`OUT_OF_STOCK`) 에러가 반환되며 결제가 실패함.

### Required Evidence
- **Network**: `POST /api/orders` 응답 `409 Conflict` (payload: `{ error: "OUT_OF_STOCK" }`)
- **DOM**: "409 Conflict — 결제를 완료할 수 없습니다. 상품 재고가 부족합니다." 에러 모달 팝업 표시.

---

## 5. C-05-652 — Precision Float Error

### Bug Information
- **bug_id**: `C-05-652`
- **error_name**: `Precision Float Error (부동소수점 연산 오차 UI 노출)`
- **strategy**: `SEQUENCE_REPLAY`

### Trigger Sequence
1. 상품 선택 후 Checkout 진입
2. **`SPRING30` (30% 정기 할인 쿠폰)** 선택 후 [쿠폰 적용]
3. 세금(10%) 계산 단계 및 총액 계산 결과 확인

### Normal Behavior
- 정률 할인 및 세금 계산 후 통화 표기 규칙에 따라 반올림/절사되어 깔끔한 정수 금액으로 렌더링되어야 함.

### Actual Behavior (Intended Bug)
- `Math.round()` / `.toFixed()` 등의 포맷팅 로직이 누락되어 JavaScript IEEE-754 부동소수점 오차가 가공 없이 그대로 렌더링됨.

### Required Evidence
- **DOM**: 주문 요약창 `data-role="total"`에 소수점 부동소수점 오차(예: `18999.999999999996원` 또는 `30800.000000000004원`)가 그대로 표시됨.
