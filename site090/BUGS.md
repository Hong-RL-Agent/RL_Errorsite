# site090-bug01 / DB 태그 검색 오류
- Type: database-search
- Description: 태그 필터링 시 해당 태그가 `tags` 배열에 있는지 확인하는 것이 아니라, `content` 텍스트 내에 해당 단어가 포함되어 있는지만 검색함. 이로 인해 태그에는 지정되어 있으나 본문에는 없는 경우 검색 결과에서 누락됨.
- Location: `server.js` - `GET /api/memories`
- data-bug-id: `site090-bug01`

# site090-bug02 / 네트워크 응답 포맷 오류
- Type: network-response-format
- Description: 통계 API(`GET /api/stats`) 호출 시 JSON 객체가 아닌 JSON 문자열로 인코딩된 데이터를 한 번 더 문자열화하여 반환함. 클라이언트에서 `JSON.parse`를 두 번 해야 정상적인 데이터를 얻을 수 있는 비정상적인 포맷임.
- Location: `server.js` - `GET /api/stats`
- data-bug-id: `site090-bug02`

# site090-bug03 / 비공개 추억 접근 제어 실패
- Type: security-access-control
- Description: 비공개(`private: true`)로 설정된 추억 카드라도 `memoryId`를 직접 알고 있는 경우 서버에서 접근을 차단하지 않고 상세 내용을 반환함 (IDOR 취약점).
- Location: `server.js` - `GET /api/memories/:id`
- data-bug-id: `site090-bug03`
