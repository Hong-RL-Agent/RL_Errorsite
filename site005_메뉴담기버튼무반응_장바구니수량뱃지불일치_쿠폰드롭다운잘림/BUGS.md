# BUGS.md - site005

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site005-bug01 |
| **type** | button-no-response |
| **화면 위치** | 음식점 목록 내 특정 메뉴 ("후라이드 치킨")의 "담기" 버튼 |
| **관련 파일** | `src/components/RestaurantList.jsx` |
| **data-bug-id selector** | `[data-bug-id="site005-bug01"]` |
| **사용자가 경험하는 증상** | 사용자가 황금올리브 치킨의 "후라이드 치킨" 메뉴의 "담기" 버튼을 눌러도 장바구니에 아이템이 추가되지 않고 수량 배지도 변하지 않음. 다른 메뉴들은 정상 작동함. |
| **코드상 의도된 원인** | `menu.id === 101` (후라이드 치킨) 인 경우 조건부 렌더링을 통해 버튼의 `onClick` 이벤트 핸들러를 실제 `addToCart` 로직 대신 빈 화살표 함수 `() => {}`로 교체함. |
| **PPO 에이전트 기대 행동** | 마우스 클릭 이벤트를 트리거한 전후로 상태 변화나 알림이 없는 것을 감지. 동일한 형태의 다른 버튼(예: 양념 치킨 담기)이 작동하는 상태와 대비하여 무반응 버그로 판단. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site005-bug02 |
| **type** | state-mismatch |
| **화면 위치** | 모바일 하단 네비게이션(BottomNav) 영역의 "장바구니" 아이콘 뱃지 |
| **관련 파일** | `src/components/BottomNav.jsx` |
| **data-bug-id selector** | `[data-bug-id="site005-bug02"]` |
| **사용자가 경험하는 증상** | 메뉴를 장바구니에 여러 개 담았거나 아무것도 담지 않았을 때에도 장바구니 아이콘 뱃지의 숫자가 항상 `9`로 고정되어 실제 장바구니 안의 수량과 일치하지 않음. |
| **코드상 의도된 원인** | 상위 컴포넌트(`App.jsx`)로부터 전달받는 동적 장바구니 아이템 수량 prop(`cartItemCount`)을 사용하지 않고 화면에 숫자 9를 하드코딩하여 렌더링함. |
| **PPO 에이전트 기대 행동** | 장바구니 서랍(Cart Drawer) 내의 항목 리스트/수량과 하단 바 뱃지에 표시된 숫자 `9` 간의 State Mismatch를 시각적, 로직적으로 캡처하여 탐지. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site005-bug03 |
| **type** | dropdown-layout |
| **화면 위치** | 메인 화면 상단 "내 사용 가능 쿠폰" 드롭다운 위젯 |
| **관련 파일** | `src/styles/main.css`, `src/components/CouponDropdown.jsx` |
| **data-bug-id selector** | `[data-bug-id="site005-bug03"]` |
| **사용자가 경험하는 증상** | 쿠폰 드롭다운을 펼쳤을 때 3개의 쿠폰 목록이 나와야 하지만, 아래쪽 목록(마지막 항목 등)이 카드의 테두리를 벗어날 때 바깥 영역으로 보이지 않고 잘려서(Cut-off) 표시됨. |
| **코드상 의도된 원인** | 쿠폰 컨테이너인 `.coupon-widget` 클래스에 고정 높이(`height: 90px`)와 `overflow: hidden` 속성을 동시에 주어, 내부에 `position: absolute`로 열리는 드롭다운 리스트(`[data-bug-id="site005-bug03"]`)가 90px 이하 영역으로 벗어나면 잘려나가게 만듦. |
| **PPO 에이전트 기대 행동** | 드롭다운 컨테이너(`[data-bug-id="site005-bug03"]`)의 렌더링 Bounding Box를 분석했을 때 부모 컨테이너에 의해 요소가 잘림(clipped/overflow hidden) 현상이 발생하여 시각적 결함이 나타났음을 탐지. |
