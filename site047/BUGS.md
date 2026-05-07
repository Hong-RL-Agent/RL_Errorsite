# BUGS - site047 (Blue Horizon Bank)

이 문서는 site047 프로젝트에 포함된 의도적인 백엔드 로직 오류를 정리한 것입니다.

## site047-bug01
- **type**: incorrect-running-balance
- **API endpoint**: `GET /api/transactions`
- **data-bug-id**: `site047-bug01` (새로고침 버튼)
- **설명**: 거래 목록의 `balance` 필드가 이전 거래와의 차액으로 계산되지 않고, 서버에서 강제로 5555원의 오차를 더해 반환합니다.
- **예상 결과**: UI상에서 이전 잔액 + 입금액 != 현재 잔액 상황 발생.

## site047-bug02
- **type**: unstable-pagination-order
- **API endpoint**: `GET /api/transactions?page=1`
- **data-bug-id**: `site047-bug02` (페이지 1 버튼)
- **설명**: 1페이지를 요청할 때마다 서버에서 데이터를 섞어서 반환하므로, 같은 요청임에도 데이터의 순서가 매번 달라집니다.
- **예상 결과**: 새로고침 시 리스트 순서 변경.

## site047-bug03
- **type**: filter-boundary-error
- **API endpoint**: `GET /api/transactions/filter`
- **data-bug-id**: `site047-bug03` (필터 적용 버튼)
- **설명**: `minAmount` 파라미터가 전달될 때, 서버에서 `minAmount - 1000` 조건으로 필터링을 수행하여 경계값이 어긋납니다.
- **예상 결과**: 최소 금액 미만의 데이터가 결과에 포함됨.

## site047-bug04
- **type**: inconsistent-debit-credit-flag
- **API endpoint**: `GET /api/transactions`
- **data-bug-id**: `site047-bug04` (상세 보기 아이콘 버튼)
- **설명**: 데이터 배열의 3배수 인덱스 항목들에 대해 `type` 값을 강제로 반전(credit <-> debit)시켜 반환합니다.
- **예상 결과**: 입금 내역인데 지출 배지가 붙어있는 등의 모순 발생.
