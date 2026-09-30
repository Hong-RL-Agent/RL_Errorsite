# StageOn — Culture & Performance Venue Management Platform

## 1. Project Information
- **Project Name**: StageOn
- **Site ID**: site037
- **Theme**: Culture & Performance Venue Management Platform
- **Tech Stack**: React 18, Vite 5, Express 4, Vanilla CSS Design System, Lucide React
- **Default Port**: `9936`

---

## 2. Overview & Key Capabilities
StageOn is an online performance booking and culture center platform providing ticketing, exhibition archives, audience community lounges, and venue administration.

- **Performance & Concert Booking**: Schedule viewing, popularity/price/rating sorting, paginated browsing, and instant seat reservation.
- **Exhibition & Media Art Gallery**: Exhibition archives, period tracking, and digital docent guides.
- **Culture Academy & Masterclasses**: Classical music, stage acting, and urban drawing workshops.
- **My Tickets & Coupon Management**: Ticket history, discount coupon application, and pricing calculations.
- **Audience Live Chat Rooms**: Performance-specific chat rooms and live fan interactions.
- **Venue Announcements & Notices**: Facility schedules, parking guides, and membership policy updates.
- **Audience Reviews & Ratings**: Star ratings and verified audience performance feedback.
- **Document & Media Repository**: Program booklets, brochures, and stage layout downloads and name management.
- **Activity & Transaction Audit Trail**: Real-time event transaction logging and sequence tracing.

---

## 3. Execution & Build Instructions

### Install Dependencies
```bash
npm install
```

### Development Server (Vite + Express Proxy)
```bash
npm run dev
```

### Production Start (Express Backend & Static Serving)
```bash
npm start
```

### Frontend Production Build
```bash
npm run build
```

---

## 4. API Endpoints

### System & Health Check
- `GET /api/health` — Health status (`{ "status": "ok", "siteId": "site037" }`)
- `GET /api/dashboard` — Platform overview, featured concerts, and latest announcements

### Authentication
- `POST /api/auth/login` — User authentication
- `POST /api/auth/register` — New membership registration
- `POST /api/auth/logout` — Session termination

### Profile & Address
- `GET /api/profile` — User profile details
- `POST /api/profile/address` — Update ticket delivery address
- `PUT /api/profile` — Update basic profile info

### Performances & Shows
- `GET /api/performances` — All performances
- `GET /api/performances/:performanceId` — Performance detail
- `POST /api/performances/sort` — Apply sorting criteria
- `POST /api/performances/page` — Paginated performance query

### Exhibitions & Programs
- `GET /api/exhibitions` — Special exhibition list
- `GET /api/programs` — Cultural masterclass list

### Reservations & Coupons
- `GET /api/reservations` — Confirmed bookings
- `POST /api/reservations` — Create seat reservation
- `GET /api/coupons` — Available discount coupons
- `POST /api/coupons/apply` — Apply coupon to booking

### Files & Downloads
- `GET /api/files` — Performance documents and brochure archive
- `POST /api/files/name` — Update brochure filename

### Live Audience Chat
- `GET /api/chats` — Active chat lounges
- `GET /api/chats/:roomId/messages` — Room message history
- `POST /api/chats/:roomId/messages` — Post chat message

### Notices & Announcements
- `GET /api/notices` — Venue notices
- `POST /api/notices` — Publish announcement

### Performance Reviews
- `GET /api/reviews` — Audience reviews
- `POST /api/performances/:performanceId/reviews` — Submit review

### Transactions Audit
- `GET /api/transactions` — All system transaction logs
- `GET /api/transactions/:transactionId` — Single transaction detail

---

## 5. Transaction & PPO Exploration Model
State-changing API calls record an in-memory audit log containing:
- `request_sequence`: Monotonically increasing sequence number
- `idempotency_key`: Client-supplied idempotency key
- `transaction_id`: Unique transaction identifier
- `request_payload`: Parameter payload
- `created_at`: Execution timestamp
