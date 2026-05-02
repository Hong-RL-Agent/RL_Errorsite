# BUGS (site070)

## 1. site070-bug01
- **Type:** `database-duplicate`
- **Description:** 같은 퍼즐 정답 제출을 여러 번 점수로 반영함.
- **Data-Bug-ID:** `site070-bug01`

## 2. site070-bug02
- **Type:** `network-timeout`
- **Description:** 랭킹 API가 특정 난이도에서 타임아웃에 가깝게 지연됨.
- **Data-Bug-ID:** `site070-bug02`

## 3. site070-bug03
- **Type:** `security-parameter-tampering`
- **Description:** 클라이언트가 보낸 score 값을 서버가 검증 없이 랭킹에 반영함.
- **Data-Bug-ID:** `site070-bug03`
