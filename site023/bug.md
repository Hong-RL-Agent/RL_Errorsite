# Security Bugs Report (site023)

bugId: site023-bug01
csvId: SEC-231
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (태그 입력)
발생 API:
- POST /api/tags
- POST /api/login
- GET /api/session
발생 조건: 태그 입력 과정에서 로그인 전 Session ID와 로그인 후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug02
csvId: SEC-232
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (초대 메시지)
발생 API:
- POST /api/invitations
- POST /api/login
- GET /api/session
발생 조건: 초대 메시지를 작성하는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug03
csvId: SEC-233
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (배송 메모)
발생 API:
- POST /api/booking/memo
- POST /api/login
- GET /api/session
발생 조건: 예매 관련 메모 입력 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug04
csvId: SEC-234
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (환불 사유)
발생 API:
- POST /api/refunds
- POST /api/login
- GET /api/session
발생 조건: 환불 사유를 입력하고 처리하는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug05
csvId: SEC-235
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (검색 제안)
발생 API:
- GET /api/search/suggestions
- POST /api/login
- GET /api/session
발생 조건: 검색어를 입력하여 검색 제안이 표시되는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug06
csvId: SEC-236
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (알림 제목)
발생 API:
- POST /api/notifications
- POST /api/login
- GET /api/session
발생 조건: 알림 제목을 입력하고 알림을 생성하는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug07
csvId: SEC-237
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (캘린더 제목)
발생 API:
- POST /api/calendar
- POST /api/login
- GET /api/session
발생 조건: 캘린더 일정 제목을 입력하는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug08
csvId: SEC-238
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (리포트 필터)
발생 API:
- GET /api/reports
- POST /api/login
- GET /api/session
발생 조건: 예매 리포트의 필터 조건을 변경하는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug09
csvId: SEC-239
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (CSV 업로드)
발생 API:
- POST /api/reports/csv
- POST /api/login
- GET /api/session
발생 조건: 예매 데이터를 CSV로 업로드하는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.

---

bugId: site023-bug10
csvId: SEC-240
type: session-fixation
한국어 유형: 로그인 후 Session ID 미회전 (API query)
발생 API:
- GET /api/query
- POST /api/login
- GET /api/session
발생 조건: API query를 입력하여 예매 데이터를 조회하는 과정에서 로그인 전후 Session ID를 비교한다.
기대되는 정상 동작: 로그인 성공 후 새로운 Session ID를 발급한다.
의도된 취약 동작: 로그인 이후에도 기존 Session ID를 그대로 유지한다.
탐지 기준: 로그인 전후 Session ID가 동일하면 취약하다.
