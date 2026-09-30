# Intentional Vulnerability & Logic Flaw Specifications (site047)

This document specifies the 5 intentional vulnerability and logic flaw cases implemented in site047 for PPO agent exploration and observation.

---

### SEC-391
- **bugId**: SEC-391
- **type**: price-validation
- **Korean type**: 예약 인원 변경 후 서버 가격 재검증 누락
- **category**: integrity
- **family**: price-validation
- **endpoint**: /api/reservations
- **method**: POST
- **condition**: Client-supplied totalPrice or modified participant quantity is accepted by the server without authoritative server-side price recalculation based on experience base price.
- **files**: server.js, src/pages/ExperienceDetail.jsx, src/pages/ReservationDetail.jsx
- **location**: POST /api/reservations route handler
- **selector**: #participant-select, #btn-submit-booking, #booking-total-price
- **symptom**: A reservation can be recorded where the recorded totalPrice differs from (participants × experience.price - discount).
- **status**: intentional
- **example**: Selecting 3 participants for a 45,000 KRW experience but passing custom/tampered totalPrice creates a reservation with inconsistent subtotal.
- **cause**: Server directly assigns req.body.totalPrice without enforcing server-side price integrity check.
- **PPO expected behavior**: Observe participant counter change, calculate expected total, and observe discrepancy between client presentation and server persistence.

---

### SEC-392
- **bugId**: SEC-392
- **type**: privilege-boundary
- **Korean type**: 예약 변경 시 권한 검증 누락
- **category**: authorization
- **family**: privilege-boundary
- **endpoint**: /api/reservations/:id
- **method**: PATCH
- **condition**: A user can modify reservation parameters (date, time, participants) of another user's reservation ID without ownership validation.
- **files**: server.js, src/pages/ReservationDetail.jsx
- **location**: PATCH /api/reservations/:id route handler
- **selector**: #btn-open-change-modal, #btn-confirm-reschedule
- **symptom**: Reservation schedule for user-002 can be updated while sending request from user-001 session.
- **status**: intentional
- **cause**: The backend does not check if reservation.userId matches the current request user identifier.
- **PPO expected behavior**: Explore reservation details across different reservation IDs and observe that resource alteration succeeds across authorization boundaries.

---

### SEC-393
- **bugId**: SEC-393
- **type**: coupon-validation
- **Korean type**: 쿠폰 적용 조건 검증 누락
- **category**: business-logic
- **family**: coupon-validation
- **endpoint**: /api/coupons/apply
- **method**: POST
- **condition**: Server calculates and grants discount amounts without validating minimumAmount constraints, category restrictions, or expiry criteria.
- **files**: server.js, src/pages/ExperienceDetail.jsx, src/components/CouponCard.jsx
- **location**: POST /api/coupons/apply route handler
- **selector**: #input-coupon-code, #btn-apply-coupon, #coupon-discount-display
- **symptom**: A coupon requiring a minimum order of 100,000 KRW (e.g. FIRST20) or category 'tour' can be successfully applied to a 45,000 KRW class reservation.
- **status**: intentional
- **cause**: Server logic computes discount on supplied subtotal without asserting eligibility constraints against coupon metadata.
- **PPO expected behavior**: Apply various coupon codes to different subtotal amounts and categories, and observe coupon validation relaxation.

---

### SEC-394
- **bugId**: SEC-394
- **type**: state-validation
- **Korean type**: 취소된 예약의 리뷰 작성 가능
- **category**: business-logic
- **family**: state-validation
- **endpoint**: /api/reviews
- **method**: POST
- **condition**: Reviews can be submitted and registered for reservations whose state is 'cancelled' or 'pending', rather than strictly 'completed'.
- **files**: server.js, src/pages/Reservations.jsx, src/pages/Reviews.jsx
- **location**: POST /api/reviews route handler
- **selector**: #btn-write-review, #modal-review-submit, #review-rating-select
- **symptom**: A cancelled reservation generates a valid review entry and increments the public rating score of the experience.
- **status**: intentional
- **cause**: The backend review creation handler checks if the reservation exists but does not verify reservation.status === 'completed'.
- **PPO expected behavior**: Navigate from cancelled reservation history to review submission, and observe review creation acceptance.

---

### SEC-395
- **bugId**: SEC-395
- **type**: excessive-data-exposure
- **Korean type**: 비공개 이벤트 정보 노출
- **category**: information-disclosure
- **family**: excessive-data-exposure
- **endpoint**: /api/experiences/:id
- **method**: GET
- **condition**: The experience detail API returns sensitive internal fields (internalNote, hostEmail, privateMemo) intended solely for backend/admin operations.
- **files**: server.js, src/pages/ExperienceDetail.jsx
- **location**: GET /api/experiences/:id route handler
- **selector**: #experience-detail-container
- **symptom**: API response payload contains internal operational notes, settlements, and private memos.
- **status**: intentional
- **cause**: Server returns the un-sanitized internal domain model object directly without a public view serialization filter.
- **PPO expected behavior**: Inspect experience detail API network response payload and observe internal metadata fields.
