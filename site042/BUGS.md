# BUGS.md — FitFlow (site042) Intentional Business Logic & Consistency Bugs

## SEC-391
bugId: site042-bug01
category: business-logic
family: double-booking
severity: 상
count: 0.8
type: 동일 수업 중복 예약
Korean type: 예약 상태 동시성 오류
feature: 수업 예약
API: POST /api/classes/:id/book
trigger: 잔여 좌석이 1개인 상태에서 동시/반복 예약 요청 시 좌석 초과 예약 발생
precondition: class.remainingSeats == 1
expected behavior: 첫 번째 예약만 승인되고 다음 요청은 좌석 부족으로 거부됨 (remainingSeats == 0)
intended buggy behavior: 원자적 락 부재로 인해 정원(capacity)을 초과하여 복수의 예약이 모두 confirmed 상태로 생성됨
detection criteria: confirmed_bookings > capacity OR remaining_seats < 0

---

## SEC-392
bugId: site042-bug02
category: business-logic
family: stale-state
severity: 상
count: 0.7
type: 가격 상태 불일치
Korean type: 오래된 가격으로 결제
feature: 이용권/상품 결제
API: POST /api/checkout
trigger: 클라이언트가 과거 캐시된 가격(oldPrice)으로 결제 요청을 전송하고 백엔드가 최신 서버 가격과 검증 없이 승인
precondition: client requestedPrice < currentServerPrice
expected behavior: 서버가 최신 가격을 재검증하여 가격 불일치 시 결제 반려 또는 최신 가격 반영
intended buggy behavior: 클라이언트가 전달한 오래된 할인 가격 그대로 결제 처리 승인
detection criteria: final_charge < current_server_price

---

## SEC-393
bugId: site042-bug03
category: data-consistency
family: pagination-state
severity: 중
count: 0.6
type: 페이지네이션 데이터 중복/누락
Korean type: 페이지 이동 상태 불일치
feature: 클래스 목록 탐색
API: GET /api/classes
trigger: 특정 페이지(예: page=3)에서 카테고리 필터 변경 시 page=1로 초기화되지 않고 이전 page 상태 유지
precondition: page > 1 AND category filter changed
expected behavior: 필터 변경 시 자동으로 1페이지로 리셋되고 전체 건수에 맞는 항목 출력
intended buggy behavior: 이전 페이지 번호가 유지되어 필터링된 데이터 범위를 벗어나 빈 페이지나 잘못된 데이터 출력
detection criteria: filter changed + page remains outside valid range

---

## SEC-394
bugId: site042-bug04
category: availability
family: timezone-boundary
severity: 중
count: 0.6
type: 날짜 경계 오류
Korean type: 시간대 변환에 따른 예약 날짜 불일치
feature: 예약 캘린더
API: POST /api/calendar, GET /api/calendar
trigger: 자정 경계 시간(00:00, 00:30) 일정 등록 시 UTC 변환 불일치로 저장된 날짜가 하루 전으로 표시
precondition: time in ['00:00', '00:30', '23:30', '23:59']
expected behavior: 사용자 로컬 시간대(KST) 기준으로 선택한 날짜가 캘린더에 일관되게 표시됨
intended buggy behavior: 자정 부근 시간대 처리 시 날짜가 -1일 변경되어 캘린더 목록에 잘못된 날짜로 등록됨
detection criteria: user_selected_local_date != displayed_reservation_local_date

---

## SEC-395
bugId: site042-bug05
category: business-logic
family: stock-consistency
severity: 상
count: 0.8
type: 장바구니 수량과 재고 불일치
Korean type: 재고 검증 누락
feature: 장바구니/결제
API: POST /api/checkout
trigger: 장바구니에 담긴 수량이 상품의 현재 잔여 재고를 초과한 상태에서 결제 진행
precondition: cart_quantity > current_stock
expected behavior: 결제 시점에 최신 재고를 확인하여 재고 부족 에러 반환
intended buggy behavior: 장바구니 생성 시점의 상태만 신뢰하고 결제 시점 최신 재고 검증을 생략하여 결제 완료
detection criteria: checkout_quantity > current_stock OR final_stock < 0
