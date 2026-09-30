# Intentional Business Logic Bugs (BUGS.md)

## 1. SEC-331
- bugId: site036-bug01
- csvId: SEC-331
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (검색창)
- severity: 상
- endpoint: POST /api/search
- condition: 동일 idempotency_key로 동일 검색 요청을 두 번 전송
- expected: 기존 검색 transaction 결과 반환
- actual: 서로 다른 SEARCH-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 2. SEC-332
- bugId: site036-bug02
- csvId: SEC-332
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (프로필 소개)
- severity: 상
- endpoint: POST /api/profile/bio
- condition: 동일 idempotency_key로 프로필 소개 변경 요청을 두 번 전송
- expected: 기존 프로필 변경 transaction 결과 재사용
- actual: 서로 다른 BIO-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 3. SEC-333
- bugId: site036-bug03
- csvId: SEC-333
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (문의 폼)
- severity: 상
- endpoint: POST /api/support/inquiries
- condition: 동일 idempotency_key로 고객 문의를 두 번 제출
- expected: 중복 문의 생성을 방지하고 기존 문의 결과 반환
- actual: 서로 다른 INQ-TX-xxx transaction_id 및 중복 문의 레코드가 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 4. SEC-334
- bugId: site036-bug04
- csvId: SEC-334
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (상품명 필드)
- severity: 상
- endpoint: POST /api/products/name
- condition: 동일 idempotency_key로 상품명 저장 요청을 두 번 전송
- expected: 중복 요청 시 기존 처리 결과 반환
- actual: 서로 다른 PRODUCT-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 5. SEC-335
- bugId: site036-bug05
- csvId: SEC-335
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (파일 설명)
- severity: 상
- endpoint: POST /api/files/description
- condition: 동일 idempotency_key로 파일 설명 수정 요청을 두 번 전송
- expected: 단일 작업으로 처리하고 기존 결과 반환
- actual: 서로 다른 FILE-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 6. SEC-336
- bugId: site036-bug06
- csvId: SEC-336
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (댓글 입력)
- severity: 상
- endpoint: POST /api/projects/:projectId/comments
- condition: 동일 idempotency_key로 프로젝트 댓글 입력 요청을 두 번 전송
- expected: 댓글은 한 번만 생성되고 기존 결과 반환
- actual: 동일 댓글이 2회 등록되고 서로 다른 COMMENT-TX-xxx transaction_id가 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 7. SEC-337
- bugId: site036-bug07
- csvId: SEC-337
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (예약 메모)
- severity: 상
- endpoint: POST /api/reservations/:reservationId/note
- condition: 동일 idempotency_key로 예약 메모 저장 요청을 두 번 전송
- expected: 단일 작업으로 처리하고 기존 결과 반환
- actual: 서로 다른 RESNOTE-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 8. SEC-338
- bugId: site036-bug08
- csvId: SEC-338
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (장바구니)
- severity: 상
- endpoint: POST /api/cart/items
- condition: 동일 idempotency_key로 장바구니 추가 요청을 두 번 전송
- expected: 동일 상품이 중복 추가되지 않고 기존 상태 반환
- actual: 장바구니 수량이 의도치 않게 누적 증가하고 서로 다른 CART-TX-xxx transaction_id 생성
- detection: idempotency_key, request_sequence, transaction_ids

## 9. SEC-339
- bugId: site036-bug09
- csvId: SEC-339
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (결제 폼)
- severity: 상
- endpoint: POST /api/payments
- condition: 동일 idempotency_key로 결제 승인 요청을 두 번 전송
- expected: 중복 결제를 차단하고 기존 결제 결과 (`replayed: true`) 반환
- actual: 결제가 2회 중복 승인되며 서로 다른 PAY-TX-xxx transaction_id가 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 10. SEC-340
- bugId: site036-bug10
- csvId: SEC-340
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (필터 파라미터)
- severity: 상
- endpoint: POST /api/projects/filter
- condition: 동일 idempotency_key로 필터 파라미터 요청을 두 번 전송
- expected: 기존 검색 필터 transaction 결과 재사용
- actual: 서로 다른 FILTER-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids
