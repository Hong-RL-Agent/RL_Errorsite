# BUGS (site021)

## 1. site021-bug01
- **Type:** `database-calculation`
- **Description:** 완료 강의 수를 전체 강의 수가 아닌 고정값으로 나누어 진도율이 잘못 계산됨.
- **Data-Bug-ID:** `site021-bug01`

## 2. site021-bug02
- **Type:** `network-partial-failure`
- **Description:** 퀴즈 제출 API가 일부 문항 채점 결과를 누락해 반환함.
- **Data-Bug-ID:** `site021-bug02`

## 3. site021-bug03
- **Type:** `security-access-control`
- **Description:** 수강 신청하지 않은 강의도 courseId만 알면 상세 콘텐츠를 조회할 수 있음.
- **Data-Bug-ID:** `site021-bug03`
