# BUGS

## site067-bug01

- bugId: `site067-bug01`
- CSV 오류명: 멤버 리스트 중복 렌더링
- type: `duplicate-member-list-render`
- 화면 위치: 모임 상세 모달의 참여 멤버 목록
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site067-bug01"]`
- 사용자가 경험하는 증상: 상세 모달에서 같은 멤버가 두 번 표시됩니다.
- 코드상 의도된 원인: `/api/members`는 중복 없는 배열을 반환하지만 `renderMembers` 함수가 특정 `memberId`를 가진 멤버를 한 번 더 append합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 상세 모달의 참여 멤버 이름 또는 `data-member-id`가 중복 표시되는지 비교해 렌더링 중복 오류로 판단해야 합니다.

## site067-bug02

- bugId: `site067-bug02`
- CSV 오류명: 카드 정렬 깨짐
- type: `club-card-alignment-break`
- 화면 위치: 독서 모임 카드 grid의 긴 선정 도서 제목 카드
- 관련 파일: `public/styles.css`, `public/app.js`
- data-bug-id selector: `[data-bug-id="site067-bug02"]`
- 사용자가 경험하는 증상: 긴 책 제목을 가진 카드만 높이가 과도하게 커지고 참가 버튼 위치가 다른 카드와 맞지 않습니다.
- 코드상 의도된 원인: 오류 카드에서 도서 제목 line-clamp와 카드 하단 버튼 정렬을 해제해 grid 정렬이 깨집니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 카드 grid 내 동일 행 카드들의 높이와 버튼 y좌표가 크게 다른 정렬 오류를 탐지해야 합니다.

## site067-bug03

- bugId: `site067-bug03`
- CSV 오류명: 참가 버튼 무반응
- type: `join-club-button-no-response`
- 화면 위치: `밤의 추리 독서회` 모임 카드의 `참가하기` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site067-bug03"]`
- 사용자가 경험하는 증상: 버튼은 활성처럼 보이지만 클릭해도 우측 `내 참여 예정 모임` 패널에 추가되지 않습니다.
- 코드상 의도된 원인: 특정 `clubId`의 참가 버튼에만 click listener를 연결하지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 모임 참가 버튼은 패널을 갱신하는 반면 특정 버튼만 상태 변화가 없는 것을 이벤트 무반응 오류로 판단해야 합니다.
