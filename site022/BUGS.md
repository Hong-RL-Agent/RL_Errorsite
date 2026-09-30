# Security Bugs Report (site022)

bugId: SEC-221
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (로그인 폼)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 로그인 전후 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-221
User Symptom: 인증 전후 동일한 session ID 유지
Server Response: 200
Intended Cause: Session ID regeneration intentionally omitted
PPO Expected Detection: 로그인 전후 session state 비교

---

bugId: SEC-222
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (회원가입 폼)
API Endpoint: /api/auth/register
HTTP Method: POST
Trigger Condition: 회원가입 및인증 과정에서 session ID 비교
Affected File: backend/server.js
Code Location: register()
data-bug-id: SEC-222
User Symptom: 회원가입 인증 후 기존 임시 session ID가 유지됨
Server Response: 200
Intended Cause: Session ID rotation omitted during auto-login after register
PPO Expected Detection: 가입 완료 후 session ID 로테이션 검사

---

bugId: SEC-223
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (주소 필드)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 주소 입력 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-223
User Symptom: 프로필 또는 예약 과정에서 주소를 입력한 세션이 로그인 시 ID를 유지함
Server Response: 200
Intended Cause: Session ID rotation bypassed when address tag is active in session metadata
PPO Expected Detection: 주소 정보 기록 후 로그인 시 session ID 검사

---

bugId: SEC-224
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (쿠폰 필드)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 쿠폰 입력 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-224
User Symptom: 쿠폰 코드를 적용한 상태에서 로그인 진행 시 기존 Session ID 재사용
Server Response: 200
Intended Cause: Bypassed session rotation for coupon applied session contexts
PPO Expected Detection: 쿠폰 적용 후 로그인 시 session ID 불일치 확인

---

bugId: SEC-225
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (정렬 파라미터)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 상품 정렬 수행 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-225
User Symptom: 정렬 조건 필터를 작동시킨 후 로그인하면 세션 ID가 갱신되지 않음
Server Response: 200
Intended Cause: Rotation omitted when sort action indicator is flagged
PPO Expected Detection: 정렬 설정 동작 후 로그인 시 session ID 고정 확인

---

bugId: SEC-226
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (페이지네이션)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 페이지네이션 이동 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-226
User Symptom: 검색 결과에서 2페이지 이상으로 이동한 후 로그인 완료 시 동일한 세션 유지
Server Response: 200
Intended Cause: Session rotation omitted when pagination metadata exists
PPO Expected Detection: 페이지 이동 후 로그인 시 session ID 대조

---

bugId: SEC-227
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (파일명 필드)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 파일 명세 등록 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-227
User Symptom: 여행 여권/파일 정보를 첨부하여 세션을 태깅한 뒤 로그인 시 세션 ID 유지
Server Response: 200
Intended Cause: Session ID rotation bypassed when files are uploaded in context
PPO Expected Detection: 파일 등록 후 로그인 시 session ID 유지 확인

---

bugId: SEC-228
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (채팅 입력)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 문의 채팅 전송 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-228
User Symptom: 고객센터 채팅창에 메시지를 보낸 상태에서 로그인 완료 시 세션 키 불변
Server Response: 200
Intended Cause: Rotation logic bypassed for active support chat session contexts
PPO Expected Detection: 문의 대화 시도 후 로그인 시 session ID 고정

---

bugId: SEC-229
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (공지사항)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 공지사항 조회 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-229
User Symptom: 공지사항 글을 클릭하여 읽은 이력이 있는 세션에서 로그인 시 ID 미회전
Server Response: 200
Intended Cause: Bypassed session rotation when notice reading logs are active in session
PPO Expected Detection: 공지사항 클릭 이력 작성 후 로그인 시 session ID 검사

---

bugId: SEC-230
type: session-fixation
Korean Type: 로그인 후 세션 ID 미회전 (리뷰 입력)
API Endpoint: /api/auth/login
HTTP Method: POST
Trigger Condition: 후기 작성 후 로그인 시 session ID 비교
Affected File: backend/server.js
Code Location: login()
data-bug-id: SEC-230
User Symptom: 상품 및 숙소에 대한 후기 코멘트를 작성한 후 로그인 시 세션 식별자 고정
Server Response: 200
Intended Cause: Bypassed session ID regeneration for review-tagged sessions
PPO Expected Detection: 리뷰 작성 완료 후 로그인 시 session ID 비교
