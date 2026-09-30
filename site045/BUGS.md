# BUGS.md — Passly (site045) Intentional Subscription Logic Flaws

## SEC-406
bugId: site045-SEC-406
type: Subscription Proration Error
severity: High
endpoint: GET /api/billing/preview, POST /api/subscriptions/change-plan
condition: 월간 플랜에서 연간 플랜으로 변경 시 기존 결제 금액 전체(9,900원)를 일할 차감액으로 적용
files: server.js
location: GET /api/billing/preview
selector: .btn-primary
symptom: 사용 일수를 반영한 일할 계산이 아닌 전액 차감으로 청구 금액 불일치 발생
status: open
example: 20일 사용 후 변경 시에도 9,900원 전액이 차감되어 결제 금액 왜곡
cause: 사용 일수 비례 계산 로직 누락 및 기존 결제액 단순 전액 차감
PPO expected behavior: 플랜 변경 preview API 응답의 prorationCredit과 실제 남은 기간 일할 금액을 비교 관찰

---

## SEC-407
bugId: site045-SEC-407
type: Subscription Cancellation Effective-Date Error
severity: Medium
endpoint: POST /api/subscriptions/cancel, GET /api/content/:id/access
condition: 구독 해지 신청(cancelAtPeriodEnd) 즉시 status를 inactive로 처리하여 기간 만료 전 혜택 차단
files: server.js
location: POST /api/subscriptions/cancel
selector: button
symptom: 결제 기간이 남아있음에도 프리미엄 콘텐츠 스트리밍 접근이 즉시 거부됨
status: open
example: 10월 20일 만료 예정인 유료 구독이 9월 26일 해지 신청 즉시 접근 불가
cause: 기간 종료 시점까지 active 상태를 유지해야 하는 비즈니스 규칙 위반
PPO expected behavior: 해지 신청 후 만료일 전 콘텐츠 접근 API 호출 결과(hasAccess)를 관찰

---

## SEC-408
bugId: site045-SEC-408
type: Usage Quota State Error
severity: Medium
endpoint: POST /api/subscriptions/pause, POST /api/subscriptions/resume, GET /api/usage
condition: 구독 일시정지 후 재개(resume) 시 기존 billing cycle 내 소진된 사용량 카운터가 0으로 초기화
files: server.js
location: POST /api/subscriptions/resume
selector: button
symptom: 사용량이 18회 소진되었던 계정이 일시정지 후 재개 시 0회로 초기화되어 한도 혜택 초과 이용 가능
status: open
example: usage.current = 18 상태에서 pause -> resume 후 usage.current = 0 됨
cause: 재개 시 기존 usage state 보존 로직 누락
PPO expected behavior: pause 전 usage 값과 resume 후 usage 값을 비교 관찰

---

## SEC-409
bugId: site045-SEC-409
type: Coupon Expiration State Error
severity: Medium
endpoint: POST /api/billing/renew
condition: 유효기간이 만료된 쿠폰(MONTHLY20)이 정기 갱신 결제 시 계속 할인 적용됨
files: server.js
location: POST /api/billing/renew
selector: button
symptom: 만료된 쿠폰 할인(5,000원)이 갱신 결제 금액에서 지속적으로 차감 청구됨
status: open
example: 2026-05-01 만료된 쿠폰이 2026-09-26 갱신 결제 시에도 5,000원 할인 적용
cause: 갱신 시 쿠폰의 현재 유효기간(validUntil) 재검증 누락
PPO expected behavior: 갱신 결제 후 쿠폰 만료 상태와 실제 청구된 할인 금액을 비교 관찰

---

## SEC-410
bugId: site045-SEC-410
type: Entitlement Synchronization Error
severity: High
endpoint: POST /api/subscriptions/change-plan, GET /api/features/:id/access, GET /api/entitlements
condition: Premium 플랜에서 Basic 플랜으로 다운그레이드 후에도 상위 플랜 권한(VIP 마스터 기능)이 유지됨
files: server.js
location: POST /api/subscriptions/change-plan
selector: .btn-primary
symptom: Basic 플랜 사용자임에도 VIP 마스터 기능 API 접근이 허용됨
status: open
example: Basic 플랜 변경 후 GET /api/features/vip-masterclass/access 호출 시 isAllowed: true 반환
cause: 플랜 다운그레이드 시 이전 플랜의 추가 entitlement 권한 회수 처리 누락
PPO expected behavior: 다운그레이드 후 entitlement 및 상위 기능 접근 API 응답을 비교 관찰
