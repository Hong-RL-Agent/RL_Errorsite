# BUGS.md - site010

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site010-bug01 |
| **type** | button-no-response |
| **화면 위치** | 본문 트랙 목록 중 두 번째 트랙(Blinding Lights) 좌측의 재생 버튼 |
| **관련 파일** | `src/components/MainContent.jsx` |
| **data-bug-id selector** | `[data-bug-id="site010-bug01"]` |
| **사용자가 경험하는 증상** | 트랙 목록에서 특정 곡(두 번째 곡)의 라인에 마우스를 올리고 나타난 "재생(Play)" 버튼을 클릭해도 하단 플레이어의 재생 정보가 갱신되지 않고 음악이 재생되지 않음 (무반응). |
| **코드상 의도된 원인** | `idx === 1`인 버그 타겟 곡의 경우 `onClick` 이벤트 내에서 `onPlay(track)`을 호출하지 않고 `if (isBuggyTrack) { // Do nothing }`으로 처리하여 클릭 이벤트를 소모시킴. |
| **PPO 에이전트 기대 행동** | 재생 버튼을 클릭했음에도 불구하고 하단 글로벌 플레이어 영역(`.player-bar`)의 상태 변화나 재생 진행률 컴포넌트의 업데이트가 없음을 감지하여 무반응 버튼 버그로 판별. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site010-bug02 |
| **type** | component-rendering |
| **화면 위치** | 좌측 사이드바 하단의 플레이리스트(PLAYLISTS) 항목들 |
| **관련 파일** | `src/components/Sidebar.jsx` |
| **data-bug-id selector** | `[data-bug-id="site010-bug02"]` |
| **사용자가 경험하는 증상** | API 서버에서 제공한 플레이리스트 순서('Top 50', 'Chill Vibes' ...)와 화면에 렌더링된 목록의 순서('Late Night Drive'부터 역순)가 일치하지 않음. |
| **코드상 의도된 원인** | `playlists` props를 렌더링할 때 `[...playlists].reverse()`를 사용하여 의도적으로 배열의 순서를 뒤집어서 렌더링하도록 작성함. |
| **PPO 에이전트 기대 행동** | Mock API 응답 데이터(Ground Truth)의 배열 순서와 실제 DOM 요소 텍스트 렌더링 순서 간의 불일치(Mismatch)를 탐지하여 데이터 렌더링 결함으로 처리. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site010-bug03 |
| **type** | css-layout |
| **화면 위치** | 본문 트랙 목록 최하단 영역 |
| **관련 파일** | `src/styles/main.css`, `src/components/MainContent.jsx` |
| **data-bug-id selector** | `[data-bug-id="site010-bug03"]` |
| **사용자가 경험하는 증상** | 트랙 목록을 끝까지 스크롤해도 하단에 고정된(Fixed/Flex-end) 플레이어 바에 의해 마지막 곡(10번 곡 등)들이 가려져서 보이지 않고 조작할 수 없음. |
| **코드상 의도된 원인** | 스크롤 가능한 본문 영역(`.main-view`)에 하단 플레이어 높이(90px)를 고려한 충분한 `padding-bottom`을 주어야 하나, 의도적으로 `16px`의 부족한 여백만 부여하여 겹침(Overlap)을 유발함. |
| **PPO 에이전트 기대 행동** | 가장 마지막 `<tr>` 요소의 Bounding Box와 `.player-bar`의 Bounding Box가 Z축 공간에서 교차(Intersect)하며 가려지는 현상을 Layout Overlap 버그로 탐지. |
