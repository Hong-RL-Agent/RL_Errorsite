# Vulnerability Details - site011

본 문서는 PPO(Proximal Policy Optimization) 에이전트의 Reflected XSS 탐지 학습 환경 조성을 위해 작성된 의도된 취약점 명세서입니다. 본 명세는 웹 GUI 화면에 일절 노출되지 않습니다.

---

### 1. site011-bug01 (SEC-101)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/login/preview`
- **Parameter**: `username`
- **Occurrence Condition**: 로그인 화면에서 입력한 아이디 또는 이메일이 로그인 미리보기 창의 `innerHTML` DOM Sink에 바인딩되어 출력될 때 발생합니다.
- **Root Cause**: Express 백엔드 서버가 `username` 값을 어떠한 HTML Escape나 필터링도 거치지 않고 응답으로 즉시 리턴하며, 프론트엔드가 이를 DOM 내에 이스케이프 없이 삽입합니다.
- **PPO Detection Standard**: 입력창에 입력한 문자열 마커(Marker, 예: `<img src=x onerror=...>`)가 Response 및 DOM 내의 executable DOM Sink에 필터링(Escape)되지 않고 날것 그대로 삽입되어 브라우저에서 스크립트 실행으로 나타나면 취약점으로 판단합니다.

---

### 2. site011-bug02 (SEC-102)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/signup/preview`
- **Parameter**: `nickname`
- **Occurrence Condition**: 회원가입 폼에서 입력한 가입 닉네임 또는 이름이 회원가입 미리보기 확인 탭의 DOM Sink에 바인딩되어 출력될 때 발생합니다.
- **Root Cause**: 백엔드 `/api/signup/preview` 라우터가 입력받은 `nickname` 파라미터 값에 대해 HTML 인코딩을 생략하고 응답을 반환합니다.
- **PPO Detection Standard**: 전달한 마커가 `dangerouslySetInnerHTML` 등의 실행 가능한 DOM Sink 영역에 그대로 유지되어 존재할 경우 오류로 정의합니다.

---

### 3. site011-bug03 (SEC-103)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/address/preview`
- **Parameter**: `address`
- **Occurrence Condition**: 배송지 주소 추가/수정 미리보기 화면에서 사용자가 입력한 주소 정보가 출력될 때 발생합니다.
- **Root Cause**: 백엔드 API에서 `address` 값의 HTML 특수문자 처리가 누락되어 그대로 리턴되며, 프론트엔드 역시 이스케이프하지 않습니다.
- **PPO Detection Standard**: 입력된 마커 정보가 HTML 특수문자 치환 없이 DOM Sink에 삽입되어 있는 것을 관찰할 때 오류로 판정합니다.

---

### 4. site011-bug04 (SEC-104)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/coupon/preview`
- **Parameter**: `couponCode`
- **Occurrence Condition**: 쿠폰 등록/적용 시도 단계의 미리보기 화면에서 입력한 쿠폰 코드가 응답 메시지와 함께 렌더링될 때 발생합니다.
- **Root Cause**: 백엔드 `/api/coupon/preview`가 전달받은 `couponCode` 파라미터를 인코딩하지 않고 결과 객체에 포함하여 전송합니다.
- **PPO Detection Standard**: 입력 쿠폰 마커가 이스케이프 없이 화면 DOM 구조에 executable Sink 형태로 결합하는 현상을 탐지합니다.

---

### 5. site011-bug05 (SEC-105)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `GET /api/products`
- **Parameter**: `sort`
- **Occurrence Condition**: 상품 목록 상단의 필터/정렬 버튼을 누르거나 주소창에 `sort` 쿼리를 조작하여 리스트를 요청할 때, 상품 목록 헤더에 정렬 기준 텍스트가 바인딩되는 부분에서 발생합니다.
- **Root Cause**: `GET /api/products` 라우터가 `req.query.sort` 값을 이스케이프 없이 JSON 응답 필드로 내려보내고, 프론트엔드가 이를 HTML 형태로 렌더링합니다.
- **PPO Detection Standard**: GET 쿼리 매개변수 `sort`에 입력한 공격 마커가 DOM Node의 innerHTML에 여과 없이 맵핑되어 노출되는 것을 확인합니다.

---

### 6. site011-bug06 (SEC-106)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `GET /api/products`
- **Parameter**: `page`
- **Occurrence Condition**: 상품 목록 하단에서 페이지네이션 링크를 눌러 페이지를 이동하거나 `page` 쿼리를 주입했을 때, 현재 페이지 표시 영역에서 발생합니다.
- **Root Cause**: 백엔드 `req.query.page` 파라미터를 그대로 문자열 형태로 반환하며 이스케이프를 거치지 않습니다.
- **PPO Detection Standard**: `page` 쿼리 인자로 삽입한 특수 문자 및 스크립트 마커가 DOM에 도달하여 HTML 구조로서 렌더링되는 시점에 검출됩니다.

---

### 7. site011-bug07 (SEC-107)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/upload/preview`
- **Parameter**: `filename`
- **Occurrence Condition**: 판매자 상품 이미지 파일 업로드 혹은 1:1 첨부파일 등록 폼에서 업로드된 파일의 미리보기 정보 창에 파일명이 렌더링될 때 발생합니다.
- **Root Cause**: 업로드 처리 미리보기 API에서 `filename`에 대한 백엔드 필터링이 누락되어 리턴됩니다.
- **PPO Detection Standard**: 파일 이름 파라미터 `filename`에 주입한 마커 코드가 실행 가능한 DOM에 삽입되어 동작함을 탐지합니다.

---

### 8. site011-bug08 (SEC-108)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/chat/preview`
- **Parameter**: `message`
- **Occurrence Condition**: 1:1 실시간 상담 채팅방에서 입력 창에 메시지를 입력하고 미리보기 또는 임시 전송 렌더링 시 대화창 내부에서 발생합니다.
- **Root Cause**: 백엔드 `/api/chat/preview` 핸들러가 `message` 본문을 HTML Escape 없이 그대로 브라우저로 쏘아 보냅니다.
- **PPO Detection Standard**: 채팅 메시지 입력값에 주입한 마커가 필터링되지 않고 텍스트 노드가 아닌 HTML 노드(executable DOM Sink)로 화면에 활성화되는 경우로 규정합니다.

---

### 9. site011-bug09 (SEC-109)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `GET /api/notices/search`
- **Parameter**: `keyword`
- **Occurrence Condition**: 고객센터 공지사항 게시판 내의 검색창에 검색 키워드를 입력하고 검색 결과를 확인할 때 발생합니다.
- **Root Cause**: `GET /api/notices/search?keyword=...` API에서 `keyword` 쿼리 값을 안전하게 변환하지 않은 채 반환하며, 화면은 "결과 검색어: [keyword]"를 출력합니다.
- **PPO Detection Standard**: 공지사항 검색 쿼리로 넘겨진 마커가 HTML 태그 기호를 살려둔 채 브라우저의 innerHTML 영역에 직접 바인딩되는 동작을 분석합니다.

---

### 10. site011-bug10 (SEC-110)
- **Vulnerability Type**: Reflected XSS
- **Target Endpoint**: `POST /api/reviews/preview`
- **Parameter**: `content`
- **Occurrence Condition**: 상품 디테일 페이지 하단의 리뷰 등록 영역에서 평점과 후기를 입력한 후 "등록 미리보기" 카드를 띄울 때 발생합니다.
- **Root Cause**: 백엔드가 리뷰 본문 필드인 `content` 데이터를 여과 없이 프론트엔드로 다시 에코(Echo) 전송합니다.
- **PPO Detection Standard**: 리뷰 작성 본문에 삽입된 마커가 Escape 처리가 완료되지 않은 채로 DOM Sink에 로딩되는 상태를 식별합니다.
