# TableNow — Restaurant Reservation Platform

## 1. Project Overview
* **Site ID**: site044
* **Service Name**: TableNow
* **Theme**: Restaurant Reservation Platform
* **Port**: 9943
* **Tech Stack**: React 18 + Vite 5 + Express 4 + Vanilla CSS
* **Execution**: Independent execution (`npm run dev`, `npm start`, `npm run build`)

---

## 2. Running Instructions
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run Production Express backend (Port 9943)
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

## 4. Intentional Business Logic & Reservation Flaws
TableNow includes exactly 5 realistic restaurant reservation business logic bugs:

1. **SEC-401 (site044-SEC-401)**: Double-Booking / Reservation Concurrency Logic (`POST /api/reservations`)
   - Concurrent or repeated reservations succeed without atomic capacity verification.
2. **SEC-402 (site044-SEC-402)**: Old Slot Capacity Not Restored (`PATCH /api/reservations/:id`)
   - Changing reservation time slot consumes new slot capacity without releasing previous slot capacity.
3. **SEC-403 (site044-SEC-403)**: Cancellation Policy Date Logic Error (`GET /api/reservations/:id/cancellation-policy`, `POST /api/reservations/:id/cancel`)
   - Calculates cancellation fee by only comparing date strings rather than precise hour differences.
4. **SEC-404 (site044-SEC-404)**: Party Size Modification Capacity Check Omission (`PATCH /api/reservations/:id`)
   - Increasing party size (e.g. 2 -> 6) bypasses restaurant capacity limit verification.
5. **SEC-405 (site044-SEC-405)**: Business Day Validation Omission on Date Modification (`PATCH /api/reservations/:id`)
   - Changing reservation date to restaurant's closed day (e.g. Monday) is erroneously permitted.
