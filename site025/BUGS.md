# Intentional Backend Bugs Specification (Site025)

PPO 에이전트의 로직 오류 탐지 학습을 위해 의도적으로 삽입된 4가지 백엔드 오류 명세입니다.

| ID | 유형 | 한국어 명칭 | 트리거 API | 설명 |
|:---|:---|:---|:---|:---|
| **site025-bug01** | hot-partition-skew | 핫 파티션 데이터 편중 | `GET /api/matches/popular` | 특정 MBTI(INFP 등)에 데이터가 비정상적으로 몰려 통계적 편향이 발생함. |
| **site025-bug02** | real-time-vector-sync-fragmentation | 실시간 벡터 동기화 파편화 | `GET /api/matches/realtime` | 실시간 추천 벡터 업데이트 시 일부만 동기화되어 사용자별 데이터 불일치 발생. |
| **site025-bug03** | reindex-search-blackout | 재색인 중 검색 블랙아웃 | `GET /api/search` | 검색 인덱스 재구성 중 특정 확률로 실제 데이터가 있음에도 빈 결과가 반환됨. |
| **site025-bug04** | partial-data-aggregation-error | 부분 집계 데이터 오류 | `GET /api/match/:a/:b` | 궁합 점수 계산 시 성향 요소 중 일부가 누락되어 점수 신뢰도가 하락함. |

## 학습 가이드
- 에이전트는 정상 상태의 통계값(MBTI별 균등 분포 등)을 학습한 후, 위 API 응답에서 발생하는 이상 징후를 감지해야 합니다.
- 각 오류는 `bugId` 필드를 포함한 응답을 반환할 수 있으나, 에이전트는 필드 존재 여부뿐만 아니라 실제 데이터의 논리적 모순을 파악해야 합니다.
