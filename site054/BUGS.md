# BUGS - site054 Movie Review Site

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site054-bug01 | 별점 표시 오류 | star-rating-display-error | 리뷰 카드 상단 별점 영역 | `app.js` | `[data-bug-id="site054-bug01"]` | 리뷰 데이터의 실제 별점보다 항상 별 1개가 더 많이 채워져서 표시됨 (예: 실제 4점인 리뷰가 별 5개로 보임) | `renderStars` 함수를 호출할 때 인자로 `rating + 1`을 전달하여 렌더링 로직에 오류가 발생함 | 데이터의 실제 별점(rating)에 해당하는 개수만큼만 별이 채워져야 함 |
| site054-bug02 | 리뷰 카드 overflow | review-card-overflow | 두 번째 리뷰 카드 (시네필B) | `styles.css` | `[data-bug-id="site054-bug02"]` | 공백이 없는 긴 단어가 포함된 리뷰 텍스트가 카드 영역을 뚫고 나와 우측 사이드바 패널 아래로 겹침 | CSS에서 리뷰 텍스트 영역에 `word-break` 처리를 하지 않았으며, 버그 재현을 위해 특정 카드에 `white-space: nowrap`을 강제함 | 텍스트가 컨테이너 너비를 넘을 경우 자동으로 줄바꿈(`word-break: break-all` 등) 처리가 되어야 함 |
| site054-bug03 | 리뷰 등록 버튼 무반응 | review-submit-button-no-response | 리뷰 작성 폼 하단 등록 버튼 | `app.js` | `[data-bug-id="site054-bug03"]` | 리뷰 내용을 입력하고 '리뷰 등록' 버튼을 클릭해도 아무런 반응이 없으며 리뷰가 등록되지 않음 | `app.js`에서 버튼을 찾는 ID 셀렉터(`btn-submit-review`)가 실제 HTML의 ID(`btn-submit-review-wrong-selector`)와 달라 이벤트 리스너가 연결되지 않음 | 버튼 클릭 시 입력 내용을 확인하고 알림창을 띄우거나 리스트에 추가하는 동작을 수행해야 함 |
