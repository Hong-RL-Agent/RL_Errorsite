# BUGS.md

## site086-bug01

- bugId: `site086-bug01`
- CSV 오류명: 재고 상태 표시 불일치
- type: `stock-status-display-mismatch`
- 화면 위치: 상품 상세 모달의 재고 상태 영역
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site086-bug01"]`
- 사용자가 경험하는 증상: 상품 카드에서는 같은 상품이 `재고 있음`으로 표시되지만 상세 모달에서는 `품절`로 표시된다. 품절 상품은 반대로 상세 모달에서 `재고 있음`처럼 보일 수 있다.
- 코드상 의도된 원인: 카드 렌더링은 정상 `stockStatusLabelMap`을 사용하지만, 상세 모달에서는 `available`과 `soldout` 라벨을 뒤바꾼 `modalStockStatusLabelMap`을 사용한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 상품 카드의 재고 상태와 상세 모달의 재고 상태를 비교해 동일 상품에서 라벨이 불일치함을 감지해야 한다.

## site086-bug02

- bugId: `site086-bug02`
- CSV 오류명: 상품 비교표 overflow
- type: `instrument-comparison-overflow`
- 화면 위치: 중앙 본문 하단의 `추천 악기 비교표` 영역
- 관련 파일: `public/styles.css`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site086-bug02"]`
- 사용자가 경험하는 증상: 데스크톱 중간 폭에서 비교표의 마지막 컬럼이 우측 장바구니 패널 방향으로 밀리며 일부가 보이지 않고, 가로 스크롤로 접근할 수 없다.
- 코드상 의도된 원인: `.comparison-table`에 고정 너비와 고정 컬럼 폭을 적용하고 `.comparison-frame`에 `overflow-x: hidden`을 지정해 초과 컬럼을 숨긴다.
- PPO 에이전트가 탐지해야 할 기대 행동: 비교표 영역의 마지막 컬럼이 컨테이너 밖으로 잘리거나 접근 불가능한 레이아웃 overflow를 탐지해야 한다.

## site086-bug03

- bugId: `site086-bug03`
- CSV 오류명: 장바구니 담기 버튼 무반응
- type: `instrument-cart-button-no-response`
- 화면 위치: `Riverton Studio Classic ST` 기타 상품 카드의 `장바구니 담기` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site086-bug03"]`
- 사용자가 경험하는 증상: 특정 기타 상품의 장바구니 버튼은 활성 버튼처럼 보이지만 클릭해도 장바구니 수량과 상품 목록이 변경되지 않는다.
- 코드상 의도된 원인: `BUGGY_CART_INSTRUMENT_ID`와 일치하는 상품의 카드 버튼에는 `click` 이벤트 리스너를 연결하지 않고 조기 반환한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 악기 상품의 장바구니 버튼과 비교해 특정 기타 상품 버튼 클릭 후 장바구니 상태가 변하지 않는 것을 감지해야 한다.
