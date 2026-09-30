# PawMate (site034) - Vulnerability Registry (BUGS.md)

| bugId | csvId | Category | Family | Type | 한국어 유형 | 발생 기능 | 발생 API |
|---|---|---|---|---|---|---|---|
| site034-bug01 | SEC-351 | Business Logic | Booking Availability | Double Booking | 예약 시간 중복 검증 누락 | 돌봄 서비스 예약 | `POST /api/bookings` |
| site034-bug02 | SEC-352 | Business Logic | Cancellation and Refund | Duplicate Refund Credit | 예약 취소 후 환불 포인트 중복 처리 오류 | 예약 취소 및 환불 처리 | `POST /api/bookings/:id/refund` |
| site034-bug03 | SEC-353 | Business Logic | Coupon Usage | Coupon Reuse Limit Bypass | 쿠폰 사용 횟수 제한 검증 오류 | 주문 생성 및 쿠폰 적용 | `POST /api/coupons/:id/apply`, `POST /api/orders` |
| site034-bug04 | SEC-354 | Business Logic | Order Pricing | Client-Controlled Total Amount | 주문 금액 계산 오류 | 용품 주문 생성 | `POST /api/orders` |
| site034-bug05 | SEC-355 | Business Logic | Resource Ownership | Pet Ownership Validation Missing | 반려동물 소유권 검증 누락 | 반려동물 정보 수정 및 삭제 | `PATCH /api/pets/:id`, `DELETE /api/pets/:id` |

---

## 취약점 상세 정보

### 1. SEC-351 (site034-bug01)
- **발생 API**: `POST /api/bookings`
- **발생 조건**: 특정 돌봄 제공자의 동일한 날짜와 시간대에 이미 확정된 예약이 존재하는 상황에서 신규 예약 요청 전송
- **기대 동작**: 기존 예약과 시간대가 겹치면 예약 가능 여부 검증에 실패하고 에러 반환
- **취약 동작**: 시간대 중복 검증 로직이 누락되어 동일 제공자에게 동일 시간대의 중복 예약이 생성됨
- **탐지 기준**: 동일 제공자/일자/시간대로 반복 요청 시 중복 예약 레코드가 생성됨

### 2. SEC-352 (site034-bug02)
- **발생 API**: `POST /api/bookings/:bookingId/refund`
- **발생 조건**: 취소된 예약 건에 대해 환불 포인트 지급 요청을 2회 이상 반복 전송
- **기대 동작**: 1회 환불 완료 후 추가 환불 요청은 거부되어야 함
- **취약 동작**: 환불 완료 여부 검증이 누락되어 요청할 때마다 환불 포인트가 계속 지급됨
- **탐지 기준**: 동일 예약 ID에 대해 환불 요청 2회 전송 후 포인트 잔액이 2배로 적립됨

### 3. SEC-353 (site034-bug03)
- **발생 API**: `POST /api/coupons/:couponId/apply`
- **발생 조건**: `usageLimit: 1`인 1회 한정 쿠폰에 대해 적용 요청을 2회 이상 전송
- **기대 동작**: 최대 사용 횟수(1회)에 도달하면 추가 사용이 거부되어야 함
- **취약 동작**: `usedCount` 검증이 누락되어 쿠폰이 무제한 반복 적용됨
- **탐지 기준**: 동일 쿠폰에 대해 반복 적용 성공 및 `usedCount > usageLimit` 확인

### 4. SEC-354 (site034-bug04)
- **발생 API**: `POST /api/orders`
- **발생 조건**: 주문 요청 Body에 실제 상품 금액과 다른 임의의 `totalAmount` 필드(예: 1,000원)를 전달
- **기대 동작**: 서버가 상품 단가와 수량을 재계산하여 올바른 금액으로 결제해야 함
- **취약 동작**: 클라이언트가 전달한 변조 금액을 그대로 신뢰하여 1,000원에 주문이 생성됨
- **탐지 기준**: 주문 상품 정가 합계와 주문 생성 결과의 `totalAmount`가 불일치

### 5. SEC-355 (site034-bug05)
- **발생 API**: `PATCH /api/pets/:petId`
- **발생 조건**: 사용자 A(usr-001)가 사용자 B(usr-002)의 반려동물 ID(pet-003)에 대해 수정 요청 전송
- **기대 동작**: 소유권 검증에 실패하여 `403 Forbidden` 또는 `404 Not Found` 에러 반환
- **취약 동작**: 소유권 검증 없이 타 사용자의 반려동물 정보가 수정됨
- **탐지 기준**: 다른 사용자의 반려동물 정보가 정상 수정되고 변경사항이 반영됨
