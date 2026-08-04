# BUGS

## site061-bug01

- bugId: `site061-bug01`
- CSV 오류명: 색상 옵션 표시 불일치
- type: `color-option-display-mismatch`
- 화면 위치: 가구 상품 카드의 색상 swatch 아래 선택 색상 배지
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site061-bug01"]`
- 사용자가 경험하는 증상: 사용자가 `월넛` 색상 swatch를 선택하면 swatch 선택 상태는 월넛으로 바뀌지만 배지 텍스트는 `오크`로 표시됩니다.
- 코드상 의도된 원인: `selectedColor` 값은 정상 변경되지만 `colorLabelMap`에서 `walnut`과 `oak`의 표시 라벨이 뒤바뀌어 있습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 선택된 swatch value와 표시 라벨이 서로 다른 색상을 나타내는 상태 매핑 오류를 탐지해야 합니다.

## site061-bug02

- bugId: `site061-bug02`
- CSV 오류명: 갤러리 썸네일 깨짐
- type: `gallery-thumbnail-layout-break`
- 화면 위치: 상품 상세 모달의 썸네일 갤러리
- 관련 파일: `public/index.html`, `public/styles.css`
- data-bug-id selector: `[data-bug-id="site061-bug02"]`
- 사용자가 경험하는 증상: 상품 상세 모달에서 썸네일 이미지들이 가로로 과도하게 넓어져 일부가 모달 밖으로 밀리고, 이미지 비율도 찌그러져 보입니다.
- 코드상 의도된 원인: 썸네일 갤러리에 `width: 620px`, 고정 썸네일 폭, `object-fit: fill`, `overflow: visible`을 적용했습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 모달 내부 폭을 넘는 썸네일 overflow와 특정 이미지 비율 깨짐을 탐지해야 합니다.

## site061-bug03

- bugId: `site061-bug03`
- CSV 오류명: 견적 요청 버튼 무반응
- type: `quote-request-button-no-response`
- 화면 위치: `모듈러 월넛 소파` 상품 카드의 `견적 요청` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site061-bug03"]`
- 사용자가 경험하는 증상: 해당 소파 상품의 `견적 요청` 버튼은 정상 버튼처럼 보이지만 클릭해도 우측 견적 요약에 추가되지 않습니다.
- 코드상 의도된 원인: `FR-061-02` 상품 버튼에만 click event listener를 연결하지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 상품 견적 요청 버튼은 정상 작동하지만 특정 소파 상품 버튼만 상태 변화를 만들지 않는 이벤트 바인딩 오류를 탐지해야 합니다.
