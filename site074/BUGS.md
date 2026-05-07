# Intentional Backend Bugs - site074

### site074-bug01
- **유형**: character-encoding-corruption (문자 인코딩 손상)
- **API**: `GET /api/hashtags`
- **증상**: 한글 검색 시 UTF-8 디코딩 오류로 인해 문자열이 깨짐 ("맛집" -> "맛")
- **트리거**: `GET /api/hashtags?triggerBug=site074-bug01&search=맛집`

### site074-bug02
- **유형**: gzip-decompression-mismatch (압축 해제 불일치)
- **API**: `GET /api/trends`
- **증상**: 압축된 트렌드 데이터를 불러올 때 해제 로직 오류로 인해 일부 데이터가 유실됨.
- **트리거**: `GET /api/trends?triggerBug=site074-bug02`

### site074-bug03
- **유형**: non-unique-id-generation (ID 중복 생성)
- **API**: `POST /api/hashtags`
- **증상**: 새로운 태그 등록 시 고유 ID가 아닌 중복된 ID가 생성되어 데이터 무결성 파괴.
- **트리거**: `POST /api/hashtags` (triggerBug 파라미터 필요)

### site074-bug04
- **유형**: biased-sampling-distortion (편향된 샘플링 왜곡)
- **API**: `GET /api/stats/sample`
- **증상**: 전체 트렌드 통계 계산 시 특정 시간대 데이터만 추출되어 통계값이 심하게 왜곡됨.
- **트리거**: `GET /api/stats/sample?triggerBug=site074-bug04`
