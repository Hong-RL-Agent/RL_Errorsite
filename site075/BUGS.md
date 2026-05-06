# BUGS.md - 의도된 프론트엔드 오류 리스트

이 파일은 `site075`에 의도적으로 포함된 3가지 GUI 오류를 기록합니다.

---

## 1. 난이도 필터 결과 불일치
- **bugId**: `site075-bug01`
- **CSV 오류명**: 난이도 필터 결과 불일치
- **Type**: `difficulty-filter-result-mismatch`
- **화면 위치**: 게임 목록 상단 필터 영역 및 게임 그리드
- **관련 파일**: `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site075-bug01"]`
- **사용자 경험 증상**: "초급" 난이도를 선택했는데, 목록에 "Terraforming Mars"(고급) 게임이 여전히 표시됨.
- **코드상 의도된 원인**: `filterGames` 함수에서 `difficulty === 'Beginner'` 조건일 때 특정 고급 게임(`game.id === 3`)을 강제로 포함하도록 로직이 작성됨.
- **PPO 에이전트 기대 행동**: 필터 선택값과 실제 렌더링된 카드의 난이도 라벨 텍스트를 비교하여 불일치를 탐지해야 함.

## 2. 좌석 시간표 겹침
- **bugId**: `site075-bug02`
- **CSV 오류명**: 좌석 시간표 겹침
- **Type**: `table-schedule-overlap`
- **화면 위치**: 좌석 예약 섹션의 시간표 그리드
- **관련 파일**: `public/styles.css`
- **data-bug-id selector**: `[data-bug-id="site075-bug02"]`
- **사용자 경험 증상**: 시간 슬롯 버튼의 텍스트가 길어지거나 행 높이가 좁아지면서 아래 행의 버튼들과 시각적으로 겹침.
- **코드상 의도된 원인**: `.table-schedule`에 `grid-auto-rows: 150px` 고정 높이를 설정하고, `.time-btn`에 `white-space: nowrap`을 적용하여 오버플로우 및 겹침 발생.
- **PPO 에이전트 기대 행동**: 요소들의 bounding box가 서로 중첩(Intersection)되는지 여부를 레이아웃 분석으로 탐지해야 함.

## 3. 좌석 예약 버튼 무반응
- **bugId**: `site075-bug03`
- **CSV 오류명**: 좌석 예약 버튼 무반응
- **Type**: `table-reserve-button-no-response`
- **화면 위치**: 'T02' 테이블의 '17:00' 시간 슬롯 버튼
- **관련 파일**: `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site075-bug03"]`
- **사용자 경험 증상**: 버튼은 활성화된 상태로 보이지만, 클릭해도 우측 '예약 요약' 패널에 아무런 변화가 없음.
- **코드상 의도된 원인**: `renderTables` 함수에서 해당 특정 버튼에 대해서만 `onclick` 이벤트 리스너 연결을 건너뜀.
- **PPO 에이전트 기대 행동**: 버튼 클릭(Click Event) 후 DOM 상태(예약 요약 패널의 텍스트)가 변경되는지 관찰하여 무반응 상태를 탐지해야 함.
