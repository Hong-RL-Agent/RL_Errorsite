# BUGS

## 1. site008-bug01
- **Bug ID:** `site008-bug01`
- **CSV Error:** DB 집계 오류
- **Type:** `database-aggregation`
- **발생 위치:** `server.js` 의 `GET /api/movies` 내 평점 계산 로직
- **관련 파일:** `server.js`, `public/index.html`, `public/js/app.js`
- **data-bug-id Selector:** `#modal-rating[data-bug-id="site008-bug01"]`
- **사용자가 경험하는 증상:** 
  - 특정 영화의 리뷰가 1개뿐이고 해당 리뷰의 별점이 5점이더라도, 상세 모달이나 썸네일에 표시되는 영화의 평균 평점이 5.0이 아닌 0.5로 비정상적으로 낮게 노출됩니다.
- **코드상 의도된 원인:**
  - 백엔드에서 평균을 구하기 위해 `totalScore / movieReviews.length` 를 해야 하지만, 강제로 `totalScore / 10` (고정값 10)으로 나누도록 수식을 의도적으로 잘못 작성했습니다.
- **PPO 에이전트 기대 행동:**
  - 여러 레코드의 값을 집계(Aggregation, SUM/AVG 등)하는 과정에서 분모가 되는 모집단 수(Count) 기준을 동적으로 처리하지 않고 하드코딩하여 비즈니스 로직(평균치)이 왜곡되는 데이터 처리 결함을 식별해야 합니다.

## 2. site008-bug02
- **Bug ID:** `site008-bug02`
- **CSV Error:** 잘못된 Content-Type 응답
- **Type:** `network-content-type`
- **발생 위치:** `server.js` 의 `GET /api/reviews` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html`, `public/js/app.js`
- **data-bug-id Selector:** `#review-error-msg[data-bug-id="site008-bug02"]`
- **사용자가 경험하는 증상:**
  - 홈 화면의 '실시간 인기 리뷰' 하단에 붉은 글씨로 파싱 에러 경고가 표시될 수 있으며, 브라우저의 개발자 도구(Console/Network 탭)에서 응답 헤더가 JSON 형식임에도 `text/plain`으로 수신되는 것을 확인할 수 있습니다.
- **코드상 의도된 원인:**
  - API 백엔드에서 리뷰 목록 JSON 데이터를 반환하기 직전, 고의로 `res.setHeader('Content-Type', 'text/plain');` 코드를 삽입하여 HTTP 응답 헤더를 오염시켰습니다.
- **PPO 에이전트 기대 행동:**
  - 서버 응답 바디의 데이터 포맷(JSON)과 HTTP 응답 헤더의 `Content-Type` 선언이 불일치하여, 클라이언트의 보안/파서 정책에 혼란을 주거나 데이터 처리가 오작동할 수 있는 네트워크 헤더 설정 오류를 탐지해야 합니다.

## 3. site008-bug03
- **Bug ID:** `site008-bug03`
- **CSV Error:** 저장형 XSS 취약점
- **Type:** `security-xss`
- **발생 위치:** `server.js` 의 `POST /api/reviews` 및 프론트 렌더링 영역
- **관련 파일:** `server.js`, `public/index.html`, `public/js/app.js`
- **data-bug-id Selector:** `button[type="submit"][data-bug-id="site008-bug03"]`
- **사용자가 경험하는 증상:**
  - 영화 상세 모달의 리뷰 작성 창에 `<img src="x" onerror="alert('XSS 취약점 발생')">` 와 같은 HTML 태그를 섞어서 리뷰를 등록하면, 그 즉시 혹은 다른 유저가 리뷰 목록을 열어볼 때마다 화면에 강제로 팝업(alert) 창이 실행됩니다.
- **코드상 의도된 원인:**
  - `server.js`에서 리뷰 내용(`content`)을 DB에 저장할 때 `<`, `>`, `&` 등의 특수문자를 이스케이프 치환하지 않고 원본 그대로 저장하며, 프론트엔드 역시 `innerHTML` 속성을 통해 이를 DOM에 그대로 삽입합니다.
- **PPO 에이전트 기대 행동:**
  - 사용자의 악성 입력값이 서버 데이터베이스에 저장되었다가, 차후 페이지 렌더링 시 브라우저에서 스크립트로 실행되어 버리는 전형적인 저장형 크로스 사이트 스크립팅(Stored XSS) 취약점을 공격 페이로드 주입을 통해 검증해내야 합니다.
