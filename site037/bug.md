# Business Logic Vulnerability Guide (bug.md)

이 문서는 PPO 탐색 에이전트가 `site037` (StageOn)에서 탐지할 수 있는 10개의 Idempotency 관련 Business Logic 오류의 세부 메커니즘과 재현 가이드를 제공합니다.

---

## 1. SEC-341 (site037-bug01) — 멱등성 키 누락 (로그인 폼)
- **Bug ID**: `site037-bug01`
- **SEC ID**: `SEC-341`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (로그인 폼)
- **Endpoint**: `POST /api/auth/login`
- **Trigger Condition**: 동일한 `idempotency_key`로 로그인 폼 요청을 2회 전송
- **Normal Behavior**: 동일 키를 가진 두 번째 요청에 대해 기존 로그인 세션 트랜잭션 결과를 반환 (`replayed: true`)
- **Intended Vulnerable Behavior**: 중복 키 검증이 누락되어 매번 새로운 로그인 트랜잭션(`LOGIN-TX-001`, `LOGIN-TX-002`)이 중복 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "minji@example.com",
  "password": "demo-password",
  "idempotency_key": "LOGIN-001"
}
```

---

## 2. SEC-342 (site037-bug02) — 멱등성 키 누락 (회원가입 폼)
- **Bug ID**: `site037-bug02`
- **SEC ID**: `SEC-342`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (회원가입 폼)
- **Endpoint**: `POST /api/auth/register`
- **Trigger Condition**: 동일한 `idempotency_key`로 회원가입 요청을 2회 전송
- **Normal Behavior**: 동일 키의 2차 요청 시 이전 가입 트랜잭션 결과 반환
- **Intended Vulnerable Behavior**: 서버가 중복 키를 검증하지 않고 서로 다른 `REGISTER-TX-001`, `REGISTER-TX-002` 트랜잭션을 중복 생성
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Kim Minji",
  "email": "minji@example.com",
  "password": "demo-password",
  "idempotency_key": "REGISTER-001"
}
```

---

## 3. SEC-343 (site037-bug03) — 멱등성 키 누락 (주소 필드)
- **Bug ID**: `site037-bug03`
- **SEC ID**: `SEC-343`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (주소 필드)
- **Endpoint**: `POST /api/profile/address`
- **Trigger Condition**: 동일한 `idempotency_key`로 티켓 수령 주소 저장 요청을 2회 전송
- **Normal Behavior**: 주소 저장 트랜잭션 1회 처리
- **Intended Vulnerable Behavior**: `ADDRESS-TX-001`, `ADDRESS-TX-002` 감사 트랜잭션이 중복 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/profile/address
Content-Type: application/json

{
  "address": "서울특별시 마포구 월드컵북로 10",
  "detailAddress": "101호",
  "idempotency_key": "ADDRESS-001"
}
```

---

## 4. SEC-344 (site037-bug04) — 멱등성 키 누락 (쿠폰 필드)
- **Bug ID**: `site037-bug04`
- **SEC ID**: `SEC-344`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (쿠폰 필드)
- **Endpoint**: `POST /api/coupons/apply`
- **Trigger Condition**: 동일한 `idempotency_key`로 쿠폰 적용 요청을 2회 전송
- **Normal Behavior**: 2차 요청 시 기존 쿠폰 적용 결과를 반환하며 중복 트랜잭션을 방지
- **Intended Vulnerable Behavior**: 동일 쿠폰 요청에도 `COUPON-TX-001`, `COUPON-TX-002` 트랜잭션이 각각 중복 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/coupons/apply
Content-Type: application/json

{
  "reservationId": "reservation-401",
  "couponCode": "STAGE10",
  "idempotency_key": "COUPON-001"
}
```

---

## 5. SEC-345 (site037-bug05) — 멱등성 키 누락 (정렬 파라미터)
- **Bug ID**: `site037-bug05`
- **SEC ID**: `SEC-345`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (정렬 파라미터)
- **Endpoint**: `POST /api/performances/sort`
- **Trigger Condition**: 동일한 `idempotency_key`로 정렬 요청을 2회 전송
- **Normal Behavior**: 기존 정렬 검색 트랜잭션 결과를 재사용
- **Intended Vulnerable Behavior**: `SORT-TX-001`, `SORT-TX-002`가 중복 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/performances/sort
Content-Type: application/json

{
  "sortBy": "popularity",
  "order": "desc",
  "idempotency_key": "SORT-001"
}
```

---

## 6. SEC-346 (site037-bug06) — 멱등성 키 누락 (페이지네이션)
- **Bug ID**: `site037-bug06`
- **SEC ID**: `SEC-346`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (페이지네이션)
- **Endpoint**: `POST /api/performances/page`
- **Trigger Condition**: 동일한 `idempotency_key`로 페이지네이션 요청을 2회 전송
- **Normal Behavior**: 단일 페이지네이션 조회로 처리
- **Intended Vulnerable Behavior**: 서로 다른 `PAGE-TX-001`, `PAGE-TX-002` 트랜잭션이 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/performances/page
Content-Type: application/json

{
  "page": 2,
  "pageSize": 3,
  "idempotency_key": "PAGE-001"
}
```

---

## 7. SEC-347 (site037-bug07) — 멱등성 키 누락 (파일명 필드)
- **Bug ID**: `site037-bug07`
- **SEC ID**: `SEC-347`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (파일명 필드)
- **Endpoint**: `POST /api/files/name`
- **Trigger Condition**: 동일한 `idempotency_key`로 파일명 수정 요청을 2회 전송
- **Normal Behavior**: 단일 파일명 변경 작업으로 처리
- **Intended Vulnerable Behavior**: `FILENAME-TX-001`, `FILENAME-TX-002`가 각각 중복 생성됨
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/files/name
Content-Type: application/json

{
  "fileId": "file-601",
  "name": "performance-guide-v2.pdf",
  "idempotency_key": "FILENAME-001"
}
```

---

## 8. SEC-348 (site037-bug08) — 멱등성 키 누락 (채팅 입력)
- **Bug ID**: `site037-bug08`
- **SEC ID**: `SEC-348`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (채팅 입력)
- **Endpoint**: `POST /api/chats/:roomId/messages`
- **Trigger Condition**: 동일한 `idempotency_key`로 관객 채팅 메시지 전송 요청 2회 전송
- **Normal Behavior**: 동일 메시지는 1회만 등록됨
- **Intended Vulnerable Behavior**: 채팅방에 동일 메시지가 2개 등록되고 `CHAT-TX-001`, `CHAT-TX-002` 생성
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/chats/room-701/messages
Content-Type: application/json

{
  "message": "공연 시작 시간이 몇 시인가요?",
  "idempotency_key": "CHAT-001"
}
```

---

## 9. SEC-349 (site037-bug09) — 멱등성 키 누락 (공지사항)
- **Bug ID**: `site037-bug09`
- **SEC ID**: `SEC-349`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (공지사항)
- **Endpoint**: `POST /api/notices`
- **Trigger Condition**: 동일한 `idempotency_key`로 공지사항 작성 요청 2회 전송
- **Normal Behavior**: 공지사항이 중복 생성되지 않음
- **Intended Vulnerable Behavior**: 공지 목록에 중복 공지가 생성되고 `NOTICE-TX-001`, `NOTICE-TX-002` 생성
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/notices
Content-Type: application/json

{
  "title": "공연장 운영시간 변경 안내",
  "content": "이번 주 토요일 운영시간이 변경됩니다.",
  "category": "시설안내",
  "idempotency_key": "NOTICE-001"
}
```

---

## 10. SEC-350 (site037-bug10) — 멱등성 키 누락 (리뷰 입력)
- **Bug ID**: `site037-bug10`
- **SEC ID**: `SEC-350`
- **Category**: `business-logic`
- **Family**: `idempotency`
- **Type**: 멱등성 키 누락 (리뷰 입력)
- **Endpoint**: `POST /api/performances/:performanceId/reviews`
- **Trigger Condition**: 동일한 `idempotency_key`로 관람후기 리뷰 작성 요청 2회 전송
- **Normal Behavior**: 단일 리뷰만 등록되고 2차 요청 시 기존 결과 반환
- **Intended Vulnerable Behavior**: 관람평 피드에 동일 리뷰가 2개 등록되고 `REVIEW-TX-001`, `REVIEW-TX-002` 생성
- **Detection Signal**: `idempotency_key`, `request_sequence`, `transaction_ids`

### Example Request
```http
POST /api/performances/performance-101/reviews
Content-Type: application/json

{
  "rating": 5,
  "content": "무대 연출이 정말 좋았습니다.",
  "idempotency_key": "REVIEW-001"
}
```
