# BUGS.md — ClassBridge (site040) Intentional Availability Vulnerabilities

## SEC-371
bugId: site040-bug01
csvId: SEC-371
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (로그인 폼)
severity: 중
count: 0.6
endpoint: POST /api/auth/login
condition: 로그인 요청을 시작하고 고정 deadline까지 pending 상태 관찰
expected: pending 상태에서 사용자에게 적절한 피드백(Signing in..., Loading indicator)과 취소 경로(Cancel) 제공
actual: pending 상태이지만 UI 피드백과 취소 경로가 없음
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-372
bugId: site040-bug02
csvId: SEC-372
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (회원가입 폼)
severity: 중
count: 0.6
endpoint: POST /api/auth/register
condition: 회원가입 폼을 작성하고 제출한 뒤 고정 deadline까지 pending 상태 관찰
expected: pending 상태에서 Creating account... 메시지 및 Cancel 취소 버튼 제공
actual: 회원가입 요청이 pending 상태지만 명확한 진행 상태가 표시되지 않고 취소 경로도 없음
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-373
bugId: site040-bug03
csvId: SEC-373
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (주소 필드)
severity: 중
count: 0.6
endpoint: POST /api/profile/address
condition: 주소 필드에 주소를 입력하고 저장 요청을 수행한 뒤 고정 deadline까지 관찰
expected: 주소 저장 요청 pending 시 Saving address... 및 Cancel 취소 제어 경로 제공
actual: 주소 저장 요청이 pending 상태지만 UI에 명확한 진행 상태 및 취소 경로 부재
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-374
bugId: site040-bug04
csvId: SEC-374
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (쿠폰 필드)
severity: 중
count: 0.6
endpoint: POST /api/coupons/apply
condition: 쿠폰 필드에 쿠폰 코드를 입력하고 적용한 후 고정 deadline까지 요청 관찰
expected: Applying coupon... 또는 Checking... 안내 및 Cancel 경로 제공
actual: 쿠폰 요청은 pending 상태지만 UI에 명확한 상태 피드백과 취소 경로 없음
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-375
bugId: site040-bug05
csvId: SEC-375
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (정렬 파라미터)
severity: 중
count: 0.6
endpoint: GET /api/courses?sort=popular
condition: 정렬 파라미터를 변경하고 비동기 정렬 요청을 수행한 뒤 고정 deadline까지 관찰
expected: Sorting... 또는 Updating courses... 상태 및 Cancel 버튼 제공
actual: 정렬 요청이 pending 상태로 유지되나 작업 상태 피드백과 취소 경로 없음
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-376
bugId: site040-bug06
csvId: SEC-376
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (페이지네이션)
severity: 중
count: 0.6
endpoint: GET /api/courses?page=2
condition: 페이지네이션 버튼을 클릭하고 고정 deadline까지 요청 관찰
expected: Loading page... 또는 Fetching courses... 피드백 및 Cancel 경로 제공
actual: 페이지네이션 요청이 pending 상태지만 명확한 진행 상태와 취소 경로 없음
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-377
bugId: site040-bug07
csvId: SEC-377
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (파일명 필드)
severity: 중
count: 0.6
endpoint: POST /api/files/name
condition: 학습 자료 파일명 필드에 이름을 입력하고 비동기 검증/저장 요청 수행 후 고정 deadline까지 관찰
expected: Checking filename... 또는 Saving... 상태 및 Cancel 제어 제공
actual: 파일명 비동기 요청이 pending 상태이나 UI 피드백과 취소 경로 부재
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-378
bugId: site040-bug08
csvId: SEC-378
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (채팅 입력)
severity: 중
count: 0.6
endpoint: POST /api/chat/messages
condition: 강사 상담 채팅 입력창에 메시지 입력 후 전송하고 고정 deadline까지 관찰
expected: Sending... 또는 Waiting... 상태 안내 및 Cancel 취소 경로 제공
actual: 채팅 전송 요청이 pending 상태로 유지되나 전송 중 UI 피드백과 취소 경로 없음
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-379
bugId: site040-bug09
csvId: SEC-379
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (공지사항)
severity: 중
count: 0.6
endpoint: POST /api/notices/read
condition: 공지사항을 열람하거나 읽음 처리를 수행하고 고정 deadline까지 요청 관찰
expected: Loading notices... 또는 Updating... 상태 및 Cancel 경로 제공
actual: 공지사항 요청이 pending 상태지만 명확한 진행 상태와 취소 경로 없음
detection: request_started, pending_duration, ui_feedback, cancel_path

---

## SEC-380
bugId: site040-bug10
csvId: SEC-380
category: availability
family: async-no-feedback
type: 비동기 pending 피드백 부재 (리뷰 입력)
severity: 중
count: 0.6
endpoint: POST /api/courses/:courseId/reviews
condition: 강의 리뷰 작성 후 제출 버튼을 클릭하고 고정 deadline까지 요청 관찰
expected: Submitting review... 또는 Saving... 피드백 및 Cancel 취소 버튼 제공
actual: 리뷰 등록 요청이 pending 상태지만 UI에 명확한 pending 피드백과 취소 경로 없음
detection: request_started, pending_duration, ui_feedback, cancel_path
