# Security Bugs Report (site025)

bugId: site025-bug01
csvId: SEC-251
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (로그인 폼)
발생 API:
- POST /api/login
- POST /api/logout
- GET /api/session
- GET /api/auth/login-status
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃한다.
3. 로그아웃 후 기존 Token을 사용하여 로그인 상태 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 성공 후 기존 인증 Token을 즉시 무효화한다. 로그아웃 이후 기존 Token으로 보호 API를 호출하면 401 또는 403을 반환한다.
의도된 취약 동작: 로그아웃 이후에도 기존 인증 Token이 유효한 상태로 유지된다.
탐지 기준: 로그아웃 이후 기존 Token으로 보호 API를 호출했을 때 200 응답이 반환되면 취약하다.

---

bugId: site025-bug02
csvId: SEC-252
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (회원가입 폼)
발생 API:
- POST /api/register
- POST /api/logout
- GET /api/session
- GET /api/account/register-status
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃한다.
3. 기존 Token으로 회원 계정 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token을 사용하여 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 보호 API 요청 시 200이면 취약하다.

---

bugId: site025-bug03
csvId: SEC-253
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (주소 필드)
발생 API:
- POST /api/traveler/address
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 여행자 주소 정보를 입력한다.
3. 로그아웃한다.
4. 기존 Token으로 주소 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 주소 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site025-bug04
csvId: SEC-254
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (쿠폰 필드)
발생 API:
- POST /api/coupons/apply
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 쿠폰을 입력한다.
3. 로그아웃한다.
4. 기존 Token으로 쿠폰 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 쿠폰 관련 보호 API를 호출할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 쿠폰 API 요청 시 200이면 취약하다.

---

bugId: site025-bug05
csvId: SEC-255
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (정렬 파라미터)
발생 API:
- GET /api/travel-products?sort=
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 정렬 조건을 선택한다.
3. 로그아웃한다.
4. 기존 Token으로 정렬 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token을 사용하여 정렬 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site025-bug06
csvId: SEC-256
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (페이지네이션)
발생 API:
- GET /api/travel-products?page=
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 상품 목록의 페이지를 이동한다.
3. 로그아웃한다.
4. 기존 Token으로 페이지네이션 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 페이지네이션 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청하여 200이 반환되면 취약하다.

---

bugId: site025-bug07
csvId: SEC-257
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (파일명 필드)
발생 API:
- POST /api/travel-files
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 여행 관련 파일명을 입력한다.
3. 로그아웃한다.
4. 기존 Token으로 파일 관련 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 파일 관련 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site025-bug08
csvId: SEC-258
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (채팅 입력)
발생 API:
- POST /api/chat
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 여행 상담 채팅을 이용한다.
3. 로그아웃한다.
4. 기존 Token으로 채팅 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 채팅 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 채팅 API 요청 시 200이면 취약하다.

---

bugId: site025-bug09
csvId: SEC-259
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (공지사항)
발생 API:
- GET /api/announcements
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 공지사항 보호 API를 호출한다.
3. 로그아웃한다.
4. 기존 Token으로 공지사항 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 공지사항 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 공지사항 API 요청 시 200이면 취약하다.

---

bugId: site025-bug10
csvId: SEC-260
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (리뷰 입력)
발생 API:
- POST /api/reviews
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 여행 상품 리뷰 입력 기능을 이용한다.
3. 로그아웃한다.
4. 기존 Token으로 리뷰 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 성공 후 기존 Token을 즉시 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 리뷰 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 리뷰 API 요청 시 200이면 취약하다.
