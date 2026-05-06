# BUGS.md - site009

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site009-bug01 |
| **type** | form-ui |
| **화면 위치** | 각 상품 카드의 "ADD TO CART" 버튼 |
| **관련 파일** | `src/styles/main.css`, `src/components/ProductGrid.jsx` |
| **data-bug-id selector** | `[data-bug-id="site009-bug01"]` |
| **사용자가 경험하는 증상** | 사이즈를 올바르게 선택했음에도 불구하고, "ADD TO CART" 버튼이 여전히 회색 배경에 비활성화(Disabled)된 상태처럼 보여 사용자로 하여금 버튼을 누를 수 없다고 착각하게 만듦. (실제로 클릭 시 동작은 하지만, 시각적 피드백이 잘못됨) |
| **코드상 의도된 원인** | 사이즈 선택 여부와 관계없이 버튼에 무조건 `.disabled-look` 클래스를 강제로 부여하여, CSS에서 비활성화된 버튼의 스타일(`background: var(--border)`, `cursor: not-allowed`)을 적용함. |
| **PPO 에이전트 기대 행동** | 필수 옵션이 충족되어 정상적인 상태(State)임에도 불구하고 버튼의 시각적 요소(색상, 커서 등)가 비활성화된 것처럼 나타나는 Form UI 혼동 에러로 캡처. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site009-bug02 |
| **type** | component-rendering |
| **화면 위치** | 상품 카드의 정보 영역 (색상 스와치 바로 아래) |
| **관련 파일** | `src/components/ProductGrid.jsx` |
| **data-bug-id selector** | `[data-bug-id="site009-bug02"]` |
| **사용자가 경험하는 증상** | 각 상품 카드의 색상 스와치 그룹 밑에 "Material: undefined" 라는 텍스트가 화면에 그대로 노출됨. |
| **코드상 의도된 원인** | `product` 데이터 객체에 존재하지 않는 속성인 `product.material`에 접근하여, 반환된 `undefined` 값을 문자열 `String()` 처리하여 DOM에 강제로 텍스트로 렌더링함. |
| **PPO 에이전트 기대 행동** | 렌더링된 텍스트 중 `undefined`, `null`, `[object Object]` 등 개발 과정에서 누락되어 노출된 비정상적인 텍스트 렌더링 결함을 식별. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site009-bug03 |
| **type** | dropdown-layout |
| **화면 위치** | 상품 카드 내 SIZE 드롭다운 메뉴 영역 |
| **관련 파일** | `src/styles/main.css`, `src/components/ProductGrid.jsx` |
| **data-bug-id selector** | `[data-bug-id="site009-bug03"]` |
| **사용자가 경험하는 증상** | "SIZE" 버튼을 눌러 드롭다운 메뉴를 열었을 때, 드롭다운 박스가 바로 아래 위치한 다른 상품 카드나 하위 컨텐츠의 뒤(배경)에 숨어버려 옵션을 온전히 볼 수 없고 클릭할 수 없음. |
| **코드상 의도된 원인** | 드롭다운의 부모인 `.product-card`에 `position: relative`를 주었으나 `z-index`를 관리하지 않았고, 드롭다운 자체(`.size-dropdown-menu`)의 `z-index`를 0으로 설정하여, 렌더링 순서에 의해 형제 요소들 밑으로 깔리게(Stacking Context Error) 만듦. |
| **PPO 에이전트 기대 행동** | 팝업/드롭다운 노드 요소가 렌더링되었으나 화면상의 Bounding Box 분석 시 다른 형제 노드의 뒤로 숨겨져 시야각(Visibility/Z-index)이 가려진 레이아웃 결함으로 판단. |
