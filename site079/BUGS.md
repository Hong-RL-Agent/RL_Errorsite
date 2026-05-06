# BUGS.md - 의도된 프론트엔드 오류 리스트

이 파일은 `site079`에 의도적으로 포함된 3가지 GUI 오류를 기록합니다.

---

## 1. 상담사 선택 요약 불일치
- **bugId**: `site079-bug01`
- **CSV 오류명**: 상담사 선택 요약 불일치
- **Type**: `advisor-summary-mismatch`
- **화면 위치**: 우측 '상담 예약 요약' 패널의 전문 상담사 영역
- **관련 파일**: `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site079-bug01"]`
- **사용자 경험 증상**: 첫 번째 상담사(예: 김태진)를 선택한 후, 다른 상담사(예: 이지혜)를 클릭해도 예약 요약 패널에는 계속 '김태진'으로 표시됨.
- **코드상 의도된 원인**: `renderSummary` 함수에서 `initialAdvisorRendered` 플래그를 사용하여 첫 번째 렌더링 이후에는 DOM 업데이트를 차단함.
- **PPO 에이전트 기대 행동**: 상담사 카드 클릭 액션 후 요약 패널의 텍스트가 클릭한 카드의 이름과 일치하는지 검증하여 탐지해야 함.

## 2. 보장 비교표 column 잘림
- **bugId**: `site079-bug02`
- **CSV 오류명**: 비교표 column 잘림
- **Type**: `comparison-table-column-clipped`
- **화면 위치**: '한눈에 보는 보장 비교' 섹션의 테이블 영역
- **관련 파일**: `public/styles.css`
- **data-bug-id selector**: `[data-bug-id="site079-bug02"]`
- **사용자 경험 증상**: 비교표의 마지막 열인 '마스터 플랜 (VIP)' 항목이 화면 우측 끝에서 잘려 보이거나 보이지 않으며, 가로 스크롤바도 나타나지 않음.
- **코드상 의도된 원인**: 테이블의 `min-width`를 `1200px`로 설정했으나, 부모 컨테이너에 `overflow-x: auto` 설정을 누락하여 오버플로우가 발생함.
- **PPO 에이전트 기대 행동**: 테이블 요소의 전체 너비가 컨테이너 너비를 초과함에도 스크롤이 불가능한 상태를 레이아웃 분석으로 탐지해야 함.

## 3. 상담 예약 버튼 무반응
- **bugId**: `site079-bug03`
- **CSV 오류명**: 상담 예약 버튼 무반응
- **Type**: `insurance-consult-button-no-response`
- **화면 위치**: '자동차보험' 유형 카드의 '상담 예약' 버튼
- **관련 파일**: `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site079-bug03"]`
- **사용자 경험 증상**: 자동차보험 카드의 버튼을 클릭해도 우측 예약 요약의 '선택 보험' 항목이 갱신되지 않음 (다른 보험 카드는 정상 작동).
- **코드상 의도된 원인**: `renderInsuranceTypes` 함수에서 `id === 'AUTO'`인 항목에 대해서만 `onclick` 리스너를 할당하지 않음.
- **PPO 에이전트 기대 행동**: 버튼 클릭 이벤트 발생 후 DOM 상태(요약 패널의 텍스트)가 의도한 대로 변경되는지 확인하여 탐지해야 함.
