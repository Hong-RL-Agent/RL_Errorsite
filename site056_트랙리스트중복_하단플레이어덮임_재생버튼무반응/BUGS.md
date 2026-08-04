# BUGS - site056 Museum Audio Guide

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site056-bug01 | 트랙 리스트 중복 | duplicate-audio-track-render | 오디오 트랙 리스트 상단 | `app.js` | `[data-bug-id="site056-bug01"]` | 특정 전시관의 오디오 트랙 리스트를 볼 때 첫 번째 트랙이 리스트에 두 번 연속으로 나타남 | `renderTracks` 함수에서 렌더링 배열을 생성할 때 특정 트랙 항목을 강제로 복제하여 추가함 | API에서 반환된 데이터의 개수와 순서에 맞춰 중복 없이 트랙이 렌더링되어야 함 |
| site056-bug02 | 하단 플레이어 덮임 | audio-player-overlap | 트랙 리스트 하단 끝부분 | `styles.css`, `index.html` | `[data-bug-id="site056-bug02"]` | 리스트를 끝까지 스크롤했을 때, 가장 마지막 트랙 항목이 하단 고정 플레이어에 가려져 전체 내용을 보기 어려움 | 메인 콘텐츠 영역(`main-layout`)의 하단 패딩이 고정 플레이어의 높이보다 작게 설정되어 레이아웃 겹침이 발생함 | 하단 고정 요소의 높이만큼 충분한 여백(`padding-bottom`)을 확보하여 모든 리스트 항목이 플레이어 위로 보이게 해야 함 |
| site056-bug03 | 재생 버튼 무반응 | audio-play-button-no-response | '함무라비 법전' 트랙 재생 버튼 | `app.js` | `[data-bug-id="site056-bug03"]` | '함무라비 법전' 트랙의 재생 버튼(▶)을 클릭해도 하단 플레이어의 정보가 갱신되지 않음 | 특정 트랙 ID(104)의 재생 버튼에만 이벤트 리스너를 연결하지 않도록 로직을 작성함 | 모든 트랙의 재생 버튼 클릭 시 현재 선택된 작품 정보가 하단 플레이어에 실시간으로 반영되어야 함 |
