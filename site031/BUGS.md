# BUGS - site031

## site031-bug01

- bugId: `site031-bug01`
- CSV 오류명: 예약 시간 중복 렌더링
- type: `duplicate-time-slot-render`
- 화면 위치: 업체 상세 모달의 예약 가능 시간 슬롯 grid
- 관련 파일: `src/components/TimeSlotPicker.jsx`
- data-bug-id selector: `[data-bug-id="site031-bug01"]`
- 사용자가 경험하는 증상: API의 시간 슬롯은 중복이 없는데 상세 모달에서는 `14:30` 시간이 두 번 나타난다.
- 코드상 의도된 원인: `availableTimes` 렌더링 전에 `14:30` 슬롯을 한 번 더 append한다.
- 탐지 포인트: `/api/providers`의 `availableTimes`와 모달 시간 슬롯 DOM을 비교해 같은 시간이 중복 표시되는지 확인한다.

## site031-bug02

- bugId: `site031-bug02`
- CSV 오류명: 선택된 서비스와 예약 요약 불일치
- type: `selected-service-summary-mismatch`
- 화면 위치: 우측 sticky 예약 요약 패널의 선택 서비스 영역
- 관련 파일: `src/components/BookingSummary.jsx`, `src/App.jsx`
- data-bug-id selector: `[data-bug-id="site031-bug02"]`
- 사용자가 경험하는 증상: 사용자가 `미용` 업체를 선택해도 우측 예약 요약에는 초기 `진료` 서비스가 남는다.
- 코드상 의도된 원인: `BookingSummary`가 최초 `service` prop을 내부 state로 저장하고 이후 변경을 반영하지 않는다.
- 탐지 포인트: 중앙 카드 영역의 선택 서비스/업체 서비스와 예약 요약의 `[data-bug-id="site031-bug02"]` 텍스트가 다른지 비교한다.

## site031-bug03

- bugId: `site031-bug03`
- CSV 오류명: 탭 메뉴 레이아웃 깨짐
- type: `tab-menu-layout-break`
- 화면 위치: 업체 상세 모달의 `소개 / 서비스 / 후기 / 위치` 탭 메뉴
- 관련 파일: `src/styles/modal-tabs.css`, `src/components/ProviderModal.jsx`
- data-bug-id selector: `[data-bug-id="site031-bug03"]`
- 사용자가 경험하는 증상: 1024px~1280px 데스크톱 폭에서 탭 메뉴가 줄바꿈되지 않고 모달 영역 밖으로 밀리거나 서로 겹쳐 보인다.
- 코드상 의도된 원인: 해당 breakpoint에서 탭 컨테이너 폭을 과도하게 지정하고 `flex-wrap: nowrap` 및 고정 탭 폭을 적용했다.
- 탐지 포인트: 데스크톱 중간 폭으로 viewport를 조정한 뒤 탭 버튼들이 모달 영역 안에 정상 배치되는지 확인한다.
