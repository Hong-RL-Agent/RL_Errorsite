# BUGS - site014

이 문서는 PPO 에이전트 훈련을 위해 의도적으로 삽입된 GUI 오류를 설명합니다.

## 1. site014-bug01
- **Bug ID**: site014-bug01
- **Type**: button-no-response
- **화면 위치**: 메인 뉴스 목록 하단 "더보기" (Load More) 버튼
- **관련 파일**: `src/components/NewsList.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site014-bug01"]`
- **사용자가 경험하는 증상**: 목록 하단의 "더보기" 버튼을 눌러도 새로운 기사가 추가로 나타나지 않으며 아무런 변화가 없음.
- **코드상 의도된 원인**: 버튼 엘리먼트에 핸들러 함수를 연결하지 않음.
- **PPO 에이전트가 탐지해야 할 기대 행동**: 버튼 클릭 이후 뉴스 목록(DOM)의 개수가 늘어나지 않는 것을 감지해야 함.

## 2. site014-bug02
- **Bug ID**: site014-bug02
- **Type**: component-rendering
- **화면 위치**: 주요 기사 그리드 (News Grid) 내의 특정 기사 카드
- **관련 파일**: `src/components/NewsCard.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site014-bug02"]`
- **사용자가 경험하는 증상**: 일부 뉴스 카드의 제목이 표시되어야 할 자리에 텍스트가 나타나지 않고 빈 공간으로 표시됨.
- **코드상 의도된 원인**: 특정 조건(예: id가 홀수인 기사)에서 제목 변수 대신 빈 문자열("")을 렌더링하도록 조건부 로직을 삽입함.
- **PPO 에이전트가 탐지해야 할 기대 행동**: 뉴스 카드의 필수 요소인 제목이 누락되어 시각적으로 비정상적인 카드를 감지해야 함.

## 3. site014-bug03
- **Bug ID**: site014-bug03
- **Type**: css-layout
- **화면 위치**: 기사 상세 패널 내부 또는 목록 우측 광고 박스
- **관련 파일**: `src/styles.css`
- **Data Bug ID Selector**: `[data-bug-id="site014-bug03"]`
- **사용자가 경험하는 증상**: 광고 영역이 기사 본문이나 다른 주요 컨텐츠의 일부를 덮어버려 텍스트를 읽을 수 없게 만듦.
- **코드상 의도된 원인**: 광고 박스에 부적절한 `position: absolute`와 `z-index`, 그리고 `margin-top` 값을 적용하여 컨텐츠 위로 겹치게 함.
- **PPO 에이전트가 탐지해야 할 기대 행동**: 두 개 이상의 주요 요소가 겹쳐서 정보 전달이 방해받는 레이아웃 오류를 감지해야 함.
