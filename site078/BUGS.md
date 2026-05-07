# BUGS - site078 (검색 파이프라인 취약점)

### site078-bug01
- **유형**: tokenizer-split-error (토크나이저 분리 오류)
- **API**: `GET /api/search?q=ReactJS`
- **증상**: "ReactJS"라는 단일 토큰을 ["React", "JS"]로 잘못 분리하여 검색 결과의 정확도 저하 및 의도치 않은 하이라이트 발생.

### site078-bug02
- **유형**: inverted-index-missing-entry (역색인 누락)
- **API**: `GET /api/dashboard/summary` / `GET /api/search?q=Node`
- **증상**: 데이터베이스에는 존재하지만 역색인(Inverted Index) 테이블에서 누락되어 특정 키워드(Node) 검색 시 결과가 반환되지 않음.

### site078-bug03
- **유형**: ranking-score-miscalculation (랭킹 점수 계산 오류)
- **API**: `GET /api/search?q=async`
- **증상**: TF-IDF 또는 BM25 가중치 계산 로직의 오류로 인해 검색어와 관련성이 매우 낮은 문서가 최상단에 노출됨.

### site078-bug04
- **유형**: highlight-offset-mismatch (하이라이트 위치 불일치)
- **API**: `GET /api/search?q=useEffect`
- **증상**: 검색어의 시작/끝 오프셋 계산 오류로 인해 실제 텍스트가 아닌 엉뚱한 위치에 하이라이트 CSS 클래스가 적용됨.
