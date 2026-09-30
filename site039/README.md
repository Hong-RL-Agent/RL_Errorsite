# DailyPick (site039) — Lifestyle Commerce & Shopping Platform

DailyPick is a premium lifestyle commerce and shopping platform offering curated apparel, home decor, handmade ceramics, fragrance, stationery, and 1:1 interior styling consultation workshops.

## 1. Project Overview

- **Site ID**: site039
- **Service Name**: DailyPick
- **Theme**: Lifestyle Commerce & Shopping Platform
- **Port**: 9938
- **Tech Stack**: React 18, Vite 5, Express 4, Vanilla CSS Design System, Lucide Icons
- **Backend Architecture**: In-memory Mock Store & Async State Tracker (No external DB, No external APIs)

## 2. Quick Start & Execution

```bash
# Install dependencies
npm install

# Start production server (Serves on port 9938)
npm start

# Or run frontend dev mode
npm run dev

# Build production bundle
npm run build
```

The Express server will start on `http://localhost:9938`.

### Health Check Endpoint
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "siteId": "site039"
}
```

## 3. Core Features & Navigation

- **Home Feed**: Seasonal curated lookbooks, top lifestyle bestsellers, core value props.
- **Product Collection**: Category filters, price ranges, sort options, product cards with discount badges.
- **Product Detail**: High-res image gallery, option selections, quantity controls, review comments.
- **Search**: Real-time keyword search, popular search term tags, search history.
- **Reservations**: Home styling 1:1 consultation and pottery workshop reservations with custom notes.
- **Cart & Drawer**: Quantity adjustments, shipping fee calculation (free over ₩50,000).
- **Checkout**: Shipping address input, payment method selection, order summaries.
- **Orders & Tracking**: Order history with live courier tracking numbers and items.
- **Reviews & Community**: Verified customer feedback, ratings, and comments.
- **Inquiries**: 1:1 customer support Q&A board with category tags and official answers.
- **Files & Moodboard**: PDF interior moodboards, workshop sketch image storage, and descriptions.
- **My Page**: VIP membership grade, reward points, coupon wallet, and profile bio.

## 4. API Specification

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check verification |
| `/api/dashboard` | GET | Dashboard overview and featured items |
| `/api/products` | GET | Product catalog list |
| `/api/products/:productId` | GET | Product details |
| `/api/products/filter` | GET / POST | Product filter parameters |
| `/api/products/name/validate` | POST | Product name validation |
| `/api/products/:productId/comments` | GET / POST | Product comments and reviews |
| `/api/search` | GET / POST | Product search query |
| `/api/search/history` | GET | Recent search queries |
| `/api/profile` | GET / PUT | User profile details |
| `/api/profile/bio` | POST / PUT | User bio introduction |
| `/api/inquiries` | GET / POST | Customer support inquiries |
| `/api/files` | GET / POST | File attachments |
| `/api/files/description` | POST | File description updates |
| `/api/reservations` | GET | Workshop & consultation reservations |
| `/api/reservations/:reservationId/memo` | POST | Reservation request memo |
| `/api/cart` | GET | Shopping cart contents |
| `/api/cart/items` | POST / PUT / DELETE | Cart item management |
| `/api/checkout/payment` | POST | Mock payment execution |
| `/api/orders` | GET | Order history |
| `/api/notifications` | GET | User alerts and notifications |

## 5. Async Request & PPO Exploration Model

The platform tracks application-level asynchronous request states:
- `request_id`: Unique identifier (e.g. `req-001`, `req-002`)
- `endpoint`: Target REST resource
- `status`: Lifecycle status (`idle`, `pending`, `success`, `error`)
- `started_at`: Timestamp
- `payload`: Request data

PPO agents can evaluate availability signals, request pending durations, UI feedback indicators, and cancellation controls across various shopping workflows.
