# BUGS - site025 (Desktop) 의도된 오류 상세 설명

## 1. 너무 작은 터치(클릭) 대상 (too-small-click-target)
- **Bug ID**: site025-bug01
- **유형**: `too-small-click-target`
- **화면 위치**: 중앙 메뉴 리스트 내 각 메뉴 카드의 수량 조절 (+/-) 버튼
- **관련 컴포넌트**: `src/components/MenuCard.jsx`
- **data-bug-id Selector**: `[data-bug-id="site025-bug01"]`
- **사용자 경험 증상**: 데스크톱 환경임에도 불구하고 수량 조절 버튼의 크기가 20px로 매우 작게 설정되어 있어, 마우스 커서로 정확히 조준하여 클릭하기가 매우 어렵고 불편함.
- **코드상 의도된 원인**: 버튼의 크기와 여백(padding)을 극단적으로 작게 고정함.
- **탐지 포인트**: 대화형 요소의 클릭 가능 영역(Hit area) 크기 검증.

## 2. 고정 높이 레이아웃 깨짐 (fixed-height-cart-overflow)
- **Bug ID**: site025-bug02
- **유형**: `fixed-height-cart-overflow`
- **화면 위치**: 우측 주문 요약 패널 (Cart Summary Panel)
- **관련 컴포넌트**: `src/components/CartSummaryPanel.jsx`
- **data-bug-id Selector**: `[data-bug-id="site025-bug02"]`
- **사용자 경험 증상**: 장바구니에 담긴 메뉴가 많아질 경우, 우측 패널의 높이가 고정되어 있고 스크롤이 불가능(`overflow: hidden`)하여 가장 중요한 "결제하기" 버튼이나 합계 금액 영역이 화면 하단으로 잘려 보이지 않게 됨.
- **코드상 의도된 원인**: 패널에 고정된 `height` 속성과 `overflow: hidden`을 부여하여 콘텐츠 확장을 막음.
- **탐지 포인트**: 컨테이너 밖으로 넘치는 콘텐츠의 가시성 및 조작 가능성.

## 3. 복잡한 제스처 강요 (gesture-only-action)
- **Bug ID**: site025-bug03
- **유형**: `gesture-only-action`
- **화면 위치**: 우측 패널 하단 쿠폰 관리 영역
- **관련 컴포넌트**: `src/components/CouponPanel.jsx`
- **data-bug-id Selector**: `[data-bug-id="site025-bug03"]`
- **사용자 경험 증상**: 데스크톱 웹사이트임에도 불구하고 등록된 쿠폰을 삭제하려면 버튼 클릭이 아닌 "쿠폰 카드를 왼쪽으로 드래그"하는 제스처를 취해야만 함. 삭제 버튼이나 키보드 단축키 등 대체 수단이 없어 사용성이 크게 저해됨.
- **코드상 의도된 원인**: 삭제 버튼을 의도적으로 제거하고 드래그(Pointer Drag) 이벤트에만 삭제 로직을 연결함.
- **탐지 포인트**: 마우스/키보드 표준 입력 대신 복잡한 제스처를 강제하는 인터페이스 탐지.
