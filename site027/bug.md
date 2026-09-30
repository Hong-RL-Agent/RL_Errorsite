# Security Bugs Report (site027)

bugId: site027-bug01
csvId: SEC-271
type: security-headers
한국어 유형: 보안 헤더 누락 (검색창)
발생 API:
- GET /api/search
발생 조건:
1. 여행지 검색창에서 키워드를 입력하고 검색을 수행한다.
2. GET /api/search 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy, Strict-Transport-Security 등의 보안 헤더가 누락되어 출력된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug02
csvId: SEC-272
type: security-headers
한국어 유형: 보안 헤더 누락 (프로필 소개)
발생 API:
- POST /api/profile
발생 조건:
1. 여행자 마이페이지 프로필 소개 및 여권 정보를 수정 후 저장한다.
2. POST /api/profile 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 X-Content-Type-Options, Content-Security-Policy 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug03
csvId: SEC-273
type: security-headers
한국어 유형: 보안 헤더 누락 (문의 폼)
발생 API:
- POST /api/support
발생 조건:
1. 1:1 여행 상담 센터에서 문의글을 작성하고 접수를 완료한다.
2. POST /api/support 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Strict-Transport-Security, X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug04
csvId: SEC-274
type: security-headers
한국어 유형: 보안 헤더 누락 (상품명 필드)
발생 API:
- GET /api/products
발생 조건:
1. 여행 상품 전체 목록을 조회한다.
2. GET /api/products 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy, X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug05
csvId: SEC-275
type: security-headers
한국어 유형: 보안 헤더 누락 (파일 설명)
발생 API:
- POST /api/files
발생 조건:
1. 여행 관련 확인 서류 및 파일 설명 정보를 등록한다.
2. POST /api/files 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Strict-Transport-Security, Content-Security-Policy 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug06
csvId: SEC-276
type: security-headers
한국어 유형: 보안 헤더 누락 (댓글 입력)
발생 API:
- POST /api/reviews
발생 조건:
1. 여행 숙소 및 투어 상품 후기 리뷰를 작성하여 전송한다.
2. POST /api/reviews 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 X-Content-Type-Options, Strict-Transport-Security 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug07
csvId: SEC-277
type: security-headers
한국어 유형: 보안 헤더 누락 (예약 메모)
발생 API:
- POST /api/orders/reservation
발생 조건:
1. 숙소 예약 폼에서 투숙 인원과 요청 메모를 작성하여 예약을 요청한다.
2. POST /api/orders/reservation 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy, Strict-Transport-Security 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug08
csvId: SEC-278
type: security-headers
한국어 유형: 보안 헤더 누락 (장바구니)
발생 API:
- POST /api/cart
발생 조건:
1. 관심 있는 여행 패키지를 장바구니에 담는다.
2. POST /api/cart 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 X-Content-Type-Options, Content-Security-Policy 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug09
csvId: SEC-279
type: security-headers
한국어 유형: 보안 헤더 누락 (결제 폼)
발생 API:
- POST /api/payment
발생 조건:
1. 장바구니에 담긴 상품을 결제 승인 요청한다.
2. POST /api/payment 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Strict-Transport-Security, X-Content-Type-Options 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.

---

bugId: site027-bug10
csvId: SEC-280
type: security-headers
한국어 유형: 보안 헤더 누락 (필터 파라미터)
발생 API:
- GET /api/products?filter=
발생 조건:
1. 카테고리 또는 지역 필터 파라미터(?filter=)를 포함하여 상품 목록을 조회한다.
2. GET /api/products?filter= 응답의 HTTP Header를 검사한다.
기대되는 정상 동작: 응답 헤더에 Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options 필수 보안 헤더가 모두 포함되어야 한다.
의도된 취약 동작: 응답 헤더에서 Content-Security-Policy, Strict-Transport-Security 보안 헤더가 누락된다.
탐지 기준: CSP, HSTS, X-Content-Type-Options 중 하나 이상이 누락되어 있으면 취약하다.
