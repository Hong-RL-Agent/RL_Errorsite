# Intentional Frontend GUI Bugs - site062

PPO 에이전트 탐지용 의도적 GUI 오류 명세입니다.

---

### 1. 남은 자리 수 불일치
- **Bug ID**: `site062-bug01`
- **CSV 오류명**: 남은 자리 수 불일치
- **Type**: `remaining-seats-mismatch`
- **화면 위치**: 우측 '선택된 클래스' 예약 요약 패널의 남은 정원 숫자
- **관련 파일**: `public/app.js` (selectClass 함수)
- **Selector**: `[data-bug-id="site062-bug01"]`
- **사용자 경험 증상**: 클래스 카드에서는 남은 자리가 예를 들어 3석으로 표시되는데, 해당 클래스를 선택하면 우측 예약 요약 패널에는 5석으로 표시됩니다.
- **의도된 원인**: `selectClass` 함수에서 남은 자리를 계산할 때, 실제 데이터(`capacity - booked`)에 임의의 보정값(+2)을 더해 표시하도록 코드가 작성되어 있습니다.
- **기대 탐지 행동**: 같은 식별자나 데이터를 공유하는 두 UI 요소 간의 수치 불일치를 상태 오류로 탐지해야 합니다.

---

### 2. 시간표 레이아웃 깨짐
- **Bug ID**: `site062-bug02`
- **CSV 오류명**: 시간표 레이아웃 깨짐
- **Type**: `schedule-layout-break`
- **화면 위치**: 하단 주간 시간표 영역
- **관련 파일**: `public/styles.css`
- **Selector**: `[data-bug-id="site062-bug02"]`
- **사용자 경험 증상**: 데스크톱 화면에서 시간표의 가로 폭이 컨테이너를 초과하지만, 스크롤바가 생기지 않고 우측 패널 뒤로 숨겨지거나 잘려서 마지막 열(토요일 등)을 확인할 수 없습니다.
- **의도된 원인**: `.schedule-grid`에 고정된 `min-width`와 `grid-template-columns`를 부여하고, 부모 컨테이너에 `overflow-x: auto` 설정을 누락하여 발생합니다.
- **기대 탐지 행동**: 요소의 실제 크기가 부모 컨테이너를 벗어나는지, 그리고 해당 영역이 사용자에게 시각적으로 온전히 노출되는지(Visibility)를 탐지해야 합니다.

---

### 3. 예약 버튼 무반응
- **Bug ID**: `site062-bug03`
- **CSV 오류명**: 예약 버튼 무반응
- **Type**: `yoga-reserve-button-no-response`
- **화면 위치**: 'Morning Vinyasa' 클래스 카드의 '선택하기' 버튼
- **관련 파일**: `public/app.js` (renderClasses 함수)
- **Selector**: `button[data-bug-id="site062-bug03"]`
- **사용자 경험 증상**: 'Morning Vinyasa' 클래스의 '선택하기' 버튼을 클릭해도 우측 예약 요약 패널에 정보가 반영되지 않고 아무런 반응이 없습니다. 다른 클래스는 정상적으로 동작합니다.
- **의도된 원인**: 특정 클래스 ID(`c1`)인 경우에만 버튼에 클릭 이벤트 리스너를 바인딩하지 않도록 조건부 로직이 들어가 있습니다.
- **기대 탐지 행동**: 버튼 클릭 시 기대되는 UI 변화(예약 요약 갱신)가 일어나지 않는 이벤트 결함을 탐지해야 합니다.
