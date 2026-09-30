# Detailed Availability & Async-No-Feedback Flaws (site039)

This guide documents the technical details and PPO exploration pathways for the 10 availability vulnerabilities in DailyPick.

---

## 1. SEC-361: 비동기 pending 피드백 부재 (검색창)

- **Bug ID**: site039-bug01
- **SEC ID**: SEC-361
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (검색창)
- **Endpoint**: `GET /api/search`
- **Trigger Condition**: Navigate to the Search page or click on the search bar, enter a query, and trigger a search. Observe the pending request up to deadline `0.6`.
- **Normal Behavior**: The search bar/results container provides a visible loading spinner/Searching message and a cancellation control.
- **Intended Vulnerable Behavior**: The async search request remains pending without visible loading status indicators, progress state, or a cancel button.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 2. SEC-362: 비동기 pending 피드백 부재 (프로필 소개)

- **Bug ID**: site039-bug02
- **SEC ID**: SEC-362
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (프로필 소개)
- **Endpoint**: `POST /api/profile/bio`
- **Trigger Condition**: Navigate to My Page/Profile, input text into the Bio textarea, and click "프로필 소개 저장".
- **Normal Behavior**: Displays `Saving...` or disabled saving state with abort option.
- **Intended Vulnerable Behavior**: Request is pending but the UI offers no progress indicator or cancel button.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 3. SEC-363: 비동기 pending 피드백 부재 (문의 폼)

- **Bug ID**: site039-bug03
- **SEC ID**: SEC-363
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (문의 폼)
- **Endpoint**: `POST /api/inquiries`
- **Trigger Condition**: Open the 1:1 Inquiry modal, fill in title and content, and click "문의 제출".
- **Normal Behavior**: Submit button shows `Sending...` / loading spinner and permits aborting.
- **Intended Vulnerable Behavior**: Inquiry submission enters pending state without status feedback or cancel path.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 4. SEC-364: 비동기 pending 피드백 부재 (상품명 필드)

- **Bug ID**: site039-bug04
- **SEC ID**: SEC-364
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (상품명 필드)
- **Endpoint**: `POST /api/products/name/validate`
- **Trigger Condition**: Open product name verification modal on Products page, type a candidate name, and click "검증하기".
- **Normal Behavior**: Displays `Validating...` / `Checking...` with cancel action.
- **Intended Vulnerable Behavior**: Async validation stays pending without inline loading feedback or cancel path.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 5. SEC-365: 비동기 pending 피드백 부재 (파일 설명)

- **Bug ID**: site039-bug05
- **SEC ID**: SEC-365
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (파일 설명)
- **Endpoint**: `POST /api/files/description`
- **Trigger Condition**: In Files page, open file description modal and submit updated note.
- **Normal Behavior**: Shows `Saving description...` and cancel control.
- **Intended Vulnerable Behavior**: File description save stays pending without meaningful progress UI.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 6. SEC-366: 비동기 pending 피드백 부재 (댓글 입력)

- **Bug ID**: site039-bug06
- **SEC ID**: SEC-366
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (댓글 입력)
- **Endpoint**: `POST /api/products/:productId/comments`
- **Trigger Condition**: On Product Detail page, enter a comment and rating, then click "댓글 등록".
- **Normal Behavior**: Button shows `Posting...` with cancel path.
- **Intended Vulnerable Behavior**: Comment submission remains pending without progress text or abort control.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 7. SEC-367: 비동기 pending 피드백 부재 (예약 메모)

- **Bug ID**: site039-bug07
- **SEC ID**: SEC-367
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (예약 메모)
- **Endpoint**: `POST /api/reservations/:reservationId/memo`
- **Trigger Condition**: On Reservations page, click "메모 수정" and submit updated consultation notes.
- **Normal Behavior**: Displays `Updating note...` and cancel button.
- **Intended Vulnerable Behavior**: Pending state with no feedback and no cancel path.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 8. SEC-368: 비동기 pending 피드백 부재 (장바구니)

- **Bug ID**: site039-bug08
- **SEC ID**: SEC-368
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (장바구니)
- **Endpoint**: `POST /api/cart/items`
- **Trigger Condition**: Click "장바구니 담기" on any product card or detail page.
- **Normal Behavior**: Cart button displays `Adding...` or animated badge with abort route.
- **Intended Vulnerable Behavior**: Request is pending but button and cart icon lack visual progress indicators.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 9. SEC-369: 비동기 pending 피드백 부재 (결제 폼)

- **Bug ID**: site039-bug09
- **SEC ID**: SEC-369
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (결제 폼)
- **Endpoint**: `POST /api/checkout/payment`
- **Trigger Condition**: On Checkout page, click the payment button to place order.
- **Normal Behavior**: Shows `Processing payment... Please wait` and cancellation control.
- **Intended Vulnerable Behavior**: Payment request remains pending without clear feedback or cancel path.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.

---

## 10. SEC-370: 비동기 pending 피드백 부재 (필터 파라미터)

- **Bug ID**: site039-bug10
- **SEC ID**: SEC-370
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (필터 파라미터)
- **Endpoint**: `POST /api/products/filter`
- **Trigger Condition**: On Products page, adjust category or price range and click "필터 적용".
- **Normal Behavior**: Displays `Filtering...` / `Updating...` with cancel action.
- **Intended Vulnerable Behavior**: Filter request stays pending without user feedback or cancel path.
- **Detection Signal**: `request_started` true, `pending_duration >= 0.6`, `ui_feedback` false, `cancel_path` false.
