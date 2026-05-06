# Intentional Frontend GUI Bugs - site060

이 문서에는 PPO 에이전트가 탐지해야 할 의도적인 프론트엔드 GUI 오류 3가지가 명세되어 있습니다.

---

### 1. 식물 카드 중복 렌더링
- **Bug ID**: `site060-bug01`
- **CSV 오류명**: 식물 카드 중복 렌더링
- **Type**: `duplicate-plant-card-render`
- **화면 위치**: 메인 식물 그리드 (`#plant-grid`)
- **관련 파일**: `public/app.js` (renderPlants 함수)
- **Selector**: `[data-bug-id="site060-bug01"]` (grid 부모 요소)
- **사용자 경험 증상**: '전체'가 아닌 특정 종류(예: 실내 식물) 필터를 선택했을 때, 리스트의 첫 번째 식물 카드가 두 번 렌더링되어 중복으로 표시됩니다.
- **의도된 원인**: `renderPlants` 함수 내에서 필터가 'All'이 아닐 경우 배열의 0번째 항목을 추가로 `appendChild` 하도록 구현되었습니다.
- **기대 탐지 행동**: 필터링된 결과 내에서 동일한 식물 ID를 가진 카드가 여러 개 존재하는지 확인하고 오류로 판단해야 합니다.

---

### 2. 카드 이미지-텍스트 겹침
- **Bug ID**: `site060-bug02`
- **CSV 오류명**: 카드 겹침
- **Type**: `plant-card-overlap`
- **화면 위치**: 식물 카드 리스트
- **관련 파일**: `public/styles.css` (@media query 구간)
- **Selector**: `.plant-card` (오류가 발생하는 구간의 카드)
- **사용자 경험 증상**: 브라우저 너비가 약 900px~1100px 사이일 때, 카드의 이미지가 `absolute` 포지셔닝으로 인해 아래에 있는 텍스트와 겹치거나 가리게 됩니다.
- **의도된 원인**: 특정 breakpoint에서 이미지에 `absolute` 위치를 부여하고, `card-body`에 충분한 상단 여백(`padding-top`)을 주지 않아 레이아웃 계산이 빗나갑니다.
- **기대 탐지 행동**: 시각적 렌더링 결과에서 이미지 영역과 텍스트 영역의 좌표가 겹치는지(Overlap) 탐지해야 합니다.

---

### 3. 물주기 기록 버튼 무반응
- **Bug ID**: `site060-bug03`
- **CSV 오류명**: 물주기 기록 버튼 무반응
- **Type**: `watering-record-button-no-response`
- **화면 위치**: Snake Plant 카드의 '물주기 기록' 버튼
- **관련 파일**: `public/app.js` (createPlantCard 함수)
- **Selector**: `button[data-bug-id="site060-bug03"]`
- **사용자 경험 증상**: 'Snake Plant' 카드의 '물주기 기록' 버튼을 클릭해도 마지막 물주기 날짜가 업데이트되지 않고 아무런 반응이 없습니다. 다른 식물들은 정상 동작합니다.
- **의도된 원인**: 특정 식물 ID(`p2`)인 경우에만 버튼에 클릭 이벤트 리스너를 연결하지 않도록 조건문이 처리되어 있습니다.
- **기대 탐지 행동**: 버튼 클릭 액션 이후 DOM 상태(날짜 텍스트)의 변화가 있는지 감시하여, 의도된 상태 변경이 일어나지 않는 인터랙션 결함을 탐지해야 합니다.
