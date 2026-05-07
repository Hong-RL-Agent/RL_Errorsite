# 🐞 백엔드 의도적 오류 명세 (site061)

| ID | 유형 | 한국어명 | 설명 | 트리거 |
|---|---|---|---|---|
| site061-bug01 | weekday-mapping-mismatch | 요일 매핑 오류 | 월요일 웹툰 요청 시 화요일 데이터 반환 | 요일 탭 클릭 (월/화) |
| site061-bug02 | stale-update-list | 업데이트 반영 누락 | 업데이트 후 리스트에서 최신본 누락 | 업데이트 버튼 클릭 후 리스트 확인 |
| site061-bug03 | non-atomic-like-increment | 좋아요 비원자적 증가 | 좋아요 클릭 시 간헐적으로 숫자가 오르지 않음 | 좋아요 버튼 클릭 |
| site061-bug04 | unstable-sort-order | 정렬 기준 불안정 | 최신순 정렬 시 순서가 계속 바뀜 | 최신순 정렬 버튼 반복 클릭 |
