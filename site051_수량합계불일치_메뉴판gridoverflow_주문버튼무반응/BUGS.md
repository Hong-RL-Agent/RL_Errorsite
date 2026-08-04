# BUGS - site051 Dessert Cafe

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site051-bug01 | 수량 합계 불일치 | quantity-total-mismatch | 우측 주문 요약 패널 (총 수량) | `app.js` | `[data-bug-id="site051-bug01"]` | 장바구니에 여러 종류의 디저트를 담았을 때, 요약 패널의 '총 수량'이 실제 담긴 수량의 합계보다 적게 표시됨 | `updateCartSummary` 함수에서 총 수량을 계산할 때 배열의 마지막 아이템 수량을 의도적으로 누락함 | 장바구니에 담긴 모든 아이템의 개별 수량을 정확히 합산하여 표시해야 함 |
| site051-bug02 | 메뉴판 grid overflow | menu-grid-overflow | 중앙 메뉴 그리드 영역 | `styles.css` | `[data-bug-id="site051-bug02"]` | 화면 폭이 약 1300px 이하로 줄어들 때, 메뉴 그리드가 우측 주문 요약 패널 영역을 침범하거나 가로 스크롤이 발생함 | CSS 미디어 쿼리에서 메뉴 섹션에 과도한 `min-width: 900px`를 설정하여 레이아웃 유연성 차단 | 화면 폭에 따라 그리드 컬럼 수가 조절되거나 너비가 유동적으로 변하여 패널과 겹치지 않아야 함 |
| site051-bug03 | 주문 버튼 무반응 | dessert-order-button-no-response | '제주 말차 파운드 케이크' 카드 버튼 | `app.js` | `[data-bug-id="site051-bug03"]` | 특정 메뉴(ID:5)의 '주문하기' 버튼을 클릭해도 장바구니에 추가되지 않고 아무런 반응이 없음 | 해당 상품 ID인 경우에만 `addEventListener`를 통한 클릭 이벤트 바인딩을 의도적으로 건너뜀 | 모든 상품 카드의 '주문하기' 버튼 클릭 시 현재 설정된 수량만큼 장바구니에 정상 추가되어야 함 |
