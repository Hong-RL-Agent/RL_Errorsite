# BUGS.md

## site084-bug01

- bugId: `site084-bug01`
- CSV 오류명: 설비 필터 결과 불일치
- type: `equipment-filter-mismatch`
- 화면 위치: 좌측 필터 패널의 설비 필터와 중앙 공유 주방 카드 grid
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site084-bug01"]`
- 사용자가 경험하는 증상: 사용자가 `오븐 있음` 필터를 선택했는데, 결과 목록에 실제 설비 목록에 오븐이 없는 공간이 일부 남아 있다.
- 코드상 의도된 원인: `filterKitchens()`에서 선택 설비의 id와 주방 설비명을 정확히 비교하지 않고, 선택 설비의 category와 주방 `equipmentCategories`를 비교해 같은 카테고리의 다른 설비 보유 공간까지 포함한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 설비 필터 UI 상태와 각 카드의 설비 태그를 비교해, 선택한 설비가 없는 카드가 결과에 남아 있음을 감지해야 한다.

## site084-bug02

- bugId: `site084-bug02`
- CSV 오류명: 예약 시간표 잘림
- type: `kitchen-schedule-clipped`
- 화면 위치: 중앙 본문 하단의 `오늘 예약 시간표` 영역
- 관련 파일: `public/styles.css`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site084-bug02"]`
- 사용자가 경험하는 증상: 예약 시간 슬롯이 많을 때 마지막 시간대가 시간표 컨테이너 아래로 잘려 보이고 스크롤로 확인할 수 없다.
- 코드상 의도된 원인: `.schedule-list`에 고정 높이와 `overflow-y: hidden`을 적용해 내부 슬롯이 많아질 때 초과분을 숨긴다.
- PPO 에이전트가 탐지해야 할 기대 행동: 시간표 컨테이너의 하단에서 마지막 슬롯이 잘리거나 접근 불가능한 레이아웃 결함을 탐지해야 한다.

## site084-bug03

- bugId: `site084-bug03`
- CSV 오류명: 공간 예약 버튼 무반응
- type: `kitchen-book-button-no-response`
- 화면 위치: `올리브홀 프로덕션 키친` 카드의 `예약하기` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site084-bug03"]`
- 사용자가 경험하는 증상: 특정 공유 주방의 예약 버튼은 활성 버튼처럼 보이지만 클릭해도 우측 예약 요약의 공간, 시간대, 금액이 변경되지 않는다.
- 코드상 의도된 원인: `BUGGY_BOOKING_KITCHEN_ID`와 일치하는 카드 버튼에는 `click` 이벤트 리스너를 연결하지 않고 조기 반환한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 공간 예약 버튼과 비교해 특정 공간 예약 버튼 클릭 후 예약 요약 상태가 변하지 않는 것을 감지해야 한다.
