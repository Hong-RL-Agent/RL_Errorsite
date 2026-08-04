# BUGS.md - site001

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site001-bug01 |
| **type** | button-no-response |
| **화면 위치** | 베스트셀러 섹션 → 각 도서 카드 하단 "구매하기" 버튼 |
| **관련 파일** | `src/components/BestsellerSection.jsx` |
| **data-bug-id selector** | `[data-bug-id="site001-bug01"]` |
| **사용자가 경험하는 증상** | 베스트셀러 카드의 "구매하기" 버튼을 클릭해도 장바구니에 아무 변화가 없음. 버튼은 정상적으로 렌더링되고 hover 스타일도 동작하지만 클릭 시 어떤 피드백도 없음. |
| **코드상 의도된 원인** | `onClick` 핸들러가 버튼에 연결되지 않음. `onAddToCart` prop이 컴포넌트로 전달되지만 베스트셀러 buy 버튼은 이를 호출하지 않음. |
| **PPO 에이전트 기대 행동** | 버튼 클릭 후 장바구니 카운트 변화 없음 탐지. `data-bug-id="site001-bug01"` 요소 클릭 → 카트 패널 숫자 변화 미발생 → 버그 분류. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site001-bug02 |
| **type** | component-rendering |
| **화면 위치** | 추천 도서 섹션 → 카드 목록 맨 마지막 |
| **관련 파일** | `src/components/RecommendedSection.jsx` |
| **data-bug-id selector** | `[data-bug-id="site001-bug02"]` |
| **사용자가 경험하는 증상** | 추천 도서 목록에서 첫 번째 도서(books[0])가 목록 끝에 한 번 더 나타남. 동일한 제목, 저자, 가격의 카드가 중복으로 보임. |
| **코드상 의도된 원인** | `books.map()` 이후에 `books[0]`를 별도로 한 번 더 `<div data-bug-id="site001-bug02">` 안에 렌더링함. |
| **PPO 에이전트 기대 행동** | 추천 섹션에서 동일 제목의 카드가 2개 이상 존재함을 탐지. `id="rc-card-duplicate"` 요소 존재 여부 확인 → 중복 렌더링 버그 분류. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site001-bug03 |
| **type** | css-layout |
| **화면 위치** | 추천 도서 섹션 전체 그리드 (모바일 화면 ≤768px) |
| **관련 파일** | `src/styles/main.css`, `src/components/RecommendedSection.jsx` |
| **data-bug-id selector** | `[data-bug-id="site001-bug03"]` |
| **사용자가 경험하는 증상** | 모바일(화면 폭 768px 이하)에서 추천 도서 섹션의 카드들이 서로 겹쳐 보임. 일부 카드가 다른 카드 위에 올라타 내용이 가려짐. |
| **코드상 의도된 원인** | `@media (max-width: 768px)` 에서 `[data-bug-id="site001-bug03"]` 내 카드들에 `position: absolute`와 고정 `top` 값을 적용해 카드들이 겹치도록 설정함. 카드 간 간격이 너무 좁아 시각적 겹침 발생. |
| **PPO 에이전트 기대 행동** | 모바일 뷰포트(≤768px)에서 `.rc-card` 요소들의 bounding box가 서로 교차하는지 확인. 요소 겹침 탐지 → CSS 레이아웃 버그 분류. |
