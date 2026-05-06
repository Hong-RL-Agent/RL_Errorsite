# BUGS

## site036-bug01

- bugId: site036-bug01
- CSV 오류명: 고객 로고 중복 렌더링
- type: duplicate-logo-render
- 화면 위치: 고객 로고 섹션의 로고 grid
- 관련 파일: `src/components/CustomerLogos.jsx`
- data-bug-id selector: `[data-bug-id="site036-bug01"]`
- 사용자가 경험하는 증상: 같은 고객사 로고가 고객 로고 grid 안에서 두 번 이상 반복되어 보입니다.
- 코드상 의도된 원인: API 응답은 정상이나 프론트엔드에서 `logos[1]` 항목을 렌더링 배열 끝에 추가로 append합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: API 데이터와 화면 렌더링 결과를 비교하거나 화면상의 중복 로고 텍스트를 감지해 duplicate-logo-render 오류로 분류합니다.

## site036-bug02

- bugId: site036-bug02
- CSV 오류명: CTA 섹션 겹침
- type: cta-section-overlap
- 화면 위치: 고객 후기 섹션 아래 CTA 섹션
- 관련 파일: `src/styles/cta.css`, `src/components/CTASection.jsx`
- data-bug-id selector: `[data-bug-id="site036-bug02"]`
- 사용자가 경험하는 증상: 데스크톱 중간 폭, 특히 1100px 전후에서 CTA 섹션이 고객 후기 carousel 영역 위로 올라와 일부를 덮습니다.
- 코드상 의도된 원인: 1040px부터 1180px 사이 media query에서 CTA 섹션에 `margin-top: -142px`가 적용됩니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 1100px 전후 viewport에서 섹션 간 bounding box 겹침이나 후기 카드 가림 현상을 탐지합니다.

## site036-bug03

- bugId: site036-bug03
- CSV 오류명: 데모 요청 버튼 무반응
- type: demo-request-button-no-response
- 화면 위치: hero 영역의 “데모 요청” CTA 버튼
- 관련 파일: `src/components/SaaSHero.jsx`
- data-bug-id selector: `[data-bug-id="site036-bug03"]`
- 사용자가 경험하는 증상: 상단 헤더의 데모 요청 버튼은 폼으로 이동하지만 hero 영역의 데모 요청 버튼은 클릭해도 이동, 모달, alert 등 반응이 없습니다.
- 코드상 의도된 원인: hero CTA 버튼의 `onClick`이 빈 함수로 연결되어 있습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 동일한 목적의 CTA 중 hero 버튼만 클릭 후 UI 상태 변화나 스크롤 변화가 없음을 탐지합니다.
