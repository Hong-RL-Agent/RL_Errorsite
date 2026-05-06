# BUGS - site044 (Camping Reservation Website)

이 파일은 학습용 PPO 에이전트가 탐지해야 할 의도된 프론트엔드 GUI 오류를 기록합니다.

---

### 1. 사이트 번호 중복 출력
- **Bug ID**: `site044-bug01`
- **CSV 오류명**: 사이트 번호 중복 출력
- **Type**: `campsite-number-duplicate`
- **화면 위치**: 캠핑장 상세 모달 내 "단지 배치도" 섹션
- **관련 파일**: `src/components/SiteMap.jsx`
- **Data-Bug-ID Selector**: `[data-bug-id="site044-bug01"]`
- **사용자 경험 증상**: 배치도 상에서 'A-1' 사이트 바로 다음 칸도 똑같이 'A-1'로 표시되어, 서로 다른 구역이 중복된 번호를 갖는 혼란이 발생함.
- **코드상 의도된 원인**: `SiteMap.jsx`의 렌더링 루프에서 `index === 1`일 때 강제로 이전 번호('A-1')를 출력하도록 로직을 수정함.
- **기대 행동**: 모든 사이트가 고유한 번호(A-1, A-2, A-3...)를 가져야 함.

---

### 2. 달력 레이아웃 깨짐
- **Bug ID**: `site044-bug02`
- **CSV 오류명**: 달력 레이아웃 깨짐
- **Type**: `calendar-grid-layout-break`
- **화면 위치**: 캠핑장 상세 모달 내 "예약 가능한 일정 확인" 달력
- **관련 파일**: `src/styles/calendar.css`
- **Data-Bug-ID Selector**: `[data-bug-id="site044-bug02"]`
- **사용자 경험 증상**: 2026년 5월 달력은 6주차 날짜 셀이 존재하지만, 컨테이너 높이가 5주 기준으로 고정되어 있어 마지막 줄의 날짜들이 다음 섹션(단지 배치도)과 겹치거나 잘려 보임.
- **코드상 의도된 원인**: `calendar.css`에서 `.calendar-grid-container`의 `height`를 350px로 고정함.
- **기대 행동**: 달력 컨테이너가 콘텐츠의 양에 따라 유동적으로 늘어나거나, 6주 분량을 충분히 담을 수 있는 높이를 가져야 함.

---

### 3. 예약 버튼 무반응
- **Bug ID**: `site044-bug03`
- **CSV 오류명**: 예약 버튼 무반응
- **Type**: `campsite-reserve-button-no-response`
- **화면 위치**: 캠핑장 리스트의 "솔숲 캠핑장" 카드 내 "예약하기" 버튼
- **관련 파일**: `src/components/CampsiteCard.jsx`
- **Data-Bug-ID Selector**: `[data-bug-id="site044-bug03"]`
- **사용자 경험 증상**: 다른 캠핑장은 버튼 클릭 시 우측 예약 요약 패널에 추가되지만, "솔숲 캠핑장"의 예약하기 버튼은 클릭해도 아무런 반응이 없고 요약 패널에 반영되지 않음.
- **코드상 의도된 원인**: `handleReserveClick` 함수 내에서 `campsite.id === 1`인 경우 상태 변경 핸들러를 호출하지 않도록 조건부 분기 처리함.
- **기대 행동**: 모든 캠핑장의 "예약하기" 버튼 클릭 시 해당 항목이 예약 요약 패널에 정상적으로 추가되어야 함.
