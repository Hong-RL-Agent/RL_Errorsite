# BUGS - site050 Course Catalog

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site050-bug01 | 난이도 뱃지 undefined | undefined-difficulty-badge | 강좌 카드 상단 뱃지 | `app.js` | `[data-bug-id="site050-bug01"]` | "비즈니스 모델링" 강좌의 난이도 표시 영역에 실제 값이 아닌 'undefined' 텍스트가 노출됨 | API 응답 데이터에 `difficultyLabel` 필드가 누락되었으나, 클라이언트에서 fallback 처리 없이 렌더링함 | 데이터가 없을 경우 기본값(예: '미지정')을 표시하거나 해당 뱃지를 숨겨야 함 |
| site050-bug02 | 카드 높이 깨짐 | course-card-height-break | 강좌 그리드 세 번째 카드 | `styles.css` | `[data-bug-id="site050-bug02"]` | 제목이 매우 긴 강좌 카드의 높이가 다른 카드보다 과도하게 길어져 하단 버튼 위치가 정렬되지 않음 | CSS에서 제목에 대한 `line-clamp` 미적용 및 카드 내부 요소의 수직 정렬(Flex-grow 등) 미비 | 제목 길이에 관계없이 카드의 최대 높이를 제한하거나 버튼 위치를 하단에 고정시켜야 함 |
| site050-bug03 | 강좌 담기 무반응 | course-save-button-no-response | "Node.js 백엔드" 강좌 카드 하단 버튼 | `app.js` | `[data-bug-id="site050-bug03"]` | 특정 강좌의 "내 학습에 담기" 버튼을 클릭해도 버튼 텍스트가 변하지 않고 저장 상태가 반영되지 않음 | 해당 강좌(ID:5)의 버튼 생성 시 조건부로 클릭 이벤트 리스너를 연결하지 않음 | 모든 강좌 카드의 담기 버튼이 클릭 시 토글 동작(텍스트 변경, 상태 저장)을 수행해야 함 |
