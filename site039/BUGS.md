# Availability / Async-No-Feedback Bug Specifications (site039)

This document specifies the 10 intentional Availability (async-no-feedback) issues implemented in DailyPick.

---

bugId:
site039-bug01

csvId:
SEC-361

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (검색창)

severity:
중

count:
0.6

endpoint:
GET /api/search

condition:
검색창에서 검색 요청을 수행하고 고정 deadline까지 검색 요청을 관찰

expected:
pending 상태에서 사용자에게 적절한 피드백과 취소 경로 제공

actual:
pending 상태이지만 UI 피드백과 취소 경로가 없음

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug02

csvId:
SEC-362

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (프로필 소개)

severity:
중

count:
0.6

endpoint:
POST /api/profile/bio

condition:
프로필 소개를 입력하고 저장 요청을 수행한 뒤 고정 deadline까지 관찰

expected:
저장 요청이 pending이면 Saving/Processing 등의 피드백 및 취소 경로 제공

actual:
프로필 소개 저장 요청은 pending이지만 UI에 진행 상태가 나타나지 않고 취소 경로 부재

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug03

csvId:
SEC-363

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (문의 폼)

severity:
중

count:
0.6

endpoint:
POST /api/inquiries

condition:
문의 폼을 작성하고 제출한 후 고정 deadline까지 요청을 관찰

expected:
문의 제출 요청이 pending인 경우 버튼 상태 변경, Sending 표시 및 취소 경로 제공

actual:
문의 요청은 pending 상태지만 UI 피드백이 없으며 취소할 수 있는 경로 없음

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug04

csvId:
SEC-364

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (상품명 필드)

severity:
중

count:
0.6

endpoint:
POST /api/products/name/validate

condition:
상품명 필드에 상품명을 입력하고 비동기 검증 요청이 시작된 후 고정 deadline까지 관찰

expected:
검증 요청이 pending이면 Validating/Checking 등의 상태 및 취소 경로 제공

actual:
상품명 검증 요청이 pending이지만 필드 주변에 진행 상태가 표시되지 않고 취소 경로 없음

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug05

csvId:
SEC-365

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (파일 설명)

severity:
중

count:
0.6

endpoint:
POST /api/files/description

condition:
파일 설명을 입력하고 저장 요청을 수행한 후 고정 deadline까지 관찰

expected:
저장 요청이 pending이면 Saving description/Processing 등의 피드백 및 취소 경로 제공

actual:
파일 설명 저장 요청은 pending 상태지만 UI 피드백과 취소 경로 부재

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug06

csvId:
SEC-366

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (댓글 입력)

severity:
중

count:
0.6

endpoint:
POST /api/products/:productId/comments

condition:
댓글을 입력하고 등록 버튼을 누른 뒤 고정 deadline까지 요청을 관찰

expected:
댓글 제출이 pending이면 Posting/Submitting 등의 상태 및 취소 경로 제공

actual:
댓글 요청은 pending이지만 사용자에게 명확한 상태 피드백과 취소 경로를 제공하지 않음

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug07

csvId:
SEC-367

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (예약 메모)

severity:
중

count:
0.6

endpoint:
POST /api/reservations/:reservationId/memo

condition:
예약 메모를 입력하고 저장한 뒤 고정 deadline까지 요청을 관찰

expected:
예약 메모 저장 요청이 pending이면 Saving 상태와 취소 경로 제공

actual:
예약 메모 요청이 pending 상태로 유지되지만 UI에 상태 피드백과 취소 경로가 없음

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug08

csvId:
SEC-368

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (장바구니)

severity:
중

count:
0.6

endpoint:
POST /api/cart/items

condition:
상품을 장바구니에 추가한 후 고정 deadline까지 요청을 관찰

expected:
장바구니 요청이 pending이면 Adding/Updating cart 등의 상태 및 취소 경로 제공

actual:
장바구니 추가 요청이 pending 상태로 유지되지만 UI 피드백과 취소 경로가 없음

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug09

csvId:
SEC-369

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (결제 폼)

severity:
중

count:
0.6

endpoint:
POST /api/checkout/payment

condition:
결제 폼을 작성하고 결제 버튼을 누른 뒤 고정 deadline까지 요청을 관찰

expected:
결제 요청이 pending이면 Processing payment/Please wait 등의 상태 및 취소 경로 제공

actual:
결제 요청은 pending이지만 진행 상태가 명확하지 않고 취소 경로 없음

detection:
request_started
pending_duration
ui_feedback
cancel_path

---

bugId:
site039-bug10

csvId:
SEC-370

category:
availability

family:
async-no-feedback

type:
비동기 pending 피드백 부재 (필터 파라미터)

severity:
중

count:
0.6

endpoint:
POST /api/products/filter

condition:
필터 파라미터를 변경하고 비동기 필터 요청을 수행한 뒤 고정 deadline까지 관찰

expected:
필터 요청이 pending이면 Filtering/Updating results 등의 상태 및 취소 경로 제공

actual:
필터 요청은 pending 상태지만 현재 요청 상태를 알려주는 UI 피드백과 취소 경로가 없음

detection:
request_started
pending_duration
ui_feedback
cancel_path
