# site087-bug01 / DB 점수 중복 반영
- Type: database-duplicate
- Description: 같은 퀴즈를 여러 번 제출해도 점수가 계속 합산됨.
- Location: `server.js` - `POST /api/answers`
- data-bug-id: `site087-bug01`

# site087-bug02 / 네트워크 상태 코드 오류
- Type: network-http-status
- Description: 오답(Wrong Answer) 제출 시 200 OK 대신 201 Created를 반환하며, 응답 바디에 `correct: true`가 포함됨.
- Location: `server.js` - `POST /api/answers`
- data-bug-id: `site087-bug02`

# site087-bug03 / 점수 조작 취약점
- Type: security-parameter-tampering
- Description: 클라이언트가 `scoreDelta` 값을 직접 보내어 서버의 점수를 수정할 수 있음. (권한 검증 및 값 검증 부재)
- Location: `server.js` - `PATCH /api/scores`
- data-bug-id: `site087-bug03`
