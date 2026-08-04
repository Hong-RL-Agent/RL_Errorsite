# BUGS - site029

## site029-bug01

- bugId: `site029-bug01`
- CSV 오류명: 좌석 등급 표시 오류
- type: `ticket-tier-label-mismatch`
- 화면 위치: 본문 `Seat & Tier` 영역의 티켓 등급 카드 그룹
- 관련 파일: `src/components/TicketTierCards.jsx`
- data-bug-id selector: `[data-bug-id="site029-bug01"]`
- 사용자가 경험하는 증상: VIP 등급 카드가 일반석 라벨과 흰색 계열로 보이고, Standard 카드가 VIP 배지와 네온핑크 색상으로 보인다.
- 코드상 의도된 원인: API의 `tierName`, `color` 값은 정상이나 프론트엔드 `brokenTierPresentation` map에서 `vip`와 `standard`의 label/color/badge를 의도적으로 뒤바꿨다.
- PPO 에이전트가 탐지해야 할 기대 행동: `/api/ticket-tiers` 데이터와 화면 카드 라벨, 색상, 배지를 비교해 등급 표시가 잘못 매핑된 것을 탐지한다.
- 탐지 포인트: VIP 가격/혜택 데이터가 들어간 카드의 시각 라벨이 `Standard`로 렌더링되는지 확인한다.

## site029-bug02

- bugId: `site029-bug02`
- CSV 오류명: checkout drawer 잘림
- type: `checkout-drawer-clipped`
- 화면 위치: 우측 checkout drawer 하단 결제 영역
- 관련 파일: `src/styles/checkout.css`, `src/components/CheckoutDrawer.jsx`
- data-bug-id selector: `[data-bug-id="site029-bug02"]`
- 사용자가 경험하는 증상: drawer가 열렸을 때 콘텐츠가 길어져 하단 총액/결제 버튼 영역이 화면 또는 drawer 아래쪽에서 잘리며 스크롤로 접근하기 어렵다.
- 코드상 의도된 원인: `.checkout-drawer`에 고정 `height: 520px`와 `overflow: hidden`을 적용해 내부 콘텐츠가 넘쳐도 스크롤되지 않게 했다.
- PPO 에이전트가 탐지해야 할 기대 행동: 예매 drawer를 열고 하단 결제 버튼이 완전히 보이는지, 키보드/스크롤로 접근 가능한지 확인한다.
- 탐지 포인트: `[data-bug-id="site029-bug02"]` 영역의 결제 버튼 일부가 drawer 경계에 의해 잘리는지 관찰한다.

## site029-bug03

- bugId: `site029-bug03`
- CSV 오류명: 선택 상태 불일치
- type: `ticket-selection-state-mismatch`
- 화면 위치: checkout drawer의 예매 요약 제목 영역
- 관련 파일: `src/App.jsx`, `src/components/CheckoutDrawer.jsx`
- data-bug-id selector: `[data-bug-id="site029-bug03"]`
- 사용자가 경험하는 증상: 공연 카드에서 다른 공연을 선택하면 카드의 `선택됨` 배지는 새 공연으로 이동하지만 checkout drawer 제목에는 이전 공연명이 남는다.
- 코드상 의도된 원인: `selectedEvent`는 공연 카드 클릭 시 정상 업데이트되지만, `checkoutSummaryEvent`는 최초 선택값으로 고정되고 이후 선택 변경을 반영하지 않는다.
- PPO 에이전트가 탐지해야 할 기대 행동: 서로 다른 공연을 순차 선택한 뒤 선택 배지의 공연명과 checkout 요약 제목이 일치하는지 비교한다.
- 탐지 포인트: drawer 내부의 `현재 선택 카드` 텍스트와 `[data-bug-id="site029-bug03"]` 제목이 다른 공연명을 표시하는지 확인한다.
