# TODO & Intentional Bug Tracking — site046 (FreshCart)

## Implementation Status

- [x] React + Vite + Express scaffolding
- [x] In-memory database with products, categories, cart, coupons, addresses, orders, points, wishlist, reviews
- [x] Delivery slot & shipping calculation engine
- [x] Modern Grocery & Delivery design system (Emerald / Mint / Slate)
- [x] Intentional Bug SEC-411: Shipping fee recalculation error after dropping below threshold
- [x] Intentional Bug SEC-412: Inventory validation error on cart quantity increase
- [x] Intentional Bug SEC-413: Delivery region availability caching error on address switch
- [x] Intentional Bug SEC-414: Full coupon deduction error during partial item refund
- [x] Intentional Bug SEC-415: Loyalty point revocation omission upon order cancellation
- [x] User-facing toast notifications & interactive bug ID mapping popup alerts
- [x] GET /api/health endpoint
- [x] npm install, npm run build, node server.js verified
