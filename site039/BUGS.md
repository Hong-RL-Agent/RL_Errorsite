# BUGS - site039

## site039-bug01
- **type**: fake-countdown
- **API**: `GET /api/deals`
- **증상**: 타이머 초기화 (항상 새로운 countdown 값을 생성하여 반환)
- **description**: 서버가 항상 새로운 countdown 값을 생성하여 반환하며, 실제로는 시간이 줄어들지 않음.

## site039-bug02
- **type**: fake-stock
- **API**: `GET /api/products`
- **증상**: 재고 조작 (재고가 충분하지만 항상 "남은 수량 3개"로 표시)
- **description**: stock 값이 실제와 다르게 고정되어 사용자에게 긴박감을 조성하는 다크패턴.

## site039-bug03
- **type**: hidden-auto-payment
- **API**: `POST /api/checkout`
- **증상**: 자동결제 숨김 (UI에서 표시되지 않지만 결제 요청 시 자동 활성화)
- **description**: 결제 응답에 `autoPay: true`가 포함되어 사용자가 모르게 정기 결제에 동의하게 함.

## site039-bug04
- **type**: hidden-trial-end
- **API**: `GET /api/subscription`
- **증상**: 체험 종료 정보 없음 (체험 기간 종료 정보가 응답에서 누락됨)
- **description**: 실제로는 자동 유료 전환되지만 응답에서 종료 시점 정보를 누락시켜 사용자를 기만함.
