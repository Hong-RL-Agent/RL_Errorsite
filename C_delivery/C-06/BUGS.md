# C-06 Bug Catalog & Training Specification

- **Site ID**: `C-06`
- **Site Name**: `TableRun (음식 배달 Checkout 시스템)`
- **Strategy**: `SEQUENCE_REPLAY`
- **Frontend**: React + Vite (`http://localhost:5178`)
- **Backend**: Express + SQLite (`http://localhost:5005`)
- **Reset API**: `POST http://localhost:5005/api/test/reset`

---

## 1. C-06-622 — Option Cost Ghost

### Bug Information
- **bug_id**: `C-06-622`
- **error_name**: `Option Cost Ghost (결제단계 추가옵션 비용 누락)`
- **strategy**: `SEQUENCE_REPLAY`

### Trigger Sequence
1. 메뉴 상세에서 **바삭 치킨 세트 (12,000원)** 클릭
2. 옵션 1: **사이드 감자튀김 (+2,000원)** 선택
3. 옵션 2: **치즈 추가 (+2,000원)** 선택 (메뉴 모달 표시 총액: 16,000원)
4. [16,000원 담기] 클릭하여 장바구니 추가 후 Checkout(주문서) 진입

### Normal Behavior
- 주문서의 총 상품 금액(subtotal)에 메뉴 가격과 2개 옵션 가격이 모두 합산되어 `16,000원`으로 계산되어야 함.

### Actual Behavior (Intended Bug)
- 주문서 화면에 `선택 옵션: 사이드 감자튀김 (+2,000원)`, `선택 옵션: 치즈 추가 (+2,000원)` 배지는 정상 렌더링되지만, 최종 주문 요약 계산 및 `GET /api/checkout/summary` 응답에서 `cart_item_options` 추가금이 누락되어 `data-role="subtotal"`에 기본 메뉴가 `12,000원`만 계산됨.

### Required Evidence
- **DOM**: 선택 옵션 태그가 DOM에 존재하지만 `data-role="subtotal"`이 `12,000원`으로 표시됨.
- **Backend**: `cart_item_options` DB 테이블에는 옵션 2개가 존재함.

---

## 2. C-06-423 — Minimum Order Bypass

### Bug Information
- **bug_id**: `C-06-423`
- **error_name**: `Minimum Order Bypass (쿠폰 적용 이벤트에 의한 최소주문금액 검증 우회)`
- **strategy**: `SEQUENCE_REPLAY`

### Precondition
- 매장 최소주문금액: `15,000원`.
- 장바구니: `바삭 치킨 세트 (12,000원)` 1개 (주문금액 12,000원 < 최소 15,000원).

### Trigger Sequence
1. 12,000원 상품 담긴 상태로 Checkout 진입
2. 상단 "최소주문금액(15,000원)을 충족해주세요" 경고 및 [결제하기] 버튼 비활성화 확인
3. 쿠폰 선택 드롭다운에서 임의의 쿠폰(예: `WELCOME2000`) 선택 및 적용

### Normal Behavior
- 쿠폰을 적용하더라도 원 상품 주문금액(12,000원)이 최소주문금액(15,000원)에 미달하므로 경고가 유지되고 결제가 차단되어야 함.

### Actual Behavior (Intended Bug)
- 쿠폰 적용 이벤트에 의해 `minimumOrderSatisfied`가 `true`로 잘못 전환되고 백엔드 세션도 `minimum_order_bypassed = 1`로 설정되어 경고가 사라지고 `[결제하기]` 버튼이 활성화되어 12,000원 주문이 통과됨.

### Required Evidence
- **DOM**: 주문금액 12,000원 < 최소 15,000원 상태임에도 최소주문금액 경고가 소멸하고 `[결제하기]` 버튼이 활성화됨.
- **Network**: `POST /api/orders` 요청이 200 OK로 성공함.

---

## 3. C-06-604 — Delivery Tip Distance Calculation

### Bug Information
- **bug_id**: `C-06-604`
- **error_name**: `Delivery Tip Distance Calculation (미터/킬로미터 단위 변환 착오 배달팁 폭증)`
- **strategy**: `SEQUENCE_REPLAY`

### Trigger Sequence
1. Checkout 화면 진입
2. 배달 주소에서 **`김도현 (서울시 영등포구 여의도동 24, 거리 1500m)`** 주소 클릭

### Normal Behavior
- 거리 1500m(1.5km)에 따른 추가 배달팁이 가산되어 약 3,500원 ~ 4,500원 수준으로 계산되어야 함.

### Actual Behavior (Intended Bug)
- 백엔드 거리 계산 API가 1500m를 1500km로 취급하여 `3,000 + (1500 * 1000) = 1,503,000원`의 비정상적인 배달팁을 반환함.

### Required Evidence
- **DOM**: 주문 요약창 `data-role="delivery-fee"`에 `1,503,000원`이 표시됨.
- **Network**: `POST /api/checkout/delivery-fee` 응답의 `deliveryFee`가 `1503000`으로 반환됨.

---

## 4. C-06-1604 — Stale Menu Price

### Bug Information
- **bug_id**: `C-06-1604`
- **error_name**: `Stale Menu Price (서버 최신 단가 불일치 409 Conflict 오류)`
- **strategy**: `SEQUENCE_REPLAY`

### Precondition
- `매콤 크림 파스타` (장바구니 담길 때 단가 = 15,000원, 서버 최신 단가 = 17,000원).

### Trigger Sequence
1. `매콤 크림 파스타` 메뉴 담기
2. Checkout 진입 후 **[결제하기]** 클릭 (주문 검증 `POST /api/checkout/validate` 호출)

### Normal Behavior
- 결제 전 장바구니 단가가 서버 단가와 자동으로 동기화되거나 안내되어야 함.

### Actual Behavior (Intended Bug)
- 서버 검증에서 cartPrice(15000)와 expected(17000)의 불일치를 감지하여 `409 Conflict` (`PRICE_CHANGED`) 에러를 반환하고 "상품 가격이 변경되었습니다. 주문 금액을 다시 확인해주세요." 모달을 띄워 결제를 중단함.

### Required Evidence
- **Network**: `POST /api/checkout/validate` 응답 `409 Conflict` (`error: "PRICE_CHANGED"`)
- **DOM**: 409 Conflict 가격 변경 에러 모달 팝업 표시.

---

## 5. C-06-1822 — Rider Tip Bug

### Bug Information
- **bug_id**: `C-06-1822`
- **error_name**: `Rider Tip Bug (라이더 팁 취소 API 실패 시 낙관적 UI와 백엔드 상태 불일치)`
- **strategy**: `SEQUENCE_REPLAY`

### Trigger Sequence
1. Checkout 화면에서 라이더 추가 팁 **`+1,000원`** 선택 (UI에 +1,000원 표시, 백엔드 세션 rider_tip = 1000)
2. **`없음 (0원)`** 버튼을 클릭하여 라이더 팁 취소 시도
3. 취소 API `DELETE /api/checkout/rider-tip`가 500 에러를 반환하지만, UI는 낙관적 업데이트로 `0원`을 표시
4. **[결제하기]** 버튼 클릭

### Normal Behavior
- 취소 실패 시 UI가 롤백되어 팁이 남아있음을 알리거나, 정상 취소되어 0원이 결제되어야 함.

### Actual Behavior (Intended Bug)
- UI에서는 `라이더 추가 팁: 0원`으로 표시되어 사용자는 팁이 취소된 것으로 인지하지만, 실제 백엔드 세션에는 1000원이 남아있어 최종 주문 접수 시 `rider_tip: 1000`이 부과되어 주문서 및 영수증에 1,000원이 포함되어 결제됨.

### Required Evidence
- **DOM**: 화면 상 `data-role="rider-tip"`은 `0원`으로 표시됨.
- **Network / Order Receipt**: `POST /api/orders` 응답 및 주문 완료 영수증의 `riderTip`에 `1000`이 기록되어 청구됨.
