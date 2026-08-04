# BUGS.md - site006

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site006-bug01 |
| **type** | button-no-response |
| **화면 위치** | 좌측 사이드바 필터 패널 하단의 "필터 적용" 버튼 |
| **관련 파일** | `src/components/SidebarFilter.jsx` |
| **data-bug-id selector** | `[data-bug-id="site006-bug01"]` |
| **사용자가 경험하는 증상** | 사용자가 매물 유형이나 지역을 변경한 후 "필터 적용" 버튼을 눌러도 우측의 매물 리스트 결과가 전혀 갱신(필터링)되지 않음. |
| **코드상 의도된 원인** | `<button>`의 `onClick` 이벤트 핸들러에 부모 컴포넌트(`App.jsx`)로 필터 상태를 전달하는 `onApply` 함수 대신 빈 함수 `() => {}`가 할당되어 있어 클릭 시 아무 동작도 수행하지 않음. |
| **PPO 에이전트 기대 행동** | 마우스 클릭 이벤트를 트리거한 후 네트워크 요청(API 호출)이 발생하지 않고 DOM 상의 카드 렌더링 상태도 변화가 없음을 '무반응 버그'로 탐지. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site006-bug02 |
| **type** | component-rendering |
| **화면 위치** | 매물 리스트 내의 특정 매물 카드 썸네일 이미지 영역 |
| **관련 파일** | `src/components/PropertyList.jsx` |
| **data-bug-id selector** | `[data-bug-id="site006-bug02"]` |
| **사용자가 경험하는 증상** | 리스트 중 102번(한남더힐 파크뷰)과 105번(연희동 프라이빗 빌라) 매물 카드의 상단 이미지(이모지)가 렌더링되지 않고 빈 배경색만 노출됨. |
| **코드상 의도된 원인** | 매물 배열을 `map`으로 순회하며 카드를 렌더링할 때, `prop.id === 102 || prop.id === 105` 조건일 경우 이미지가 렌더링되어야 할 자리에 `null`을 반환하여 강제로 렌더링 누락을 발생시킴. |
| **PPO 에이전트 기대 행동** | API 응답 데이터 구조에 이미지 값이 정상적으로 들어있음에도 특정 카드의 DOM(`[data-bug-id="site006-bug02"]`) 내에 컨텐츠(이모지 텍스트)가 비어있는 모순 상태를 렌더링 에러로 식별. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site006-bug03 |
| **type** | css-layout |
| **화면 위치** | 우측 지도 패널 영역 |
| **관련 파일** | `src/styles/main.css`, `src/components/MapPanel.jsx` |
| **data-bug-id selector** | `[data-bug-id="site006-bug03"]` |
| **사용자가 경험하는 증상** | 우측에 고정된 지도 패널이 화면 너비의 너무 많은 부분을 차지(`45%`)하면서, 옆에 있는 매물 리스트(`PropertyList.jsx`)의 우측 카드를 일부 덮어 가려서 레이아웃이 겹침. |
| **코드상 의도된 원인** | `.map-panel` 클래스에 `position: absolute`와 함께 지나치게 넓은 `width: 45%`를 주었고, 본문인 `.property-list-area`에는 지도 패널 너비만큼의 `padding-right`나 `margin`을 주지 않아 DOM상으로 두 요소가 겹치게 만듦. |
| **PPO 에이전트 기대 행동** | 뷰포트 내에서 `.map-panel`의 BoundingBox와 `.property-card` 들의 BoundingBox가 겹치는 교차 영역을 식별하여 Layout Overlap 형태의 레이아웃 버그로 판단. |
