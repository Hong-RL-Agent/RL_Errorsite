# BUGS - site059 Travel Packing Checklist

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site059-bug01 | 완료 개수 불일치 | completed-count-mismatch | 상단 준비율(Progress) 카드 | `app.js` | `[data-bug-id="site059-bug01"]` | 체크리스트 항목을 체크해도 상단 요약 카드의 '완료 개수'가 실제 체크된 수보다 1개 적게 표시됨 (예: 5개 체크 시 4개 완료로 표시) | `updateProgress` 함수에서 렌더링을 위한 완료 개수 계산 시 실제 완료된 수에서 의도적으로 1을 차감하도록 로직을 작성함 | 체크리스트에서 체크된(checked) 모든 항목의 개수가 요약 카드에 실시간으로 정확히 반영되어야 함 |
| site059-bug02 | 체크리스트 컬럼 깨짐 | checklist-column-layout-break | 메인 체크리스트 그리드 영역 | `styles.css` | `[data-bug-id="site059-bug02"]` | 브라우저 창 너비를 중간 크기(약 1024px~1150px)로 줄이면 두 번째 컬럼과 세 번째 컬럼이 서로 겹쳐서 가려지는 현상 발생 | 체크리스트 그리드의 컬럼 너비 설정에서 `min-width`를 과도하게 높게 잡아 부모 컨테이너 너비 부족 시 겹침 현상이 발생하도록 유도함 | 화면 너비에 따라 컬럼이 아래로 떨어지거나 유동적으로 크기가 조절되어 데이터 가독성을 유지해야 함 |
| site059-bug03 | 항목 추가 버튼 무반응 | add-item-button-no-response | 하단 '항목 직접 추가' 버튼 | `app.js`, `index.html` | `[data-bug-id="site059-bug03"]` | '추가' 버튼을 클릭해도 입력한 내용이 체크리스트 리스트에 추가되지 않음 | HTML의 버튼 ID(`btn-add-item-real`)와 `app.js`에서 참조하는 셀렉터 ID(`btn-add-item`)를 불일치시켜 이벤트 리스너 바인딩을 실패하게 함 | 버튼 클릭 시 입력 필드의 텍스트가 새 체크리스트 항목으로 즉시 추가되어야 함 |
