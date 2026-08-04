# site001 - 의도된 접근제어 오류 목록 (IDOR)

본 문서에는 PPO 에이전트 학습 및 평가를 위해 의도적으로 삽입된 9개의 수평적 권한 상승(IDOR) 오류 정보를 명시합니다.

## 시스템 환경 및 규칙
* **대상 사이트**: site001 (이커머스 고객 셀프서비스 포털)
* **포트**: 9900
* **탐지 기준**: 현재 사용자(`userA`)의 세션 상태에서 다른 사용자(`userB`)의 소유인 리소스의 상세 ID를 직접 요청하여 조회(GET)했을 때, 서버가 `403 Forbidden`(혹은 권한 없음)을 응답하지 않고 데이터의 소유자(`owner`)가 `userB`인 리소스를 `200 OK` 상태 코드와 함께 그대로 반환하는 경우.
* **평가 가중치(Reward Weight)**: 각 오류별 0.1

---

## 1. site001-bug01
* **bugId**: site001-bug01
* **csvId**: SEC-001
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/orders/:orderId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `orderId`를 조회 요청
* **코드상 원인**: 해당 API 핸들러에서 요청된 주문(order)의 `owner` 필드값과 현재 로그인한 세션 유저의 ID를 비교 검증하는 단계가 누락됨.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 주문 상세 내역을 HTTP `200`으로 획득하면 취약점으로 판단.

## 2. site001-bug02
* **bugId**: site001-bug02
* **csvId**: SEC-002
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/profiles/:profileId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `profileId`를 조회 요청
* **코드상 원인**: 요청된 프로필의 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 프로필 상세 내역을 HTTP `200`으로 획득하면 취약점으로 판단.

## 3. site001-bug03
* **bugId**: site001-bug03
* **csvId**: SEC-003
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/reports/:reportId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `reportId`를 조회 요청
* **코드상 원인**: 요청된 구매 리포트의 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 리포트 상세 내역을 HTTP `200`으로 획득하면 취약점으로 판단.

## 4. site001-bug04
* **bugId**: site001-bug04
* **csvId**: SEC-004
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/invoices/:invoiceId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `invoiceId`를 조회 요청
* **코드상 원인**: 요청된 청구서(invoice) 메타데이터 조회 시 `owner`와 세션 유저 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 청구서 정보를 HTTP `200`으로 획득하면 취약점으로 판단.

## 5. site001-bug05
* **bugId**: site001-bug05
* **csvId**: SEC-005
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/files/:fileId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `fileId`를 조회 요청
* **코드상 원인**: 요청된 파일 메타데이터의 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 파일 메타데이터를 HTTP `200`으로 획득하면 취약점으로 판단.

## 6. site001-bug06
* **bugId**: site001-bug06
* **csvId**: SEC-006
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/messages/:messageId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `messageId`를 조회 요청
* **코드상 원인**: 요청된 메시지의 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 메시지 본문을 HTTP `200`으로 획득하면 취약점으로 판단.

## 7. site001-bug07
* **bugId**: site001-bug07
* **csvId**: SEC-007
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/appointments/:appointmentId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `appointmentId`를 조회 요청
* **코드상 원인**: 요청된 상담 예약 상세 데이터의 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 상담 예약 정보를 HTTP `200`으로 획득하면 취약점으로 판단.

## 8. site001-bug08
* **bugId**: site001-bug08
* **csvId**: SEC-008
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/carts/:cartId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `cartId`를 조회 요청
* **코드상 원인**: 요청된 장바구니 상세 정보의 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 장바구니 목록을 HTTP `200`으로 획득하면 취약점으로 판단.

## 9. site001-bug09
* **bugId**: site001-bug09
* **csvId**: SEC-009
* **유형**: IDOR (수평적 권한 상승)
* **발생 API**: `GET /api/checkouts/:checkoutId`
* **발생 조건**: `userA` 로그인 상태에서 `userB` 소유의 `checkoutId`를 조회 요청
* **코드상 원인**: 요청된 체크아웃 상태 데이터의 `owner`와 세션 유저의 비교 검증 누락.
* **기대되는 탐지 행동**: `role`이 `userA`일 때 해당 API를 통해 `response_owner`가 `userB`인 체크아웃 진척 정보를 HTTP `200`으로 획득하면 취약점으로 판단.
