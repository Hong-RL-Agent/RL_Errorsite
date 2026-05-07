# BUGS - site044

## site044-bug01
- **type**: ttl-expiry-not-applied
- **API**: `GET /api/flyers/today`
- **증상**: 유효기간이 만료된 할인 상품이 계속 노출됨.
- **description**: 서버에서 상품의 TTL(Time-To-Live) 또는 만료 날짜를 체크하는 로직이 누락되어, 이미 종료된 할인이 활성 상태로 표시됨.

## site044-bug02
- **type**: stale-snapshot-cache
- **API**: `GET /api/flyers`
- **증상**: 주간 전단지에 최신 데이터가 반영되지 않고 예전 스냅샷이 노출됨.
- **description**: 서버 사이드 캐싱이 설정되어 있으나, 데이터 변경 시 캐시를 무효화(Invalidate)하지 않아 오래된 스냅샷 데이터를 지속적으로 반환함.

## site044-bug03
- **type**: incorrect-discount-calculation
- **API**: `GET /api/products/:id`
- **증상**: 상품 상세 페이지에서 할인율이 실제 가격 차이와 다르게 계산됨.
- **description**: 할인율을 계산하는 공식이 잘못 구현되어(예: 나눗셈 순서 오류 또는 반올림 버그) 실제 할인 금액과 화면에 표시되는 퍼센트가 불일치함.

## site044-bug04
- **type**: scheduled-job-skipped
- **API**: `GET /api/deals/special`
- **증상**: 일부 오늘의 특가 상품이 목록에서 누락됨.
- **description**: 매일 자정에 실행되어야 할 특가 상품 업데이트 스케줄러가 비정상적으로 종료되거나 일부 항목을 건너뛰어, 최신 특가 목록이 불완전하게 구성됨.
