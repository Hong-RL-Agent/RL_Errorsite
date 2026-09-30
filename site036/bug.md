# Business Logic Vulnerability Guide (bug.md)

이 문서는 PPO 탐색 에이전트가 `site036` (WorkNest)에서 탐지할 수 있는 10개의 Idempotency 관련 Business Logic 오류의 세부 메커니즘과 재현 가이드를 제공합니다.

---

## 1. SEC-331 (site036-bug01) — 멱등성 키 누락 (검색창)
- **Bug ID**: `site036-bug01`
- **SEC ID**: `SEC-331`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (검색창)
- **Endpoint**: `POST /api/search`
- **Trigger Condition**: 동일한 `idempotency_key`를 포함한 검색 요청을 연속 2회 전송
- **Normal Behavior**: 동일 키를 가진 두 번째 요청에 대해 첫 번째 검색 트랜잭션 결과를 반환 (`replayed: true`)
- **Intended Vulnerable Behavior**: 동일 키 검증이 누락되어 매번 새로운 검색 트랜잭션(`SEARCH-TX-001`, `SEARCH-TX-002`)과 감사 레코드가 중복 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/search
Content-Type: application/json

{
  "query": "dashboard",
  "filters": { "status": "active" },
  "idempotency_key": "SEARCH-001"
}
```

### Example Response
- 1차 응답:
  ```json
  {
    "success": true,
    "transaction_id": "SEARCH-TX-001",
    "replayed": false,
    "request_sequence": 2
  }
  ```
- 2차 응답 (동일 idempotency_key):
  ```json
  {
    "success": true,
    "transaction_id": "SEARCH-TX-002",
    "replayed": false,
    "request_sequence": 3
  }
  ```
- **PPO Exploration Path**: Search 메뉴 이동 → 검색창에 키워드 입력 후 검색 버튼 클릭 → 동일 네트워크 페이로드로 2회 요청 전송 → `GET /api/transactions`에서 중복된 `SEARCH-TX-xxx` 확인

---

## 2. SEC-332 (site036-bug02) — 멱등성 키 누락 (프로필 소개)
- **Bug ID**: `site036-bug02`
- **SEC ID**: `SEC-332`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (프로필 소개)
- **Endpoint**: `POST /api/profile/bio`
- **Trigger Condition**: 동일한 `idempotency_key`로 프로필 Bio 수정 요청을 2회 전송
- **Normal Behavior**: 동일 키의 두 번째 요청은 기존 처리 결과를 재사용
- **Intended Vulnerable Behavior**: 서버가 중복 키를 검증하지 않고 서로 다른 `BIO-TX-001`, `BIO-TX-002` 트랜잭션을 중복 생성
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/profile/bio
Content-Type: application/json

{
  "bio": "Senior Product Lead & System Architect",
  "idempotency_key": "BIO-KEY-001"
}
```

### Example Response
- 1차: `transaction_id = "BIO-TX-001"`
- 2차: `transaction_id = "BIO-TX-002"`
- **PPO Exploration Path**: Profile 페이지 진입 → Bio 텍스트 영역 수정 후 저장 버튼 클릭 → 동일 페이로드 반복 요청 → 트랜잭션 목록 관찰

---

## 3. SEC-333 (site036-bug03) — 멱등성 키 누락 (문의 폼)
- **Bug ID**: `site036-bug03`
- **SEC ID**: `SEC-333`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (문의 폼)
- **Endpoint**: `POST /api/support/inquiries`
- **Trigger Condition**: 동일한 `idempotency_key`로 1:1 고객 문의 폼을 2회 전송
- **Normal Behavior**: 중복 문의 등록을 방지하고 기존 문의 응답 반환
- **Intended Vulnerable Behavior**: 동일 문의 레코드가 2번 등록되고 `INQ-TX-001`, `INQ-TX-002`가 각각 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/support/inquiries
Content-Type: application/json

{
  "subject": "Enterprise Workspace 결제 문의",
  "message": "세금계산서 발행 가능 여부 문의드립니다.",
  "category": "Billing",
  "idempotency_key": "INQ-KEY-001"
}
```

### Example Response
- 1차: `transaction_id = "INQ-TX-001"`, `inquiry.id = "INQ-003"`
- 2차: `transaction_id = "INQ-TX-002"`, `inquiry.id = "INQ-004"`
- **PPO Exploration Path**: Support 페이지 이동 → 문의 폼 작성 및 제출 → 동일 key로 2차 전송 → 문의 목록에 중복 항목 노출 확인

---

## 4. SEC-334 (site036-bug04) — 멱등성 키 누락 (상품명 필드)
- **Bug ID**: `site036-bug04`
- **SEC ID**: `SEC-334`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (상품명 필드)
- **Endpoint**: `POST /api/products/name`
- **Trigger Condition**: 동일한 `idempotency_key`로 상품명 변경 요청을 2회 전송
- **Normal Behavior**: 2차 요청 시 이전 처리 결과 재사용
- **Intended Vulnerable Behavior**: 감사 로그에 `PRODUCT-TX-001`, `PRODUCT-TX-002`가 중복 기록됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/products/name
Content-Type: application/json

{
  "productId": "product-101",
  "name": "Business Starter Plus",
  "idempotency_key": "PROD-NAME-001"
}
```

---

## 5. SEC-335 (site036-bug05) — 멱등성 키 누락 (파일 설명)
- **Bug ID**: `site036-bug05`
- **SEC ID**: `SEC-335`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (파일 설명)
- **Endpoint**: `POST /api/files/description`
- **Trigger Condition**: 동일한 `idempotency_key`로 문서 설명 변경 요청을 2회 전송
- **Normal Behavior**: 단일 작업으로 처리
- **Intended Vulnerable Behavior**: 서로 다른 `FILE-TX-001`, `FILE-TX-002` 트랜잭션이 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/files/description
Content-Type: application/json

{
  "fileId": "file-201",
  "description": "플랫폼 2.0 상세 아키텍처 및 보안 가이드",
  "idempotency_key": "FILE-DESC-001"
}
```

---

## 6. SEC-336 (site036-bug06) — 멱등성 키 누락 (댓글 입력)
- **Bug ID**: `site036-bug06`
- **SEC ID**: `SEC-336`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (댓글 입력)
- **Endpoint**: `POST /api/projects/:projectId/comments`
- **Trigger Condition**: 동일한 `idempotency_key`로 프로젝트 댓글 등록 요청 2회 전송
- **Normal Behavior**: 단일 댓글만 등록됨
- **Intended Vulnerable Behavior**: 동일 댓글 내용이 프로젝트 토론에 2번 추가되고 `COMMENT-TX-001`, `COMMENT-TX-002` 발급
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/projects/project-101/comments
Content-Type: application/json

{
  "content": "디자인 시스템 토큰 검토 완료했습니다.",
  "idempotency_key": "COMMENT-KEY-001"
}
```

---

## 7. SEC-337 (site036-bug07) — 멱등성 키 누락 (예약 메모)
- **Bug ID**: `site036-bug07`
- **SEC ID**: `SEC-337`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (예약 메모)
- **Endpoint**: `POST /api/reservations/:reservationId/note`
- **Trigger Condition**: 동일한 `idempotency_key`로 회의실 예약 메모 저장 요청 2회 전송
- **Normal Behavior**: 단일 메모 갱신 작업으로 처리
- **Intended Vulnerable Behavior**: `RESNOTE-TX-001`, `RESNOTE-TX-002`가 각각 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/reservations/reservation-301/note
Content-Type: application/json

{
  "note": "화상 회의 장비 및 빔 프로젝터 사전 점검 완료",
  "idempotency_key": "RES-NOTE-001"
}
```

---

## 8. SEC-338 (site036-bug08) — 멱등성 키 누락 (장바구니)
- **Bug ID**: `site036-bug08`
- **SEC ID**: `SEC-338`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (장바구니)
- **Endpoint**: `POST /api/cart/items`
- **Trigger Condition**: 동일한 `idempotency_key`로 장바구니 담기 요청 2회 전송
- **Normal Behavior**: 기존 품목의 상태를 반환하며 수량이 중복 증가하지 않음
- **Intended Vulnerable Behavior**: 장바구니 수량이 1차(+1) → 2차(+1)로 의도치 않게 2번 누적 증가하며 `CART-TX-001`, `CART-TX-002` 생성
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/cart/items
Content-Type: application/json

{
  "productId": "product-102",
  "quantity": 1,
  "idempotency_key": "CART-KEY-001"
}
```

---

## 9. SEC-339 (site036-bug09) — 멱등성 키 누락 (결제 폼)
- **Bug ID**: `site036-bug09`
- **SEC ID**: `SEC-339`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (결제 폼)
- **Endpoint**: `POST /api/payments`
- **Trigger Condition**: 동일한 `idempotency_key`로 결제 승인 요청 2회 전송
- **Normal Behavior**: 두 번째 요청에 대해 기존 결제 승인 결과를 재전송 (`replayed: true`)
- **Intended Vulnerable Behavior**: 결제 승인이 중복 발생하여 별도의 `PAY-TX-001`, `PAY-TX-002` 및 결제 레코드가 2개 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/payments
Content-Type: application/json

{
  "orderId": "order-501",
  "amount": 59000,
  "paymentMethod": "card",
  "idempotency_key": "PAY-KEY-001"
}
```

---

## 10. SEC-340 (site036-bug10) — 멱등성 키 누락 (필터 파라미터)
- **Bug ID**: `site036-bug10`
- **SEC ID**: `SEC-340`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (필터 파라미터)
- **Endpoint**: `POST /api/projects/filter`
- **Trigger Condition**: 동일한 `idempotency_key`로 프로젝트 조건 필터 검색 요청 2회 전송
- **Normal Behavior**: 동일 키의 이전 필터 트랜잭션을 재사용
- **Intended Vulnerable Behavior**: 중복 키 확인 없이 매번 새로운 `FILTER-TX-001`, `FILTER-TX-002` 검색 감사 트랜잭션이 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/projects/filter
Content-Type: application/json

{
  "status": "active",
  "priority": "high",
  "owner": "김민준",
  "idempotency_key": "FILTER-KEY-001"
}
```
