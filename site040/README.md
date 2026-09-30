# ClassBridge (site040) — Online Learning & Education Platform

ClassBridge is a modern, full-featured online education and learning platform built for college students, job seekers, and developers. It provides specialized curriculums in frontend engineering, data science, UX/UI design systems, SQL, CS interview prep, and portfolio reviews.

## 1. Project Overview

- **Site ID**: site040
- **Service Name**: ClassBridge
- **Theme**: Online Learning & Education Platform
- **Port**: 9939
- **Tech Stack**: React 18, Vite 5, Express 4, Vanilla CSS Education Design System, Lucide Icons
- **Backend Architecture**: In-memory Mock Database & Async Request Tracker (No external DB, No external APIs)

## 2. Quick Start & Execution

```bash
# Install dependencies
npm install

# Start production server (Serves on port 9939)
npm start

# Or run frontend dev mode
npm run dev

# Build production bundle
npm run build
```

The Express server will start on `http://localhost:9939`.

### Health Check Endpoint
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "siteId": "site040"
}
```

## 3. Core Features & Navigation

- **Home Dashboard**: Featured masterclasses, learning progress milestones, key platform certifications.
- **Courses Catalog**: Category filtering, multi-criteria sorting (popular, rating, price), multi-page pagination.
- **Course Detail**: Comprehensive curriculum breakdowns, instructor profile, student reviews.
- **My Learning**: Enrolled courses progress tracking, recent lesson checkpoints.
- **Materials**: Downloadable course cheat sheets, starter templates, coding test PDFs, filename validations.
- **1:1 Instructor Chat**: Direct tutor chat rooms, live question submissions and answers.
- **Notices**: Platform updates, maintenance notices, course launch announcements with read status.
- **Reviews & Ratings**: Verified student course reviews, star ratings, and feedback comments.
- **Coupons & Wallet**: Coupon code application, discount calculations.
- **Profile & Delivery Address**: Student profile details, learning hours, textbook delivery address management.
- **Authentication**: Student login and new registration forms.

## 4. API Specification

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check verification |
| `/api/dashboard` | GET | Top-level dashboard summary |
| `/api/auth/login` | POST | Student login verification |
| `/api/auth/register` | POST | Student account creation |
| `/api/courses` | GET | Course catalog (supports `sort`, `page`, `category`, `q`) |
| `/api/courses/:courseId` | GET | Course detail information |
| `/api/courses/:courseId/reviews` | GET / POST | Course reviews & ratings |
| `/api/profile` | GET / PUT | Student profile information |
| `/api/profile/address` | POST / PUT | Textbook shipping address updates |
| `/api/coupons` | GET | Available coupon list |
| `/api/coupons/apply` | POST | Coupon discount application |
| `/api/files` | GET | Shared learning materials list |
| `/api/files/name` | POST | Material filename validation & save |
| `/api/chat` | GET | Chat rooms & messages |
| `/api/chat/messages` | POST | 1:1 tutor message submission |
| `/api/notices` | GET | Notice announcements list |
| `/api/notices/read` | POST | Notice read status update |
| `/api/enrollments` | GET / POST | Student enrolled courses list |
| `/api/checkout/payment` | POST | Mock course payment & enrollment |

## 5. Async Request & PPO Exploration Model

The platform tracks asynchronous request lifecycles:
- `request_id`: Unique identifier (`req-001`, `req-002`, etc.)
- `endpoint`: Target REST resource
- `status`: Lifecycle status (`idle`, `pending`, `success`, `error`)
- `started_at`: Timestamp
- `payload`: Request data

PPO agents can evaluate availability signals, request pending durations, UI feedback indicators, and cancellation controls across diverse learning workflows.
