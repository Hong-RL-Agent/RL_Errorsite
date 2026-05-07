# BUGS - site080 (뉴스 캐싱 취약점)

### site080-bug01
- **유형**: etag-mismatch (ETag 불일치)
- **API**: `GET /api/news`
- **증상**: 동일 리소스임에도 불구하고 매 요청마다 ETag가 변경되어 브라우저 캐시 재사용이 불가능함.

### site080-bug02
- **유형**: conditional-request-ignore (조건부 요청 무시)
- **API**: `GET /api/news`
- **증상**: 클라이언트가 `If-None-Match` 헤더를 통해 조건부 요청을 보냈음에도 불구하고, 서버가 이를 무시하고 항상 `200 OK`와 전체 데이터를 반환함 (304 미발생).

### site080-bug03
- **유형**: cache-invalidation-failure (캐시 무효화 실패)
- **API**: `GET /api/cache/status`
- **증상**: 새로운 뉴스가 등록되었음에도 불구하고, 캐시 서버가 이를 감지하지 못하고 이전 시점의 통계 데이터를 반환함.

### site080-bug04
- **유형**: stale-data-return (오래된 데이터 반환)
- **API**: `GET /api/news/:id`
- **증상**: 캐시 만료 정책(TTL)이 지났음에도 불구하고, 최신 데이터 대신 메모리에 남아있는 만료된(Stale) 데이터를 계속 반환함.
