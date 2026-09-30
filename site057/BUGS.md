# RideOn (site057) 의도적 오류 목록 (BUGS.md)

이 문서는 RideOn 공유 모빌리티 대여 플랫폼에 구현된 정확히 5개의 의도적 오류(SEC) 목록을 정의합니다.

---

### site057-SEC-461

- **bugId**: `site057-SEC-461`
- **type**: `Data Comparison`
- **Korean type**: `숫자형 ID를 문자열 ID와 잘못 비교하는 오류`
- **endpoint**: `/api/vehicles/:id`
- **method**: `GET`
- **condition**: 사용자가 주변 차량 목록 또는 홈 화면에서 특정 차량을 선택하여 상세 페이지로 이동할 때 발생
- **files**: `server.js`
- **location**: `server.js:233`
- **selector**: `button:has-text("상세보기"), .card-title`
- **symptom**: 목록에서는 차량(예: ID 102)이 정상 표시되지만 상세 페이지로 이동하면 서버에서 숫자형 ID와 문자열 ID를 strict comparison(`===`)하여 매칭에 실패하고 404 "차량을 찾을 수 없습니다." 에러가 발생함
- **status**: `Open`
- **example**: `GET /api/vehicles/102` 호출 시 서버의 `vehicle.id`는 숫자 `102`이고 `req.params.id`는 문자열 `"102"`이므로 `102 === "102"`가 `false`가 되어 404 반환
- **cause**: URL 파라미터로 수신된 문자열 값을 숫자형으로 형변환(`Number(req.params.id)`)하지 않고 엄격한 일치 연산자(`===`)로 비교함
- **PPO expected behavior**: 주변 차량 → 차량 카드 클릭 → 차량 상세 페이지 이동 시 "차량을 찾을 수 없습니다." 화면 관찰

---

### site057-SEC-462

- **bugId**: `site057-SEC-462`
- **type**: `Numeric Calculation`
- **Korean type**: `NaN이 요금 계산 결과에 전파되는 오류`
- **endpoint**: `/api/rentals/:id/fare`
- **method**: `GET`
- **condition**: 종료 시각(`endTime`)이 누락되었거나 비어 있는 이용 내역(예: `rt-103`)의 요금 상세를 조회할 때 발생
- **files**: `server.js`, `src/pages/History.jsx`
- **location**: `server.js:283`
- **selector**: `div:has-text("RO-20260928-309")`
- **symptom**: 누락된 종료 시간에 대해 `new Date(undefined).getTime()` 연산이 `NaN`을 생성하고, 요금 계산식(`baseFare + duration * perMinute`) 전체로 전파되어 화면에 `예상 요금: ₩NaN` 또는 `NaN원`이 표시됨
- **status**: `Open`
- **example**: `rt-103` 요금 조회 시 `durationMinutes = NaN`, `totalFare = NaN`이 산출되어 클라이언트 영수증 모달에 `₩NaN` 출력
- **cause**: `rental.endTime`의 유효성을 검사하지 않고 날짜 산술 연산을 무조건 수행하여 `NaN`이 발생 및 전파됨
- **PPO expected behavior**: 이용 기록 → 특정 이용 내역 클릭 → 요금 산정 내역 모달에서 `₩NaN` 또는 `NaN원` 표시 관찰

---

### site057-SEC-463

- **bugId**: `site057-SEC-463`
- **type**: `Shared State`
- **Korean type**: `Array.sort()의 원본 배열 변형으로 목록 순서가 다른 화면까지 변경되는 오류`
- **endpoint**: `/api/vehicles`
- **method**: `GET`
- **condition**: 주변 차량(`Nearby.jsx`) 페이지에서 정렬 기준(예: 배터리 높은순)을 변경한 후 홈(`Home.jsx`) 화면으로 이동할 때 발생
- **files**: `src/pages/Nearby.jsx`
- **location**: `src/pages/Nearby.jsx:26`
- **selector**: `select.filter-select:has-text("배터리 높은순")`
- **symptom**: 주변 차량 목록을 정렬할 때 불변성을 지키는 복사본(`[...vehicles]`)을 만들지 않고 공유되는 원본 배열에 직접 `.sort()`를 실행하여, 홈 화면의 '추천 인기 모빌리티' 목록 순서까지 원치 않게 변형됨
- **status**: `Open`
- **example**: 주변 차량에서 '배터리 높은순' 선택 후 홈으로 이동하면 기본 추천 순서가 아닌 배터리 정렬 순서로 추천 차량이 표시됨
- **cause**: 자바스크립트의 `Array.prototype.sort()`가 원본 배열을 직접 변경(in-place mutation)하여 동일한 배열 참조를 사용하는 다른 컴포넌트에 Side Effect를 발생시킴
- **PPO expected behavior**: 홈 추천 차량 순서 확인 → 주변 차량 이동 → 배터리순 정렬 변경 → 홈 이동 → 추천 차량 목록의 순서가 변경된 현상 관찰

---

### site057-SEC-464

- **bugId**: `site057-SEC-464`
- **type**: `Date Formatting`
- **Korean type**: `날짜 포맷 YYYY-MM-DD와 locale 포맷을 잘못 혼합하는 오류`
- **endpoint**: `/api/rides/history`
- **method**: `GET`
- **condition**: 이용 기록 목록에서 1자리 수 월/일(예: 9월 8일, 9월 1일 등)을 포함하는 라이딩 내역을 확인할 때 발생
- **files**: `server.js`
- **location**: `server.js:385`
- **selector**: `.history-date, RideHistoryCard`
- **symptom**: 표준 `YYYY-MM-DD` 형식(`2026-09-08`) 대신 2자리 제로 패딩이 누락된 `2026-9-8` 또는 `2026-9-1` 형태로 비정상 출력됨
- **status**: `Open`
- **example**: `2026-09-08` 날짜 데이터가 `2026-9-8`로 렌더링되어 다른 2자리 날짜(`2026-09-28`)와 포맷 불일치 발생
- **cause**: 날짜 문자열 포맷팅 시 `padStart(2, '0')` 없이 `getMonth() + 1`과 `getDate()`를 단순 문자열 결합하여 토큰 포맷팅 오류 발생
- **PPO expected behavior**: 이용 기록 페이지 이동 → 각 이용 기록의 날짜 문자열 확인 시 `2026-9-8`, `2026-9-1` 등 제로 패딩 누락 관찰

---

### site057-SEC-465

- **bugId**: `site057-SEC-465`
- **type**: `UI Interaction`
- **Korean type**: `CSS pointer-events로 버튼 클릭이 보이지 않는 overlay에 가로막히는 오류`
- **endpoint**: `N/A` (Frontend UI)
- **method**: `UI Click`
- **condition**: 대여 관리(`Rental.jsx`) 페이지의 대여 확인 모달에서 '대여 시작' 버튼을 클릭할 때 발생
- **files**: `src/pages/Rental.jsx`
- **location**: `src/pages/Rental.jsx:178`
- **selector**: `button:has-text("대여 시작")`
- **symptom**: '대여 시작' 버튼이 정상적으로 표시되고 활성화되어 있지만, 상단에 투명한 오버레이(`position: absolute; inset: 0; opacity: 0; pointer-events: auto;`)가 남아있어 버튼 클릭 이벤트가 트리거되지 않고 모달이 닫히지 않음
- **status**: `Open`
- **example**: 대여 확인 팝업에서 [대여 시작] 버튼을 아무리 클릭해도 이벤트가 차단되어 주행 세션이 시작되지 않음
- **cause**: CSS 히트 테스팅 레이어 상단에 마우스 이벤트를 가로채는 투명 오버레이 레이어가 제거되지 않고 잔류함
- **PPO expected behavior**: 차량 상세/목록 → 대여하기 → 대여 확인 모달 표시 → '대여 시작' 클릭 → 버튼 클릭이 먹통인 현상 관찰
