# BUGS

## 1. site010-bug01
- **Bug ID:** `site010-bug01`
- **CSV Error:** DB 관계 매핑 오류
- **Type:** `database-relation`
- **발생 위치:** `server.js` 의 `GET /api/playlists/:id/songs` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (모달 곡 목록 영역), `public/js/app.js`
- **data-bug-id Selector:** `#modal-pl-songs[data-bug-id="site010-bug01"]`
- **사용자가 경험하는 증상:** 
  - 특정 플레이리스트 썸네일을 클릭하여 상세 모달 창을 열면, 해당 플레이리스트에 속해야 할 곡들이 나오는 것이 아니라, 사용자 본인이 최근에 들었던 전혀 관계없는 곡들이 목록에 노출됩니다.
- **코드상 의도된 원인:**
  - 서버 측 API에서 특정 플레이리스트의 ID(`playlistId`)를 기반으로 곡 테이블과 조인(Join) 또는 필터링하여 응답을 보내야 합니다. 하지만 개발자의 쿼리 작성 실수(또는 복붙 오류)로 인하여 현재 로그인한 유저(`currentUserId`)가 최근에 재생한 이력과 매핑된 곡들을 가져와서 반환하도록 코드가 잘못 연결되어 있습니다.
- **PPO 에이전트 기대 행동:**
  - 백엔드 데이터베이스 ORM 또는 쿼리에서 부모-자식 혹은 다대다 관계 테이블의 외래키(Foreign Key) 바인딩이 잘못 설정되어, 데이터 간 논리적 연관성이 깨지는 현상을 식별해야 합니다.

## 2. site010-bug02
- **Bug ID:** `site010-bug02`
- **CSV Error:** 부분 응답 데이터 손상
- **Type:** `network-partial-response`
- **발생 위치:** `server.js` 의 `GET /api/songs` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (손상 토글 체크박스), `public/js/app.js`
- **data-bug-id Selector:** `#corrupt-toggle[data-bug-id="site010-bug02"]`
- **사용자가 경험하는 증상:**
  - 좌측 메뉴 하단의 [데이터 손상 응답 (Bug 02)] 체크박스를 켜면, 홈 화면의 '실시간 인기 곡 TOP' 리스트가 갱신되면서 곡 제목이 붉은색의 `undefined`로 표시되고 앨범 아트 이미지가 깨져(엑스박스) 렌더링됩니다.
- **코드상 의도된 원인:**
  - API에서 인기 곡 JSON 배열을 반환하기 직전, 특정 조건(`corrupt=true`)을 만나면 객체의 필수 프로퍼티인 `title`, `artist`, `coverImage` 를 의도적으로 `delete` 연산자를 사용해 삭제해버립니다. 프론트엔드는 이 값들을 기대하고 렌더링을 시도하다 오류를 발생시킵니다.
- **PPO 에이전트 기대 행동:**
  - API 통신 과정에서 JSON 객체의 필드 일부가 누락되거나 타입이 불일치하는 등 부분 데이터 손상(Partial Response Corruption)이 발생하여 클라이언트 측 UI나 파서(Parser)에 예외 상황을 초래하는 결함을 포착해야 합니다.

## 3. site010-bug03
- **Bug ID:** `site010-bug03`
- **CSV Error:** 비공개 리소스 접근 제어 실패
- **Type:** `security-access-control`
- **발생 위치:** `server.js` 의 `GET /api/playlists/:id` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (훔쳐보기 테스트 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#test-private-btn[data-bug-id="site010-bug03"]`
- **사용자가 경험하는 증상:**
  - 좌측 메뉴 하단의 [비공개 플리(ID:999) 훔쳐보기 (Bug 03)] 버튼을 클릭하면, 권한 부족 에러(403 Forbidden)가 뜨지 않고 타인의 비공개 플레이리스트(비밀 일기장 노래) 상세 모달 창이 그대로 열리며 곡 목록을 볼 수 있습니다.
- **코드상 의도된 원인:**
  - 백엔드에서 `playlist.isPrivate === true` 인 경우, 현재 API를 호출한 주체(`currentUserId`)가 해당 플레이리스트의 `owner`와 일치하는지 확인(Authorization)하는 로직이 아예 존재하지 않습니다. 자원 ID만 알면 무조건 반환합니다.
- **PPO 에이전트 기대 행동:**
  - Insecure Direct Object References (IDOR) 및 접근 제어 부재 취약점을 스캔하여, 권한이 부여되지 않은 타 사용자의 비공개 리소스에 직접 접근이 가능한 보안 홀을 찾아내야 합니다.
