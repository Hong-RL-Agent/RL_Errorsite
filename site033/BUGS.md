# BUGS - site033

## site033-bug01

- bugId: `site033-bug01`
- CSV 오류명: 랭킹 순위 중복
- type: `duplicate-ranking-position`
- 화면 위치: 랭킹 테이블 tbody의 순위 셀
- 관련 파일: `src/components/RankingTable.jsx`
- data-bug-id selector: `[data-bug-id="site033-bug01"]`
- 사용자가 경험하는 증상: 서로 다른 두 플레이어가 같은 순위 번호로 표시된다.
- 코드상 의도된 원인: 세 번째 row의 표시 순위를 이전 row의 rank 값으로 렌더링한다.
- 탐지 포인트: `/api/rankings`의 rank 값과 화면 표시 rank를 비교한다.

## site033-bug02

- bugId: `site033-bug02`
- CSV 오류명: 카드 플립 레이아웃 깨짐
- type: `card-flip-layout-break`
- 화면 위치: 플레이어 카드 grid의 flip 카드
- 관련 파일: `src/styles/player-card.css`, `src/components/PlayerCard.jsx`
- data-bug-id selector: `[data-bug-id="site033-bug02"]`
- 사용자가 경험하는 증상: 통계 보기 버튼으로 카드를 뒤집으면 뒷면 정보가 카드 밖으로 밀리거나 앞면과 겹친다.
- 코드상 의도된 원인: back face에 잘못된 transform, height, backface-visibility 설정을 적용했다.
- 탐지 포인트: flip 후 카드 경계 안에 앞/뒤 정보가 정상 분리되는지 확인한다.

## site033-bug03

- bugId: `site033-bug03`
- CSV 오류명: 새로고침 버튼 무반응
- type: `refresh-button-no-response`
- 화면 위치: 랭킹 테이블 상단 툴바의 `랭킹 새로고침` 버튼
- 관련 파일: `src/App.jsx`
- data-bug-id selector: `[data-bug-id="site033-bug03"]`
- 사용자가 경험하는 증상: 버튼은 활성 상태처럼 보이지만 클릭해도 랭킹 데이터나 로딩 상태가 갱신되지 않는다.
- 코드상 의도된 원인: 실제 fetch handler 대신 빈 함수를 연결했다.
- 탐지 포인트: 버튼 클릭 전후 DOM, 데이터, 로딩 상태 변화가 없는지 확인한다.
