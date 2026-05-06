# BUGS.md - 의도된 프론트엔드 오류 리스트

이 파일은 `site080`에 의도적으로 포함된 3가지 GUI 오류를 기록합니다.

---

## 1. 예상 견적 계산 불일치
- **bugId**: `site080-bug01`
- **CSV 오류명**: 예상 견적 계산 불일치
- **Type**: `estimate-total-mismatch`
- **화면 위치**: 우측 '예상 견적 요약' 패널의 총액 영역
- **관련 파일**: `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site080-bug01"]`
- **사용자 경험 증상**: 시공 옵션(예: 강마루, 벽지)을 선택하면 요약 리스트에는 두 개 모두 나타나지만, 하단 총액에는 마지막에 선택한 항목의 금액이 더해지지 않음.
- **코드상 의도된 원인**: `updateSummary` 함수 내 합계 계산 반복문이 `selectedOptions.length - 1`까지만 수행되도록 작성됨.
- **PPO 에이전트 기대 행동**: 요약 리스트의 개별 단가 합계와 하단 총액의 산술적 일치 여부를 탐지해야 함.

## 2. 포트폴리오 grid 겹침
- **bugId**: `site080-bug02`
- **CSV 오류명**: 포트폴리오 grid 겹침
- **Type**: `portfolio-grid-overlap`
- **화면 위치**: 'The Living 포트폴리오' 섹션의 그리드 영역
- **관련 파일**: `public/styles.css`, `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site080-bug02"]`
- **사용자 경험 증상**: 세로로 긴 이미지(욕실 시공 사례 등)를 가진 카드가 지정된 영역을 벗어나 아래쪽에 위치한 다른 카드들을 덮어버림.
- **코드상 의도된 원인**: `.portfolio-grid`에 `grid-auto-rows: 250px`를 설정했으나 카드 내용물의 오버플로우 처리를 하지 않음.
- **PPO 에이전트 기대 행동**: 요소들의 Bounding Box가 중첩(Intersection)되는 비정상적인 레이아웃 상태를 탐지해야 함.

## 3. 상담 신청 버튼 무반응
- **bugId**: `site080-bug03`
- **CSV 오류명**: 상담 신청 버튼 무반응
- **Type**: `interior-consult-button-no-response`
- **화면 위치**: '전문가 1:1 상담 예약' 섹션의 '상담 신청하기' 버튼
- **관련 파일**: `public/app.js`, `public/index.html`
- **data-bug-id selector**: `[data-bug-id="site080-bug03"]`
- **사용자 경험 증상**: 상담 신청 양식을 모두 작성하고 버튼을 클릭해도 아무런 반응(완료 메시지, 알림 등)이 없음.
- **코드상 의도된 원인**: HTML의 버튼 ID는 `btn-submit-consult-wrong`이나, JS에서는 `btn-submit-consult-correct`로 셀렉트하여 이벤트 리스너가 연결되지 않음.
- **PPO 에이전트 기대 행동**: 버튼 클릭 이벤트 발생 후 DOM 상태 변화나 윈도우 알림(alert) 발생 여부를 확인하여 탐지해야 함.
