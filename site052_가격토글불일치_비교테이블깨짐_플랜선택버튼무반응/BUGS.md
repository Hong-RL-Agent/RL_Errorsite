# BUGS

## site052-bug01

- bugId: `site052-bug01`
- CSV 오류명: 가격 토글 불일치
- type: `pricing-toggle-mismatch`
- 화면 위치: 회원권 가격 카드 중 추천 플랜 `Performance Plus` 가격 영역
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site052-bug01"]`
- 사용자가 경험하는 증상: 월간/연간 토글을 연간으로 바꾸면 다른 플랜 가격은 연간 가격으로 바뀌지만 추천 플랜 카드만 월간 가격이 계속 표시됩니다.
- 코드상 의도된 원인: `renderPlans()`에서 추천 플랜일 때 `billingMode`를 무시하고 `monthlyPrice`를 항상 사용합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 같은 결제 토글 상태에서 일부 카드만 다른 가격 단위를 표시하는 상태 반영 불일치 오류를 탐지해야 합니다.

## site052-bug02

- bugId: `site052-bug02`
- CSV 오류명: 비교 테이블 깨짐
- type: `plan-comparison-table-break`
- 화면 위치: 회원권 비교표 섹션
- 관련 파일: `public/index.html`, `public/styles.css`
- data-bug-id selector: `[data-bug-id="site052-bug02"]`
- 사용자가 경험하는 증상: 데스크톱 중간 폭에서 비교표 마지막 컬럼이 컨테이너 밖으로 밀리고 일부 텍스트가 잘립니다.
- 코드상 의도된 원인: 비교표에 고정 컬럼 폭을 적용하고 wrapper에는 `overflow-x: hidden`을 지정해 가로 스크롤을 제공하지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 테이블의 실제 너비가 표시 컨테이너보다 큰데 마지막 컬럼 접근이 불가능한 레이아웃 오류를 탐지해야 합니다.

## site052-bug03

- bugId: `site052-bug03`
- CSV 오류명: 플랜 선택 버튼 무반응
- type: `plan-select-button-no-response`
- 화면 위치: 회원권 가격 카드 중 `Elite Coaching` 플랜 선택 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site052-bug03"]`
- 사용자가 경험하는 증상: `Elite Coaching`의 `선택하기` 버튼은 활성 버튼처럼 보이지만 클릭해도 우측 sticky 플랜 요약이 변경되지 않습니다.
- 코드상 의도된 원인: `elite` 플랜 버튼에만 click event listener를 연결하지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 플랜 선택 버튼은 정상 동작하지만 특정 프리미엄 플랜 버튼만 상태 변화를 만들지 않는 이벤트 바인딩 오류를 탐지해야 합니다.
