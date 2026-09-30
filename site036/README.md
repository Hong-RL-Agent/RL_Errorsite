# WorkNest — Team Collaboration & Workspace Platform

## 1. Project Information
- **Project Name**: WorkNest
- **Site ID**: site036
- **Theme**: Team Collaboration & Workspace Platform
- **Tech Stack**: React 18, Vite 5, Express 4, Vanilla CSS Design System, Lucide React
- **Default Port**: `9935`

---

## 2. Overview & Key Capabilities
WorkNest is a modern multi-tenant enterprise collaboration workspace designed for cross-functional product and engineering teams.

- **Workspace Dashboard**: Key operational metrics, ongoing projects progress, upcoming reservations, and real-time activity stream.
- **Projects & Tasks**: Project status tracking, priority matrix, team collaboration discussion threads, and dynamic filter search.
- **Global Search**: Unified search engine querying projects, uploaded documentation assets, and workspace subscription plans.
- **Document & Asset Repository**: Upload, metadata description management, and version reference.
- **Meeting Rooms & Resource Reservations**: Room scheduling, purpose logging, and equipment preparation notes.
- **Subscription Plans & Add-ons**: Plan tier selection, billing interval management, and team add-on management.
- **Subscription Cart & Checkout**: Multi-item subscription cart calculation, VAT handling, and checkout flow.
- **Payments & Invoicing**: Automated credit card / bank transfer payment processing with receipt references.
- **1:1 Help Desk & Inquiries**: Technical, billing, and workspace administration support ticket management.
- **Activity & Audit Trail**: Real-time event transaction logging and system sequence monitoring.

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
- `GET /api/health` — Service health and site identifier (`{ "status": "ok", "siteId": "site036" }`)
- `GET /api/dashboard` — Overview statistics, recent projects, and latest activities

### Workspace & Team
- `GET /api/workspaces` — Active workspace list
- `GET /api/users` — Workspace team members and permission roles
- `GET /api/profile` — Current authenticated user profile
- `POST /api/profile/bio` — Update user introduction bio

### Projects & Discussions
- `GET /api/projects` — Project list and statuses
- `POST /api/projects/filter` — Filtered project search query
- `GET /api/projects/:projectId/comments` — Project discussion comments
- `POST /api/projects/:projectId/comments` — Post comment on project

### Global Search
- `POST /api/search` — Unified keyword and multi-category search

### Products & Pricing Plans
- `GET /api/products` — Subscription tiers and catalog
- `POST /api/products` — Create new service tier
- `POST /api/products/name` — Update product tier naming

### Files & Document Assets
- `GET /api/files` — Document repository files
- `POST /api/files` — Upload file metadata
- `POST /api/files/description` — Update document description

### Reservations & Rooms
- `GET /api/reservations` — Room and booth reservations
- `POST /api/reservations` — Create new room reservation
- `POST /api/reservations/:reservationId/note` — Save preparation note

### Cart & Payments
- `GET /api/cart` — User cart items and calculated totals
- `POST /api/cart/items` — Add subscription item to cart
- `GET /api/payments` — Payment transactions history
- `POST /api/payments` — Process payment request

### Support & Inquiries
- `GET /api/support/inquiries` — Support ticket inquiry history
- `POST /api/support/inquiries` — Submit support ticket

### Transaction Audit
- `GET /api/transactions` — All system transactions and execution history
- `GET /api/transactions/:transactionId` — Single transaction detail

---

## 5. Transaction & PPO Exploration Model
All state-mutating requests generate an audit transaction record containing:
- `request_sequence`: Monotonically increasing sequence number
- `idempotency_key`: Client-supplied idempotency key
- `transaction_id`: System-assigned transaction identifier
- `request_payload`: Submitted request parameters
- `created_at`: ISO timestamp

PPO exploration agents can validate server-side state transitions and transaction generation by dispatching requests and comparing sequence numbers and reference transaction IDs.
