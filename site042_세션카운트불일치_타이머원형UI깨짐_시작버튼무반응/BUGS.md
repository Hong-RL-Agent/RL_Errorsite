# BUGS - site042 (Productivity Timer SaaS)

이 파일은 학습용 PPO 에이전트가 탐지해야 할 의도된 프론트엔드 GUI 오류를 기록합니다.

---

### 1. 세션 카운트 불일치
- **Bug ID**: `site042-bug01`
- **CSV 오류명**: 세션 카운트 불일치
- **Type**: `session-count-mismatch`
- **화면 위치**: 상단 Hero 영역 내 요약 카드 (SummaryCards)
- **관련 파일**: `src/components/SummaryCards.jsx`
- **Data-Bug-ID Selector**: `[data-bug-id="site042-bug01"]`
- **사용자 경험 증상**: 하단 "집중 세션 히스토리"에는 완료된 세션이 5개 나열되어 있으나, 상단 요약 카드에는 "완료된 세션 4회"로 표시되어 데이터가 맞지 않음.
- **코드상 의도된 원인**: `SummaryCards.jsx`에서 `sessions.length - 1`로 계산하여 마지막 항목을 누락시킴.
- **기대 행동**: 히스토리 리스트의 개수와 요약 카드의 숫자가 일치해야 함.

---

### 2. 타이머 원형 UI 깨짐
- **Bug ID**: `site042-bug02`
- **CSV 오류명**: 타이머 원형 UI 깨짐
- **Type**: `circular-timer-visual-break`
- **화면 위치**: 메인 타이머 카드 내 원형 진행률 바 (CircularTimer)
- **관련 파일**: `src/components/CircularTimer.jsx`
- **Data-Bug-ID Selector**: `[data-bug-id="site042-bug02"]`
- **사용자 경험 증상**: 타이머가 작동할 때 진행률을 나타내는 초록색 링이 회색 배경 원의 궤적을 벗어나 원 바깥쪽으로 삐져나온 상태로 렌더링됨.
- **코드상 의도된 원인**: `CircularTimer.jsx`에서 `strokeDashoffset` 계산 시 실제 원의 반지름(100)이 아닌 잘못된 반지름 값(115)을 사용하여 계산함.
- **기대 행동**: 진행률 링이 배경 원의 궤적(radius 100)과 정확히 일치하여 겹쳐져야 함.

---

### 3. 시작 버튼 무반응
- **Bug ID**: `site042-bug03`
- **CSV 오류명**: 시작 버튼 무반응
- **Type**: `timer-start-button-no-response`
- **화면 위치**: 타이머 카드 하단 "집중 시작" 버튼 (TimerCard)
- **관련 파일**: `src/components/TimerCard.jsx`
- **Data-Bug-ID Selector**: `[data-bug-id="site042-bug03"]`
- **사용자 경험 증상**: "집중 시작" 버튼이 활성화된 것처럼 보이지만, 클릭해도 타이머 숫자가 줄어들지 않고 아무런 반응이 없음.
- **코드상 의도된 원인**: 버튼의 `onClick` 이벤트에 상태를 변경하는 핸들러(`setIsRunning(true)`)가 누락되어 빈 함수가 호출됨.
- **기대 행동**: 버튼 클릭 시 `isRunning` 상태가 `true`로 변경되어 타이머가 카운트다운을 시작해야 함.
