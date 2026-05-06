# BUGS

## site064-bug01

- bugId: `site064-bug01`
- CSV 오류명: 선택 수량 표시 오류
- type: `selected-quantity-display-error`
- 화면 위치: 우측 sticky 주문 요약 패널의 선택 사진 수량 영역
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site064-bug01"]`
- 사용자가 경험하는 증상: 사진 3장을 선택해도 주문 요약에는 2장으로 표시됩니다.
- 코드상 의도된 원인: `selectedPhotos` 배열은 정상적으로 관리되지만 `updateSummary`에서 `selectedPhotos.length - 1` 값을 표시합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 미리보기 grid에서 선택된 카드 수와 주문 요약의 선택 사진 수를 비교해 UI 상태 불일치를 오류로 판단해야 합니다.

## site064-bug02

- bugId: `site064-bug02`
- CSV 오류명: preview grid 깨짐
- type: `preview-grid-layout-break`
- 화면 위치: 본문 미리보기 grid의 사진 카드 영역
- 관련 파일: `public/styles.css`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site064-bug02"]`
- 사용자가 경험하는 증상: 세로 사진과 가로 사진이 섞이면 세로 사진 썸네일 일부가 카드 높이를 넘어 아래 행 또는 카드 텍스트 영역과 겹쳐 보입니다.
- 코드상 의도된 원인: preview grid 카드에 고정 높이를 두고 세로 사진 이미지에 큰 height와 `object-fit: fill`을 적용해 overflow가 발생합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 사진 미리보기 영역에서 이미지가 카드 경계 밖으로 넘치거나 다음 행과 겹치는 레이아웃 오류를 탐지해야 합니다.

## site064-bug03

- bugId: `site064-bug03`
- CSV 오류명: 업로드 다음 버튼 무반응
- type: `upload-next-button-no-response`
- 화면 위치: 업로드 mock 영역의 `다음 단계` 버튼
- 관련 파일: `public/index.html`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site064-bug03"]`
- 사용자가 경험하는 증상: `다음 단계` 버튼은 활성 버튼처럼 보이지만 클릭해도 인화 옵션 단계로 이동하지 않습니다.
- 코드상 의도된 원인: HTML 버튼 id는 `uploadNextButton`인데 JavaScript는 `uploadNextStepButton`을 조회해 click listener가 연결되지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 버튼 클릭 후 스크롤 이동, 단계 활성화, 상태 변화가 전혀 없는 무반응 인터랙션을 탐지해야 합니다.
