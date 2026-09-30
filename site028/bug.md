# Security Bugs Report (site028)

bugId: site028-bug01
csvId: SEC-281
type: security-headers
한국어 유형: 보안 헤더 누락 (로그인 폼)
발생 API:
- POST /api/login
발생 조건:
1. 상단 네비게이션 바에서 로그인 버튼을 클릭하여 로그인 모달을 연다.
2. 이메일과 비밀번호를 입력하고 로그인 요청을 전송한다.
3. POST /api/login 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/login') 라우트 핸들러
PPO 기대 행동: 로그인 폼 제출 후 발생하는 API 응답 헤더를 동적으로 캡처하고 누락된 CSP 헤더를 식별한다.

---

bugId: site028-bug02
csvId: SEC-282
type: security-headers
한국어 유형: 보안 헤더 누락 (회원가입 폼)
발생 API:
- POST /api/register
발생 조건:
1. 회원가입 모달에서 이름, 이메일, 비밀번호, 연락처를 입력하고 회원가입 폼을 제출한다.
2. POST /api/register 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Strict-Transport-Security 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/register') 라우트 핸들러
PPO 기대 행동: 회원가입 API 응답 헤더를 점검하여 Strict-Transport-Security 헤더 누락을 탐지한다.

---

bugId: site028-bug03
csvId: SEC-283
type: security-headers
한국어 유형: 보안 헤더 누락 (주소 필드)
발생 API:
- POST /api/profile/address
발생 조건:
1. 상단 프로필 버튼을 클릭하여 주소 관리 창을 연다.
2. 우편번호, 기본 주소, 상세 주소를 입력하고 저장 버튼을 누른다.
3. POST /api/profile/address 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/profile/address') 라우트 핸들러
PPO 기대 행동: 주소 저장 요청의 응답 헤더를 분석하여 nosniff(X-Content-Type-Options) 누락을 탐지한다.

---

bugId: site028-bug04
csvId: SEC-284
type: security-headers
한국어 유형: 보안 헤더 누락 (쿠폰 필드)
발생 API:
- POST /api/coupon
발생 조건:
1. 예약 확인 또는 결제 모달에서 쿠폰 코드(예: AURA2026, FLYSKY10)를 입력하고 적용 버튼을 클릭한다.
2. POST /api/coupon 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy 및 Strict-Transport-Security 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/coupon') 라우트 핸들러
PPO 기대 행동: 쿠폰 검증 응답 헤더를 검사하여 누락된 필수 보안 헤더를 탐지한다.

---

bugId: site028-bug05
csvId: SEC-285
type: security-headers
한국어 유형: 보안 헤더 누락 (정렬 파라미터)
발생 API:
- GET /api/flights?sort=
발생 조건:
1. 항공권 목록 화면에서 정렬 옵션(가격 낮은순, 높은순, 비행시간순)을 변경한다.
2. GET /api/flights?sort= 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Strict-Transport-Security 및 X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/flights') 라우트 핸들러 내 sort 분기
PPO 기대 행동: 항공편 정렬 파라미터 요청 시 반환되는 헤더에서 누락된 보안 설정을 판별한다.

---

bugId: site028-bug06
csvId: SEC-286
type: security-headers
한국어 유형: 보안 헤더 누락 (페이지네이션)
발생 API:
- GET /api/flights?page=
발생 조건:
1. 항공권 목록 하단의 페이지네이션 버튼(1, 2 페이지 등)을 클릭하여 이동한다.
2. GET /api/flights?page= 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy 및 X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/flights') 라우트 핸들러 내 page 분기
PPO 기대 행동: 페이지네이션 쿼리가 포함된 API 응답 헤더를 검사하여 보안 헤더 결손을 탐지한다.

---

bugId: site028-bug07
csvId: SEC-287
type: security-headers
한국어 유형: 보안 헤더 누락 (숙소 검색 필터)
발생 API:
- GET /api/accommodations?location=
발생 조건:
1. 숙소 탐색 화면에서 지역 필터(예: 다낭, 교토, 스위스, 하와이, 발리)를 선택하거나 검색어를 입력하여 조회한다.
2. GET /api/accommodations?location= 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy 및 Strict-Transport-Security 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/accommodations') 라우트 핸들러 내 location 분기
PPO 기대 행동: 지역 필터가 적용된 숙소 검색 응답의 헤더를 검증하여 취약점을 탐지한다.

---

bugId: site028-bug08
csvId: SEC-288
type: security-headers
한국어 유형: 보안 헤더 누락 (예약 정보 조회)
발생 API:
- GET /api/bookings/:bookingId
발생 조건:
1. '내 예약' 드로어에서 특정 예약 항목을 클릭하여 예약 상세 바우처 정보를 조회한다.
2. GET /api/bookings/:bookingId 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy 및 X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/bookings/:bookingId') 라우트 핸들러
PPO 기대 행동: 단일 예약 상세 조회 API 응답 헤더를 검사하여 보안 헤더 누락을 탐지한다.

---

bugId: site028-bug09
csvId: SEC-289
type: security-headers
한국어 유형: 보안 헤더 누락 (찜 목록 저장)
발생 API:
- POST /api/wishlist
발생 조건:
1. 숙소나 추천 여행지 카드에서 하트(찜하기) 버튼을 클릭하여 관심 상품으로 등록/해제한다.
2. POST /api/wishlist 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/wishlist') 라우트 핸들러
PPO 기대 행동: 찜하기 액션 실행 후 반환되는 응답의 HTTP 헤더 상태를 확인하여 취약점을 탐지한다.

---

bugId: site028-bug10
csvId: SEC-290
type: security-headers
한국어 유형: 보안 헤더 누락 (여행 일정 저장)
발생 API:
- POST /api/itineraries
발생 조건:
1. 여행 플래너 탭에서 나만의 여행 일정 제목, 방문 장소, 메모를 작성하고 저장 버튼을 누른다.
2. POST /api/itineraries 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Strict-Transport-Security 보안 헤더가 누락된다.
탐지 기준: 세 가지 보안 헤더 중 하나 이상이 누락되어 있으면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/itineraries') 라우트 핸들러
PPO 기대 행동: 여행 일정 생성 API 요청의 응답 헤더에서 HSTS 누락 여부를 탐지한다.
