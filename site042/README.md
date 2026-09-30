# FitFlow — Fitness & Wellness Class Booking Platform

## 1. Project Overview
* **Site ID**: site042
* **Service Name**: FitFlow
* **Theme**: Fitness & Wellness Class Booking Platform
* **Category**: 피트니스 및 웰니스 수업 예약 플랫폼
* **Tech Stack**: React 18 + Vite 5 + Express 4 + Vanilla CSS
* **Port**: 9941
* **Execution**: Independent execution (`npm run dev`, `npm start`, `npm run build`)

---

## 2. Running Instructions
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run Production Express backend (Port 9941)
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
FitFlow includes exactly 5 realistic business logic and state consistency error flows designed for PPO exploration agents:

1. **SEC-391 (site042-bug01)**: Double-Booking Race Condition (`POST /api/classes/:id/book`)
   - When remaining capacity is 1, concurrent booking checks and non-atomic creation allow bookings to exceed capacity.
2. **SEC-392 (site042-bug02)**: Stale Price Checkout (`POST /api/checkout`)
   - Client submits previously cached product prices without backend verifying current server prices.
3. **SEC-393 (site042-bug03)**: Pagination State Inconsistency (`GET /api/classes`)
   - Changing category filters retains old page state, causing item range mismatch or out-of-bounds queries.
4. **SEC-394 (site042-bug04)**: Timezone Boundary Shift (`POST /api/calendar`, `GET /api/calendar`)
   - Midnight timeslot conversions shift date by -1 day in stored display.
5. **SEC-395 (site042-bug05)**: Cart Quantity vs Stock Consistency (`POST /api/cart`, `POST /api/checkout`)
   - Cart checkout completes without verifying if current stock has dropped below requested quantity.
