# Intentional Business Logic Bugs (BUGS.md)

## 1. SEC-341
- bugId: site037-bug01
- csvId: SEC-341
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (로그인 폼)
- severity: 상
- endpoint: POST /api/auth/login
- condition: 동일 idempotency_key로 동일 로그인 요청을 두 번 전송
- expected: 기존 로그인 transaction 결과 반환
- actual: 서로 다른 LOGIN-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 2. SEC-342
- bugId: site037-bug02
- csvId: SEC-342
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (회원가입 폼)
- severity: 상
- endpoint: POST /api/auth/register
- condition: 동일 idempotency_key로 회원가입 요청을 두 번 전송
- expected: 기존 회원가입 transaction 결과 반환
- actual: 서로 다른 REGISTER-TX-xxx transaction_id 및 중복 회원 레코드가 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 3. SEC-343
- bugId: site037-bug03
- csvId: SEC-343
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (주소 필드)
- severity: 상
- endpoint: POST /api/profile/address
- condition: 동일 idempotency_key로 주소 저장 요청을 두 번 전송
- expected: 주소 저장 transaction을 1회만 처리
- actual: 서로 다른 ADDRESS-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 4. SEC-344
- bugId: site037-bug04
- csvId: SEC-344
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (쿠폰 필드)
- severity: 상
- endpoint: POST /api/coupons/apply
- condition: 동일 idempotency_key로 쿠폰 적용 요청을 두 번 전송
- expected: 쿠폰 적용 transaction을 1회만 생성하고 기존 결과 반환
- actual: 서로 다른 COUPON-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 5. SEC-345
- bugId: site037-bug05
- csvId: SEC-345
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (정렬 파라미터)
- severity: 상
- endpoint: POST /api/performances/sort
- condition: 동일 idempotency_key로 정렬 파라미터 요청을 두 번 전송
- expected: 기존 정렬 transaction 결과 재사용
- actual: 서로 다른 SORT-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 6. SEC-346
- bugId: site037-bug06
- csvId: SEC-346
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (페이지네이션)
- severity: 상
- endpoint: POST /api/performances/page
- condition: 동일 idempotency_key로 페이지네이션 요청을 두 번 전송
- expected: 기존 페이지네이션 transaction 결과 반환
- actual: 서로 다른 PAGE-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 7. SEC-347
- bugId: site037-bug07
- csvId: SEC-347
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (파일명 필드)
- severity: 상
- endpoint: POST /api/files/name
- condition: 동일 idempotency_key로 파일명 수정 요청을 두 번 전송
- expected: 파일명 수정 작업을 단일 transaction으로 처리
- actual: 서로 다른 FILENAME-TX-xxx transaction_id가 중복 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 8. SEC-348
- bugId: site037-bug08
- csvId: SEC-348
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (채팅 입력)
- severity: 상
- endpoint: POST /api/chats/:roomId/messages
- condition: 동일 idempotency_key로 채팅 메시지 전송 요청을 두 번 전송
- expected: 동일 메시지는 한 번만 등록됨
- actual: 채팅창에 동일 메시지가 중복 게시되고 서로 다른 CHAT-TX-xxx transaction_id가 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 9. SEC-349
- bugId: site037-bug09
- csvId: SEC-349
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (공지사항)
- severity: 상
- endpoint: POST /api/notices
- condition: 동일 idempotency_key로 공지사항 작성 요청을 두 번 전송
- expected: 동일 공지사항은 한 번만 생성됨
- actual: 공지사항 목록에 동일 공지가 중복 등록되고 서로 다른 NOTICE-TX-xxx transaction_id가 생성됨
- detection: idempotency_key, request_sequence, transaction_ids

## 10. SEC-350
- bugId: site037-bug10
- csvId: SEC-350
- category: business-logic
- family: idempotency
- type: 멱등성 키 누락 (리뷰 입력)
- severity: 상
- endpoint: POST /api/performances/:performanceId/reviews
- condition: 동일 idempotency_key로 공연 리뷰 작성 요청을 두 번 전송
- expected: 동일 리뷰는 한 번만 생성됨
- actual: 관람평 목록에 동일 리뷰가 중복 등록되고 서로 다른 REVIEW-TX-xxx transaction_id가 생성됨
- detection: idempotency_key, request_sequence, transaction_ids
