# BUGS - site021 의도된 오류 상세 설명

## 1. ARIA의 과잉 및 오용 (aria-state-mismatch)
- **Bug ID**: site021-bug01
- **유형**: `aria-state-mismatch`
- **화면 위치**: 상단 헤더의 "비교함" 버튼
- **관련 컴포넌트**: `src/components/Header.jsx`
- **data-bug-id Selector**: `[data-bug-id="site021-bug01"]`
- **사용자 경험 증상**: 스크린 리더 사용자가 "비교함" 버튼을 눌러 패널을 열었음에도 불구하고, 보조기기는 여전히 "닫힘(collapsed)" 상태로 안내하여 사용자가 패널이 정상적으로 열렸는지 혼란을 겪음.
- **코드상 의도된 원인**: 버튼의 `aria-expanded` 속성을 실제 상태(open/close)와 연동하지 않고 `false`로 고정함.
- **탐지 포인트**: UI 상태 변화와 ARIA 상태 속성값의 불일치.

## 2. 동적 업데이트 알림 누락 (dynamic-update-announcement-missing)
- **Bug ID**: site021-bug02
- **유형**: `dynamic-update-announcement-missing`
- **화면 위치**: 상단 헤더의 비교함 수량 배지(Badge)
- **관련 컴포넌트**: `src/components/Header.jsx`
- **data-bug-id Selector**: `[data-bug-id="site021-bug02"]`
- **사용자 경험 증상**: 시각 장애인이 제품 카드에서 "비교하기"를 눌러 상품을 추가했을 때, 시각적으로는 숫자가 올라가지만 스크린 리더는 아무런 안내를 하지 않아 상품이 제대로 추가되었는지 알 수 없음.
- **코드상 의도된 원인**: 상태 업데이트 시 `aria-live` 속성이 적용된 영역을 제공하지 않음.
- **탐지 포인트**: 중요 정보의 동적 업데이트 시 보조기기에 전달되는 안내(Announcement) 부재.

## 3. 숨겨진 요소의 포커스 노출 (hidden-panel-focusable-element)
- **Bug ID**: site021-bug03
- **유형**: `hidden-panel-focusable-element`
- **화면 위치**: 닫혀있는 비교함 서랍(CompareDrawer) 내부의 "비교 시작" 버튼
- **관련 컴포넌트**: `src/components/CompareDrawer.jsx`
- **data-bug-id Selector**: `[data-bug-id="site021-bug03"]`
- **사용자 경험 증상**: 키보드 사용자가 Tab 키를 눌러 이동할 때, 화면에 보이지 않는 비교함 패널 내부의 버튼으로 포커스가 사라지는 현상이 발생하여 현재 자신의 위치를 파악하기 어려움.
- **코드상 의도된 원인**: 패널이 시각적으로 숨겨져 있음에도 불구하고 내부 요소의 `tabIndex`를 조절하거나 `display: none`을 사용하지 않고 `transform` 등으로만 숨김.
- **탐지 포인트**: 비가시 영역에 존재하는 요소가 포커스 가능한(Focusable) 상태로 유지됨.
