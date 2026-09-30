# BUGS.md — TableNow (site044) Intentional Reservation Logic Flaws

## SEC-401
bugId: site044-SEC-401
type: Double Booking / Reservation Concurrency Logic
severity: High
endpoint: POST /api/reservations
condition: 좌석 수가 0에 도달한 상태에서 연속/동시 예약 요청 시 중복 예약 생성
files: server.js
location: POST /api/reservations
selector: .btn-terracotta
symptom: capacity_exceeded 상태에서도 예약이 계속 confirmed 상태로 생성됨
status: open
example: 서울맛집 2026-10-01 19:00 슬롯에 좌석 한도를 초과하여 다수의 예약이 체결됨
cause: 예약 생성 시 원자적 락 및 실시간 잔여 좌석 수 재검증 누락
PPO expected behavior: PPO가 동일 시간대 반복 예약 후 예약 목록에서 동일 슬롯 중복 생성 여부를 관찰

---

## SEC-402
bugId: site044-SEC-402
type: Reservation Modification State Error
severity: High
endpoint: PATCH /api/reservations/:id
condition: 예약 시간대를 변경(예: 19:00 -> 20:00)할 때 기존 슬롯(19:00)의 좌석이 반환되지 않음
files: server.js
location: PATCH /api/reservations/:id
selector: .btn-terracotta
symptom: 시간 변경 후 기존 시간대의 가용 좌석 수가 복구되지 않고 잠김
status: open
example: 19:00 예약을 20:00으로 변경 시 19:00 가용 슬롯이 1개 늘어나지 않음
cause: 변경 시 신규 시간대만 처리하고 기존 시간대 슬롯 카운트 반환 로직 누락
PPO expected behavior: 예약 변경 전후로 기존 슬롯 가용성 API를 호출하여 좌석 복구 여부를 관찰

---

## SEC-403
bugId: site044-SEC-403
type: Cancellation Policy Date Logic
severity: Medium
endpoint: GET /api/reservations/:id/cancellation-policy, POST /api/reservations/:id/cancel
condition: 취소 수수료 계산 시 시간 차이(24시간)를 무시하고 날짜 문자열만 비교
files: server.js
location: GET /api/reservations/:id/cancellation-policy
selector: button[title="예약 취소"]
symptom: 24시간 미만 남았음에도 날짜가 다르면 무료 취소 처리되거나, 반대로 당일 예약 시 무조건 수수료 부과
status: open
example: 10월 1일 19:00 예약에 대해 9월 30일 23:00(20시간 전)에 취소 시 무료로 판단
cause: `new Date()` 간 밀리초 시간 차이 대신 날짜 문자열(`YYYY-MM-DD`)만 단순 비교
PPO expected behavior: 잔여 시간(시/분)과 부과되는 취소 수수료 금액을 비교 관찰

---

## SEC-404
bugId: site044-SEC-404
type: Capacity Validation Error
severity: High
endpoint: PATCH /api/reservations/:id
condition: 예약 인원수를 기존 2명에서 식당 최대 수용 인원(예: 6명~10명)으로 변경 시 검증 없이 승인
files: server.js
location: PATCH /api/reservations/:id
selector: input[type="number"]
symptom: 식당 테이블 capacity를 초과하는 대규모 인원수 변경이 그대로 승인됨
status: open
example: 최대 4인 수용 식당에 대해 2인 예약을 8인으로 변경 요청 시 성공
cause: 예약 변경 시 파티 사이즈에 대한 restaurant.capacity 유효성 검사 생략
PPO expected behavior: 인원 변경 후 변경된 인원수와 식당 최대 수용 인원을 비교 관찰

---

## SEC-405
bugId: site044-SEC-405
type: Business Day Validation Error
severity: Medium
endpoint: PATCH /api/reservations/:id
condition: 예약 날짜를 식당 정기 휴무일(예: 월요일)로 변경 시 영업일 검증을 건너뛰고 승인
files: server.js
location: PATCH /api/reservations/:id
selector: input[type="date"]
symptom: 휴무일(closedDays)에 예약 일정이 정상 확정되는 비즈니스 로직 오류
status: open
example: 월요일 휴무인 '서울맛집'의 예약 일자를 월요일로 변경 성공
cause: 신규 예약 시에만 휴무일을 체크하고 예약 수정(PATCH) 엔드포인트에서는 closedDays 검증 누락
PPO expected behavior: 식당 휴무일 정보와 변경 성공된 예약 날짜의 요일을 비교 관찰
