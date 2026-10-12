# OrderPilot 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 OrderPilot (D-06) 쇼핑몰 주문 및 배송 관리 백오피스 시스템에 설계된 5가지 의도적 기능 오류에 대한 명세서입니다.  
본 환경은 **SEQUENCE_REPLAY** 학습 환경으로, 단일 액션(ACTION_REPLAY)이 아니라 **검색, 필터, 대상 선택, 상태 변경, 결과 확인이라는 일련의 다단계 행동 시퀀스**를 정확히 거쳐야만 오류 상태가 발현되도록 구성되어 있습니다.  
DQN 에이전트는 올바른 행동 시퀀스를 탐색하고, 최종 상태에서 UI, DOM, Network, State Evidence를 대조하여 오류를 식별할 수 있습니다.

---

## 1. BUG-D06-01: 날짜 검색 및 결제완료 필터 결합 시 배송상태 미변경 오류

- **bug_id**: `BUG-D06-01`
- **오류명**: 날짜 범위 검색 및 결제 완료 필터 적용 상태에서 대상 주문의 배송 상태를 '배송 준비중'으로 변경 시 상태가 변경되지 않고 유지되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 주문**: `ORD-20261005-0012` (주문 ID: 12, 고객: 이서윤, 초기 배송상태: `PENDING`, 결제상태: `PAID`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 주문 ID 12의 `delivery_status`는 `PENDING`, `payment_status`는 `PAID`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 상단 필터 바에서 시작 일자를 `"2026-10-01"`, 종료 일자를 `"2026-10-10"`으로 설정 (`startDate = '2026-10-01'`, `endDate = '2026-10-10'`).
  2. `Action 2`: 결제 상태 드롭다운에서 `"결제 완료 (PAID)"` 선택 (`paymentStatus = 'PAID'`).
  3. `Action 3`: 목록에서 주문번호 `ORD-20261005-0012` 행의 우측 [배송] 버튼 클릭.
  4. `Action 4`: 배송 상태 모달에서 변경할 상태를 `"배송 준비중 (PREPARING)"`으로 선택 후 [배송 정보 저장] 클릭 (`PATCH /api/orders/12/delivery`).
  5. `Action 5`: "배송 상태 변경이 접수되었습니다" 알림 확인 후 주문 목록의 배송 상태 배지 재조회.
- **기대 결과 (Expected Behavior)**:
  - `ORD-20261005-0012` 주문의 배송 상태가 파란색 `배송 준비중 (PREPARING)`으로 갱신되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 성공 토스트 알림이 표시되지만, 백엔드에서 날짜 검색 및 결제완료 필터 컨텍스트 결합 시 `orders` 테이블의 `delivery_status` UPDATE 쿼리를 생략함.
  - 목록 재조회 시 배송 상태가 변경되지 않고 회색 `배송 대기 (PENDING)` 상태로 그대로 잔류함.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: `ORD-20261005-0012` 행의 배송 상태가 `배송 대기 (PENDING)` 배지로 유지됨.
  - **DOM**: `tr[data-order-no="ORD-20261005-0012"] .badge-delivery-pending` 존재 (`badge-delivery-preparing` 미존재).
  - **Network**: `GET /api/orders/12` 조회 시 `data.delivery_status` 값이 `'PENDING'`.
  - **State**: SQLite `SELECT delivery_status FROM orders WHERE id = 12` 결과가 `'PENDING'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. 날짜 `2026-10-01 ~ 2026-10-10` 입력 -> 결제 상태 `PAID` 선택.
  3. `ORD-20261005-0012`의 [배송] 버튼 클릭 -> `배송 준비중` 선택 후 저장.
  4. 테이블에서 해당 주문의 배송 상태가 `배송 대기`로 유지되는지 확인.

---

## 2. BUG-D06-02: 주문 검색 상태에서 품목 수량 수정 시 총 결제금액 왜곡 계산 오류

- **bug_id**: `BUG-D06-02`
- **오류명**: 주문 검색 상태에서 상세 모달을 열고 상품 수량을 1개에서 3개로 수정한 후 저장 시 주문 총액이 267,000원이 아닌 89,000원으로 왜곡 저장되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 주문**: `ORD-20261008-0025` (주문 ID: 25, 고객: 김민준, 품목: `무선 노이즈캔슬링 헤드폰`, 단가: 89,000원, 초기 수량: 1개, 초기 총액: 89,000원)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 주문 ID 25의 품목 수량은 `1`, `total_amount`는 `89000`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 검색창에 `"ORD-20261008-0025"` 또는 `"김민준"` 입력 (`search = '김민준'`).
  2. `Action 2`: 검색된 `ORD-20261008-0025` 행의 [상세] 버튼을 클릭하여 주문 상세 모달 오픈 (`GET /api/orders/25`).
  3. `Action 3`: 주문 상품 내역 테이블에서 `무선 노이즈캔슬링 헤드폰`의 수량 입력창을 `1`에서 `3`으로 변경.
  4. `Action 4`: 우측 [저장] 버튼 1회 클릭 (`PATCH /api/orders/25/items`).
  5. `Action 5`: "주문 품목 수량 및 총액이 저장되었습니다" 메시지 확인 후 하단의 [최종 주문 총액] 금액 확인.
- **기대 결과 (Expected Behavior)**:
  - 단가 89,000원 * 3개 = 267,000원으로 계산되어 최종 주문 총액이 `267,000원`으로 갱신되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 수량은 3개로 변경되었으나, 백엔드 총액 계산 로직에서 이전 1개 가격(89,000원)으로 고정 덮어쓰기 저장됨.
  - 최종 주문 총액이 267,000원이 아닌 `89,000원`으로 왜곡되어 표시됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 수량 3개 상태에서 최종 주문 총액이 `89,000원`으로 표시됨 (기대치: 267,000원).
  - **DOM**: `span[data-field="order-total-amount"]`의 텍스트가 `89,000원`.
  - **Network**: `PATCH /api/orders/25/items` 응답 및 `GET /api/orders/25`의 `data.total_amount`가 `89000`.
  - **State**: SQLite `SELECT total_amount FROM orders WHERE id = 25` 결과가 `89000`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. 검색창에 `"김민준"` 입력 -> `ORD-20261008-0025` [상세] 클릭.
  3. 수량을 `3`으로 수정 후 [저장] 클릭.
  4. 최종 주문 총액이 267,000원이 아닌 89,000원으로 왜곡되어 있는지 확인.

---

## 3. BUG-D06-03: 배송 중 필터 상태에서 운송장 입력 및 완료 시 타 주문 운송장 변조 오류

- **bug_id**: `BUG-D06-03`
- **오류명**: 배송 중 필터 상태에서 특정 주문(ORD-20261003-0008)의 운송장 등록 및 배송 완료 처리 시, 운송장 정보가 이전 주문(ORD-20261003-0007)에 잘못 저장되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 주문**:
  - 선택 주문: `ORD-20261003-0008` (주문 ID: 8, 고객: 박지훈, 초기 배송상태: `SHIPPING`)
  - 변조 대상 주문: `ORD-20261003-0007` (주문 ID: 7, 고객: 강현우, 초기 배송상태: `SHIPPING`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 8번 주문과 7번 주문 모두 `delivery_status`가 `SHIPPING`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 배송 상태 필터 드롭다운에서 `"배송 중 (SHIPPING)"` 선택 (`deliveryStatus = 'SHIPPING'`).
  2. `Action 2`: 목록에서 `ORD-20261003-0008` (박지훈) 행의 [배송] 버튼 클릭.
  3. `Action 3`: 배송 상태를 `"배송 완료 (DELIVERED)"`로 선택.
  4. `Action 4`: 택배사를 `"CJ대한통운"`, 운송장 번호를 `"689123456789"`로 입력 후 [배송 정보 저장] 클릭 (`PATCH /api/orders/8/delivery`).
  5. `Action 5`: 저장 후 8번 주문의 상세 페이지 및 7번 주문(`ORD-20261003-0007`)의 운송장 정보 확인.
- **기대 결과 (Expected Behavior)**:
  - 8번 주문(`ORD-20261003-0008`)에 택배사 `CJ대한통운`과 운송장 번호 `689123456789`가 저장되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 8번 주문의 배송 상태는 DELIVERED로 바뀌지만, 입력한 운송장 번호는 7번 주문(`ORD-20261003-0007`)의 레코드에 엉뚱하게 UPDATE됨.
  - 8번 주문의 상세 조회 시 운송장 번호가 변경되지 않고, 7번 주문에 입력값이 기록되어 있음.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 8번 주문의 운송장 컬럼에 신규 운송장이 미반영되고, 7번 주문에 `CJ대한통운 689123456789`가 반영됨.
  - **Network**: `GET /api/orders/8`의 `tracking_number` 불일치 vs `GET /api/orders/7`의 `tracking_number`가 `'689123456789'`.
  - **State**: SQLite `SELECT tracking_number FROM orders WHERE id = 7` 결과가 `'689123456789'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. 배송 상태 필터 `"SHIPPING"` 선택 -> `ORD-20261003-0008` [배송] 클릭.
  3. 상태 `DELIVERED`, 운송장 `689123456789` 입력 후 저장.
  4. 7번 주문(`ORD-20261003-0007`)의 운송장이 `689123456789`로 변조되었는지 확인.

---

## 4. BUG-D06-04: 고객명 검색 상태에서 주문 취소 시 결제완료(PAID) 상태 잔류 오류

- **bug_id**: `BUG-D06-04`
- **오류명**: 고객명 검색 상태에서 주문 취소 사유를 입력하고 확정 처리해도 성공 알림만 노출되고 주문 및 결제 상태가 계속 결제 완료(PAID)로 유지되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 주문**: `ORD-20261007-0019` (주문 ID: 19, 고객: `정다은`, 초기 결제상태: `PAID`, 배송상태: `PENDING`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 19번 주문의 `payment_status`는 `PAID`, `delivery_status`는 `PENDING`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 검색창에 `"정다은"` 입력 (`search = '정다은'`).
  2. `Action 2`: 검색된 `ORD-20261007-0019` 행의 우측 [취소] 버튼 클릭.
  3. `Action 3`: 취소 팝업에서 취소 사유로 `"단순 변심으로 인한 주문 취소"` 입력.
  4. `Action 4`: [주문 취소 확정] 버튼 1회 클릭 (`PATCH /api/orders/19/cancel`).
  5. `Action 5`: "주문 취소 처리가 완료되었습니다" 메시지 확인 후 목록의 결제 및 배송 상태 확인.
- **기대 결과 (Expected Behavior)**:
  - 주문 상태가 빨간색 `결제 취소 (CANCELLED)` 및 `취소됨`으로 변경되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 취소 로그만 DB에 기록되고, `orders` 테이블의 `payment_status`와 `delivery_status` UPDATE가 누락됨.
  - 목록에서 해당 주문이 여전히 초록색 `결제 완료 (PAID)` 및 `배송 대기 (PENDING)` 상태로 유지됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 정다은 주문의 결제 상태 배지가 여전히 초록색 `결제 완료`로 노출됨.
  - **DOM**: `tr[data-order-no="ORD-20261007-0019"] .badge-paid` 잔류 (`badge-cancelled` 미생성).
  - **Network**: `GET /api/orders/19` 응답 JSON의 `data.payment_status`가 `'PAID'`.
  - **State**: SQLite `SELECT payment_status FROM orders WHERE id = 19` 결과가 `'PAID'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. 검색창에 `"정다은"` 입력 -> `ORD-20261007-0019` [취소] 클릭.
  3. 사유 입력 후 [주문 취소 확정] 클릭.
  4. 목록에서 해당 주문의 결제 상태가 여전히 `결제 완료`로 남아있는지 확인.

---

## 5. BUG-D06-05: 환불 요청 필터 상태에서 환불 승인 시 타 주문 결제상태 변경 오류

- **bug_id**: `BUG-D06-05`
- **오류명**: 환불 요청 필터 적용 후 특정 주문(ORD-20261004-0010)을 승인 처리 시, 선택한 주문 대신 다른 주문(ORD-20261002-0005)의 결제 상태가 '환불 완료'로 변경되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 주문**:
  - 선택 주문: `ORD-20261004-0010` (주문 ID: 10, 고객: `최유진`, 초기 결제상태: `REFUND_REQUESTED`)
  - 변조 주문: `ORD-20261002-0005` (주문 ID: 5, 고객: `김서준`, 초기 결제상태: `REFUND_REQUESTED`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 10번 주문과 5번 주문 모두 `payment_status`가 `REFUND_REQUESTED`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 결제 상태 드롭다운에서 `"환불 요청 (REFUND_REQUESTED)"` 선택 (`paymentStatus = 'REFUND_REQUESTED'`).
  2. `Action 2`: 목록에서 `ORD-20261004-0010` (최유진) 행의 [환불] 버튼 클릭.
  3. `Action 3`: 환불 팝업에서 [환불 승인 확정] 버튼 1회 클릭 (`PATCH /api/orders/10/refund-approve`).
  4. `Action 4`: "환불 승인 처리가 완료되었습니다" 메시지 확인 후 목록 재조회.
  5. `Action 5`: 10번 주문의 상태 및 5번 주문(`ORD-20261002-0005`)의 결제 상태 확인.
- **기대 결과 (Expected Behavior)**:
  - 10번 주문(`ORD-20261004-0010`)의 결제 상태가 `환불 완료 (REFUNDED)`로 바뀌고 환불 요청 목록에서 사라져야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 10번 주문은 여전히 빨간색 `환불 요청 (REFUND_REQUESTED)`으로 목록에 그대로 남아있음.
  - 대신 5번 주문(`ORD-20261002-0005`, 김서준)의 상태가 보라색 `환불 완료 (REFUNDED)`로 엉뚱하게 변경되어 환불 요청 목록에서 사라짐.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 환불 요청 목록에 10번 주문(`최유진`)이 그대로 잔류하고 5번 주문이 사라짐.
  - **DOM**: `tr[data-order-no="ORD-20261004-0010"] .badge-refund-req` 유지.
  - **Network**: `GET /api/orders/10`의 `payment_status`는 `'REFUND_REQUESTED'`, `GET /api/orders/5`의 `payment_status`는 `'REFUNDED'`.
  - **State**: SQLite `SELECT payment_status FROM orders WHERE id = 10`은 `'REFUND_REQUESTED'`, `WHERE id = 5`는 `'REFUNDED'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. 결제 상태 필터 `"REFUND_REQUESTED"` 선택 -> `ORD-20261004-0010` [환불] 클릭 -> [환불 승인 확정].
  3. 10번 주문이 여전히 `환불 요청`으로 남아있고, 결제 상태 필터를 해제했을 때 5번 주문이 `환불 완료`로 변경되었는지 확인.
