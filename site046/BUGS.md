# BUGS - site046

## site046-bug01

- bugId: `site046-bug01`
- CSV 오류명: 상품 개수 UI 불일치
- type: `cart-count-ui-mismatch`
- 화면 위치: 상단 헤더의 장바구니 버튼 숫자 배지
- 관련 파일: `public/index.html`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site046-bug01"]`
- 사용자가 경험하는 증상: 상품을 장바구니에 담으면 우측 장바구니 목록에는 상품이 정상 추가되지만 헤더 장바구니 배지는 실제보다 하나 적은 수를 표시합니다.
- 코드상 의도된 원인: `renderCart()`에서 실제 `state.cart.length` 대신 `Math.max(0, state.cart.length - 1)`을 헤더 배지에 렌더링합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 상품을 1개 이상 담은 뒤 우측 장바구니 목록 개수와 헤더 배지 숫자를 비교해 UI 상태 불일치를 감지합니다.
- 탐지 포인트: 첫 상품을 담았을 때 장바구니 목록은 1개지만 헤더 배지는 0으로 유지됩니다.

## site046-bug02

- bugId: `site046-bug02`
- CSV 오류명: 카드 flex 깨짐
- type: `product-card-flex-break`
- 화면 위치: 중앙 상품 grid의 `새학기 데스크 정리 올인원 문구 스타터 키트 라이트블루 에디션 노트 펜 메모 플래너 구성` 카드
- 관련 파일: `public/app.js`, `public/styles.css`
- data-bug-id selector: `[data-bug-id="site046-bug02"]`
- 사용자가 경험하는 증상: 특정 긴 상품명 카드가 다른 카드보다 제목 영역이 길게 늘어나고 하단 버튼 위치가 주변 상품 카드와 맞지 않습니다.
- 코드상 의도된 원인: 해당 카드에 `bug-flex-break` 클래스를 부여하고 CSS에서 line clamp와 하단 버튼 자동 정렬을 해제했습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 같은 grid 안의 주변 카드와 비교해 카드 높이, 제목 줄 수, 하단 버튼 y 위치가 불균형한지 판단합니다.
- 탐지 포인트: 상품 grid는 유지되지만 특정 카드 내부의 버튼 행이 다른 카드보다 아래 또는 어긋난 위치에 보입니다.

## site046-bug03

- bugId: `site046-bug03`
- CSV 오류명: 담기 버튼 무반응
- type: `add-to-cart-button-no-response`
- 화면 위치: 하단 `이번 주 베스트 상품` 섹션의 `데스크 위클리 플래너 A4` 카드 담기 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site046-bug03"]`
- 사용자가 경험하는 증상: 버튼은 정상 버튼처럼 보이고 비활성화되어 있지 않지만 클릭해도 우측 장바구니 목록과 헤더 배지가 변하지 않습니다.
- 코드상 의도된 원인: 베스트 상품 렌더링 시 `p-103` 상품 버튼에만 click 이벤트 리스너를 연결하지 않았습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 해당 버튼 클릭 전후 장바구니 상태가 변하지 않는 것을 확인하고 이벤트 무반응 오류로 분류합니다.
- 탐지 포인트: 다른 베스트 상품 담기 버튼은 장바구니가 증가하지만 `p-103` 베스트 카드 버튼만 아무 변화가 없습니다.
