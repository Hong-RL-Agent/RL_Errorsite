# BUGS

## 1. site005-bug01
- **Bug ID:** `site005-bug01`
- **CSV Error:** DB 중복 저장 오류
- **Type:** `database-duplicate`
- **발생 위치:** `server.js` 의 `POST /api/itinerary` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (일정 추가 폼 버튼), `public/js/app.js`
- **data-bug-id Selector:** `button[data-bug-id="site005-bug01"]`
- **사용자가 경험하는 증상:** 
  - 내 일정 화면에서 똑같은 장소(예: "에펠탑")와 똑같은 시간(예: "10:00")을 입력하고 [일정 추가] 버튼을 연속해서 여러 번 누르면, 아무런 경고나 거부 처리 없이 똑같은 일정이 화면 하단에 무한정 중복 생성됩니다.
- **코드상 의도된 원인:**
  - 서버 측에서 새로운 일정을 `itineraries[userId]` 배열에 `push()` 할 때, 기존 배열을 순회하여 `place`, `date`, `time` 이 완전히 동일한 객체가 있는지 검사(Validation)하는 로직을 고의로 생략했습니다.
- **PPO 에이전트 기대 행동:**
  - 동일한 리소스 생성 POST 요청이 연속으로 이루어질 때, 상태 충돌(409 Conflict) 처리 없이 계속 DB에 멱등성이 깨진 상태로 쌓이는 중복 데이터 허용 취약점을 감지해야 합니다.

## 2. site005-bug02
- **Bug ID:** `site005-bug02`
- **CSV Error:** 네트워크 응답 지연
- **Type:** `network-latency`
- **발생 위치:** `server.js` 의 `POST /api/budget` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (예산 저장 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#save-budget-btn[data-bug-id="site005-bug02"]`
- **사용자가 경험하는 증상:**
  - 10만 원, 50만 원 등 비교적 작은 숫자를 입력하고 예산을 저장하면 즉각적으로 현재 예산 텍스트가 바뀝니다. 하지만 1,000,000 이상 큰 금액을 입력하고 저장 버튼을 누르면 "저장 중..." 이라는 메시지와 함께 15초 넘게 멈춰있는 듯한 현상이 발생합니다.
- **코드상 의도된 원인:**
  - 백엔드에서 `req.body.amount >= 1000000` 일 경우, `setTimeout` 함수를 사용하여 의도적으로 HTTP Response를 15초(15000ms) 동안 지연시키도록 코딩했습니다.
- **PPO 에이전트 기대 행동:**
  - 페이로드의 특정 값 조건에 따라 API 응답 시간이 임계치(Timeout 기준점 등)를 비정상적으로 초과하는 네트워크 병목(지연) 현상을 이상 지표로 탐지해야 합니다.

## 3. site005-bug03
- **Bug ID:** `site005-bug03`
- **CSV Error:** IDOR 취약점
- **Type:** `security-idor`
- **발생 위치:** `server.js` 의 `GET /api/itinerary/:userId` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (일정 불러오기 버튼 및 입력칸), `public/js/app.js`
- **data-bug-id Selector:** `#fetch-itinerary-btn[data-bug-id="site005-bug03"]`
- **사용자가 경험하는 증상:**
  - 본인 계정('user-123')으로 접속 중이지만, 화면에 노출된 테스트 인풋(또는 URL 파라미터 조작)을 통해 'other-user' 같은 타인의 ID를 적고 불러오기를 누르면, 타인이 작성한 "비밀 여행지" 일정이 권한 검사 없이 그대로 화면에 노출됩니다.
- **코드상 의도된 원인:**
  - API 백엔드에서 해당 요청을 보낸 클라이언트 세션(또는 인증 헤더)과 요청 대상인 `:userId`가 동일한 소유주인지 확인하는 접근 통제(Access Control) 로직이 전혀 없습니다.
- **PPO 에이전트 기대 행동:**
  - 현재 인증된 사용자 컨텍스트와 불일치하는 다른 사용자의 식별자(ID)를 파라미터로 넘겼을 때 데이터 접근이 허용되는 인가 우회(Insecure Direct Object Reference) 취약점을 식별해야 합니다.
