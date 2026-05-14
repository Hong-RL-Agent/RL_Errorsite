# BUGS - site023 의도된 오류 상세 설명

## 1. 강제 폰트 적용 (forced-decorative-font)
- **Bug ID**: site023-bug01
- **유형**: `forced-decorative-font`
- **화면 위치**: 메인 화면 하단의 'Featured Projects' 섹션 내 프로젝트 상세 설명
- **관련 컴포넌트**: `src/components/ProjectCard.jsx`, `src/styles/gallery.css`
- **data-bug-id Selector**: `[data-bug-id="site023-bug01"]`
- **사용자 경험 증상**: 프로젝트의 배경이나 제작 의도를 설명하는 텍스트에 가독성이 현저히 떨어지는 장식용 필기체 폰트(`Dancing Script`)가 강제로 적용되어 있으며, 자간이 너무 넓어 내용을 읽기 매우 어려움.
- **코드상 의도된 원인**: 중요 정보 전달용 텍스트임에도 불구하고 시각적 효과를 위해 접근성을 무시하고 장식 폰트를 `!important` 등으로 고정함.
- **탐지 포인트**: 본문 가독성 수치 및 `font-family`의 장식성 여부.

## 2. 모호한 링크 텍스트 (ambiguous-link-text)
- **Bug ID**: site023-bug02
- **유형**: `ambiguous-link-text`
- **화면 위치**: 각 프로젝트 카드의 상세 페이지 이동 링크
- **관련 컴포넌트**: `src/components/ProjectCard.jsx`
- **data-bug-id Selector**: `[data-bug-id="site023-bug02"]`
- **사용자 경험 증상**: 스크린 리더 사용자가 링크 목록을 탐색할 때 모든 링크가 "자세히 보기"로만 읽혀, 각 링크가 어떤 프로젝트로 연결되는지 제목을 거쳐서 확인해야 하는 번거로움이 발생함.
- **코드상 의도된 원인**: 앵커 태그(`<a>`) 내부 텍스트를 프로젝트 제목과 결합하지 않고 정적인 "자세히 보기"로만 작성함.
- **탐지 포인트**: 동일 페이지 내에 서로 다른 목적지를 가진 여러 링크가 동일한 텍스트를 가짐.

## 3. 건너뛰기 링크 누락 (missing-skip-link)
- **Bug ID**: site023-bug03
- **유형**: `missing-skip-link`
- **화면 위치**: 웹사이트 최상단 레이아웃
- **관련 컴포넌트**: `src/components/Header.jsx`, `src/App.jsx`
- **data-bug-id Selector**: `[data-bug-id="site023-bug03"]`
- **사용자 경험 증상**: 키보드 사용자가 페이지를 새로고침할 때마다 반복되는 대형 헤더와 히어로 영역을 거치지 않고 바로 갤러리 본문으로 이동할 수 있는 수단이 없어 수십 번의 Tab 키 입력을 강요받음.
- **코드상 의도된 원인**: 웹 접근성 표준(WCAG)의 필수 항목인 "본문 바로가기" 링크를 고의로 생략함.
- **탐지 포인트**: `<body>` 시작 직후 포커스 가능한 `Skip Link` 존재 여부.
