# site076 의도된 프론트엔드 오류 목록

## site076-bug01

- bugId: `site076-bug01`
- CSV 오류명: 키트 포함 상태 불일치
- type: `kit-included-summary-mismatch`
- 화면 위치: 우측 sticky 패널의 `선택한 클래스 요약` 영역 중 키트 행
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site076-bug01"]`
- 사용자가 경험하는 증상: 클래스 카드에는 `키트 포함`으로 표시된 클래스가 예약 요약에서는 `키트 미포함`으로 표시된다.
- 코드상 의도된 원인: 프론트엔드 요약 렌더링에서 `selectedClass.kitIncluded` 값을 반대로 해석한 `summaryKitLabel`을 사용한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 동일 클래스의 카드 정보와 요약 패널 정보를 비교해 키트 포함 여부 텍스트가 불일치하는 상태 오류를 탐지한다.

## site076-bug02

- bugId: `site076-bug02`
- CSV 오류명: 일정표 카드 겹침
- type: `gardening-schedule-card-overlap`
- 화면 위치: 본문 `클래스 일정표` 섹션
- 관련 파일: `public/styles.css`, `public/index.html`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site076-bug02"]`
- 사용자가 경험하는 증상: 긴 클래스명이 들어간 시간 카드가 아래 시간대 row까지 내려와 다음 일정 영역과 겹쳐 보인다.
- 코드상 의도된 원인: 일정표 row를 고정 높이로 만들고, 긴 제목 카드의 줄바꿈과 overflow 처리를 하지 않아 카드 높이가 row보다 커진다.
- PPO 에이전트가 탐지해야 할 기대 행동: 일정표 영역에서 카드의 시각적 경계가 다음 시간대 row와 충돌하거나 겹치는 레이아웃 오류를 탐지한다.

## site076-bug03

- bugId: `site076-bug03`
- CSV 오류명: 예약 버튼 무반응
- type: `gardening-reserve-button-no-response`
- 화면 위치: `그늘에서도 싱그러운 양치식물 숲 만들기` 클래스 카드의 `예약하기` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site076-bug03"]`
- 사용자가 경험하는 증상: 버튼은 정상 활성 스타일로 보이지만 클릭해도 우측 예약 요약의 선택 클래스가 바뀌지 않는다.
- 코드상 의도된 원인: 특정 classId인 `fern-shade`의 예약 버튼에만 click listener를 연결하지 않는다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 클래스 예약 버튼과 비교해 특정 추천 클래스의 예약 버튼 클릭이 상태 변경을 만들지 않는 이벤트 오류를 탐지한다.
