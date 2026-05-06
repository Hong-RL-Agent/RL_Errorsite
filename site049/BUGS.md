# BUGS - site049 Blog Magazine

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site049-bug01 | 태그 필터 불일치 | tag-filter-mismatch | 중앙 글 목록 영역 | `app.js` | `[data-bug-id="site049-bug01"]` | 사용자가 "여행" 태그를 클릭하면 "일상" 카테고리의 글들이 필터링되어 나타남 | `filterPosts` 함수에서 '여행' 태그 클릭 시 강제로 '일상' 태그를 필터링하도록 로직 구현 | 활성화된 태그 버튼과 일치하는 태그를 가진 글들만 목록에 표시되어야 함 |
| site049-bug02 | 사이드바가 본문 침범 | sidebar-content-overlap | 전체 레이아웃 (우측 사이드바) | `styles.css` | `[data-bug-id="site049-bug02"]` | 화면 폭이 약 1200px 이하일 때 우측 사이드바가 본문 글 카드 영역 위로 겹쳐서 표시됨 | 미디어 쿼리(1200px)에서 `position: absolute`를 사용하여 고정된 위치에 사이드바를 배치하면서 본문 영역과 겹침 유도 | 화면 폭이 줄어들더라도 사이드바와 본문 영역이 겹치지 않고 적절히 배치(Stack)되어야 함 |
| site049-bug03 | 구독 버튼 무반응 | newsletter-button-no-response | 우측 사이드바 뉴스레터 위젯 | `app.js` | `[data-bug-id="site049-bug03"]` | 이메일 입력 후 "구독하기" 버튼을 눌러도 아무런 알림이나 피드백이 발생하지 않음 | `app.js`에서 버튼을 찾는 ID 셀렉터가 실제 HTML의 버튼 ID와 일치하지 않아 이벤트 리스너가 연결되지 않음 | 버튼 클릭 시 이메일 유효성을 확인하고 구독 완료 안내 문구나 알림창이 나타나야 함 |
