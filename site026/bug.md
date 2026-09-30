# Security Bugs Report (site026)

bugId: site026-bug01
csvId: SEC-261
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (태그 입력)
발생 API:
- POST /api/tags
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 태그 입력 기능을 이용한다.
3. 로그아웃한다.
4. 로그아웃 후 기존 Token으로 태그 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 성공 후 기존 인증 Token을 즉시 무효화한다. 로그아웃 이후 기존 Token으로 보호 API를 호출하면 401 또는 403을 반환한다.
의도된 취약 동작: 로그아웃 이후에도 기존 인증 Token이 유효한 상태로 유지된다.
탐지 기준: 로그아웃 이후 기존 Token으로 보호 API를 호출했을 때 200 응답이 반환되면 취약하다.

---

bugId: site026-bug02
csvId: SEC-262
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (초대 메시지)
발생 API:
- POST /api/invitations
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 초대 메시지를 작성한다.
3. 로그아웃한다.
4. 기존 Token으로 초대 메시지 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 초대 메시지 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 보호 API 요청 시 200이면 취약하다.

---

bugId: site026-bug03
csvId: SEC-263
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (배송 메모)
발생 API:
- POST /api/shipping/memo
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 수강 또는 클래스 관련 배송 메모를 입력한다.
3. 로그아웃한다.
4. 기존 Token으로 배송 메모 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 배송 메모 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site026-bug04
csvId: SEC-264
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (환불 사유)
발생 API:
- POST /api/refunds/reason
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 환불 사유를 입력한다.
3. 로그아웃한다.
4. 기존 Token으로 환불 사유 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 환불 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청 시 200이면 취약하다.

---

bugId: site026-bug05
csvId: SEC-265
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (검색 제안)
발생 API:
- GET /api/search/suggestions
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 클래스 검색창에 검색어를 입력한다.
3. 검색 제안 API를 호출한다.
4. 로그아웃한다.
5. 기존 Token으로 검색 제안 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 검색 제안 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site026-bug06
csvId: SEC-266
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (알림 제목)
발생 API:
- POST /api/notifications/title
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 알림 제목 기능을 이용한다.
2. 로그아웃한다.
3. 기존 Token으로 알림 제목 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 알림 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청하여 200이 반환되면 취약하다.

---

bugId: site026-bug07
csvId: SEC-267
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (캘린더 제목)
발생 API:
- POST /api/calendar/title
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 학습 일정 캘린더 제목을 입력한다.
2. 로그아웃한다.
3. 기존 Token으로 캘린더 제목 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 캘린더 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청 시 200이면 취약하다.

---

bugId: site026-bug08
csvId: SEC-268
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (리포트 필터)
발생 API:
- GET /api/learning/report?filter=
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 학습 리포트 화면에 접근한다.
2. 리포트 필터를 선택한다.
3. 로그아웃한다.
4. 기존 Token으로 리포트 필터 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 리포트 필터 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site026-bug09
csvId: SEC-269
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (CSV 업로드)
발생 API:
- POST /api/learning/csv
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 학습 데이터 CSV 업로드 기능을 이용한다.
2. 로그아웃한다.
3. 기존 Token으로 CSV 업로드 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 CSV 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site026-bug10
csvId: SEC-270
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (API query)
발생 API:
- GET /api/classes/query
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 클래스 API query 기능을 이용한다.
2. 로그아웃한다.
3. 기존 Token으로 API query 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 성공 후 기존 Token을 즉시 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 API query 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 보호 API 요청 시 200이면 취약하다.
