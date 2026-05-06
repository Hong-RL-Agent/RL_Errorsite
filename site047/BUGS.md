# BUGS

## site047-bug01

- bugId: `site047-bug01`
- CSV 오류명: 행사 목록 중복 렌더링
- type: `duplicate-event-list-render`
- 화면 위치: 행사 일정 섹션의 행사 카드 grid
- 관련 파일: `public/index.html`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site047-bug01"]`
- 사용자가 경험하는 증상: 날짜 필터를 `6월 14일`로 바꾸면 이전에 보이던 행사 카드가 완전히 사라지지 않고 6월 14일 카드가 추가 append되어 목록이 중복되어 보입니다.
- 코드상 의도된 원인: `renderEvents()`에서 특정 날짜 필터(`2026-06-14`)일 때 `eventGrid.innerHTML = ""` 초기화를 건너뜁니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 필터 결과 개수와 실제 DOM 카드 개수가 맞지 않고 이전 날짜 카드가 남아 있는 중복 렌더링 상태를 탐지해야 합니다.

## site047-bug02

- bugId: `site047-bug02`
- CSV 오류명: 배너 overflow
- type: `hero-banner-overflow`
- 화면 위치: hero 영역 우측 대표 이미지 위 날짜 배지
- 관련 파일: `public/index.html`, `public/styles.css`
- data-bug-id selector: `[data-bug-id="site047-bug02"]`
- 사용자가 경험하는 증상: 1100px-1280px 데스크톱 폭에서 날짜 배지가 이미지 영역 밖으로 밀려 배너 바깥 공간이나 검색 영역 쪽을 침범합니다.
- 코드상 의도된 원인: CSS media query에서 날짜 배지의 `right` 값을 음수로, `width`를 과도하게 지정했습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 특정 데스크톱 중간 폭에서 hero 날짜 배지가 정상 컨테이너를 벗어나는 overflow 레이아웃 오류를 탐지해야 합니다.

## site047-bug03

- bugId: `site047-bug03`
- CSV 오류명: 일정 저장 버튼 무반응
- type: `save-schedule-button-no-response`
- 화면 위치: 행사 카드 grid의 `풍물 탈춤 한마당` 카드
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site047-bug03"]`
- 사용자가 경험하는 증상: 해당 카드의 `일정 저장` 버튼은 정상 버튼처럼 보이지만 클릭해도 저장 상태로 바뀌지 않고 즐겨찾기 목록에도 추가되지 않습니다.
- 코드상 의도된 원인: `EVT-047-05` 행사 카드의 저장 버튼에만 click event listener를 연결하지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 같은 유형의 다른 저장 버튼은 정상 작동하지만 특정 카드 버튼만 상태 변화가 없는 이벤트 바인딩 오류를 탐지해야 합니다.
