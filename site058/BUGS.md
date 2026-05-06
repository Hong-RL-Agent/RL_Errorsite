# BUGS

## site058-bug01

- bugId: `site058-bug01`
- CSV 오류명: 추천 목록 undefined
- type: `undefined-recommendation-render`
- 화면 위치: 추천 도서 carousel의 `클라우드 아래 철학` 카드
- 관련 파일: `server.js`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site058-bug01"]`
- 사용자가 경험하는 증상: 추천 카드 설명 또는 저자 alias 위치에 `undefined` 텍스트가 그대로 표시됩니다.
- 코드상 의도된 원인: `/api/books`의 특정 추천 도서에는 `recommendationReason`과 `authorAlias` optional 필드가 없고, 프론트엔드가 fallback 없이 템플릿 문자열로 렌더링합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: API optional 필드 누락이 사용자 화면에 `undefined` 텍스트로 노출되는 렌더링 오류를 탐지해야 합니다.

## site058-bug02

- bugId: `site058-bug02`
- CSV 오류명: pricing section 겹침
- type: `pricing-section-overlap`
- 화면 위치: 요금제 섹션과 FAQ 섹션 사이
- 관련 파일: `public/index.html`, `public/styles.css`
- data-bug-id selector: `[data-bug-id="site058-bug02"]`
- 사용자가 경험하는 증상: 가격 섹션의 요금제 카드가 아래 FAQ 영역 위로 겹쳐 보입니다. 데스크톱 중간 폭에서 더 쉽게 관찰됩니다.
- 코드상 의도된 원인: 가격 섹션에 `margin-bottom: -120px`와 높은 `z-index`를 지정해 아래 섹션과 겹치도록 만들었습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 인접한 콘텐츠 섹션 간 간격이 무너져 카드와 FAQ가 겹치는 레이아웃 오류를 탐지해야 합니다.

## site058-bug03

- bugId: `site058-bug03`
- CSV 오류명: 다운로드 버튼 무반응
- type: `download-button-no-response`
- 화면 위치: hero 영역의 `리더 앱 다운로드` 버튼
- 관련 파일: `public/index.html`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site058-bug03"]`
- 사용자가 경험하는 증상: hero 다운로드 버튼은 활성 버튼처럼 보이지만 클릭해도 다운로드 안내 모달이 열리지 않습니다. 상단 다운로드 버튼은 정상 동작합니다.
- 코드상 의도된 원인: 헤더 다운로드 버튼에는 click listener를 연결했지만 hero 다운로드 버튼에는 listener를 연결하지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 같은 다운로드 행동처럼 보이는 두 버튼 중 특정 버튼만 이벤트 반응이 없는 상태를 탐지해야 합니다.
