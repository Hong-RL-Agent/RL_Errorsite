# BUGS

## 1. site004-bug01
- **Bug ID:** `site004-bug01`
- **CSV Error:** DB 날짜 비교 오류
- **Type:** `database-date-query`
- **발생 위치:** `server.js` 의 `GET /api/vaccines` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (다가오는 일정 보기 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#upcoming-vaccine-btn[data-bug-id="site004-bug01"]`
- **사용자가 경험하는 증상:** 
  - 홈 화면의 '예방접종 일정' 카드에서 [다가오는 일정 보기] 버튼을 클릭하면, 미래의 예정된 일정이 나와야 하지만 반대로 한참 지나간 과거의 접종 기록들만 표시됩니다.
- **코드상 의도된 원인:**
  - 서버 측 필터링 로직에서 오늘(`today`) 이후의 날짜를 필터링하기 위해 `new Date(v.date) >= today`를 사용해야 하는데, 고의로 부등호를 반대로 작성(`new Date(v.date) < today`)하여 버그를 유발했습니다.
- **PPO 에이전트 기대 행동:**
  - `?filter=upcoming` 파라미터가 포함된 요청에 대해 반환된 데이터의 `date` 필드 값들이 현재 날짜 이후가 아님(과거 날짜임)을 감지하고 쿼리 오류 취약점으로 식별해야 합니다.

## 2. site004-bug02
- **Bug ID:** `site004-bug02`
- **CSV Error:** 요청 본문 누락 처리 실패
- **Type:** `network-request-validation`
- **발생 위치:** `server.js` 의 `POST /api/appointments` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (빈 폼 제출 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#submit-apt-btn[data-bug-id="site004-bug02"]`
- **사용자가 경험하는 증상:**
  - 병원 예약 폼에서 병원명, 날짜, 시간 등 필수적인 필드를 단 하나도 입력하지 않고 빈 상태로 제출해도 시스템이 예약 성공을 알리며 리스트에 빈 내용이 추가됩니다.
- **코드상 의도된 원인:**
  - `POST` 요청을 받을 때 `req.body`에 들어있는 값들이 유효한지(존재 여부, 형식 등) 검사하는 밸리데이션(Validation) 로직이 백엔드에 누락되어 있으며 무조건 `201 Created`를 반환하도록 작성했습니다.
- **PPO 에이전트 기대 행동:**
  - 필수 페이로드(날짜, 병원 등)를 생략하거나 빈 값으로 악의적인 POST 요청을 보냈을 때 `400 Bad Request` 처리가 되지 않고 정상 처리되는 입력값 검증 누락 상태를 발견해야 합니다.

## 3. site004-bug03
- **Bug ID:** `site004-bug03`
- **CSV Error:** 세션 검증 누락
- **Type:** `security-session`
- **발생 위치:** `server.js` 의 `POST /api/appointments` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (테스트용 토큰 입력칸), `public/js/app.js`
- **data-bug-id Selector:** `.text-danger[data-bug-id="site004-bug03"]` (설명 텍스트에 부착됨)
- **사용자가 경험하는 증상:**
  - 예약 페이지 상단의 [테스트용 헤더 설정] 부분에 명백히 만료되거나 비정상적인 토큰(예: 'EXPIRED-TOKEN')을 입력한 뒤 예약을 진행해도 정상적으로 서버에서 인가 처리를 완료하고 예약을 받아줍니다.
- **코드상 의도된 원인:**
  - API 백엔드에서 헤더(`Authorization`)의 존재 여부만 체크하고, 해당 세션/토큰의 유효 기간(Expiration)이나 서명(Signature)을 검증하는 로직을 고의로 건너뛰었습니다.
- **PPO 에이전트 기대 행동:**
  - 만료된 세션 정보나 서명이 깨진 JWT 토큰을 포함한 요청이 차단(`401 Unauthorized`)되지 않고 유효한 세션처럼 작동함을 파악하여 세션 관리 취약점으로 식별해야 합니다.
