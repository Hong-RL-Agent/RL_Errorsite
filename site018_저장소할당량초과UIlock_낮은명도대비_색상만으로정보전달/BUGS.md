# BUGS - site018 의도된 오류 상세 설명

## 1. 브라우저 저장소 할당량 초과 (storage-quota-ui-lock)
- **Bug ID**: site018-bug01
- **유형**: `storage-quota-ui-lock`
- **화면 위치**: 메인 화면 우측 "내 일정 요약" 패널의 "오프라인 저장" 버튼 클릭 시 발생
- **관련 컴포넌트**: `src/components/TripSummaryPanel.jsx`
- **data-bug-id Selector**: `[data-bug-id="site018-bug01"]`
- **사용자 경험 증상**: "오프라인 저장" 버튼을 누르면 저장 중(스피너) 상태로 변하지만, 에러 처리 로직 오류로 인해 영원히 끝나지 않고 버튼이 비활성화된 채 고착됨.
- **코드상 의도된 원인**: 가짜 `QuotaExceededError`를 발생시키고 catch 블록에서 사용자에게 에러 알림은 띄우지만(또는 무시), `setLoading(false)` 처리를 누락하여 무한 로딩 상태를 만듦.
- **탐지 포인트**: 특정 액션 후 UI가 영구적으로 Block/Lock 되는 현상.

## 2. 낮은 명도 대비 (low-contrast-status-text)
- **Bug ID**: site018-bug02
- **유형**: `low-contrast-status-text`
- **화면 위치**: "여행 일정 타임라인" 각 항목의 우측 상단 상태 배지
- **관련 컴포넌트**: `src/styles/accessibility-bugs.css` 및 `src/components/TripTimeline.jsx`
- **data-bug-id Selector**: `[data-bug-id="site018-bug02"]`
- **사용자 경험 증상**: 상태 배지("확정", "대기", "변경됨")의 배경색과 글자색이 너무 비슷하여(예: 옅은 노랑에 옅은 회색) 식별이 어려움.
- **코드상 의도된 원인**: CSS를 통해 배경색(`background-color`)과 전경색(`color`)의 대비비를 의도적으로 WCAG 기준치 미만(예: 1.5:1 미만)으로 설정함.
- **탐지 포인트**: WCAG 접근성 가이드라인을 위반하는 명도 대비 불량 UI 식별.

## 3. 색상만으로 정보 전달 (color-only-status-indicator)
- **Bug ID**: site018-bug03
- **유형**: `color-only-status-indicator`
- **화면 위치**: 일정 카드 좌측의 점(Dot) 인디케이터
- **관련 컴포넌트**: `src/components/TripTimeline.jsx`
- **data-bug-id Selector**: `[data-bug-id="site018-bug03"]`
- **사용자 경험 증상**: 일정이 겹치는지(충돌) 여부를 오로지 빨간색 점과 초록색 점으로만 표시하며 마우스 오버 툴팁이나 보조 텍스트가 없음.
- **코드상 의도된 원인**: 접근성 보조 텍스트(`.sr-only` 등)나 레이블 없이 `div`의 `background-color`만으로 중요한 상태(충돌 여부)를 렌더링함.
- **탐지 포인트**: 색각 이상자가 정보를 구별할 수 없게 만드는 "색상 의존적 정보 전달" 설계 위반 식별.
