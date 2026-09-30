# Security Bugs Report (site024)

bugId: site024-bug01
csvId: SEC-241
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (검색창)
발생 API:
- GET /api/search
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃을 수행한다.
3. 로그아웃 전에 사용하던 기존 Token으로 검색창 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 성공 후 기존 인증 Token을 즉시 무효화한다. 로그아웃 이후 기존 Token으로 보호 API를 호출하면 401 또는 403을 반환한다.
의도된 취약 동작: 로그아웃 이후에도 기존 인증 Token이 유효한 상태로 유지된다.
탐지 기준: 로그아웃 이후 기존 Token으로 보호 API를 호출했을 때 200 응답이 반환되면 취약하다.

---

bugId: site024-bug02
csvId: SEC-242
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (프로필 소개)
발생 API:
- POST /api/profile
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 기존 인증 Token을 확보한다.
2. 로그아웃한다.
3. 로그아웃 후 기존 Token으로 프로필 소개 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token을 사용하여 프로필 보호 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 API 호출 시 200 응답이면 취약하다.

---

bugId: site024-bug03
csvId: SEC-243
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (문의 폼)
발생 API:
- POST /api/support
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 Token을 확보한다.
2. 로그아웃한다.
3. 기존 Token으로 문의 폼 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 문의 API를 호출할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site024-bug04
csvId: SEC-244
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (상품명 필드)
발생 API:
- GET /api/products
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃한다.
3. 기존 Token으로 상품 관련 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token이 계속 유효하다.
탐지 기준: 로그아웃 후 기존 Token으로 보호 API 요청 시 200이면 취약하다.

---

bugId: site024-bug05
csvId: SEC-245
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (파일 설명)
발생 API:
- POST /api/files
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 Token을 확보한다.
2. 로그아웃한다.
3. 기존 Token으로 파일 설명 관련 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 시 기존 Token을 폐기한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 파일 관련 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token 요청이 200이면 취약하다.

---

bugId: site024-bug06
csvId: SEC-246
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (댓글 입력)
발생 API:
- POST /api/comments
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃한다.
3. 기존 Token으로 댓글 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 댓글 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청하여 200이 반환되면 취약하다.

---

bugId: site024-bug07
csvId: SEC-247
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (예약 메모)
발생 API:
- POST /api/trades/reservation
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 거래 예약 메모를 작성한다.
3. 로그아웃한다.
4. 기존 Token으로 예약 메모 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 예약 메모 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 보호 API 호출 시 200이면 취약하다.

---

bugId: site024-bug08
csvId: SEC-248
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (장바구니)
발생 API:
- POST /api/cart
- GET /api/cart
- POST /api/login
- POST /api/logout
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃한다.
3. 기존 Token으로 장바구니 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 이후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 장바구니 API를 호출할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 요청했을 때 200이면 취약하다.

---

bugId: site024-bug09
csvId: SEC-249
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (결제 폼)
발생 API:
- POST /api/payment
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃한다.
3. 로그아웃 전에 사용하던 기존 Token으로 결제 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 후 기존 Token을 즉시 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token으로 결제 관련 API에 접근할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 결제 API 요청 시 200이면 취약하다.

---

bugId: site024-bug10
csvId: SEC-250
type: logout-reuse
한국어 유형: 로그아웃 토큰 재사용 (필터 파라미터)
발생 API:
- GET /api/products?filter=
- POST /api/login
- POST /api/logout
- GET /api/session
발생 조건:
1. 로그인 후 인증 Token을 확보한다.
2. 로그아웃한다.
3. 기존 Token으로 상품 필터 보호 API를 다시 호출한다.
기대되는 정상 동작: 로그아웃 성공 후 기존 Token을 무효화한다.
의도된 취약 동작: 로그아웃 이후에도 기존 Token을 그대로 사용할 수 있다.
탐지 기준: 로그아웃 후 기존 Token으로 보호 API 요청 시 200이면 취약하다.
