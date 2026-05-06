# BUGS - site032

## site032-bug01

- bugId: `site032-bug01`
- CSV 오류명: 인원수 표시 불일치
- type: `party-size-summary-mismatch`
- 화면 위치: 우측 예약 요약 sticky 패널의 인원 영역
- 관련 파일: `src/components/ReservationSummary.jsx`
- data-bug-id selector: `[data-bug-id="site032-bug01"]`
- 사용자가 경험하는 증상: 상단/검색 영역에서 인원 수를 4명으로 바꿔도 예약 요약에는 이전 2명이 남는다.
- 코드상 의도된 원인: `ReservationSummary`가 `initialPartySize`를 내부 state로 최초 한 번만 복사한다.
- 탐지 포인트: 인원 선택 select와 예약 요약의 인원 텍스트가 다른지 확인한다.

## site032-bug02

- bugId: `site032-bug02`
- CSV 오류명: 테이블 배치도 overflow
- type: `table-map-overflow`
- 화면 위치: 좌석 배치 mock 섹션
- 관련 파일: `src/styles/table-map.css`, `src/components/TableMap.jsx`
- data-bug-id selector: `[data-bug-id="site032-bug02"]`
- 사용자가 경험하는 증상: 데스크톱 중간 폭에서 테이블 카드가 컨테이너 밖으로 넘치고 예약 요약 패널 아래로 들어간다.
- 코드상 의도된 원인: `.table-map` grid를 `repeat(4, 210px)` 고정 폭으로 지정했다.
- 탐지 포인트: 1100px 부근 viewport에서 좌석 배치도 우측이 잘리거나 겹치는지 확인한다.

## site032-bug03

- bugId: `site032-bug03`
- CSV 오류명: 날짜 선택 상태 지연 반영
- type: `date-selection-lag`
- 화면 위치: 우측 예약 요약 sticky 패널의 날짜 영역
- 관련 파일: `src/App.jsx`, `src/components/ReservationSummary.jsx`
- data-bug-id selector: `[data-bug-id="site032-bug03"]`
- 사용자가 경험하는 증상: 날짜를 바꾸면 예약 요약 날짜가 바로 새 값이 아니라 이전 선택값으로 표시된다.
- 코드상 의도된 원인: 날짜 변경 핸들러가 `summaryDate`를 새 값이 아닌 이전 `selectedDate` state로 갱신한다.
- 탐지 포인트: 날짜 select 값과 예약 요약의 날짜 텍스트가 한 단계 어긋나는지 확인한다.
