# BUGS

## site055-bug01

- bugId: `site055-bug01`
- CSV 오류명: 배송 옵션 상태 불일치
- type: `delivery-option-state-mismatch`
- 화면 위치: 우측 장바구니 요약 sticky 패널의 배송 옵션 행
- 관련 파일: `public/index.html`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site055-bug01"]`
- 사용자가 경험하는 증상: 배송 옵션 UI에서 `오늘 배송`을 선택해도 장바구니 요약에는 `일반 배송`이 계속 표시됩니다. 다만 배송비와 예상 도착일은 선택한 옵션 기준으로 바뀌어 상태 불일치가 보입니다.
- 코드상 의도된 원인: `selectedDeliveryOptionId`는 정상 변경하지만 `renderCartSummary()`가 배송 옵션 이름 표시에는 초기 옵션 값인 `initialDeliveryOptionId`를 계속 사용합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 배송 옵션 선택 UI의 활성 상태와 장바구니 요약 텍스트가 서로 다른 state를 반영하는 오류를 탐지해야 합니다.

## site055-bug02

- bugId: `site055-bug02`
- CSV 오류명: 상품 이미지 비율 깨짐
- type: `product-image-ratio-break`
- 화면 위치: 꽃 상품 grid의 `피오니 크림 바스켓` 상품 이미지
- 관련 파일: `public/app.js`, `public/styles.css`
- data-bug-id selector: `[data-bug-id="site055-bug02"]`
- 사용자가 경험하는 증상: 특정 꽃 상품 이미지가 카드 안에서 원본 비율을 유지하지 못하고 찌그러져 보입니다.
- 코드상 의도된 원인: 특정 이미지에만 CSS `object-fit: fill`을 적용해 원본 비율을 무시하고 카드 이미지 영역에 강제로 맞춥니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 같은 카드 레이아웃 안에서 특정 상품 이미지만 비율이 깨지는 렌더링 오류를 탐지해야 합니다.

## site055-bug03

- bugId: `site055-bug03`
- CSV 오류명: 장바구니 버튼 무반응
- type: `flower-cart-button-no-response`
- 화면 위치: 꽃 상품 grid와 추천 carousel의 `오늘의 로맨스 꽃다발` 장바구니 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site055-bug03"]`
- 사용자가 경험하는 증상: 해당 추천 꽃다발의 `장바구니 담기` 버튼은 활성 버튼처럼 보이지만 클릭해도 장바구니 수량과 요약 목록이 변하지 않습니다.
- 코드상 의도된 원인: `FL-055-05` 상품 카드의 장바구니 버튼에만 click event listener를 연결하지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 상품의 장바구니 버튼은 정상 동작하지만 특정 추천 상품 버튼만 상태 변화를 만들지 않는 이벤트 오류를 탐지해야 합니다.
