# BUGS - site035

## site035-bug01

- bugId: `site035-bug01`
- CSV 오류명: 배송일 표시 undefined
- type: `undefined-delivery-date`
- 화면 위치: 크림 라넌큘러스 바스켓 상품 카드의 배송일 영역
- 관련 파일: `src/components/FlowerCard.jsx`, `server.js`
- data-bug-id selector: `[data-bug-id="site035-bug01"]`
- 사용자가 경험하는 증상: 배송일 텍스트에 `undefined`가 그대로 표시된다.
- 코드상 의도된 원인: 일부 상품의 `deliveryDateLabel`이 누락되어 있고 프론트엔드는 fallback 없이 직접 렌더링한다.
- 탐지 포인트: 상품 카드 배송일 텍스트가 유효한 날짜 안내가 아닌 `undefined`인지 확인한다.

## site035-bug02

- bugId: `site035-bug02`
- CSV 오류명: 상품 카드 높이 깨짐
- type: `product-card-height-break`
- 화면 위치: 긴 이름을 가진 시즌 한정 플라워 오브제 카드
- 관련 파일: `src/styles/flowers.css`, `src/components/FlowerCard.jsx`
- data-bug-id selector: `[data-bug-id="site035-bug02"]`
- 사용자가 경험하는 증상: 긴 상품명 카드가 과도하게 커지고 버튼 위치가 다른 카드와 어긋난다.
- 코드상 의도된 원인: 긴 상품명 줄바꿈 제한과 카드 하단 정렬 고정을 누락했다.
- 탐지 포인트: grid 안에서 특정 카드 높이와 버튼 기준선이 주변 카드와 불균형한지 확인한다.

## site035-bug03

- bugId: `site035-bug03`
- CSV 오류명: 주문 버튼 상태 불일치
- type: `order-button-state-mismatch`
- 화면 위치: 품절 상품 카드의 주문 버튼
- 관련 파일: `src/components/FlowerCard.jsx`, `src/styles/flowers.css`
- data-bug-id selector: `[data-bug-id="site035-bug03"]`
- 사용자가 경험하는 증상: 품절 상품인데 버튼이 활성 스타일처럼 보여 주문 가능하다고 오해할 수 있다.
- 코드상 의도된 원인: disabled 속성은 있지만 활성 스타일 class가 남아 시각 상태가 잘못 표시된다.
- 탐지 포인트: 버튼 disabled 상태와 시각적 활성 스타일이 불일치하는지 확인한다.
