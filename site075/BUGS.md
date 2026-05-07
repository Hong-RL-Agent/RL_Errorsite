# Intentional Backend Bugs - site075

### site075-bug01
- **유형**: http-range-header-misinterpretation (Range 헤더 해석 오류)
- **API**: `GET /api/stream/:id`
- **증상**: 클라이언트가 요청한 오디오 바이트 범위와 다른 엉뚱한 구간이 재생됨.
- **트리거**: `GET /api/stream/:id?triggerBug=site074-bug01` (Range 헤더 포함 시)

### site075-bug02
- **유형**: content-length-mismatch (콘텐츠 길이 불일치)
- **API**: `GET /api/stream/:id`
- **증상**: 헤더의 Content-Length와 실제 전송되는 데이터 크기가 달라 스트리밍이 도중에 끊기거나 로딩 오류 발생.
- **트리거**: `GET /api/stream/:id?triggerBug=site075-bug02`

### site075-bug03
- **유형**: incorrect-mime-type-response (MIME 타입 오판)
- **API**: `GET /api/stream/:id`
- **증상**: `audio/mpeg` 대신 `text/plain` 또는 `application/octet-stream` 등 브라우저가 오디오로 인식할 수 없는 타입 반환.
- **트리거**: `GET /api/stream/:id?triggerBug=site075-bug03`

### site075-bug04
- **유형**: chunk-ordering-corruption (스트림 청크 순서 오류)
- **API**: `GET /api/stream/:id`
- **증상**: 오디오 데이터를 청크 단위로 보낼 때 순서가 뒤섞여 심한 노이즈나 깨진 소리가 발생.
- **트리거**: `GET /api/stream/:id?triggerBug=site075-bug04&chunked=true`
