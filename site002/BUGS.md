# BUGS

## 1. site002-bug01
- **Bug ID:** `site002-bug01`
- **CSV Error:** DB 정렬 기준 오류
- **Type:** `database-query`
- **발생 위치:** `server.js` 의 `GET /api/books` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (정렬 셀렉트), `public/js/app.js`
- **data-bug-id Selector:** `select[data-bug-id="site002-bug01"]`
- **사용자가 경험하는 증상:** 
  - 도서 목록 화면에서 '평점순 (추천)'으로 정렬 기준을 변경해도, 별점(rating)이 높은 순서대로 책이 정렬되지 않고 실제로는 등록일(createdAt) 기준으로 정렬됩니다.
- **코드상 의도된 원인:**
  - 서버에서 `req.query.sort === 'rating'` 조건을 받았을 때, `b.rating - a.rating` 대신 고의로 `new Date(b.createdAt) - new Date(a.createdAt)`로 배열을 정렬합니다.
- **PPO 에이전트 기대 행동:**
  - `?sort=rating` 요청에 대한 응답 데이터를 분석하여, 결과 배열이 `rating` 필드 기준으로 정렬되어 있지 않음을 탐지해야 합니다.

## 2. site002-bug02
- **Bug ID:** `site002-bug02`
- **CSV Error:** 잘못된 HTTP 상태 코드
- **Type:** `network-http-status`
- **발생 위치:** `server.js` 의 `POST /api/rentals` 엔드포인트 및 `public/js/app.js` 대여 로직
- **관련 파일:** `server.js`, `public/index.html` (대여 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#submit-rent-btn[data-bug-id="site002-bug02"]`
- **사용자가 경험하는 증상:**
  - '대여 불가' 상태인 도서를 대여 시도했을 때, 대여 실패 메시지가 나타나긴 하지만, 브라우저 콘솔이나 네트워크 탭에서는 해당 요청이 정상(200 OK) 처리된 것처럼 보입니다. 일부 클라이언트 로직에서는 이를 성공으로 오인하여 화면 전환이나 새로고침을 실행할 수 있습니다.
- **코드상 의도된 원인:**
  - 대여 실패 조건(`!book.available`)에서 `res.status(400)`과 같이 에러 코드를 반환해야 하지만, 고의로 `return res.status(200).json({ success: false, error: '...' })` 형태로 200 OK 코드를 강제 반환합니다.
- **PPO 에이전트 기대 행동:**
  - API의 응답 본문 구조(`success: false` 또는 `error` 필드 존재)가 실패를 의미하는데도 HTTP 상태 코드는 `200`을 반환하는 논리적 모순을 식별해야 합니다.

## 3. site002-bug03
- **Bug ID:** `site002-bug03`
- **CSV Error:** 민감정보 응답 노출
- **Type:** `security-data-exposure`
- **발생 위치:** `server.js` 의 `GET /api/user` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (사용자 정보 새로고침 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#fetch-user-btn[data-bug-id="site002-bug03"]`
- **사용자가 경험하는 증상:**
  - 화면 상으로는 정상적인 대시보드 데이터만 보이지만, 브라우저 개발자 도구(Network 탭)로 `/api/user` 응답 데이터를 확인해보면 백엔드 DB에만 있어야 할 비밀번호 해시값(`passwordHash`)과 내부 시스템 통신용 토큰(`internalToken`)이 평문으로 전송되고 있습니다.
- **코드상 의도된 원인:**
  - 이용자 정보를 클라이언트로 전송하기 전에 민감한 필드를 삭제(DTO 변환 등)하지 않고, DB 레코드 전체(가상 객체)를 그대로 `res.json()`으로 반환하도록 작성했습니다.
- **PPO 에이전트 기대 행동:**
  - API 응답 페이로드를 스캔하여 `passwordHash`, `token`, `secret` 등의 패턴을 가진 키/값이 클라이언트로 전송되는 정보 유출 취약점을 탐지해야 합니다.
