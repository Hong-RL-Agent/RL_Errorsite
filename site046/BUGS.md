# BUGS Documentation — site046 (FreshCart)

## Overview
This document records all 5 intentional business logic bugs implemented in `site046` (FreshCart Delivery & Grocery Platform) for PPO agent exploration and verification.

---

### 1. SEC-411: Shipping Fee Recalculation Error
* **Bug ID:** `site046-SEC-411`
* **Type:** Shipping Fee Recalculation Error
* **Severity:** Medium
* **Endpoint:** `GET /api/cart`, `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `GET /api/checkout/summary`
* **Condition:** Cart total reaches free shipping threshold (40,000 KRW), setting shipping fee to 0 KRW. Then, items are deleted or quantities reduced so total drops below 40,000 KRW.
* **Files:** `server.js` (`calculateCart`)
* **Location:** `server.js` line ~235
* **Selector:** `.qty-btn`, `.summary-row`, `button[title="삭제"]`
* **Symptom:** Shipping fee remains 0 KRW instead of reverting to 3,000 KRW when cart total falls below free shipping threshold.
* **Status:** Open (Intentional)
* **Example:**
  - Initial cart: 45,600 KRW -> Shipping: 0 KRW.
  - Delete 1 item -> Total: 15,800 KRW -> Shipping fee remains 0 KRW!
* **Cause:** Server sets `hasEverReachedFreeShipping = true` and fails to reset `shippingFee` when `itemsTotal < FREE_SHIPPING_THRESHOLD`.
* **PPO Expected Behavior:**
  1. Add items to cart to reach 40,000 KRW.
  2. Inspect cart summary (`shippingFee == 0`).
  3. Delete items or decrease quantity below 40,000 KRW.
  4. Detect `cart_total < 40000 AND shipping_fee == 0`.

---

### 2. SEC-412: Inventory Validation Error on Cart Quantity Change
* **Bug ID:** `site046-SEC-412`
* **Type:** Inventory Validation Error
* **Severity:** High
* **Endpoint:** `PATCH /api/cart/items/:id`, `POST /api/orders`
* **Condition:** Item in cart has limited stock (e.g. 4 units). User increases quantity to 10 units via cart quantity modifier.
* **Files:** `server.js` (`PATCH /api/cart/items/:id`)
* **Location:** `server.js` line ~318
* **Selector:** `.qty-control .qty-btn`
* **Symptom:** Server accepts quantities exceeding available stock without throwing validation error.
* **Status:** Open (Intentional)
* **Example:**
  - `한돈 냉동 삼겹살` stock is 4.
  - In cart, clicking `+` to reach quantity 5+.
  - Server accepts quantity 5+ and returns 200 OK.
* **Cause:** Quantity update route `PATCH /api/cart/items/:id` omits `if (newQty > product.stock)` validation check.
* **PPO Expected Behavior:**
  1. Search for low stock item (`stock: 4`).
  2. Add 1 item to cart.
  3. Increase quantity in cart beyond stock (`quantity: 5`).
  4. Detect `requested_quantity > available_stock AND cart_update_success == true`.

---

### 3. SEC-413: Delivery Region Validation Error
* **Bug ID:** `site046-SEC-413`
* **Type:** Delivery Region Validation Error
* **Severity:** High
* **Endpoint:** `PATCH /api/checkout/address`, `GET /api/delivery/availability`, `POST /api/orders`
* **Condition:** Initial checkout address is deliverable (e.g. Seoul). User selects an undeliverable address (e.g. Jeju / Gangwon mountain region).
* **Files:** `server.js` (`PATCH /api/checkout/address`)
* **Location:** `server.js` line ~420
* **Selector:** `.address-item-card`
* **Symptom:** Checkout maintains cached `isDeliverable = true` state despite selecting an address in an undeliverable delivery region.
* **Status:** Open (Intentional)
* **Example:**
  - Initial address: Seoul (Deliverable: true).
  - Select address: Jeju Island (Deliverable: false).
  - Checkout session returns `isDeliverable: true`.
* **Cause:** `checkoutSession.cachedDeliverableState` is not updated to `targetAddr.isDeliverable` when changing addresses.
* **PPO Expected Behavior:**
  1. Start checkout with valid Seoul address.
  2. Change delivery address to Jeju address.
  3. Detect `current_address.isDeliverable == false AND checkout_delivery_available == true`.

---

### 4. SEC-414: Partial Refund Calculation Error
* **Bug ID:** `site046-SEC-414`
* **Type:** Partial Refund Calculation Error
* **Severity:** High
* **Endpoint:** `POST /api/orders/:id/refund`, `GET /api/refunds/:id`
* **Condition:** Order contains multiple items and a coupon discount (e.g. 5,000 KRW). User requests a partial refund for a single item.
* **Files:** `server.js` (`POST /api/orders/:id/refund`)
* **Location:** `server.js` line ~535
* **Selector:** `button:has-text("부분 환불신청")`, `button:has-text("환불 확정 요청")`
* **Symptom:** The entire order's coupon discount amount is deducted from the single refunded item's refund amount.
* **Status:** Open (Intentional)
* **Example:**
  - Order has 3 items with 5,000 KRW coupon discount.
  - Partial refund for item priced at 6,900 KRW.
  - Server calculates refund as `6,900 - 5,000 = 1,900 KRW` instead of proportional discount (~6,087 KRW).
* **Cause:** Refund handler uses `singleItemTotal - order.couponDiscount` instead of proportional distribution.
* **PPO Expected Behavior:**
  1. Place an order with coupon discount and multiple items.
  2. Open Order Detail / Orders page.
  3. Request partial refund for 1 item.
  4. Detect `refund_amount != expected_proportional_refund`.

---

### 5. SEC-415: Loyalty Point State Error on Order Cancellation
* **Bug ID:** `site046-SEC-415`
* **Type:** Loyalty Point State Error
* **Severity:** Medium
* **Endpoint:** `POST /api/orders/:id/cancel`, `GET /api/points`
* **Condition:** Order earned loyalty points upon placement. User cancels the order.
* **Files:** `server.js` (`POST /api/orders/:id/cancel`)
* **Location:** `server.js` line ~495
* **Selector:** `button:has-text("전체 주문 취소")`
* **Symptom:** Order cancellation succeeds, but earned loyalty points remain in user's balance and are not revoked.
* **Status:** Open (Intentional)
* **Example:**
  - User has 3,500P. Order placed earns +375P -> Balance: 3,875P.
  - Order is cancelled -> Status: `CANCELLED`, but balance remains 3,875P!
* **Cause:** `POST /api/orders/:id/cancel` does not deduct `order.earnedPoints` from `userPoints.balance`.
* **PPO Expected Behavior:**
  1. Complete an order that earns points.
  2. Check point balance (`+earnedPoints`).
  3. Cancel the order.
  4. Detect `order_cancelled == true AND earned_points_remain == true`.
