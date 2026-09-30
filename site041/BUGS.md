# BUGS Documentation — site041 (PawMate)

## Overview
This document records all 10 intentional async-no-feedback availability bugs in `site041` (PawMate Pet Care & Reservation Platform) for PPO agent exploration and verification.

Fixed Deadline: `0.6s` (4000ms server delay)

---

### 1. SEC-381: Async-No-Feedback on Tag Input
* **Bug ID:** `site041-SEC-381`
* **Type:** Async No Feedback (Tag Input)
* **Severity:** Medium
* **Endpoint:** `POST /api/tags/apply`
* **Condition:** User registers or applies a custom tag (`#산책`, `#소형견`). Request remains pending > 0.6s without DOM loading feedback or cancel path.
* **Location:** `server.js` (`/api/tags/apply`), `Services.jsx`

---

### 2. SEC-382: Async-No-Feedback on Invitation Message
* **Bug ID:** `site041-SEC-382`
* **Type:** Async No Feedback (Invite Message)
* **Severity:** Medium
* **Endpoint:** `POST /api/invitations`
* **Condition:** User submits a care invitation message to family/sitter. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/invitations`), `Services.jsx`

---

### 3. SEC-383: Async-No-Feedback on Delivery Memo
* **Bug ID:** `site041-SEC-383`
* **Type:** Async No Feedback (Delivery Memo)
* **Severity:** Medium
* **Endpoint:** `PATCH /api/reservations/:id/delivery-memo`
* **Condition:** User updates delivery/care supply memo on reservation. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/reservations/:id/delivery-memo`), `Reservations.jsx`

---

### 4. SEC-384: Async-No-Feedback on Refund Reason
* **Bug ID:** `site041-SEC-384`
* **Type:** Async No Feedback (Refund Reason)
* **Severity:** Medium
* **Endpoint:** `POST /api/reservations/:id/refund-reason`
* **Condition:** User submits cancellation refund reason. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/reservations/:id/refund-reason`), `Reservations.jsx`

---

### 5. SEC-385: Async-No-Feedback on Search Suggestions
* **Bug ID:** `site041-SEC-385`
* **Type:** Async No Feedback (Search Suggestions)
* **Severity:** Medium
* **Endpoint:** `GET /api/search/suggestions`
* **Condition:** User types query in search bar. Autocomplete request remains pending > 0.6s without progress indicator.
* **Location:** `server.js` (`/api/search/suggestions`), `Services.jsx`

---

### 6. SEC-386: Async-No-Feedback on Notification Title
* **Bug ID:** `site041-SEC-386`
* **Type:** Async No Feedback (Notification Title)
* **Severity:** Medium
* **Endpoint:** `POST /api/notifications`
* **Condition:** User registers a new notification title. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/notifications`), `Notifications.jsx`

---

### 7. SEC-387: Async-No-Feedback on Calendar Title
* **Bug ID:** `site041-SEC-387`
* **Type:** Async No Feedback (Calendar Title)
* **Severity:** Medium
* **Endpoint:** `POST /api/calendar/events`
* **Condition:** User adds a calendar event. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/calendar/events`), `Calendar.jsx`

---

### 8. SEC-388: Async-No-Feedback on Pet Profile Note / Bio
* **Bug ID:** `site041-SEC-388`
* **Type:** Async No Feedback (Pet Profile Note)
* **Severity:** Medium
* **Endpoint:** `PATCH /api/pets/:id/notes`
* **Condition:** User updates pet special notes or personality. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/pets/:id/notes`), `Pets.jsx`

---

### 9. SEC-389: Async-No-Feedback on Activity Report / CSV Upload
* **Bug ID:** `site041-SEC-389`
* **Type:** Async No Feedback (Activity CSV Upload)
* **Severity:** Medium
* **Endpoint:** `POST /api/activity/csv`
* **Condition:** User uploads CSV activity data with report note. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/activity/csv`), `Activity.jsx`

---

### 10. SEC-390: Async-No-Feedback on Message Sending
* **Bug ID:** `site041-SEC-390`
* **Type:** Async No Feedback (Message Sending)
* **Severity:** Medium
* **Endpoint:** `POST /api/messages`
* **Condition:** User sends 1:1 chat message to sitter. Request remains pending > 0.6s without DOM feedback.
* **Location:** `server.js` (`/api/messages`), `Messages.jsx`
