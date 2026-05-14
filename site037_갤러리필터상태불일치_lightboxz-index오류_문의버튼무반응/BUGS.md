# site037 BUGS

## site037-bug01

- bugId: `site037-bug01`
- CSV 오류명: 갤러리 필터 상태 불일치
- type: `gallery-filter-state-mismatch`
- 화면 위치: 포트폴리오 섹션의 갤러리 필터와 masonry grid
- 관련 파일: `src/App.jsx`, `src/components/MasonryGallery.jsx`
- data-bug-id selector: `[data-bug-id="site037-bug01"]`
- 사용자가 경험하는 증상: 필터 탭은 `웨딩`이 선택된 것처럼 보이지만 실제 grid에는 `프로필` 등 이전 필터 기준의 사진이 섞여 보인다.
- 코드상 의도된 원인: `activeFilter`는 정상 변경되지만 grid 렌더링에 쓰는 `filteredPhotos` 계산이 `previousFilter`를 사용한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 선택된 필터 라벨과 카드의 카테고리 라벨을 비교하여 시각적으로 불일치한 사진 카드가 존재함을 탐지한다.

## site037-bug02

- bugId: `site037-bug02`
- CSV 오류명: lightbox z-index 오류
- type: `lightbox-z-index-error`
- 화면 위치: 이미지 클릭 후 열리는 lightbox overlay 상단
- 관련 파일: `src/components/Lightbox.jsx`, `src/styles/lightbox.css`, `src/styles/portfolio.css`
- data-bug-id selector: `[data-bug-id="site037-bug02"]`
- 사용자가 경험하는 증상: lightbox가 열렸는데 fixed header와 예약 문의 버튼이 overlay 위에 남아 확대 이미지를 가린다.
- 코드상 의도된 원인: header의 `z-index`가 3000인데 lightbox overlay의 `z-index`가 1200으로 낮게 설정되어 있다.
- PPO 에이전트가 탐지해야 할 기대 행동: modal 계층이 열렸을 때 header가 overlay보다 위에 보여 시각적 가림이 발생하는지 확인한다.

## site037-bug03

- bugId: `site037-bug03`
- CSV 오류명: 문의 버튼 무반응
- type: `contact-button-no-response`
- 화면 위치: hero 영역의 `촬영 문의하기` CTA 버튼
- 관련 파일: `src/components/StudioHero.jsx`
- data-bug-id selector: `[data-bug-id="site037-bug03"]`
- 사용자가 경험하는 증상: hero의 `촬영 문의하기` 버튼을 클릭해도 문의 폼으로 스크롤되지 않고 아무 변화가 없다. 상단 메뉴의 `Contact` 링크와 `예약 문의` 버튼은 정상 동작한다.
- 코드상 의도된 원인: hero CTA에 연결된 클릭 핸들러가 비어 있어 올바른 앵커 이동이나 스크롤 동작이 실행되지 않는다.
- PPO 에이전트가 탐지해야 할 기대 행동: 동일 목적의 다른 문의 링크는 정상 이동하지만 hero CTA만 클릭 후 위치 변화가 없음을 탐지한다.
