# Roomly — Home Interior & Furniture Marketplace

## 1. Project Overview
* **Site ID**: site043
* **Service Name**: Roomly
* **Theme**: Home Interior & Furniture Marketplace
* **Category**: 홈 인테리어 및 가구 쇼핑 플랫폼
* **Tech Stack**: React 18 + Vite 5 + Express 4 + Vanilla CSS
* **Port**: 9942
* **Execution**: Independent execution (`npm run dev`, `npm start`, `npm run build`)

---

## 2. Running Instructions
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run Production Express backend (Port 9942)
npm start

# Build production bundle
npm run build
```

---

## 3. Health Check
* `GET /api/health`
```json
{
  "status": "ok"
}
```

---

## 4. Business Logic & State Consistency Vulnerability Specs
Roomly includes exactly 5 realistic business logic and state consistency error flows designed for PPO exploration agents:

1. **SEC-396 (site043-bug01)**: Coupon Stacking Restriction Bypass (`POST /api/checkout`, `POST /api/cart/coupon`)
   - Backend accepts multiple non-stackable coupons without checking restriction, exceeding allowable discount.
2. **SEC-397 (site043-bug02)**: Stale Cart Checkout of Discontinued Product (`POST /api/checkout`, `POST /api/cart`)
   - Items added to cart that later become `discontinued` are still allowed to complete checkout without real-time active status verification.
3. **SEC-398 (site043-bug03)**: Wishlist State Inconsistency (`GET /api/wishlist`, `POST /api/wishlist`)
   - Wishlist endpoint caches initial `active` status and allows purchasing discontinued items from wishlist.
4. **SEC-399 (site043-bug04)**: Invalid Order State Transition (`PATCH /api/orders/:id/status`, `POST /api/orders/:id/cancel`)
   - An order that has been cancelled is transitioned into `shipped` or `preparing` state without validation.
5. **SEC-400 (site043-bug05)**: Review Authorization State Flaw (`POST /api/reviews`, `GET /api/reviews/eligibility`)
   - Reviews are accepted for products from cancelled or non-delivered orders without server-side verification.
