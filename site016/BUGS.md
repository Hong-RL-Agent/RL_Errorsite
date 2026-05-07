# BUGS - site016

## site016-bug01
- type: 데이터 삭제 경로 부재
- API endpoint: DELETE /api/user/delete
- HTTP method: DELETE
- 발생 조건: 사용자가 계정 영구 삭제 버튼을 클릭할 때
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site016-bug01"]
- 사용자 증상: 사용자가 자신의 계정을 삭제하려 해도 API 경로가 제대로 구현되지 않아 에러(404)가 발생하고 계정이 지워지지 않음.
- 서버 응답 상태 코드: 404
- 서버 응답 예시: { "ok": false, "error": "Not Found: API route not implemented", "bugId": "site016-bug01" }
- 원인: 백엔드에서 사용자 삭제 엔드포인트 자체를 의도적으로 누락하거나 더미 에러를 반환하게 만듦.
- PPO 탐지 해야될 기대 행동: 계정 탈퇴/삭제 권리를 보장하지 않고 고의로 API를 구현하지 않은 프라이버시 침해(다크 패턴) 식별.

## site016-bug02
- type: 부적절한 연령 확인 로직
- API endpoint: GET /api/feed
- HTTP method: GET
- 발생 조건: 18세 미만(예: age=16)의 유저 파라미터로 피드를 요청할 때
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site016-bug02"]
- 사용자 증상: 나이가 16세인데도 불구하고 19+ 민감한 콘텐츠(restricted: true)가 필터링되지 않고 그대로 피드에 노출됨.
- 서버 응답 상태 코드: 200
- 서버 응답 예시: { "ok": true, "data": [... restricted posts ...], "bugId": "site016-bug02" }
- 원인: age < 18 일 때 피드 배열에서 restricted 게시글을 제외하는 로직이 의도적으로 누락됨.
- PPO 탐지 해야될 기대 행동: 연령 제한 콘텐츠에 대한 접근 제어(Access Control) 부재 결함 탐지.

## site016-bug03
- type: 데이터 최소 수집 원칙 위반
- API endpoint: GET /api/user/profile
- HTTP method: GET
- 발생 조건: 사용자가 자신의 프로필 조회 API를 호출할 때
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site016-bug03"]
- 사용자 증상: 프론트엔드에서는 렌더링에 이메일과 이름만 필요한데, 네트워크 응답에 주민등록번호(SSN)나 비밀번호 평문이 불필요하게 포함되어 옴.
- 서버 응답 상태 코드: 200
- 서버 응답 예시: { "ok": true, "data": { "username": "test_user", "ssn": "800101-1234567", "password": "...", ... }, "bugId": "site016-bug03" }
- 원인: DB 객체를 클라이언트로 내려보낼 때 민감 정보를 Omit(마스킹/제거)하지 않음.
- PPO 탐지 해야될 기대 행동: 불필요한 민감 개인정보 과다 노출(Data Exposure) 결함 식별.

## site016-bug04
- type: 탈퇴 데이터 파기 지연
- API endpoint: POST /api/user/deactivate
- HTTP method: POST
- 발생 조건: 사용자가 계정 비활성화(Deactivate)를 요청할 때
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site016-bug04"]
- 사용자 증상: 계정은 탈퇴(deleted=true) 처리되었다고 뜨지만, 서버의 개인정보 레코드는 지워지거나 마스킹되지 않고 그대로 유지됨.
- 서버 응답 상태 코드: 200
- 서버 응답 예시: { "ok": true, "msg": "Account deactivated", "currentUserDataStillRetained": {...}, "bugId": "site016-bug04" }
- 원인: 상태 플래그만 변경하고 실제 데이터를 파기(Hard Delete or Masking)하는 로직이 없음.
- PPO 탐지 해야될 기대 행동: 탈퇴 회원의 개인정보 파기 의무 위반 탐지.

## site016-bug05
- type: 법적 근거 고지 미흡
- API endpoint: GET /api/user/privacy
- HTTP method: GET
- 발생 조건: 프라이버시 정책 정보 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site016-bug05"]
- 사용자 증상: 수집 항목과 보존 기간은 명시되어 있으나, 이를 수집하는 '법적 근거(Legal Basis)'가 누락됨.
- 서버 응답 상태 코드: 200
- 서버 응답 예시: { "ok": true, "data": { "dataCollected": [...], "retentionPeriod": "2 years" }, "bugId": "site016-bug05" }
- 원인: GDPR 등 규정에서 필수적으로 요구하는 합법적 처리 근거 속성 고의 누락.
- PPO 탐지 해야될 기대 행동: 필수 법적 고지 항목 누락 식별.

## site016-bug06
- type: 휴면 계정 처리 정책 미고지
- API endpoint: GET /api/user/inactive
- HTTP method: GET
- 발생 조건: 장기 미접속(휴면) 계정 상태 조회 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site016-bug06"]
- 사용자 증상: 계정이 inactive 상태라고 안내되지만, 며칠 뒤에 삭제되는지 등 데이터 파기 일정(정책) 정보가 없음.
- 서버 응답 상태 코드: 200
- 서버 응답 예시: { "ok": true, "data": { "status": "inactive", "lastLogin": "..." }, "bugId": "site016-bug06" }
- 원인: 정책(policy) 필드를 포함하지 않음.
- PPO 탐지 해야될 기대 행동: 장기 미사용 계정의 개인정보 파기 정책 미안내 결함 탐지.
