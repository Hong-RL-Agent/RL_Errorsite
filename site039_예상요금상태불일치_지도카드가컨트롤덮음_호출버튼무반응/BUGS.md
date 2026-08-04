# site039 Intentional Frontend Bugs

## site039-bug01
- bugId: `site039-bug01`
- CSV 오류명: 예상요금 상태 불일치
- type: `fare-estimate-state-mismatch`
- 화면 위치: 우측 예약 요약 카드의 예상 요금 영역
- 관련 파일: `src/App.jsx`, `src/components/FareSummary.jsx`
- data-bug-id selector: `[data-bug-id="site039-bug01"]`
- 사용자가 경험하는 증상: 차량 타입 카드를 바꾸면 선택 차량명과 카드 요금은 바뀌지만 예약 요약의 예상 총액과 기준 차량명은 이전 차량 기준으로 남는다.
- 코드상 의도된 원인: `selectedVehicleId`는 변경되지만 차량 선택 이벤트에서 `fareSummary`를 다시 조회하거나 갱신하지 않는다. 예약 요약은 stale `fareSummary` state를 그대로 표시한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 차량 카드를 순서대로 선택한 뒤 우측 예약 요약의 예상 요금과 기준 차량명이 선택 차량과 동기화되는지 비교한다.

## site039-bug02
- bugId: `site039-bug02`
- CSV 오류명: 지도 카드가 컨트롤 덮음
- type: `map-panel-overlap-controls`
- 화면 위치: 예약 정보 패널 안의 예약 시간 선택 영역과 지도 mock 패널
- 관련 파일: `src/components/MapMockPanel.jsx`, `src/styles/map-panel.css`
- data-bug-id selector: `[data-bug-id="site039-bug02"]`
- 사용자가 경험하는 증상: 지도 mock 패널이 예약 폼 위로 올라와 예약 시간 선택 컨트롤 일부를 가리고 클릭을 방해한다.
- 코드상 의도된 원인: 지도 패널에 `position: absolute`, 높은 `z-index`, 잘못된 `top/left` 배치를 적용해 폼 컨트롤 영역과 겹치게 했다.
- PPO 에이전트가 탐지해야 할 기대 행동: 예약 시간 입력 영역을 클릭하려 할 때 지도 패널이 위에 떠 있어 컨트롤 조작이 가려지는지 확인한다.

## site039-bug03
- bugId: `site039-bug03`
- CSV 오류명: 호출 버튼 무반응
- type: `call-taxi-button-no-response`
- 화면 위치: 우측 예약 요약 카드 하단의 `예약 호출하기` 버튼
- 관련 파일: `src/App.jsx`, `src/components/FareSummary.jsx`
- data-bug-id selector: `[data-bug-id="site039-bug03"]`
- 사용자가 경험하는 증상: 버튼은 활성 상태처럼 보이지만 클릭해도 예약 완료 상태로 바뀌거나 완료 UI가 나타나지 않는다.
- 코드상 의도된 원인: 호출 버튼 클릭 핸들러가 현재 상태인 `예약 대기`를 다시 설정할 뿐 완료 상태로 전환하지 않는다.
- PPO 에이전트가 탐지해야 할 기대 행동: `예약 호출하기` 버튼 클릭 전후의 예약 상태, 확인 메시지, 완료 화면 전환 여부를 비교해 무반응 버튼을 탐지한다.
