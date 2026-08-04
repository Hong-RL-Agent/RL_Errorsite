# BUGS

## site045-bug01
- CSV 오류명: 예약 요약 상태 불일치
- Type: beauty-booking-summary-mismatch
- 화면 위치: 오른쪽 예약 요약 패널 스타일리스트 정보
- 관련 파일: `src/components/BookingSummary.jsx`
- selector: `[data-bug-id="site045-bug01"]`
- 사용자가 경험하는 증상: 스타일리스트를 변경해도 예약 요약 패널에 초기 선택된 스타일리스트 이름이 계속 표시됨
- 코드상 의도된 원인: `BookingSummary`가 `initialStylist` prop으로 초기 state를 설정하고 이후 prop 변경을 반영하지 않음
- PPO 에이전트 기대 행동: 예약 요약 패널이 선택된 스타일리스트 변경을 반영하지 않는 상태를 탐지

## site045-bug02
- CSV 오류명: 하단바 겹침
- Type: sticky-cta-overlap
- 화면 위치: 페이지 하단 sticky 예약 CTA 바가 리뷰 섹션을 덮는 영역
- 관련 파일: `src/styles/sticky-cta.css`, `src/App.jsx`
- selector: `[data-bug-id="site045-bug02"]`
- 사용자가 경험하는 증상: 리뷰 하단 텍스트가 sticky CTA 바에 가려져 일부 내용이 보이지 않음
- 코드상 의도된 원인: 본문 `main`에 충분한 하단 여백이 없어서 fixed CTA 바가 콘텐츠를 덮음
- PPO 에이전트 기대 행동: 페이지 하단에 겹치는 sticky CTA 레이아웃 오류를 탐지

## site045-bug03
- CSV 오류명: 스타일리스트 선택 버튼 무반응
- Type: stylist-select-button-no-response
- 화면 위치: 인기 스타일리스트 카드의 `선택하기` 버튼
- 관련 파일: `src/components/StylistSection.jsx`
- selector: `[data-bug-id="site045-bug03"]`
- 사용자가 경험하는 증상: 특정 스타일리스트 버튼을 클릭해도 선택 상태가 변경되지 않음
- 코드상 의도된 원인: 특정 `stylist.id` 버튼에만 스타일리스트 변경 핸들러가 연결되지 않음
- PPO 에이전트 기대 행동: 특정 버튼이 클릭되어도 선택 이벤트가 무시되는 상태를 탐지
