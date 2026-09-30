# Detailed Intentional Bugs Specification (site042: FitFlow)

### Bug ID: SEC-391 (site042-bug01)
- **Category**: business-logic
- **Family**: double-booking
- **Trigger**: Click booking on a class with remainingSeats=1, submit duplicate or concurrent booking requests.
- **Precondition**: `class.remainingSeats === 1`, capacity limit reached.
- **User Action**: Open Class Booking modal -> Select date/time -> Click "수업 예약 확정하기".
- **API Request**: `POST /api/classes/:id/book`
- **Expected State**: First request succeeds (`remainingSeats` becomes 0), second concurrent request fails with 400 Out of Seats.
- **Actual State**: Both booking requests succeed, resulting in `confirmed_bookings > capacity`.
- **Relevant DOM**: Class cards remaining seats badge, modal submit button, booking history table.
- **Detection Signal**: `confirmed_bookings > capacity` or `remaining_seats < 0`.

---

### Bug ID: SEC-392 (site042-bug02)
- **Category**: business-logic
- **Family**: stale-state
- **Trigger**: Checkout product sending stale/cached discount price.
- **Precondition**: `requestedPrice < currentServerPrice`.
- **User Action**: Click "바로구매" -> Check "이전 장바구니/캐시 적용 가격으로 결제 요청" -> Click "주문 승인 및 결제하기".
- **API Request**: `POST /api/checkout` with `{ requestedPrice: oldPrice }`
- **Expected State**: Server rejects stale price and prompts user to refresh price.
- **Actual State**: Server approves transaction with stale requested price.
- **Relevant DOM**: Product price display, checkout modal total charge.
- **Detection Signal**: `final_charge < current_server_price`.

---

### Bug ID: SEC-393 (site042-bug03)
- **Category**: data-consistency
- **Family**: pagination-state
- **Trigger**: Navigate to page 3 or 4 in All classes, then switch category tab to e.g. "필라테스".
- **Precondition**: `page > 1` and filtered category total items < `page * pageSize`.
- **User Action**: Click pagination button 3 -> Click category tab "필라테스".
- **API Request**: `GET /api/classes?category=pilates&page=3`
- **Expected State**: Reset page to 1 automatically when changing filters.
- **Actual State**: Retains `page=3`, displaying empty results or out-of-range pagination metadata.
- **Relevant DOM**: Category tab buttons, pagination numbers, class card grid.
- **Detection Signal**: Filter changed with `page > totalPages` or empty data display.

---

### Bug ID: SEC-394 (site042-bug04)
- **Category**: availability / state-consistency
- **Family**: timezone-boundary
- **Trigger**: Create schedule with midnight/late timeslot (00:00, 00:30, 23:30).
- **Precondition**: Timeslot is on midnight boundary.
- **User Action**: Navigate to Calendar -> Select Date (e.g. `2026-10-01`) -> Select Time `00:30` -> Click "캘린더에 일정 등록하기".
- **API Request**: `POST /api/calendar` with `{ date: "2026-10-01", time: "00:30" }`
- **Expected State**: Event displayed on requested date `2026-10-01`.
- **Actual State**: Event stored and displayed as `2026-09-30` due to UTC offset shift.
- **Relevant DOM**: Calendar schedule card date display.
- **Detection Signal**: `user_selected_local_date != displayed_reservation_local_date`.

---

### Bug ID: SEC-395 (site042-bug05)
- **Category**: business-logic
- **Family**: stock-consistency
- **Trigger**: Checkout cart containing item quantity exceeding current stock.
- **Precondition**: `item.quantity > product.stock`.
- **User Action**: Add item to Cart (e.g. 3 quantity for item with stock=1) -> Go to Cart -> Click "바로 결제하기".
- **API Request**: `POST /api/checkout`
- **Expected State**: Server rejects checkout due to insufficient inventory.
- **Actual State**: Checkout completes successfully without current inventory validation.
- **Relevant DOM**: Cart item count, checkout button, stock badge.
- **Detection Signal**: `checkout_quantity > current_stock` or `final_stock < 0`.
