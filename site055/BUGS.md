# BUGS.md — CulturePick (site055) Intentional Bugs Specification

This document strictly defines the 5 intentional bugs implemented for site055 (CulturePick).

---

### SEC-451
- **Bug ID**: SEC-451
- **Type**: Backend Data Normalization Error / Seat Identifier Format Desynchronization
- **Category**: Data Normalization
- **Family**: identifier-coercion
- **Severity**: medium
- **Endpoint**: `/api/schedules/:id/seats/select` & `/api/schedules/:id/seats`
- **Method**: `POST` / `GET`
- **Condition**: User selects a seat formatted as `A1` while internal seat repository indexes it as `A01` without normalization.
- **File**: `server.js` / `src/components/SeatMap.jsx`
- **Location**: `app.post('/api/schedules/:id/seats/select')`
- **Selector**: `.seat-item-btn`
- **Symptom**: Clicking seat A1 causes internal mismatch with A01, resulting in selection state desynchronization or double booking error.
- **Expected Behavior**: Row ("A") and Number (1) should be uniformly normalized to a canonical identifier (`A-1` or `A1`) across all queries.
- **PPO Expected Behavior**: PPO navigates to an event schedule (`/events/:id/schedule`), opens seat selection, clicks seat A1, and verifies that the selected seat ID in state matches the requested seat.
- **Status**: Verified
- **Example**: `POST /api/schedules/sch-01/seats/select` with `{"seatId": "A1"}` fails to match seat `A01` and returns conflict/desync.
- **Cause**: Inconsistent string concatenation without zero-padding normalization (`row + number` vs `row + padZero(number)`).

---

### SEC-452
- **Bug ID**: SEC-452
- **Type**: Frontend UI Interaction / Broken Scroll Position Restore
- **Category**: Interaction
- **Family**: scroll-position
- **Severity**: low
- **Endpoint**: None (Client-side UI interaction)
- **Method**: `GET`
- **Condition**: User expands detailed event description, scrolls down, and clicks the collapse button.
- **File**: `src/components/EventDetail.jsx`
- **Location**: `handleToggleExpand` in `EventDetail.jsx`
- **Selector**: `.btn-expand-detail`
- **Symptom**: Collapsing the expanded detail view abruptly jumps the scrollbar to the top of the window (`window.scrollTo(0, 0)`) instead of preserving the section position.
- **Expected Behavior**: Collapsing should maintain user viewport focus or smoothly scroll to the section container header.
- **PPO Expected Behavior**: PPO expands event details, scrolls down through the content, clicks collapse, and observes the viewport jumping unexpectedly to the page top.
- **Status**: Verified
- **Example**: User reading cast list clicks "접기" and is thrown to page header y=0.
- **Cause**: Collapse event handler hardcodes `window.scrollTo({ top: 0 })` instead of calculating relative offset.

---

### SEC-453
- **Bug ID**: SEC-453
- **Type**: Backend Validation Error / Whitespace-only Review Accepted
- **Category**: Input Validation
- **Family**: whitespace-validation
- **Severity**: medium
- **Endpoint**: `/api/events/:id/reviews`
- **Method**: `POST`
- **Condition**: User submits review containing only spaces (`"   "`).
- **File**: `server.js` / `src/pages/Reviews.jsx`
- **Location**: `app.post('/api/events/:id/reviews')`
- **Selector**: `.review-content-textarea`, `.review-submit-btn`
- **Symptom**: Whitespace-only review passes validation and is saved as a blank comment in the database and UI.
- **Expected Behavior**: Backend should validate `content.trim().length > 0` and reject empty/whitespace input with HTTP 400.
- **PPO Expected Behavior**: PPO opens review writing, inputs only whitespace `"   "`, submits, and checks the review list to observe a blank review rendered.
- **Status**: Verified
- **Example**: `POST /api/events/evt-101/reviews` with `{"content": "   ", "rating": 5}` successfully returns HTTP 201.
- **Cause**: Server checks `if (content !== undefined)` without calling `.trim()` before saving.

---

### SEC-454
- **Bug ID**: SEC-454
- **Type**: Frontend Responsive UI / Coordinate Offset Mismatch
- **Category**: Responsive UI
- **Family**: coordinate-mismatch
- **Severity**: medium
- **Endpoint**: None (Client-side Canvas/Grid Coordinate calculation)
- **Method**: `GET`
- **Condition**: User clicks seats on smaller/responsive viewports or resized windows.
- **File**: `src/components/SeatMap.jsx`
- **Location**: `handleSeatClick` coordinate computation in `SeatMap.jsx`
- **Selector**: `.seat-grid-container`
- **Symptom**: On narrow screens, clicking a seat (e.g., A3) selects its neighboring seat (e.g., A2) due to unscaled coordinate offset calculation.
- **Expected Behavior**: Click targets should accurately map to the intended seat regardless of viewport scale.
- **PPO Expected Behavior**: PPO switches to responsive/mobile viewport, clicks a specific seat in the interactive seat map, and observes an adjacent seat being highlighted.
- **Status**: Verified
- **Example**: Clicking seat at x=180px selects seat index 1 instead of index 2 under responsive scaling.
- **Cause**: Coordinate click handler uses hardcoded desktop column pitch without responsive scaling factor.

---

### SEC-455
- **Bug ID**: SEC-455
- **Type**: Frontend UI Lifecycle / Duplicate Share Menu Overlay
- **Category**: UI Lifecycle
- **Family**: duplicate-overlay
- **Severity**: medium
- **Endpoint**: None (Client-side overlay state)
- **Method**: `GET`
- **Condition**: User clicks the share button rapidly multiple times.
- **File**: `src/components/EventDetail.jsx` / `src/components/ShareMenu.jsx`
- **Location**: `handleShareClick` in `EventDetail.jsx`
- **Selector**: `.btn-share-trigger`
- **Symptom**: Rapidly clicking the share button spawns multiple stacked overlay instances in the DOM.
- **Expected Behavior**: Clicking share should toggle a single singleton overlay modal.
- **PPO Expected Behavior**: PPO rapidly clicks the share button 3 times, observes multiple stacked share overlays, and tries closing them sequentially.
- **Status**: Verified
- **Example**: Clicking share 3 times creates 3 `.share-modal-overlay` elements on screen.
- **Cause**: Share click handler pushes new instances into an overlay array `setShareModals(prev => [...prev, Date.now()])` instead of toggling boolean state.
