# site078 BUGS

## site078-bug01

- bugId: `site078-bug01`
- CSV 오류명: 달성률 계산 불일치
- type: `campaign-progress-mismatch`
- 화면 위치: 캠페인 카드의 `상세 보기` 모달 내부 상세 달성률 영역
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site078-bug01"]`
- 사용자가 경험하는 증상: `배움의 다리 교실` 카드는 달성률이 70%로 표시되지만 상세 모달에서는 62%로 표시됩니다.
- 코드상 의도된 원인: 카드에서는 `currentAmount / targetAmount`로 계산하지만 상세 모달에서는 `targetAmount * 1.13`을 사용해 다른 계산 결과를 렌더링합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 같은 캠페인 데이터가 카드와 상세 모달에서 서로 다른 달성률로 표시되는 상태/계산 불일치를 찾아야 합니다.

## site078-bug02

- bugId: `site078-bug02`
- CSV 오류명: progress bar overflow
- type: `donation-progress-overflow`
- 화면 위치: `초록 급식 꾸러미` 캠페인 카드의 달성률 progress bar
- 관련 파일: `public/app.js`, `public/styles.css`
- data-bug-id selector: `[data-bug-id="site078-bug02"]`
- 사용자가 경험하는 증상: 초과 달성 캠페인의 progress bar가 100% 너비를 넘어 카드 오른쪽 바깥으로 튀어나옵니다.
- 코드상 의도된 원인: progress width 계산에 `Math.min(percentage, 100)` clamp를 적용하지 않고 실제 달성률을 그대로 `width`로 사용합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 목표 초과 캠페인의 progress bar가 컨테이너를 벗어나는 레이아웃 오류를 시각적으로 감지해야 합니다.

## site078-bug03

- bugId: `site078-bug03`
- CSV 오류명: 기부 약정 버튼 무반응
- type: `pledge-button-no-response`
- 화면 위치: `긴급 안심 쉼터` 캠페인 카드의 `기부 약정하기` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site078-bug03"]`
- 사용자가 경험하는 증상: 버튼은 활성 버튼처럼 보이지만 클릭해도 약정 폼 이동, 선택 캠페인 변경, 우측 요약 패널 갱신이 발생하지 않습니다.
- 코드상 의도된 원인: 특정 campaignId인 `safe-home` 버튼에는 click listener를 연결하지 않고 반환합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 같은 형태의 다른 캠페인 약정 버튼은 동작하지만 특정 캠페인의 버튼만 무반응인 이벤트 연결 누락을 찾아야 합니다.
