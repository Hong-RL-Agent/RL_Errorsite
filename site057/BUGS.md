# BUGS - site057 Remote Work Recruitment

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site057-bug01 | 필터 결과 수 불일치 | job-filter-count-mismatch | 메인 공고 리스트 상단 결과 수 배지 | `app.js` | `[data-bug-id="site057-bug01"]` | 사용자가 직무 필터를 적용했을 때, 화면에 보이는 실제 공고 카드 개수와 상단 배지에 표시되는 숫자가 일치하지 않음 | `renderJobs` 함수에서 필터 적용 시 결과 수를 계산할 때 필터링된 배열이 아닌 전체 데이터 배열의 길이를 참조함 | 현재 화면에 렌더링된 공고 카드의 개수와 배지의 숫자가 정확히 일치해야 함 |
| site057-bug02 | job card grid 깨짐 | job-card-grid-break | 메인 화면 중앙 공고 그리드 영역 | `styles.css` | `[data-bug-id="site057-bug02"]` | 브라우저 너비를 중간 크기(약 1024px~1200px)로 조절하면 공고 카드들이 서로 겹치거나 우측 사이드바 패널 아래로 밀려남 | CSS Grid 설정에서 `minmax`의 최소 너비를 과도하게 높게 설정하여 할당된 영역을 벗어나는 레이아웃 결함이 발생함 | 화면 너비에 따라 카드의 개수가 유동적으로 조절되거나 너비가 적절히 축소되어 레이아웃이 유지되어야 함 |
| site057-bug03 | 지원 버튼 무반응 | apply-button-no-response | 'NovaSoft' 공고 카드의 '지원하기' 버튼 | `app.js` | `[data-bug-id="site057-bug03"]` | 'NovaSoft' 채용 공고의 '지원하기' 버튼을 클릭해도 아무런 반응이나 지원 확인 알림창이 뜨지 않음 | 특정 공고 ID(4)에 대해서만 버튼 클릭 이벤트 리스너를 바인딩하지 않도록 로직을 처리함 | 모든 공고의 '지원하기' 버튼 클릭 시 지원 의사를 묻는 알림창(`alert`)이 정상적으로 표시되어야 함 |
