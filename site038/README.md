# CreatorFlow (site038) — Creator & Media Content Management Platform

CreatorFlow is a comprehensive content & media management platform designed for video creators, podcasters, writers, and digital studios. It provides seamless workflows for content planning, publishing calendars, team collaboration, merch shipping, refund handling, analytics reports, and developer query tools.

## 1. Project Overview

- **Site ID**: site038
- **Service Name**: CreatorFlow
- **Theme**: Creator & Media Content Management Platform
- **Port**: 9937
- **Tech Stack**: React 18, Vite 5, Express 4, Vanilla CSS Design System, Lucide Icons
- **Backend Architecture**: In-memory Mock Data & Transaction Ledger (No external DB, No external APIs)

## 2. Quick Start & Execution

```bash
# Install dependencies
npm install

# Start production server (Serves on port 9937)
npm start

# Or run frontend dev mode
npm run dev

# Build production bundle
npm run build
```

The Express server will start on `http://localhost:9937`.

### Health Check Endpoint
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "siteId": "site038"
}
```

## 3. Core Features & Navigation

- **Dashboard**: Channel growth statistics, active video projects, upcoming releases, and quick workflows.
- **Content Management**: Video/blog/podcast repository, tag management, view count tracking.
- **Calendar**: Publishing schedule, recording milestones, live streaming plan.
- **Team**: Collaborator invitations, member roles (Producer, Editor, Writer).
- **Shipping**: Creator merch inventory, delivery tracking, recipient delivery memo management.
- **Refunds**: Merch order refund reasons, dispute review workflow.
- **Search & Suggestions**: Content search engine and recommended keyword suggestion pool.
- **Notifications**: Channel update broadcasts, subscriber alerts, title management.
- **Reports**: Multi-platform performance analytics (views, engagement, revenue filters).
- **CSV Import**: Bulk metric and order import engine.
- **API Console**: Developer query sandbox and REST endpoint test tool.
- **Activity**: Comprehensive transaction ledger and audit logs.
- **Settings**: Creator channel profile and platform integration preferences.

## 4. API Specification

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check verification |
| `/api/dashboard` | GET | Top-level creator dashboard metrics |
| `/api/creator/profile` | GET / PUT | Creator channel profile details |
| `/api/content` | GET / POST | Content list and creation |
| `/api/content/:contentId` | GET / PUT | Content details and updates |
| `/api/content/:contentId/tags` | GET / POST | Content tag management |
| `/api/team` | GET | Team member directory |
| `/api/team/invitations` | GET / POST | Team invitations |
| `/api/shipping` | GET | Merch shipping records |
| `/api/shipping/:shipmentId/memo` | POST | Merch shipping memo updates |
| `/api/refunds` | GET | Merch refund requests |
| `/api/refunds/reason` | POST | Refund reason submission |
| `/api/search` | GET | Global content search |
| `/api/search/suggestions` | GET / POST | Trending search suggestions |
| `/api/notifications` | GET | Notification broadcast list |
| `/api/notifications/title` | POST | Notification title modification |
| `/api/calendar/events` | GET / POST | Content calendar event creation |
| `/api/reports` | GET | Performance report list |
| `/api/reports/filter` | POST | Analytics report filter submission |
| `/api/import/history` | GET | CSV import logs |
| `/api/import/csv` | POST | Bulk CSV data import |
| `/api/developer/history` | GET | Developer query history |
| `/api/developer/query` | POST | REST API console query execution |
| `/api/transactions` | GET | Full transaction ledger |

## 5. PPO Exploration & Transaction Model

All mutating operations generate structured transaction records in memory:
- `request_sequence`: Monotonically increasing sequence number
- `idempotency_key`: Client-supplied idempotency key
- `transaction_id`: Prefixed unique transaction identifier (e.g. `TAG-TX-001`, `CALENDAR-TX-001`)
- `payload`: Request parameters and values
- `created_at`: Timestamp

PPO agents can explore workflows, inspect response transaction IDs, and verify transaction ledger records through the Activity screen.
