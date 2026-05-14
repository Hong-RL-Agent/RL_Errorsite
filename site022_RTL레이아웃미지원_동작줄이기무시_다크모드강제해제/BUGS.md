# BUGS - site022 의도된 오류 상세 설명

## 1. RTL 언어 미지원 (rtl-layout-not-supported)
- **Bug ID**: site022-bug01
- **유형**: `rtl-layout-not-supported`
- **화면 위치**: 메인 기사 목록 영역 및 카테고리 탭
- **관련 컴포넌트**: `src/components/ArticleGrid.jsx`, `src/App.jsx`
- **data-bug-id Selector**: `[data-bug-id="site022-bug01"]`
- **사용자 경험 증상**: 상단의 "RTL Preview" 버튼을 눌러 아랍어/히브리어 등 우측에서 좌측으로 읽는 언어 환경을 모방했을 때, 텍스트 방향은 바뀌지만 기사 카드의 이미지 위치나 레이아웃 순서가 여전히 LTR(좌측에서 우측) 기준으로 고정되어 있어 부자연스러운 UI를 보임.
- **코드상 의도된 원인**: `dir="rtl"` 속성이 부여되어도 내부 요소들의 `flex-direction`이나 정렬 속성이 논리적 속성(start/end)이 아닌 물리적 속성(left/right)으로 고정되어 있음.
- **탐지 포인트**: `dir="rtl"` 환경에서 레이아웃 대칭(Mirroring) 실패 여부.

## 2. 동작 줄이기 무시 (prefers-reduced-motion-ignored)
- **Bug ID**: site022-bug02
- **유형**: `prefers-reduced-motion-ignored`
- **화면 위치**: 상단 속보 티커 (Breaking Ticker)
- **관련 컴포넌트**: `src/components/BreakingTicker.jsx`
- **data-bug-id Selector**: `[data-bug-id="site022-bug02"]`
- **사용자 경험 증상**: 전정기관 장애가 있거나 움직임에 민감한 사용자가 OS 설정에서 "동작 줄이기"를 활성화했음에도 불구하고, 상단의 속보 티커 애니메이션이 멈추지 않고 계속해서 빠르게 움직여 어지러움을 유발함.
- **코드상 의도된 원인**: CSS 애니메이션에 `@media (prefers-reduced-motion: reduce)` 미디어 쿼리를 사용하여 애니메이션을 정지시키는 처리를 의도적으로 누락함.
- **탐지 포인트**: 시스템 동작 줄이기 설정 시 애니메이션 지속 여부.

## 3. 다크 모드 강제 해제 (dark-mode-override)
- **Bug ID**: site022-bug03
- **유형**: `dark-mode-override`
- **화면 위치**: 메인 페이지 배경 및 컨테이너 전체
- **관련 컴포넌트**: `src/App.jsx`, `src/styles/global.css`
- **data-bug-id Selector**: `[data-bug-id="site022-bug03"]`
- **사용자 경험 증상**: 사용자가 브라우저나 시스템 설정을 다크 모드로 사용하고 있음에도 불구하고, 웹사이트가 강제로 밝은(Light) 배경색과 테마를 유지하여 다크 모드 사용자에게 시각적 피로감을 줌.
- **코드상 의도된 원인**: `@media (prefers-color-scheme: dark)` 설정을 누락하거나, 클래스 기반 테마 전환 시 시스템 설정을 감지하지 않고 `light-theme`을 강제함.
- **탐지 포인트**: 시스템 테마 설정과 웹사이트 렌더링 테마의 불일치.
