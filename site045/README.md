# Passly — Subscription & Membership Platform

## 1. Project Overview
* **Site ID**: site045
* **Service Name**: Passly
* **Theme**: Subscription & Membership Platform
* **Port**: 9944
* **Tech Stack**: React 18 + Vite 5 + Express 4 + Vanilla CSS
* **Execution**: Independent execution (`npm run dev`, `npm start`, `npm run build`)

---

## 2. Running Instructions
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run Production Express backend (Port 9944)
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

## 4. Intentional Subscription & Membership Logic Flaws
Passly includes exactly 5 realistic subscription business logic bugs:

1. **SEC-406 (site045-SEC-406)**: Subscription Proration Error (`GET /api/billing/preview`, `POST /api/subscriptions/change-plan`)
   - When switching from monthly to yearly, previous monthly payment is fully deducted rather than calculating unused days.
2. **SEC-407 (site045-SEC-407)**: Cancellation Effective-Date Error (`POST /api/subscriptions/cancel`, `GET /api/content/:id/access`)
   - Cancellation scheduled for period end immediately revokes active membership benefits.
3. **SEC-408 (site045-SEC-408)**: Usage Quota State Reset on Resume (`POST /api/subscriptions/pause`, `POST /api/subscriptions/resume`, `GET /api/usage`)
   - Resuming a paused subscription erroneously resets the current usage quota counter to 0.
4. **SEC-409 (site045-SEC-409)**: Expired Coupon Stacking on Renewal (`POST /api/billing/renew`, `POST /api/subscriptions`)
   - Expired coupon discount is continually applied on recurring renewals without re-verifying expiration status.
5. **SEC-410 (site045-SEC-410)**: Entitlement Synchronization Omission on Downgrade (`POST /api/subscriptions/change-plan`, `GET /api/features/:id/access`)
   - Downgrading from Premium to Basic fails to revoke VIP feature entitlements, allowing continued access.
