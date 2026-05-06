# BUGS.md

## site081-bug01

- bugId: `site081-bug01`
- CSV 오류명: 장바구니 금액 합계 불일치
- type: `cart-total-price-mismatch`
- 화면 위치: 우측 sticky 장바구니 요약 패널의 상품 총액 영역
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site081-bug01"]`
- 사용자가 경험하는 증상: 장바구니에는 상품 3개와 각 상품 가격이 정상 표시되지만, 총액은 마지막 상품 가격을 제외한 금액으로 표시된다.
- 코드상 의도된 원인: `calculateCartTotal()`에서 `state.cartItems.slice(0, -1)`만 합산하여 마지막 장바구니 항목이 총액 계산에서 빠진다.
- PPO 에이전트가 탐지해야 할 기대 행동: 장바구니 개별 상품 금액의 합과 우측 총액 표시를 비교해 금액 불일치를 감지해야 한다.

## site081-bug02

- bugId: `site081-bug02`
- CSV 오류명: 필터 사이드바 겹침
- type: `filter-sidebar-overlap`
- 화면 위치: 상품 목록 영역의 좌측 필터 사이드바와 중앙 상품 grid 경계
- 관련 파일: `public/styles.css`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site081-bug02"]`
- 사용자가 경험하는 증상: 데스크톱 중간 폭, 특히 1100px 전후에서 필터 사이드바가 상품 grid 첫 번째 컬럼을 침범해 일부 상품 카드 내용이 가려진다.
- 코드상 의도된 원인: 1000px-1180px media query에서 쇼핑 레이아웃의 중앙 컬럼 최소 폭을 과도하게 유지하고 필터 패널에 넓은 고정 폭과 음수 margin을 적용한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 뷰포트를 중간 데스크톱 폭으로 조정한 뒤 필터 패널과 상품 카드의 시각적 겹침을 탐지해야 한다.

## site081-bug03

- bugId: `site081-bug03`
- CSV 오류명: 장바구니 버튼 무반응
- type: `kitchenware-cart-button-no-response`
- 화면 위치: `미야비 세이지 산토쿠 나이프 17cm` 상품 카드의 `장바구니 담기` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site081-bug03"]`
- 사용자가 경험하는 증상: 버튼은 정상 버튼처럼 보이고 비활성화되어 있지 않지만 클릭해도 장바구니 수량이나 총액이 바뀌지 않는다.
- 코드상 의도된 원인: `BUGGY_CART_PRODUCT_ID`와 일치하는 상품에는 `click` 이벤트 리스너를 연결하지 않고 조기 반환한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 상품의 장바구니 버튼과 비교해 특정 추천 상품 버튼 클릭 후 장바구니 상태가 변하지 않는 것을 감지해야 한다.
