# BUGS.md — site078 FoodTruck Map

> 이 파일은 PPO 에이전트 학습을 위해 의도적으로 삽입된 오류를 문서화합니다.

---

## bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site078-bug01 |
| **CSV 오류명** | DB 영업시간 비교 오류 |
| **type** | database-date-query |
| **발생 위치** | `server.js` — `isOpenNow_buggy()` 함수, `GET /api/trucks` 응답 처리 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site078-bug01"]` |

### 사용자가 경험하는 증상
- 영업 종료 시간이 지난 트럭도 `isOpen: true`로 반환되어 "🟢 영업중" 배지가 표시됨
- "영업중만 보기" 필터 적용 시 실제로 영업이 종료된 트럭이 포함되어 나타남
- 예: closeTime이 "09:00"인 트럭이 오후에도 영업중으로 표시될 수 있음

### 코드상 의도된 원인
```javascript
// server.js — isOpenNow_buggy()
function isOpenNow_buggy(truck) {
  const nowStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return truck.openTime <= nowStr; // closeTime 비교 누락
}
```
- `closeTime`과의 비교가 누락되어 openTime이 현재 시각보다 이전이면 무조건 영업중으로 판단
- 또한 문자열 기반 비교이므로 포맷 불일치 시 (`"9:00"` vs `"09:00"`) 추가 오류 발생 가능

### PPO 에이전트가 탐지해야 할 기대 행동
- `/api/trucks` 응답의 `isOpen` 필드와 실제 현재 시각 및 `openTime`, `closeTime`을 교차 검증
- 영업 종료 시간 이후에도 `isOpen: true`인 트럭이 존재하면 이상 탐지
- `open=true` 파라미터 요청 시 응답 내 `isOpen: false`여야 할 트럭이 포함된 경우 플래그

---

## bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site078-bug02 |
| **CSV 오류명** | 네트워크 위치 응답 누락 |
| **type** | network-missing-field |
| **발생 위치** | `server.js` — `mockTrucks` 배열 (id: 1, 4), `GET /api/trucks` 응답 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site078-bug02"]` |

### 사용자가 경험하는 증상
- 일부 푸드트럭(타코버스, 피자파이어)의 API 응답 JSON에 `lat` 또는 `lng` 키 자체가 없음
- 지도 화면에서 해당 트럭의 정확한 좌표 기반 마커를 표시할 수 없음
- 프론트엔드는 위치 없음(빨간 마커) 처리를 하여 UI는 정상이나, 클라이언트 앱에서 좌표 접근 시 `undefined` 발생

### 코드상 의도된 원인
```javascript
// server.js — mockTrucks 배열 (id: 1)
{
  id: 1,
  name: '타코버스',
  // lat, lng 필드 자체가 없음 (의도적 누락)
  openTime: '11:00',
  ...
}
// id: 4 (피자파이어)
{
  id: 4,
  lat: 37.4979,   // lat만 있고 lng 누락
  openTime: '11:30',
  ...
}
```
- Mock DB 레코드에서 위치 필드를 의도적으로 제거
- API 레이어에서 별도 validation 없이 그대로 응답

### PPO 에이전트가 탐지해야 할 기대 행동
- `/api/trucks` 응답 JSON에서 각 트럭 객체에 `lat`, `lng` 필드 존재 여부 검사
- `lat` 또는 `lng` 중 하나라도 누락된 레코드가 있을 경우 network-missing-field 오류로 분류
- 누락 트럭 ID (1, 4) 식별 및 보고

---

## bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site078-bug03 |
| **CSV 오류명** | 리뷰 작성 인증 누락 |
| **type** | security-authentication |
| **발생 위치** | `server.js` — `POST /api/reviews` 핸들러 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site078-bug03"]` |

### 사용자가 경험하는 증상
- 로그인하지 않은 상태(또는 Authorization 헤더 없이)에서도 리뷰 작성 API 호출이 성공함
- 아무 닉네임으로나 리뷰를 등록할 수 있어 스팸/위조 리뷰가 가능
- curl, Postman 등으로 인증 토큰 없이 `POST /api/reviews` 호출 시 201 Created 반환

### 코드상 의도된 원인
```javascript
// server.js — POST /api/reviews
app.post('/api/reviews', (req, res) => {
  // data-bug-id="site078-bug03"
  // Authorization 헤더 또는 세션 검증 로직이 전혀 없음
  // 정상적으로는 아래와 같은 검증이 있어야 함:
  // const token = req.headers.authorization;
  // if (!token || !verifyToken(token)) return res.status(401).json({ ... });
  const { truckId, author, rating, content } = req.body;
  ...
});
```
- 인증 미들웨어 미적용
- `req.headers.authorization` 검사 누락
- 세션 기반 인증도 없음

### PPO 에이전트가 탐지해야 할 기대 행동
- `POST /api/reviews`에 Authorization 헤더 없이 요청 시 401 Unauthorized가 반환되어야 하나 201이 반환되는지 확인
- 인증 없는 POST 요청이 성공(2xx)할 경우 security-authentication 취약점으로 분류
- 응답 헤더에 `WWW-Authenticate` 없이 데이터가 저장되는 경우 탐지
