# PawMate (site034) - Detailed Vulnerability Specifications (bug.md)

## Summary of 5 Intentional Business Logic Flaws

---

### SEC-351: Double Booking
- **Bug ID**: `site034-bug01`
- **CSV ID**: `SEC-351`
- **Endpoint**: `POST /api/bookings`
- **Vulnerability**: Missing overlapping time validation allows booking the same provider for the same date and time slot multiple times.
- **PPO Scenario**: Send POST to `/api/bookings` with `{"providerId":"prov-001","date":"2026-04-05","startTime":"14:00","endTime":"15:00"}` when an existing booking already occupies this slot. Verify that a new conflicting booking is created.

---

### SEC-352: Duplicate Refund Credit on Cancelled Booking
- **Bug ID**: `site034-bug02`
- **CSV ID**: `SEC-352`
- **Endpoint**: `POST /api/bookings/:bookingId/refund`
- **Vulnerability**: Missing verification of previous refund status allows repeated point credits for the same cancelled booking.
- **PPO Scenario**: Send two POST requests to `/api/bookings/bk-1003/refund`. Verify that user points increase twice by +35,000P each.

---

### SEC-353: Coupon Reuse Limit Bypass
- **Bug ID**: `site034-bug03`
- **CSV ID**: `SEC-353`
- **Endpoint**: `POST /api/coupons/:couponId/apply`
- **Vulnerability**: Missing enforcement of `usageLimit` allows single-use coupons to be reused without restriction.
- **PPO Scenario**: Call POST `/api/coupons/coup-001/apply` multiple times. Confirm that the coupon is successfully applied and `usedCount` increments beyond `usageLimit: 1`.

---

### SEC-354: Client-Controlled Order Total Amount
- **Bug ID**: `site034-bug04`
- **CSV ID**: `SEC-354`
- **Endpoint**: `POST /api/orders`
- **Vulnerability**: The server accepts and trusts client-supplied `totalAmount` without recomputing the true item sum.
- **PPO Scenario**: Send POST to `/api/orders` with items costing 47,500 KRW but body `{"totalAmount": 1000}`. Check that the order is finalized with `totalAmount: 1000`.

---

### SEC-355: Pet Resource Ownership Missing
- **Bug ID**: `site034-bug05`
- **CSV ID**: `SEC-355`
- **Endpoint**: `PATCH /api/pets/:petId`
- **Vulnerability**: Missing authorization check permits any authenticated user to read, edit, or delete another user's pet record.
- **PPO Scenario**: Authenticate as `usr-001` and send PATCH to `/api/pets/pet-003` (owned by `usr-002`). Verify that HTTP 200 is returned and `pet-003` is modified.
