# BUGS - site053 Apartment Management Portal

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site053-bug01 | 공지사항 중복 렌더링 | duplicate-notice-render | 공지사항 리스트 영역 | `app.js` | `[data-bug-id="site053-bug01"]` | 카테고리 필터(예: 시설 안내)를 선택하면 기존 리스트가 사라지지 않고 새 필터 결과가 아래에 추가되어 중복 노출됨 | `renderNotices` 함수에서 필터링 시 `innerHTML = ""` 초기화 로직을 조건부로 누락함 | 카테고리 변경 시 기존 리스트를 모두 비우고 새로운 필터 결과만 렌더링해야 함 |
| site053-bug02 | 탭 콘텐츠 겹침 | tab-content-overlap | 하단 탭 콘텐츠 영역 | `app.js`, `styles.css` | `[data-bug-id="site053-bug02"]` | '시설 예약' 탭으로 이동 시 이전 '민원 접수' 폼이 사라지지 않고 예약 달력과 겹쳐서 보임 | 탭 전환 로직에서 이전 패널의 `active` 클래스 제거를 누락하여 두 패널이 동시에 `display: block` 상태가 됨 | 새로운 탭을 활성화할 때 이전 탭의 활성화 상태(`active` 클래스 등)를 명확히 해제해야 함 |
| site053-bug03 | 민원 등록 버튼 무반응 | complaint-submit-button-no-response | 민원 접수 폼 하단 버튼 | `app.js` | `[data-bug-id="site053-bug03"]` | 민원 접수 폼을 작성하고 '등록하기' 버튼을 클릭해도 아무런 반응이나 알림이 발생하지 않음 | `app.js`에서 버튼을 찾는 ID 셀렉터(`btn-submit-complaint`)가 실제 HTML ID(`btn-submit-complaint-wrong-id`)와 달라 이벤트 리스너가 연결되지 않음 | 버튼 클릭 시 입력값 유무를 확인하고 접수 완료 알림(`alert`)을 띄워야 함 |
