# BUGS.md - site002

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site002-bug01 |
| **type** | button-no-response |
| **화면 위치** | 메인 Hero 영역 검색폼 내 "다음 단계" 버튼 |
| **관련 파일** | `src/components/Hero.jsx` |
| **data-bug-id selector** | `[data-bug-id="site002-bug01"]` |
| **사용자가 경험하는 증상** | 목적지나 날짜, 인원을 선택한 후 검색이나 다음 단계로 진행하기 위해 "다음 단계" 버튼을 눌러도 아무 반응이 없음. 화면 전환이나 팝업, 예약 프로세스가 진행되지 않음. |
| **코드상 의도된 원인** | `onClick` 핸들러에 빈 함수 `() => {}`가 할당되어 있어 클릭 이벤트 발생 시 실제 수행되는 로직이 없음. |
| **PPO 에이전트 기대 행동** | 검색 폼 조작 후 "다음 단계" 버튼(`[data-bug-id="site002-bug01"]`)을 클릭했을 때 라우팅 변화나 예약 패널 등장 등의 UI 상태 변화가 없는 것을 감지. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site002-bug02 |
| **type** | component-rendering |
| **화면 위치** | 추천 숙소 목록 내 일부 호텔 카드의 가격 표시 영역 |
| **관련 파일** | `src/components/HotelList.jsx` |
| **data-bug-id selector** | `[data-bug-id="site002-bug02"]` |
| **사용자가 경험하는 증상** | 특정 호텔(오사카 재팬 트레디셔널 료칸, 방콕 리버사이드 리조트 등)의 카드 하단 가격 영역에 실제 금액 대신 `undefined`라는 문자열이 렌더링됨. |
| **코드상 의도된 원인** | `hotel.id`가 102 또는 104인 경우 의도적으로 가격 변환 로직(`₩${hotel.price.toLocaleString()}`)을 우회하고 `'undefined'`라는 문자열을 반환하여 렌더링하도록 조건 처리됨. |
| **PPO 에이전트 기대 행동** | 렌더링된 요소 중 `data-bug-id="site002-bug02"` 속성을 가진 요소의 텍스트가 가격 형식이 아닌 `undefined` 문자열임을 시각적/DOM 텍스트 기반으로 탐지. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site002-bug03 |
| **type** | css-layout |
| **화면 위치** | 상단 네비게이션 헤더 (스크롤 시 고정됨) |
| **관련 파일** | `src/styles/main.css`, `src/components/Header.jsx` |
| **data-bug-id selector** | `[data-bug-id="site002-bug03"]` |
| **사용자가 경험하는 증상** | 페이지 최상단의 sticky 헤더가 바로 밑에 이어지는 Hero 영역 최상단 일부를 덮어 가림. 시각적으로 여백이 비정상적으로 보이거나 헤더 아래 콘텐츠가 헤더에 의해 일부 침범당함. |
| **코드상 의도된 원인** | `.header` 클래스에 `margin-bottom: -35px;`을 설정하여 문서 흐름상 뒤따르는 `.hero` 섹션이 헤더 높이만큼 아래로 밀려나지 않고 위로 끌어올려져 헤더 아래로 겹쳐지게 됨. |
| **PPO 에이전트 기대 행동** | 뷰포트 내에서 `.header` 요소(`[data-bug-id="site002-bug03"]`)의 bounding box가 이어지는 주요 컨텐츠(`hero` 영역)의 bounding box와 교차(overlap)하거나 가리는 현상을 감지. |
