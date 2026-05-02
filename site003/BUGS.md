# BUGS

## 1. site003-bug01
- **Bug ID:** `site003-bug01`
- **CSV Error:** DB 업데이트 대상 오류
- **Type:** `database-update`
- **발생 위치:** `server.js` 의 `PUT /api/workouts/:id/complete` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (완료 버튼), `public/js/app.js`
- **data-bug-id Selector:** `.complete-btn[data-bug-id="site003-bug01"]`
- **사용자가 경험하는 증상:** 
  - 목록의 두 번째나 세 번째 운동의 '완료 체크' 버튼을 클릭해도, 화면을 갱신해보면 클릭한 대상이 아닌 엉뚱한(주로 맨 첫 번째) 운동 항목이 완료 처리되어 있습니다.
- **코드상 의도된 원인:**
  - 서버 측에서 클라이언트가 전송한 `:id` 파라미터를 사용하여 해당하는 운동 항목을 찾아(`find()`) 업데이트해야 하지만, 고의로 `workouts[0].completed = true` 와 같이 무조건 첫 번째 항목만 업데이트하도록 하드코딩되어 있습니다.
- **PPO 에이전트 기대 행동:**
  - `PUT` 요청으로 특정 리소스 ID를 보냈으나, 이후 GET 응답에서 요청된 ID의 리소스 상태가 변하지 않고 다른 리소스 상태가 변하는 논리적 불일치를 탐지해야 합니다.

## 2. site003-bug02
- **Bug ID:** `site003-bug02`
- **CSV Error:** 불안정한 네트워크 응답
- **Type:** `network-random-failure`
- **발생 위치:** `server.js` 의 `GET /api/stats` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (새로고침 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#refresh-stats-btn[data-bug-id="site003-bug02"]`
- **사용자가 경험하는 증상:**
  - '내 통계' 카드의 '↻ 갱신' 버튼을 누르면 정상적으로 통계가 업데이트되기도 하지만, 종종 통계를 불러오지 못했다는 에러 메시지가 표시됩니다.
- **코드상 의도된 원인:**
  - 서버에서 통계 요청 시 `Math.random() < 0.5` 확률로 `503 Service Unavailable` 상태 코드와 에러 메시지를 반환하도록 구현했습니다.
- **PPO 에이전트 기대 행동:**
  - 동일한 리소스 요청에 대해 정상(200) 응답과 에러(5XX) 응답이 불규칙적으로 발생하는 서버 불안정 현상을 감지해야 합니다.

## 3. site003-bug03
- **Bug ID:** `site003-bug03`
- **CSV Error:** 권한 검증 누락
- **Type:** `security-authorization`
- **발생 위치:** `server.js` 의 `GET /api/workouts` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (타 유저 검색 인풋), `public/js/app.js`
- **data-bug-id Selector:** `#fetch-other-user-btn[data-bug-id="site003-bug03"]`
- **사용자가 경험하는 증상:**
  - 로그인이나 별도의 권한 획득 없이, 개발자 도구를 조작하거나 화면의 숨겨진 테스트 인풋창을 통해 `userId=user-002` 와 같이 타인의 아이디를 넣어 요청하면 그 사람의 비공개 운동 기록이 그대로 화면에 표시됩니다.
- **코드상 의도된 원인:**
  - `GET /api/workouts` 요청에서 세션 검증이나 JWT 디코딩 등을 통해 요청 주체가 본인인지 확인하는 인가(Authorization) 과정이 누락되어 있습니다. 클라이언트가 넘기는 쿼리 파라미터(`userId`)를 무조건 신뢰하여 DB에서 쿼리합니다.
- **PPO 에이전트 기대 행동:**
  - 본인의 인증 토큰/세션이 아닌 다른 유저의 식별자(ID)를 파라미터로 요청했을 때, 접근 거부(401/403)가 아닌 정상 응답(200 OK)이 반환되는 IDOR(Insecure Direct Object Reference) 취약점을 식별해야 합니다.
