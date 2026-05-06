# BUGS - site027 의도된 오류 상세 설명

## 1. 필터 상태와 결과 목록 불일치 (filter-result-mismatch)
- **Bug ID**: site027-bug01
- **유형**: `filter-result-mismatch`
- **화면 위치**: 메인 레시피 리스트 상단 필터 칩 영역 및 레시피 그리드
- **관련 컴포넌트**: `src/App.jsx`, `src/components/SearchFilters.jsx`
- **data-bug-id Selector**: `[data-bug-id="site027-bug01"]`
- **사용자 경험 증상**: 사용자가 난이도 필터(예: '쉬움')를 클릭하면 해당 필터 칩은 활성화 상태로 변하지만, 아래 레시피 목록에는 '중간'이나 '어려움' 난이도의 레시피가 필터링되지 않고 그대로 노출됨.
- **코드상 의도된 원인**: 필터링 로직에서 현재 변경된 `selectedDifficulty` state를 즉시 사용하지 않고, 비동기 업데이트 이전의 stale한 state나 잘못된 참조를 사용하여 필터링을 수행함.
- **탐지 포인트**: UI 컨트롤의 선택 상태와 하단 렌더링 리스트의 조건 일치성.

## 2. 중복 렌더링 (duplicate-ingredient-render)
- **Bug ID**: site027-bug02
- **유형**: `duplicate-ingredient-render`
- **화면 위치**: 레시피 카드 클릭 시 열리는 상세 모달 내 "재료 목록" 섹션
- **관련 컴포넌트**: `src/components/RecipeModal.jsx`
- **data-bug-id Selector**: `[data-bug-id="site027-bug02"]`
- **사용자 경험 증상**: 레시피에 필요한 재료 리스트를 볼 때, 특정 재료(예: 리스트의 첫 번째 항목)가 목록에 두 번 반복되어 표시됨.
- **코드상 의도된 원인**: `ingredients.map` 루프 도중 의도적으로 특정 인덱스의 요소를 한 번 더 렌더링하도록 하드코딩함.
- **탐지 포인트**: 동일한 데이터 소스를 기반으로 하는 리스트 내 중복 콘텐츠 존재 여부.

## 3. 모바일 이미지 오버랩 (mobile-image-text-overlap)
- **Bug ID**: site027-bug03
- **유형**: `mobile-image-text-overlap`
- **화면 위치**: 모바일 뷰(640px 이하)에서의 레시피 카드
- **관련 컴포넌트**: `src/styles/responsive.css`
- **data-bug-id Selector**: `[data-bug-id="site027-bug03"]`
- **사용자 경험 증상**: 스마트폰 화면 크기에서 레시피 카드를 볼 때, 상단의 레시피 이미지가 아래로 밀려 내려와 제목이나 설명 텍스트를 덮어버림으로써 내용을 읽을 수 없게 됨.
- **코드상 의도된 원인**: 미디어 쿼리 내에서 이미지 컨테이너에 잘못된 `position: absolute`와 고정된 상단 여백을 부여하여 레이아웃 흐름을 파괴함.
- **탐지 포인트**: 반응형 중단점(Breakpoint)에서의 요소 간 겹침(Overlap) 발생 여부.
