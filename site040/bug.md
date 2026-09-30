# Detailed Intentional Bugs Specification (site040)

### Bug ID: site040-bug01
- **SEC ID**: SEC-371
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (로그인 폼)
- **Endpoint**: `POST /api/auth/login`
- **Trigger Condition**:
  1. Navigate to `/login`
  2. Input user credentials (e.g. `student@example.com` / `password123`)
  3. Click "로그인" (Sign in) button
  4. Request initiates and enters prolonged pending state
  5. Observe UI state over observation deadline (0.6)
- **Normal Behavior**: Loading spinner or message (`Signing in...`), input lock with cancellation pathway (`Cancel`).
- **Intended Vulnerable Behavior**: Request remains pending without loading indicators, status text, or cancel pathway.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Login form submission -> observe async pending state without feedback.

---

### Bug ID: site040-bug02
- **SEC ID**: SEC-372
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (회원가입 폼)
- **Endpoint**: `POST /api/auth/register`
- **Trigger Condition**:
  1. Navigate to `/register`
  2. Fill in registration inputs (Name, Email, Password, Address)
  3. Click "무료 회원가입" (Register)
  4. Request starts and remains pending
  5. Observe UI for feedback
- **Normal Behavior**: Displays `Creating account...`, animated progress, cancel button.
- **Intended Vulnerable Behavior**: Enters pending state with no distinct UI feedback or cancellation path.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Registration form submission -> monitor async pending state without feedback.

---

### Bug ID: site040-bug03
- **SEC ID**: SEC-373
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (주소 필드)
- **Endpoint**: `POST /api/profile/address`
- **Trigger Condition**:
  1. Navigate to `/profile`
  2. Enter textbook delivery address into input field
  3. Click "배송지 주소 저장" (Save Address)
  4. Request starts and remains pending
- **Normal Behavior**: `Saving address...` toast/badge and cancel operation allowed.
- **Intended Vulnerable Behavior**: Pending state remains active without visual progress cues or cancel button.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Address form save -> observe lack of pending feedback.

---

### Bug ID: site040-bug04
- **SEC ID**: SEC-374
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (쿠폰 필드)
- **Endpoint**: `POST /api/coupons/apply`
- **Trigger Condition**:
  1. Navigate to `/coupons`
  2. Input coupon code (e.g. `WELCOME2026`)
  3. Click "쿠폰 번호 등록 및 적용" (Apply Coupon)
  4. Request starts and remains pending
- **Normal Behavior**: `Applying coupon...` indicator, validation status spinner, cancel option.
- **Intended Vulnerable Behavior**: Request stays pending with no meaningful feedback or abort path.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Coupon code input and apply -> observe pending state.

---

### Bug ID: site040-bug05
- **SEC ID**: SEC-375
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (정렬 파라미터)
- **Endpoint**: `GET /api/courses?sort=popular`
- **Trigger Condition**:
  1. Navigate to `/courses`
  2. Switch sorting option dropdown (e.g., to "인기순" or "최신순")
  3. Asynchronous sort query is dispatched
- **Normal Behavior**: Displays `Sorting courses...` overlay/skeleton and cancel button.
- **Intended Vulnerable Behavior**: Request remains pending with no feedback on sort progress or cancel mechanism.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Change course sort filter -> observe pending async state.

---

### Bug ID: site040-bug06
- **SEC ID**: SEC-376
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (페이지네이션)
- **Endpoint**: `GET /api/courses?page=2`
- **Trigger Condition**:
  1. Navigate to `/courses`
  2. Click pagination button (e.g., Page 2)
  3. Page fetch request initiates
- **Normal Behavior**: Displays `Loading page...` indicator and abortable request control.
- **Intended Vulnerable Behavior**: Request is pending, page stays on existing view without loading badge or cancel option.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Click pagination number -> observe pending async state without feedback.

---

### Bug ID: site040-bug07
- **SEC ID**: SEC-377
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (파일명 필드)
- **Endpoint**: `POST /api/files/name`
- **Trigger Condition**:
  1. Navigate to `/materials`
  2. Input or modify learning material filename
  3. Click "파일명 유효성 검증 및 저장"
  4. Async file verification request initiates
- **Normal Behavior**: `Checking filename...` progress indicator and cancel button.
- **Intended Vulnerable Behavior**: Enters pending state with no UI progress indication or cancel pathway.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Filename input submit -> check async feedback.

---

### Bug ID: site040-bug08
- **SEC ID**: SEC-378
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (채팅 입력)
- **Endpoint**: `POST /api/chat/messages`
- **Trigger Condition**:
  1. Navigate to `/chat`
  2. Type a message in instructor 1:1 chat window
  3. Click "전송" (Send)
  4. Async message transmission begins
- **Normal Behavior**: `Sending message...` inline status, message sending placeholder with cancel button.
- **Intended Vulnerable Behavior**: Remains in pending transmission state without visible feedback or cancel path.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Chat message send -> observe pending state.

---

### Bug ID: site040-bug09
- **SEC ID**: SEC-379
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (공지사항)
- **Endpoint**: `POST /api/notices/read`
- **Trigger Condition**:
  1. Navigate to `/notices`
  2. Click on an unread announcement card or "읽음 확인" button
  3. Async notice read status update initiates
- **Normal Behavior**: `Updating notice status...` indicator and cancel control.
- **Intended Vulnerable Behavior**: Notice request is pending indefinitely without status UI feedback or cancel action.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Notice click / mark as read -> observe pending async state.

---

### Bug ID: site040-bug10
- **SEC ID**: SEC-380
- **Category**: availability
- **Family**: async-no-feedback
- **Type**: 비동기 pending 피드백 부재 (리뷰 입력)
- **Endpoint**: `POST /api/courses/:courseId/reviews`
- **Trigger Condition**:
  1. Navigate to `/courses/course-101` (or any course detail page)
  2. Fill in rating and course review commentary
  3. Click "수강 후기 등록하기" (Submit Review)
  4. Review submission starts and enters pending state
- **Normal Behavior**: `Submitting review...` loading status and cancel pathway.
- **Intended Vulnerable Behavior**: Pending state remains active without status notice or cancel button.
- **Detection Signal**: `request_started`, `pending_duration`, `ui_feedback`, `cancel_path`
- **PPO Exploration Path**: Review form submission -> observe pending state without feedback.
