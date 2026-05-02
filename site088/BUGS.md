# site088-bug01 / DB 제안 상태 오류
- Type: database-state
- Description: 거절된(rejected) 제안도 'pending' 필터링 시 목록에 계속 표시됨.
- Location: `server.js` - `GET /api/my-offers`
- data-bug-id: `site088-bug01`

# site088-bug02 / 네트워크 요청 본문 검증 누락
- Type: network-request-validation
- Description: 교환 제안 시 `offerMessage` 필드가 비어있어도 서버에서 에러를 발생시키지 않고 성공 처리함.
- Location: `server.js` - `POST /api/offers`
- data-bug-id: `site088-bug02`

# site088-bug03 / 거래 제안 접근 제어 실패
- Type: security-idor
- Description: `/api/offers/:id` 요청 시 본인의 제안이 아닌 타인의 제안 ID를 넣어도 상세 정보가 조회됨 (IDOR 취약점).
- Location: `server.js` - `GET /api/offers/:id`
- data-bug-id: `site088-bug03`
