# Detailed Intentional Bugs Specification (site043: Roomly)

### Bug ID: SEC-396 (site043-bug01)
- **Category**: business-logic
- **Family**: coupon-stacking
- **Trigger**: Select multiple non-stackable coupons in Checkout (e.g. WELCOME10 + FURNITURE20) and submit order.
- **Precondition**: `selectedCoupons.length > 1`.
- **User Action**: Open Cart -> Click "주문서 작성 및 결제하기" -> Select both "신규 가입 환영 10% 할인" & "가구 전용 20,000원 즉시 할인" -> Click "결제하기".
- **API Request**: `POST /api/checkout` with `couponIds: ["WELCOME10", "FURNITURE20"]`
- **Expected State**: Rejects multi-coupon selection or applies only 1 non-stackable coupon.
- **Actual State**: Calculates and applies total discount summing both coupons together.
- **Relevant DOM**: Coupon checkbox list, total discount amount, final payment sum.
- **Detection Signal**: `total_discount > single_max_coupon_discount` on non-stackable coupon set.

---

### Bug ID: SEC-397 (site043-bug02)
- **Category**: business-logic
- **Family**: stale-cart
- **Trigger**: Checkout cart containing item `prod-107` (빈티지 원목 회전 북타워 책장, status: discontinued).
- **Precondition**: Cart item product status is `discontinued`.
- **User Action**: Open Cart -> Click "주문서 작성 및 결제하기" -> Complete Checkout.
- **API Request**: `POST /api/checkout`
- **Expected State**: Server returns 400 with "단종된 상품이 포함되어 있습니다." and prevents checkout.
- **Actual State**: Server completes order creation with status `confirmed` including discontinued item.
- **Relevant DOM**: Cart item card, order confirmation card.
- **Detection Signal**: `current_product_status == 'discontinued'` AND `order_status == 'confirmed'`.

---

### Bug ID: SEC-398 (site043-bug03)
- **Category**: state-consistency
- **Family**: wishlist-state
- **Trigger**: View wishlist and click "바로구매" on item `prod-107`.
- **Precondition**: `prod-107` is discontinued, but wishlist API returns status `active`.
- **User Action**: Navigate to Wishlist -> Locate `prod-107` -> Click "바로구매".
- **API Request**: `GET /api/wishlist`, `POST /api/wishlist`
- **Expected State**: Wishlist displays "판매종료" badge and disables direct purchase button.
- **Actual State**: Wishlist displays item as normal active product and initiates purchase flow.
- **Relevant DOM**: Wishlist item card, purchase button.
- **Detection Signal**: `product_status == 'discontinued'` but `wishlist_status == 'active'`.

---

### Bug ID: SEC-399 (site043-bug04)
- **Category**: order-state
- **Family**: invalid-state-transition
- **Trigger**: Click "물류 출고 배송중 전환" on a cancelled order (`ORD-20261001-8841`).
- **Precondition**: `order.status == 'cancelled'`.
- **User Action**: Navigate to Orders -> Find cancelled order -> Click "물류 출고 배송중 전환".
- **API Request**: `PATCH /api/orders/:id/status` with `{ status: "shipped" }`
- **Expected State**: State transition from `cancelled` to `shipped` is rejected with 400 Invalid State Transition.
- **Actual State**: Order status updates to `shipped` (배송중).
- **Relevant DOM**: Order status badge in Orders page.
- **Detection Signal**: `previous_status == 'cancelled'` AND `current_status == 'shipped'`.

---

### Bug ID: SEC-400 (site043-bug05)
- **Category**: business-logic
- **Family**: authorization-state
- **Trigger**: Submit a product review for `prod-103` (an item from a cancelled order).
- **Precondition**: User does not have a `delivered` order for `prod-103`.
- **User Action**: Navigate to Reviews -> Select `prod-103 (취소 주문 건)` -> Enter rating and content -> Click "포토/텍스트 후기 등록하기".
- **API Request**: `POST /api/reviews` with `{ productId: "prod-103", canReview: true }`
- **Expected State**: Server rejects review submission with 403 Forbidden (Only delivered buyers can review).
- **Actual State**: Server creates review without delivered purchase verification.
- **Relevant DOM**: Review submission form and reviews community list.
- **Detection Signal**: `order_status != 'delivered'` AND `review_created == true`.
