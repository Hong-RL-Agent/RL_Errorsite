# BUGS - site011

이 문서는 PPO 에이전트 훈련을 위해 의도적으로 삽입된 GUI 오류를 설명합니다.

## 1. site011-bug01
- **Bug ID**: site011-bug01
- **Type**: button-no-response
- **화면 위치**: 상단 헤더 우측 "Add Card" 버튼
- **관련 파일**: `src/components/Header.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site011-bug01"]`
- **사용자가 경험하는 증상**: "Add Card" 버튼을 클릭해도 새로운 카드를 추가하기 위한 입력 모달이 열리지 않거나 아무런 반응이 없습니다.
- **코드상 의도된 원인**: 버튼 엘리먼트에 `onClick` 이벤트 핸들러가 연결되어 있지 않습니다.
- **PPO 에이전트가 탐지해야 할 기대 행동**: "Add Card" 버튼 클릭 후 모달이 나타나지 않는 화면 상태(시각적 변화 없음)를 감지하여 오류로 판별해야 합니다.

## 2. site011-bug02
- **Bug ID**: site011-bug02
- **Type**: component-rendering
- **화면 위치**: "To Do"와 "In Progress" 컬럼 내부 카드 리스트
- **관련 파일**: `src/components/KanbanBoard.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site011-bug02"]`
- **사용자가 경험하는 증상**: 동일한 업무(예: ID 1번 업무) 카드가 "To Do" 컬럼과 "In Progress" 컬럼 양쪽에 동시에 나타나며, 시각적으로 중복 렌더링됩니다.
- **코드상 의도된 원인**: "In Progress" 컬럼 렌더링 로직에서 의도적으로 "To Do" 상태인 특정 카드를 필터링 없이 포함하여 렌더링하도록 조건이 조작되었습니다.
- **PPO 에이전트가 탐지해야 할 기대 행동**: 화면 상에 시각적으로 완벽히 동일한 내용/ID를 가진 카드가 논리적으로 분리된 두 컬럼에 동시에 존재하는 상태를 스크린샷 렌더링에서 감지해야 합니다.

## 3. site011-bug03
- **Bug ID**: site011-bug03
- **Type**: css-layout
- **화면 위치**: 메인 칸반 보드 영역 (모바일 화면)
- **관련 파일**: `src/styles.css`
- **Data Bug ID Selector**: `[data-bug-id="site011-bug03"]`
- **사용자가 경험하는 증상**: 모바일 화면 크기(폭 768px 이하)로 줄였을 때 칸반 컬럼들이 수직으로 쌓이거나 스크롤되지 않고, 가로로 끝없이 밀려 브라우저 가로 스크롤이 생기거나 내용이 잘립니다.
- **코드상 의도된 원인**: 모바일 미디어 쿼리에서 `flex-wrap: nowrap`이 유지되고 칸반 컨테이너에 `overflow-x` 처리가 누락되어 발생합니다.
- **PPO 에이전트가 탐지해야 할 기대 행동**: 모바일 해상도로 브라우저가 리사이즈된 상태에서, 메인 컨텐츠 영역의 너비가 뷰포트를 벗어나 화면이 잘리는 레이아웃 깨짐 현상을 감지해야 합니다.
