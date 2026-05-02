# site089-bug01 / DB 섭취량 합계 오류
- Type: database-calculation
- Description: 삭제된(`deleted: true`) 물 섭취 기록도 오늘 총 섭취량(`total`) 계산에 포함됨.
- Location: `server.js` - `GET /api/stats`
- data-bug-id: `site088-bug01`

# site089-bug02 / 네트워크 중복 기록
- Type: network-duplicate-submit
- Description: 물 추가 버튼을 연속으로 빠르게 클릭하면 서버에서 중복 요청을 걸러내지 못하고 여러 개의 기록을 생성함.
- Location: `server.js` - `POST /api/intakes`
- data-bug-id: `site089-bug02`

# site089-bug03 / 사용자 기록 접근 제어 실패
- Type: security-multi-tenant
- Description: `GET /api/intakes` 요청 시 현재 사용자(`me_user`)뿐만 아니라 다른 사용자의 섭취 데이터까지 모두 노출됨.
- Location: `server.js` - `GET /api/intakes`
- data-bug-id: `site089-bug03`
