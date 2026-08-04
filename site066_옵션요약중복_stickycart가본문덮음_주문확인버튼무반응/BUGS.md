# Intentional Frontend GUI Bugs - site066

PPO 에이전트 탐지용 의도적 GUI 오류 명세입니다.

---

### 1. 옵션 요약 중복
- **Bug ID**: `site066-bug01`
- **CSV 오류명**: 옵션 요약 중복
- **Type**: `order-option-summary-duplicate`
- **화면 위치**: 우측 '주문 요약' 패널의 추가 옵션 영역
- **관련 파일**: `public/app.js` (renderOptionSummary 함수)
- **Selector**: `[data-bug-id="site066-bug01"]`
- **사용자 경험 증상**: 사용자가 추가 옵션에서 '밥 적게' 체크박스를 한 번만 선택했음에도 불구하고, 우측 주문 요약 텍스트에는 '✔️ Less Rice' 항목이 동일하게 두 번 렌더링되어 혼란을 줍니다.
- **의도된 원인**: `renderOptionSummary` 함수 내에서 'Less Rice' 옵션이 발견되면 강제로 DOM 요소를 하나 더 생성하여 `appendChild` 하도록 설계되었습니다.
- **기대 탐지 행동**: 선택된 체크박스의 실제 값 개수와 화면에 표시된 요약 텍스트의 개수가 일치하는지 비교하여 중복 렌더링을 탐지해야 합니다.

---

### 2. Sticky Cart 레이아웃 침범
- **Bug ID**: `site066-bug02`
- **CSV 오류명**: sticky cart가 본문 덮음
- **Type**: `sticky-cart-overlap`
- **화면 위치**: 화면 우측 주문 요약 패널 및 중앙 상품 그리드 경계
- **관련 파일**: `public/styles.css`
- **Selector**: `[data-bug-id="site066-bug02"]`
- **사용자 경험 증상**: 우측에 고정되어 있어야 할 주문 요약 패널이 비정상적으로 넓게 설정되어 있어, 중앙에 위치한 도시락 상품 카드들의 우측 부분을 가리게 됩니다. 이로 인해 가려진 부분의 버튼 클릭이 불가능해지는 등 조작 방해가 발생합니다.
- **의도된 원인**: `.sticky-cart` 클래스에 부모 그리드 영역보다 큰 고정 `width`(`450px`)를 부여하여 레이아웃 침범을 유도했습니다.
- **기대 탐지 행동**: 시각적 경계(Bounding Box) 분석을 통해 우측 패널이 인접한 그리드 요소와 겹치는지(Overlap) 탐지해야 합니다.

---

### 3. 주문 확인 버튼 무반응
- **Bug ID**: `site066-bug03`
- **CSV 오류명**: 주문 확인 버튼 무반응
- **Type**: `order-confirm-button-no-response`
- **화면 위치**: 우측 하단 '주문 확인' 버튼
- **관련 파일**: `public/app.js` (initEventListeners 함수)
- **Selector**: `button[data-bug-id="site066-bug03"]`
- **사용자 경험 증상**: 장바구니에 도시락을 담고 옵션을 선택한 뒤 최종적으로 '주문 확인' 버튼을 클릭해도 아무런 알림창이나 페이지 변화가 나타나지 않습니다.
- **의도된 원인**: JavaScript의 `getElementById`에서 사용한 ID(`order-complete-button`)가 실제 HTML 버튼의 ID(`order-confirm-btn`)와 일치하지 않아 클릭 이벤트가 등록되지 않았습니다.
- **기대 탐지 행동**: 버튼 요소에 대한 클릭 인터랙션 후 예상되는 UI 피드백(Alert 또는 모달)이 누락되었음을 탐지해야 합니다.
