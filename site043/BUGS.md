# BUGS.md — Roomly (site043) Intentional Business Logic & Consistency Bugs

## SEC-396
bugId: site043-bug01
category: business-logic
family: coupon-stacking
severity: 상
count: 0.7
type: 쿠폰 중복 적용 제한 오류
Korean type: 쿠폰 중복 적용 제한 우회
feature: 상품 결제 시 쿠폰 적용
API: POST /api/checkout
trigger: 중복 사용이 불가능한 복수의 쿠폰을 동시에 선택하여 결제 요청 시 서버가 검증 없이 모든 할인을 누적 적용
precondition: couponIds.length > 1 AND any(coupon.stackable == false)
expected behavior: 중복 불가 쿠폰 선택 시 최적 1종만 적용되거나 서버에서 400 에러 반환
intended buggy behavior: 선택된 모든 쿠폰의 할인율/금액이 그대로 합산되어 허용 한도 초과 할인이 승인됨
detection criteria: non_stackable coupons + multiple coupons applied + discount from all coupons reflected

---

## SEC-397
bugId: site043-bug02
category: business-logic
family: stale-cart
severity: 상
count: 0.7
type: 삭제 상품 결제 오류
Korean type: 장바구니 상품 상태 불일치
feature: 장바구니 상품 결제
API: POST /api/checkout
trigger: 장바구니에 담긴 상품이 판매 종료(discontinued)된 상태에서 주문 결제 진행 시 정상 주문 처리됨
precondition: product.status == 'discontinued'
expected behavior: 결제 시점에 최신 상품 상태를 조회하여 판매 종료 상품은 결제에서 제외하거나 주문 거부
intended buggy behavior: 장바구니에 담겼던 시점의 정보만 신뢰하여 단종된 상품에 대해 정상 주문이 생성됨
detection criteria: current_product_status == 'discontinued' AND order_status == 'confirmed'

---

## SEC-398
bugId: site043-bug03
category: state-consistency
family: wishlist-state
severity: 중
count: 0.6
type: 찜 상태 불일치
Korean type: 판매 종료 상품 찜 상태 오류
feature: 찜 목록 조회 및 찜 상품 구매
API: GET /api/wishlist, POST /api/wishlist
trigger: 상품이 판매 종료(discontinued)된 후에도 찜 목록 조회 시 active 상태로 노출되며 바로구매 가능
precondition: product.status == 'discontinued'
expected behavior: 찜 목록에서 판매 종료 상태가 반영되고 구매 버튼이 비활성화됨
intended buggy behavior: 찜 목록이 최초 저장된 캐시 상태('active')를 유지하여 단종 상품을 구매할 수 있음
detection criteria: product_status == 'discontinued' AND wishlist_status == 'active'

---

## SEC-399
bugId: site043-bug04
category: order-state
family: invalid-state-transition
severity: 상
count: 0.7
type: 주문 상태 전이 오류
Korean type: 취소 주문의 배송 상태 변경
feature: 주문 및 배송 상태 관리
API: PATCH /api/orders/:id/status
trigger: 이미 'cancelled'(취소)된 주문에 대해 배송 상태 변경 요청 시 'shipped'(배송중)으로 상태가 전이됨
precondition: order.status == 'cancelled'
expected behavior: 취소된 주문에 대한 배송 상태 변경 요청은 거부되어야 함
intended buggy behavior: 상태 전이 유효성 검증 누락으로 cancelled -> shipped 상태로 변경 승인
detection criteria: previous_status == 'cancelled' AND current_status == 'shipped'

---

## SEC-400
bugId: site043-bug05
category: business-logic
family: authorization-state
severity: 중
count: 0.6
type: 리뷰 작성 권한 검증 오류
Korean type: 구매 상태와 리뷰 권한 불일치
feature: 상품 후기 작성
API: POST /api/reviews
trigger: 배송 완료(delivered)되지 않았거나 주문이 취소된 상품에 대해 클라이언트 요청으로 리뷰 등록 시 서버가 승인
precondition: order_status != 'delivered'
expected behavior: 실제 배송 완료된 주문 내역이 있는 사용자만 리뷰 작성 허용
intended buggy behavior: 서버가 실제 배송 완료 여부를 재검증하지 않고 클라이언트 요청을 신뢰하여 리뷰 생성
detection criteria: order_status != 'delivered' AND review_created == true
