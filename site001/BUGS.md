# BUGS

## 1. site001-bug01
- **Bug ID:** `site001-bug01`
- **CSV Error:** 잘못된 DB 필터 조건
- **Type:** `database-query`
- **발생 위치:** `server.js` 의 `GET /api/products` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (카테고리 버튼), `public/js/app.js` (API 호출부)
- **data-bug-id Selector:** `.cat-btn[data-bug-id="site001-bug01"]`
- **사용자가 경험하는 증상:** 
  - 사용자가 '전자기기' 또는 '도서' 등 특정 카테고리 버튼을 클릭했을 때, 해당 카테고리에 속한 전체 상품이 나오는 것이 아니라, 상품의 '제목'에 해당 카테고리 단어가 포함된 상품만 검색되어 나옵니다. 이로 인해 정상적인 상품들이 목록에서 누락됩니다.
- **코드상 의도된 원인:**
  - 서버 측 DB 쿼리(배열 필터링) 시 `product.category === category` 조건을 검사해야 하지만, 고의로 `product.title.includes(category)` 로 조건을 잘못 작성했습니다.
- **PPO 에이전트 기대 행동:**
  - 카테고리 필터 요청(`?category=전자기기`)을 보냈을 때 반환된 데이터의 `category` 필드를 검증하여, 조건과 일치하지 않거나 누락된 데이터가 있음을 탐지해야 합니다.

## 2. site001-bug02
- **Bug ID:** `site001-bug02`
- **CSV Error:** 네트워크 타임아웃 처리 누락
- **Type:** `network-timeout`
- **발생 위치:** `server.js` 의 `POST /api/favorites` 엔드포인트 및 `public/js/app.js` 의 관심 상품 저장 로직
- **관련 파일:** `server.js`, `public/index.html` (저장 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#modal-fav-btn[data-bug-id="site001-bug02"]`
- **사용자가 경험하는 증상:**
  - 대부분의 상품은 찜하기 클릭 시 즉시 성공 알림이 뜨지만, 특정 상품(아이패드 프로, id: 'p3')에서 찜하기를 클릭하면 버튼이 "저장 중..." 상태로 변한 뒤 아무 반응 없이 무한 로딩 상태에 빠집니다.
- **코드상 의도된 원인:**
  - 서버에서 `productId === 'p3'` 인 경우 `setTimeout`을 통해 30초 동안 응답을 지연시킵니다.
  - 클라이언트(`app.js`)의 `fetch` 로직에는 타임아웃이나 재시도 관련 예외 처리가 구현되어 있지 않아, 사용자는 무한 대기 상태를 경험하게 됩니다.
- **PPO 에이전트 기대 행동:**
  - API 요청을 가로채거나 지연 시간을 분석하여, 비정상적으로 긴 응답 시간(타임아웃 임계치 초과)을 감지하고 클라이언트단에서 적절한 폴백(fallback) 메커니즘이 부재함을 탐지해야 합니다.

## 3. site001-bug03
- **Bug ID:** `site001-bug03`
- **CSV Error:** 인증 우회 취약점
- **Type:** `security-authentication`
- **발생 위치:** `server.js` 의 `GET /api/mypage` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (마이페이지 및 개발자 테스트 버튼), `public/js/app.js`
- **data-bug-id Selector:** `h3[data-bug-id="site001-bug03"]`
- **사용자가 경험하는 증상:**
  - 로그인 과정을 거치지 않은 비인가 사용자라도, 개발자 도구를 통해 API 요청 헤더에 `x-user-id`만 임의로 추가하여 요청하면 타인의 마이페이지 정보에 모두 접근할 수 있습니다.
- **코드상 의도된 원인:**
  - `GET /api/mypage` API에서 JWT 토큰 서명 검증이나 세션 확인 등 정상적인 인가(Authorization) 절차를 수행하지 않고, 단순히 `req.headers['x-user-id']` 헤더의 존재 여부 및 값만으로 인증을 통과시킵니다.
- **PPO 에이전트 기대 행동:**
  - 정상적인 토큰 없이 헤더 조작만으로 보호된 엔드포인트에 접근(200 OK 및 민감 정보 반환)되는 것을 보안 취약점으로 식별해야 합니다.
