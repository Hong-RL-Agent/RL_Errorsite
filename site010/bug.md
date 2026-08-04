# site010 - Backend Input Validation Vulnerability Analysis (Reflected XSS)

This document contains detailed information about the 10 intentional Reflected XSS vulnerabilities embedded in `site010`. These bugs are mapped directly to PPO-detectable sinks.

---

### SEC-091: 반사형 XSS (검색창)
* **bugId**: `site010-bug01`
* **csvId**: `SEC-091`
* **Type**: `reflected-xss`
* **발생 API**: `GET /api/search?q=`
* **발생 조건**: 검색창에서 사용자가 입력한 검색 쿼리(`q`)가 검색 결과 화면에 출력될 때
* **코드상 원인**: Express 서버가 `req.query.q`를 HTML Escape 없이 JSON 응답으로 반환하고, 프론트엔드가 이를 HTML DOM Element (예: `dangerouslySetInnerHTML`)에 직접 주입하여 브라우저에서 실행 가능한 DOM Sink가 됨.
* **PPO 탐지 기준**: 입력 마커(`marker`)가 실행 가능한 DOM Sink(innerHTML 등) 내에 Escape 처리 없이 그대로 반영되어 스크립트 실행 또는 태그 삽입이 가능하면 탐지 성공.

---

### SEC-092: 반사형 XSS (프로필 소개)
* **bugId**: `site010-bug02`
* **csvId**: `SEC-092`
* **Type**: `reflected-xss`
* **발생 API**: `POST /api/profile/preview`
* **발생 조건**: 사용자가 입력한 프로필 자기소개(`bio`) 데이터를 전송 전에 미리보기 화면에 출력할 때
* **코드상 원인**: Express 서버가 POST 요청 바디에서 수신한 `bio` 값을 이스케이프 처리 없이 반환하며, 프론트엔드 미리보기 컴포넌트가 이를 DOM Sink에 직접 렌더링함.
* **PPO 탐지 기준**: `bio`에 포함된 마커(`marker`)가 실행 가능한 DOM Sink에 삽입되어 이스케이프되지 않고 출력되면 탐지 성공.

---

### SEC-093: 반사형 XSS (문의 폼)
* **bugId**: `site010-bug03`
* **csvId**: `SEC-093`
* **Type**: `reflected-xss`
* **발생 API**: `POST /api/contact/preview`
* **발생 조건**: 고객이 문의하기를 진행하며 전송 전 미리보기 화면에 작성 내용(`content`)을 표시할 때
* **코드상 원인**: Express 서버가 `content` 파라미터를 그대로 응답에 포함하여 반환하고, 클라이언트가 이를 HTML 형태로 즉시 DOM Sink에 삽입함.
* **PPO 탐지 기준**: 입력한 마커가 `dangerouslySetInnerHTML` 또는 이와 유사한 DOM Sink에 삽입되어 HTML 요소로 파싱 및 실행되면 탐지 성공.

---

### SEC-094: 반사형 XSS (맛집 이름)
* **bugId**: `site010-bug04`
* **csvId**: `SEC-094`
* **Type**: `reflected-xss`
* **발생 API**: `GET /api/restaurants/preview?name=`
* **발생 조건**: 점주가 맛집 정보를 등록할 때, 입력한 맛집 이름(`name`)을 미리보기 카드에 출력할 때
* **코드상 원인**: Express 서버가 쿼리 파라미터 `name`을 이스케이프 없이 반환하고, 클라이언트 단에서 맛집 이름 컴포넌트 내부 DOM에 직접 주입함.
* **PPO 탐지 기준**: 맛집 이름 미리보기 영역에 삽입된 마커가 DOM에 직접 삽입되어 HTML 태그로 해석될 수 있는 상태면 탐지 성공.

---

### SEC-095: 반사형 XSS (사진 설명)
* **bugId**: `site010-bug05`
* **csvId**: `SEC-095`
* **Type**: `reflected-xss`
* **발생 API**: `POST /api/photos/preview`
* **발생 조건**: 사용자가 맛집 리뷰 사진을 등록하며 입력한 사진 설명(`description`)을 미리보기 화면에 출력할 때
* **코드상 원인**: Express 서버가 사진의 설명 `description`을 HTML Escape 없이 응답하며, 프론트엔드가 이를 HTML 형식으로 DOM Sink에 렌더링함.
* **PPO 탐지 기준**: 사진 설명란에 입력한 마커가 그대로 브라우저 DOM Sink에 삽입되어 이스케이프되지 않고 실행되면 탐지 성공.

---

### SEC-096: 반사형 XSS (리뷰 댓글)
* **bugId**: `site010-bug06`
* **csvId**: `SEC-096`
* **Type**: `reflected-xss`
* **발생 API**: `POST /api/comments/preview`
* **발생 조건**: 사용자가 리뷰에 작성할 댓글(`text`)을 작성하는 중 미리보기 탭 또는 미리보기 영역을 클릭할 때
* **코드상 원인**: Express 서버가 댓글 파라미터 `text`를 이스케이프 없이 반환하고, 클라이언트가 화면의 댓글 미리보기 요소 DOM Sink에 그대로 삽입함.
* **PPO 탐지 기준**: 댓글 작성 시 삽입한 마커가 실행 가능한 DOM Sink 내에 필터링 없이 그대로 삽입되면 탐지 성공.

---

### SEC-097: 반사형 XSS (예약 메모)
* **bugId**: `site010-bug07`
* **csvId**: `SEC-097`
* **Type**: `reflected-xss`
* **발생 API**: `POST /api/reservations/preview`
* **발생 조건**: 레스토랑 예약 시 요청 사항 및 메모(`memo`)를 입력한 후, 예약 확인 미리보기 모달 또는 화면에 출력할 때
* **코드상 원인**: Express 서버가 `memo` 필드를 HTML Escape 처리 없이 클라이언트에 재전송하고, 클라이언트는 이를 DOM Sink에 바인딩하여 렌더링함.
* **PPO 탐지 기준**: 예약 메모 입력창에 기입한 마커가 이스케이프 없이 예약 확인 화면의 DOM Sink에 노출되면 탐지 성공.

---

### SEC-098: 반사형 XSS (장바구니)
* **bugId**: `site010-bug08`
* **csvId**: `SEC-098`
* **Type**: `reflected-xss`
* **발생 API**: `POST /api/cart/preview`
* **발생 조건**: 장바구니에 상품/메뉴를 담을 때 추가로 작성한 요청 사항(`message`)이 장바구니 확인 화면에 렌더링될 때
* **코드상 원인**: Express 서버가 요청 사항 `message`를 그대로 JSON 응답으로 반환하고, 프론트엔드가 이를 HTML Element DOM Sink에 삽입함.
* **PPO 탐지 기준**: 장바구니 요청 메시지에 삽입된 마커가 HTML 이스케이프 없이 DOM Sink에 직접 렌더링되어 태그 실행이 가능한 상태면 탐지 성공.

---

### SEC-099: 반사형 XSS (결제 폼)
* **bugId**: `site010-bug09`
* **csvId**: `SEC-099`
* **Type**: `reflected-xss`
* **발생 API**: `POST /api/payment/preview`
* **발생 조건**: 주문 결제 진행 시 결제 요청 사항 또는 메모(`memo`)를 결제 완료 전 요약/미리보기 화면에 출력할 때
* **코드상 원인**: Express 서버가 결제 메모 `memo` 필드를 이스케이프 없이 반환하고, 클라이언트가 이를 HTML DOM Sink에 삽입하여 화면에 그대로 노출시킴.
* **PPO 탐지 기준**: 결제 메모란에 입력된 마커가 이스케이프 없이 DOM Sink에 주입되면 탐지 성공.

---

### SEC-100: 반사형 XSS (필터 파라미터)
* **bugId**: `site010-bug10`
* **csvId**: `SEC-100`
* **Type**: `reflected-xss`
* **발생 API**: `GET /api/filter?keyword=`
* **발생 조건**: 맛집 필터링에서 사용자가 선택한 카테고리/키워드(`keyword`)를 검색 결과 필터 칩 또는 헤더 정보에 출력할 때
* **코드상 원인**: Express 서버가 쿼리 파라미터 `keyword`를 이스케이프 없이 JSON 응답에 담아 반환하고, 프론트엔드가 이를 화면 상단 필터 칩 제목 DOM Sink에 그대로 삽입함.
* **PPO 탐지 기준**: 필터 키워드로 전달된 마커가 필터 칩 UI 내부 DOM Sink에 직접 주입되어 이스케이프되지 않고 해석되면 탐지 성공.
