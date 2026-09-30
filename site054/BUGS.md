# BUGS.md — BookNest (site054) Intentional Bugs Specification

This document strictly defines the 5 intentional bugs implemented for site054 (BookNest).

---

### SEC-446
- **Bug ID**: SEC-446
- **Type**: Backend Logic Error / Extension Counter Bypass
- **Category**: Business Rule
- **Family**: counter-calculation
- **Severity**: medium
- **Endpoint**: `/api/loans/:id/extend`
- **Method**: `POST`
- **Condition**: User has already extended loan twice (extensionCount = 2, max allowed = 2).
- **File**: `server.js` / `src/pages/MyLoans.jsx`
- **Location**: `app.post('/api/loans/:id/extend')`
- **Selector**: `.btn-loan-extend`
- **Symptom**: When a user reaches the maximum allowed extensions (2/2), clicking extend allows a 3rd extension instead of blocking with an error.
- **Expected Behavior**: Server should reject the extension request with HTTP 400 Bad Request ("최대 대여 연장 횟수(2회)를 초과하였습니다.").
- **PPO Expected Behavior**: PPO navigates to My Loans (`/loans`), selects a borrowed book, extends once (1/2), extends second time (2/2), then attempts a 3rd extension and observes that the extension is still granted (3/2).
- **Status**: Verified
- **Example**: `POST /api/loans/loan-01/extend` with extensionCount=2 results in extensionCount=3 and due date extended by 7 days.
- **Cause**: Comparison checks `loan.extensionCount > 2` instead of `loan.extensionCount >= 2`, or skips the check when incrementing.

---

### SEC-447
- **Bug ID**: SEC-447
- **Type**: Backend Form Coercion / Rating Default Coercion
- **Category**: Form Validation
- **Family**: default-value-coercion
- **Severity**: medium
- **Endpoint**: `/api/books/:id/reviews`
- **Method**: `POST`
- **Condition**: Rating submitted is 0 or falsy (0-star rating submitted).
- **File**: `server.js` / `src/components/ReviewForm.jsx`
- **Location**: `app.post('/api/books/:id/reviews')`
- **Selector**: `.rating-zero-btn`, `.review-submit-btn`
- **Symptom**: When a user submits a review with rating 0, it is stored and returned as 5 stars.
- **Expected Behavior**: Server should either reject 0 as an invalid rating (HTTP 400) or store exactly 0 stars without coercing to 5.
- **PPO Expected Behavior**: PPO opens book detail (`/books/:id`), enters a review with rating 0, submits, and inspects the created review to observe that the saved rating became 5 stars.
- **Status**: Verified
- **Example**: `POST /api/books/b-101/reviews` with payload `{"rating": 0, "content": "별로였습니다."}` stores `rating: 5`.
- **Cause**: Backend executes `const savedRating = rating || 5;`, treating numeric `0` as falsy and assigning default 5.

---

### SEC-448
- **Bug ID**: SEC-448
- **Type**: E-Book Reader Upper Bound Check Failure
- **Category**: Boundary Handling
- **Family**: index-boundary
- **Severity**: medium
- **Endpoint**: `/api/ebooks/:id/pages/:page`
- **Method**: `GET`
- **Condition**: Reader is on the last page (e.g., page 80 / 80) and user clicks "Next Page".
- **File**: `server.js` / `src/pages/Reader.jsx`
- **Location**: `app.get('/api/ebooks/:id/pages/:page')` & `Reader.jsx`
- **Selector**: `.reader-next-btn`
- **Symptom**: On the final page, clicking Next does not disable or clamp the page number; it increments to page 81 / 80 and attempts to render an out-of-bounds page.
- **Expected Behavior**: Next button should be disabled on the last page, and page number should not exceed total pages.
- **PPO Expected Behavior**: PPO opens an e-book reader (`/reader/:id`), jumps to or navigates to the final page (e.g., 80), clicks the Next button, and observes page state becoming 81 / 80 with empty/error content.
- **Status**: Verified
- **Example**: `GET /api/ebooks/b-101/pages/81` returns out-of-bound message with `currentPage: 81` while `totalPages: 80`.
- **Cause**: Upper bound validation condition `if (page > totalPages + 5)` allows advancing beyond `totalPages`.

---

### SEC-449
- **Bug ID**: SEC-449
- **Type**: UI List Rendering Key Misalignment
- **Category**: List Rendering
- **Family**: key-reuse
- **Severity**: medium
- **Endpoint**: `/api/books/:id/reviews` / `POST /api/books/:id/reviews`
- **Method**: `GET` / `POST`
- **Condition**: New review is prepended or review list is refreshed in Book Detail.
- **File**: `src/components/BookDetail.jsx`
- **Location**: Review list rendering in `BookDetail.jsx`
- **Selector**: `.review-list-item`, `.review-author-name`
- **Symptom**: After adding a new review, the author names and review comments become mismatched across existing list items due to array index key reuse.
- **Expected Behavior**: Each review item must bind author information and comment text to its stable review ID (`review.id`).
- **PPO Expected Behavior**: PPO inspects reviews on Book Detail, notes Reviewer A and Review Content A, posts a new review, and inspects the updated list to observe that Reviewer A's name is now attached to Review Content B.
- **Status**: Verified
- **Example**: User "김민수" wrote "좋은 책입니다.", but after list update it shows "김민수" with "비추천합니다." written by someone else.
- **Cause**: React rendering uses index-based key and decoupled parallel state arrays that desynchronize upon array prepend.

---

### SEC-450
- **Bug ID**: SEC-450
- **Type**: Search State Stale Persistence on Empty Query
- **Category**: Search State
- **Family**: empty-query-transition
- **Severity**: medium
- **Endpoint**: `/api/books?search=`
- **Method**: `GET`
- **Condition**: User performs a search with a query (e.g., "React"), then clears the search input completely and searches with an empty string.
- **File**: `server.js` / `src/pages/Books.jsx`
- **Location**: `app.get('/api/books')` & `Books.jsx`
- **Selector**: `.search-input-field`, `.search-clear-btn`
- **Symptom**: When search query is cleared to an empty string, the books list continues to display the previous filtered search results instead of resetting to all books.
- **Expected Behavior**: Searching with an empty string should reset the filter and return all books in the catalog.
- **PPO Expected Behavior**: PPO searches for "React", verifies filtered results, clears the search input, clicks search/enters, and observes that the screen still shows only the "React" books instead of the full library catalog.
- **Status**: Verified
- **Example**: `GET /api/books?search=React` returns 3 items; subsequent `GET /api/books?search=` returns the same 3 items instead of 50.
- **Cause**: Backend/frontend caches previous non-empty query and ignores empty string transition.
