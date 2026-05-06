# BUGS.md

## site088-bug01

- bugId: `site088-bug01`
- CSV 오류명: 지도 마커와 목록 불일치
- type: `map-marker-list-mismatch`
- 화면 위치: 좌측 매물 리스트 선택 상태와 중앙 지도 mock 마커 강조 상태
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site088-bug01"]`
- 사용자가 경험하는 증상: 좌측 매물 리스트에서 다른 매물을 선택해도 중앙 지도에서는 이전에 선택된 마커 또는 첫 번째 마커가 계속 강조되어, 서로 다른 매물이 선택된 것처럼 보인다.
- 코드상 의도된 원인: 리스트 클릭 시 `selectedListingId`는 정상 변경되지만, `renderMapMarkers()`에서 강조 기준으로 `selectedListingId`가 아니라 `selectedMapId || listings[0].id`를 사용한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 리스트 카드의 active 상태와 지도 마커의 active 상태를 비교해 선택 매물 동기화 불일치를 감지해야 한다.

## site088-bug02

- bugId: `site088-bug02`
- CSV 오류명: 지도 패널 overlay 오류
- type: `map-panel-overlay-error`
- 화면 위치: 중앙 지도 mock 패널과 우측 매물 상세/상담 요약 패널 경계
- 관련 파일: `public/styles.css`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site088-bug02"]`
- 사용자가 경험하는 증상: 1200px 전후 데스크톱 폭에서 지도 mock 패널이 우측 매물 상세 패널 위로 겹쳐 상세 정보 일부를 가린다.
- 코드상 의도된 원인: 특정 데스크톱 폭 media query에서 `.map-panel`에 `width: calc(100% + 180px)`, 음수 margin, 높은 z-index를 적용해 우측 컬럼을 침범한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 데스크톱 중간 폭에서 지도 패널과 우측 상세 패널의 시각적 겹침을 탐지해야 한다.

## site088-bug03

- bugId: `site088-bug03`
- CSV 오류명: 상담 문의 버튼 무반응
- type: `realestate-inquiry-button-no-response`
- 화면 위치: `한남 리버뷰 하이엔드 레지던스` 매물 카드의 `상담 문의` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site088-bug03"]`
- 사용자가 경험하는 증상: 특정 매물 카드의 상담 문의 버튼은 활성 버튼처럼 보이지만 클릭해도 우측 상담 요약 패널의 매물, 지역, 중개사 정보가 변경되지 않는다.
- 코드상 의도된 원인: `BUGGY_INQUIRY_LISTING_ID`와 일치하는 버튼에는 `click` 이벤트 리스너를 연결하지 않고 조기 반환한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 매물 상담 문의 버튼과 비교해 특정 매물 버튼 클릭 후 상담 요약 상태가 변하지 않는 것을 감지해야 한다.
