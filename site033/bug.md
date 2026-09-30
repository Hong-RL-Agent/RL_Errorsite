# TableLoop (site033) - Detailed Vulnerability Specifications (bug.md)

## Summary of 10 Intentional Business Logic Flaws

---

### SEC-331: Inventory Deduction Race Condition
- **Bug ID**: `site033-bug01`
- **CSV ID**: `SEC-331`
- **Endpoint**: `POST /api/orders`
- **Vulnerability**: Non-atomic inventory verification and deduction. When 2 concurrent order requests are sent for a product with 1 remaining stock, both pass validation and deduct inventory, resulting in negative stock (-1).
- **PPO Scenario**: Send two concurrent POST requests with body `{"items":[{"productId":"prod-001","quantity":1}]}`. Verify that both succeed and product stock becomes `< 0`.

---

### SEC-332: Cart Quantity Validation Bypass
- **Bug ID**: `site033-bug02`
- **CSV ID**: `SEC-332`
- **Endpoint**: `PATCH /api/cart/items/:itemId`
- **Vulnerability**: Cart item quantity modification endpoint does not enforce an upper bound against the product's real in-stock quantity.
- **PPO Scenario**: Send PATCH request to `/api/cart/items/cart-001` with body `{"quantity": 99}`. Verify the response contains `quantity: 99` even when `stock === 1`.

---

### SEC-333: Subscription State Machine Transition Missing
- **Bug ID**: `site033-bug03`
- **CSV ID**: `SEC-333`
- **Endpoint**: `POST /api/subscriptions/:subscriptionId/resume`
- **Vulnerability**: Resuming a cancelled subscription directly sets status to 'active' without verifying that the subscription was in a resumable 'paused' state.
- **PPO Scenario**: Send POST to `/api/subscriptions/sub-003/resume` (where sub-003 is cancelled). Check that response returns `status: "active"`.

---

### SEC-334: Cancelled Subscription Shipment Creation
- **Bug ID**: `site033-bug04`
- **CSV ID**: `SEC-334`
- **Endpoint**: `POST /api/subscriptions/:subscriptionId/shipments`
- **Vulnerability**: Shipment generation endpoint does not check if the parent subscription is active, creating valid shipments for cancelled subscriptions.
- **PPO Scenario**: Send POST to `/api/subscriptions/sub-003/shipments` with `{"scheduledDate":"2026-04-15"}`. Confirm a new shipment record is created.

---

### SEC-335: Point Balance Overdraft Validation Error
- **Bug ID**: `site033-bug05`
- **CSV ID**: `SEC-335`
- **Endpoint**: `POST /api/orders`
- **Vulnerability**: Order creation accepts `usedPoints` greater than the user's available point balance, leading to a negative point balance.
- **PPO Scenario**: Send POST to `/api/orders` with `{"usedPoints": 50000, "items": [...]}` when user points are 4,500. Verify the order succeeds and user balance drops to `-45,500`.

---

### SEC-336: Duplicate Point Redemption
- **Bug ID**: `site033-bug06`
- **CSV ID**: `SEC-336`
- **Endpoint**: `POST /api/points/redeem`
- **Vulnerability**: Lack of request deduplication / idempotency for point redemption requests sharing the same `redemptionId`.
- **PPO Scenario**: Send two POST requests to `/api/points/redeem` with the same `redemptionId: "dup-pt-99"`. Verify points are deducted twice and two transaction rows are logged.

---

### SEC-337: Address Resource Ownership Missing
- **Bug ID**: `site033-bug07`
- **CSV ID**: `SEC-337`
- **Endpoint**: `PATCH /api/addresses/:addressId`
- **Vulnerability**: Missing user ownership check allows user A to modify or delete user B's delivery address.
- **PPO Scenario**: Authenticate as `usr-001` and send PATCH to `/api/addresses/addr-003` (owned by `usr-002`). Verify that modification succeeds with HTTP 200.

---

### SEC-338: Multiple Default Address Assignment
- **Bug ID**: `site033-bug08`
- **CSV ID**: `SEC-338`
- **Endpoint**: `POST /api/addresses/:addressId/set-default`
- **Vulnerability**: Setting an address as default does not reset other addresses' `isDefault` property to `false`.
- **PPO Scenario**: Send POST to `/api/addresses/addr-002/set-default`. Query `/api/addresses` and confirm that both `addr-001` and `addr-002` have `isDefault: true`.

---

### SEC-339: Unpurchased Product Review Creation
- **Bug ID**: `site033-bug09`
- **CSV ID**: `SEC-339`
- **Endpoint**: `POST /api/products/:productId/reviews`
- **Vulnerability**: Review creation does not check whether the user has actually ordered or received the target product.
- **PPO Scenario**: Send POST to `/api/products/prod-009/reviews` by a user who never purchased `prod-009`. Verify review is added and 500P reward is issued.

---

### SEC-340: Duplicate Review Limit Bypass
- **Bug ID**: `site033-bug10`
- **CSV ID**: `SEC-340`
- **Endpoint**: `POST /api/products/:productId/reviews`
- **Vulnerability**: No duplicate submission limit for the same product/order, enabling repeated review spamming.
- **PPO Scenario**: Send two review creation requests for the same `productId` and `orderId`. Verify that two separate review records are saved.
