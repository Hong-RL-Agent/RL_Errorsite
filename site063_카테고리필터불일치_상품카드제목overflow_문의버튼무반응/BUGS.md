# Intentional Frontend GUI Bugs - site063

PPO 에이전트 탐지용 의도적 GUI 오류 명세입니다.

---

### 1. 카테고리 필터 불일치
- **Bug ID**: `site060-bug01` (Note: User requested site063-bug01, will correct to site063-bug01)
- **CSV 오류명**: 카테고리 필터 불일치
- **Type**: `category-filter-mismatch`
- **화면 위치**: 메인 상품 그리드 상단 카테고리 칩 영역 및 결과 그리드
- **관련 파일**: `public/app.js` (filterItems 함수)
- **Selector**: `[data-bug-id="site063-bug01"]`
- **사용자 경험 증상**: 사용자가 '가전/디지털' 카테고리 칩을 클릭하여 필터를 활성화했음에도 불구하고, 실제 결과 목록에는 '가구/인테리어' 카테고리에 속하는 상품들이 함께 섞여서 표시됩니다.
- **의도된 원인**: `filterItems` 함수 내에서 `currentCategory`가 'Electronics'인 경우, 하드코딩된 로직에 의해 'Furniture' 항목까지 모두 `true`를 반환하도록 설계되었습니다.
- **기대 탐지 행동**: 현재 활성화된(Active) 필터 칩의 텍스트와 결과물들의 카테고리 태그 정보가 일치하는지 비교하여 오류를 탐지해야 합니다.

---

### 2. 상품 카드 오버플로우
- **Bug ID**: `site063-bug02`
- **CSV 오류명**: 상품 카드 overflow
- **Type**: `item-card-overflow`
- **화면 위치**: 상품 그리드 내 마지막 상품 카드 (ID: i6)
- **관련 파일**: `public/styles.css`
- **Selector**: `[data-bug-id="site063-bug02"]`
- **사용자 경험 증상**: 상품명이 비정상적으로 긴 경우, 텍스트가 카드 영역을 벗어나 아래로 길게 늘어지거나 우측 사이드바 영역을 침범하여 레이아웃이 깨집니다.
- **의도된 원인**: 상품 제목 요소(`.item-title`)에 `overflow: hidden`, `text-overflow: ellipsis`, `display: -webkit-box` 등의 줄 바꿈 및 생략 처리를 고의로 누락했습니다.
- **기대 탐지 행동**: 요소의 시각적 경계(Bounding Box)를 텍스트가 벗어나는지, 혹은 다른 UI 요소와 겹치는지 탐지해야 합니다.

---

### 3. 문의 버튼 무반응
- **Bug ID**: `site063-bug03`
- **CSV 오류명**: 문의 버튼 무반응
- **Type**: `inquiry-button-no-response`
- **화면 위치**: '에어팟 프로' 상품 상세 모달 내 '문의하기' 버튼
- **관련 파일**: `public/app.js` (openItemModal 함수)
- **Selector**: `button[data-bug-id="site063-bug03"]`
- **사용자 경험 증상**: '에어팟 프로' 상품 상세 정보를 열고 '문의하기' 버튼을 클릭해도 채팅창이 열리거나 알림이 뜨는 등 아무런 반응이 일어나지 않습니다. 다른 상품의 버튼은 정상적으로 동작합니다.
- **의도된 원인**: 특정 상품 ID(`i1`)인 경우에만 버튼에 이벤트 리스너를 바인딩하지 않도록 로직이 작성되어 있습니다.
- **기대 탐지 행동**: 클릭 인터랙션 이후 예상되는 UI 반응(모달 닫힘, 알럿 노출 등)이 누락되었음을 탐지해야 합니다.
